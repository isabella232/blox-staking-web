import { observer } from "mobx-react-lite";
import { useHistory } from 'react-router-dom';
import ClearIcon from '@material-ui/icons/Clear';
import { DropzoneArea } from 'material-ui-dropzone';
import { CircularProgress } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import React, { useContext, useEffect, useState } from "react";
import { ERROR_MESSAGES } from './constants';
import { InfoWithTooltip } from '../../common/components';
import { AppStoreContext } from "../../common/stores/AppStore";
import {readFile, verifyDepositFile, getAccounts } from './helper'
import { Section, SubTitle, Title } from '../StakingDeposit/components';
import { UploadDepositStoreContext } from "../../common/stores/UploadDepositStore";
import {
    ApprovedIcon,
    IconWrapper,
    UploadWrapper,
    SubTitleWrapper,
    RemoveIcon,
    FileApproval,
    FileName,
    Wrapper,
    ErrorMessage,
    ErrorText,
    DropZoneContainer,
    Deposit,
    DoNotDeposit
} from './elements';


const progress = <CircularProgress style={{color: 'black', width: 20, height: 20, marginRight: '10px'}}/>;
const approved = <ApprovedIcon src={'/images/approved_file_icon.svg'}/>;
const failed = <ClearIcon style={{color: 'red', float: 'left', marginRight: '10px'}}/>;

const UploadDepositFile = observer(() => {
    const history = useHistory()
    const appStore = useContext( AppStoreContext )
    const { queryParams } = appStore
    const [fileIsJson, setFileIsJson] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const uploadDepositStore = useContext(UploadDepositStoreContext);
    const [redirectToBloxApp, shouldRedirectToBloxApp] = useState(false);
    const [keyStoreMatchDeposit, setKeyStoreMatchDeposit] = useState(null);
    const [bloxReturnUrl] = useState(`blox-live://token_id=${queryParams['id_token']}&refresh_token=${queryParams['id_token']}`)
    const { setDepositFile, setDepositFileData, depositFile, setLoadingFile, isLoadingFile } = uploadDepositStore

    useEffect(() => {
        if (!fileIsJson) setErrorMessage(ERROR_MESSAGES.WRONG_FILE_TYPE);
    }, [fileIsJson])

    const onFileChange = async (file: File) => {
        setDepositFile(file)
        setErrorMessage('')
        setLoadingFile(true);
        setKeyStoreMatchDeposit(null);
        setFileIsJson(file?.type === 'application/json');
        setTimeout(() => {
            setLoadingFile(false);
        }, 500)
        const validators = await readFile(file);
        if (!validators) {
            setErrorMessage(ERROR_MESSAGES.NOT_DEPOSIT_FILE);
            setKeyStoreMatchDeposit(false);
        } else {
            const bloxAccounts = await getAccounts(queryParams['id_token'], queryParams['account_id']);
            if (bloxAccounts.length === 0) {
                setErrorMessage(ERROR_MESSAGES.NO_ACCOUNTS);
            }
            const allPublicKeysExist = await verifyDepositFile(validators, bloxAccounts);

            setKeyStoreMatchDeposit(allPublicKeysExist);
            if (!allPublicKeysExist) {
                setErrorMessage(ERROR_MESSAGES.CORRUPTED_DEPOSIT_FILE);
            } else {
                setDepositFileData(validators)
            }
        }
    };

    const redirectToBlox = () => {
        shouldRedirectToBloxApp(true);
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
        if (keyStoreMatchDeposit === null) {
            return progress
        }
        return 'Manage Keystore Files'

    };

    return (
         <Wrapper>
             <UploadWrapper>
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
                    {!errorMessage && keyStoreMatchDeposit !== null &&
                    <>
                        <Section>
                            <Deposit isDisabled={!keyStoreMatchDeposit} onClick={()=>{history.push(`/staking-deposit`)}}>
                                {renderButtonText()}
                            </Deposit>
                            <DoNotDeposit onClick={redirectToBlox}>Do not deposit these validators</DoNotDeposit>
                        </Section>
                        {redirectToBloxApp && <iframe title={'callApp'}
                                                      width={'0px'}
                                                      height={'0px'}
                                                      src={bloxReturnUrl}
                                              />
                        }
                    </>
                    }
                </>}
            </UploadWrapper>
        </Wrapper>
    )
});

export default UploadDepositFile;
