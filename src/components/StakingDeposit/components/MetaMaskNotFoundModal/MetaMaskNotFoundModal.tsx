import React from 'react';
import styled from 'styled-components';

import CustomModal from "../../../../common/components/CustomModal";

import metaMaskIcon from 'assets/images/meta-mask-logo.svg';

const Title = styled.div`
  font-size: 26px;
  font-weight: 900;
  margin-bottom: 24px;
`;

const DescriptionWrapper = styled.div`
    padding: 0 133px;
`;

const Description = styled.span`
  font-size: 12px;
  font-weight: 500;           
`;

const Image = styled.img`
  width: 50px;
  height: 50px;
  margin-top: 30px;                    
`;

const MetaMaskNotFoundModal = ({onClose}: Props) => {
    return (
        <CustomModal width={'600px'} height={'240px'} onClose={onClose}>
            <Image src={metaMaskIcon}/>
            <Title>MetaMask Required</Title>
            <DescriptionWrapper>
                <Description>You need </Description>
                <Description style={{'color': '#0090ff'}}>MetaMask's wallet browser extension</Description> <br />
                <Description>in order to send the staking deposit.</Description>
            </DescriptionWrapper>
        </CustomModal>
    );
};

type Props = {
    onClose?: () => void;
};

export default MetaMaskNotFoundModal;
