// src/services/wallet/MobileWalletService.js
import 'react-native-get-random-values';
import { Keypair } from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class MobileWalletService {
  static async createWallet() {
    try {
      // This will now work with the crypto polyfill
      const keypair = Keypair.generate();
      
      const walletData = {
        publicKey: keypair.publicKey.toString(),
        secretKey: Array.from(keypair.secretKey), // Store as array for JSON
      };
      
      await AsyncStorage.setItem('solana_wallet', JSON.stringify(walletData));
      
      console.log('Wallet created successfully:', walletData.publicKey);
      return walletData;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }
  
  static async getWalletKeypair() {
    try {
      const walletData = await AsyncStorage.getItem('solana_wallet');
      if (walletData) {
        const wallet = JSON.parse(walletData);
        return Keypair.fromSecretKey(new Uint8Array(wallet.secretKey));
      }
      throw new Error('No wallet found');
    } catch (error) {
      console.error('Error getting wallet keypair:', error);
      throw error;
    }
  }
  
  static async getWalletPublicKey() {
    try {
      const walletData = await AsyncStorage.getItem('solana_wallet');
      if (walletData) {
        const wallet = JSON.parse(walletData);
        return wallet.publicKey;
      }
      
      // Create new wallet if none exists
      const newWallet = await this.createWallet();
      return newWallet.publicKey;
    } catch (error) {
      console.error('Error getting wallet public key:', error);
      throw error;
    }
  }
  
  static async deleteWallet() {
    try {
      await AsyncStorage.removeItem('solana_wallet');
      console.log('Wallet deleted successfully');
    } catch (error) {
      console.error('Error deleting wallet:', error);
      throw error;
    }
  }
}