import React, { useEffect, useState } from 'react';
import Metamask from 'service/Metamask';
import { NETWORK_IDS } from 'service/Metamask/constants';

import { Wrapper, Section, Title, SubTitle, Total, ErrorMessage,
         MetamaskNotFound, StepsBoxes, ConnectedWallet, NeedGoETH,
         DepositMethod, ConnectWalletButton
       } from './components';

import { STEP_BOXES } from './constants';
import parsedQueryString from 'common/helpers/getParsedQueryString';
import { notification } from 'antd';

const qsObject: Record<string, any> = parsedQueryString(location.search);
const { network_id, deposit_to, public_key } = qsObject;

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
  const [ metamaskInfo, setMetamaskInfo ] = useState(initialMetamaskInfoState);
  const [ checkedTerms, setCheckedTermsStatus ] = useState(false);
  const [ error, setError ] = useState(initialErrorState);
  const [ stepsData, setStepsData ] = useState(STEP_BOXES);
  const [ isLoadingDeposit, setDepositLoadingStatus ] = useState(false);
  const [ isDepositSuccess, setDepositSuccessStatus ] = useState(false);
  const [ txHash, setTxHash ] = useState('');

  const areNetworksEqual = network_id === metamaskInfo.networkVersion;

  useEffect(() => {
    setMetamaskNotSupportedPopUpStatus(!metamask.isExist());
    const placement = 'bottomRight';
    notification.config({ placement });
  }, []);

  useEffect(() => {
    if(qsObject.network_id && metamaskInfo.networkVersion && !areNetworksEqual) {
      setError({type: 'networksNotEqual', message: `Please change to ${NETWORK_IDS[network_id]}`,});
    }
    else if(metamaskInfo.balance !== '' && Number(metamaskInfo.balance) < 33) {
      setError({type: 'lowBalance', message: 'Insufficient balance in selected wallet'});
    }
    else {
      setError({type: '', message: ''});
    }
  }, [qsObject, metamaskInfo]);

  const hideMetamaskNotSupportedPopUp = () => setMetamaskNotSupportedPopUpStatus(false);

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
          return;
        }
        notification.error({ message: '', description: `Failed to send transaction` });
      }
    }

    metamask.sendEthersTo(onStart, onSuccess); 
  }

  return (  
    <Wrapper>
      <Title>{network_id === "1" ? 'Mainnet' : 'Testnet'} Staking Deposit</Title>
      <Section>
        <SubTitle>Deposit Method</SubTitle>
        <DepositMethod>
          {metamaskInfo.selectedAddress ? 
            (<ConnectedWallet metamaskInfo={metamaskInfo} areNetworksEqual={areNetworksEqual} error={error} />) : 
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
      {showMetamaskNotSupportedPopUp && <MetamaskNotFound onClose={hideMetamaskNotSupportedPopUp} />}
    </Wrapper>
  );
}

export default StakingDeposit;