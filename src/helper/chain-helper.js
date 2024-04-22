import Web3 from 'web3';
const web3 = new Web3(window.ethereum);

export const transactionAction = async (contract, functionName, functionParams, senderAccount) => {

    try {
        // get estimated gas for the transaction
        const gasLimit =  await contract.methods[functionName](...functionParams).estimateGas({ from: senderAccount });
        // Get current gas price from the network
        const gasPrice = await web3.eth.getGasPrice();

        const transaction = await contract.methods[functionName](...functionParams).send({ from: senderAccount , gas: gasLimit ,gasPrice: gasPrice });
        const receipt = await web3.eth.getTransactionReceipt(transaction.transactionHash);              
        const txHash = receipt.transactionHash;         
        return txHash;            
    } catch (error) {
        console.log("error", error)
        return null;
    }
}
