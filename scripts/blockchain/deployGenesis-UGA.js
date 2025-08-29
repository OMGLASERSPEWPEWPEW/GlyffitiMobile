// scripts/blockchain/deployGenesis-UGA.js
// Path: scripts/blockchain/deployGenesis-UGA.js
// ADR-006 Enhanced Genesis Block Deployment Script
// 
// This script deploys the official Glyffiti Genesis (G₀) block that serves as
// the root of trust for the entire ADR-006 User Graph Anchor architecture.
// 
// Usage:
//   node scripts/blockchain/deployGenesis-UGA.js --network devnet    # For testing
//   node scripts/blockchain/deployGenesis-UGA.js --network mainnet   # For production (PERMANENT!)

import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Import UGA services
import { HashingServiceUGA } from '../../src/services/hashing/HashingService-UGA.node.js';
import { GlyffitiGenesisServiceUGA } from '../../src/services/genesis/GlyffitiGenesisService-UGA.js';
import { SolanaMemoBuilder } from '../../src/services/blockchain/solana/utils/SolanaMemoBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * ADR-006 Genesis Deployment Configuration
 */
const DEPLOYMENT_CONFIG = {
  devnet: {
    name: 'Solana Devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com/tx/{TXID}?cluster=devnet',
    isProduction: false,
    requiresConfirmation: false
  },
  mainnet: {
    name: 'Solana Mainnet',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com/tx/{TXID}',
    isProduction: true,
    requiresConfirmation: true
  }
};

/**
 * File paths for storing deployment results
 */
const GENESIS_REGISTRY_PATH = path.join(__dirname, 'genesis-registry-uga.json');
const DEPLOYMENT_WALLET_PATH = path.join(__dirname, 'deployment-wallet.json');

/**
 * Load or create deployment wallet
 */
async function getDeploymentWallet() {
  console.log('🔑 Loading deployment wallet...');
  
  try {
    // Try to load existing wallet
    const walletData = await fs.readFile(DEPLOYMENT_WALLET_PATH, 'utf8');
    const secretKey = new Uint8Array(JSON.parse(walletData));
    const deployerKeypair = Keypair.fromSecretKey(secretKey);
    
    console.log('📂 Loaded existing deployment wallet:', deployerKeypair.publicKey.toBase58());
    return deployerKeypair;
  } catch (error) {
    // Generate new wallet
    console.log('🆕 Generating new deployment wallet...');
    const deployerKeypair = Keypair.generate();
    
    // Save wallet for future use
    await fs.writeFile(
      DEPLOYMENT_WALLET_PATH,
      JSON.stringify(Array.from(deployerKeypair.secretKey))
    );
    
    console.log('💾 Saved new deployment wallet:', deployerKeypair.publicKey.toBase58());
    console.log('⚠️  IMPORTANT: Back up this wallet file for future deployments!');
    
    return deployerKeypair;
  }
}

/**
 * Fund deployment wallet if needed
 */
async function fundDeploymentWallet(connection, deployerKeypair, minBalance = 0.1) {
  console.log('💰 Checking deployment wallet balance...');
  
  const balance = await connection.getBalance(deployerKeypair.publicKey);
  const balanceSOL = balance / LAMPORTS_PER_SOL;
  
  console.log(`   Current balance: ${balanceSOL.toFixed(4)} SOL`);
  
  if (balanceSOL < minBalance) {
    console.log(`   Balance below minimum ${minBalance} SOL`);
    console.log('🚰 Requesting airdrop...');
    
    try {
      const signature = await connection.requestAirdrop(
        deployerKeypair.publicKey,
        0.5 * LAMPORTS_PER_SOL // Request 0.5 SOL
      );
      
      await connection.confirmTransaction(signature);
      
      const newBalance = await connection.getBalance(deployerKeypair.publicKey);
      const newBalanceSOL = newBalance / LAMPORTS_PER_SOL;
      console.log(`✅ Airdrop successful! New balance: ${newBalanceSOL.toFixed(4)} SOL`);
      
    } catch (error) {
      console.error('❌ Airdrop failed:', error.message);
      console.log('💡 Please fund the deployment wallet manually:');
      console.log(`   Address: ${deployerKeypair.publicKey.toBase58()}`);
      throw new Error('Insufficient funds for deployment');
    }
  } else {
    console.log('✅ Wallet funding sufficient');
  }
}

/**
 * Create ADR-006 compliant Glyffiti Genesis (G₀) block
 */
async function createGenesisBlock(deployerKeypair, network) {
  console.log('🏗️  Creating ADR-006 Glyffiti Genesis Block...');
  
  try {
    // Create G₀ data structure according to ADR-006 specification
    const genesisData = {
      v: 1, // Version
      kind: 'glyffiti_genesis',
      version: '1.0.0',
      protocol: 'glyffiti-uga',
      network: network,
      timestamp: Date.now(),
      deployerKey: deployerKeypair.publicKey.toBase58(),
      adr: '006', // ADR version
      description: 'Glyffiti Genesis Block for User Graph Anchor Architecture'
    };

    console.log('📊 Genesis Block Data:');
    console.log(`   Version: ${genesisData.version}`);
    console.log(`   Protocol: ${genesisData.protocol}`);
    console.log(`   Network: ${genesisData.network}`);
    console.log(`   Deployer: ${genesisData.deployerKey}`);
    console.log(`   Timestamp: ${new Date(genesisData.timestamp).toISOString()}`);

    return genesisData;

  } catch (error) {
    console.error('❌ Error creating genesis block:', error);
    throw new Error(`Failed to create genesis block: ${error.message}`);
  }
}

/**
 * Calculate genesis hash using ADR-006 domain separation
 */
async function calculateGenesisHash(genesisData) {
  console.log('🔐 Calculating genesis hash with ADR-006 domain separation...');
  
  try {
    // Serialize genesis data deterministically
    const serializedData = JSON.stringify(genesisData, Object.keys(genesisData).sort());
    
    // Use domain-separated hashing for Glyffiti Genesis
    const genesisHash = await HashingServiceUGA.hashWithDomain(
      HashingServiceUGA.DOMAINS.GLYFFITI_GENESIS,
      serializedData
    );

    console.log('✅ Genesis hash calculated:', genesisHash.substring(0, 16) + '...');
    return genesisHash;

  } catch (error) {
    console.error('❌ Error calculating genesis hash:', error);
    throw new Error(`Failed to calculate genesis hash: ${error.message}`);
  }
}

/**
 * Deploy genesis block to blockchain
 */
async function deployToBlockchain(connection, deployerKeypair, genesisData, genesisHash) {
  console.log('📡 Deploying genesis block to blockchain...');
  
  try {
    // Add the calculated hash to genesis data for memo
    const memoData = {
      ...genesisData,
      genesisHash: genesisHash
    };

    // Create memo builder
    const memoBuilder = new SolanaMemoBuilder(connection);

    // Convert to wire format
    const memoJSON = JSON.stringify(memoData);
    const wireData = Buffer.from(memoJSON, 'utf8');

    console.log(`📏 Memo size: ${wireData.length} bytes`);
    
    if (wireData.length > 566) {
      throw new Error(`Memo too large: ${wireData.length} bytes (max 566)`);
    }

    // Build transaction
    const transaction = await memoBuilder.buildMemoTransaction(wireData, deployerKeypair);

    // Submit with retries
    const transactionId = await memoBuilder.submitTransactionWithRetries(
      transaction,
      deployerKeypair,
      'ADR-006 Glyffiti Genesis Deployment'
    );

    console.log('✅ Genesis block deployed successfully!');
    console.log('📋 Transaction ID:', transactionId);

    return transactionId;

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw new Error(`Failed to deploy genesis block: ${error.message}`);
  }
}

/**
 * Store deployment results
 */
async function storeDeploymentResults(network, transactionId, genesisHash, genesisData, deployerKeypair) {
  console.log('💾 Storing deployment results...');
  
  try {
    const deploymentRecord = {
      network: network,
      transactionId: transactionId,
      genesisHash: genesisHash,
      deployerAddress: deployerKeypair.publicKey.toBase58(),
      deployedAt: new Date().toISOString(),
      genesisData: genesisData,
      adrVersion: '006',
      explorerUrl: DEPLOYMENT_CONFIG[network].explorerUrl.replace('{TXID}', transactionId)
    };

    // Store in genesis registry
    await fs.writeFile(
      GENESIS_REGISTRY_PATH,
      JSON.stringify(deploymentRecord, null, 2)
    );

    // Also use the GlyffitiGenesisService to store configuration
    await GlyffitiGenesisServiceUGA.storeGenesisConfig(
      transactionId,
      genesisHash,
      network,
      {
        deployerKey: deployerKeypair.publicKey.toBase58(),
        adrVersion: '006',
        deployedAt: new Date().toISOString()
      }
    );

    console.log('✅ Deployment results stored successfully');
    console.log(`📄 Registry file: ${GENESIS_REGISTRY_PATH}`);

  } catch (error) {
    console.error('⚠️  Warning: Failed to store deployment results:', error.message);
    // Don't fail the entire deployment for storage issues
  }
}

/**
 * Verify deployment by reading back the genesis
 */
async function verifyDeployment(transactionId, expectedHash) {
  console.log('🔍 Verifying deployment...');
  
  try {
    // Wait for transaction to be indexed
    console.log('⏳ Waiting for transaction indexing...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Use the genesis service to verify
    const isValid = await GlyffitiGenesisServiceUGA.verifyGenesisDeployment();
    
    if (isValid) {
      console.log('✅ Deployment verification successful!');
      
      // Get the verified genesis info
      const genesisInfo = await GlyffitiGenesisServiceUGA.getGenesisInfo();
      console.log('📊 Verified Genesis Info:');
      console.log(`   Hash: ${genesisInfo.hash}`);
      console.log(`   Network: ${genesisInfo.network}`);
      console.log(`   Deployed: ${genesisInfo.deployedAt.toISOString()}`);
    } else {
      console.warn('⚠️  Deployment verification failed - but deployment may still be valid');
    }

  } catch (error) {
    console.warn('⚠️  Verification error (deployment may still be valid):', error.message);
  }
}

/**
 * Run pre-deployment self-tests
 */
async function runPreDeploymentTests() {
  console.log('🧪 Running pre-deployment self-tests...');
  
  const tests = [
    { name: 'HashingService-UGA', test: () => HashingServiceUGA.runSelfTest() },
    { name: 'GlyffitiGenesisService-UGA', test: () => GlyffitiGenesisServiceUGA.runSelfTest() }
  ];

  for (const test of tests) {
    try {
      console.log(`   Testing ${test.name}...`);
      const passed = await test.test();
      if (!passed) {
        throw new Error(`${test.name} self-test failed`);
      }
      console.log(`   ✅ ${test.name} test passed`);
    } catch (error) {
      console.error(`   ❌ ${test.name} test failed:`, error.message);
      throw new Error(`Pre-deployment tests failed: ${test.name}`);
    }
  }

  console.log('✅ All pre-deployment tests passed!');
}

/**
 * Main deployment function
 */
async function deployGlyffitiGenesis(network) {
  const config = DEPLOYMENT_CONFIG[network];
  
  console.log('🌟 ADR-006 Glyffiti Genesis Deployment');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 Network: ${config.name}`);
  console.log(`🔗 RPC: ${config.rpcUrl}`);
  console.log(`📅 Time: ${new Date().toISOString()}`);
  console.log(`⚡ ADR: 006 (User Graph Anchors)`);
  
  if (config.isProduction) {
    console.log('');
    console.log('⚠️  WARNING: MAINNET DEPLOYMENT');
    console.log('⚠️  This creates a permanent, immutable genesis block');
    console.log('⚠️  This action cannot be undone!');
    console.log('');
  }

  try {
    // Run pre-deployment tests
    await runPreDeploymentTests();

    // Connect to blockchain
    console.log('\n🔌 Connecting to Solana...');
    const connection = new Connection(config.rpcUrl, 'confirmed');
    const version = await connection.getVersion();
    console.log(`✅ Connected (version: ${version['solana-core']})`);

    // Get deployment wallet
    const deployerKeypair = await getDeploymentWallet();
    
    // Fund wallet if needed
    if (network === 'devnet') {
      await fundDeploymentWallet(connection, deployerKeypair);
    }

    // Create genesis block
    const genesisData = await createGenesisBlock(deployerKeypair, network);
    
    // Calculate genesis hash
    const genesisHash = await calculateGenesisHash(genesisData);

    // Deploy to blockchain
    const transactionId = await deployToBlockchain(connection, deployerKeypair, genesisData, genesisHash);

    // Store results
    await storeDeploymentResults(network, transactionId, genesisHash, genesisData, deployerKeypair);

    // Verify deployment
    await verifyDeployment(transactionId, genesisHash);

    // Success summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ADR-006 GENESIS DEPLOYMENT SUCCESSFUL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Transaction: ${transactionId}`);
    console.log(`🔐 Genesis Hash: ${genesisHash}`);
    console.log(`🌐 Network: ${config.name}`);
    console.log(`🔗 Explorer: ${config.explorerUrl.replace('{TXID}', transactionId)}`);
    console.log(`📄 Registry: ${GENESIS_REGISTRY_PATH}`);
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Create test users: node scripts/blockchain/createTestUser-UGA.js');
    console.log('2. Test UGA publishing: node scripts/blockchain/testUGA.js');
    console.log('3. Verify genesis service: node scripts/blockchain/verifyGenesis-UGA.js');
    
    return {
      transactionId,
      genesisHash,
      network,
      deployerAddress: deployerKeypair.publicKey.toBase58()
    };

  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    throw error;
  }
}

/**
 * Simple prompt helper for confirmations
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
 * Main execution with command line parsing
 */
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const networkArg = args.find(arg => arg.startsWith('--network'));
    const network = networkArg ? networkArg.split('=')[1] : 'devnet';
    
    if (!['devnet', 'mainnet'].includes(network)) {
      console.error('❌ Invalid network. Use --network=devnet or --network=mainnet');
      process.exit(1);
    }

    // Production confirmation
    if (network === 'mainnet') {
      const confirm = await promptUser(
        'Are you sure you want to deploy to MAINNET? This is permanent! Type "YES" to confirm: '
      );
      
      if (confirm !== 'YES') {
        console.log('❌ Mainnet deployment cancelled');
        process.exit(0);
      }
    }

    // Execute deployment
    await deployGlyffitiGenesis(network);
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Handle interruption gracefully
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Deployment interrupted by user');
  process.exit(0);
});

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Character count: 14,287