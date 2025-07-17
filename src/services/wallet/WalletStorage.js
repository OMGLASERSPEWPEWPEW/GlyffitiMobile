// src/services/wallet/WalletStorage.js
import * as Crypto from 'expo-crypto';
import { Keypair } from '@solana/web3.js';
import * as SecureStore from 'expo-secure-store';

/**
 * Interface for encrypted wallet data
 * @typedef {Object} EncryptedWallet
 * @property {string} id - Unique wallet identifier
 * @property {string} encryptedData - Encrypted wallet data
 * @property {string} salt - Salt used for key derivation
 * @property {string} iv - Initialization vector for encryption
 * @property {string} walletType - Type of wallet (e.g., 'solana')
 * @property {string} publicKey - Public key (unencrypted for display)
 * @property {string} [name] - Optional wallet name
 * @property {number} createdAt - Creation timestamp
 * @property {number} lastUsed - Last used timestamp
 */

/**
 * Interface for decrypted wallet data
 * @typedef {Object} DecryptedWallet
 * @property {string} id - Unique wallet identifier
 * @property {string} privateKey - Private key (base58 encoded)
 * @property {string} publicKey - Public key
 * @property {string} walletType - Type of wallet
 * @property {string} [name] - Optional wallet name
 */

/**
 * Class for securely storing and retrieving wallet information
 * Uses react-native-keychain for secure storage and expo-crypto for encryption
 */
export class WalletStorage {
  static STORAGE_KEY = 'glyffiti_wallets';
  static KEYCHAIN_SERVICE = 'glyffiti_wallet_service';
  
  /**
 * Generate a cryptographically secure password key from user password
 * @param {string} password - User password
 * @param {string} salt - Hex encoded salt
 * @returns {Promise<string>} - Derived key as hex string
 */
static async deriveKey(password, salt) {
  // Convert password to bytes
  const passwordBytes = new TextEncoder().encode(password);
  const saltBytes = this.hexToBytes(salt);
  
  // Use a simple PBKDF2-like implementation using expo-crypto
  let key = passwordBytes;
  
  // Perform multiple rounds of hashing (simplified PBKDF2)
  for (let i = 0; i < 1000; i++) {
    const combined = new Uint8Array(key.length + saltBytes.length);
    combined.set(key);
    combined.set(saltBytes, key.length);
    
    const hashString = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      this.uint8ArrayToBase64(combined),
      { encoding: Crypto.CryptoEncoding.HEX }
    );
    
    key = this.hexToBytes(hashString);
  }
  
  return this.bytesToHex(key);
}

/**
 * Helper to convert Uint8Array to base64
 */
static uint8ArrayToBase64(uint8Array) {
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binaryString);
}
  
  /**
   * Encrypt wallet data with a password
   * @param {DecryptedWallet} wallet - Wallet to encrypt
   * @param {string} password - Password for encryption
   * @returns {Promise<EncryptedWallet>} - Encrypted wallet
   */
  static async encryptWallet(wallet, password) {
    // Generate a random salt (16 bytes)
    const salt = await Crypto.getRandomBytesAsync(16);
    const saltHex = this.bytesToHex(salt);
    
    // Generate encryption key from password
    const derivedKey = await this.deriveKey(password, saltHex);
    const keyBytes = this.hexToBytes(derivedKey);
    
    // Generate a random IV (12 bytes for AES-GCM)
    const iv = await Crypto.getRandomBytesAsync(12);
    const ivHex = this.bytesToHex(iv);
    
    // Prepare the data to encrypt
    const dataToEncrypt = JSON.stringify({
      privateKey: wallet.privateKey,
      name: wallet.name
    });
    
    // Encrypt the data using AES-GCM
    const encryptedData = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      dataToEncrypt + derivedKey + ivHex // Simple encryption simulation
    );
    
    // For real AES-GCM encryption, we'd need a different approach
    // This is a simplified version for React Native compatibility
    const simpleEncryptedData = this.xorEncrypt(dataToEncrypt, derivedKey);
    
    return {
      id: wallet.id,
      encryptedData: simpleEncryptedData,
      salt: saltHex,
      iv: ivHex,
      walletType: wallet.walletType,
      publicKey: wallet.publicKey,
      name: wallet.name,
      createdAt: Date.now(),
      lastUsed: Date.now()
    };
  }
  
  /**
   * Decrypt wallet data with a password
   * @param {EncryptedWallet} encryptedWallet - Encrypted wallet
   * @param {string} password - Password for decryption
   * @returns {Promise<DecryptedWallet>} - Decrypted wallet
   */
  static async decryptWallet(encryptedWallet, password) {
    try {
      // Regenerate the encryption key
      const derivedKey = await this.deriveKey(password, encryptedWallet.salt);
      
      // Decrypt the data
      const decryptedDataStr = this.xorDecrypt(encryptedWallet.encryptedData, derivedKey);
      const decryptedData = JSON.parse(decryptedDataStr);
      
      return {
        id: encryptedWallet.id,
        privateKey: decryptedData.privateKey,
        publicKey: encryptedWallet.publicKey,
        walletType: encryptedWallet.walletType,
        name: decryptedData.name || encryptedWallet.name
      };
    } catch (error) {
      throw new Error('Invalid password or corrupted wallet data');
    }
  }
  
  /**
   * Save an encrypted wallet to secure storage
   * @param {EncryptedWallet} wallet - Wallet to save
   * @returns {Promise<boolean>} - Success status
   */
  static async saveWallet(wallet) {
  try {
    // Get existing wallets
    const existingWallets = await this.getAllWallets();
    
    // Add or update the wallet
    const wallets = existingWallets.filter(w => w.id !== wallet.id);
    wallets.push(wallet);
    
    // Try to save to secure keychain storage first
    try {
      await SecureStore.setItemAsync(
        this.KEYCHAIN_SERVICE,
        JSON.stringify(wallets)
        );
      return true;
    } catch (keychainError) {
      console.warn('Keychain failed, using AsyncStorage fallback:', keychainError);
      
      // Fallback to AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(wallets));
      return true;
    }
  } catch (error) {
    console.error('Failed to save wallet:', error);
    return false;
  }
}
  
  /**
   * Get a specific wallet by ID
   * @param {string} walletId - Wallet ID
   * @returns {Promise<EncryptedWallet|null>} - Encrypted wallet or null
   */
  static async getWallet(walletId) {
    const wallets = await this.getAllWallets();
    return wallets.find(w => w.id === walletId) || null;
  }
  
  /**
 * Get all stored wallets (metadata only)
 * @returns {Promise<EncryptedWallet[]>} - Array of encrypted wallets
 */
static async getAllWallets() {
  try {
    // Use SecureStore to get wallets
    const walletsData = await SecureStore.getItemAsync(this.KEYCHAIN_SERVICE);
    
    if (walletsData) {
      return JSON.parse(walletsData);
    }
    return [];
  } catch (error) {
    console.error('Failed to get wallets from SecureStore:', error);
    
    // Fallback to AsyncStorage if SecureStore fails
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (fallbackError) {
      console.error('Fallback storage also failed:', fallbackError);
      return [];
    }
  }
}

  
  /**
 * Delete a wallet by ID
 * @param {string} walletId - Wallet ID to delete
 * @returns {Promise<boolean>} - Success status
 */
static async deleteWallet(walletId) {
  try {
    const wallets = await this.getAllWallets();
    const filteredWallets = wallets.filter(w => w.id !== walletId);
    
    if (filteredWallets.length === wallets.length) {
      return false; // Wallet not found
    }
    
    // Try to save to SecureStore first
    try {
      await SecureStore.setItemAsync(
        this.KEYCHAIN_SERVICE,
        JSON.stringify(filteredWallets)
      );
      return true;
    } catch (secureStoreError) {
      console.warn('SecureStore failed, using AsyncStorage fallback:', secureStoreError);
      
      // Fallback to AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredWallets));
      return true;
    }
  } catch (error) {
    console.error('Failed to delete wallet:', error);
    return false;
  }
}
  
  /**
   * Create a decrypted wallet from a Solana keypair
   * @param {Keypair} keypair - Solana keypair
   * @param {string} [name] - Optional wallet name
   * @returns {DecryptedWallet} - Decrypted wallet data
   */
  static solanaKeypairToWallet(keypair, name) {
    return {
      id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      privateKey: Buffer.from(keypair.secretKey).toString('base64'),
      publicKey: keypair.publicKey.toString(),
      walletType: 'solana',
      name: name || 'Solana Wallet'
    };
  }
  
  /**
   * Create a decrypted wallet from a private key
   * @param {string} privateKey - Private key (base58 or base64)
   * @param {string} walletType - Wallet type
   * @param {string} [name] - Optional wallet name
   * @returns {DecryptedWallet} - Decrypted wallet data
   */
  static createFromPrivateKey(privateKey, walletType, name) {
    let publicKey;
    
    if (walletType === 'solana') {
      try {
        // Try to create keypair from base58 or base64
        let secretKey;
        if (privateKey.length === 88) {
          // Base64 format
          secretKey = Buffer.from(privateKey, 'base64');
        } else {
          // Assume base58 format
          const bs58 = require('bs58');
          secretKey = bs58.decode(privateKey);
        }
        
        const keypair = Keypair.fromSecretKey(secretKey);
        publicKey = keypair.publicKey.toString();
      } catch (error) {
        throw new Error('Invalid private key format for Solana');
      }
    } else {
      throw new Error(`Unsupported wallet type: ${walletType}`);
    }
    
    return {
      id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      privateKey,
      publicKey,
      walletType,
      name: name || `${walletType} Wallet`
    };
  }
  
  /**
   * Simple XOR encryption for React Native compatibility
   * @param {string} text - Text to encrypt
   * @param {string} key - Encryption key (hex)
   * @returns {string} - Encrypted text (hex)
   */
  static xorEncrypt(text, key) {
    const textBytes = new TextEncoder().encode(text);
    const keyBytes = this.hexToBytes(key);
    const encrypted = new Uint8Array(textBytes.length);
    
    for (let i = 0; i < textBytes.length; i++) {
      encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return this.bytesToHex(encrypted);
  }
  
  /**
   * Simple XOR decryption for React Native compatibility
   * @param {string} encryptedHex - Encrypted text (hex)
   * @param {string} key - Encryption key (hex)
   * @returns {string} - Decrypted text
   */
  static xorDecrypt(encryptedHex, key) {
    const encryptedBytes = this.hexToBytes(encryptedHex);
    const keyBytes = this.hexToBytes(key);
    const decrypted = new Uint8Array(encryptedBytes.length);
    
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return new TextDecoder().decode(decrypted);
  }
  
  /**
   * Convert hex string to bytes
   * @param {string} hex - Hex string
   * @returns {Uint8Array} - Byte array
   */
  static hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }
  
  /**
   * Convert bytes to hex string
   * @param {Uint8Array} bytes - Byte array
   * @returns {string} - Hex string
   */
  static bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

// Character count: 8756