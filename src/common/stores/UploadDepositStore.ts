import {action, observable, makeObservable} from 'mobx';
import {createContext} from 'react';

class UploadDepositStore {
    depositFile = null;
    depositFileData = null;
    isLoadingFile = false;

    constructor() {
        makeObservable(this, {
            //Observable
            depositFile: observable,
            isLoadingFile: observable,
            depositFileData: observable,
            //Action
            setDepositFile: action,
            setLoadingFile: action,
            setDepositFileData: action,
        })
    }

    setDepositFile = (depositFile: any) => {
        this.depositFile = depositFile;
    };

    setDepositFileData = (depositFile: any) => {
        this.depositFileData = depositFile;
    };

    setLoadingFile = (status: boolean) => {
        this.isLoadingFile = status;
    };
}

export const UploadDepositStoreContext = createContext(new UploadDepositStore());