import PortisStrategy from "./Portis/PortisStrategy";
import MetaMaskStrategy from "./Metamask/MetaMaskStrategy";
import {WalletProviderStrategy} from "./WalletProviderStrategy";


export default class WalletProvidersContext {

    protected providerType: string;
    private _strategy: WalletProviderStrategy;


    constructor(walletProvider: string, networkType:string) {
        this.providerType = walletProvider;
        switch (walletProvider) {
            case "portis":
                this._strategy = new PortisStrategy(networkType);
                break;
            case "ledger":
            case "trezor":
            case "metamask":
                this._strategy = new MetaMaskStrategy();
                break;
            default:
                throw Error('No such wallet provider!')
        }
    }


    set strategy(value: WalletProviderStrategy) {
        this._strategy = value;
    }

    public  getWarningModal() : string{
        return this._strategy.getWarningModal();
    }

    public async connect() {
        return this._strategy.connect();
    }

    public async getInfo(){
        return this._strategy.info();
    }

    public subscribeToEvent(event: string, callback){
        return this._strategy.subscribeToEvent(event, callback);
    }

    public sendSignTransaction(depositTo: string, txData: string, onStart, onSuccess): void {
        return this._strategy.sendTransaction(depositTo, txData, onStart, onSuccess);
    };

    public disconnect(){
        return this._strategy.disconnect();
    }
}
