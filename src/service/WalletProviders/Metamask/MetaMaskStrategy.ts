import Web3 from "web3";
import {EVENTS, NETWORK_IDS} from "./constants";
import {MODAL_TYPES} from "../../../components/ModalsManager/constants";
import {detect} from "detect-browser";
import {WalletProviderStrategy} from "../WalletProviderStrategy";


export default class MetaMaskStrategy extends WalletProviderStrategy {

    private metaMask;
    private networkName: string;

    getWarningModal(): string {
        const browser = detect();
        if (browser.name !== 'chrome' && browser.name !== 'firefox') {
            return MODAL_TYPES.BROWSER_NOT_SUPPORTED;
        } else if (typeof window['ethereum'] == 'undefined'/*typeof this.metaMask !== 'undefined' && this.metaMask.isMetaMask*/) {
            return MODAL_TYPES.METAMASK_NOT_SUPPORTED;
        } else return undefined;
    }


    async connect(): Promise<void> {
        try {
            this.metaMask = window['ethereum'];
            await this.metaMask.enable();
            this.web3 = new Web3(Web3.givenProvider);
            this.networkName = NETWORK_IDS[this.metaMask.networkVersion];

            this.subscribeToEvent('networkChanged', this.onNetworkChange);
            return Promise.resolve();
        }catch (e) {
            return Promise.reject(e)
        }
    }

    onNetworkChange(networkId){
        this.networkName = networkId ? NETWORK_IDS[networkId] : NETWORK_IDS[this.metaMask.networkVersion];
    }

    async info(): Promise<Record<string, any>> {
        const {networkVersion, selectedAddress} = this.metaMask;
        return {
            networkVersion: networkVersion,
            networkName: this.networkName,
            selectedAddress: selectedAddress,
            balance: await this.getBalance(),
        };
    }

    async getBalance(): Promise<string> {
        const balanceInWei = await this.web3.eth.getBalance(this.metaMask.selectedAddress);
        return this.web3.utils.fromWei(balanceInWei, "ether");
    }


    subscribeToEvent(eventName, callback) {
        if (!EVENTS[eventName]) {
            return;
        }
        this.web3 = new Web3(Web3.givenProvider);
        this.metaMask.on(EVENTS[eventName], callback);
    }


    sendTransaction(depositTo: string, txData: string, onStart, onSuccess, onError) : Promise<any>{
        const { selectedAddress } = this.metaMask;

        const method = 'eth_sendTransaction';
        const from = selectedAddress;

        const params = [
            {
                from,
                to: depositTo,
                gas: '0x61A80', // 0.01
                gasPrice: '5208', // 0.01
                value: this.web3.utils.numberToHex(this.web3.utils.toWei('32', 'ether')), // (amount * 1000000).toString(), // '32000000000'
                data: txData,
            },
        ];

        const configObject = {method, params};
        return this.metaMask.request(configObject)
            .then((response) => {
                onStart(response);
                this.subscribeToTransactionReceipt(response, onSuccess);
                Promise.resolve(response);
            })
            .catch((error) => Promise.reject(onError(error)));
    }

    disconnect() {
        const userEvents = Object.values(EVENTS);
        const events = [...userEvents, 'connect', 'close', 'data', 'error'];
        events.forEach((eventName) => {
            this.metaMask.removeAllListeners(eventName);
        });
    }
}
