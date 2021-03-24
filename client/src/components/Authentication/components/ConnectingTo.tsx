import styled from 'styled-components';

import logoImage from '../../../assets/images/infra-logo-blue-2@2x.png';

const Wrapper = styled.div`
  width: 100%;
  height:calc(100% - 70px);
  display: flex;
  flex-direction:column;
  align-items: center;
  justify-content: center;
`;

const Image = styled.img`
  width:200px;
  margin-bottom:35px;
`;

const Provider = styled.span`
  text-transform:capitalize;
`;

const Paragraph = styled.div`
  font-size: 42px;
  font-weight: 500;
  text-align: center;
  color:${({theme}) => theme.gray800};
  margin-bottom:35px;
`;

const ConnectingTo = ({provider}: Props) => (
  <Wrapper>
    <Image src={logoImage} />
    <Paragraph>Connecting to <Provider>{provider}</Provider>...</Paragraph>
  </Wrapper>
);

type Props = {
  provider: string;
}

export default ConnectingTo;