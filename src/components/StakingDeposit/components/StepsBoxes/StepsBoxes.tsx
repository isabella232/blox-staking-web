import React, { useEffect } from 'react';
import styled from 'styled-components';

import { truncateText } from 'common/helpers/truncateText';
import { InfoWithTooltip, Checkbox, Button, Spinner } from 'common/components';
import StepBox from '../StepBox';

const StepBoxLeft = styled.div`
  width: 410px;
  height: 68px;
  font-size: 11px;
  font-weight: 500;
  line-height: 2;
  display:flex;
  flex-direction:column;
  justify-content:space-evenly;
  color:${({theme}) => theme.gray600};
`;

const StepBoxLeftParagraph = styled.p`
  line-height: 2;
  margin:0px;
`;

const StepBoxRight = styled.div`
  width: 185px;
  height: 100%;
  margin-left:60px;
  font-size: 11px;
  font-weight: 500;
  display:flex;
  align-items:center;
  justify-content:space-between;
  color:${({theme}) => theme.gray800};
`;

const Terms = styled.div`
  width:155px;
  font-size:12px;
`;

const Link = styled.a<{ isDisabled: boolean }>`
  text-decoration:underline;
  color:${({theme}) => theme.gray600};
  cursor:${({isDisabled}) => isDisabled ? 'default' : 'pointer'};
`;

const Free = styled.div`
  font-size: 20px;
  font-weight: 900;
  color: ${({theme}) => theme.accent2400};
  text-transform:uppercase;
`;

const GreenColor = styled.span<{ fontSize?: string }>`
  color: ${({theme}) => theme.accent2400};
  font-size:${({fontSize}) => fontSize};
`;

const ButtonWrapper = styled.div`
  width:100%;
  height:100%;
  display:flex;
  flex-direction:column;
  justify-content:space-around;
  align-items:center;
`;

const SuccessWrapper = styled.div`
  width:100%;
  height:70%;
  display:flex;
  flex-direction:column;
  justify-content:space-around;
`;

const Loading = styled.div`
  width:85%;
  display:flex;
  justify-content:space-between;
  color:${({theme}) => theme.primary900};
`;

const ViewTransaction = styled.a`
  font-size: 11px;
  font-weight: 500;
  color:${({theme}) => theme.gray600};
  text-decoration:underline;
`;

const tooltipText = `
  By depositing the service fee of $180 (paid in ETH and automatically converted to CDT by a third party),
  Blox Staking will provide staking services for 1 Eth2 validator until transfers are available (phase 1.5)
  or for up to 2 years following activation (whichever comes first).
  The fee will not renew automatically and you will be asked to deposit a new fee for the following year of service.
  The service fee is non-refundable. Network gas fees will apply.
`;

const StepsBoxes = (props: Props) => {
  const { stepsData, setStepsData, checkedTerms, setCheckedTermsStatus,
          metamaskInfo, onDepositStart, publicKey, depositTo, error, network_id,
          isLoadingDeposit, isDepositSuccess, txHash
        } = props;

  const { selectedAddress } = metamaskInfo;

  useEffect(() => {
    if(network_id === '1') {
      updateStep(0, selectedAddress && error.type === '');
      updateStep(1, selectedAddress && error.type === '');
    }
    else if(network_id === '5') {
      updateStep(1, selectedAddress && error.type === '');
      updateStep(2, selectedAddress && error.type === '');
    }
  }, [metamaskInfo, error]);

  useEffect(() => {
    if(network_id === '1') {
      updateStep(2, checkedTerms && error.type === '');
    }
  }, [checkedTerms, error]);

  const updateStep = (stepIndex, condition) => {
    setStepsData((prevState) => {
      const newStepsData = [...prevState];
      const newStep = condition ? 
      { isActive: true, isDisabled: false } : 
      { isActive: false, isDisabled: true };
      newStepsData[stepIndex] = {...stepsData[stepIndex], ...newStep};
      return newStepsData;
    }); 
  }

  const truncatedPublicKey = truncateText(publicKey, 20, 6);
  const truncatedDepositTo = truncateText(depositTo, 20, 6);

  const etherscanLink = network_id === '1' ? 'https://etherscan.io/tx/' : 'https://goerli.etherscan.io/tx/';

  return (
    <>
      {network_id === '1' && (
        <StepBox data={stepsData[0]}>
          <StepBoxLeft>
            <StepBoxLeftParagraph>
              After completing the Service Fee Deposit, you will be able to run the validator {truncatedPublicKey} with
              BloxStaking until transfers are enabled (phase 1.5) OR for up to 2 years.
              Whichever comes first.&nbsp; 
              <InfoWithTooltip title={tooltipText} placement={'bottom'} margin={'0px'} verticalAlign={'sub'}/>
            </StepBoxLeftParagraph>
          </StepBoxLeft>
          <StepBoxRight>
            <Checkbox isDisabled={stepsData[0].isDisabled} checked={checkedTerms} onClick={setCheckedTermsStatus} />
            <Terms>
              I agree to Blox’s <br />
              <Link isDisabled={stepsData[0].isDisabled} href={!stepsData[0].isDisabled ? 'https://www.bloxstaking.com/privacy-policy/': null} target={'_blank'}>
                Privacy Policy
              </Link>
              &nbsp;and&nbsp;
              <Link isDisabled={stepsData[0].isDisabled} href={!stepsData[0].isDisabled ? 'https://www.bloxstaking.com/terms-of-use/': null} target={'_blank'}>
                License and Service Agreement
              </Link>
            </Terms>
          </StepBoxRight>
        </StepBox>
      )}

      {network_id === '1' && (
        <StepBox data={stepsData[1]} networkId={network_id}>
          <StepBoxLeft>
            <StepBoxLeftParagraph>
                <b>Amount</b> <GreenColor>FREE</GreenColor>
            </StepBoxLeftParagraph>
            <StepBoxLeftParagraph>
              In order to give Eth 2.0 an early stage power push, we decided to offer free service for all stakers.&nbsp;
              <GreenColor>Validators created during the promotion are FREE.</GreenColor>
            </StepBoxLeftParagraph>
          </StepBoxLeft> 
          <StepBoxRight>
            <Free>Free</Free>
          </StepBoxRight>
        </StepBox>
      )}

      {network_id === '5' && (
        <StepBox data={stepsData[1]} networkId={network_id}>
          <StepBoxLeft>
            <StepBoxLeftParagraph>
                <b>Amount</b> Free
            </StepBoxLeftParagraph>
            <StepBoxLeftParagraph>
                <b>Service Period</b> Unlimited
            </StepBoxLeftParagraph>
            <StepBoxLeftParagraph>
                <b>Testnet validators are FREE</b> Staking on Mainnet will require a service fee deposit
            </StepBoxLeftParagraph>
          </StepBoxLeft> 
          <StepBoxRight>
            <GreenColor fontSize={'16px'}>Free &amp; Unlimited!</GreenColor>
          </StepBoxRight>
        </StepBox>
      )}

      <StepBox data={stepsData[2]} networkId={network_id}>
      <StepBoxLeft>
          <StepBoxLeftParagraph>
            <b>Amount</b> 32 ETH + Gas
          </StepBoxLeftParagraph>
          <StepBoxLeftParagraph>
            <b>Validator Public Key</b> {truncatedPublicKey}
          </StepBoxLeftParagraph>
          <StepBoxLeftParagraph>
            <b>Deposit Address</b> {truncatedDepositTo}
          </StepBoxLeftParagraph>
        </StepBoxLeft> 
        <StepBoxRight>
          {isDepositSuccess && txHash ? (
            <SuccessWrapper>
              <GreenColor fontSize={'16px'}>Deposit Confirmed!</GreenColor>
              <ViewTransaction href={`${etherscanLink}${txHash}`} target={'_blank'}>
                View transaction
              </ViewTransaction>
            </SuccessWrapper>
          ) : (
            <ButtonWrapper>
              <Button isDisabled={stepsData[2].isDisabled || isLoadingDeposit} onClick={() => onDepositStart()}>Deposit</Button> 
              {isLoadingDeposit && <Loading> <Spinner width={'17px'} /> Waiting for confirmation...</Loading>}
            </ButtonWrapper>
          )}
        </StepBoxRight>
      </StepBox>
    </>
  )
};

type Props = {
  checkedTerms: boolean;
  setCheckedTermsStatus: () => void;
  stepsData: Record<string, any>[];
  setStepsData: React.Dispatch<React.SetStateAction<Record<string, any>[]>>;
  metamaskInfo: Record<string, any>;
  onDepositStart: () => void;
  publicKey: string;
  depositTo: string;
  error: Record<string, any>;
  network_id: string;
  isLoadingDeposit: boolean;
  isDepositSuccess: boolean;
  txHash: string;
};

export default StepsBoxes;