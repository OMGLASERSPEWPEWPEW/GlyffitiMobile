// scripts/blockchain/createTestUser.js
// Path: scripts/blockchain/createTestUser.js

/**
 * Create Test User Script for Glyffiti Social Network
 * 
 * This script creates test user accounts on the blockchain that link back
 * to the deployed Glyffiti Genesis Block.
 * 
 * Usage:
 *   node scripts/blockchain/createTestUser.js --username alice
 *   node scripts/blockchain/createTestUser.js --username bob --count 5
 *   node scripts/blockchain/createTestUser.js --batch  # Creates multiple test users
 */

import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bs58 from 'bs58';

// Import our models and builders
import { UserGenesisBlock } from '../../src/services/blockchain/shared/models/UserGenesisBlock.js';
import { SolanaMemoBuilder } from '../../src/services/blockchain/solana/utils/SolanaMemoBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration
 */
const CONFIG = {
  // Your deployed genesis hash from the terminal output
  GLYFFITI_GENESIS_HASH: '3gR3czdawhptXjPhzbMDtys9S6UYDE7XQNFEA1T1nqPcRYKpmCBL7Dw8ew43KCHjtFmHPEzUQuB7LJcYT8Tc9oYL',
  
  // Network configuration
  NETWORK: 'devnet',
  RPC_URL: 'https://api.devnet.solana.com',
  
  // Paths
  USERS_DIR: path.join(__dirname, 'test-users'),
  GENESIS_REGISTRY: path.join(__dirname, 'genesis-registry.json'),
  USER_REGISTRY: path.join(__dirname, 'user-registry.json')
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
      glyffitiGenesis: CONFIG.GLYFFITI_GENESIS_HASH,
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
 * Generate or load a user keypair
 */
async function getUserKeypair(username) {
  // Ensure users directory exists
  await fs.mkdir(CONFIG.USERS_DIR, { recursive: true });
  
  const keypairPath = path.join(CONFIG.USERS_DIR, `${username}.json`);
  
  try {
    // Try to load existing keypair
    const keypairData = await fs.readFile(keypairPath, 'utf8');
    const secretKey = new Uint8Array(JSON.parse(keypairData));
    const keypair = Keypair.fromSecretKey(secretKey);
    console.log(`📂 Loaded existing keypair for ${username}: ${keypair.publicKey.toBase58()}`);
    return keypair;
  } catch (error) {
    // Generate new keypair
    const keypair = Keypair.generate();
    await fs.writeFile(
      keypairPath,
      JSON.stringify(Array.from(keypair.secretKey))
    );
    console.log(`🔑 Generated new keypair for ${username}: ${keypair.publicKey.toBase58()}`);
    return keypair;
  }
}

/**
 * Fund a user account if needed
 */
async function fundUserIfNeeded(connection, userKeypair, minBalance = 0.01) {
  const balance = await connection.getBalance(userKeypair.publicKey);
  const balanceSOL = balance / LAMPORTS_PER_SOL;
  
  if (balanceSOL < minBalance) {
    console.log(`💰 Current balance: ${balanceSOL} SOL (below minimum ${minBalance} SOL)`);
    console.log('🚰 Requesting airdrop...');
    
    try {
      const signature = await connection.requestAirdrop(
        userKeypair.publicKey,
        0.1 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature);
      console.log('✅ Airdrop successful!');
    } catch (error) {
      console.warn('⚠️  Airdrop failed - you may need to fund manually');
      console.log(`   Send SOL to: ${userKeypair.publicKey.toBase58()}`);
    }
  } else {
    console.log(`💰 Balance sufficient: ${balanceSOL} SOL`);
  }
}

/**
 * Create a single test user
 */
async function createTestUser(username, connection, registry) {
  console.log(`\n🌟 Creating User: ${username}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Check if user already exists in registry
    const existingUser = registry.users.find(u => u.username === username);
    if (existingUser) {
      console.log(`⚠️  User ${username} already exists:`);
      console.log(`   Transaction: ${existingUser.transactionHash}`);
      console.log(`   Public Key: ${existingUser.publicKey}`);
      
      const answer = await promptUser('Create another genesis for this user? (y/N): ');
      if (answer.toLowerCase() !== 'y') {
        return null;
      }
    }
    
    // Get or create keypair
    const userKeypair = await getUserKeypair(username);
    
    // Fund account if needed
    await fundUserIfNeeded(connection, userKeypair);
    
    // Create user genesis block
    console.log('\n🏗️  Building User Genesis Block...');
    const userGenesis = new UserGenesisBlock(
      username,
      CONFIG.GLYFFITI_GENESIS_HASH,
      userKeypair.publicKey.toBase58()
    );
    
    // Display genesis info
    const displayInfo = userGenesis.getDisplayInfo();
    console.log(`👤 Username: ${displayInfo.username}`);
    console.log(`🔑 Public Key: ${displayInfo.publicKey}`);
    console.log(`⬆️  Parent Genesis: ${displayInfo.parentGenesis.slice(0, 16)}...`);
    console.log(`📅 Timestamp: ${displayInfo.joinedAt.toISOString()}`);
    
    // Deploy to blockchain
    console.log('\n📡 Deploying to Solana...');
    const memoBuilder = new SolanaMemoBuilder(connection);
    const transactionHash = await memoBuilder.deployUserGenesis(
      username,
      CONFIG.GLYFFITI_GENESIS_HASH,
      userKeypair
    );
    
    console.log(`✅ User Genesis deployed: ${transactionHash}`);
    
    // Verify deployment
    console.log('\n🔍 Verifying deployment...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for indexing
    
    const verifiedGenesis = await memoBuilder.readGenesisFromTransaction(transactionHash);
    if (verifiedGenesis.kind !== 'user_genesis') {
      throw new Error('Verification failed - invalid genesis type');
    }
    
    console.log('✅ Deployment verified!');
    
    // Create user record
    const userRecord = {
      username: username,
      publicKey: userKeypair.publicKey.toBase58(),
      transactionHash: transactionHash,
      parentGenesis: CONFIG.GLYFFITI_GENESIS_HASH,
      createdAt: new Date().toISOString(),
      explorer: `https://explorer.solana.com/tx/${transactionHash}?cluster=devnet`
    };
    
    // Add to registry
    registry.users.push(userRecord);
    await saveUserRegistry(registry);
    
    console.log('\n🎉 User creation successful!');
    console.log(`🔗 Explorer: ${userRecord.explorer}`);
    
    return userRecord;
    
  } catch (error) {
    console.error(`\n❌ Failed to create user ${username}:`, error.message);
    return null;
  }
}

/**
 * Create multiple test users
 */
async function createBatchUsers(connection, registry) {
  const testUsernames = [
    'alice', 'bob', 'charlie', 'dana', 'eve',
    'frank', 'grace', 'henry', 'iris', 'jack'
  ];
  
  console.log('\n🚀 Batch User Creation');
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
  }
  
  console.log('\n📊 Batch Creation Summary:');
  console.log(`✅ Successfully created: ${results.length} users`);
  console.log(`❌ Failed: ${testUsernames.length - results.length} users`);
  
  return results;
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
  console.log('🌟 Glyffiti Test User Creation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 Network: ${CONFIG.NETWORK}`);
  console.log(`🔗 RPC: ${CONFIG.RPC_URL}`);
  console.log(`📍 Genesis: ${CONFIG.GLYFFITI_GENESIS_HASH.slice(0, 16)}...`);
  console.log(`📅 Time: ${new Date().toISOString()}`);
  
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const usernameIndex = args.indexOf('--username');
    const batchMode = args.includes('--batch');
    const countIndex = args.indexOf('--count');
    
    // Connect to Solana
    console.log('\n🔌 Connecting to Solana...');
    const connection = new Connection(CONFIG.RPC_URL, 'confirmed');
    const version = await connection.getVersion();
    console.log(`✅ Connected (version: ${version['solana-core']})`);
    
    // Load user registry
    const registry = await loadUserRegistry();
    console.log(`📊 Registry: ${registry.users.length} existing users`);
    
    // Run tests first
    console.log('\n🧪 Running security tests...');
    const testPassed = await UserGenesisBlock.runSelfTest();
    if (!testPassed) {
      throw new Error('Security test failed!');
    }
    console.log('✅ Security tests passed');
    
    // Execute based on mode
    if (batchMode) {
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
        }
      } else {
        await createTestUser(username, connection, registry);
      }
    } else {
      // Interactive mode
      console.log('\n📝 No username specified. Enter details:');
      const username = await promptUser('Username: ');
      
      if (username) {
        await createTestUser(username, connection, registry);
      } else {
        console.log('❌ Username required');
      }
    }
    
    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Next Steps:');
    console.log('1. View user registry: cat scripts/blockchain/user-registry.json');
    console.log('2. Create posts for users: node scripts/blockchain/createTestPosts.js');
    console.log('3. View the feed: node scripts/blockchain/viewFeed.js');
    console.log('4. Explore on Solana: Check the explorer links in user-registry.json');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
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

// Character count: 11,497