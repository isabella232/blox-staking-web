import styled from 'styled-components';

type Props = {
  isDisabled?: boolean;
};

const Button = styled.button<Props>`
  width: 175px;
  height: 32px;
  font-size: 14px;
  font-weight: 900;
  display:flex;
  align-items:center;
  justify-content:center;
  background-color: ${({theme, isDisabled}) => isDisabled ? theme.gray400 : theme.primary900};
  border-radius: 6px;
  color:${({theme}) => theme.gray50};
  border:0px;
  cursor:${({isDisabled}) => isDisabled ? 'default' : 'pointer'};
`;

export default Button;
