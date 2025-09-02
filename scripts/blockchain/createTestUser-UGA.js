// scripts/blockchain/createTestUser-UGA.js
// Path: scripts/blockchain/createTestUser-UGA.js
// ADR-006 Test User Creation Script
// 
// FIXED: Uses data models directly, no runtime service dependencies

import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bs58 from 'bs58';

// Import data models and utilities only - NO RUNTIME SERVICES
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
  USERS_DIR: path.join(__dirname, 'test-users-uga'),
  GENESIS_REGISTRY: path.join(__dirname, 'genesis-registry-uga.json'),
  USER_REGISTRY: path.join(__dirname, 'user-registry-uga.json')
};

/**
 * Load genesis registry to get G₀ hash
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
 * Load or create user registry
 */
async function loadUserRegistry() {
  try {
    const data = await fs.readFile(CONFIG.USER_REGISTRY, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      network: CONFIG.NETWORK,
      registryVersion: '2.0.0',
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
  await fs.writeFile(CONFIG.USER_REGISTRY, JSON.stringify(registry, null, 2));
}

/**
 * Get or create user keypair
 */
async function getUserKeypair(username) {
  await fs.mkdir(CONFIG.USERS_DIR, { recursive: true });
  
  const keypairPath = path.join(CONFIG.USERS_DIR, `${username}.json`);
  
  try {
    const keypairData = await fs.readFile(keypairPath, 'utf8');
    const secretKey = new Uint8Array(JSON.parse(keypairData));
    const keypair = Keypair.fromSecretKey(secretKey);
    console.log(`📂 Loaded existing keypair for ${username}: ${keypair.publicKey.toBase58()}`);
    return keypair;
  } catch (error) {
    console.log(`🔑 Creating new keypair for ${username}`);
    const keypair = Keypair.generate();
    await fs.writeFile(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));
    console.log(`💾 Saved new keypair: ${keypair.publicKey.toBase58()}`);
    return keypair;
  }
}

/**
 * Fund user account if needed
 */
async function fundUserIfNeeded(connection, userKeypair, minBalance = 0.01) {
  const balance = await connection.getBalance(userKeypair.publicKey);
  const balanceSOL = balance / LAMPORTS_PER_SOL;
  
  console.log(`💰 Current balance: ${balanceSOL.toFixed(4)} SOL`);
  
  if (balanceSOL < minBalance) {
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
    console.log('✅ Balance sufficient');
  }
}

/**
 * Create a single test user with ADR-006 User Genesis (U₀)
 */
async function createTestUser(username, connection, registry, genesisHash) {
  console.log(`\n🌟 Creating ADR-006 User: ${username}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Check if user already exists
    const existingUser = registry.users.find(u => u.username === username);
    if (existingUser) {
      console.log(`⚠️  User ${username} already exists:`);
      console.log(`   Transaction: ${existingUser.transactionId}`);
      console.log(`   Public Key: ${existingUser.publicKey}`);
      
      const answer = await promptUser('Create another genesis for this user? (y/N): ');
      if (answer.toLowerCase() !== 'y') {
        return existingUser;
      }
    }
    
    // Get or create keypair
    const userKeypair = await getUserKeypair(username);
    
    // Fund account if needed
    await fundUserIfNeeded(connection, userKeypair);
    
    // Create U₀ using the data model
    console.log('\n🏗️  Building User Genesis Block...');
    const userGenesis = UgaGenesisFactory.createUserGenesis(
      username,
      genesisHash,
      userKeypair.publicKey.toBase58()
    );
    
    // Calculate the user genesis hash
    const userGenesisHash = userGenesis.calculateHash();
    
    // Display genesis info
    console.log(`👤 Username: ${username}`);
    console.log(`🔑 Public Key: ${userKeypair.publicKey.toBase58()}`);
    console.log(`⬆️  Parent G₀: ${genesisHash.substring(0, 16)}...`);
    console.log(`🔍 U₀ Hash: ${userGenesisHash.substring(0, 16)}...`);
    console.log(`📅 Timestamp: ${new Date(userGenesis.timestamp * 1000).toISOString()}`);
    
    // Deploy to blockchain
    console.log('\n📡 Deploying to Solana...');
    
    const memoBuilder = new SolanaMemoBuilder(connection);
    
    // Get wire format from the model
    const wireData = await userGenesis.toMemoData();
    
    // Build and submit transaction
    const transaction = await memoBuilder.buildMemoTransaction(wireData, userKeypair);
    const transactionId = await memoBuilder.submitTransactionWithRetries(
      transaction,
      userKeypair,
      `User Genesis for ${username}`
    );
    
    console.log(`✅ User Genesis deployed: ${transactionId}`);
    
    // Verify deployment
    console.log('\n🔍 Verifying deployment...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const verifiedGenesis = await memoBuilder.readGenesisFromTransaction(transactionId);
    if (verifiedGenesis.kind !== 'user_genesis') {
      throw new Error('Verification failed - invalid genesis type');
    }
    
    console.log('✅ Deployment verified!');
    
    // Create user record for registry
    const userRecord = {
      username: username,
      publicKey: userKeypair.publicKey.toBase58(),
      userGenesisHash: userGenesisHash,
      parentGenesisHash: genesisHash,
      transactionId: transactionId,
      createdAt: new Date().toISOString(),
      adrVersion: '006',
      explorer: `https://explorer.solana.com/tx/${transactionId}?cluster=devnet`
    };
    
    // Update registry
    const updatedRegistry = {
      ...registry,
      users: [...registry.users.filter(u => u.username !== username), userRecord]
    };
    await saveUserRegistry(updatedRegistry);
    
    console.log('\n✅ User Creation Complete!');
    console.log(`💾 Registry updated: ${CONFIG.USER_REGISTRY}`);
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
async function createBatchUsers(connection, registry, genesisHash) {
  const testUsernames = [
    'alice', 'bob', 'charlie', 'diana', 'eve',
    'frank', 'grace', 'henry', 'iris', 'jack'
  ];
  
  console.log('\n🚀 Batch User Creation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Creating ${testUsernames.length} test users...`);
  
  const results = [];
  for (const username of testUsernames) {
    const user = await createTestUser(username, connection, registry, genesisHash);
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
  console.log('🌟 ADR-006 Test User Creation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 Network: ${CONFIG.NETWORK}`);
  console.log(`🔗 RPC: ${CONFIG.RPC_URL}`);
  console.log(`📅 Time: ${new Date().toISOString()}`);
  
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const usernameIndex = args.indexOf('--username');
    const batchMode = args.includes('--batch');
    const countIndex = args.indexOf('--count');
    
    // Load genesis registry to get G₀ hash
    const genesisRegistry = await loadGenesisRegistry();
    console.log(`\n📋 Genesis Registry Loaded:`);
    console.log(`   G₀ Hash: ${genesisRegistry.genesisHash.substring(0, 16)}...`);
    console.log(`   G₀ Transaction: ${genesisRegistry.transactionId}`);
    
    // Connect to Solana
    console.log('\n🔌 Connecting to Solana...');
    const connection = new Connection(CONFIG.RPC_URL, 'confirmed');
    const version = await connection.getVersion();
    console.log(`✅ Connected (version: ${version['solana-core']})`);
    
    // Load user registry
    const registry = await loadUserRegistry();
    console.log(`📊 Registry: ${registry.users.length} existing users`);
    
    // Test the data model
    console.log('\n🧪 Testing User Genesis model...');
    const testPassed = await UgaGenesisFactory.runSelfTest();
    if (!testPassed) {
      throw new Error('User Genesis model self-test failed!');
    }
    console.log('✅ Model tests passed');
    
    // Execute based on mode
    if (batchMode) {
      await createBatchUsers(connection, registry, genesisRegistry.genesisHash);
    } else if (usernameIndex !== -1 && args[usernameIndex + 1]) {
      const username = args[usernameIndex + 1];
      
      if (countIndex !== -1 && args[countIndex + 1]) {
        const count = parseInt(args[countIndex + 1]);
        for (let i = 1; i <= count; i++) {
          await createTestUser(
            `${username}${i}`, 
            connection, 
            registry, 
            genesisRegistry.genesisHash
          );
          registry = await loadUserRegistry();
        }
      } else {
        await createTestUser(username, connection, registry, genesisRegistry.genesisHash);
      }
    } else {
      // Interactive mode
      console.log('\nUsage:');
      console.log('  node createTestUser-UGA.js --username alice');
      console.log('  node createTestUser-UGA.js --batch');
      console.log('  node createTestUser-UGA.js --username test --count 3');
      
      const username = await promptUser('\nEnter username (or press Enter to skip): ');
      if (username) {
        await createTestUser(username, connection, registry, genesisRegistry.genesisHash);
      }
    }
    
    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Next Steps:');
    console.log('1. View registry: cat scripts/blockchain/user-registry-uga.json');
    console.log('2. Create more users: node scripts/blockchain/createTestUser-UGA.js --batch');
    console.log('3. Test UGA publishing: node scripts/blockchain/testUGA.js');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Handle interruption
process.on('SIGINT', () => {
  console.log('\n\n⚠️  User creation interrupted');
  process.exit(0);
});

// Just run it
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

// Character count: 10,892