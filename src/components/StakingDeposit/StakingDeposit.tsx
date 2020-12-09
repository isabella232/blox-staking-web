import React, { useEffect } from 'react';
import styled from 'styled-components';
import Metamask from '../../service/Metamask';

const metamask = new Metamask();

const Wrapper = styled.div`
  width:100%;
  height:100%;
`;

const StakingDeposit = () => {
  useEffect(() => { console.log('metamask', metamask.isExist()); },[]);
  return (
    <Wrapper>
      Staking Deposit
    </Wrapper>
  );
}

export default StakingDeposit;