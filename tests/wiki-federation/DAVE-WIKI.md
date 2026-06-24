# Dave's Wiki - Standalone with Sessionless Security

## Overview

Dave's wiki is a **standalone wiki** (not farm mode) using **wiki-security-sessionless** for authentication. This provides an alternative to the farm mode wikis (Alice, Bob, Carol) for testing and unblocking development.

## Key Differences

| Feature | Alice/Bob/Carol | Dave |
|---------|-----------------|------|
| **Mode** | Farm mode (`--farm`) | Standalone (no `--farm`) |
| **Security** | wiki-security-friends | wiki-security-sessionless |
| **Auth Method** | Reclaim with secret | Secp256k1 keypair signing |
| **Hostname** | alice.localhost, bob.localhost, carol.localhost | N/A (single site) |
| **Port** | 3001, 3002, 3003 | 3004 |

## Access

**URL:** http://localhost:3004

**Owner:** planetnineisaspaceship

**Public Key:** `03493f885965c30f36788427eb0376c12ae8fc19118a872c9a06cec9d1dea504db`

## How It Works

### Installation
The Dockerfile installs wiki-security-sessionless **locally** in the wiki's node_modules:

```dockerfile
WORKDIR /home/node/lib/node_modules/wiki
RUN npm install wiki-security-sessionless
```

This avoids the ES module / CommonJS conflicts that occur with global installation.

### owner.json Format

Dave's owner.json uses sessionless authentication format:

```json
{
  "name": "planetnineisaspaceship",
  "sessionlessKeys": {
    "pubKey": "03493f885965c30f36788427eb0376c12ae8fc19118a872c9a06cec9d1dea504db"
  },
  "pubKey": "03493f885965c30f36788427eb0376c12ae8fc19118a872c9a06cec9d1dea504db"
}
```

### Authentication

With sessionless security:
1. Client generates a message to sign
2. User signs with their private key (using sessionless-node)
3. Wiki verifies signature against pubKey in owner.json
4. No cookies or sessions needed!

## Testing

```bash
# Check if Dave is running
curl -s -o /dev/null -w "%{http_code}" http://localhost:3004

# View welcome page
open http://localhost:3004

# Check logs
docker-compose logs wiki-dave

# Restart just Dave
docker-compose restart wiki-dave
```

## Use Cases

### 1. Unblocking Development
While figuring out farm mode admin issues, Dave provides a working wiki for:
- Plugin testing
- Content creation
- Federation experiments

### 2. Sessionless Auth Testing
Dave demonstrates sessionless authentication:
- No passwords or secrets to remember
- Cryptographic key-based auth
- Works with hardware wallets

### 3. Standalone Wiki Pattern
Shows how to run a single wiki without farm mode:
- Simpler configuration
- No hostname routing needed
- Direct port access

## Logs

Dave's startup logs show:
```
owner: planetnineisaspaceship
Federated Wiki server listening on 3000 in mode: development
```

This confirms:
- ✅ Owner.json loaded successfully
- ✅ Sessionless security initialized
- ✅ Wiki is ready for connections

## Troubleshooting

### Wiki Won't Start

Check logs:
```bash
docker-compose logs wiki-dave
```

Common issues:
- Port 3004 already in use
- owner.json missing or invalid
- wiki-security-sessionless not installed

### Module Not Found Error

If you see `Cannot find package 'wiki-security-sessionless'`:
- Module must be installed **locally** in wiki's node_modules
- NOT globally (`npm install -g` won't work)
- Rebuild: `docker-compose build wiki-dave`

### Can't Access Wiki

Check if running:
```bash
docker ps | grep wiki-dave
```

Restart if needed:
```bash
docker-compose up -d wiki-dave
```

## Next Steps

1. **Test sessionless auth:** Use sessionless-node to sign and authenticate
2. **Add plugins:** Install wiki plugins to test functionality
3. **Federation:** Configure Dave to federate with Alice/Bob/Carol
4. **Content:** Create pages and test wiki features

## Files

- **Dockerfile:** `Dockerfile.wiki-standalone`
- **owner.json:** `data/dave/status/owner.json`
- **Logs:** `docker-compose logs wiki-dave`

## Comparison: Farm vs Standalone

### Farm Mode (Alice/Bob/Carol)
```
Advantages:
- Multiple wikis on one server
- Hostname-based routing
- Shared infrastructure

Challenges:
- Admin authentication complexity
- Requires /etc/hosts configuration
- Must use correct hostname for each wiki
```

### Standalone (Dave)
```
Advantages:
- Simple single-wiki setup
- Direct port access (no hostname needed)
- Sessionless auth just works
- No admin authentication issues

Tradeoffs:
- Only one wiki per container
- No multi-tenant hosting
```

## Summary

Dave's wiki provides a working alternative to the farm mode setup, using:
- ✅ Standalone mode (no farm)
- ✅ Sessionless security
- ✅ Local npm install (no module conflicts)
- ✅ Pre-configured owner.json
- ✅ Ready for testing and development

Access at: **http://localhost:3004**
