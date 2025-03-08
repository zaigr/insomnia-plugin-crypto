const assert = require('assert');
const { describe, it, beforeEach } = require('mocha');
const {
  enableResponseDecryption,
  isResponseDecryptionEnabled,
  enableRequestEncryption,
  isRequestEncryptionEnabled,
} = require('../store');

describe('store.js', () => {
  // Mock store implementation
  let mockStore;

  beforeEach(() => {
    // Reset mock store before each test
    mockStore = {
      storage: new Map(),
      getItem: async function (key) {
        return this.storage.get(key);
      },
      setItem: async function (key, value) {
        this.storage.set(key, value.toString());
        return true;
      }
    };
  });

  describe('enableResponseDecryption', () => {
    it('should store the enableDecryption value for an item', async () => {
      const itemId = 'test-item-123';
      await enableResponseDecryption(mockStore, itemId, true);
      const storedValue = await mockStore.getItem('enableDecryption:test-item-123');
      assert.strictEqual(storedValue, 'true');
    });

    it('should update the enableDecryption value when called multiple times', async () => {
      const itemId = 'test-item-123';
      await enableResponseDecryption(mockStore, itemId, true);
      await enableResponseDecryption(mockStore, itemId, false);
      const storedValue = await mockStore.getItem('enableDecryption:test-item-123');
      assert.strictEqual(storedValue, 'false');
    });

    it('should store different values for different items', async () => {
      const itemId1 = 'test-item-123';
      const itemId2 = 'test-item-456';
      await enableResponseDecryption(mockStore, itemId1, true);
      await enableResponseDecryption(mockStore, itemId2, false);

      const storedValue1 = await mockStore.getItem('enableDecryption:test-item-123');
      const storedValue2 = await mockStore.getItem('enableDecryption:test-item-456');

      assert.strictEqual(storedValue1, 'true');
      assert.strictEqual(storedValue2, 'false');
    });
  });

  describe('isResponseDecryptionEnabled', () => {
    it('should return true when decryption is enabled', async () => {
      const itemId = 'test-item-123';
      await mockStore.setItem('enableDecryption:test-item-123', 'true');
      const result = await isResponseDecryptionEnabled(mockStore, itemId);
      assert.strictEqual(result, true);
    });

    it('should return false when decryption is disabled', async () => {
      const itemId = 'test-item-123';
      await mockStore.setItem('enableDecryption:test-item-123', 'false');
      const result = await isResponseDecryptionEnabled(mockStore, itemId);
      assert.strictEqual(result, false);
    });

    it('should return false when no value is set', async () => {
      const itemId = 'test-item-123';
      const result = await isResponseDecryptionEnabled(mockStore, itemId);
      assert.strictEqual(result, false);
    });

    it('should return false for invalid values', async () => {
      const itemId = 'test-item-123';
      await mockStore.setItem('enableDecryption:test-item-123', 'invalid-value');
      const result = await isResponseDecryptionEnabled(mockStore, itemId);
      assert.strictEqual(result, false);
    });
  });

  describe('enableRequestEncryption', () => {
    it('should store the enableEncryption value for an item', async () => {
      const itemId = 'test-item-123';
      await enableRequestEncryption(mockStore, itemId, true);
      const storedValue = await mockStore.getItem('enableEncryption:test-item-123');
      assert.strictEqual(storedValue, 'true');
    });

    it('should update the enableEncryption value when called multiple times', async () => {
      const itemId = 'test-item-123';
      await enableRequestEncryption(mockStore, itemId, true);
      await enableRequestEncryption(mockStore, itemId, false);
      const storedValue = await mockStore.getItem('enableEncryption:test-item-123');
      assert.strictEqual(storedValue, 'false');
    });

    it('should store different values for different items', async () => {
      const itemId1 = 'test-item-123';
      const itemId2 = 'test-item-456';
      await enableRequestEncryption(mockStore, itemId1, true);
      await enableRequestEncryption(mockStore, itemId2, false);

      const storedValue1 = await mockStore.getItem('enableEncryption:test-item-123');
      const storedValue2 = await mockStore.getItem('enableEncryption:test-item-456');

      assert.strictEqual(storedValue1, 'true');
      assert.strictEqual(storedValue2, 'false');
    });
  });

  describe('isRequestEncryptionEnabled', () => {
    it('should return true when encryption is enabled', async () => {
      const itemId = 'test-item-123';
      await mockStore.setItem('enableEncryption:test-item-123', 'true');
      const result = await isRequestEncryptionEnabled(mockStore, itemId);
      assert.strictEqual(result, true);
    });

    it('should return false when encryption is disabled', async () => {
      const itemId = 'test-item-123';
      await mockStore.setItem('enableEncryption:test-item-123', 'false');
      const result = await isRequestEncryptionEnabled(mockStore, itemId);
      assert.strictEqual(result, false);
    });

    it('should return false when no value is set', async () => {
      const itemId = 'test-item-123';
      const result = await isRequestEncryptionEnabled(mockStore, itemId);
      assert.strictEqual(result, false);
    });

    it('should return false for invalid values', async () => {
      const itemId = 'test-item-123';
      await mockStore.setItem('enableEncryption:test-item-123', 'invalid-value');
      const result = await isRequestEncryptionEnabled(mockStore, itemId);
      assert.strictEqual(result, false);
    });
  });
});
