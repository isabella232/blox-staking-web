import styled from 'styled-components';

const Wrapper = styled.div<{ isDisabled: boolean }>`
  width: 858px;
  height: 84px;
  margin: 0 0 12px;
  padding: 8px 24px;
  opacity: 0.5;
  border-radius: 8px;
  border: ${({theme}) => theme.gray300} solid 1px;
  background-color:${({theme}) => theme.white};
  opacity:${({isDisabled}) => isDisabled ? '0.5' : '1'};
  display:flex;
  align-items:center;
`;

const Number = styled.div`
  font-size: 16px;
  font-weight: 500;
`;

const Title = styled.div<{ isActive?: boolean }>`
  width: 59px;
  margin: 0px 52px 0px 31px;
  font-size: 16px;
  font-weight: 900;
  color:${({theme, isActive}) => isActive && theme.primary900};
`;

const StepBox = ({data, networkId, children}: Props) => {
  const { number, title, isDisabled } = data;
  return (
    <Wrapper isDisabled={isDisabled}>
      <Number>{networkId === '5' ? number - 1 : number}</Number>
      <Title>{title}</Title>
      {children}
    </Wrapper>
  )
};

type Props = {
  data: Record<string, any>;
  children?: React.ReactNode;
  networkId?: string;
};

export default StepBox;