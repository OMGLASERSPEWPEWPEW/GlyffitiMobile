// debug-cipher.mjs
// Path: debug-cipher.mjs
// Step-by-step cipher debugging to fix the encryption

import pako from 'pako';
import { createHash } from 'crypto';

const CIPHER_KEY = new Uint8Array([0x47, 0x4C, 0x59, 0x46, 0x46, 0x49, 0x54, 0x49]); // "GLYFFITI"

// Test different cipher approaches
class CipherTest {
  // Original cipher (the broken one)
  static encryptOriginal(data) {
    const encrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const keyByte = CIPHER_KEY[i % CIPHER_KEY.length];
      const xored = data[i] ^ keyByte ^ (i & 0xFF);
      encrypted[i] = ((xored & 0x0F) << 4) | ((xored & 0xF0) >> 4) ^ 0xAA;
    }
    return encrypted;
  }

  static decryptOriginal(encryptedData) {
    const decrypted = new Uint8Array(encryptedData.length);
    for (let i = 0; i < encryptedData.length; i++) {
      const substituted = encryptedData[i] ^ 0xAA;
      const swapped = ((substituted & 0x0F) << 4) | ((substituted & 0xF0) >> 4);
      const keyByte = CIPHER_KEY[i % CIPHER_KEY.length];
      decrypted[i] = swapped ^ keyByte ^ (i & 0xFF);
    }
    return decrypted;
  }

  // Fixed cipher (properly reversible)
  static encryptFixed(data) {
    const encrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const keyByte = CIPHER_KEY[i % CIPHER_KEY.length];
      // Step 1: XOR with key and position
      const xored = data[i] ^ keyByte ^ (i & 0xFF);
      // Step 2: Swap nibbles
      const swapped = ((xored & 0x0F) << 4) | ((xored & 0xF0) >> 4);
      // Step 3: XOR with constant
      encrypted[i] = swapped ^ 0xAA;
    }
    return encrypted;
  }

  static decryptFixed(encryptedData) {
    const decrypted = new Uint8Array(encryptedData.length);
    for (let i = 0; i < encryptedData.length; i++) {
      // Step 3 reverse: XOR with constant
      const unxored = encryptedData[i] ^ 0xAA;
      // Step 2 reverse: Swap nibbles back
      const unswapped = ((unxored & 0x0F) << 4) | ((unxored & 0xF0) >> 4);
      // Step 1 reverse: XOR with key and position
      const keyByte = CIPHER_KEY[i % CIPHER_KEY.length];
      decrypted[i] = unswapped ^ keyByte ^ (i & 0xFF);
    }
    return decrypted;
  }

  // Simple XOR cipher (most reliable)
  static encryptSimple(data) {
    const encrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const keyByte = CIPHER_KEY[i % CIPHER_KEY.length];
      encrypted[i] = data[i] ^ keyByte ^ (i & 0xFF);
    }
    return encrypted;
  }

  static decryptSimple(encryptedData) {
    const decrypted = new Uint8Array(encryptedData.length);
    for (let i = 0; i < encryptedData.length; i++) {
      const keyByte = CIPHER_KEY[i % CIPHER_KEY.length];
      decrypted[i] = encryptedData[i] ^ keyByte ^ (i & 0xFF);
    }
    return decrypted;
  }
}

async function testCiphers() {
  console.log('🔍 Debugging Cipher Issues...\n');

  // Test data
  const testText = 'Hello Glyffiti Artists!';
  const testData = new TextEncoder().encode(testText);
  
  console.log('Original text:', testText);
  console.log('Original bytes:', Array.from(testData).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
  console.log();

  // Test 1: Original Cipher
  console.log('=== Test 1: Original Cipher ===');
  try {
    const encrypted1 = CipherTest.encryptOriginal(testData);
    const decrypted1 = CipherTest.decryptOriginal(encrypted1);
    const decryptedText1 = new TextDecoder().decode(decrypted1);
    
    console.log('Encrypted bytes:', Array.from(encrypted1.slice(0, 10)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '), '...');
    console.log('Decrypted text:', JSON.stringify(decryptedText1));
    console.log('Original cipher works:', decryptedText1 === testText ? '✅ YES' : '❌ NO');
  } catch (error) {
    console.log('Original cipher error:', error.message);
  }
  console.log();

  // Test 2: Fixed Cipher
  console.log('=== Test 2: Fixed Cipher ===');
  try {
    const encrypted2 = CipherTest.encryptFixed(testData);
    const decrypted2 = CipherTest.decryptFixed(encrypted2);
    const decryptedText2 = new TextDecoder().decode(decrypted2);
    
    console.log('Encrypted bytes:', Array.from(encrypted2.slice(0, 10)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '), '...');
    console.log('Decrypted text:', JSON.stringify(decryptedText2));
    console.log('Fixed cipher works:', decryptedText2 === testText ? '✅ YES' : '❌ NO');
  } catch (error) {
    console.log('Fixed cipher error:', error.message);
  }
  console.log();

  // Test 3: Simple Cipher
  console.log('=== Test 3: Simple Cipher ===');
  try {
    const encrypted3 = CipherTest.encryptSimple(testData);
    const decrypted3 = CipherTest.decryptSimple(encrypted3);
    const decryptedText3 = new TextDecoder().decode(decrypted3);
    
    console.log('Encrypted bytes:', Array.from(encrypted3.slice(0, 10)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '), '...');
    console.log('Decrypted text:', JSON.stringify(decryptedText3));
    console.log('Simple cipher works:', decryptedText3 === testText ? '✅ YES' : '❌ NO');
  } catch (error) {
    console.log('Simple cipher error:', error.message);
  }
  console.log();

  // Test 4: Test on Gzip Data
  console.log('=== Test 4: Cipher on Gzip Data ===');
  const testJson = '{"a":"gg","b":1,"c":1234567890}';
  const gzipData = pako.deflate(new TextEncoder().encode(testJson));
  
  console.log('Gzip header:', gzipData[0].toString(16), gzipData[1].toString(16), '(should be 1f 8b)');
  console.log('Gzip size:', gzipData.length, 'bytes');
  
  // Test each cipher on gzip data
  const ciphers = [
    { name: 'Original', encrypt: CipherTest.encryptOriginal, decrypt: CipherTest.decryptOriginal },
    { name: 'Fixed', encrypt: CipherTest.encryptFixed, decrypt: CipherTest.decryptFixed },
    { name: 'Simple', encrypt: CipherTest.encryptSimple, decrypt: CipherTest.decryptSimple }
  ];

  for (const cipher of ciphers) {
    try {
      const encrypted = cipher.encrypt(gzipData);
      const decrypted = cipher.decrypt(encrypted);
      
      console.log(`${cipher.name} cipher on gzip:`);
      console.log('  Original header:', gzipData[0].toString(16), gzipData[1].toString(16));
      console.log('  Decrypted header:', decrypted[0].toString(16), decrypted[1].toString(16));
      console.log('  Header match:', gzipData[0] === decrypted[0] && gzipData[1] === decrypted[1] ? '✅ YES' : '❌ NO');
      
      if (gzipData[0] === decrypted[0] && gzipData[1] === decrypted[1]) {
        // Try to decompress
        try {
          const decompressed = pako.inflate(decrypted);
          const finalText = new TextDecoder().decode(decompressed);
          console.log('  Full pipeline:', finalText === testJson ? '✅ SUCCESS' : '❌ FAILED');
          
          if (finalText === testJson) {
            console.log(`\n🎉 WINNER: ${cipher.name} cipher works perfectly!`);
            console.log('This cipher should be used in the Genesis Block code.\n');
          }
        } catch (decompressError) {
          console.log('  Decompression failed:', decompressError.message);
        }
      }
      console.log();
    } catch (error) {
      console.log(`${cipher.name} cipher failed:`, error.message);
      console.log();
    }
  }
}

// Run the cipher debugging
testCiphers();