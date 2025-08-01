// scripts/blockchain/findWallet.js
// Path: scripts/blockchain/findWallet.js
// Find and export your existing app wallet for deployment use

const { Connection, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs').promises;

async function findExistingWallet() {
  console.log('🔍 Looking for your existing app wallet...\n');
  
  // Common places where Expo/React Native apps store wallet data
  const possibleLocations = [
    // Add more locations based on how your app stores wallets
    './wallet.json',
    './keypair.json', 
    './deployer-devnet.json',
    '../wallet.json'
  ];
  
  console.log('📁 Checking common wallet locations:');
  
  for (const location of possibleLocations) {
    try {
      console.log(`   ${location}...`);
      const walletData = await fs.readFile(location, 'utf8');
      const secretKey = new Uint8Array(JSON.parse(walletData));
      const { Keypair } = require('@solana/web3.js');
      const keypair = Keypair.fromSecretKey(secretKey);
      
      console.log(`✅ Found wallet at ${location}`);
      console.log(`   Public Key: ${keypair.publicKey.toBase58()}`);
      
      // Check balance
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const balance = await connection.getBalance(keypair.publicKey);
      console.log(`   Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
      
      if (balance > 0) {
        console.log(`🎉 This wallet has SOL! You can use this for deployment.`);
        return { keypair, location, balance };
      } else {
        console.log(`⚠️  This wallet has no SOL.`);
      }
      
    } catch (error) {
      console.log(`   ❌ Not found or invalid`);
    }
  }
  
  console.log('\n💡 No existing funded wallets found.');
  console.log('Options:');
  console.log('1. Create a new wallet and fund it manually');
  console.log('2. Export your wallet from your Expo app');
  console.log('3. Use the web faucet: https://faucet.solana.com');
  
  return null;
}

async function createAndSaveWallet() {
  console.log('\n🔑 Creating new wallet for manual funding...');
  
  const { Keypair } = require('@solana/web3.js');
  const keypair = Keypair.generate();
  const secretKeyArray = Array.from(keypair.secretKey);
  
  // Save to file
  const walletPath = './scripts/blockchain/deployment-wallet.json';
  await fs.writeFile(walletPath, JSON.stringify(secretKeyArray, null, 2));
  
  console.log(`✅ New wallet created and saved to: ${walletPath}`);
  console.log(`📝 Public Key: ${keypair.publicKey.toBase58()}`);
  console.log(`💰 Balance: 0.0000 SOL`);
  
  console.log('\n📋 To fund this wallet:');
  console.log(`1. Go to: https://faucet.solana.com`);
  console.log(`2. Enter this address: ${keypair.publicKey.toBase58()}`);
  console.log(`3. Request devnet SOL`);
  console.log(`4. Run the deployment script again`);
  
  return { keypair, location: walletPath, balance: 0 };
}

async function main() {
  console.log('🏦 Glyffiti Wallet Manager\n');
  
  const existingWallet = await findExistingWallet();
  
  if (!existingWallet) {
    await createAndSaveWallet();
  }
}

if (require.main === module) {
  main();
}

module.exports = { findExistingWallet, createAndSaveWallet };

// Character count: 2,847