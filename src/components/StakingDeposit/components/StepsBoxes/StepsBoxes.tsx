import React, {useEffect} from 'react';
import styled from 'styled-components';
import {truncateText} from 'common/helpers/truncateText';
import {InfoWithTooltip, Checkbox, Button} from 'common/components';
import StepBox from '../StepBox';
import {buttonText} from "../../../UploadDepositFile/helper";

const StepBoxLeft = styled.div<{ center?: boolean }>`
  width: 410px;
  height: 60px;
  font-size: 11px;
  font-weight: 500;
  line-height: 2;
  display: flex;
  flex-direction: column;
  color: ${({theme}) => theme.gray600};
  justify-content: ${({center}) => center ? 'center' : 'normal'};;
`;

const StepBoxLeftParagraph = styled.p`
  line-height: 2;
  margin: 0px;
`;

const UnderLine = styled.div`
  border-bottom: 0.5px solid darkgray;
  opacity: 0.5;
  width: 100%;
  margin-bottom: 5px;
`;

const StepBoxRight = styled.div`
  height: 100%;
  margin-left: 60px;
  font-size: 11px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({theme}) => theme.gray800};
`;

const Terms = styled.div`
  width: 155px;
  font-size: 12px;
`;

const Link = styled.a<{ isDisabled: boolean }>`
  text-decoration: underline;
  color: ${({theme}) => theme.gray600};
  cursor: ${({isDisabled}) => isDisabled ? 'default' : 'pointer'};
`;

const Free = styled.div`
  font-size: 20px;
  margin-left: 60px;
  margin-top: 15px;
  font-weight: 900;
  color: ${({theme}) => theme.accent2400};
  text-transform: uppercase;
`;

const GreenColor = styled.span`
  color: ${({theme}) => theme.accent2400};
`;

const ButtonWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
`;

const SuccessWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 175px;
  height: 32px;
  font-size: 14px;
  font-weight: 900;
  align-items:center;
  background-color: ${({theme}) => theme.accent2400};
  border-radius: 6px;
  color:${({theme}) => theme.white};
`;

const PublicKeysWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  height: 100%;
`;

const PublicKey = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const tooltipText = `
  Blox Staking service charges will only be applied
  to validators created after this promotion ends.
  Don't worry, we will NEVER charge you for
  creating or running the validators created during
  this promotion period.
`;


const StepsBoxes = (props: Props) => {
    const {
        stepsData, setStepsData, checkedTerms, setCheckedTermsStatus, inProgress,
        walletInfo, onDepositStart, bloxAccounts, depositTo, error, network_id,
        isLoadingDeposit
    } = props;

    const {selectedAddress} = walletInfo;

    useEffect(() => {
        if (network_id === '1') {
            updateStep(0, selectedAddress && error.type === '' && (!isLoadingDeposit));
            updateStep(1, selectedAddress && error.type === '');
        } else if (network_id === '5') {
            updateStep(1, selectedAddress && error.type === '');
            updateStep(2, selectedAddress && error.type === '');
        }
    }, [walletInfo, error, isLoadingDeposit]);

    useEffect(() => {
        if (network_id === '1') {
            updateStep(2, checkedTerms && error.type === '');
        }
    }, [checkedTerms, error]);

    const updateStep = (stepIndex, condition) => {
        setStepsData((prevState) => {
            const newStepsData = [...prevState];
            const newStep = condition ?
                {isActive: true, isDisabled: false} :
                {isActive: false, isDisabled: true};
            newStepsData[stepIndex] = {...stepsData[stepIndex], ...newStep};
            return newStepsData;
        });
    }

    const renderDepositButton = (isDepositSuccess: boolean, txHash: string, depositAll: boolean, accountPublicKey: string, buttonText: string) => {
        if(depositAll && bloxAccounts.length === 1) return '';
        if (isDepositSuccess && txHash && !depositAll) {
            return <SuccessWrapper>
                <GreenColor>{buttonText}</GreenColor>
            </SuccessWrapper>
        } else {
            return <ButtonWrapper>
                <Button isDisabled={isButtonDisabled} onClick={() => !isButtonDisabled && onDepositStart(depositAll, accountPublicKey)}>{buttonText}</Button>
            </ButtonWrapper>
        }
    };

    const notDeposited = bloxAccounts.filter(account => account.status !== 'deposited').length;
    const allDeposited = notDeposited === 0
    const isButtonDisabled = inProgress || stepsData[2].isDisabled || isLoadingDeposit || allDeposited

    return (
        <>
            {network_id === '1' && (
                <StepBox data={stepsData[0]}>
                    <StepBoxLeft>
                        <StepBoxLeftParagraph>
                            Early-bird promotion - During the promotion, we will NOT charge you on any
                            validators created during the “early stage” period. Once we start to charge
                            our users, you will be notified (no surprise fees).&nbsp;
                            <InfoWithTooltip title={tooltipText} placement={'bottom'} margin={'0px'}
                                             verticalAlign={'sub'}/>
                        </StepBoxLeftParagraph>
                    </StepBoxLeft>
                    <StepBoxRight>
                        <Checkbox isDisabled={stepsData[0].isDisabled} checked={checkedTerms}
                                  onClick={setCheckedTermsStatus}/>
                        <Terms>
                            I agree to Blox’s <br/>
                            <Link isDisabled={stepsData[0].isDisabled}
                                  href={!stepsData[0].isDisabled ? 'https://www.bloxstaking.com/privacy-policy/' : null}
                                  target={'_blank'}>
                                Privacy Policy
                            </Link>
                            &nbsp;and&nbsp;
                            <Link isDisabled={stepsData[0].isDisabled}
                                  href={!stepsData[0].isDisabled ? 'https://www.bloxstaking.com/terms-of-use/' : null}
                                  target={'_blank'}>
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
                            In order to give Eth 2.0 an early stage power push, we decided to offer free service for all
                            stakers.&nbsp;
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
                        <GreenColor>Free &amp; Unlimited!</GreenColor>
                    </StepBoxRight>
                </StepBox>
            )}
                <StepBox data={stepsData[2]} networkId={network_id}>
                    <PublicKeysWrapper>
                        <PublicKey>
                            <StepBoxLeft>
                                <StepBoxLeftParagraph>
                                    <b>Total</b> {bloxAccounts.length * 32} {network_id === "1" ? 'ETH' : 'GoETH'} +
                                    Gas
                                </StepBoxLeftParagraph>
                                <StepBoxLeftParagraph>
                                    <b>Deposit Address</b> {depositTo}
                                </StepBoxLeftParagraph>
                            </StepBoxLeft>
                            <StepBoxRight>
                                {renderDepositButton(false, null, true, null, allDeposited ? 'All Deposited' : `Send all ${notDeposited} Deposits`)}
                            </StepBoxRight>
                        </PublicKey>
                        {bloxAccounts.map((account, index) => {
                            const truncatedPublicKey = truncateText(account.publicKey, 15, 15);
                            const addSeparationLine = index >= 0;
                            const {status, publicKey, depositTxHash} = account;
                            const isDepositSuccess = status === 'deposited';

                            return (
                                <div key={index}>
                                    {addSeparationLine && <UnderLine/>}
                                    <PublicKey>
                                        <StepBoxLeft center>
                                            <StepBoxLeftParagraph>
                                                <b>Validator Public Key: </b> {truncatedPublicKey}
                                            </StepBoxLeftParagraph>
                                        </StepBoxLeft>
                                        <StepBoxRight>
                                            {renderDepositButton(isDepositSuccess, depositTxHash, false, publicKey,  buttonText(status))}
                                        </StepBoxRight>
                                    </PublicKey>
                                </div>
                            )
                        })}
                    </PublicKeysWrapper>
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
    onDepositStart: (depositAll?, publicKey?) => void;
    bloxAccounts: Array<any>;
    depositTo: string;
    error: Record<string, any>;
    network_id: string;
    isLoadingDeposit: boolean;
    inProgress: boolean;
};

export default StepsBoxes;
