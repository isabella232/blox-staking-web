import Web3 from 'web3';
import { EVENTS } from './constants';

export default class MetaMask {
  constructor(props) {
    this.metaMask = window.ethereum; 
    this.accounts = [];
    this.web3 = {};
    this.depositTo = props.depositTo;
    this.txData = props.txData;
    this.timer = null;
  }

  isExist = () => typeof this.metaMask !== 'undefined' && this.metaMask.isMetaMask;

  enableAccounts = async () => {
    const accounts = await this.metaMask.enable();
    this.web3 = new Web3(Web3.givenProvider);
    this.accounts = accounts;
    return accounts;
  };

  getBalance = async (accountId) => {
    const balanceInWei = await this.web3.eth.getBalance(accountId);
    return await this.web3.utils.fromWei(balanceInWei, "ether");
  };

  sendEthersTo = (onStart, onSuccess) => new Promise((resolve, reject) => {
    const { selectedAddress } = this.metaMask; 

    const method = 'eth_sendTransaction';
    const from = selectedAddress

    const params = [
      {
        from,
        to: this.depositTo,
        gas: '0x61A80', // 0.01
        gasPrice: '5208', // 0.01
        value: this.web3.utils.numberToHex(this.web3.utils.toWei('32', 'ether')), // (amount * 1000000).toString(), // '32000000000'
        data: this.txData,
      },
    ];

    const configObject = {method, params};
    return this.metaMask.request(configObject)
    .then((response) => {
      onStart(response);
      this.subscribeToTransactionReceipt(response, onSuccess);
      resolve(response);
    })
    .catch((error) => reject(error));
  });

  subscribeToChange = (eventName, callback) => {
    if(!EVENTS[eventName]) { return; }
    this.web3 = new Web3(Web3.givenProvider);
    this.metaMask.on(EVENTS[eventName], callback);
  };

  subscribeToTransactionReceipt = (txHash, onSuccess) => {
    const callback = (error, txReceipt) => {
      if(error || txReceipt) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if(error) {
        onSuccess(error, null);
      }
      if(txReceipt) {
        onSuccess(null, txReceipt);
      }
    }
    this.timer = setInterval(() => {
      this.web3.eth.getTransactionReceipt(txHash, callback);
    }, 3000);
  };

  disconnect = () => {
    const userEvents = Object.values(EVENTS);
    const events = [...userEvents ,'connect', 'close', 'data', 'error'];
    events.forEach((eventName) => {
      this.metaMask.removeAllListeners(eventName);
    });
  }
}
