#!/usr/bin/env node

/**
 * Update Test URLs for Nginx Routing
 *
 * Updates all copied test files to use nginx-based routing instead of direct port access
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Service port mappings for nginx routing
const servicePortMap = {
  '3000': 'continuebee',   // continuebee
  '3001': 'pref',          // pref
  '3002': 'fount',         // fount
  '3003': 'bdo',           // bdo
  '3004': 'joan',          // joan
  '3005': 'addie',         // addie
  '3006': 'fount',         // julia port used by fount tests (actually fount service)
  '3007': 'dolores',       // dolores
  '3008': 'prof',          // prof
  '3009': 'minnie',        // minnie
  '3010': 'aretha',        // aretha
  '7243': 'sanora',        // sanora
  '7277': 'sanora'         // sanora admin
};

// Function to update URLs in a file
function updateFileUrls(filePath) {
  console.log(`📝 Processing: ${filePath}`);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace direct localhost port URLs with nginx routing
    for (const [port, serviceName] of Object.entries(servicePortMap)) {
      const oldUrl = new RegExp(`http://localhost:${port}/?`, 'g');
      const newUrl = `http://nginx:80/${serviceName}/`;

      if (content.match(oldUrl)) {
        content = content.replace(oldUrl, newUrl);
        modified = true;
        console.log(`  ✅ Updated port ${port} -> ${serviceName}`);
      }
    }

    // Also handle process.env.ALLYABASE_BASE_URL fallback
    if (content.includes('process.env.ALLYABASE_BASE_URL')) {
      console.log(`  ℹ️  File already uses ALLYABASE_BASE_URL`);
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  💾 File updated`);
      return true;
    } else {
      console.log(`  ⏭️  No changes needed`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

// Function to recursively find and update test files
function updateTestFiles(directory) {
  const files = fs.readdirSync(directory);
  let totalUpdated = 0;

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (file !== 'node_modules' && !file.startsWith('.')) {
        totalUpdated += updateTestFiles(fullPath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.test.js')) {
      if (updateFileUrls(fullPath)) {
        totalUpdated++;
      }
    }
  }

  return totalUpdated;
}

// Main execution
async function main() {
  console.log('🚀 Updating test URLs for nginx routing...\n');

  const testsDir = path.join(__dirname, 'tests');

  if (!fs.existsSync(testsDir)) {
    console.error('❌ Tests directory not found');
    process.exit(1);
  }

  const updated = updateTestFiles(testsDir);

  console.log(`\n📊 Update Summary:`);
  console.log(`   Files updated: ${updated}`);
  console.log(`   ✅ All test URLs updated for nginx routing!`);
  console.log(`\n💡 Tests now use: http://nginx:80/{service}/ instead of http://localhost:{port}/`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default { updateFileUrls, updateTestFiles };