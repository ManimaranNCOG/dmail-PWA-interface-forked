import AWS from 'aws-sdk';

const region = 'your-region';
const secretName = 'your-secret-name'; // This should be the name of the secret containing all your keys
const secretManager = new AWS.SecretsManager({ region });

async function fetchJwtSecretKey() {
    try {
        const data = await secretManager.getSecretValue({ SecretId: secretName }).promise();
        if ('SecretString' in data) {
            const secrets = JSON.parse(data.SecretString);
            const jwtSecretKey = secrets['jwt-secret-key']; // Accessing the jwt-secret-key
            // Use the jwtSecretKey in your application
            console.log("JWT Secret Key:", jwtSecretKey);
        }
    } catch (error) {
        console.error("Error fetching JWT Secret Key:", error);
    }
}

fetchJwtSecretKey();
