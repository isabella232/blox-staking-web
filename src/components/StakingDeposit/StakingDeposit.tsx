import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Metamask from 'service/Metamask';
import { NETWORK_IDS } from 'service/Metamask/constants';

import { Button } from 'common/components';
import { MetamaskNotFound, StepsBoxes, ConnectedWallet } from './components';
import { STEP_BOXES } from './constants';
import parsedQueryString from 'common/helpers/getParsedQueryString';

const Wrapper = styled.div`
  width:100%;
  height:calc(100% - 70px);
  padding:35px 115px 0px 115px;
  position:relative;
  background-color:${({theme}) => theme.gray100};
`;

const Section = styled.div`
  margin-bottom:30px;
`;

const Title = styled.div`
  font-size: 32px;
  font-weight: 500;
  margin-bottom:26px;
`;

const SubTitle = styled.div`
  font-size: 16px;
  font-weight: 900;
  margin-bottom:12px;
`;

const Total = styled.div`
  font-size: 12px;
  font-weight: 500;
  color:${({theme}) => theme.gray600};
`;

const qsObject: Record<string, any> = parsedQueryString(location.search);

const metamask = new Metamask();

const metamaskInfoDefault = {
  networkVersion: '',
  networkName: '',
  selectedAddress: '',
  balance: '',
};

const StakingDeposit = () => {
  const [ showMetamaskNotSupportedPopUp, setMetamaskNotSupportedPopUpStatus ] = useState(false);
  const [ metamaskInfo, setMetamaskInfo ] = useState(metamaskInfoDefault);
  const [ checkedTerms, setCheckedTermsStatus ] = useState(false);
  const [ stepsData, setStepsData ] = useState(STEP_BOXES);

  useEffect(() => {
    setMetamaskNotSupportedPopUpStatus(!metamask.isExist());
  }, []);

  useEffect(() => {
    console.log('metamaskInfo', metamaskInfo);
  }, [metamaskInfo]);

  

  const hideMetamaskNotSupportedPopUp = () => setMetamaskNotSupportedPopUpStatus(false);

  const connectAndUpdateMetamask = async () => {
    await connectMetamask();
    await updateMetamaskInfo();
  };

  const connectMetamask = async () => {
    try {
      await metamask.enableAccounts();
      await metamask.subscribeToChange('networkChanged', updateMetamaskInfo);      
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
          (<ConnectedWallet metamaskInfo={metamaskInfo} queryStringNetworkId={qsObject.network_id} />) : 
          (<Button onClick={connectAndUpdateMetamask}>Connect Wallet</Button>
        )}  
      </Section>
      <Section>
      <SubTitle>Plan and Summary</SubTitle>
        <StepsBoxes stepsData={stepsData} setStepsData={setStepsData}
          checkedTerms={checkedTerms} 
          setCheckedTermsStatus={() => setCheckedTermsStatus(!checkedTerms)}
          metamaskAccount={metamaskInfo.selectedAddress}
        />
        <Total>Total: 32.5 ETH + gas fees</Total>
      </Section>
      {showMetamaskNotSupportedPopUp && <MetamaskNotFound onClose={hideMetamaskNotSupportedPopUp} />}
    </Wrapper>
  );
}

export default StakingDeposit;