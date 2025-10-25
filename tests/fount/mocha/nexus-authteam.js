import { should } from 'chai';
should();
import sessionless from 'sessionless-node';
import superAgent from 'superagent';

const FOUNT_URL = process.env.FOUNT_URL || (process.env.SUB_DOMAIN ? `https://${process.env.SUB_DOMAIN}.fount.allyabase.com/` : 'http://127.0.0.1:3006/');
const JULIA_URL = process.env.JULIA_URL || (process.env.SUB_DOMAIN ? `https://${process.env.SUB_DOMAIN}.julia.allyabase.com/` : 'http://127.0.0.1:3000/');

const get = async function(path) {
  console.info("Getting " + path);
  return await superAgent.get(path).set('Content-Type', 'application/json');
};

const post = async function(path, body) {
  console.info("Posting " + path);
  console.log(body);
  return await superAgent.post(path).send(body).set('Content-Type', 'application/json');
};

// Shared state
let fountUser = {};
let nexusJuliaUUID = '';
let phoneKeys = {};
let phoneKeysToReturn = {};
let phoneUUID = '';

describe('Nexus AuthTeam Flow', function() {
  this.timeout(10000);

  it('should fetch Nexus Julia UUID from /authteam page', async () => {
    // The /authteam page embeds the nexusJuliaUUID in the JavaScript
    // We can extract it from there
    const res = await superAgent
      .get(`${FOUNT_URL}authteam`)
      .set('Content-Type', 'text/html');

    const html = res.text;
    const match = html.match(/const nexusJuliaUUID = '([0-9a-f-]{36})'/);

    if (!match) {
      throw new Error('Could not find nexusJuliaUUID in /authteam page');
    }

    nexusJuliaUUID = match[1];

    console.log('Nexus Julia UUID:', nexusJuliaUUID);

    nexusJuliaUUID.should.be.a('string');
    nexusJuliaUUID.length.should.equal(36);
  });

  it('should verify Nexus Julia user exists with empty coordinating keys', async () => {
    // Create a test user in Julia to use as our phone
    phoneKeys = await sessionless.generateKeys((k) => { phoneKeysToReturn = k; }, () => {return phoneKeysToReturn;});

    const payload = {
      timestamp: new Date().getTime() + '',
      pubKey: phoneKeys.pubKey,
      user: {
        pubKey: phoneKeys.pubKey,
        keys: { interactingKeys: {}, coordinatingKeys: {} }
      }
    };

    payload.signature = await sessionless.sign(payload.timestamp + payload.pubKey);

    const res = await superAgent
      .put(`${JULIA_URL}user/create`)
      .send(payload)
      .set('Content-Type', 'application/json');

    phoneUUID = res.body.uuid;
    console.log('Phone UUID:', phoneUUID);

    phoneUUID.should.be.a('string');
    phoneUUID.length.should.equal(36);
  });

  it('should add phone as coordinating key to Nexus Julia user', async () => {
    const timestamp = new Date().getTime() + '';
    const message = timestamp + nexusJuliaUUID + phoneKeys.pubKey + phoneUUID;

    const signature = await sessionless.sign(message, phoneKeys.privateKey);

    const payload = {
      timestamp,
      pubKey: phoneKeys.pubKey,
      uuid: phoneUUID,
      signature
    };

    console.log('Coordinating key payload:', payload);

    const res = await post(`${JULIA_URL}user/${nexusJuliaUUID}/coordinate`, payload);

    console.log('Coordinate response:', res.body);

    res.body.success.should.equal(true);
    res.body.should.have.property('coordinatingKeys');

    // Verify the phone's pubKey is now in coordinating keys
    // coordinatingKeys structure is: { uuid: pubKey }
    const coordinatingKeys = Object.values(res.body.coordinatingKeys);
    const hasPhoneKey = coordinatingKeys.some(key => key === phoneKeys.pubKey);
    hasPhoneKey.should.equal(true);
  });

  it('should successfully log in to Nexus with coordinating key', async () => {
    const timestamp = new Date().getTime() + '';
    const message = timestamp + 'nexus-login';
    const signature = await sessionless.sign(message, phoneKeys.privateKey);

    const payload = {
      timestamp,
      pubKey: phoneKeys.pubKey,
      signature
    };

    console.log('Nexus login payload:', payload);

    const res = await post(`${FOUNT_URL}nexus/login`, payload);

    console.log('Nexus login response:', res.body);

    res.body.success.should.equal(true);
    res.body.message.should.equal('Logged in successfully');
    res.body.nexusUUID.should.equal(nexusJuliaUUID);
    res.body.coordinatingKeys.should.be.greaterThan(0);
  });

  it('should reject login with non-coordinating key', async () => {
    // Generate a new key that's not a coordinating key
    const randomKeys = await sessionless.generateKeys((k) => { phoneKeysToReturn = k; }, () => {return phoneKeysToReturn;});

    const timestamp = new Date().getTime() + '';
    const message = timestamp + 'nexus-login';
    const signature = await sessionless.sign(message, randomKeys.privateKey);

    const payload = {
      timestamp,
      pubKey: randomKeys.pubKey,
      signature
    };

    try {
      const res = await post(`${FOUNT_URL}nexus/login`, payload);

      // Should fail
      res.body.success.should.equal(false);
      res.body.error.should.include('Not authorized');
    } catch (err) {
      // superAgent throws on 403
      err.status.should.equal(403);
      err.response.body.success.should.equal(false);
      err.response.body.error.should.include('Not authorized');
    }
  });

  it('should reject login with invalid signature', async () => {
    const timestamp = new Date().getTime() + '';
    const message = timestamp + 'nexus-login';

    // Use a different key to sign (invalid signature)
    const wrongKeys = await sessionless.generateKeys((k) => { phoneKeysToReturn = k; }, () => {return phoneKeysToReturn;});
    const signature = await sessionless.sign(message, wrongKeys.privateKey);

    const payload = {
      timestamp,
      pubKey: phoneKeys.pubKey,  // Right pubKey
      signature                   // Wrong signature
    };

    try {
      const res = await post(`${FOUNT_URL}nexus/login`, payload);

      // Should fail
      res.body.success.should.equal(false);
      res.body.error.should.include('Invalid signature');
    } catch (err) {
      // superAgent throws on 403
      err.status.should.equal(403);
      err.response.body.success.should.equal(false);
      err.response.body.error.should.include('Invalid signature');
    }
  });

  it('should reject coordinate with invalid signature', async () => {
    const timestamp = new Date().getTime() + '';
    const message = timestamp + nexusJuliaUUID + phoneKeys.pubKey + phoneUUID;

    // Use a different key to sign
    const wrongKeys = await sessionless.generateKeys((k) => { phoneKeysToReturn = k; }, () => {return phoneKeysToReturn;});
    const signature = await sessionless.sign(message, wrongKeys.privateKey);

    const payload = {
      timestamp,
      pubKey: phoneKeys.pubKey,
      uuid: phoneUUID,
      signature
    };

    try {
      const res = await post(`${JULIA_URL}user/${nexusJuliaUUID}/coordinate`, payload);

      // Should fail
      res.status.should.not.equal(200);
    } catch (err) {
      // superAgent throws on 403
      err.status.should.equal(403);
      err.response.body.error.should.equal('auth error');
    }
  });

  it('should reject Nexus login with missing fields', async () => {
    const payload = {
      timestamp: new Date().getTime() + ''
      // Missing pubKey and signature
    };

    try {
      const res = await post(`${FOUNT_URL}nexus/login`, payload);

      // Should fail
      res.body.success.should.equal(false);
      res.body.error.should.include('Missing required fields');
    } catch (err) {
      // superAgent throws on 400
      err.status.should.equal(400);
      err.response.body.success.should.equal(false);
      err.response.body.error.should.include('Missing required fields');
    }
  });

  it('should handle multiple coordinating keys', async () => {
    // Create a second phone
    const phone2Keys = await sessionless.generateKeys((k) => { phoneKeysToReturn = k; }, () => {return phoneKeysToReturn;});

    const createPayload = {
      timestamp: new Date().getTime() + '',
      pubKey: phone2Keys.pubKey,
      user: {
        pubKey: phone2Keys.pubKey,
        keys: { interactingKeys: {}, coordinatingKeys: {} }
      }
    };

    createPayload.signature = await sessionless.sign(createPayload.timestamp + createPayload.pubKey);

    const createRes = await superAgent
      .put(`${JULIA_URL}user/create`)
      .send(createPayload)
      .set('Content-Type', 'application/json');

    const phone2UUID = createRes.body.uuid;

    // Add second phone as coordinating key
    const timestamp = new Date().getTime() + '';
    const message = timestamp + nexusJuliaUUID + phone2Keys.pubKey + phone2UUID;
    const signature = await sessionless.sign(message, phone2Keys.privateKey);

    const coordinatePayload = {
      timestamp,
      pubKey: phone2Keys.pubKey,
      uuid: phone2UUID,
      signature
    };

    const coordinateRes = await post(`${JULIA_URL}user/${nexusJuliaUUID}/coordinate`, coordinatePayload);

    coordinateRes.body.success.should.equal(true);

    // Verify we now have 2 coordinating keys
    const coordinatingKeys = Object.values(coordinateRes.body.coordinatingKeys);
    coordinatingKeys.length.should.be.greaterThan(1);

    // Verify both phones can log in
    const loginTimestamp = new Date().getTime() + '';
    const loginMessage = loginTimestamp + 'nexus-login';
    const loginSignature = await sessionless.sign(loginMessage, phone2Keys.privateKey);

    const loginPayload = {
      timestamp: loginTimestamp,
      pubKey: phone2Keys.pubKey,
      signature: loginSignature
    };

    const loginRes = await post(`${FOUNT_URL}nexus/login`, loginPayload);

    loginRes.body.success.should.equal(true);
    loginRes.body.coordinatingKeys.should.be.greaterThan(1);
  });
});
