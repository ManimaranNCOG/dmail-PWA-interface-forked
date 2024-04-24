import Web3 from 'web3'; // Importing Web3 library
import contract from '../contracts/contract.json'; // Importing contract JSON file
import config from '../config/config.json'; // Importing config JSON file

// Extracting contract address from config file
const contractAddress = config.json.CONTRACT;

// Initializing Web3 with the injected Ethereum provider (e.g., MetaMask)
const web3 = new Web3(window.ethereum);

// Function to get chain details from the host contract
export const getChainDetailsFromHost = async (domain) => {
    // Creating contract instance for the storage contract
    const contractMethods = new web3.eth.Contract(contract.storageContract, contractAddress);

    // Calling the method to get the registry address
    const hostAddress = await contractMethods.methods.constRegistryAddress().call();

    // Creating contract instance for the host contract
    const hostContractMethods = new web3.eth.Contract(contract.hostContract, hostAddress);

    // Calling the method to get chain details for the given domain
    const retrivedAddress = await hostContractMethods.methods.getChainDetails(domain).call();

    // Parsing the retrieved chain details JSON string
    try {
        const chainJson = JSON.parse(retrivedAddress["1"]);
        return chainJson;
    } catch (error) {
        console.log(error); // Logging any parsing errors
    }

    return null; // Returning null if parsing fails or no chain details found
} 
