import React from 'react';
import styled from 'styled-components';
import { Icon } from 'common/components';

const Wrapper = styled.div<{ checked: boolean, isDisabled: boolean }>`
  width:18px;
  height:18px;
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  border-color:${({theme, isDisabled}) => isDisabled ? theme.gray600 : theme.primary900};
  border-width:1px;
  border-style:solid;
  background-color:${({theme, checked}) => checked ? theme.primary900 : '#ffffff'};
  color:#ffffff;
  border-radius:3px;
  cursor:${({isDisabled}) => isDisabled ? 'default' : 'pointer'};
`;

const Checkbox = ({checked, onClick, isDisabled}: Props) => { // TODO: add isDisabled
  return (
    <Wrapper checked={checked} onClick={() => !isDisabled && onClick(!checked)} isDisabled={isDisabled}>
      <Icon color={'white'} name={'check'} fontSize={'18px'} />
    </Wrapper>
  );
};

type Props = {
  checked: boolean;
  onClick: (checked: boolean) => void;
  isDisabled?: boolean;
};

export default Checkbox;
