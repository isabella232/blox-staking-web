import React from 'react';
import styled from 'styled-components';

import { InfoWithTooltip, Checkbox, Button } from 'common/components';
import StepBox from '../StepBox';

const StepBoxLeft = styled.div`
  width: 395px;
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

const tooltipText = `
  By depositing the service fee of $180 (paid in ETH and automatically converted to CDT by a third party),
  Blox Staking will provide staking services for 1 Eth2 validator until transfers are available (phase 1.5)
  or for up to 2 years following activation (whichever comes first).
  The fee will not renew automatically and you will be asked to deposit a new fee for the following year of service.
  The service fee is non-refundable. Network gas fees will apply.
`;

const StepsBoxes = ({stepsData, setStepsData, checkedTerms, setCheckedTermsStatus, metamaskAccount}: Props) => {

  React.useEffect(() => updateStep(0, metamaskAccount), [metamaskAccount]);

  React.useEffect(() => updateStep(1, checkedTerms), [checkedTerms]);

  const updateStep = (stepIndex, condition) => {
    const newStepsData = [...stepsData];
    const newStep = condition ? 
      { isActive: true, isDisabled: false } : 
      { isActive: false, isDisabled: true };
    newStepsData[stepIndex] = {...stepsData[stepIndex], ...newStep};
    setStepsData(newStepsData);
  }

  return (
    <>
      <StepBox data={stepsData[0]}>
        <StepBoxLeft>
          <StepBoxLeftParagraph>
            After completing the Service Fee Deposit, you will be able to run the validator 0x8237...a2863F with
            BloxStaking until transfers are enabled (phase 1.5) OR for up to 2 years.
            Whichever comes first.&nbsp; 
            <InfoWithTooltip title={tooltipText} placement={'bottom'} margin={'0px'} verticalAlign={'sub'}/>
          </StepBoxLeftParagraph>
        </StepBoxLeft>
        <StepBoxRight>
          <Checkbox isDisabled={stepsData[0].isDisabled} checked={checkedTerms} onClick={setCheckedTermsStatus} />
          <Terms>
            I agree to Blox’s <br />
            <Link isDisabled={stepsData[0].isDisabled} href={!stepsData[0].isDisabled ? '': null} target={'_blank'}>
              Privacy Policy
            </Link>
            &nbsp;and&nbsp;
            <Link isDisabled={stepsData[0].isDisabled} href={!stepsData[0].isDisabled ? '': null} target={'_blank'}>
              License and Service Agreement
            </Link>
          </Terms>
        </StepBoxRight>
      </StepBox>
      <StepBox data={stepsData[1]}>
        <StepBoxLeft>
          <StepBoxLeftParagraph>
             <b>Amount</b> 0.5 ETH + Gas (fee is converted into CDT and burnt
          </StepBoxLeftParagraph>
          <StepBoxLeftParagraph>
            <b>Deposit Address</b> 0x078661f0E792495278298fd12c87cD49be8d50E5
          </StepBoxLeftParagraph>
        </StepBoxLeft> 
        <StepBoxRight>
          <Button isDisabled={stepsData[1].isDisabled}>Deposit</Button> 
        </StepBoxRight>
      </StepBox>
      <StepBox data={stepsData[2]}>
      <StepBoxLeft>
          <StepBoxLeftParagraph>
             <b>Amount</b> 32 ETH + Gas
          </StepBoxLeftParagraph>
          <StepBoxLeftParagraph>
            <b>Validator Public Key</b> 0x82379d23bdsdsfsfsff6c3d...cd0746e5fa6c1ba2863F
          </StepBoxLeftParagraph>
          <StepBoxLeftParagraph>
            <b>Deposit Address</b> 0x078661f0E792495278298fd12c87cD49be8d50E5
          </StepBoxLeftParagraph>
        </StepBoxLeft> 
        <StepBoxRight>
          <Button isDisabled={stepsData[2].isDisabled}>Deposit</Button> 
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
  metamaskAccount: string;
};

export default StepsBoxes;