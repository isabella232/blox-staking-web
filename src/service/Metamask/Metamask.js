import Web3 from 'web3';
import { EVENTS } from './constants';

export default class MetaMask {
  constructor() {
    this.metaMask = window.ethereum; 
    this.accounts = [];
    this.web3 = {};
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

  sendEthersTo = ({amount, ...depositData}, accounts) => new Promise((resolve, reject) => {
    const { selectedAddress, networkVersion } = this.metaMask;
    const { publicKey, withdrawalCredentials, signature, depositDataRoot } = depositData;

    const depositContractABI = require('./deposit_tx2.json');
    const depositTo = '0x16e82d77882a663454ef92806b7deca1d394810f';

    const web3 = new Web3();
    const depositContract = new web3.eth.Contract(depositContractABI, depositTo);

    if(networkVersion !== '5') {
      reject(new Error('Please choose Goerli network in Metamask before deposit'));
      return;
    }

    const method = 'eth_sendTransaction';

    const depositMethod = depositContract.methods.deposit(
      `0x${publicKey}`, `0x${withdrawalCredentials}`, `0x${signature}`, `0x${depositDataRoot}`,
    );

    const data = depositMethod.encodeABI();
    const from = selectedAddress || accounts[0];   

    const params = [
      {
        from,
        to: depositTo,
        gas: '0x61A80', // 0.01
        gasPrice: '5208', // 0.01
        value: this.web3.utils.numberToHex(this.web3.utils.toWei('32', 'ether')), // (amount * 1000000).toString(), // '32000000000'
        data,
      },
    ];

    const configObject = {method, params, from};
    return this.metaMask.sendAsync(configObject, (error, response) => {
      if(error) { reject(error); }
      console.log('response', response);
      resolve(response.result);
    });
  });

  subscribeToChange = (eventName, callback) => {
    if(!EVENTS[eventName]) { return; }
    this.web3 = new Web3(Web3.givenProvider);
    this.metaMask.on(EVENTS[eventName], callback);
  };
}
