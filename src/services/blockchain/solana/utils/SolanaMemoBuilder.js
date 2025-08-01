// src/services/blockchain/solana/utils/SolanaMemoBuilder.js  
// Path: src/services/blockchain/solana/utils/SolanaMemoBuilder.js
import { Connection, Transaction, TransactionInstruction, PublicKey, Keypair } from '@solana/web3.js';
import { GlyffitiGenesisBlock, UserGenesisBlock } from '../../shared/models/GenesisBlock.js';

/**
 * Solana Memo Builder - Creates memo-only transactions for social graph genesis blocks
 * Handles the creation and submission of genesis blocks to Solana blockchain
 * Following existing SolanaPublisher patterns for transaction handling
 */
export class SolanaMemoBuilder {
  constructor(connection = null) {
    // Use provided connection or create default devnet connection
    this.connection = connection || new Connection('https://api.devnet.solana.com', 'confirmed');
    this.MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
    
    // Transaction configuration
    this.txConfig = {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      commitment: 'confirmed',
      maxRetries: 3,
      retryDelay: 2000 // 2 seconds
    };
  }

  /**
   * Build and submit the global Glyffiti Genesis block transaction (one-time setup)
   * @param {Keypair} deployerKeypair - Keypair that will deploy the genesis (becomes the "creator")
   * @returns {Promise<string>} Transaction signature hash
   */
  async deployGlyffitiGenesis(deployerKeypair) {
    try {
      console.log('🌟 Deploying Secure Glyffiti Genesis Block...');
      
      if (!deployerKeypair) {
        throw new Error('Deployer keypair is required for genesis deployment');
      }

      // Create the genesis block
      const genesisBlock = new GlyffitiGenesisBlock();
      
      // Get secure wire format data (async due to encryption)
      const wireData = await genesisBlock.toMemoData();
      console.log(`📡 Secure genesis wire format size: ${wireData.length} bytes`);
      
      // Create transaction with memo instruction
      const transaction = await this.buildMemoTransaction(wireData, deployerKeypair);
      
      // Submit transaction with retries
      const signature = await this.submitTransactionWithRetries(transaction, deployerKeypair, 'Secure Glyffiti Genesis');
      
      console.log('✅ Secure Glyffiti Genesis deployed successfully!');
      console.log(`📝 Genesis Transaction Hash: ${signature}`);
      console.log(`🔗 This hash will be used as parent for all user accounts`);
      console.log('🔒 Genesis data is encrypted and obfuscated on-chain');
      
      return signature;
    } catch (error) {
      console.error('❌ Failed to deploy Secure Glyffiti Genesis:', error);
      throw new Error('Failed to deploy Secure Glyffiti Genesis: ' + error.message);
    }
  }

  /**
   * Build and submit a User Genesis block transaction (user account creation)
   * @param {string} alias - Optional display name for the user
   * @param {string} glyffitiGenesisHash - Transaction hash of the global genesis
   * @param {Keypair} userKeypair - User's keypair (their identity)
   * @returns {Promise<string>} Transaction signature hash (becomes user's identity hash)
   */
  async createUserGenesis(alias, glyffitiGenesisHash, userKeypair) {
    try {
      console.log(`👤 Creating Secure User Genesis for: ${alias || 'anonymous'}`);
      
      if (!glyffitiGenesisHash) {
        throw new Error('Glyffiti Genesis hash is required (parent block)');
      }
      if (!userKeypair) {
        throw new Error('User keypair is required');
      }

      // Create user genesis block
      const userPublicKey = userKeypair.publicKey.toBase58();
      const userGenesisBlock = new UserGenesisBlock(alias, glyffitiGenesisHash, userPublicKey);
      
      // Get secure wire format data (async due to encryption)
      const wireData = await userGenesisBlock.toMemoData();
      console.log(`📡 Secure user genesis wire format size: ${wireData.length} bytes`);
      
      // Create transaction with memo instruction
      const transaction = await this.buildMemoTransaction(wireData, userKeypair);
      
      // Submit transaction with retries
      const signature = await this.submitTransactionWithRetries(transaction, userKeypair, `Secure User Genesis (${alias})`);
      
      console.log('✅ Secure User Genesis created successfully!');
      console.log(`📝 User Genesis Hash: ${signature}`);
      console.log(`🔗 This hash is the user's permanent identity`);
      console.log(`👤 Public Key: ${userPublicKey}`);
      console.log('🔒 User data is encrypted and obfuscated on-chain');
      
      return signature;
    } catch (error) {
      console.error('❌ Failed to create Secure User Genesis:', error);
      throw new Error('Failed to create Secure User Genesis: ' + error.message);
    }
  }

  /**
   * Build a memo-only transaction from wire format data
   * @param {Uint8Array} wireData - Wire format data (version byte + compressed JSON)
   * @param {Keypair} signerKeypair - Keypair that will sign the transaction
   * @returns {Promise<Transaction>} Built transaction ready for signing
   */
  async buildMemoTransaction(wireData, signerKeypair) {
    try {
      if (!wireData || wireData.length === 0) {
        throw new Error('Wire data is required');
      }
      if (!signerKeypair) {
        throw new Error('Signer keypair is required');
      }

      console.log(`🔨 Building memo transaction, data size: ${wireData.length} bytes`);

      // Create new transaction
      const transaction = new Transaction();
      
      // Convert wire data to Buffer for memo instruction
      const memoData = Buffer.from(wireData);
      
      // Create memo instruction (following SolanaPublisher pattern)
      const memoInstruction = new TransactionInstruction({
        keys: [], // Memo instructions require no accounts
        programId: this.MEMO_PROGRAM_ID,
        data: memoData
      });
      
      // Add memo instruction to transaction
      transaction.add(memoInstruction);
      
      // Get recent blockhash (required for all transactions)
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = signerKeypair.publicKey;
      
      console.log(`⚙️ Transaction prepared with blockhash: ${blockhash.slice(0, 8)}...`);
      
      return transaction;
    } catch (error) {
      console.error('❌ Error building memo transaction:', error);
      throw new Error('Failed to build memo transaction: ' + error.message);
    }
  }

  /**
   * Submit transaction with retry logic (following SolanaPublisher pattern)
   * @param {Transaction} transaction - Transaction to submit
   * @param {Keypair} signerKeypair - Keypair to sign the transaction
   * @param {string} description - Description for logging
   * @returns {Promise<string>} Transaction signature
   */
  async submitTransactionWithRetries(transaction, signerKeypair, description = 'Transaction') {
    let retryCount = 0;
    
    while (retryCount < this.txConfig.maxRetries) {
      try {
        console.log(`📤 Submitting ${description} (attempt ${retryCount + 1}/${this.txConfig.maxRetries})`);
        
        // Get fresh blockhash for retry attempts
        if (retryCount > 0) {
          const { blockhash } = await this.connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
        }
        
        // Sign transaction
        transaction.sign(signerKeypair);
        
        // Send transaction
        const signature = await this.connection.sendRawTransaction(
          transaction.serialize(),
          {
            skipPreflight: this.txConfig.skipPreflight,
            preflightCommitment: this.txConfig.preflightCommitment
          }
        );
        
        console.log(`⏳ ${description} submitted, waiting for confirmation: ${signature}`);
        
        // Wait for confirmation
        const confirmation = await this.connection.confirmTransaction(
          signature,
          this.txConfig.commitment
        );
        
        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
        }
        
        console.log(`✅ ${description} confirmed: ${signature}`);
        return signature;
        
      } catch (error) {
        retryCount++;
        console.error(`❌ ${description} attempt ${retryCount} failed:`, error.message);
        
        if (retryCount >= this.txConfig.maxRetries) {
          throw new Error(`${description} failed after ${this.txConfig.maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retry
        console.log(`⏳ Retrying in ${this.txConfig.retryDelay}ms...`);
        await this.sleep(this.txConfig.retryDelay);
      }
    }
  }

  /**
   * Read and parse genesis block from a transaction hash
   * @param {string} transactionHash - Transaction hash to read from
   * @returns {Promise<GlyffitiGenesisBlock|UserGenesisBlock>} Parsed genesis block
   */
  async readGenesisFromTransaction(transactionHash) {
    try {
      console.log(`🔍 Reading genesis block from transaction: ${transactionHash}`);
      
      // Fetch transaction
      const transaction = await this.connection.getTransaction(transactionHash, {
        commitment: 'confirmed'
      });
      
      if (!transaction) {
        throw new Error(`Transaction not found: ${transactionHash}`);
      }

      // Find memo instruction
      const instructions = transaction.transaction.message.instructions;
      let memoInstruction = null;
      
      for (const instruction of instructions) {
        if (instruction.programId === this.MEMO_PROGRAM_ID.toString() || 
            (instruction.programId && new PublicKey(instruction.programId).equals(this.MEMO_PROGRAM_ID))) {
          memoInstruction = instruction;
          break;
        }
      }
      
      if (!memoInstruction) {
        throw new Error('No memo instruction found in transaction');
      }

      // Extract wire data from memo instruction
      let wireData;
      if (memoInstruction.data) {
        // Raw instruction data - it's a Buffer containing the wire format
        wireData = new Uint8Array(Buffer.from(memoInstruction.data, 'base64'));
      } else {
        throw new Error('No data found in memo instruction');
      }

      // Parse genesis block from wire data  
      const genesisBlock = this.parseGenesisFromWireData(wireData);
      
      console.log(`✅ Successfully parsed ${genesisBlock.kind} block`);
      return genesisBlock;
      
    } catch (error) {
      console.error('❌ Error reading genesis from transaction:', error);
      throw new Error('Failed to read genesis from transaction: ' + error.message);
    }
  }

  /**
   * Parse genesis block from wire format data
   * @param {Uint8Array} wireData - Wire format data
   * @returns {GlyffitiGenesisBlock|UserGenesisBlock} Parsed genesis block
   */
  parseGenesisFromWireData(wireData) {
    try {
      if (!wireData || wireData.length < 2) {
        throw new Error('Invalid wire data: too short');
      }
      
      // Check version byte
      if (wireData[0] !== 0x01) {
        throw new Error(`Unsupported version: ${wireData[0]} (expected 0x01)`);
      }
      
      // Peek at the kind to determine type
      const compressedData = wireData.slice(1);
      
      // We can use the GenesisBlockFactory from our models
      if (wireData[0] === 0x01) {
        // Try to parse as Glyffiti Genesis first
        try {
          return GlyffitiGenesisBlock.fromWireData(wireData);
        } catch (genesisError) {
          // If that fails, try User Genesis
          try {
            return UserGenesisBlock.fromWireData(wireData);
          } catch (userError) {
            throw new Error('Failed to parse as either genesis type: ' + userError.message);
          }
        }
      } else {
        throw new Error(`Unsupported version byte: ${wireData[0]}`);
      }
    } catch (error) {
      console.error('❌ Error parsing genesis from wire data:', error);
      throw new Error('Failed to parse genesis from wire data: ' + error.message);
    }
  }

  /**
   * Check Solana network connection health
   * @returns {Promise<boolean>} True if connection is healthy
   */
  async checkConnection() {
    try {
      await this.connection.getVersion();
      return true;
    } catch (error) {
      console.error('❌ Solana connection check failed:', error);
      return false;
    }
  }

  /**
   * Get network information
   * @returns {Object} Network information
   */
  getNetworkInfo() {
    return {
      endpoint: this.connection.rpcEndpoint,
      commitment: this.txConfig.commitment,
      memoProgramId: this.MEMO_PROGRAM_ID.toString()
    };
  }

  /**
   * Sleep utility for retry delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>} Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Run self-test to verify secure memo builder functionality
   * @returns {Promise<boolean>} True if all tests pass
   */
  static async runSelfTest() {
    try {
      console.log('🧪 Running Secure SolanaMemoBuilder self-test...');
      
      // Test 1: Connection check
      const memoBuilder = new SolanaMemoBuilder();
      const connectionOk = await memoBuilder.checkConnection();
      if (!connectionOk) {
        throw new Error('Connection test failed');
      }
      
      // Test 2: Secure transaction building (without submitting)
      const testKeypair = Keypair.generate();
      const genesisBlock = new GlyffitiGenesisBlock();
      const wireData = await genesisBlock.toMemoData(); // Now async and properly encrypted
      
      const transaction = await memoBuilder.buildMemoTransaction(wireData, testKeypair);
      if (!transaction || !transaction.instructions || transaction.instructions.length === 0) {
        throw new Error('Secure transaction building test failed');
      }
      
      // Test 3: Secure wire data parsing
      const parsedGenesis = await memoBuilder.parseGenesisFromWireData(wireData); // Now async
      if (parsedGenesis.kind !== 'glyf_genesis') {
        throw new Error('Secure wire data parsing test failed');
      }
      
      // Test 4: Network info
      const networkInfo = memoBuilder.getNetworkInfo();
      if (!networkInfo.endpoint || !networkInfo.memoProgramId) {
        throw new Error('Network info test failed');
      }
      
      // Test 5: Security validation
      if (wireData.length < 34) { // version(1) + hash(32) + min data(1)
        throw new Error('Secure format validation failed - no integrity hash');
      }
      
      // Test 6: Genesis block factory integration
      const factoryTest = await GenesisBlockFactory.runSelfTest();
      if (!factoryTest) {
        throw new Error('Genesis block factory test failed');
      }
      
      console.log('✅ Secure SolanaMemoBuilder self-test passed!');
      console.log(`📊 Network: ${networkInfo.endpoint}`);
      console.log(`📊 Memo Program: ${networkInfo.memoProgramId}`);
      console.log(`📊 Secure wire data size: ${wireData.length} bytes`);
      console.log('🔒 Security features: Encryption + Integrity Hash + Field Obfuscation');
      
      return true;
    } catch (error) {
      console.error('❌ Secure SolanaMemoBuilder self-test failed:', error);
      return false;
    }
  }
}

// Character count: 12,177