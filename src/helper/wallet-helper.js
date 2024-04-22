import Web3 from 'web3';
import contract from '../contracts/contract.json';
import config from '../config/config.json';

const networkId = config.json.NETWORK_ID;
const contractAddress = config.json.CONTRACT;
const web3 = new Web3(networkId);

export const getChaindetailsFromHost = async (contractAdd = null, domainToGet = null) => {

    const contractMethods = new web3.eth.Contract(contract.storageContract, contractAddress);
    const hostAddress = await contractMethods.methods.constRegistryAddress().call();
    const hostContractMethods = new web3.eth.Contract(contract.hostContract, hostAddress);
    const retrivedAddress = await hostContractMethods.methods.getChainDetails(config.json.DOMAIN).call();

    try {
        const chainJson = JSON.parse(retrivedAddress["1"]);
        return chainJson;
    } catch (error) {
        console.log(error);
    }

    return null;
} 