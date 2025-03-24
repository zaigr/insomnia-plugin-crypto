const { Buffer } = require('buffer');

const {
  setFeature,
  isFeatureEnabled,
  enableRequestEncryption,
  enableResponseDecryption
} = require('./store');

const {
  encrypt,
  decrypt,
} = require('./encrypt');

const ALGORITHM_ENV = 'crypto-alg';
const KEY_ENV = 'crypto-key';
const USE_BASE64 = 'crypto-base64';

const alertOnMissingEnvConfig = (title, context) => {
  console.error(`${title}: Missing algorithm or key in environment`);
  context.app.alert(title, 'Missing algorithm or key in environment variables. '
    + `Please set the following environment variables: '${ALGORITHM_ENV}' '${KEY_ENV}'`);
};

module.exports.responseHooks = [
  async (context) => {
    const enabled = await isFeatureEnabled(context.store, context.request.getId(), enableResponseDecryption);
    if (enabled) {
      const algorithm = context.request.getEnvironmentVariable(ALGORITHM_ENV);
      const key = context.request.getEnvironmentVariable(KEY_ENV);

      if (!algorithm || !key) {
        alertOnMissingEnvConfig('Response Decryption Failed', context);
        return;
      }

      const useBase64 = context.request.getEnvironmentVariable(USE_BASE64) ?? true;
      try {
        const bodyBuffer = await context.response.getBody();
        const body = useBase64 ? Buffer.from(bodyBuffer.toString('utf-8'), 'base64') : bodyBuffer;

        const decryptedBody = decrypt(body, algorithm, key);
        context.response.setBody(decryptedBody);
      } catch (error) {
        context.app.alert('Decryption failed:', error.message);
      }
    }
  }
];

module.exports.requestHooks = [
  async (context) => {
    const enabled = await isFeatureEnabled(context.store, context.request.getId(), enableRequestEncryption);
    if (enabled) {
      const algorithm = context.request.getEnvironmentVariable(ALGORITHM_ENV);
      const key = context.request.getEnvironmentVariable(KEY_ENV);

      if (!algorithm || !key) {
        alertOnMissingEnvConfig('Request Encryption Failed', context);
        return;
      }

      const useBase64 = context.request.getEnvironmentVariable(USE_BASE64) ?? true;
      try {
        const encryptedBody = encrypt(context.request.getBody().text, algorithm, key);
        context.request.setBody({ text: encryptedBody.toString(useBase64 ? 'base64' : 'binary') });
      } catch (error) {
        context.app.alert('Encryption failed:', error.message);
      }
    }
  }
];

module.exports.requestActions = [
  {
    label: 'Toggle Response Decryption',
    action: async (context, data) => {
      const { store } = context;
      const { request } = data;

      const currentState = await isFeatureEnabled(store, request._id, enableResponseDecryption);

      const newState = !currentState;
      await setFeature(store, request._id, enableResponseDecryption, newState);

      context.app.alert('Crypto', `Response decryption ${newState ? 'enabled' : 'disabled'} for this request`);
    }
  },
  {
    label: 'Toggle Request Encryption',
    action: async (context, data) => {
      const { store } = context;
      const { request } = data;

      const currentState = await isFeatureEnabled(store, request._id, enableRequestEncryption);

      const newState = !currentState;
      await setFeature(store, request._id, enableRequestEncryption, newState);

      context.app.alert('Crypto', `Request encryption ${newState ? 'enabled' : 'disabled'} for this request`);
    }
  }
];
