import AWS from 'aws-sdk';

const secretsManager = new AWS.SecretsManager();

async function getConfig() {
    try {
        const data = await secretsManager.getSecretValue({ SecretId: '<your-secret-id>' }).promise();
        const encryptedConfig = data.SecretBinary; // Assuming the secret value is stored as binary
        const decryptedConfig = await decryptConfig(encryptedConfig);
        const config = JSON.parse(decryptedConfig);
        return config;
    } catch (error) {
        console.error('Error retrieving and decrypting secret:', error);
        throw error;
    }
}

async function decryptConfig(encryptedConfig) {
    const kms = new AWS.KMS();
    const params = { CiphertextBlob: encryptedConfig };
    const data = await kms.decrypt(params).promise();
    return data.Plaintext.toString();
}

// Usage example:
getConfig().then(config => {
    console.log('Decrypted configuration:', config);
}).catch(error => {
    console.error('Error getting configuration:', error);
});
