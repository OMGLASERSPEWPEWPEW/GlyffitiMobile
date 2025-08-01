// scripts/blockchain/deployGenesis.js
// Path: scripts/blockchain/deployGenesis.js
// Simple CommonJS version - no ES module complications

const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs').promises;
const path = require('path');

// We'll inline the Genesis Block logic here to avoid import issues
// This is simpler than trying to import from React Native modules

// Copy the working cipher from our tests
const CIPHER_KEY = new Uint8Array([0x47, 0x4C, 0x59, 0x46, 0x46, 0x49, 0x54, 0x49]); // "GLYFFITI"
const FIELD_MAP = { kind: 'a', ver: 'b', ts: 'c', alias: 'd', parent: 'e', pub: 'f' };
const VALUE_MAP = { 'glyf_genesis': 'gg', 'user_genesis': 'ug' };

// Simple compression service using pako
const pako = require('pako');
const crypto = require('crypto');

const CompressionService = {
  compress(data) {
    const textEncoder = new TextEncoder();
    const dataBytes = textEncoder.encode(data);
    return pako.deflate(dataBytes, { level: 6, windowBits: 15, memLevel: 8 });
  },

  decompress(compressedData) {
    const decompressed = pako.inflate(compressedData);
    const textDecoder = new TextDecoder();
    return textDecoder.decode(decompressed);
  },

  uint8ArrayToBase64(uint8Array) {
    return Buffer.from(uint8Array).toString('base64');
  },

  base64ToUint8Array(base64) {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
};

const HashingService = {
  async hashContent(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
};

// Security Utils
class SecurityUtils {
  static obfuscateFields(obj) {
    const obfuscated = {};
    for (const [key, value] of Object.entries(obj)) {
      const obfuscatedKey = FIELD_MAP[key] || key;
      const obfuscatedValue = VALUE_MAP[value] || value;
      obfuscated[obfuscatedKey] = obfuscatedValue;
    }
    return obfuscated;
  }

  static encrypt(data) {
    const encrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const keyByte = CIPHER_KEY[i % CIPHER_KEY.length];
      const xored = data[i] ^ keyByte ^ (i & 0xFF);
      const swapped = ((xored & 0x0F) << 4) | ((xored & 0xF0) >> 4);
      encrypted[i] = swapped ^ 0xAA;
    }
    return encrypted;
  }

  static async createIntegrityHash(data) {
    const hashString = await HashingService.hashContent(data);
    const hashBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      hashBytes[i] = parseInt(hashString.slice(i * 2, i * 2 + 2), 16);
    }
    return hashBytes;
  }
}

// Simple Genesis Block class for deployment
class GlyffitiGenesisBlock {
  constructor() {
    this.kind = 'glyf_genesis';
    this.ver = 1;
    this.ts = Math.floor(Date.now() / 1000);
  }

  toJSON() {
    const original = { kind: this.kind, ver: this.ver, ts: this.ts };
    const obfuscated = SecurityUtils.obfuscateFields(original);
    return JSON.stringify(obfuscated);
  }

  async toMemoData() {
    try {
      const jsonString = this.toJSON();
      console.log('🏗️ Genesis block (obfuscated):', jsonString);
      
      const compressedData = CompressionService.compress(jsonString);
      console.log('📦 Compressed size:', compressedData.length, 'bytes');
      
      const encryptedData = SecurityUtils.encrypt(compressedData);
      console.log('🔒 Encrypted size:', encryptedData.length, 'bytes');
      
      const integrityHash = await SecurityUtils.createIntegrityHash(encryptedData);
      console.log('🛡️ Integrity hash created (32 bytes)');
      
      const wireFormat = new Uint8Array(1 + 32 + encryptedData.length);
      wireFormat[0] = 0x01;
      wireFormat.set(integrityHash, 1);
      wireFormat.set(encryptedData, 33);
      
      console.log('📡 Final wire format size:', wireFormat.length, 'bytes');
      
      if (wireFormat.length > 566) {
        throw new Error(`Genesis block too large: ${wireFormat.length} bytes (max 566)`);
      }
      
      return wireFormat;
    } catch (error) {
      console.error('❌ Error creating secure genesis memo data:', error);
      throw new Error('Failed to create secure genesis memo data: ' + error.message);
    }
  }
}

// Simple Memo Builder
class SolanaMemoBuilder {
  constructor(connection) {
    this.connection = connection || new Connection('https://api.devnet.solana.com', 'confirmed');
    // Import PublicKey locally to avoid scope issues
    const { PublicKey } = require('@solana/web3.js');
    this.MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
  }

  async deployGlyffitiGenesis(deployerKeypair) {
    try {
      console.log('🌟 Deploying Secure Glyffiti Genesis Block...');
      
      if (!deployerKeypair) {
        throw new Error('Deployer keypair is required for genesis deployment');
      }

      console.log('📝 Creating genesis block...');
      const genesisBlock = new GlyffitiGenesisBlock();
      
      console.log('🔄 Generating memo data...');
      const wireData = await genesisBlock.toMemoData();
      console.log(`📡 Secure genesis wire format size: ${wireData.length} bytes`);
      
      console.log('🔨 Building transaction...');
      const transaction = await this.buildMemoTransaction(wireData, deployerKeypair);
      
      console.log('📤 Submitting transaction...');
      const signature = await this.submitTransactionWithRetries(transaction, deployerKeypair);
      
      console.log('✅ Secure Glyffiti Genesis deployed successfully!');
      console.log(`📝 Genesis Transaction Hash: ${signature}`);
      console.log('🔒 Genesis data is encrypted and obfuscated on-chain');
      
      return signature;
    } catch (error) {
      console.error('❌ Failed to deploy Secure Glyffiti Genesis:', error.message);
      console.error('Stack:', error.stack);
      throw new Error('Failed to deploy Secure Glyffiti Genesis: ' + error.message);
    }
  }

  async buildMemoTransaction(wireData, signerKeypair) {
    try {
      console.log('⚙️ Building memo transaction...');
      const { Transaction, TransactionInstruction } = require('@solana/web3.js');
      
      const transaction = new Transaction();
      const memoData = Buffer.from(wireData);
      
      console.log(`📄 Memo data size: ${memoData.length} bytes`);
      
      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: this.MEMO_PROGRAM_ID,
        data: memoData
      });
      
      transaction.add(memoInstruction);
      
      console.log('🔗 Getting latest blockhash...');
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = signerKeypair.publicKey;
      
      console.log(`✅ Transaction built with blockhash: ${blockhash.slice(0, 8)}...`);
      return transaction;
    } catch (error) {
      console.error('❌ Error building memo transaction:', error.message);
      console.error('Stack:', error.stack);
      throw new Error('Failed to build memo transaction: ' + error.message);
    }
  }

  async submitTransactionWithRetries(transaction, signerKeypair) {
    const maxRetries = 3;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`📤 Submitting transaction (attempt ${attempt + 1}/${maxRetries})`);
        
        if (attempt > 0) {
          console.log('🔄 Getting fresh blockhash for retry...');
          const { blockhash } = await this.connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
        }
        
        console.log('✍️  Signing transaction...');
        transaction.sign(signerKeypair);
        
        console.log('📡 Sending raw transaction...');
        const signature = await this.connection.sendRawTransaction(
          transaction.serialize(),
          { skipPreflight: false, preflightCommitment: 'confirmed' }
        );
        
        console.log(`⏳ Transaction submitted, waiting for confirmation: ${signature}`);
        
        console.log('⏰ Confirming transaction...');
        const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
        
        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
        }
        
        console.log(`✅ Transaction confirmed: ${signature}`);
        return signature;
        
      } catch (error) {
        console.error(`❌ Attempt ${attempt + 1} failed:`, error.message);
        console.error('Error details:', error.stack);
        
        if (attempt >= maxRetries - 1) {
          throw new Error(`Transaction failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        console.log(`⏳ Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
}

// Deployment configuration
const DEPLOYMENT_CONFIG = {
  devnet: {
    name: 'Solana Devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com/tx/{TXID}?cluster=devnet',
    isProduction: false
  },
  mainnet: {
    name: 'Solana Mainnet',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com/tx/{TXID}',
    isProduction: true
  }
};

// Main deployment function
async function deployGlyffitiGenesis(network) {
  try {
    console.log('🌟 Glyffiti Genesis Block Deployment');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const config = DEPLOYMENT_CONFIG[network];
    if (!config) {
      throw new Error(`Unknown network: ${network}. Use 'devnet' or 'mainnet'`);
    }
    
    console.log(`🌐 Network: ${config.name}`);
    console.log(`🔗 RPC: ${config.rpcUrl}`);
    console.log(`📅 Time: ${new Date().toISOString()}\n`);
    
    // Try to load existing wallet first
    console.log('🔑 Looking for existing deployment wallet...');
    let deployerKeypair;
    let isNewWallet = false;
    
    try {
      const walletPath = './scripts/blockchain/deployment-wallet.json';
      const walletData = await fs.readFile(walletPath, 'utf8');
      const secretKey = new Uint8Array(JSON.parse(walletData));
      deployerKeypair = Keypair.fromSecretKey(secretKey);
      console.log(`📂 Loaded existing wallet: ${deployerKeypair.publicKey.toBase58()}`);
    } catch (error) {
      // No existing wallet, generate new one
      deployerKeypair = Keypair.generate();
      isNewWallet = true;
      console.log(`🔑 Generated new deployer keypair: ${deployerKeypair.publicKey.toBase58()}`);
      
      // Save new wallet for future use
      try {
        const walletPath = './scripts/blockchain/deployment-wallet.json';
        const secretKeyArray = Array.from(deployerKeypair.secretKey);
        await fs.writeFile(walletPath, JSON.stringify(secretKeyArray, null, 2));
        console.log(`💾 Saved wallet to: ${walletPath}`);
      } catch (saveError) {
        console.log('⚠️  Could not save wallet (proceeding anyway)');
      }
    }
    
    // Connect to Solana
    console.log('🔌 Connecting to Solana...');
    const connection = new Connection(config.rpcUrl, 'confirmed');
    
    // Test connection
    const version = await connection.getVersion();
    console.log(`✅ Connected to Solana (version: ${version['solana-core']})`);
    
    // Check balance and request airdrop if needed (devnet only)
    const balance = await connection.getBalance(deployerKeypair.publicKey);
    console.log(`💰 Current balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
    
    if (balance < 1000000 && network === 'devnet') { // Less than 0.001 SOL
      console.log('💧 Insufficient SOL for deployment.');
      console.log('💡 Options:');
      console.log(`   1. Fund this address manually: ${deployerKeypair.publicKey.toBase58()}`);
      console.log('   2. Use web faucet: https://faucet.solana.com');
      console.log('   3. Try automatic airdrop (may be rate limited)');
      console.log('   4. Wait and try again later');
      
      // Ask user what they want to do
      console.log('\nChoose option (1-4) or press Enter to try airdrop:');
      process.stdout.write('> ');
      
      const choice = await new Promise((resolve) => {
        process.stdin.once('data', (data) => {
          resolve(data.toString().trim());
        });
      });
      
      if (choice === '1') {
        console.log('💰 Please fund the address above and run the script again.');
        return;
      } else if (choice === '2') {
        console.log('🌐 Opening web faucet instructions...');
        console.log('   1. Go to: https://faucet.solana.com');
        console.log(`   2. Enter: ${deployerKeypair.publicKey.toBase58()}`);
        console.log('   3. Request devnet SOL');
        console.log('   4. Run this script again');
        return;
      } else if (choice === '4') {
        console.log('⏰ Try running the script again in a few minutes.');
        return;
      }
      
      // Option 3 or Enter - try airdrop
      console.log('💧 Attempting automatic airdrop...');
      
      let airdropSuccess = false;
      let attempts = 0;
      const maxAirdropAttempts = 2; // Reduced attempts to fail faster
      
      while (!airdropSuccess && attempts < maxAirdropAttempts) {
        try {
          attempts++;
          console.log(`💧 Airdrop attempt ${attempts}/${maxAirdropAttempts}...`);
          
          const airdropSignature = await connection.requestAirdrop(
            deployerKeypair.publicKey, 
            1 * LAMPORTS_PER_SOL
          );
          
          console.log(`⏳ Airdrop submitted: ${airdropSignature}`);
          console.log('⏰ Waiting for airdrop confirmation...');
          
          await connection.confirmTransaction(airdropSignature, 'confirmed');
          
          // Check balance to confirm airdrop worked
          const newBalance = await connection.getBalance(deployerKeypair.publicKey);
          console.log(`✅ Airdrop confirmed! New balance: ${(newBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
          
          airdropSuccess = true;
          
        } catch (airdropError) {
          console.log(`⚠️  Airdrop attempt ${attempts} failed:`, airdropError.message);
          
          if (attempts < maxAirdropAttempts) {
            const delay = 3000; // 3 second delay
            console.log(`⏳ Waiting ${delay/1000}s before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            console.log('❌ Automatic airdrop failed.');
            console.log('💡 Please use the web faucet or fund the address manually:');
            console.log(`   Address: ${deployerKeypair.publicKey.toBase58()}`);
            console.log('   Web faucet: https://faucet.solana.com');
            throw new Error('Unable to fund deployment wallet');
          }
        }
      }
    } else if (balance >= 1000000) {
      console.log('✅ Wallet has sufficient SOL for deployment.');
    }
    
    // Deploy genesis
    console.log('\n🚀 Deploying genesis block...');
    const memoBuilder = new SolanaMemoBuilder(connection);
    const genesisTransactionHash = await memoBuilder.deployGlyffitiGenesis(deployerKeypair);
    
    // Success summary
    console.log('\n🎉 GLYFFITI GENESIS DEPLOYMENT SUCCESSFUL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 Network: ${config.name}`);
    console.log(`📝 Genesis Transaction: ${genesisTransactionHash}`);
    console.log(`🔗 Explorer: ${config.explorerUrl.replace('{TXID}', genesisTransactionHash)}`);
    console.log(`👤 Deployer: ${deployerKeypair.publicKey.toBase58()}`);
    console.log(`📅 Deployed: ${new Date().toISOString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n📋 Next Steps:');
    console.log(`1. Update your app configuration with genesis hash: ${genesisTransactionHash}`);
    console.log('2. Test user account creation using this genesis');
    console.log('3. Verify the full social graph functionality');
    
    return genesisTransactionHash;
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error('\n💡 Troubleshooting tips:');
    console.error('- Check your internet connection');
    console.error('- Ensure the RPC endpoint is responding');
    console.error('- Verify account has sufficient SOL for transaction fees');
    console.error('- Check Solana network status');
    process.exit(1);
  }
}

// Main execution
async function main() {
  // Enable stdin for user input
  process.stdin.setEncoding('utf8');
  
  const args = process.argv.slice(2);
  const networkArg = args.find(arg => arg.startsWith('--network='));
  const network = networkArg ? networkArg.split('=')[1] : 'devnet';
  
  if (!['devnet', 'mainnet'].includes(network)) {
    console.error('❌ Invalid network. Use --network=devnet or --network=mainnet');
    process.exit(1);
  }
  
  await deployGlyffitiGenesis(network);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { deployGlyffitiGenesis };

// Character count: 12,456