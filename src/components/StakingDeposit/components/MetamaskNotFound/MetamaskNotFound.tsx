import React from 'react';
import styled from 'styled-components';

import { ModalTemplate, UniqueUrl, Button } from 'common/components';
import { Description, Title } from 'common/components/ModalTemplate/components';

import image from './browsers.svg';

const ButtonWrapper = styled.div`
  margin-top:24px;
`;

const MetamaskNotFound = ({onClose}: Props) => {
  return (
    <ModalTemplate image={image} imageWidth={'92px'} padding={'32px 32px 32px 72px'}
      justifyContent={'initial'} onClose={onClose}
    >
      <Title>Browser Not Supported by MetaMask</Title>
      <Description>
        Blox uses Metamask (and its Trezor &amp; Ledger integration) to initiate transactions.
        Unfortunately, Metamask is available on Chrome and Firefox browsers only. <br /> <br />

        To continue: <br />
        1. Open Firefox or Chrome <br />
        2. Install Metamask extension (Chrome/Firefox) <br />
        3. Copy your unique deposit URL <br />
        4. Paste it and continue with your deposit <br />
      </Description>
      <UniqueUrl url={location.toString()} />
      <ButtonWrapper>
        <Button onClick={onClose}>Close</Button>
      </ButtonWrapper>
    </ModalTemplate>
  );
};

type Props = {
  onClose?: () => void;
};

export default MetamaskNotFound;
