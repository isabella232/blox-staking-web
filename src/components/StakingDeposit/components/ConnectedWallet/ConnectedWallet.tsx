import React from 'react';
import styled from 'styled-components';
import { Icon } from 'common/components';
import { truncateText } from 'common/helpers/truncateText';

const Wrapper = styled.div`
  width: 320px;
  height: 48px;
  padding: 8px 16px;
  border-radius: 8px;
  border: solid 1px ${({theme}) => theme.gray300};
  background-color: ${({theme}) => theme.gray200};
  display:flex;
`;

const DotWrapper = styled.div`
  width:15px;
  display:flex;
  align-items:center;
`;

const Dot = styled.div<{ isEqual: boolean }>`
  width:8px;
  height:8px;
  border-radius:50%;
  background-color:${({isEqual, theme}) => isEqual ? theme.accent2400 : theme.destructive600};
`;

const NetworkAndAccountWrapper = styled.div`
  width:130px;
  display:flex;
  flex-direction:column;
`;

const Network = styled.div`
  height: 16px;
  margin: 0 0 0 2px;
  font-size: 11px;
  font-weight: 500;
  color:${({theme}) => theme.gray600};
`;

const Account = styled.div`
  width:100%;
  height: 16px;
  font-size: 11px;
  font-weight: 900;
  color:${({theme}) => theme.gray800};
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
`;

const Balance = styled.div`
  width: 82px;
  height: 100%;
  font-size: 11px;
  font-weight: 500;
  color:${({theme}) => theme.gray600};
  display:flex;
  align-items:center;
  justify-content:center;
`;

const BalanceText= styled.div`
  margin-bottom:-1px;
`;

const Disconnect = styled.div`
  font-size: 11px;
  font-weight: 900;
  color:${({theme}) => theme.gray800};
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
`;

const ConnectedWallet = (props: Props) => {
  const { metamaskInfo, queryStringNetworkId } = props
  const { selectedAddress, networkName, networkVersion, balance } = metamaskInfo;
  return (
    <Wrapper>
      <DotWrapper>
        <Dot isEqual={networkVersion === queryStringNetworkId} />
      </DotWrapper>
      <NetworkAndAccountWrapper>
        <Network>{networkName}</Network>
        <Account>{truncateText(selectedAddress, 6, 6)}</Account>
      </NetworkAndAccountWrapper>
      <Balance>
        <Icon name={'eth-icon-colors'} fontSize={'10px'} color={'gray600'} />
        <BalanceText>{Math.floor(Number(balance)*10000) / 10000}</BalanceText>
      </Balance>
      <Disconnect>Disconnect</Disconnect>
    </Wrapper>
  );
};

type Props = {
  metamaskInfo: Record<string, any>;
  queryStringNetworkId: string;
};

export default ConnectedWallet;