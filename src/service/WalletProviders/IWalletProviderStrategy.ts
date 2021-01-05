


export default interface IWalletProviderStrategy {
    getWarningModal():string;
    connect();
    info():Record<string, any>;
    getBalance(): Promise<string>;
    subscribeToEvent(eventName, callback);
    sendTransaction(depositTo: string, txData: string, onStart, onSuccess);
    disconnect();
}
