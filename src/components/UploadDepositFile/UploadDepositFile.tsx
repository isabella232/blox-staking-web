import React, {useEffect, useState} from "react";
import styled from "styled-components";
import { useHistory } from 'react-router-dom';
import ClearIcon from '@material-ui/icons/Clear';
import {DropzoneArea} from 'material-ui-dropzone';
import {CircularProgress} from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import {ErrorMessages} from './constants';
import {InfoWithTooltip} from '../../common/components';
import {readFile, verifyDepositFile, getAccounts} from './helper'
import {Section, SubTitle, Title} from '../StakingDeposit/components';
import parsedQueryString from '../../common/helpers/getParsedQueryString';

const DropZoneContainer = styled.div`
  & .MuiDropzoneArea-root {
    background-image: url('/images/drop_zone_icon.svg'), url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4' ry='4' stroke='rgba(91, 108, 132, 1)' stroke-width='3' stroke-dasharray='10%2c 10' stroke-dashoffset='30' stroke-linecap='square'/%3e%3c/svg%3e");
    background-repeat: no-repeat, repeat;
    background-color: #FAFAFA;
    animation: none !important;
    background-position: center !important;
    border: none;
    background-size: auto !important;
    border-radius: 4px;
  }

  & .MuiDropzoneArea-active {
    background-color: red !important;
  }

  .MuiDropzonePreviewList-root {
    display: none;
  }

  & .MuiDropzoneArea-text {
    padding-top: 30px;
    color: rgba(215, 215, 215, 1);
    font-size: 18px;
  }

  & .MuiDropzoneArea-icon {
    display: none;
    color: rgba(215, 215, 215, 1);
  }

  & .MuiDropzonePreviewList-imageContainer {
    margin: auto;
  }

  & .MuiDropzonePreviewList-image {
    margin-top: 20px;
    width: 30px;
    height: 30px;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  height: calc(100% - 70px);
  padding: 35px 115px 0px 115px;
  position: relative;
  background-color: ${({theme}) => theme.gray100};
`;

const UploadWrapper = styled.div`
  width: 551px;
`;

const SubTitleWrapper = styled.div`
  width: 560px;
  display: flex;
  align-items: center;
`;

const FileApproval = styled.div`
  display: flex;
  padding: 10px;
  background-color: white;
  justify-content: space-between;
  text-align: center;
  align-items: center;
  align-content: center;
  height: 50px;
  box-sizing: border-box;
  border: 1px solid black;
  border-radius: 6px;
  margin-top: 12px;
`;

const ApprovedIcon = styled.img`
  float: left;
  width: 30px;
  height: 39px;
  margin-right: 10px;
`;

const RemoveIcon = styled.img`
  cursor: pointer;
`;

const FileName = styled.div`
  width: 100%;
  text-align: left;
`;

const ErrorMessage = styled.div`
  width: auto;
  max-width: 560px;
  padding: 8px 16px;
  color: ${({theme}) => theme.warning900};
  border: 2px solid ${({theme}) => theme.warning900};
  border-radius: 4px;
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
`;

const IconWrapper = styled.div`
  margin-right: 12px;
`;

const ErrorText = styled.div``;

const Deposit = styled.button<{ isDisabled: boolean }>`
  display: block;
  width: 250px;
  height: 40px;
  color: white;
  font-weight: bold;
  border-radius: 10px;
  border: none;
  margin-top: 20px;
  cursor: pointer;
  outline: none;
  text-align: center;
  align-content: center;
  vertical-align: middle;
  background-color: ${({theme, isDisabled}) => isDisabled ? theme.gray400 : theme.primary900};

  &:hover {
    color: ${({theme, isDisabled}) => isDisabled ? null : theme.primary400};
  }

  &:active {
    color: ${({theme, isDisabled}) => isDisabled ? null : theme.primary800};
  }`;

const DoNotDeposit = styled.p`
  width: 250px;
  color: #2536b8;
  margin-top: 10px;
  text-align: center;
  cursor: pointer;
`;

const progress = <CircularProgress style={{color: 'black', width: 20, height: 20, marginRight: '10px'}}/>;
const approved = <ApprovedIcon src={'/images/approved_file_icon.svg'}/>;
const failed = <ClearIcon style={{color: 'red', float: 'left', marginRight: '10px'}}/>;

const qsObject: Record<string, any> = parsedQueryString(location.search);
const {id_token, account_id, network_id} = qsObject;

type Props = {
    setValidatorsDepositData: any
}

const UploadDepositFile = (props: Props) => {
    const {setValidatorsDepositData} = props
    const history = useHistory()
    const [fileIsJson, setFileIsJson] = useState(true);
    const [depositFile, setDepositFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const [redirectToBloxApp, shouldRedirectToBloxApp] = useState(false);
    const [keyStoreMatchDeposit, setKeyStoreMatchDeposit] = useState(null);
    const [validatorDepositData, setValidatorDepositData] = useState(null);


    useEffect(() => {
        if (!fileIsJson) setErrorMessage(ErrorMessages.wrong_file_type);
    }, [fileIsJson])

    const onFileChange = async (file: File) => {
        setErrorMessage('')
        setIsLoadingFile(true);
        setKeyStoreMatchDeposit(null);
        setDepositFile(file)
        setFileIsJson(file?.type === 'application/json');
        setTimeout(() => {
            setIsLoadingFile(false);
        }, 500)
        const validators = await readFile(file);
        if (!validators) {
            setErrorMessage('File is not deposit file');
            setKeyStoreMatchDeposit(false);
        } else {
            const bloxAccounts = await getAccounts(id_token, account_id);
            const allPublicKeysExist = await verifyDepositFile(validators, bloxAccounts);
            setKeyStoreMatchDeposit(allPublicKeysExist);
            if (!allPublicKeysExist) {
                setErrorMessage(ErrorMessages.corrupted_deposit_file);
            } else {
                setValidatorDepositData(validators);
            }
        }
    };

    const redirectToBlox = () => {
        shouldRedirectToBloxApp(true);
    };

    const handleSubmit = () => {
        setValidatorsDepositData(validatorDepositData)
        history.push(`/staking-deposit?account_id=${account_id}&id_token=${id_token}&network_id=${network_id}`);
    };

    const removeDepositFile = () => {
        setDepositFile(null);
    };

    function renderIconStatus() {
        if (isLoadingFile) {
            return progress
        } else if (fileIsJson) {
            return approved
        } else {
            return failed
        }
    }

    const renderButtonText = () => {
        switch (keyStoreMatchDeposit) {
            case null:
                return progress
            default:
                return 'Manage Keystore Files'
        }
    };

    return (
         <Wrapper>
             {id_token && account_id ? <UploadWrapper>
                <Title>Upload Deposit File</Title>
                <Section>
                    <SubTitleWrapper>
                        <SubTitle style={{marginBottom: '0px', marginRight: '5px'}}>Upload the deposit data file that
                            matches your validator's keystore file.</SubTitle>
                        <InfoWithTooltip
                            title={'The deposit_data-[timestamp].json file is usually located in your /eth2.0-deposit-cli/validator_keys directory'}
                            placement={'right'} margin={'0px'} verticalAlign={'sub'}/>
                    </SubTitleWrapper>
                </Section>
                <Section>
                    <DropZoneContainer>
                        <DropzoneArea
                            dropzoneText={''}
                            showPreviews={false}
                            onChange={(file) => {
                                file.length !== 0 && onFileChange(file[0])
                            }}
                            filesLimit={1}
                            maxFileSize={5000000}
                        />
                    </DropZoneContainer>
                </Section>
                {depositFile && <>
                    <Section>
                        <SubTitle>Uploaded File</SubTitle>
                        <FileApproval>
                            {renderIconStatus()}
                            <FileName>{depositFile.name}</FileName>
                            <RemoveIcon onClick={removeDepositFile} src={'/images/remove_icon.svg'}/>
                        </FileApproval>
                    </Section>
                    {errorMessage &&
                    <Section>
                        <ErrorMessage style={{}}>
                            <IconWrapper>
                                <WarningIcon/>
                            </IconWrapper>
                            <ErrorText>{errorMessage}</ErrorText>
                        </ErrorMessage>
                    </Section>
                    }
                    {fileIsJson && keyStoreMatchDeposit !== null &&
                    <>
                        <Section>
                            <Deposit isDisabled={!keyStoreMatchDeposit}
                                     onClick={handleSubmit}>{renderButtonText()}</Deposit>
                            <DoNotDeposit onClick={redirectToBlox}>Do not deposit these validators</DoNotDeposit>
                        </Section>
                        {redirectToBloxApp && <iframe title={'callApp'} width={'0px'} height={'0px'}
                                                      src={`blox-live://token_id=${id_token}&refresh_token=${id_token}`}/>}
                    </>
                    }
                </>}
            </UploadWrapper> : <div>Missing token and ids</div>}
        </Wrapper>
    )
}

export default UploadDepositFile;
