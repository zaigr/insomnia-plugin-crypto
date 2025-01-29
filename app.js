const {
  enableResponseDecryption,
  isResponseDecryptionEnabled,
} = require('./store');

const { decrypt } = require('./encrypt');

module.exports.responseHooks = [
  async (context) => {
    const enabled = await isResponseDecryptionEnabled(context.store, context.request.getId());
    if (enabled) {
      const algorithm = context.request.getEnvironmentVariable('crypto-alg');
      const key = context.request.getEnvironmentVariable('crypto-key');

      if (!algorithm || !key) {
        console.error('Decryption failed: Missing algorithm or key in environment');
        return;
      }

      try {
        const decryptedBody = decrypt(context.response.getBody(), algorithm, key);
        context.response.setBody(decryptedBody);
      } catch (error) {
        console.error('Decryption failed:', error.message);
        context.response.setBody(`Decryption failed: ${error.message}`);
      }
    }
  }
];

module.exports.requestActions = [
  {
    label: 'Toggle Decryption',
    action: async (context, data) => {
      const { store } = context;
      const { request } = data;

      const currentState = await isResponseDecryptionEnabled(store, request._id);

      const newState = !currentState;
      await enableResponseDecryption(store, request._id, newState);
      
      context.app.alert('Crypto', `Decryption ${newState ? 'enabled' : 'disabled'} for this request`);
    }
  }
];
