// src/services/wallet/SolanaAirdropService.js
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

export class SolanaAirdropService {
  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  }
  
  // Request airdrop from Solana devnet faucet
  async requestAirdrop(publicKey, solAmount = 1) {
    try {
      console.log(`Requesting ${solAmount} SOL airdrop for: ${publicKey.toString()}`);
      
      const lamports = solAmount * LAMPORTS_PER_SOL;
      const signature = await this.connection.requestAirdrop(publicKey, lamports);
      
      console.log('Airdrop signature:', signature);
      
      // Wait for confirmation
      await this.connection.confirmTransaction(signature);
      
      console.log(`Successfully received ${solAmount} SOL airdrop`);
      return signature;
    } catch (error) {
      console.error('Airdrop error:', error);
      throw new Error('Failed to request airdrop: ' + error.message);
    }
  }
  
  // Get current balance
  async getBalance(publicKey) {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Balance error:', error);
      return 0;
    }
  }
  
  // Check if wallet needs airdrop
  async needsAirdrop(publicKey, minimumSOL = 0.01) {
    try {
      const balance = await this.getBalance(publicKey);
      return balance < minimumSOL;
    } catch (error) {
      console.error('Balance check error:', error);
      return true; // Assume needs airdrop if can't check
    }
  }
}

// File length: 1,347 characters