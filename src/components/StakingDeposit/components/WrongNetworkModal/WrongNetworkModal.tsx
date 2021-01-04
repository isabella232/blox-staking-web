import React from "react";
import styled from "styled-components";
import {Button, ModalTemplate} from "../../../../common/components";
import mainnet from 'assets/images/metamask-mainnet-network.gif';
import test from 'assets/images/metamask-test-network.gif';

const WrongNetworkModal = (props: Props) => {
    const {networkType, onClose} = props;
    const isMainnet = networkType === "1";
    const networkName = isMainnet ? 'Main' : 'Test';
    const token = isMainnet ? 'ETH' : 'Goerli';

    const Title = styled.div`        
        font-size: 26px;
        font-weight: 900;         
    `;

    const Description = styled.div`
        font-size: 14px;
        font-weight: 500;
        margin-top: 24px;
    `;

    return (
        <ModalTemplate onClose={onClose} padding={'115px 32px 115px 72px'} imageWidth={'192px'} image={isMainnet ? mainnet : test}>
            <Title>{networkName} Network Required</Title>
            <Description>{networkName}net validator supports {token} deposits only. Please change your MetaMask Network to {token} {networkName} Network. </Description>
            <Button style={{'width': '175px', 'marginTop': '116px'}} onClick={onClose}>Got it</Button>
        </ModalTemplate>
    );
};

type Props = {
    networkType: string;
    onClose?: () => void;
};

export default WrongNetworkModal;
