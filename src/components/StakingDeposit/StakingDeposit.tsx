import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Metamask from 'service/Metamask';
import {NETWORK_IDS} from 'service/Metamask/constants';

import {
    Wrapper, Section, Title, SubTitle, Total, ErrorMessage,
    MetaMaskNotFoundModal, BrowserNotSupported, WrongNetworkModal, 
    StepsBoxes, ConnectedWallet, NeedGoETH, DepositMethod, ConnectWalletButton
} from './components';

import {STEP_BOXES} from './constants';
import parsedQueryString from 'common/helpers/getParsedQueryString';
import { notification } from 'antd';

const qsObject: Record<string, any> = parsedQueryString(location.search);
const {network_id, deposit_to, public_key, account_id} = qsObject; // TODO: replace account id with of public key

const initialMetamaskInfoState = {
    networkVersion: '',
    networkName: '',
    selectedAddress: '',
    balance: '',
};

const initialErrorState = { type: '', message: '' };

const metamask = new Metamask({ depositTo: deposit_to });

const StakingDeposit = () => { 
  const [ showMetamaskNotSupportedPopUp, setMetamaskNotSupportedPopUpStatus ] = useState(false);
  const [ showBrowserNotSupportedPopUp, setBrowserNotSupportedPopUp ] = useState(false);
  const [ metamaskInfo, setMetamaskInfo ] = useState(initialMetamaskInfoState);
  const [ checkedTerms, setCheckedTermsStatus ] = useState(false);
  const [ error, setError ] = useState(initialErrorState);
  const [ stepsData, setStepsData ] = useState(STEP_BOXES);
  const [ isLoadingDeposit, setDepositLoadingStatus ] = useState(false);
  const [ isDepositSuccess, setDepositSuccessStatus ] = useState(false);
  const [ txHash, setTxHash ] = useState('');
  const [ oneTimeWrongNetworkModal, setOneTimeWrongNetworkModal ] = useState(false);
  const [ showWrongNetworkModal, setShowWrongNetworkModal ] = useState(false);

  const areNetworksEqual = network_id === metamaskInfo.networkVersion;

  useEffect(() => {
    setMetamaskNotSupportedPopUpStatus(!metamask.isExist());
    const isChrome = navigator.userAgent.indexOf("Chrome") !== -1;
    const isFireFox = navigator.userAgent.indexOf("FireFox") !== -1;
    setBrowserNotSupportedPopUp(!isChrome && !isFireFox);
    const placement = 'bottomRight';
    notification.config({ placement });
  }, []);

  useEffect(() => {
    if(qsObject.network_id && metamaskInfo.networkVersion && !areNetworksEqual) {
      setError({type: 'networksNotEqual', message: `Please change to ${NETWORK_IDS[network_id]}`,});
      if (!oneTimeWrongNetworkModal) {
        setOneTimeWrongNetworkModal(true);
        setShowWrongNetworkModal(true);
    }
    }
    else if(metamaskInfo.balance !== '' && Number(metamaskInfo.balance) < 33) {
      setError({type: 'lowBalance', message: 'Insufficient balance in selected wallet'});
    }
    else {
      setError({type: '', message: ''});
    }
  }, [qsObject, metamaskInfo]);

  const hideMetamaskNotSupportedPopUp = () => setMetamaskNotSupportedPopUpStatus(false);
  const hideBrowserNotSupportedPopUp = () => setBrowserNotSupportedPopUp(false);
  const hideWrongNetworkModal = () => setShowWrongNetworkModal(false);

  const connectAndUpdateMetamask = async () => {
    await connectMetamask();
    await updateMetamaskInfo();
  };

  const connectMetamask = async () => {
    try {
      await metamask.enableAccounts();
      await metamask.subscribeToChange('networkChanged', updateMetamaskInfo); // TODO: change to chainId
      await metamask.subscribeToChange('accountsChanged', updateMetamaskInfo);  
      notification.success({ message: '', description: 'Successfully connected to MetaMask' });
    }
    catch(e) { throw new Error(e.message); }
  };

  const updateMetamaskInfo = async (networkId?) => {
    const { networkVersion, selectedAddress } = metamask.metaMask;
    const networkName = networkId ? NETWORK_IDS[networkId] : NETWORK_IDS[networkVersion];
    const balance = await metamask.getBalance(selectedAddress);
    setMetamaskInfo((prevState) => ({ ...prevState, networkName, networkVersion, selectedAddress, balance })); 
  }; 

  const onDepositStart = () => {
    const onStart = (txHash) => {
      setTxHash(txHash);
      setDepositLoadingStatus(true);
      notification.success({ message: '', description: `Transaction hash: ${txHash}` });
    };

    const onSuccess = (error, txReceipt) => {
      setDepositLoadingStatus(false);
      if(error) { 
        notification.error({ message: '', description: error });
      }
      else if(txReceipt) {
        if(txReceipt.status) {
          notification.success({ message: '', description: `Successfully deposited 32 ETH to ${deposit_to}` });
          setDepositSuccessStatus(true);
          axios({
            url: `${process.env.REACT_APP_API_URL}/accounts/${account_id}`,
            method: 'patch',
            data: { deposited: true, txHash },
            responseType: 'json',
          });
          return;
        }
        notification.error({ message: '', description: `Failed to send transaction` });
      }
    }

    metamask.sendEthersTo(onStart, onSuccess); 
  }

  const onDisconnect = () => {
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
              (<ConnectedWallet metamaskInfo={metamaskInfo} areNetworksEqual={areNetworksEqual} error={error} onDisconnect={onDisconnect} />) : 
              (<ConnectWalletButton onMetamaskClick={connectAndUpdateMetamask} />
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
        {showMetamaskNotSupportedPopUp && <MetaMaskNotFoundModal onClose={hideMetamaskNotSupportedPopUp}/>}
        {showBrowserNotSupportedPopUp && <BrowserNotSupported onClose={hideBrowserNotSupportedPopUp}/>}
        {showWrongNetworkModal &&
        <WrongNetworkModal networkType={qsObject.network_id} onClose={hideWrongNetworkModal}/>}
        {isDepositSuccess && txHash && (
          <iframe title={'depositSuccess'} width={'0px'} height={'0px'} src={desktopAppLink} />
        )}
      </Wrapper>
    );
  }
  return null;
}

export default StakingDeposit;
