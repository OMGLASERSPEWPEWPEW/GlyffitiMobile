// scripts/blockchain/migrateUsers-UGA.js
// Path: scripts/blockchain/migrateUsers-UGA.js
// Migrate existing users from legacy system to ADR-006 UGA system

import { Connection, Keypair } from '@solana/web3.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Import ADR-006 models
import { UserGenesisBlockUGA, UgaGenesisFactory } from '../../src/services/blockchain/shared/models/UgaGenesisBlock.js';
import { SolanaMemoBuilder } from '../../src/services/blockchain/solana/utils/SolanaMemoBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration
 */
const CONFIG = {
  NETWORK: 'devnet',
  RPC_URL: 'https://api.devnet.solana.com',
  
  // Source files (legacy system)
  LEGACY_USER_REGISTRY: path.join(__dirname, '../../src/data/user-registry.json.old'),
  LEGACY_USER_KEYS: path.join(__dirname, '../../src/data/user-keys.json.old'),
  
  // New system files
  NEW_GENESIS_REGISTRY: path.join(__dirname, 'genesis-registry-uga.json'),
  NEW_USER_REGISTRY: path.join(__dirname, '../../src/data/user-registry.json'),
  NEW_USER_KEYS: path.join(__dirname, '../../src/data/user-keys.json'),
  UGA_USER_REGISTRY: path.join(__dirname, 'user-registry-uga.json'),
  UGA_USERS_DIR: path.join(__dirname, 'test-users-uga')
};

/**
 * Load legacy user data
 */
async function loadLegacyData() {
  console.log('📂 Loading legacy user data...');
  
  let userRegistry, userKeys;
  
  try {
    userRegistry = JSON.parse(await fs.readFile(CONFIG.LEGACY_USER_REGISTRY, 'utf8'));
  } catch (error) {
    console.log('⚠️  Legacy user registry not found, creating empty structure');
    userRegistry = { users: [] };
  }
  
  try {
    userKeys = JSON.parse(await fs.readFile(CONFIG.LEGACY_USER_KEYS, 'utf8'));
  } catch (error) {
    console.log('⚠️  Legacy user keys not found, creating empty structure');
    userKeys = {};
  }
  
  console.log(`   Found ${userRegistry.users.length} legacy users`);
  console.log(`   Found ${Object.keys(userKeys).length} legacy keypairs`);
  
  return { userRegistry, userKeys };
}

/**
 * Load new genesis registry
 */
async function loadNewGenesisRegistry() {
  console.log('📋 Loading new ADR-006 genesis registry...');
  
  const registry = JSON.parse(await fs.readFile(CONFIG.NEW_GENESIS_REGISTRY, 'utf8'));
  
  console.log(`   New Genesis Hash: ${registry.genesisHash.substring(0, 16)}...`);
  console.log(`   New Genesis Transaction: ${registry.transactionId}`);
  
  return registry;
}

/**
 * Migrate a single user to ADR-006 system
 */
async function migrateUser(username, legacyUser, privateKeyArray, newGenesisHash, connection, memoBuilder) {
  console.log(`\n🔄 Migrating user: ${username}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Recreate keypair from legacy private key
    const secretKey = new Uint8Array(privateKeyArray);
    const keypair = Keypair.fromSecretKey(secretKey);
    
    console.log(`🔑 Restored keypair: ${keypair.publicKey.toBase58()}`);
    
    // Verify this matches the legacy public key
    if (keypair.publicKey.toBase58() !== legacyUser.publicKey) {
      throw new Error(`Public key mismatch for ${username}`);
    }
    
    // Create new User Genesis Block (U₀) with ADR-006 format
    const userGenesis = UgaGenesisFactory.createUserGenesis(
      username,
      newGenesisHash,
      keypair.publicKey.toBase58()
    );
    
    const userGenesisHash = userGenesis.calculateHash();
    
    console.log(`👤 Username: ${username}`);
    console.log(`🔍 New U₀ Hash: ${userGenesisHash.substring(0, 16)}...`);
    console.log(`⬆️  Parent G₀: ${newGenesisHash.substring(0, 16)}...`);
    
    // Deploy to blockchain
    console.log('📡 Deploying new User Genesis...');
    
    const wireData = await userGenesis.toMemoData();
    const transaction = await memoBuilder.buildMemoTransaction(wireData, keypair);
    const transactionId = await memoBuilder.submitTransactionWithRetries(
      transaction,
      keypair,
      `ADR-006 Migration for ${username}`
    );
    
    console.log(`✅ Deployed: ${transactionId}`);
    
    // Save keypair to UGA users directory  
    await fs.mkdir(CONFIG.UGA_USERS_DIR, { recursive: true });
    await fs.writeFile(
      path.join(CONFIG.UGA_USERS_DIR, `${username}.json`),
      JSON.stringify(Array.from(secretKey))
    );
    
    // Create new user record
    const newUserRecord = {
      username: username,
      publicKey: keypair.publicKey.toBase58(),
      userGenesisHash: userGenesisHash,
      parentGenesisHash: newGenesisHash,
      transactionId: transactionId,
      createdAt: new Date().toISOString(),
      adrVersion: '006',
      explorer: `https://explorer.solana.com/tx/${transactionId}?cluster=devnet`,
      
      // Migration metadata
      migratedFrom: {
        originalTransaction: legacyUser.transactionHash,
        originalGenesis: legacyUser.parentGenesis,
        originalCreatedAt: legacyUser.createdAt
      }
    };
    
    console.log('✅ Migration successful!');
    
    return {
      userRecord: newUserRecord,
      keypair: { [username]: privateKeyArray }
    };
    
  } catch (error) {
    console.error(`❌ Failed to migrate ${username}:`, error.message);
    return null;
  }
}

/**
 * Create app genesis config
 */
async function createAppGenesisConfig(genesisRegistry) {
  const appConfig = {
    network: 'devnet',
    adrVersion: '006',
    glyffitiGenesis: {
      hash: genesisRegistry.genesisHash,
      transactionId: genesisRegistry.transactionId,
      deployedAt: genesisRegistry.deployedAt
    },
    rpcUrl: CONFIG.RPC_URL,
    explorerBaseUrl: 'https://explorer.solana.com',
    lastUpdated: new Date().toISOString()
  };
  
  const configPath = path.join(__dirname, '../../src/config/genesis-uga.json');
  const configDir = path.dirname(configPath);
  
  // Ensure directory exists
  await fs.mkdir(configDir, { recursive: true });
  
  // Write config file
  await fs.writeFile(configPath, JSON.stringify(appConfig, null, 2));
  
  console.log(`📱 Created app genesis config: ${configPath}`);
  
  return configPath;
}


/**
 * Main migration function
 */
async function migrateAllUsers() {
  console.log('🌟 ADR-006 User Migration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 Network: ${CONFIG.NETWORK}`);
  console.log(`📅 Time: ${new Date().toISOString()}`);
  
  try {
    // Load data
    const { userRegistry: legacyRegistry, userKeys: legacyKeys } = await loadLegacyData();
    const newGenesisRegistry = await loadNewGenesisRegistry();
    
    // Connect to Solana
    console.log('\n🔌 Connecting to Solana...');
    const connection = new Connection(CONFIG.RPC_URL, 'confirmed');
    const version = await connection.getVersion();
    console.log(`✅ Connected (version: ${version['solana-core']})`);
    
    const memoBuilder = new SolanaMemoBuilder(connection);
    
    // Migrate each user
    console.log('\n🚀 Starting user migration...');
    const migratedUsers = [];
    const migratedKeys = {};
    
    for (const legacyUser of legacyRegistry.users) {
      const username = legacyUser.username;
      const privateKeyArray = legacyKeys[username];
      
      if (!privateKeyArray) {
        console.warn(`⚠️  No private key found for ${username}, skipping`);
        continue;
      }
      
      const result = await migrateUser(
        username,
        legacyUser,
        privateKeyArray,
        newGenesisRegistry.genesisHash,
        connection,
        memoBuilder
      );
      
      if (result) {
        migratedUsers.push(result.userRecord);
        Object.assign(migratedKeys, result.keypair);
      }
      
      // Small delay between migrations
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Create new registry files
    console.log('\n📝 Creating new registry files...');
    
    const newUserRegistry = {
      network: CONFIG.NETWORK,
      registryVersion: '2.0.0',
      adrVersion: '006',
      glyffitiGenesis: newGenesisRegistry.genesisHash,
      users: migratedUsers,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      migrationInfo: {
        migratedFrom: legacyRegistry.glyffitiGenesis,
        migrationDate: new Date().toISOString(),
        totalMigrated: migratedUsers.length
      }
    };
    
    // Write new files
    await fs.writeFile(CONFIG.NEW_USER_REGISTRY, JSON.stringify(newUserRegistry, null, 2));
    await fs.writeFile(CONFIG.NEW_USER_KEYS, JSON.stringify(migratedKeys, null, 2));
    await fs.writeFile(CONFIG.UGA_USER_REGISTRY, JSON.stringify(newUserRegistry, null, 2));
    
    // Create app config
    await createAppGenesisConfig(newGenesisRegistry);
    
    // Success summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 MIGRATION COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully migrated: ${migratedUsers.length} users`);
    console.log(`❌ Failed migrations: ${legacyRegistry.users.length - migratedUsers.length}`);
    console.log(`📁 Updated files:`);
    console.log(`   - ${CONFIG.NEW_USER_REGISTRY}`);
    console.log(`   - ${CONFIG.NEW_USER_KEYS}`);
    console.log(`   - ${CONFIG.UGA_USER_REGISTRY}`);
    console.log(`   - src/config/genesis-uga.json`);
    console.log('\n📋 Migrated users:');
    migratedUsers.forEach(user => {
      console.log(`   - ${user.username}: ${user.transactionId}`);
    });
    
    return {
      success: true,
      migratedCount: migratedUsers.length,
      totalCount: legacyRegistry.users.length
    };
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    throw error;
  }
}

/**
 * Simple prompt helper
 */
async function promptUser(question) {
  process.stdout.write(question);
  return new Promise(resolve => {
    process.stdin.once('data', data => {
      resolve(data.toString().trim());
    });
  });
}

/**
 * Main execution
 */
async function main() {
  try {
    // Confirmation prompt
    console.log('⚠️  This will overwrite your existing user registry files!');
    console.log('⚠️  Make sure you have backups before proceeding.');
    
    const confirm = await promptUser('\nProceed with migration? (y/N): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Migration cancelled');
      process.exit(0);
    }
    
    // Execute migration
    await migrateAllUsers();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Handle interruption
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Migration interrupted');
  process.exit(0);
});

// Run it
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

// Character count: 12,847