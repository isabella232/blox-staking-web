import Web3 from "web3";


export abstract class WalletProviderStrategy{

    protected web3: Web3;
    protected timer=null;

    abstract connect();
    abstract disconnect()
    abstract getBalance(): Promise<string>
    getWarningModal(): string{
        return undefined
    }
    abstract info(): Record<string, any>
    abstract sendTransaction(depositTo: string, txData: string, onStart, onSuccess);
    subscribeToEvent(eventName, callback){
        console.info(eventName, callback)
    }
    getReceipt = async (txHash, onSuccess) => {
        try {
            return await this.web3.eth.getTransactionReceipt(txHash, onSuccess);
        }
        catch(error) {
            return error.message;
        }        
    };
    protected subscribeToTransactionReceipt = (txHash, onSuccess) => {
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
        };
        this.timer = setInterval(() => {
            this.web3.eth.getTransactionReceipt(txHash, callback);
        }, 3000);
    };
}
