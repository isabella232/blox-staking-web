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
        } else if (typeof window['ethereum'] == 'undefined') {
            return MODAL_TYPES.METAMASK_NOT_SUPPORTED;
        } else return undefined;
    }

    async connect(): Promise<void> {
        try {
            this.metaMask = window['ethereum'];
            await this.metaMask.enable();
            this.web3 = new Web3(Web3.givenProvider);
            this.networkName = NETWORK_IDS[this.metaMask.networkVersion];

            this.metaMask.on(EVENTS['networkChanged'], this.onNetworkChange);
            this.metaMask.on(EVENTS['accountsChanged'], this.onAccountChange);

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e)
        }
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

    private onNetworkChange = async (networkId) => {
        this.networkName = networkId ? NETWORK_IDS[networkId] : NETWORK_IDS[this.metaMask.networkVersion];
        this.infoUpdateCallback();
    };

    private onAccountChange = async (accountsList) => {
        accountsList.length === 0 ? this.logoutCallback() : this.infoUpdateCallback();
    };

    sendTransaction(depositTo: string, txData: string, onStart, onSuccess, onError): Promise<any> {
        const {selectedAddress} = this.metaMask;

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
<<<<<<< HEAD
            .catch((error) => Promise.reject(onError(error)));
=======
            .catch((error) => {
                onSuccess(error.message, null);
                Promise.resolve({error: error})
            });
    }

    showLoader = () => {
        return true;
>>>>>>> 3f15b43822e9227d6c03553666a35398c35cbee1
    }

    disconnect() {
        const userEvents = Object.values(EVENTS);
        const events = [...userEvents, 'connect', 'close', 'data', 'error'];
        events.forEach((eventName) => {
            this.metaMask.removeAllListeners(eventName);
        });
    }
}
