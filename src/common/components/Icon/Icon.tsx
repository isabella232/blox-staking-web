import React from 'react';
import styled from 'styled-components';

const Regular = styled.i<{ fontSize: string, isDisabled: boolean }>`
  font-size: ${({ fontSize }) => fontSize || '12px'};
  display: flex;
  align-items: center;
  color: ${({ theme, color, isDisabled }) => isDisabled ? theme.gray400 : (color && theme[color]) || '#2536b8'};
`;

const Clickable = styled(Regular)`
  cursor: pointer;
  :hover {
    color: ${({ theme, color, isDisabled }) => isDisabled ? theme.gray400 : (color && theme.primary700) || '#2536b8'};
  }
  :active {
    color: ${({ theme, color, isDisabled }) => isDisabled ? theme.gray400 : (color && theme.primary800) || '#2536b8'};
  }
`;

const Icon = ({ name, color, fontSize, onClick, isDisabled }: Props) => onClick ?
  (
    <Clickable
      className={`icon-${name}`}
      color={color}
      fontSize={fontSize}
      onClick={onClick}
      isDisabled={isDisabled}
    />
  ) : (
    <Regular
      className={`icon-${name}`}
      color={color}
      fontSize={fontSize}
      isDisabled={isDisabled}
    />
  );

type Props = {
  name: string;
  isDisabled?: boolean;
  fontSize: string;
  color?: string;
  onClick?: () => void;
};

export default Icon;
