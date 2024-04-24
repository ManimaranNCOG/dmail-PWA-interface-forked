import Web3 from 'web3';
const web3 = new Web3(window.ethereum);

// Common transaction method for all the write operation
export const transactionAction = async (contract, functionName, functionParams, senderAccount) => {

    try {
        // get estimated gas for the transaction
        const gasLimit =  await contract.methods[functionName](...functionParams).estimateGas({ from: senderAccount });
        
        // Get current gas price from the network
        const gasPrice = await web3.eth.getGasPrice();
        
        // Send the transaction
        const transaction = await contract.methods[functionName](...functionParams).send({ from: senderAccount , gas: gasLimit ,gasPrice: gasPrice });
        
        // Get transaction receipt
        const receipt = await web3.eth.getTransactionReceipt(transaction.transactionHash);            
        
        // Extract transaction hash
        const txHash = receipt.transactionHash;         
        return txHash;            
    } catch (error) {
        console.log("error", error)
        return null;
    }
}
