import axios from "axios";
import {BUTTON_STATE} from '../StakingDeposit/constants';

export const readFile = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(){
            if (typeof reader.result === "string") {
                const publicKeys = JSON.parse(reader.result)
                //TODO: if file contains all the relevant keys
                if(!Array.isArray(publicKeys)){
                    resolve(false);
                }
                resolve(publicKeys);
            }
        };
        reader.onerror = function (){
            resolve(false);
        }
        reader.readAsText(file);
    });
}

export const getAccounts = async (id_token: string, id: string, onSuccess?: any) => {
    try {
        const res = await axios({
            url: `${process.env.REACT_APP_API_URL}/accounts${ id ? `?id=${id}` : ''}`,
            method: 'get',
            responseType: 'json',
            headers: {Authorization: `Bearer ${id_token}`},
        });
         onSuccess && onSuccess(res.data);
        return res.data;
    } catch (error) {
        return 'Error';
    }
};

export const doubleDepositProtection = async (id_token: string, network: string, accounts: any) => {
    try {
        const networkParsed = network === '5' ? 'prater' : 'mainnet'
        const res = await axios({
            url: `${process.env.REACT_APP_API_URL}/ethereum2/validators-deposits/?network=${networkParsed}&publicKeys=${accounts.join(',')}`,

            method: 'get',
            responseType: 'json',
            headers: {Authorization: `Bearer ${id_token}`},
        });
        return res.data;
    } catch (error) {
        return error;
    }
};

export const verifyDepositFile = async (depositFile: any, validators: Array<any>) => {
    let allPublicKeyExist = true;
    const depositPublicKeys = depositFile.map(validator => validator.pubkey);
    const keyStoresPublicKeys = validators.map(validator => validator.publicKey);
    keyStoresPublicKeys.forEach((publicKey) => {
        if (depositPublicKeys.indexOf(publicKey.replace(/^0x/, '')) === -1) {
            allPublicKeyExist = false;
        }
    });
    return allPublicKeyExist
};

export const prefix0x = (key: string) => {
    return `0x${key}`;
};

export const buttonText = (buttonState: string) => {
    let buttonText;
    switch (buttonState) {
        case BUTTON_STATE.WAITING_FOR_CONFIRMATION.key:
            buttonText = BUTTON_STATE.WAITING_FOR_CONFIRMATION.value
            break;
        case BUTTON_STATE.PENDING.key:
            buttonText = BUTTON_STATE.PENDING.value
            break;
        case BUTTON_STATE.DEPOSITED.key:
            buttonText = BUTTON_STATE.DEPOSITED.value
            break;
        case BUTTON_STATE.ERROR.key:
            buttonText = BUTTON_STATE.ERROR.value
            break;
        default:
            buttonText = BUTTON_STATE.DEPOSIT.value
            break;
    }
    return buttonText
}