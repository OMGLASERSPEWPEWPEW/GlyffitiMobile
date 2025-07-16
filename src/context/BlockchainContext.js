// src/context/BlockchainContext.js
import React, { createContext, useContext, useState } from 'react';

const BlockchainContext = createContext();

export const BlockchainProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [network, setNetwork] = useState('devnet');
  
  const value = {
    connected,
    setConnected,
    network,
    setNetwork,
  };
  
  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within BlockchainProvider');
  }
  return context;
};