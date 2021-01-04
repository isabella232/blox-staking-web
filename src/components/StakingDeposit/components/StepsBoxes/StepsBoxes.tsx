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
  Blox Staking service charges will only be applied
  to validators created after this promotion ends.
  Don't worry, we will NEVER charge you for
  creating or running the validators created during
  this promotion period.
`;

const StepsBoxes = (props: Props) => {
  const { stepsData, setStepsData, checkedTerms, setCheckedTermsStatus,
          walletInfo, onDepositStart, publicKey, depositTo, error, network_id,
          isLoadingDeposit, isDepositSuccess, txHash, walletType, alreadyDeposited, checkingDeposited
        } = props;

  const { selectedAddress } = walletInfo;

  useEffect(() => {
    if(network_id === '1') {
      updateStep(0, selectedAddress && error.type === '');
      updateStep(1, selectedAddress && error.type === '');
    }
    else if(network_id === '5') {
      updateStep(1, selectedAddress && error.type === '');
      updateStep(2, selectedAddress && error.type === '');
    }
  }, [walletInfo, error]);

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

  const upperCaseWalletType = walletType ? walletType.charAt(0).toUpperCase() + walletType.slice(1) : null;

  const etherscanLink = network_id === '1' ? 'https://etherscan.io/tx/' : 'https://goerli.etherscan.io/tx/';
  const isButtonDisabled = stepsData[2].isDisabled || isLoadingDeposit || alreadyDeposited || checkingDeposited;

  return (
    <>
      {network_id === '1' && (
        <StepBox data={stepsData[0]}>
          <StepBoxLeft>
            <StepBoxLeftParagraph>
              Early-bird promotion - During the promotion, we will NOT charge you on any
              validators created during the “early stage” period. Once we start to charge
              our users, you will be notified (no surprise fees).&nbsp;
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
            <b>Amount</b> 32 {network_id === "1" ? 'ETH' : 'GoETH'} + Gas
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
              <Button isDisabled={isButtonDisabled} onClick={() => !isButtonDisabled && onDepositStart()}>{upperCaseWalletType ? `Deposit with ${upperCaseWalletType}` : `Deposit`}</Button>
              {(isLoadingDeposit || checkingDeposited) && <Loading> <Spinner width={'17px'} /> Waiting for confirmation...</Loading>}
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
  walletInfo: Record<string, any>;
  onDepositStart: () => void;
  publicKey: string;
  depositTo: string;
  error: Record<string, any>;
  network_id: string;
  isLoadingDeposit: boolean;
  isDepositSuccess: boolean;
  txHash: string;
  walletType: string;
  checkingDeposited: boolean;
  alreadyDeposited: boolean;
};

export default StepsBoxes;
