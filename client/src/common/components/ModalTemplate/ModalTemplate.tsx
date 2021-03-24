import React from 'react';
import styled from 'styled-components';
import CustomModal from '../CustomModal';

const Wrapper = styled.div`
  width:100%;
  height:100%;
  display:flex;
  position:fixed;
  z-index:51;
`;

const InnerWrapper = styled.div`
  width:100%;
  height:100%;
  display:flex;
`;

const Left = styled.div<{ padding: string, justifyContent: string }>`
  width: 500px;
  height:100%;
  padding:${({padding}) => padding};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content:${({justifyContent}) => justifyContent};
  text-align: left;
`;

const Right = styled.div`
  width:300px;
  height:100%;
  background-color:${({theme}) => theme.gray100};
  display:flex;
  align-items:center;
  justify-content:center;
  border-bottom-right-radius:8px;
  border-top-right-radius:8px;
`;

const Image = styled.img<{ width: string }>`
  width:${({width}) => width};
`;

const ModalTemplate = ({width, height, padding, justifyContent, onClose, image, imageWidth, children}: Props) => {
  return (
    <Wrapper>
      <CustomModal width={width} height={height} onClose={onClose}>
        <InnerWrapper>
          <Left padding={padding} justifyContent={justifyContent}>
            {children}
          </Left>
          <Right>
            <Image src={image} width={imageWidth} />
          </Right>
        </InnerWrapper>
      </CustomModal>
    </Wrapper>
  );
};

ModalTemplate.defaultProps = {
  width: '800px',
  height: '500px',
  padding: '90px 32px 90px 64px',
  justifyContent: 'space-between',
  imageWidth: '200px',
};

type Props = {
  width: string;
  height: string;
  padding: string;
  justifyContent: string;
  onClose?: () => void | null;
  image: string;
  imageWidth: string;
  children: React.ReactNode;
};

export default ModalTemplate;
