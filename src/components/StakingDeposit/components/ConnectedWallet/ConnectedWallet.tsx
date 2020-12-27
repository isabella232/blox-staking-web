import React from 'react';
import styled from 'styled-components';
import { Icon } from 'common/components';
import { truncateText } from 'common/helpers/truncateText';

const Wrapper = styled.div`
  width: 330px;
  height: 48px;
  padding: 8px 16px;
  border-radius: 8px;
  border: solid 1px ${({theme}) => theme.gray300};
  background-color: ${({theme}) => theme.gray200};
  display:flex;
`;

const DotWrapper = styled.div`
  width:17px;
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
  width:125px;
  display:flex;
  flex-direction:column;
`;

const Network = styled.div<{ error: boolean }>`
  height: 16px;
  font-size: 11px;
  font-weight: 500;
  color:${({theme, error}) => error? theme.destructive600 : theme.gray600};
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

const Balance = styled.div<{ color: string }>`
  width: 85px; 
  height: 100%;
  padding-left:12px;
  font-size: 11px;
  font-weight: 500;
  color:${({theme, color}) => theme[color]};
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
  padding-left:12px;
`;

const ConnectedWallet = (props: Props) => {
  const { walletInfo, areNetworksEqual, error, onDisconnect } = props
  const { selectedAddress, networkName, balance } = walletInfo;
  const balanceColor = error.type === 'lowBalance' ? 'destructive600' : 'gray600'
  return (
    <Wrapper>
      <DotWrapper>
        <Dot isEqual={areNetworksEqual} />
      </DotWrapper>
      <NetworkAndAccountWrapper>
        <Network error={error.type === 'networksNotEqual'}>{networkName}</Network>
        <Account>{truncateText(selectedAddress, 6, 6)}</Account>
      </NetworkAndAccountWrapper>
      <Balance color={balanceColor}>
        <Icon name={'eth-icon-colors'} fontSize={'10px'} color={balanceColor} />
        <BalanceText>{Math.floor(Number(balance)*10000) / 10000}</BalanceText>
      </Balance>
      <Disconnect onClick={onDisconnect}>Disconnect</Disconnect>
    </Wrapper>
  );
};

type Props = {
  walletInfo: Record<string, any>;
  areNetworksEqual: boolean;
  error: Record<string, any>;
  onDisconnect: () => void;
};

export default ConnectedWallet;
