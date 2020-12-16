import CustomModal from "../../../../common/components/CustomModal";
import React from "react";
import styled from "styled-components";
import {Button} from "../../../../common/components";
import gif from 'assets/images/gif.gif';

const WrongNetworkModal = (props: Props) => {
    const {networkType, onClose} = props;
    const isMainnet = networkType === "1";
    const networkName = isMainnet ? 'Main' : 'Test';
    const token = isMainnet ? 'ETH' : 'Goerli';


    const Wrapper = styled.div`
        width:100%;
        height:100%;   
        display: flex;     
    `;

    const InnerWrapper = styled.div`
        width:65%;
        height:100%;
        padding: 0 72px 32px 100px;        
        text-align: left;
    `;

    const Title = styled.div`        
        font-size: 26px;
        font-weight: 900;
        margin-top: 115px;   
    `;

    const Description = styled.div`
        font-size: 14px;
        font-weight: 500;
        margin-top: 24px
    `;

    const ImageWrapper = styled.div`
        width:35%;
        height:100%;
        border-bottom-right-radius:8px;
        border-top-right-radius:8px;
        background-color:${({theme}) => theme.gray100};
        display: flex; 
        align-items:center;
        justify-content:center;
    `;
    const Image = styled.img`
          width: 192px;
          height: 336;                    
    `;

    return (
        <CustomModal width={'880px'} height={'580px'} onClose={onClose}>
            <Wrapper>
                <InnerWrapper>
                    <Title>{networkName} Network Required</Title>
                    <Description>{networkName}net validator supports {token} deposits only. Please change your MetaMask Network to {token} {networkName} Network. </Description>
                    <Button style={{'width': '175px', 'marginTop': '116px'}} onClick={onClose}>Got it</Button>
                </InnerWrapper>
                <ImageWrapper>
                    <Image src={gif}/>
                </ImageWrapper>
            </Wrapper>
        </CustomModal>
    );
};

type Props = {
    networkType: string;
    onClose?: () => void;
};

export default WrongNetworkModal;
