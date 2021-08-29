import {action, observable, makeObservable, computed} from 'mobx';
import {createContext} from 'react';
import Analytics from 'analytics';
import bloxAnalyticsPlugin from '../../service/analytics/blox-analytics-plugin';

const RELEVANT_PARAMS = [
    {name: 'id_token', mandatory: true, callback: 'setAnalytics'},
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    {name: 'network_id', mandatory: true, callback: 'setDepositContract'},
    {name: 'account_id', mandatory: true},
    {name: 'tx_data', mandatory: false, callback: 'setSeedMode'}
]

class AppStore {
    analytics;
    seedMode = true;
    transactionsInProgress = {};
    depositContract;
    queryParams = {};
    allMandatoryParamsExist = true;
    successfullyDeposited = [];


    constructor() {
        makeObservable(this, {
            //Observable
            analytics: observable,
            queryParams: observable,
            depositContract: observable,
            successfullyDeposited: observable,
            transactionsInProgress: observable,
            allMandatoryParamsExist: observable,

            //Action
            setQueryParams: action,
            addDepositedValidator: action,
            setTransactionInProgress: action,

            //computed
            isTransactionsInProgress: computed,
        })
    }

    setQueryParams(){
        const urlParams = new URLSearchParams(window.location.search);
        for (let key of RELEVANT_PARAMS) {
            if(!urlParams.get(key.name) && key.mandatory){
                this.allMandatoryParamsExist = false;
            }
            if(urlParams.get(key.name) && key.callback){
                this[key.callback](urlParams.get(key.name))
                // key.callback(this, urlParams.get(key.name))
            }
            this.queryParams[key.name] = urlParams.get(key.name);
        }
    }

    setDepositContract(networkId){
        this.depositContract = networkId === '5' ? '0x67Ce5c69260bd819B4e0AD13f4b873074D479811' : process.env.REACT_APP_MAINNET_DEPOSIT_CONTRACT_ADDRESS
    };

    addDepositedValidator = (accountId) => {
        this.successfullyDeposited.push(accountId);
    };

    setAnalytics(token){
        this.analytics = Analytics({app: 'blox-live', plugins: [bloxAnalyticsPlugin(token)]});
    };

    setSeedMode(isSeed){
        this.seedMode = !!isSeed
    };

    setTransactionInProgress = (accountId, status) => {
        if(status){
            this.transactionsInProgress[accountId] = true;
        } else {
            delete this.transactionsInProgress[accountId];
        }
    };

    get isTransactionsInProgress(){
        return Object.keys(this.transactionsInProgress).length !== 0
    }
}

export const AppStoreContext = createContext(new AppStore());