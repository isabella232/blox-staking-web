import React from 'react';
import styled from 'styled-components';
import Icon from '../Icon';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0px;
  left: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.gray80060};
  z-index:50;
`;

const Content = styled.div<ContentProps>`
  width: ${({width}) => width};
  height: ${({height}) => height};
  border-radius: 8px;
  box-shadow: 0 12px 24px 0 ${({ theme }) => theme.gray80030};
  background-color: #ffffff;
  color: ${({ theme }) => theme.gray800};
  text-align: center;
  position: relative;
`;

const CloseButton = styled.div`
  position: absolute;
  top: -32px;
  right: -32px;
`;

const CustomModal = (props: Props) => {
  const { children, width, height, onClose } = props;
  return (
    <Wrapper>
      <Content width={width} height={height}>
        {onClose && (
          <CloseButton>
            <Icon name="close" onClick={onClose} fontSize="32px" />
          </CloseButton>
        )}
        {children}
      </Content>
    </Wrapper>
  );
};

type Props = {
  children: React.ReactNode;
  width: string;
  height: string;
  onClose?: () => void;
};

type ContentProps = {
  width: string;
  height: string;
};

export default CustomModal;
