import WalletProviderStrategy from "../WalletProviderStrategy";
import Portis from "@portis/web3";
import Web3 from "web3";
import {NETWORK_IDS, NETWORK_MAP} from "./constants";



export default class PortisStrategy implements WalletProviderStrategy{

    private portis : Portis;
    private web3: Web3;
    private readonly networkType;
    private readonly networkVersion;
    private selectedAccount;

    constructor(networkType) {
        this.networkVersion = networkType;
        this.networkType = NETWORK_MAP[networkType];
    }

    async connect() : Promise<void>{
        this.portis = new Portis(process.env.REACT_APP_PORTIS_ID, this.networkType);  // goerli | mainnet
        this.web3 = new Web3(this.portis.provider);
        try {
            const accounts = await this.web3.eth.getAccounts();
            this.selectedAccount = accounts[0]
            return Promise.resolve()
        }catch (e) {
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

    sendTransaction(depositTo: string, txData: string, onStart, onSuccess) {
        console.log(depositTo, txData, onStart, onSuccess)
    }

    subscribeToEvent(eventName, callback) {
        return [eventName, callback];
    }


}
