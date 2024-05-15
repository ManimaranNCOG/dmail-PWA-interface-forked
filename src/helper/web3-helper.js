import Web3 from 'web3';
export const web3AccountCheck = async (setWeb3 , setAccount) => {

    if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
  
        // Check if user is already connected
        window.ethereum
          .request({ method: 'eth_accounts' })
          .then(accounts => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
            }
          })
          .catch(err => console.error(err));
  
        // Listen for account changes
        window.ethereum.on('accountsChanged', accounts => {
          setAccount(accounts[0] || '');
        });
      } else {
        console.log('MetaMask is not installed');
      }

} 


export const getAccountBalance = async (web3, account) => {
  const balance = await web3.eth.getBalance(account);
  return web3.utils.fromWei(balance, 'ether');
}