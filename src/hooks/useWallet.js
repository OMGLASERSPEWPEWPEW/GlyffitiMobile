// src/hooks/useWallet.js
// Path: src/hooks/useWallet.js
import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { MobileWalletService } from '../services/wallet/MobileWalletService';
import { SolanaAirdropService } from '../services/wallet/SolanaAirdropService';



const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
const DEV_PASSWORD = 'qwerty';
/**
 * Custom hook for wallet management
 * Centralizes all wallet-related state and operations
 */
export const useWallet = (options = {}) => {
  // Wallet state
  const { autoInitialize = false } = options;
  const [walletService, setWalletService] = useState(null);
  const [walletStatus, setWalletStatus] = useState('checking'); // checking, none, locked, unlocked
  const [walletBalance, setWalletBalance] = useState(0);
  const [password, setPassword] = useState('');
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [showWalletUnlock, setShowWalletUnlock] = useState(false);
  const [isRequestingAirdrop, setIsRequestingAirdrop] = useState(false);
  const [isSystemWallet, setIsSystemWallet] = useState(true);
  const [hasPersonalWallet, setHasPersonalWallet] = useState(false);

  // Refs to prevent duplicate operations
  const initRef = useRef(false);
  
  // Create airdrop service instance
  const airdropService = useRef(new SolanaAirdropService()).current;

  // Initialize wallet status on mount
    useEffect(() => {
    if (!autoInitialize) {
      setWalletStatus('none'); // Set to none instead of checking
      return;
    }
    
    if (initRef.current) return;
    initRef.current = true;
    
    checkWalletStatus();
  }, [autoInitialize]);

  // Check if wallet exists
  const checkWalletStatus = async () => {
  try {
    const hasWallet = await MobileWalletService.hasWallet();
    
    if (hasWallet) {
      // Auto-unlock in development
      if (isDevelopment) {
        console.log('🔧 Development: Auto-unlocking system wallet');
        await unlockWallet(DEV_PASSWORD);
      } else {
        setWalletStatus('locked');
      }
    } else {
      setWalletStatus('none');
    }
  } catch (error) {
    console.error('Error checking wallet status:', error);
    setWalletStatus('none');
  }
};

  // Load wallet balance
  const loadWalletBalance = async (wallet = walletService, context = 'manual') => {
    if (!wallet) return;
    
    try {
      const balanceInfo = await wallet.getBalance(context);
      
      // Handle different balance object structures
      if (typeof balanceInfo === 'number') {
        setWalletBalance(balanceInfo);
      } else if (balanceInfo && balanceInfo.available !== undefined) {
        setWalletBalance(balanceInfo.available);
      } else if (balanceInfo && balanceInfo.balance !== undefined) {
        setWalletBalance(balanceInfo.balance);
      } else if (balanceInfo && balanceInfo.amount !== undefined) {
        setWalletBalance(balanceInfo.amount);
      } else {
        console.warn('Unexpected balance format:', balanceInfo);
        setWalletBalance(0);
      }
    } catch (error) {
      console.error('Error loading wallet balance:', error);
      setWalletBalance(0);
    }
  };

  // Create new wallet
  const createWallet = async (walletPassword) => {
    if (!walletPassword || walletPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    try {
      setIsLoadingWallet(true);
      
      const wallet = new MobileWalletService();
      const walletInfo = await wallet.create({
        name: 'My Glyffiti Wallet',
        password: walletPassword
      });
      
      await wallet.connect();
      
      setWalletService(wallet);
      setWalletStatus('unlocked');
      setPassword('');
      setShowWalletUnlock(false);
      
      await loadWalletBalance(wallet, 'wallet-created');
      
      Alert.alert('✅ Success', 'Your wallet has been created successfully!');
      return true;
      
    } catch (error) {
      console.error('Error creating wallet:', error);
      Alert.alert('Error', 'Failed to create wallet: ' + error.message);
      return false;
    } finally {
      setIsLoadingWallet(false);
    }
  };

  // Unlock existing wallet
  const unlockWallet = async (walletPassword) => {
    if (!walletPassword || walletPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    try {
      setIsLoadingWallet(true);
      
      const availableWallets = await MobileWalletService.getAvailableWallets();
      if (availableWallets.length === 0) {
        throw new Error('No wallets found');
      }
      
      const wallet = new MobileWalletService();
      await wallet.loadWallet(availableWallets[0].id, walletPassword);
      await wallet.connect();
      
      setWalletService(wallet);
      setWalletStatus('unlocked');
      setPassword('');
      setShowWalletUnlock(false);
      
      await loadWalletBalance(wallet, 'wallet-unlocked');
      
      return true;
      
    } catch (error) {
      console.error('Error unlocking wallet:', error);
      Alert.alert('Error', 'Failed to unlock wallet. Please check your password.');
      return false;
    } finally {
      setIsLoadingWallet(false);
    }
  };

  // Handle wallet action (create or unlock based on status)
  const handleWalletAction = async () => {
    if (walletStatus === 'none') {
      return await createWallet(password);
    } else if (walletStatus === 'locked') {
      return await unlockWallet(password);
    }
    return false;
  };

  // Request airdrop (devnet)
  const requestAirdrop = async () => {
    if (!walletService || walletStatus !== 'unlocked') {
      Alert.alert('Error', 'Please unlock your wallet first');
      return false;
    }

    try {
      setIsRequestingAirdrop(true);
      
      Alert.alert(
        'Request Devnet SOL',
        'Request 1 SOL from the Solana devnet faucet?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setIsRequestingAirdrop(false) },
          { 
            text: 'Request', 
            onPress: async () => {
              try {
                const keypair = walletService.getWalletKeypair();
                
                console.log('🎁 Requesting airdrop...');
                await airdropService.requestAirdrop(keypair.publicKey, 1);
                
                Alert.alert('⏳ Processing', 'Waiting for airdrop confirmation...');
                
                // Refresh balance after delays
                setTimeout(async () => {
                  console.log('💰 Refreshing balance (first check)...');
                  await loadWalletBalance(walletService, 'post-airdrop');
                }, 2000);
                
                setTimeout(async () => {
                  console.log('💰 Refreshing balance (final check)...');
                  await loadWalletBalance(walletService, 'post-airdrop-final');
                  Alert.alert('✅ Success!', 'Airdrop completed! Your new balance should be displayed.');
                }, 5000);
                
              } catch (error) {
                console.error('❌ Airdrop failed:', error);
                Alert.alert('Error', 'Airdrop failed: ' + error.message);
              } finally {
                setIsRequestingAirdrop(false);
              }
            }
          }
        ]
      );
      return true;
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      setIsRequestingAirdrop(false);
      return false;
    }
  };

  // Lock wallet (disconnect)
  const lockWallet = async () => {
    if (walletService) {
      await walletService.disconnect();
      setWalletService(null);
      setWalletStatus('locked');
      setWalletBalance(null);
    }
  };

  // Refresh balance
  const refreshBalance = async () => {
    await loadWalletBalance(walletService, 'manual-refresh');
  };

  // Get wallet info
  const getWalletInfo = () => {
    if (!walletService || walletStatus !== 'unlocked') {
      return null;
    }
    
    return {
      publicKey: walletService.getWalletPublicKey(),
      balance: walletBalance,
      status: walletStatus
    };
  };

  // Handle wallet migration (placeholder for now)
  const handleMigration = () => {
    Alert.alert('Migration', 'Wallet migration feature coming soon!');
  };

  // Get wallet address
  const getWalletAddress = () => {
    if (!walletService || walletStatus !== 'unlocked') {
      return '';
    }
    return walletService.getWalletPublicKey() || '';
  };

    // Transfer SOL from system wallet to another address
  const transferSOL = async (toAddress, amount = 1) => {
    if (!walletService || walletStatus !== 'unlocked') {
      Alert.alert('Error', 'System wallet must be unlocked first');
      return false;
    }

    try {
      setIsRequestingAirdrop(true); // Reuse loading state
      
      const { Transaction, SystemProgram, PublicKey } = require('@solana/web3.js');
      
      // Create transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: walletService.getWalletKeypair().publicKey,
          toPubkey: new PublicKey(toAddress),
          lamports: amount * 1000000000, // Convert SOL to lamports
        })
      );
      
      // Get recent blockhash
      const { blockhash } = await walletService.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletService.getWalletKeypair().publicKey;
      
      // Sign and send
      transaction.sign(walletService.getWalletKeypair());
      const signature = await walletService.connection.sendRawTransaction(
        transaction.serialize(),
        { skipPreflight: false, preflightCommitment: 'confirmed' }
      );
      
      // Wait for confirmation
      const confirmation = await walletService.connection.confirmTransaction(
        signature,
        'confirmed'
      );
      
      if (confirmation.value.err) {
        throw new Error(`Transfer failed: ${confirmation.value.err}`);
      }
      
      console.log(`✅ Transfer successful: ${signature}`);
      Alert.alert('✅ Success!', `Sent ${amount} SOL successfully!`);
      
      // Refresh system wallet balance
      await loadWalletBalance(walletService, 'post-transfer');
      
      return true;
      
    } catch (error) {
      console.error('❌ Transfer failed:', error);
      Alert.alert('Error', 'Transfer failed: ' + error.message);
      return false;
    } finally {
      setIsRequestingAirdrop(false);
    }
  };

  // Manual initialization (for when auto-init is disabled)
  const initializeWallet = async () => {
    if (walletStatus !== 'checking' && walletStatus !== 'none') {
      return; // Already initialized
    }
    
    console.log('🔧 Manually initializing system wallet...');
    await checkWalletStatus();
  };

  return {
    // State
    walletService,
    walletStatus,
    walletBalance,
    password,
    isLoadingWallet,
    showWalletUnlock,
    isRequestingAirdrop,
    isSystemWallet,
    hasPersonalWallet,
    createPersonalWallet: () => console.log('createPersonalWallet coming soon'),
    switchToPersonalWallet: () => console.log('switchToPersonalWallet coming soon'),
    
    
    // Computed values
    walletAddress: getWalletAddress(),
    
    // State setters
    setPassword,
    setShowWalletUnlock,
    
    // Actions
    createWallet,
    unlockWallet,
    handleWalletAction,
    requestAirdrop,
    handleRequestAirdrop: requestAirdrop, // Alias for compatibility
    handleMigration,
    lockWallet,
    refreshBalance,
    checkWalletStatus,
    transferSOL,
    initializeWallet,
    
    // Getters
    getWalletInfo,
    isWalletReady: walletStatus === 'unlocked' && walletService !== null
  };
};

// Character count: 6821