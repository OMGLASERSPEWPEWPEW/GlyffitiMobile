// src/context/UserContext.js
// Path: src/context/UserContext.js
import React, { createContext, useState, useEffect, useRef } from 'react';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { userTransactionReader } from '../services/blockchain/UserTransactionReader';

// Export the context so useUser hook can import it
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Authentication state (existing)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Selected user state (new - moved from HomeScreen)
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [userWalletBalance, setUserWalletBalance] = useState(0);
  
  // Panel state (new)
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [showUserSelectorPanel, setShowUserSelectorPanel] = useState(false);
  
  // Solana connection for balance updates
  const connection = useRef(new Connection('https://api.devnet.solana.com', 'confirmed')).current;
  const initRef = useRef(false);

  // Load Alice as default user on app start
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    
    console.log('🚀 UserContext: Loading default user...');
    const timer = setTimeout(() => {
      loadDefaultUser();
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // Load Alice as the default user
  const loadDefaultUser = async () => {
    try {
      console.log('🔄 Loading default user (Alice)...');
      
      const aliceData = {
        username: "alice",
        publicKey: "7mtV5uLWCS81RnTXzRXZapjvskAXEFsm7HLa7gAyG4rd",
        transactionHash: "4htDXYW1mVL8FN96HAEn3o9U7dN6vssvoYMSNUjz9rkTaQJAMb4pXn3C5a2ezALC8Dy5y5v852KM34yZCbP275b3"
      };
      
      setSelectedUser(aliceData);
      setUser(aliceData); // Also set as authenticated user
      
      // Load her full data from the blockchain
      const userData = await userTransactionReader.fetchUserDataFromTransaction(
        aliceData.transactionHash
      );
      
      if (userData && userData.alias) {
        console.log('✅ Alice user data loaded');
        setSelectedUserData(userData);
        
        // Get wallet balance
        try {
          const balance = await connection.getBalance(new PublicKey(aliceData.publicKey));
          const balanceSOL = balance / LAMPORTS_PER_SOL;
          setUserWalletBalance(balanceSOL);
        } catch (balanceError) {
          console.warn('⚠️ Could not get wallet balance:', balanceError);
          setUserWalletBalance(0);
        }
      }
      
      console.log('✅ Default user setup complete');
    } catch (error) {
      console.error('❌ Error loading default user:', error);
    }
  };

  // User action handlers (migrated from HomeScreen)
  const handleUserTap = () => {
    console.log('👤 User tapped - showing user panel');
    setShowUserPanel(true);
  };

  const handleUserLongPress = () => {
    console.log('👤 User long-pressed - showing user selector');
    setShowUserSelectorPanel(true);
  };

  const handleUserSelect = async (user) => {
    console.log('👤 User selected:', user.username);
    setSelectedUser(user);
    setShowUserSelectorPanel(false);
    
    // Load user data if we have a transaction ID
    if (user.transactionHash) {
      try {
        const userData = await userTransactionReader.fetchUserDataFromTransaction(
          user.transactionHash
        );
        setSelectedUserData(userData);
        
        // Get wallet balance
        const balance = await connection.getBalance(new PublicKey(user.publicKey));
        const balanceSOL = balance / LAMPORTS_PER_SOL;
        setUserWalletBalance(balanceSOL);
      } catch (error) {
        console.error('Error loading user data:', error);
        setSelectedUserData(null);
        setUserWalletBalance(0);
      }
    }
  };

  const handleCloseUserPanel = () => {
    setShowUserPanel(false);
  };

  const handleCloseUserSelectorPanel = () => {
    setShowUserSelectorPanel(false);
  };

  // Function to refresh a user's balance
  const refreshUserBalance = async (user) => {
    if (!user || !user.publicKey) {
      console.warn('⚠️ Cannot refresh balance - no user or publicKey');
      return;
    }

    try {
      console.log('💰 Refreshing balance for:', user.username);
      const balance = await connection.getBalance(new PublicKey(user.publicKey));
      const balanceSOL = balance / LAMPORTS_PER_SOL;
      
      // Update the state if this is the currently selected user
      if (selectedUser && selectedUser.publicKey === user.publicKey) {
        setUserWalletBalance(balanceSOL);
      }
      
      return balanceSOL;
    } catch (error) {
      console.error('❌ Error refreshing balance:', error);
      throw error;
    }
  };

  const value = {
    // Authentication (existing)
    user,
    setUser,
    loading,
    setLoading,
    
    // Selected user management (new)
    selectedUser,
    selectedUserData,
    userWalletBalance,
    showUserPanel,
    showUserSelectorPanel,
    
    // Actions (new)
    handleUserTap,
    handleUserLongPress,
    handleUserSelect,
    handleCloseUserPanel,
    handleCloseUserSelectorPanel,
    refreshUserBalance,
    loadDefaultUser
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Character count: 4,482