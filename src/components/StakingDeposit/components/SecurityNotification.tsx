import React from 'react';
import styled from 'styled-components';
import { Icon, UniqueUrl } from 'common/components';

const Wrapper = styled.div`
  width: 384px;
  height:100px;
  display:flex;
  flex-direction:column;
  align-items:center;
  padding: 16px 24px;
  line-height: 1.5715;
  background-color:#ffffff;
  box-shadow:0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  border-radius:2px;
  position:fixed;
  right:12px;
  bottom:12px;
`;

const Title = styled.span`
  font-size: 11px;
  font-weight: 500;
  margin-bottom:12px;
`;

const CloseButton = styled.div`
  position:absolute;
  top:16px;
  right:22px;
`;

const SecurityNotification = ({hide}: Props) => {
  return  (
    <Wrapper>
      <CloseButton>
        <Icon name={'close'} fontSize={'12px'} onClick={hide} color={'gray800'} />
      </CloseButton>
      <Title>Please check that you are visiting the correct URL</Title>
      <UniqueUrl url={location.toString()} />
    </Wrapper>
  );
}

type Props = {
  hide: () => void;
}


export default SecurityNotification;