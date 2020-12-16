import React, { useEffect, useState } from 'react';
import Metamask from 'service/Metamask';
import { NETWORK_IDS } from 'service/Metamask/constants';

import { Button } from 'common/components';
import { Wrapper, Section, Title, SubTitle, Total, ErrorMessage,
         MetamaskNotFound, StepsBoxes, ConnectedWallet
       } from './components';

import { STEP_BOXES } from './constants';
import parsedQueryString from 'common/helpers/getParsedQueryString';

const qsObject: Record<string, any> = parsedQueryString(location.search);
const depositTo = '0x4e409dB090a71D14d32AdBFbC0A22B1B06dde7dE';
const publicKey = '0xD46fcC1E7a85601108Ff0869f68D8C76b44AcF4F';

const metamask = new Metamask({ depositTo });

const initialMetamaskInfoState = {
  networkVersion: '',
  networkName: '',
  selectedAddress: '',
  balance: '',
};

const initialErrorState = { type: '', message: '' }

const StakingDeposit = () => { 
  const [ showMetamaskNotSupportedPopUp, setMetamaskNotSupportedPopUpStatus ] = useState(false);
  const [ metamaskInfo, setMetamaskInfo ] = useState(initialMetamaskInfoState);
  const [ checkedTerms, setCheckedTermsStatus ] = useState(false);
  const [ error, setError ] = useState(initialErrorState);
  const [ stepsData, setStepsData ] = useState(STEP_BOXES);

  const areNetworksEqual = qsObject.network_id === metamaskInfo.networkVersion;

  useEffect(() => {
    setMetamaskNotSupportedPopUpStatus(!metamask.isExist());
  }, []);

  useEffect(() => {
    if(qsObject.network_id && metamaskInfo.networkVersion && !areNetworksEqual) {
      setError({type: 'networksNotEqual', message: `Please change to ${NETWORK_IDS[qsObject.network_id]}`,});
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
      await metamask.subscribeToChange('networkChanged', updateMetamaskInfo);     
      await metamask.subscribeToChange('accountsChanged', updateMetamaskInfo);  
    }
    catch(e) { throw new Error(e.message); }
  };

  const updateMetamaskInfo = async (networkId?) => {
    const { networkVersion, selectedAddress } = metamask.metaMask;
    const networkName = networkId ? NETWORK_IDS[networkId] : NETWORK_IDS[networkVersion];
    const balance = await metamask.getBalance(selectedAddress);
    setMetamaskInfo((prevState) => ({ ...prevState, networkName, networkVersion, selectedAddress, balance })); 
  }; 

  return (  
    <Wrapper>
      <Title>Mainnet Staking Deposit</Title>
      <Section>
        <SubTitle>Deposit Method</SubTitle>
        {metamaskInfo.selectedAddress ? 
          (<ConnectedWallet metamaskInfo={metamaskInfo} areNetworksEqual={areNetworksEqual} error={error} />) : 
          (<Button onClick={connectAndUpdateMetamask}>Connect Wallet</Button>
        )}  
        {error.type && <ErrorMessage>{error.message}</ErrorMessage>}
      </Section>
      <Section>
      <SubTitle>Plan and Summary</SubTitle>
        <StepsBoxes stepsData={stepsData} setStepsData={setStepsData}
          checkedTerms={checkedTerms} error={error}
          setCheckedTermsStatus={() => setCheckedTermsStatus(!checkedTerms)}
          metamaskInfo={metamaskInfo}
          sendEthersTo={metamask.sendEthersTo}
          depositTo={depositTo}
          publicKey={publicKey}
        />
        <Total>Total: 32 ETH + gas fees</Total>
      </Section>
      {showMetamaskNotSupportedPopUp && <MetamaskNotFound onClose={hideMetamaskNotSupportedPopUp} />}
    </Wrapper>
  );
}

export default StakingDeposit;