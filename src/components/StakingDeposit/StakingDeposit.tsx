import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { detect } from 'detect-browser';

import Metamask from 'service/Metamask';
import {NETWORK_IDS} from 'service/Metamask/constants';

import {
    Wrapper, Section, Title, SubTitle, Total, ErrorMessage, StepsBoxes,
    ConnectedWallet, NeedGoETH, DepositMethod, ConnectWalletButton, Faq, SecurityNotification
} from './components';
import { Icon } from 'common/components';

import {STEP_BOXES} from './constants';
import parsedQueryString from 'common/helpers/getParsedQueryString';
import {notification} from 'antd';

import ModalsManager from '../ModalsManager';
import useModals from '../ModalsManager/useModals';
import { MODAL_TYPES } from '../ModalsManager/constants';

const qsObject: Record<string, any> = parsedQueryString(location.search);
const {network_id, deposit_to, public_key, account_id, tx_data, id_token} = qsObject; // TODO: replace account id with of public key

const browser = detect();

const initialMetamaskInfoState = {
    networkVersion: '',
    networkName: '',
    selectedAddress: '',
    balance: '',
};

const initialErrorState = {type: '', message: ''};

const metamask = new Metamask({depositTo: deposit_to, txData: tx_data});

const StakingDeposit = () => {
  const [ metamaskInfo, setMetamaskInfo ] = useState(initialMetamaskInfoState);
  const [ checkedTerms, setCheckedTermsStatus ] = useState(false);
  const [ error, setError ] = useState(initialErrorState);
  const [ stepsData, setStepsData ] = useState(STEP_BOXES);
  const [ isLoadingDeposit, setDepositLoadingStatus ] = useState(false);
  const [ isDepositSuccess, setDepositSuccessStatus ] = useState(false);
  const [ txHash, setTxHash ] = useState('');
  const [ oneTimeWrongNetworkModal, setOneTimeWrongNetworkModal ] = useState(false);
  const [showSecurityNotification, setSecurityNotificationDisplay] = React.useState(true);

  const { showModal, hideModal, modal } = useModals();

  const areNetworksEqual = network_id === metamaskInfo.networkVersion;

  useEffect(() => {
    const placement = 'bottomRight';
    notification.config({ placement });
    setTimeout(() => setSecurityNotificationDisplay(false), 5000);
    // window.history.replaceState(null, null, window.location.pathname);

    if(browser.name !== 'chrome' && browser.name !== 'firefox') {
      showModal({ show: true, type: MODAL_TYPES.BROWSER_NOT_SUPPORTED });
      return;
    }
    !metamask.isExist() && showModal({ show: true, type: MODAL_TYPES.METAMASK_NOT_SUPPORTED });
  }, []);

  useEffect(() => {
    if(qsObject.network_id && metamaskInfo.networkVersion && !areNetworksEqual) {
      setError({type: 'networksNotEqual', message: `Please change to ${NETWORK_IDS[network_id]}`,});
      if (!oneTimeWrongNetworkModal) {
        setOneTimeWrongNetworkModal(true);
        showModal({ show: true, type: MODAL_TYPES.WRONG_NETWORK, params: { networkType: network_id.toString() } });
    }
    }
    else if(metamaskInfo.balance !== '' && Number(metamaskInfo.balance) < 33) {
      setError({type: 'lowBalance', message: 'Insufficient balance in selected wallet'});
    }
    else {
      setError({type: '', message: ''});
    }
  }, [qsObject, metamaskInfo]);


  const onLedgerClick = () => {
    if(!metamask.isExist()) {
      showModal({ show: true, type: MODAL_TYPES.METAMASK_NOT_SUPPORTED });
      return;
    }

    showModal({ show: true, type: MODAL_TYPES.LEDGER,
      params: { onClick: () => {
        hideModal();
        connectAndUpdateMetamask();
      } } }
    );
  }

  const onTrezorClick = () => {
    if(!metamask.isExist()) {
      showModal({ show: true, type: MODAL_TYPES.METAMASK_NOT_SUPPORTED });
      return;
    }
    showModal({ show: true, type: MODAL_TYPES.TREZOR,
      params: { onClick: () => {
        hideModal();
        connectAndUpdateMetamask();
      } } }
    );
  }

  const connectAndUpdateMetamask = async () => {
    if(!metamask.isExist()) {
      showModal({ show: true, type: MODAL_TYPES.METAMASK_NOT_SUPPORTED });
      return;
    }
    setSecurityNotificationDisplay(false);
    await connectMetamask();
    await updateMetamaskInfo();
  };

  const onNetworkChange = (networkId) => updateMetamaskInfo(networkId, null)

  const onAccountChange = (accountsList) => {
    accountsList.length === 0 ? disconnect() : updateMetamaskInfo(null, accountsList);   
  };

  const connectMetamask = async () => {
    try {
      await metamask.enableAccounts();
      await metamask.subscribeToChange('networkChanged', onNetworkChange); // TODO: change to chainId
      await metamask.subscribeToChange('accountsChanged', onAccountChange);
      notification.success({ message: '', description: 'Successfully connected to MetaMask' });
    }
    catch(e) { throw new Error(e.message); }
  };

  const updateMetamaskInfo = async (networkId?, accountId?) => {
    const { networkVersion, selectedAddress } = metamask.metaMask;
    const networkName = networkId ? NETWORK_IDS[networkId] : NETWORK_IDS[networkVersion];
    const account = accountId?.length === 1 ? accountId[0] : selectedAddress;
    const balance = await metamask.getBalance(account);
    setMetamaskInfo((prevState) => ({ ...prevState, networkName, networkVersion, selectedAddress: account, balance }));
  };

    const sendAccountUpdate = async (deposited, txHash, onSuccess, onFailure) => {
        try {
            const res = await axios({
                url: `${process.env.REACT_APP_API_URL}/accounts/${account_id}`,
                method: 'patch',
                data: {deposited: deposited, depositTxHash: txHash},
                responseType: 'json',
                headers: {Authorization: `Bearer ${id_token}`},
            });
            onSuccess(res.data);
        } catch (error) {
            console.log(`Error updating account - ${error}`);
            onFailure(error);
        }
    };

    const onDepositStart = () => { 
      // TODO:
      // check if txHash exist in db
      // if no continue
      // if yes check if it's deposited true
      // if no check it's status on web3
      // if yes cancel deposit and fire notification

        const onStart = async (txHash) => {
            setTxHash(txHash);
            setDepositLoadingStatus(true);
            await sendAccountUpdate(false, txHash, () => {
                notification.success({message: '', description: `Transaction hash: ${txHash}`});
                return;
            }, () => {
                return;
            });
        };

        const onSuccess = async (error, txReceipt) => {
          const etherscanLink = network_id === '1' ? 'https://etherscan.io/tx/' : 'https://goerli.etherscan.io/tx/';
            setDepositLoadingStatus(false);
            if (error) {
                notification.error({message: '', description: error});
            } else if (txReceipt) {
                if (txReceipt.status) {
                    await sendAccountUpdate(true, txReceipt.transactionHash, () => {}, () => {});
                    notification.success({message: '', description: <div>
                      Successfully deposited 32 ETH to {deposit_to}
                      <a href={`${etherscanLink}${txHash}`} rel="noreferrer" target={'_blank'}>
                        <Icon name={'close'} color={'primary900'} fontSize={'16px'} />
                      </a>
                    </div>});
                    setDepositSuccessStatus(true);
                }else {
                    notification.error({message: '', description: `Failed to send transaction`});
                }
            }
        };

        metamask.sendEthersTo(onStart, onSuccess);
    };

    const disconnect = () => {
        setMetamaskInfo(initialMetamaskInfoState);
        metamask.disconnect();
    };

  if(network_id && deposit_to && public_key) {
    const desktopAppLink = `blox-live://tx_hash=${txHash}&account_id=${account_id}&network_id=${network_id}&deposit_to=${deposit_to}`;
    return (
      <Wrapper>
        <Title>{network_id === "1" ? 'Mainnet' : 'Testnet'} Staking Deposit</Title>
        <Section>
          <SubTitle>Deposit Method</SubTitle>
          <DepositMethod>
            {metamaskInfo.selectedAddress ?
              (<ConnectedWallet metamaskInfo={metamaskInfo} areNetworksEqual={areNetworksEqual} error={error} onDisconnect={disconnect} />) :
              (<ConnectWalletButton onLedgerClick={onLedgerClick} onTrezorClick={onTrezorClick} onMetamaskClick={connectAndUpdateMetamask} />
            )}
            {network_id === "5" && <NeedGoETH href={'https://discord.gg/wXxuQwY'} target={'_blank'}>Need GoETH?</NeedGoETH>}
          </DepositMethod>
          {error.type && <ErrorMessage>{error.message}</ErrorMessage>}
        </Section>
        <Section>
        <SubTitle>Plan and Summary</SubTitle>
          <StepsBoxes stepsData={stepsData} setStepsData={setStepsData}
            checkedTerms={checkedTerms} error={error}
            setCheckedTermsStatus={() => setCheckedTermsStatus(!checkedTerms)}
            metamaskInfo={metamaskInfo}
            onDepositStart={onDepositStart}
            depositTo={deposit_to}
            publicKey={public_key}
            network_id={network_id}
            isLoadingDeposit={isLoadingDeposit}
            isDepositSuccess={isDepositSuccess}
            txHash={txHash}
          />
          <Total>Total: 32 ETH + gas fees</Total>
        </Section>
        <Faq networkId={network_id} />
        <ModalsManager modal={modal} onClose={hideModal} />
        {isDepositSuccess && txHash && (
          <iframe title={'depositSuccess'} width={'0px'} height={'0px'} src={desktopAppLink} />
        )}
        {showSecurityNotification && <SecurityNotification hide={() => setSecurityNotificationDisplay(false)} />}
      </Wrapper>
    );
  }
  return null;
}

export default StakingDeposit;
