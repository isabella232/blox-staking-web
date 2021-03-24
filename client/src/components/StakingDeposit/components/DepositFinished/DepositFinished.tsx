import styled from "styled-components";
import {Icon} from "../../../../common/components";


const Wrapper = styled.div`
        width:100%;
        height:100%;   
        padding-left: 116px;   
        margin-top: 83px; 
    `;


const Title = styled.div`        
        font-size: 32px;
        font-weight: 500;
        margin-top: 16px;
        color: #00ebb7;      
    `;

const Description = styled.div`
        width:458px;        
        font-size: 16px;
        font-weight: 500;
        margin-top: 22px;
    `;


const DepositFinished = () => {
    return (
        <Wrapper>
            <Icon name={'checked-cirlce'} fontSize={'70px'} color={'color00ebb7'} />
            <Title>Deposits Executed & Confirmed</Title>
            <Description>You can close this window and go back to the Blox Staking Desktop App for next steps.</Description>
        </Wrapper>
    );
};

export default DepositFinished;
