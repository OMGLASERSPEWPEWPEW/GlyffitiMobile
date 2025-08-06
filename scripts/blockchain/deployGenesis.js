// scripts/blockchain/deployGenesis.mjs
// Path: scripts/blockchain/deployGenesis.mjs
// Official Glyffiti Genesis Block Deployment Script
// 
// ⚠️  IMPORTANT: This creates the permanent, official genesis block for Glyffiti
// Once deployed to mainnet, this becomes the root of the entire social network
// 
// Usage:
//   node scripts/blockchain/deployGenesis.mjs --network devnet    # For testing
//   node scripts/blockchain/deployGenesis.mjs --network mainnet   # For production (PERMANENT!)

import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Import our secure genesis block models
// Note: These paths will need to be adjusted based on your actual file structure
import { GlyffitiGenesisBlock, GenesisBlockFactory } from '../../src/services/blockchain/shared/models/GenesisBlock.js';
import { SolanaMemoBuilder } from '../../src/services/blockchain/solana/utils/SolanaMemoBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Glyffiti Genesis Deployment Configuration
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
 * Genesis deployment results storage
 */
const GENESIS_REGISTRY_PATH = path.join(__dirname, 'genesis-registry.json');

/**
 * Load or create genesis registry
 */
async function loadGenesisRegistry() {
  try {
    const registryData = await fs.readFile(GENESIS_REGISTRY_PATH, 'utf8');
    return JSON.parse(registryData);
  } catch (error) {
    // File doesn't exist, create new registry
    return {
      deployments: {},
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Save genesis registry
 */
async function saveGenesisRegistry(registry) {
  registry.lastUpdated = new Date().toISOString();
  await fs.writeFile(GENESIS_REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

/**
 * Load or generate deployer keypair
 */
async function getDeployerKeypair(network) {
  const keypairPath = path.join(__dirname, `deployer-${network}.json`);
  
  try {
    // Try to load existing deployer keypair
    const keypairData = await fs.readFile(keypairPath, 'utf8');
    const secretKey = new Uint8Array(JSON.parse(keypairData));
    const keypair = Keypair.fromSecretKey(secretKey);
    
    console.log(`📂 Loaded existing deployer keypair: ${keypair.publicKey.toBase58()}`);
    return keypair;
    
  } catch (error) {
    // Generate new deployer keypair
    const keypair = Keypair.generate();
    const secretKeyArray = Array.from(keypair.secretKey);
    
    // Save for future use
    await fs.writeFile(keypairPath, JSON.stringify(secretKeyArray, null, 2));
    
    console.log(`🔑 Generated new deployer keypair: ${keypair.publicKey.toBase58()}`);
    console.log(`💾 Saved keypair to: ${keypairPath}`);
    
    return keypair;
  }
}

/**
 * Check account balance and request funding if needed
 */
async function ensureFunding(connection, keypair, network) {
  const balance = await connection.getBalance(keypair.publicKey);
  const balanceSOL = balance / LAMPORTS_PER_SOL;
  
  console.log(`💰 Current balance: ${balanceSOL.toFixed(4)} SOL`);
  
  if (balance < 1000000) { // Less than 0.001 SOL
    if (network === 'devnet') {
      console.log('💧 Low balance detected, requesting devnet airdrop...');
      try {
        const airdropSignature = await connection.requestAirdrop(
          keypair.publicKey, 
          1 * LAMPORTS_PER_SOL
        );
        
        console.log(`⏳ Airdrop requested: ${airdropSignature}`);
        
        // Wait for airdrop confirmation
        await connection.confirmTransaction(airdropSignature, 'confirmed');
        
        const newBalance = await connection.getBalance(keypair.publicKey);
        console.log(`✅ Airdrop confirmed! New balance: ${(newBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        
      } catch (airdropError) {
        console.log('⚠️  Airdrop failed:', airdropError.message);
        console.log('💡 You may need to request devnet SOL from https://faucet.solana.com');
      }
    } else {
      console.log('⚠️  Insufficient mainnet SOL for deployment!');
      console.log('💡 Please fund this address with SOL:', keypair.publicKey.toBase58());
      console.log('📖 You can use Phantom, Solflare, or any Solana wallet');
      process.exit(1);
    }
  }
}

/**
 * Confirm production deployment
 */
async function confirmProductionDeployment(network) {
  if (network !== 'mainnet') return true;
  
  console.log('\n🚨 PRODUCTION DEPLOYMENT WARNING 🚨');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔴 You are about to deploy the OFFICIAL Glyffiti Genesis Block to Solana MAINNET');
  console.log('🔴 This action is PERMANENT and IRREVERSIBLE');
  console.log('🔴 This will become the root of the entire Glyffiti social network');
  console.log('🔴 All future users and posts will link back to this genesis block');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📝 Please confirm by typing "I UNDERSTAND" (case sensitive):');
  
  // Read from stdin
  process.stdout.write('> ');
  
  return new Promise((resolve) => {
    process.stdin.once('data', (data) => {
      const input = data.toString().trim();
      if (input === 'I UNDERSTAND') {
        console.log('✅ Confirmation received. Proceeding with deployment...\n');
        resolve(true);
      } else {
        console.log('❌ Confirmation not received. Deployment cancelled for safety.');
        console.log('💡 Run again with "I UNDERSTAND" if you really want to deploy to mainnet.');
        resolve(false);
      }
    });
  });
}

/**
 * Deploy the Glyffiti Genesis Block
 */
async function deployGlyffitiGenesis(network) {
  try {
    console.log('🌟 Glyffiti Genesis Block Deployment');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Load deployment configuration
    const config = DEPLOYMENT_CONFIG[network];
    if (!config) {
      throw new Error(`Unknown network: ${network}. Use 'devnet' or 'mainnet'`);
    }
    
    console.log(`🌐 Network: ${config.name}`);
    console.log(`🔗 RPC: ${config.rpcUrl}`);
    console.log(`📅 Time: ${new Date().toISOString()}\n`);
    
    // Production safety check
    if (config.requiresConfirmation) {
      const confirmed = await confirmProductionDeployment(network);
      if (!confirmed) {
        process.exit(0);
      }
    }
    
    // Load genesis registry
    const registry = await loadGenesisRegistry();
    
    // Check if genesis already deployed on this network
    if (registry.deployments[network]) {
      console.log(`⚠️  Genesis already deployed on ${network}:`);
      console.log(`📝 Transaction: ${registry.deployments[network].transactionHash}`);
      console.log(`📅 Deployed: ${registry.deployments[network].deployedAt}`);
      console.log(`👤 Deployer: ${registry.deployments[network].deployerPublicKey}`);
      
      if (config.isProduction) {
        console.log('\n🔴 Cannot redeploy genesis on mainnet - it already exists!');
        process.exit(1);
      } else {
        console.log('\n⚠️  Genesis exists on devnet. Continue anyway? (y/N)');
        process.stdout.write('> ');
        
        const continueAnyway = await new Promise((resolve) => {
          process.stdin.once('data', (data) => {
            resolve(data.toString().trim().toLowerCase() === 'y');
          });
        });
        
        if (!continueAnyway) {
          console.log('❌ Deployment cancelled.');
          process.exit(0);
        }
      }
    }
    
    // Connect to Solana
    console.log('🔌 Connecting to Solana...');
    const connection = new Connection(config.rpcUrl, 'confirmed');
    
    // Test connection
    const version = await connection.getVersion();
    console.log(`✅ Connected to Solana (version: ${version['solana-core']})`);
    
    // Load or generate deployer keypair
    console.log('\n🔑 Setting up deployer account...');
    const deployerKeypair = await getDeployerKeypair(network);
    
    // Ensure funding
    await ensureFunding(connection, deployerKeypair, network);
    
    // Run security self-tests
    console.log('\n🧪 Running security self-tests...');
    const securityTestPassed = await GenesisBlockFactory.runSelfTest();
    if (!securityTestPassed) {
      throw new Error('Security self-test failed! Cannot deploy with broken security.');
    }
    console.log('✅ Security systems validated');
    
    // Create the memo builder
    const memoBuilder = new SolanaMemoBuilder(connection);
    
    // Test memo builder
    const builderTestPassed = await SolanaMemoBuilder.runSelfTest();
    if (!builderTestPassed) {
      throw new Error('Memo builder self-test failed! Cannot deploy.');
    }
    console.log('✅ Memo builder validated');
    
    // Deploy the genesis block
    console.log('\n🚀 Deploying Glyffiti Genesis Block...');
    console.log('⏳ This may take a few moments...\n');
    
    const genesisTransactionHash = await memoBuilder.deployGlyffitiGenesis(deployerKeypair);
    
    // Verify deployment by reading it back
    console.log('\n🔍 Verifying deployment...');
    const verifiedGenesis = await memoBuilder.readGenesisFromTransaction(genesisTransactionHash);


    // ⭐ ADD THESE LINES HERE ⭐
    console.log('\n📖 Retrieved Genesis Block Contents:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Full Genesis Object:');
    console.log(JSON.stringify(verifiedGenesis, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📝 Kind: ${verifiedGenesis.kind}`);
    console.log(`🔢 Version: ${verifiedGenesis.ver}`);
    console.log(`⏰ Timestamp: ${verifiedGenesis.ts} (${new Date(verifiedGenesis.ts * 1000).toISOString()})`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    
    if (verifiedGenesis.kind !== 'glyf_genesis') {
      throw new Error('Deployment verification failed - could not read genesis back from blockchain');
    }
    
    console.log('✅ Deployment verified successfully!');
    
    // Record deployment in registry
    const deploymentRecord = {
      network,
      transactionHash: genesisTransactionHash,
      deployedAt: new Date().toISOString(),
      deployerPublicKey: deployerKeypair.publicKey.toBase58(),
      genesisTimestamp: verifiedGenesis.ts,
      genesisVersion: verifiedGenesis.ver,
      explorerUrl: config.explorerUrl.replace('{TXID}', genesisTransactionHash),
      networkConfig: config
    };
    
    registry.deployments[network] = deploymentRecord;
    await saveGenesisRegistry(registry);
    
    // Success summary
    console.log('\n🎉 GLYFFITI GENESIS DEPLOYMENT SUCCESSFUL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 Network: ${config.name}`);
    console.log(`📝 Genesis Transaction: ${genesisTransactionHash}`);
    console.log(`🔗 Explorer: ${deploymentRecord.explorerUrl}`);
    console.log(`👤 Deployer: ${deployerKeypair.publicKey.toBase58()}`);
    console.log(`📅 Deployed: ${deploymentRecord.deployedAt}`);
    console.log(`🛡️  Genesis Timestamp: ${verifiedGenesis.ts}`);
    console.log(`📊 Security: Field Obfuscation + Compression + Encryption + Integrity Hash`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (config.isProduction) {
      console.log('\n🎨 This is now the OFFICIAL root of the Glyffiti social network!');
      console.log('🎭 All artists who join will link back to this genesis block');
      console.log('💰 Every fair payment to creators stems from this moment');
      console.log('🔒 Protected by military-grade encryption and blockchain immutability');
    } else {
      console.log('\n🧪 This is a development deployment for testing');
      console.log('💡 Use this genesis hash to test user account creation');
      console.log('⚠️  Do not use this for production - deploy to mainnet when ready');
    }
    
    console.log('\n📋 Next Steps:');
    console.log(`1. Update your app configuration with genesis hash: ${genesisTransactionHash}`);
    console.log('2. Test user account creation using this genesis');
    console.log('3. Verify the full social graph functionality');
    if (!config.isProduction) {
      console.log('4. When ready, deploy to mainnet for production use');
    }
    
    return deploymentRecord;
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`Error: ${error.message}`);
    if (error.stack) {
      console.error(`Stack: ${error.stack}`);
    }
    console.error('\n💡 Troubleshooting tips:');
    console.error('- Check your internet connection');
    console.error('- Ensure the RPC endpoint is responding');
    console.error('- Verify account has sufficient SOL for transaction fees');
    console.error('- Check Solana network status');
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const networkArg = args.find(arg => arg.startsWith('--network='));
  const network = networkArg ? networkArg.split('=')[1] : 'devnet';
  
  if (!['devnet', 'mainnet'].includes(network)) {
    console.error('❌ Invalid network. Use --network=devnet or --network=mainnet');
    process.exit(1);
  }
  
  await deployGlyffitiGenesis(network);
}

// Handle uncaught errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  Deployment interrupted by user');
  process.exit(0);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Character count: 11,847