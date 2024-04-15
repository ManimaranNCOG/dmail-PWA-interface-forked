# bmail-ui-frontend

## Overview
bmail-ui-frontend is a React.js-based frontend application for interacting with emails, designed to support both Web3 and Web2 technologies. It provides a user-friendly interface for managing email interactions in a modern web environment.

## Configuration
Before running the application, you need to set up your configuration values. Locate the `config.json` file in the project root and update it with your specific values:

```json
{
    "CONTRACT": "YOUR_CONTRACT_ADDRESS",
    "NETWORK_ID": "YOUR_NETWORK_ID",
    "KEY": "YOUR_API_KEY",
    "DEFAULT_SENDER": "YOUR_DEFAULT_SENDER_ADDRESS"
}
```

Replace the placeholder values (`YOUR_CONTRACT_ADDRESS`, `YOUR_NETWORK_ID`, `YOUR_API_KEY`, `YOUR_DEFAULT_SENDER_ADDRESS`) with your actual contract address, network ID, API key, and default sender address respectively.


## Installation
1. Clone the repository:
   ```
   git clone <git url>
   ```
2. Navigate to the project directory:
   ```
   cd bmail-ui-frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage
1. Configure your application using the instructions provided above.
2. Start the development server:
   ```
   npm start
   ```
3. Open your web browser and navigate to (domain) to access the application.


## Acknowledgements
- [React.js](https://reactjs.org/) - A JavaScript library for building user interfaces.
- [Web3.js](https://web3js.readthedocs.io/en/v1.3.4/) - Ethereum JavaScript API.

```

In this updated README file, I've included a "Configuration" section with instructions for users to update their `config.json` file with their own values before running the application.