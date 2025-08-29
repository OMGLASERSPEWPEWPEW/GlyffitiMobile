// scripts/blockchain/createTestUser-UGA.js
// Path: scripts/blockchain/createTestUser-UGA.js
// ADR-006 Enhanced Test User Creation Script
// 
// Creates test user accounts with proper User Genesis (U₀) blocks that link back
// to the deployed ADR-006 Glyffiti Genesis Block and support UGA publishing.
// 
// Usage:
//   node scripts/blockchain/createTestUser-UGA.js --username alice
//   node scripts/blockchain/createTestUser-UGA.js --username bob --count 5
//   node scripts/blockchain/createTestUser-UGA.js --batch  # Creates multiple test users
//   node scripts/blockchain/createTestUser-UGA.js --test-uga alice  # Test UGA publishing for user

import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bs58 from 'bs58';

// Import UGA services
import { GlyffitiGenesisServiceUGA } from '../../src/services/genesis/GlyffitiGenesisService-UGA.js';
import { UserGenesisServiceUGA } from '../../src/services/genesis/UserGenesisService-UGA.js';
import { UserGraphAnchorServiceUGA } from '../../src/services/graph/UserGraphAnchorService-UGA.js';
import { HashingServiceUGA } from '../../src/services/hashing/HashingService-UGA.node.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration
 */
const CONFIG = {
  // Network configuration
  NETWORK: 'devnet',
  RPC_URL: 'https://api.devnet.solana.com',
  
  // Paths
  USERS_DIR: path.join(__dirname, 'test-users-uga'),
  GENESIS_REGISTRY: path.join(__dirname, 'genesis-registry-uga.json'),
  USER_REGISTRY: path.join(__dirname, 'user-registry-uga.json')
};

/**
 * Load or create user registry
 */
async function loadUserRegistry() {
  try {
    const data = await fs.readFile(CONFIG.USER_REGISTRY, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Create new registry if doesn't exist
    return {
      network: CONFIG.NETWORK,
      registryVersion: '2.0.0', // ADR-006 version
      adrVersion: '006',
      users: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Save user registry
 */
async function saveUserRegistry(registry) {
  registry.lastUpdated = new Date().toISOString();
  await fs.writeFile(
    CONFIG.USER_REGISTRY, 
    JSON.stringify(registry, null, 2)
  );
}

/**
 * Load genesis registry to get platform genesis information
 */
async function loadGenesisRegistry() {
  try {
    const data = await fs.readFile(CONFIG.GENESIS_REGISTRY, 'utf8');
    const registry = JSON.parse(data);
    
    if (!registry.genesisHash || !registry.transactionId) {
      throw new Error('Invalid genesis registry - missing required fields');
    }
    
    return registry;
  } catch (error) {
    throw new Error(
      'Genesis registry not found. Please run deployGenesis-UGA.js first.\n' +
      `Expected file: ${CONFIG.GENESIS_REGISTRY}`
    );
  }
}

/**
 * Generate or load a user keypair (supports migration from existing wallets)
 */
async function getUserKeypair(username) {
  // Ensure users directory exists
  await fs.mkdir(CONFIG.USERS_DIR, { recursive: true });
  
  // Check multiple locations for existing keypairs (migration support)
  const possiblePaths = [
    path.join(CONFIG.USERS_DIR, `${username}.json`), // New ADR-006 location
    path.join(__dirname, 'test-users', `${username}.json`), // Old location
    path.join(__dirname, `${username}.json`), // Direct in scripts folder
    path.join(__dirname, 'keypairs.json') // Legacy keypairs file
  ];

  // Try legacy keypairs.json format first (your existing funded wallets)
  const legacyKeypairsPath = path.join(__dirname, 'keypairs.json');
  try {
    const legacyData = await fs.readFile(legacyKeypairsPath, 'utf8');
    const allKeypairs = JSON.parse(legacyData);
    
    if (allKeypairs[username]) {
      const secretKey = new Uint8Array(allKeypairs[username]);
      const keypair = Keypair.fromSecretKey(secretKey);
      console.log(`createTestUser-UGA.js: getUserKeypair: Loaded from legacy keypairs.json for ${username}: ${keypair.publicKey.toBase58()}`);
      
      // Save to new location for future use
      const newPath = path.join(CONFIG.USERS_DIR, `${username}.json`);
      await fs.writeFile(newPath, JSON.stringify(Array.from(keypair.secretKey)));
      console.log(`createTestUser-UGA.js: getUserKeypair: Saved to new ADR-006 location: ${newPath}`);
      
      return keypair;
    }
  } catch (error) {
    // Legacy file doesn't exist or doesn't have this user, continue
  }
  
  // Try individual keypair files
  for (const keypairPath of possiblePaths.slice(0, -1)) { // Skip keypairs.json as we handled it above
    try {
      const keypairData = await fs.readFile(keypairPath, 'utf8');
      const secretKey = new Uint8Array(JSON.parse(keypairData));
      const keypair = Keypair.fromSecretKey(secretKey);
      console.log(`createTestUser-UGA.js: getUserKeypair: Loaded existing keypair for ${username}: ${keypair.publicKey.toBase58()}`);
      
      // If loaded from old location, copy to new location
      const newPath = path.join(CONFIG.USERS_DIR, `${username}.json`);
      if (keypairPath !== newPath) {
        await fs.writeFile(newPath, JSON.stringify(Array.from(keypair.secretKey)));
        console.log(`createTestUser-UGA.js: getUserKeypair: Migrated keypair to new location`);
      }
      
      return keypair;
    } catch (error) {
      // Try next path
    }
  }
  
  // Generate new keypair if none found
  console.log(`createTestUser-UGA.js: getUserKeypair: No existing keypair found for ${username}, generating new one`);
  const keypair = Keypair.generate();
  const newPath = path.join(CONFIG.USERS_DIR, `${username}.json`);
  await fs.writeFile(newPath, JSON.stringify(Array.from(keypair.secretKey)));
  console.log(`createTestUser-UGA.js: getUserKeypair: Generated new keypair for ${username}: ${keypair.publicKey.toBase58()}`);
  return keypair;
}

/**
 * Load the system wallet that pays for user creation
 */
async function getSystemWallet() {
  try {
    // Try common locations for the system wallet
    const possiblePaths = [
      './scripts/blockchain/deployment-wallet.json',
      './deployment-wallet.json',
      './wallet.json',
      './deployer-devnet.json'
    ];
    
    for (const walletPath of possiblePaths) {
      try {
        const walletData = await fs.readFile(walletPath, 'utf8');
        const secretKey = new Uint8Array(JSON.parse(walletData));
        const systemKeypair = Keypair.fromSecretKey(secretKey);
        console.log(`createTestUser-UGA.js: getSystemWallet: Loaded system wallet: ${systemKeypair.publicKey.toBase58()}`);
        return systemKeypair;
      } catch (e) {
        // Try next path
      }
    }
    
    throw new Error('No system wallet found');
  } catch (error) {
    console.error('createTestUser-UGA.js: getSystemWallet: Could not load system wallet:', error.message);
    console.log('💡 Create one with: node scripts/blockchain/deployGenesis-UGA.js');
    throw error;
  }
}

/**
 * Fund a user account if needed
 */
async function fundUserIfNeeded(connection, userKeypair, minBalance = 0.01) {
  const balance = await connection.getBalance(userKeypair.publicKey);
  const balanceSOL = balance / LAMPORTS_PER_SOL;
  
  if (balanceSOL < minBalance) {
    console.log(`createTestUser-UGA.js: fundUserIfNeeded: Current balance: ${balanceSOL} SOL (below minimum ${minBalance} SOL)`);
    console.log('createTestUser-UGA.js: fundUserIfNeeded: Requesting airdrop...');
    
    try {
      const signature = await connection.requestAirdrop(
        userKeypair.publicKey,
        0.1 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature);
      console.log('createTestUser-UGA.js: fundUserIfNeeded: Airdrop successful!');
    } catch (error) {
      console.warn('createTestUser-UGA.js: fundUserIfNeeded: Airdrop failed - you may need to fund manually');
      console.log(`   Send SOL to: ${userKeypair.publicKey.toBase58()}`);
    }
  } else {
    console.log(`createTestUser-UGA.js: fundUserIfNeeded: Balance sufficient: ${balanceSOL} SOL`);
  }
}

/**
 * Create a single test user with ADR-006 User Genesis (U₀) block
 */
async function createTestUser(username, connection, registry, isMigration = false) {
  console.log(`\n🌟 Creating ADR-006 User: ${username}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Check if user already exists in registry
    const existingUser = registry.users.find(u => u.username === username);
    if (existingUser && !isMigration) {
      console.log(`createTestUser-UGA.js: createTestUser: User ${username} already exists:`);
      console.log(`   User Genesis Transaction: ${existingUser.userGenesisTransactionId || existingUser.transactionHash}`);
      console.log(`   Public Key: ${existingUser.publicKey}`);
      if (existingUser.userGenesisHash) {
        console.log(`   User Genesis Hash: ${existingUser.userGenesisHash.substring(0, 16)}...`);
      }
      
      const answer = await promptUser('Create another genesis for this user? (y/N): ');
      if (answer.toLowerCase() !== 'y') {
        return existingUser;
      }
    } else if (existingUser && isMigration) {
      console.log(`createTestUser-UGA.js: createTestUser: Migrating existing user ${username} to ADR-006 format...`);
    }
    
    // Get or create keypair (supports migration from existing wallets)
    const userKeypair = await getUserKeypair(username);
    
    // Check current balance (don't request airdrop if already has funds)
    const balance = await connection.getBalance(userKeypair.publicKey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;
    console.log(`createTestUser-UGA.js: createTestUser: Current balance: ${balanceSOL.toFixed(4)} SOL`);
    
    // Only request airdrop if balance is very low
    if (balanceSOL < 0.005) { // Lower threshold since they likely have existing funds
      await fundUserIfNeeded(connection, userKeypair, 0.01);
    } else {
      console.log(`createTestUser-UGA.js: createTestUser: ✅ Sufficient balance for ADR-006 operations`);
    }

    console.log('\n🏗️  Building ADR-006 User Genesis Block...');

    // Create wallet object for UserGenesisService
    const userWallet = { keypair: userKeypair };

    // Additional metadata for the user genesis
    const metadata = {
      testUser: true,
      createdBy: 'createTestUser-UGA.js',
      adrVersion: '006',
      migrated: isMigration || false,
      migratedAt: isMigration ? new Date().toISOString() : undefined
    };

    // Publish User Genesis (U₀) using the UGA service
    console.log('createTestUser-UGA.js: createTestUser: Publishing User Genesis block...');
    const userGenesisResult = await UserGenesisServiceUGA.publishUserGenesis(
      userWallet,
      username,
      metadata
    );

    console.log('createTestUser-UGA.js: createTestUser: User Genesis published successfully!');
    console.log(`   Transaction ID: ${userGenesisResult.transactionId}`);
    console.log(`   User Genesis Hash: ${userGenesisResult.userGenesisHash.substring(0, 16)}...`);

    // Verify the user genesis
    console.log('\n🔍 Verifying User Genesis...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for indexing

    const verifiedGenesis = await UserGenesisServiceUGA.readUserGenesis(userGenesisResult.transactionId);
    if (!verifiedGenesis || verifiedGenesis.kind !== 'user_genesis') {
      throw new Error('User Genesis verification failed');
    }

    console.log('createTestUser-UGA.js: createTestUser: User Genesis verified successfully!');

    // Create user record for registry
    const userRecord = {
      username: username,
      publicKey: userGenesisResult.userPublicKey,
      userGenesisHash: userGenesisResult.userGenesisHash,
      userGenesisTransactionId: userGenesisResult.transactionId,
      createdAt: new Date().toISOString(),
      testUser: true,
      adrVersion: '006',
      explorer: `https://explorer.solana.com/tx/${userGenesisResult.transactionId}?cluster=devnet`,
      // Keep track of UGA state
      lastUGAEpoch: null,
      lastUGATransactionId: null,
      // Migration metadata
      migrated: isMigration || false,
      migratedAt: isMigration ? new Date().toISOString() : undefined,
      // Preserve existing wallet balance info for reference
      balanceAtCreation: balanceSOL
    };

    // Add to registry
    const updatedRegistry = {
      ...registry,
      users: [...registry.users.filter(u => u.username !== username), userRecord]
    };
    await saveUserRegistry(updatedRegistry);

    console.log('\n✅ ADR-006 User Creation Complete!');
    console.log(`👤 Username: ${userRecord.username}`);
    console.log(`🔑 Public Key: ${userRecord.publicKey}`);
    console.log(`🔐 User Genesis Hash: ${userRecord.userGenesisHash.substring(0, 16)}...`);
    console.log(`📋 U₀ Transaction: ${userRecord.userGenesisTransactionId}`);
    console.log(`💰 SOL Balance: ${balanceSOL.toFixed(4)} SOL (preserved)`);
    console.log(`🔗 Explorer: ${userRecord.explorer}`);
    
    if (isMigration) {
      console.log(`🔄 Migration: Complete (wallet and SOL balance preserved)`);
    }
    
    return userRecord;
    
  } catch (error) {
    console.error(`\ncreateTestUser-UGA.js: createTestUser: Failed to create user ${username}:`, error.message);
    return null;
  }
}

/**
 * Test UGA publishing for a user
 */
async function testUGAPublishing(username, connection, registry) {
  console.log(`\n🚀 Testing UGA Publishing for: ${username}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Find user in registry
    const user = registry.users.find(u => u.username === username);
    if (!user) {
      throw new Error(`User ${username} not found in registry. Create the user first.`);
    }

    // Get user keypair
    const userKeypair = await getUserKeypair(username);
    const userWallet = { keypair: userKeypair };

    // Check if UGA should be published
    const shouldPublish = await UserGraphAnchorServiceUGA.shouldPublishUGA(user.publicKey);
    console.log(`createTestUser-UGA.js: testUGAPublishing: Should publish UGA: ${shouldPublish}`);

    // Create some mock lane data (placeholder for Phase 1)
    const mockLaneData = {
      posts: [], // Empty for Phase 1
      replies: [],
      likes: [],
      follows: [],
      stories: [], // Will integrate with ADR-004 later
      profile: [],
      revocations: []
    };

    // Publish UGA
    console.log('createTestUser-UGA.js: testUGAPublishing: Publishing UGA...');
    const ugaResult = await UserGraphAnchorServiceUGA.publishNewUGA(userWallet, mockLaneData);

    console.log('createTestUser-UGA.js: testUGAPublishing: UGA published successfully!');
    console.log(`   Transaction ID: ${ugaResult.transactionId}`);
    console.log(`   Identity Root: ${ugaResult.identityRoot.substring(0, 16)}...`);
    console.log(`   UGR Root: ${ugaResult.ugrRoot.substring(0, 16)}...`);
    console.log(`   Epoch: ${ugaResult.epoch}`);

    // Update user record in registry
    const userIndex = registry.users.findIndex(u => u.username === username);
    if (userIndex !== -1) {
      registry.users[userIndex].lastUGAEpoch = ugaResult.epoch;
      registry.users[userIndex].lastUGATransactionId = ugaResult.transactionId;
      registry.users[userIndex].lastUGAPublishedAt = new Date().toISOString();
      await saveUserRegistry(registry);
    }

    // Verify UGA
    console.log('\n🔍 Verifying UGA...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for indexing

    const verifiedUGA = await UserGraphAnchorServiceUGA.readUGA(ugaResult.transactionId);
    if (!verifiedUGA || verifiedUGA.kind !== 'user_graph_anchor') {
      throw new Error('UGA verification failed');
    }

    console.log('createTestUser-UGA.js: testUGAPublishing: UGA verified successfully!');
    console.log(`🔗 UGA Explorer: https://explorer.solana.com/tx/${ugaResult.transactionId}?cluster=devnet`);

    return ugaResult;

  } catch (error) {
    console.error(`\ncreateTestUser-UGA.js: testUGAPublishing: UGA test failed for ${username}:`, error.message);
    return null;
  }
}

/**
 * Create multiple test users
 */
async function createBatchUsers(connection, registry) {
  const testUsernames = [
    'alice', 'bob', 'charlie', 'diana', 'eve',
    'frank', 'grace', 'henry', 'iris', 'jack'
  ];
  
  console.log('\n🚀 ADR-006 Batch User Creation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Creating ${testUsernames.length} test users...`);
  
  const results = [];
  for (const username of testUsernames) {
    const user = await createTestUser(username, connection, registry, false); // Not migration
    if (user) {
      results.push(user);
    }
    
    // Small delay between creations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reload registry for next iteration
    registry = await loadUserRegistry();
  }
  
  console.log('\n📊 Batch Creation Summary:');
  console.log(`✅ Successfully created: ${results.length} users`);
  console.log(`❌ Failed: ${testUsernames.length - results.length} users`);
  
  return results;
}

/**
 * Migrate existing users from legacy registry to ADR-006 format
 */
async function migrateExistingUsers(connection) {
  console.log('\n🔄 Migrating existing users to ADR-006 format');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Load legacy registry
    const legacyRegistryPath = path.join(__dirname, 'user-registry.json');
    let legacyRegistry;
    
    try {
      const legacyData = await fs.readFile(legacyRegistryPath, 'utf8');
      legacyRegistry = JSON.parse(legacyData);
      console.log(`createTestUser-UGA.js: migrateExistingUsers: Found legacy registry with ${legacyRegistry.users?.length || 0} users`);
    } catch (error) {
      console.log('createTestUser-UGA.js: migrateExistingUsers: No legacy registry found, checking for individual users...');
      legacyRegistry = { users: [] };
    }

    // Load current ADR-006 registry
    let currentRegistry = await loadUserRegistry();
    
    // Get list of users to migrate (from legacy registry + keypairs.json)
    const usersToMigrate = new Set();
    
    // Add users from legacy registry
    if (legacyRegistry.users) {
      legacyRegistry.users.forEach(user => usersToMigrate.add(user.username));
    }
    
    // Add users from keypairs.json
    try {
      const keypairsPath = path.join(__dirname, 'keypairs.json');
      const keypairsData = await fs.readFile(keypairsPath, 'utf8');
      const keypairs = JSON.parse(keypairsData);
      Object.keys(keypairs).forEach(username => usersToMigrate.add(username));
      console.log(`createTestUser-UGA.js: migrateExistingUsers: Found keypairs for: ${Array.from(usersToMigrate).join(', ')}`);
    } catch (error) {
      console.log('createTestUser-UGA.js: migrateExistingUsers: No keypairs.json found');
    }

    if (usersToMigrate.size === 0) {
      console.log('createTestUser-UGA.js: migrateExistingUsers: No users found to migrate');
      return;
    }

    console.log(`\n🚀 Migrating ${usersToMigrate.size} users: ${Array.from(usersToMigrate).join(', ')}`);
    
    const results = [];
    for (const username of usersToMigrate) {
      console.log(`\n📦 Migrating ${username}...`);
      
      try {
        // Check if already migrated
        const existing = currentRegistry.users.find(u => u.username === username);
        if (existing && existing.adrVersion === '006') {
          console.log(`createTestUser-UGA.js: migrateExistingUsers: ${username} already migrated to ADR-006, skipping`);
          continue;
        }
        
        // Create new ADR-006 user genesis
        const user = await createTestUser(username, connection, currentRegistry, true); // Pass migration flag
        if (user) {
          results.push(user);
          console.log(`createTestUser-UGA.js: migrateExistingUsers: ✅ ${username} migrated successfully`);
        }
        
        // Reload registry for next iteration
        currentRegistry = await loadUserRegistry();
        
        // Small delay between migrations
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`createTestUser-UGA.js: migrateExistingUsers: ❌ Failed to migrate ${username}:`, error.message);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${results.length} users`);
    console.log(`❌ Failed: ${usersToMigrate.size - results.length} users`);
    console.log(`📄 New registry: ${CONFIG.USER_REGISTRY}`);
    
    if (results.length > 0) {
      console.log('\n💡 Your existing wallets have been preserved with their SOL balances!');
      console.log('💡 Old transactions are replaced with new ADR-006 User Genesis blocks.');
    }
    
    return results;
    
  } catch (error) {
    console.error('createTestUser-UGA.js: migrateExistingUsers: Migration failed:', error.message);
    throw error;
  }
}

/**
 * Create multiple test users
 */
async function createBatchUsers(connection, registry) {
  const testUsernames = [
    'alice', 'bob', 'charlie', 'diana', 'eve',
    'frank', 'grace', 'henry', 'iris', 'jack'
  ];
  
  console.log('\n🚀 ADR-006 Batch User Creation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Creating ${testUsernames.length} test users...`);
  
  const results = [];
  for (const username of testUsernames) {
    const user = await createTestUser(username, connection, registry);
    if (user) {
      results.push(user);
    }
    
    // Small delay between creations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reload registry for next iteration
    registry = await loadUserRegistry();
  }
  
  console.log('\n📊 Batch Creation Summary:');
  console.log(`✅ Successfully created: ${results.length} users`);
  console.log(`❌ Failed: ${testUsernames.length - results.length} users`);
  
  return results;
}

/**
 * Run comprehensive self-tests before user creation
 */
async function runPreCreationTests() {
  console.log('🧪 Running pre-creation self-tests...');
  
  const tests = [
    { name: 'HashingService-UGA', test: () => HashingServiceUGA.runSelfTest() },
    { name: 'GlyffitiGenesisService-UGA', test: () => GlyffitiGenesisServiceUGA.runSelfTest() },
    { name: 'UserGenesisService-UGA', test: () => UserGenesisServiceUGA.runSelfTest() },
    { name: 'UserGraphAnchorService-UGA', test: () => UserGraphAnchorServiceUGA.runSelfTest() }
  ];

  for (const test of tests) {
    try {
      console.log(`createTestUser-UGA.js: runPreCreationTests: Testing ${test.name}...`);
      const passed = await test.test();
      if (!passed) {
        throw new Error(`${test.name} self-test failed`);
      }
      console.log(`createTestUser-UGA.js: runPreCreationTests: ✅ ${test.name} test passed`);
    } catch (error) {
      console.error(`createTestUser-UGA.js: runPreCreationTests: ❌ ${test.name} test failed:`, error.message);
      throw new Error(`Pre-creation tests failed: ${test.name}`);
    }
  }

  console.log('createTestUser-UGA.js: runPreCreationTests: All pre-creation tests passed!');
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
 * Display usage help
 */
function showUsage() {
  console.log(`
🌟 ADR-006 Enhanced Test User Creation

Usage:
  node scripts/blockchain/createTestUser-UGA.js [options]

Options:
  --migrate                    Migrate existing funded wallets to ADR-006 format
  --username <name>           Create specific user
  --username <name> --count N Create multiple users with numeric suffix
  --batch                     Create multiple predefined test users
  --test-uga <name>          Test UGA publishing for existing user
  --help                      Show this help

Migration Examples:
  # Migrate all existing funded wallets to ADR-006 (RECOMMENDED)
  node scripts/blockchain/createTestUser-UGA.js --migrate
  
  # Migrate then test UGA for specific user
  node scripts/blockchain/createTestUser-UGA.js --migrate
  node scripts/blockchain/createTestUser-UGA.js --test-uga alice

User Creation Examples:
  # Create single user (will reuse existing wallet if found)
  node scripts/blockchain/createTestUser-UGA.js --username charlie
  
  # Create multiple users with prefix
  node scripts/blockchain/createTestUser-UGA.js --username test --count 3
  
  # Create predefined batch of users
  node scripts/blockchain/createTestUser-UGA.js --batch

Migration Process:
1. Looks for existing keypairs.json and user-registry.json
2. Preserves your existing wallets and SOL balances
3. Creates new ADR-006 compliant User Genesis (U₀) blocks
4. Updates registry with new UGA-compatible format
5. Enables UGA publishing for existing users
`);
}

/**
 * Main execution
 */
async function main() {
  // Check for help flag first
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUsage();
    process.exit(0);
  }

  console.log('🌟 ADR-006 Enhanced Test User Creation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 Network: ${CONFIG.NETWORK}`);
  console.log(`🔗 RPC: ${CONFIG.RPC_URL}`);
  console.log(`📅 Time: ${new Date().toISOString()}`);
  console.log(`⚡ ADR: 006 (User Graph Anchors)`);
  
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const usernameIndex = args.indexOf('--username');
    const batchMode = args.includes('--batch');
    const migrateMode = args.includes('--migrate');
    const countIndex = args.indexOf('--count');
    const testUGAIndex = args.indexOf('--test-uga');
    
    // Run pre-creation tests
    await runPreCreationTests();

    // Load genesis registry to ensure genesis is deployed
    const genesisRegistry = await loadGenesisRegistry();
    console.log(`\n📋 Genesis Registry Loaded:`);
    console.log(`   Genesis Hash: ${genesisRegistry.genesisHash.substring(0, 16)}...`);
    console.log(`   Network: ${genesisRegistry.network}`);
    
    // Connect to Solana
    console.log('\n🔌 Connecting to Solana...');
    const connection = new Connection(CONFIG.RPC_URL, 'confirmed');
    const version = await connection.getVersion();
    console.log(`createTestUser-UGA.js: main: Connected (version: ${version['solana-core']})`);
    
    // Load user registry
    const registry = await loadUserRegistry();
    console.log(`createTestUser-UGA.js: main: Registry: ${registry.users.length} existing users`);
    
    // Execute based on mode
    if (migrateMode) {
      // Migration mode - migrate existing funded wallets to ADR-006
      console.log('\n🔄 MIGRATION MODE: Converting existing wallets to ADR-006');
      await migrateExistingUsers(connection);
    } else if (testUGAIndex !== -1 && args[testUGAIndex + 1]) {
      // Test UGA publishing mode
      const username = args[testUGAIndex + 1];
      await testUGAPublishing(username, connection, registry);
    } else if (batchMode) {
      // Batch mode - create multiple users
      await createBatchUsers(connection, registry);
    } else if (usernameIndex !== -1 && args[usernameIndex + 1]) {
      // Single user mode
      const username = args[usernameIndex + 1];
      
      // Check if count specified (create multiple with same prefix)
      if (countIndex !== -1 && args[countIndex + 1]) {
        const count = parseInt(args[countIndex + 1]);
        for (let i = 1; i <= count; i++) {
          await createTestUser(`${username}${i}`, connection, registry);
          // Reload registry for next iteration
          registry = await loadUserRegistry();
        }
      } else {
        await createTestUser(username, connection, registry);
      }
    } else {
      // Interactive mode
      console.log('\n📝 No mode specified. Available options:');
      console.log('   --migrate          Migrate existing funded wallets to ADR-006');
      console.log('   --username <name>  Create specific user');
      console.log('   --batch           Create multiple test users');
      console.log('   --test-uga <name> Test UGA publishing for user');
      console.log('');
      const mode = await promptUser('Choose: (migrate/username/batch/test-uga): ');
      
      if (mode === 'migrate') {
        await migrateExistingUsers(connection);
      } else if (mode === 'username') {
        const username = await promptUser('Username: ');
        if (username) {
          await createTestUser(username, connection, registry);
        } else {
          console.log('createTestUser-UGA.js: main: Username required');
        }
      } else if (mode === 'batch') {
        await createBatchUsers(connection, registry);
      } else if (mode === 'test-uga') {
        const username = await promptUser('Username for UGA test: ');
        if (username) {
          await testUGAPublishing(username, connection, registry);
        }
      } else {
        console.log('createTestUser-UGA.js: main: Invalid mode selected');
      }
    }
    
    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Next Steps:');
    console.log('1. View user registry: cat scripts/blockchain/user-registry-uga.json');
    console.log('2. Test UGA publishing: node scripts/blockchain/createTestUser-UGA.js --test-uga alice');
    console.log('3. Create posts: node scripts/blockchain/createTestPosts-UGA.js');
    console.log('4. Explore transactions: Check explorer links in user registry');
    
    if (migrateMode) {
      console.log('');
      console.log('🎉 MIGRATION COMPLETE!');
      console.log('💰 Your existing SOL balances have been preserved');
      console.log('🔐 Users now have proper ADR-006 identity binding');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('\ncreateTestUser-UGA.js: main: Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle interruption
process.on('SIGINT', () => {
  console.log('\n\n⚠️  User creation interrupted');
  process.exit(0);
});

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Character count: 17,384