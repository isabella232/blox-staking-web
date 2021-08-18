import Web3 from "web3";


export abstract class WalletProviderStrategy{

    protected web3: Web3;
    protected timer= {};
    protected infoUpdateCallback: () => void;
    protected logoutCallback: () => void;

    abstract connect();
    abstract disconnect()
    abstract getBalance(): Promise<string>
    getWarningModal(): string{
        return undefined
    }
    abstract info(): Record<string, any>
    abstract sendTransaction(depositTo: string, accountId: number, txData: string, onStart, onSuccess, onError, depositData?: any);

    subscribeToUpdate(callback) {
        this.infoUpdateCallback = callback;
    }
    subscribeToLogout(callback){
        this.logoutCallback = callback;
    }
    getReceipt = async (txHash) => {
        try {
            return await this.web3.eth.getTransactionReceipt(txHash);
        }
        catch(error) {
            return error.message;
        }
    };
    protected subscribeToTransactionReceipt = (txHash, onSuccess, accountId) => {
        const callback = (error, txReceipt) => {
            if(error || txReceipt) {
                if (this.timer[txHash]) clearInterval(this.timer[txHash]);
            }
            if(error) {
                onSuccess(error, null, accountId);
            }
            if(txReceipt) {
                onSuccess(null, txReceipt, accountId);
            }
        };
        this.timer[txHash] = setInterval(() => {
            this.web3.eth.getTransactionReceipt(txHash, callback);
        }, 3000);
    };
    showLoader = (): boolean => {
        return false;
    }
}
