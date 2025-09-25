import user from '../user/user.js';
import sessionless from 'sessionless-node';
import spellbook from '../../../spellbooks/spellbook.js';

// Check if user has sufficient MP and required nineum permissions for spell
const checkMPAndNineumPermissions = async (casterUUID, spellName, totalCost) => {
  try {
    const caster = await user.getUser(casterUUID);

    // 1. Check MP (Magic Power) - the regenerating resource
    console.log(`⚡ Checking MP: user has ${caster.mp}, spell costs ${totalCost}`);

    if (caster.mp < totalCost) {
      return {
        success: false,
        error: 'Insufficient MP',
        available: caster.mp,
        required: totalCost,
        type: 'mp'
      };
    }

    // 2. Check Nineum permissions - the permissionable asset
    const spell = spellbook[spellName];
    if (spell?.requiredNineum) {
      console.log(`💎 Checking nineum permissions for ${spellName}:`, spell.requiredNineum);

      const hasPermission = await checkNineumPermission(caster, spell.requiredNineum);
      if (!hasPermission.success) {
        return {
          success: false,
          error: 'Missing required nineum permission',
          required: spell.requiredNineum,
          type: 'nineum',
          details: hasPermission.details
        };
      }
    }

    return { success: true };
  } catch(err) {
    return { success: false, error: err.message };
  }
};

// Check if user has nineum with the required galaxy+system+flavor
const checkNineumPermission = async (caster, requiredNineum) => {
  try {
    const { galaxy, system, flavor } = requiredNineum;

    // Get user's nineum collection
    const userNineum = caster.nineum || [];

    console.log(`🔍 Looking for nineum with galaxy:${galaxy}, system:${system}, flavor:${flavor}`);
    console.log(`👤 User has ${userNineum.length} nineum pieces`);

    // Check if user has any nineum matching the required galaxy+system+flavor
    const matchingNineum = userNineum.find(nineumId => {
      // Parse nineum structure: galaxy(2) + system(8) + flavor(12) + year(2) + ordinal(8)
      if (nineumId.length !== 32) return false;

      const nineumGalaxy = nineumId.substring(0, 2);
      const nineumSystem = nineumId.substring(2, 10);
      const nineumFlavor = nineumId.substring(10, 22);

      const matches = nineumGalaxy === galaxy &&
                     nineumSystem === system &&
                     nineumFlavor === flavor;

      if (matches) {
        console.log(`✅ Found matching nineum: ${nineumId}`);
      }

      return matches;
    });

    if (matchingNineum) {
      return { success: true, matchingNineum };
    } else {
      return {
        success: false,
        details: `No nineum found with galaxy:${galaxy}, system:${system}, flavor:${flavor}`
      };
    }

  } catch(err) {
    return { success: false, details: err.message };
  }
};

const resolve = async (req, res) => {
  try {
console.log('🪄 Fount resolving spell:', req.params.spellName);
    const spellName = req.params.spellName;
    const spell = req.body;

    // NEW: Check MP and Nineum permissions before processing creation spells
    const isCreationSpell = ['createProduct', 'createPost', 'createBDO', 'createVideo'].includes(spellName);

    if (isCreationSpell) {
      const permissionCheck = await checkMPAndNineumPermissions(spell.casterUUID, spellName, spell.totalCost);
      if (!permissionCheck.success) {
        console.log(`❌ Permission check failed (${permissionCheck.type}):`, permissionCheck.error);
        return res.status(900).send({
          success: false,
          error: permissionCheck.error,
          type: permissionCheck.type,
          required: permissionCheck.required,
          available: permissionCheck.available,
          details: permissionCheck.details
        });
      }
      console.log('✅ MP and nineum permission checks passed');
    }

    let resolved = true;

    const gatewayUsers = [];

    if(spell.gateways && spell.gateways.length > 0) {
      for(let i = 0; i < spell.gateways.length; i++) {
	const gateway = spell.gateways[i];

        if(gateway.signature.length < 5) {
          continue;
        }

	const gatewayUser = await user.getUser(gateway.uuid);
	gatewayUsers.push(gatewayUser);
	const signature = gateway.signature;

	const message = gateway.timestamp + gateway.uuid + gateway.minimumCost + gateway.ordinal;

	if(!signature || !sessionless.verifySignature(signature, message, gatewayUser.pubKey)) {
	  resolved = false;
	}
      }
    }

console.log('About to try and get caster: ', spell.casterUUID);
    const caster = await user.getUser(spell.casterUUID);
    const message = spell.timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;

    if(!sessionless.verifySignature(spell.casterSignature, message, caster.pubKey)) {
      resolved = false;
    }

    if(spell.mp) {
      if(caster.mp >= spell.totalCost) {
        resolved = await user.spendMP(caster, spell.totalCost);
      } else {
        resolved = false;
      }
    } else {
      resolved = await user.spendMoney(caster, spell, gatewayUsers);
    }

    if(resolved) {
console.log('resolved', resolved);
      const signatureMap = {};
      return res.send({
	success: true,
	signatureMap
      });
    }
    res.status(900);
    res.send({success: false});
  } catch(err) {
console.warn(err);
    res.status(900);
    res.send({success: false});
  }
};

export { resolve };

