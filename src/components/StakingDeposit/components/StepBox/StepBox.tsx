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

const Title = styled.div<{ isActive: boolean }>`
  width: 59px;
  margin: 0px 67px 0px 31px;
  font-size: 16px;
  font-weight: 900;
  color:${({isActive, theme}) => isActive && theme.primary900};
`;

const StepBox = ({data, children}: Props) => {
  const { number, title, isActive, isDisabled } = data;

    return (
    <Wrapper isDisabled={isDisabled}>
      <Number>{number}</Number>
      <Title isActive={isActive}>{title}</Title>
      {children}
    </Wrapper>
  )
};

type Props = {
  data: Record<string, any>;
  children?: React.ReactNode;
};

export default StepBox;
