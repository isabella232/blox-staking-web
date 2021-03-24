import { MetaMaskNotFoundModal, BrowserNotSupported, WrongNetworkModal, LedgerModal, TrezorModal } from '../StakingDeposit/components';
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
          return <WrongNetworkModal networkType={params?.networkType} onClose={onClose} />;
        case MODAL_TYPES.LEDGER:
          return <LedgerModal onClose={params.onClose ?? onClose} onClick={params.onClick} />;
        case MODAL_TYPES.TREZOR:
          return <TrezorModal onClose={params.onClose ?? onClose} onClick={params.onClick} />;
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
