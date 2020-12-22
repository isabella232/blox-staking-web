import React from 'react';
import { MetaMaskNotFoundModal, BrowserNotSupported, WrongNetworkModal } from '../StakingDeposit/components';
import { MODAL_TYPES } from './constants';

const ModalsManager = ({modal, onClose}: Props) => {
  if(modal) {
    const { show, type, params } = modal;
    if(show) {
      switch (type) {
        case MODAL_TYPES.METAMASK_NOT_SUPPORTED:
          return <MetaMaskNotFoundModal onClose={onClose} />;
        case MODAL_TYPES.BROWSER_NOT_SUPPORTED:
          return <BrowserNotSupported onClose={onClose} />;
        case MODAL_TYPES.WRONG_NETWORK:
          return <WrongNetworkModal networkType={params?.networkId} onClose={onClose} />;
        case MODAL_TYPES.LEDGER:
          return <div>abc</div>;
        case MODAL_TYPES.TREZOR:
          return <div>abc</div>;        
        default:
          return null;
      }
    };
    return null;
  }
  return null;
};

type Props = {
  modal: Record<string, any>;
  onClose: () => void;
};

export default ModalsManager;