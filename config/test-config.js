/**
 * Sharon Test Configuration
 *
 * Configuration for running tests against nginx-routed allyabase instances
 */

// Environment-based configuration
const ENVIRONMENT = process.env.NODE_ENV || 'test';
const USE_DIRECT_PORTS = process.env.USE_DIRECT_PORTS === 'true' || ENVIRONMENT === 'local';
const BASE_URL = process.env.ALLYABASE_BASE_URL || 'http://localhost:8080';

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
  // Use direct ports for local/single-base deployment
  if (USE_DIRECT_PORTS) {
    return `http://localhost:${service.directPort}`;
  }
  return service.url;
}

export function getDirectPortUrl(serviceName) {
  const service = serviceConfig[serviceName];
  if (!service) {
    throw new Error(`Unknown service: ${serviceName}`);
  }
  return `http://localhost:${service.directPort}`;
}

export default {
  serviceConfig,
  systemEndpoints,
  testConfig,
  mockUsers,
  getServiceUrl,
  getDirectPortUrl
};