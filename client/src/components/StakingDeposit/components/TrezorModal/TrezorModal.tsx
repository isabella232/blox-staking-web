import styled from 'styled-components';

import { ModalTemplate, Button } from 'common/components';
import { Description, Title } from 'common/components/ModalTemplate/components';

import image from './ezgif.com-gif-maker_4_1.gif';
import trezorLogo from './trezor-logotype.svg';
import metamaskLogo from './meta-mask-logo-with-text.svg';

const ButtonWrapper = styled.div`
  margin-top:24px;
`;

const TitleWithSpaces = styled(Title)`
  display:flex;
  justify-content: space-between;
  width: 85%;
  margin-top: 20%;
  margin-bottom: 10%;
`;

const TrezorModal = ({onClose, onClick}: Props) => {
  return (
    <ModalTemplate image={image} imageWidth={'200px'} padding={'32px 32px 32px 72px'}
      justifyContent={'initial'} onClose={onClose}>
      <TitleWithSpaces>
        <img src={trezorLogo} alt={''} />
        via
        <img src={metamaskLogo} alt={''} />
      </TitleWithSpaces>
      <Description>
        Securely execute Blox Staking deposit with MetaMask's Trezor integration.
      </Description>
      <ButtonWrapper>
        <Button onClick={onClick}>Open MetaMask</Button>
      </ButtonWrapper>
    </ModalTemplate>
  );
};

type Props = {
  onClick: () => void;
  onClose?: () => void;
};

export default TrezorModal;
