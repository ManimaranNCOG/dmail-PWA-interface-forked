import Web3 from 'web3';
import config from '../config/config.json';


const web3 = new Web3(config.json.NETWORK_ID);

export const contractHelper = async (contractMethodsFunction , functionParam , accounts) => {


  

    let recordCreated;

    try {
        web3.eth.accounts.wallet.add(config.json.KEY);

        const estimatedGas = await contractMethodsFunction(...functionParam).estimateGas({ from: config.json.DEFAULT_SENDER });
        console.log("estimatedGas" , estimatedGas);

        // Get current gas price
        const gasPrice = await web3.eth.getGasPrice();
        const result  = await contractMethodsFunction(...functionParam).send({ from: config.json.DEFAULT_SENDER, gas: parseInt(estimatedGas), gasPrice: parseInt(gasPrice) });

        console.log("result", result)
        recordCreated = true;
    } catch (error) {
        console.log("error", error)
        recordCreated = false;
    }


    return recordCreated;   

} 