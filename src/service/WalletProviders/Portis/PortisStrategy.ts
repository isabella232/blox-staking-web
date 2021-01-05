import Portis from "@portis/web3";
import Web3 from "web3";
import {NETWORK_IDS, NETWORK_MAP} from "./constants";
import {WalletProviderStrategy} from "../WalletProviderStrategy";


export default class PortisStrategy extends WalletProviderStrategy {

    private portis: Portis;
    private readonly networkType;
    private readonly networkVersion;
    private selectedAccount;

    constructor(networkType) {
        super();
        this.networkVersion = networkType;
        this.networkType = NETWORK_MAP[networkType];
    }

    async connect(): Promise<void> {
        try {
            this.portis = new Portis(process.env.REACT_APP_PORTIS_ID, this.networkType);  // goerli | mainnet
            this.web3 = new Web3(this.portis.provider);
            const accounts = await this.web3.eth.getAccounts();
            this.selectedAccount = accounts[0];
            this.portis.onActiveWalletChanged((walletAddress => {
                this.selectedAccount = walletAddress;
                this.infoUpdateCallback()
            }));
            return Promise.resolve()
        } catch (e) {
            return Promise.reject(e)
        }
    }

    async disconnect() {
        await this.portis.logout()
    }

    async getBalance(): Promise<string> {
        const balanceInWei = await this.web3.eth.getBalance(this.selectedAccount);
        return this.web3.utils.fromWei(balanceInWei, "ether");
    }

    getWarningModal(): string {
        return undefined;
    }

    async info(): Promise<Record<string, any>> {
        return {
            networkVersion: this.networkVersion,
            networkName: NETWORK_IDS[this.networkType],
            selectedAddress: this.selectedAccount,
            balance: await this.getBalance(),
        };
    }

    async sendTransaction(depositTo: string, txData: string, onStart, onSuccess, onError): Promise<any> {
        const param = {
            to: depositTo,
            from: this.selectedAccount,
            gas: '0x186A0', // 100k gas limit
            // gasPrice: '5208', // 0.01
            data: txData,
            value: this.web3.utils.numberToHex(this.web3.utils.toWei('32', 'ether')), // (amount * 1000000).toString(), // '32000000000',
        };

        this.web3.eth.sendTransaction(param)
            .on('transactionHash', hash=>{
                onStart(hash);
            })
            .on('receipt', receipt => {
                onSuccess(null, receipt)
            })
            .on('error', error => {
                onError(error)
            });
    }

    showLoader = () => {
        return true;
    }
}
