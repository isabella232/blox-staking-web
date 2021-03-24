import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  height:calc(100% - 70px);
  display: flex;
  flex-direction:column;
  align-items: center;
  justify-content: center;
`;

const OpeningLink = styled.div`
  font-size: 42px;
  font-weight: 500;
  display: flex;
  justify-content:center;
  color:${({theme}) => theme.gray800};
  margin-bottom:35px;
`;

const SmallText = styled.div`
  width: 100%;
  display: flex;
  justify-content:center;
  font-size: 14px;
  color:${({theme}) => theme.gray800};
`;

const Link = styled.div`
  color:${({theme}) => theme.primary600};
  cursor:pointer;
  font-size: 14px;
`;

const BackToDesktop = ({onClick}: Props) => (
  <Wrapper>
    <OpeningLink>Launching Blox Staking...</OpeningLink>
    <SmallText>
      You have successfully Logged in&nbsp;
      <Link onClick={() => onClick()}>Go back to app now</Link>
    </SmallText>
  </Wrapper>
);

type Props = {
  onClick: () => void;
}

export default BackToDesktop;