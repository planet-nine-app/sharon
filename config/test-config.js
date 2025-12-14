/**
 * Sharon Test Configuration
 *
 * Configuration for running tests against various allyabase routing configurations:
 * - nginx-routed (http://localhost:8080/fount/...)
 * - direct ports (http://127.0.0.1:5114/...)
 * - wiki proxy (http://127.0.0.1:5124/plugin/allyabase/fount/...)
 */

// Environment-based configuration
const ENVIRONMENT = process.env.NODE_ENV || 'test';
const USE_DIRECT_PORTS = process.env.USE_DIRECT_PORTS === 'true' || ENVIRONMENT === 'local';
const USE_WIKI_PROXY = process.env.USE_WIKI_PROXY === 'true';
const TEST_BASE_NUMBER = parseInt(process.env.TEST_BASE_NUMBER || '1', 10);
const BASE_URL = process.env.ALLYABASE_BASE_URL || 'http://localhost:8080';

// Wiki proxy base URLs for each test base (ports 5124, 5224, 5324)
const WIKI_BASE_URLS = {
  1: 'http://127.0.0.1:5124',
  2: 'http://127.0.0.1:5224',
  3: 'http://127.0.0.1:5324'
};

// Direct port bases for each test base (offset by 100)
const PORT_OFFSETS = {
  1: 5100,
  2: 5200,
  3: 5300
};

// Service port offsets from base (e.g., bdo = 14, so base1 bdo = 5114)
const SERVICE_PORT_OFFSETS = {
  julia: 11,
  continuebee: 12,
  pref: 13,
  bdo: 14,
  joan: 15,
  addie: 16,
  fount: 17,
  dolores: 18,
  minnie: 19,
  aretha: 20,
  sanora: 21,
  covenant: 22,
  wiki: 24,
  glyphenge: 25,
  linkitylink: 25
};

// Service configuration based on nginx path-based routing
export const serviceConfig = {
  // Core protocol services
  fount: {
    name: 'Fount',
    url: `${BASE_URL}/fount`,
    directPort: 3006,
    description: 'MAGIC protocol & nineum management'
  },

  // P2P and communication services
  julia: {
    name: 'Julia',
    url: `${BASE_URL}/julia`,
    directPort: 3000,
    description: 'P2P messaging & key coordination'
  },

  // Storage and data services
  bdo: {
    name: 'BDO',
    url: `${BASE_URL}/bdo`,
    directPort: 3003,
    description: 'Big Dumb Object storage'
  },

  // Application services
  sanora: {
    name: 'Sanora',
    url: `${BASE_URL}/sanora`,
    directPort: 7243,
    description: 'Product hosting & marketplace'
  },

  dolores: {
    name: 'Dolores',
    url: `${BASE_URL}/dolores`,
    directPort: 3007,
    description: 'Social feeds & media'
  },

  // Business services
  addie: {
    name: 'Addie',
    url: `${BASE_URL}/addie`,
    directPort: 3005,
    description: 'Payment processing'
  },

  covenant: {
    name: 'Covenant',
    url: `${BASE_URL}/covenant`,
    directPort: 3011,
    description: 'Multi-party contracts'
  },

  // Support services
  pref: {
    name: 'Pref',
    url: `${BASE_URL}/pref`,
    directPort: 3002,
    description: 'Preferences storage'
  },

  continuebee: {
    name: 'ContinueBee',
    url: `${BASE_URL}/continuebee`,
    directPort: 2999,
    description: 'State verification'
  },

  joan: {
    name: 'Joan',
    url: `${BASE_URL}/joan`,
    directPort: 3004,
    description: 'Account recovery'
  },

  minnie: {
    name: 'Minnie',
    url: `${BASE_URL}/minnie`,
    directPort: 2525,
    description: 'Email handling'
  },

  aretha: {
    name: 'Aretha',
    url: `${BASE_URL}/aretha`,
    directPort: 7277,
    description: 'Limited-run products'
  },

  prof: {
    name: 'Prof',
    url: `${BASE_URL}/prof`,
    directPort: 3008,
    description: 'Profile management'
  }
};

// Service discovery and system endpoints
export const systemEndpoints = {
  serviceDiscovery: `${BASE_URL}/services`,
  healthCheck: `${BASE_URL}/health`,
  networkInfo: `${BASE_URL}/network`,
  baseInfo: `${BASE_URL}/`
};

// Test configuration
export const testConfig = {
  environment: ENVIRONMENT,
  baseUrl: BASE_URL,
  useNginxRouting: true,
  timeout: 30000, // 30 second timeout for integration tests
  maxRetries: 3,
  retryDelay: 5000 // 5 second delay between retries
};

// Mock user configuration for testing
export const mockUsers = {
  testUser: {
    uuid: 'test-user-uuid',
    pubKey: 'test-pub-key-123',
    privKey: 'test-priv-key-123',
    mp: 1000,
    nineum: [
      {
        galaxy: '01',
        system: '28880014',
        flavor: '010101020301',
        year: '24',
        ordinal: '00000001'
      }
    ]
  },

  brokeUser: {
    uuid: 'broke-user-uuid',
    pubKey: 'broke-pub-key-123',
    privKey: 'broke-priv-key-123',
    mp: 10, // Insufficient MP
    nineum: [] // No nineum permissions
  }
};

// Utility functions
export function getServiceUrl(serviceName) {
  const service = serviceConfig[serviceName];
  if (!service) {
    throw new Error(`Unknown service: ${serviceName}`);
  }

  // Wiki proxy mode: route through wiki plugin
  if (USE_WIKI_PROXY) {
    const wikiBaseUrl = WIKI_BASE_URLS[TEST_BASE_NUMBER];
    return `${wikiBaseUrl}/plugin/allyabase/${serviceName}`;
  }

  // Use direct ports for local/single-base deployment
  if (USE_DIRECT_PORTS) {
    const portBase = PORT_OFFSETS[TEST_BASE_NUMBER];
    const portOffset = SERVICE_PORT_OFFSETS[serviceName];
    if (portOffset !== undefined) {
      return `http://127.0.0.1:${portBase + portOffset}`;
    }
    return `http://localhost:${service.directPort}`;
  }

  return service.url;
}

export function getDirectPortUrl(serviceName, baseNumber = TEST_BASE_NUMBER) {
  const portBase = PORT_OFFSETS[baseNumber];
  const portOffset = SERVICE_PORT_OFFSETS[serviceName];
  if (portOffset !== undefined) {
    return `http://127.0.0.1:${portBase + portOffset}`;
  }
  const service = serviceConfig[serviceName];
  if (!service) {
    throw new Error(`Unknown service: ${serviceName}`);
  }
  return `http://localhost:${service.directPort}`;
}

export function getWikiProxyUrl(serviceName, baseNumber = TEST_BASE_NUMBER) {
  const wikiBaseUrl = WIKI_BASE_URLS[baseNumber];
  return `${wikiBaseUrl}/plugin/allyabase/${serviceName}`;
}

export function getWikiBaseUrl(baseNumber = TEST_BASE_NUMBER) {
  return WIKI_BASE_URLS[baseNumber];
}

export default {
  serviceConfig,
  systemEndpoints,
  testConfig,
  mockUsers,
  getServiceUrl,
  getDirectPortUrl,
  getWikiProxyUrl,
  getWikiBaseUrl,
  WIKI_BASE_URLS,
  PORT_OFFSETS,
  SERVICE_PORT_OFFSETS,
  TEST_BASE_NUMBER,
  USE_WIKI_PROXY
};