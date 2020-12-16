import Web3 from 'web3';
import { EVENTS } from './constants';

export default class MetaMask {
  constructor(props) {
    this.metaMask = window.ethereum; 
    this.accounts = [];
    this.web3 = {};
    this.depositTo = props.depositTo // 0x4e409dB090a71D14d32AdBFbC0A22B1B06dde7dE amitai
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

  sendEthersTo = (callback) => new Promise((resolve, reject) => {
    const { selectedAddress } = this.metaMask;

    const method = 'eth_sendTransaction';
    const from = selectedAddress

    const params = [
      {
        from,
        to: this.depositTo,
        gas: '0x61A80', // 0.01
        gasPrice: '5208', // 0.01
        value: this.web3.utils.numberToHex(this.web3.utils.toWei('1', 'ether')), // (amount * 1000000).toString(), // '32000000000'
      },
    ];

    const configObject = {method, params};
    return this.metaMask.request(configObject)
    .then((response) => {
      this.subscribeToTransactionReceipt(response);
      callback(response);
      resolve(response);
    })
    .catch((error) => reject(error));
  });

  subscribeToChange = (eventName, callback) => {
    if(!EVENTS[eventName]) { return; }
    this.web3 = new Web3(Web3.givenProvider);
    this.metaMask.on(EVENTS[eventName], callback);
  };

  subscribeToTransactionReceipt = (response) => { // TODO: stop the interval
    let data = null;

    const callback = (error, txReceipt) => {
      data = txReceipt;
    }

    let timer = setInterval(() => {
      this.web3.eth.getTransactionReceipt(response, callback);
    }, 3000);

    if(data) {
      debugger;
      clearInterval(timer);
      timer = null;
      return data.status;
    }
  };
}
