// src/services/blockchain/solana/utils/SolanaMemoBuilder.js  
// Path: src/services/blockchain/solana/utils/SolanaMemoBuilder.js
import { Connection, Transaction, TransactionInstruction, PublicKey, Keypair } from '@solana/web3.js';
import { GlyffitiGenesisBlock, UserGenesisBlock, GenesisBlockFactory } from '../../shared/models/GenesisBlock.js';
import { CompressionService } from '../../../compression/CompressionService.js';
import bs58 from 'bs58';

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
      return signature;
    } catch (error) {
      console.error('❌ Error deploying secure genesis:', error);
      throw new Error('Secure genesis deployment failed: ' + error.message);
    }
  }

  /**
   * Build and submit a user genesis block transaction
   * @param {string} alias - User's display name  
   * @param {string} glyffitiGenesisHash - Transaction hash of the global genesis
   * @param {Keypair} userKeypair - User's keypair for signing
   * @returns {Promise<string>} Transaction signature hash
   */
  async deployUserGenesis(alias, glyffitiGenesisHash, userKeypair) {
    try {
      console.log('👤 Deploying Secure User Genesis Block...');
      
      if (!userKeypair) {
        throw new Error('User keypair is required for user genesis deployment');
      }
      if (!glyffitiGenesisHash) {
        throw new Error('Glyffiti genesis hash is required for user genesis');
      }

      // Create user genesis block
      const userGenesis = new UserGenesisBlock(alias, glyffitiGenesisHash, userKeypair.publicKey.toBase58());
      
      // Get secure wire format data
      const wireData = await userGenesis.toMemoData();
      console.log(`📡 Secure user genesis wire format size: ${wireData.length} bytes`);
      
      // Create transaction with memo instruction
      const transaction = await this.buildMemoTransaction(wireData, userKeypair);
      
      // Submit transaction with retries
      const signature = await this.submitTransactionWithRetries(transaction, userKeypair, 'Secure User Genesis');
      
      console.log('✅ Secure User Genesis deployed successfully!');
      return signature;
    } catch (error) {
      console.error('❌ Error deploying secure user genesis:', error);
      throw new Error('Secure user genesis deployment failed: ' + error.message);
    }
  }

  /**
   * Helper: Check if data looks like our secure wire format (version 0x01, length ≥ 34)
   * @param {Uint8Array} buf - Buffer to check
   * @returns {boolean} True if looks like secure wire format
   */
  static _looksLikeSecureWire(buf) {
    return buf && buf instanceof Uint8Array && buf.length >= 34 && buf[0] === 0x01;
  }

  /**
   * Read and parse a genesis block from a transaction hash
   * @param {string} transactionHash - Transaction hash containing genesis block
   * @returns {Promise<GlyffitiGenesisBlock|UserGenesisBlock>} Parsed genesis block
   */
    async readGenesisFromTransaction(transactionHash) {
    try {
      console.log('🔍 Reading secure genesis from transaction:', transactionHash);

      console.log('⏳ Waiting 3 seconds for transaction indexing...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      const tx = await this.connection.getTransaction(transactionHash, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });
      if (!tx) throw new Error('Transaction not found');

      const ix = (tx.transaction.message.instructions || [])
        .find(ix => {
          const pid = ix.programId ||
            (ix.programIdIndex != null
              ? tx.transaction.message.accountKeys[ix.programIdIndex]
              : null);
          return pid && (
            (typeof pid === 'string' && pid === this.MEMO_PROGRAM_ID.toBase58()) ||
            (pid.equals && pid.equals(this.MEMO_PROGRAM_ID))
          );
        });
      if (!ix) throw new Error('No memo instruction found');

      // RPC returns instruction data as a Base58 string
      const rpcDataString = typeof ix.data === 'string'
        ? ix.data
        : Buffer.from(ix.data).toString('utf8');
      console.log(`📝 RPC gave base58 string (${rpcDataString.length} chars)`);

      // Step 1: Base58-decode the RPC string
      let rawBytes;
      try {
        rawBytes = bs58.decode(rpcDataString);
        console.log(`🔄 Base58 → bytes: ${rawBytes.length} bytes`);
      } catch {
        throw new Error('RPC data was not valid base58');
      }

      // Convert those bytes to UTF-8 text
      const payloadText = Buffer.from(rawBytes).toString('utf8').trim();

      let wireData;

      // A) Raw-wire bytes
      if (SolanaMemoBuilder._looksLikeSecureWire(rawBytes)) {
        wireData = rawBytes;
        console.log('🔎 Detected raw-wire bytes (single decode).');

      // B) New Base58 path
      } else if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(payloadText)) {
        console.log(`🔁 Detected Base58 payload (${payloadText.length} chars)`);
        wireData = bs58.decode(payloadText);
        console.log(`📦 Base58 → wire: ${wireData.length} bytes`);
        if (!SolanaMemoBuilder._looksLikeSecureWire(wireData)) {
          throw new Error('Base58 decode did not yield valid wire frame');
        }

      // C) Legacy Base64 path
      } else {
        console.log(`🔄 Falling back to Base64 payload (${payloadText.length} chars)`);
        wireData = new Uint8Array(Buffer.from(payloadText, 'base64'));
        console.log(`📦 Base64 → wire: ${wireData.length} bytes`);
        if (!SolanaMemoBuilder._looksLikeSecureWire(wireData)) {
          throw new Error('Base64 decode did not yield valid wire frame');
        }
      }

      // Finally parse it
      return await GenesisBlockFactory.parseFromWireData(wireData);

    } catch (error) {
      console.error('❌ Error reading secure genesis from transaction:', error);
      throw new Error('Failed to read secure genesis from transaction: ' + error.message);
    }
  }  

  /**
   * Parse genesis block from wire data format
   * @param {Uint8Array} wireData - Wire format data from memo
   * @returns {Promise<GlyffitiGenesisBlock|UserGenesisBlock>} Parsed genesis block
   */
  async parseGenesisFromWireData(wireData) {
    try {
      return await GenesisBlockFactory.parseFromWireData(wireData);
    } catch (error) {
      console.error('❌ Error parsing secure genesis from wire data:', error);
      throw new Error('Failed to parse secure genesis from wire data: ' + error.message);
    }
  }

  /**
   * Build a memo transaction with given data, encoding wire bytes in Base58
   * @param {Uint8Array} memoData - Wire format data to include in memo
   * @param {Keypair} signerKeypair - Keypair to sign the transaction
   * @returns {Promise<Transaction>} Built transaction ready for submission
   */
  async buildMemoTransaction(memoData, signerKeypair) {
    try {
      console.log(`🔨 Building memo transaction, data size: ${memoData.length} bytes`);

      if (memoData.length > 566) {
        throw new Error(`Memo data too large: ${memoData.length} bytes (max 566)`);
      }

      // Encode the wire-format bytes in Base58 (pure ASCII, no padding)
      const memoText = bs58.encode(memoData);
      console.log(`📝 Encoded as Base58: ${memoText.length} chars`);

      // Create UTF-8 buffer from Base58 string
      const memoDataBuffer = Buffer.from(memoText, 'utf8');

      // Build transaction and add memo instruction
      const transaction = new Transaction();
      const instruction = new TransactionInstruction({
        keys: [],
        programId: this.MEMO_PROGRAM_ID,
        data: memoDataBuffer
      });
      transaction.add(instruction);

      // Attach recent blockhash and fee payer
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
   * @param {Keypair} signerKeypair - Keypair to sign transaction
   * @param {string} description - Description for logging
   * @returns {Promise<string>} Transaction signature
   */
  async submitTransactionWithRetries(transaction, signerKeypair, description = 'Transaction') {
    let lastError;
    
    for (let attempt = 1; attempt <= this.txConfig.maxRetries; attempt++) {
      try {
        console.log(`📡 Submitting ${description} (attempt ${attempt}/${this.txConfig.maxRetries})...`);
        
        // Sign transaction (following SolanaPublisher pattern)
        transaction.sign(signerKeypair);
        
        // Submit transaction (following SolanaPublisher pattern)
        const signature = await this.connection.sendRawTransaction(
          transaction.serialize(),
          { skipPreflight: false, preflightCommitment: 'confirmed' }
        );
        
        // Wait for confirmation (following SolanaPublisher pattern)
        const confirmation = await this.connection.confirmTransaction(
          signature,
          'confirmed'
        );
        
        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }
        
        console.log(`✅ ${description} confirmed: ${signature}`);
        return signature;
      } catch (error) {
        lastError = error;
        console.log(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.txConfig.maxRetries) {
          console.log(`⏳ Retrying in ${this.txConfig.retryDelay / 1000} seconds...`);
          await this.sleep(this.txConfig.retryDelay);
        }
      }
    }
    
    throw new Error(`${description} failed after ${this.txConfig.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Check connection to Solana network
   * @returns {Promise<boolean>} True if connection is working
   */
  async checkConnection() {
    try {
      const version = await this.connection.getVersion();
      return !!version;
    } catch (error) {
      console.error('❌ Connection check failed:', error);
      return false;
    }
  }

  /**
   * Get network information
   * @returns {object} Network information
   */
  getNetworkInfo() {
    return {
      endpoint: this.connection.rpcEndpoint,
      memoProgramId: this.MEMO_PROGRAM_ID.toBase58(),
      commitment: this.txConfig.commitment
    };
  }

  /**
   * Sleep utility for delays
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

// Character count: 12,266