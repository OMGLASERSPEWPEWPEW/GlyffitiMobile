// scripts/blockchain/deployGenesis-UGA.js
// Path: scripts/blockchain/deployGenesis-UGA.js
// ADR-006 Enhanced Genesis Block Deployment Script
// 
// FIXED: This version follows the correct architectural pattern - no runtime service dependencies

import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Import the data model and memo builder utility - NO RUNTIME SERVICES
import { GlyffitiGenesisBlockUGA, UgaGenesisFactory } from '../../src/services/blockchain/shared/models/UgaGenesisBlock.js';
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

// Note: Domain separation and hashing are now handled by the UgaGenesisBlock model

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
        0.5 * LAMPORTS_PER_SOL
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
 * Uses the UgaGenesisBlock model for proper structure
 */
function createGenesisBlock(deployerKeypair, network) {
  console.log('🗿 Creating ADR-006 Glyffiti Genesis Block...');
  
  // Use the UgaGenesisFactory to create G₀
  const genesis = UgaGenesisFactory.createGlyffitiGenesis(network);
  
  // Log the genesis data
  console.log('📊 Genesis Block Data:');
  console.log(`   Version: ${genesis.version}`);
  console.log(`   Protocol: ${genesis.protocol}`);
  console.log(`   Network: ${genesis.network}`);
  console.log(`   ADR: ${genesis.adr}`);
  console.log(`   Timestamp: ${new Date(genesis.timestamp * 1000).toISOString()}`);

  return genesis;
}

/**
 * Calculate genesis hash using ADR-006 domain separation
 * Delegates to the model's built-in hash calculation
 */
function calculateGenesisHash(genesisBlock) {
  console.log('🔍 Calculating genesis hash with ADR-006 domain separation...');
  
  // Use the model's calculateHash method
  const genesisHash = genesisBlock.calculateHash();

  console.log('✅ Genesis hash calculated:', genesisHash.substring(0, 16) + '...');
  return genesisHash;
}

/**
 * Deploy genesis block to blockchain
 */
async function deployToBlockchain(connection, deployerKeypair, genesisBlock, genesisHash) {
  console.log('📡 Deploying genesis block to blockchain...');
  
  try {
    // Create memo builder
    const memoBuilder = new SolanaMemoBuilder(connection);

    // Get wire format data from the genesis block model
    const wireData = await genesisBlock.toMemoData();

    console.log(`📝 Wire format size: ${wireData.length} bytes`);
    
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
 * Store deployment results locally (no StorageService dependency)
 */
async function storeDeploymentResults(network, transactionId, genesisHash, genesisBlock, deployerKeypair) {
  console.log('💾 Storing deployment results...');
  
  try {
    const deploymentRecord = {
      network: network,
      transactionId: transactionId,
      genesisHash: genesisHash,
      deployerAddress: deployerKeypair.publicKey.toBase58(),
      deployedAt: new Date().toISOString(),
      genesisData: {
        kind: genesisBlock.kind,
        version: genesisBlock.version,
        protocol: genesisBlock.protocol,
        network: genesisBlock.network,
        timestamp: genesisBlock.timestamp,
        adr: genesisBlock.adr
      },
      adrVersion: '006',
      explorerUrl: DEPLOYMENT_CONFIG[network].explorerUrl.replace('{TXID}', transactionId)
    };

    // Store in local genesis registry file
    await fs.writeFile(
      GENESIS_REGISTRY_PATH,
      JSON.stringify(deploymentRecord, null, 2)
    );

    console.log('✅ Deployment results stored successfully');
    console.log(`📄 Registry file: ${GENESIS_REGISTRY_PATH}`);

  } catch (error) {
    console.error('⚠️  Warning: Failed to store deployment results:', error.message);
    // Don't fail the entire deployment for storage issues
  }
}

/**
 * Main deployment function
 */
async function deployGlyffitiGenesis(network) {
  const config = DEPLOYMENT_CONFIG[network];
  
  console.log('🌟 ADR-006 Glyffiti Genesis Deployment');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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

    // Create genesis block using the model
    const genesisBlock = createGenesisBlock(deployerKeypair, network);
    
    // Calculate genesis hash using the model
    const genesisHash = calculateGenesisHash(genesisBlock);

    // Deploy to blockchain using the model
    const transactionId = await deployToBlockchain(connection, deployerKeypair, genesisBlock, genesisHash);

    // Store results
    await storeDeploymentResults(network, transactionId, genesisHash, genesisBlock, deployerKeypair);

    // Success summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ADR-006 GENESIS DEPLOYMENT SUCCESSFUL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Transaction: ${transactionId}`);
    console.log(`🔍 Genesis Hash: ${genesisHash}`);
    console.log(`🌐 Network: ${config.name}`);
    console.log(`🔗 Explorer: ${config.explorerUrl.replace('{TXID}', transactionId)}`);
    console.log(`📄 Registry: ${GENESIS_REGISTRY_PATH}`);
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Create test users: node scripts/blockchain/createTestUser-UGA.js');
    console.log('2. Test UGA publishing: node scripts/blockchain/testUGA.js');
    console.log('3. Update src/config/genesis-uga.json with the transaction ID');
    
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

// Just run it - no fancy checks
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

// Character count: 13,256