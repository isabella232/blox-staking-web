import axios from 'axios';
import Analytics from 'analytics';
import {notification} from 'antd';
import jwtDecode from 'jwt-decode';
import styled from 'styled-components';
import {useEffect, useState} from 'react';
import {Icon} from 'common/components';
import parsedQueryString from 'common/helpers/getParsedQueryString';
import {NETWORK_IDS} from 'service/WalletProviders/Metamask/constants';
import bloxAnalyticsPlugin from 'service/analytics/blox-analytics-plugin';
import ModalsManager from '../ModalsManager';
import {Spinner} from "../../common/components";
import useModals from '../ModalsManager/useModals';
import {STEP_BOXES, BUTTON_STATE} from './constants';
import {MODAL_TYPES} from '../ModalsManager/constants';
import {getAccounts, prefix0x} from "../UploadDepositFile/helper";
import {StrategyError} from "../../service/WalletProviders/Metamask/MetaMaskStrategy";
import WalletProvidersContext from "../../service/WalletProviders/WalletProvidersContext";
import {
    Wrapper, Section, Title, SubTitle, ErrorMessage, StepsBoxes,
    ConnectedWallet, NeedGoETH, DepositMethod, ConnectWalletButton, Faq, SecurityNotification
} from './components';


const qsObject: Record<string, any> = parsedQueryString(location.search);
const {network_id, account_id, tx_data, id_token} = qsObject;

const initialWalletInfoState = {
    networkVersion: '',
    networkName: '',
    selectedAddress: '',
    balance: '',
};

const NotificationContent = styled.div`
  width: 350px;
  display: flex;
  flex-direction: column;
`;

const Loading = styled.div`
  display: flex;
  color: ${({theme}) => theme.primary900};
  width: 320px;
  height: 16px;
  margin-top: 8px;
  font-size: 11px;
  font-weight: 500;
`;

const NotificationContentInnerWrapper = styled.div`
  display: flex;
`;

const Span = styled.span`
  width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DepositConfirmed = styled.div`
  width: 858px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ReloadPageButton = styled.button`
  width: 182px;
  height: 32px;
  font-size: 14px;
  font-weight: 900;
  border-radius: 4px;
  border: solid 1px ${({theme}) => theme.gray400};
  color: ${({theme}) => 'white'};
  background-color: ${({theme}) => theme.primary900};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    color: ${({theme}) => theme.primary600};
    background-color: transparent;
  }

  &:active {
    color: ${({theme}) => theme.primary600};
    background-color: transparent;
  }
`;

type Props = {
    validatorsDepositData: any;
};

const StakingDeposit = (props: Props) => {
    const {validatorsDepositData} = props
    const [txHash, setTxHash] = useState(null);
    const [stepsData, setStepsData] = useState(STEP_BOXES);
    const [inProgress, setInProgress] = useState(false);
    const [bloxAccounts, setBloxAccounts] = useState(null);
    const [isTermsChecked, setTermsCheck] = useState(false);
    const [loadingWallet, setLoadingWallet] = useState(false);
    const [walletProvider, setWalletProvider] = useState(null);
    const [walletInfo, setWalletInfo] = useState(initialWalletInfoState);
    const [error, setError] = useState({type: '', message: ''});
    const [successDeposited, setSuccessDeposited] = useState([]);
    const [isShowingReloadButton, showReloadButton] = useState(false);
    const [loadingDeposit, setDepositLoadingStatus] = useState(false);
    const [isDepositSuccess, setDepositSuccessStatus] = useState(false);
    const [oneTimeWrongNetworkModal, setOneTimeWrongNetworkModal] = useState(false);
    const [showSecurityNotification, setSecurityNotificationDisplay] = useState(true);
    const [analytics] = useState(Analytics({app: 'blox-live', plugins: [bloxAnalyticsPlugin(id_token)]}));
    const [depositTo] = useState(network_id === '1' ? process.env.REACT_APP_MAINNET_DEPOSIT_CONTRACT_ADDRESS : process.env.REACT_APP_PRATER_DEPOSIT_CONTRACT_ADDRESS)


    const DEPOSIT_THERSHOLD = 32.01;
    const etherscanLink = network_id === '1' ? 'https://etherscan.io/tx/' : 'https://goerli.etherscan.io/tx/';


    const {showModal, hideModal, modal} = useModals();

    const areNetworksEqual = network_id === walletInfo.networkVersion;

    useEffect(() => {
        console.warn('🧧️ DEPOSIT CONTRACT ADDRESS: ', depositTo);
        document.title = 'Blox Staking - Transfers Hub';
        const placement = 'bottomRight';
        notification.config({placement});
        getAccounts(id_token, account_id, setBloxAccounts);
        const timeout = setTimeout(() => setSecurityNotificationDisplay(false), 5000);
        return () => {
            clearTimeout(timeout);
        };

    }, []);

    useEffect(() => {
        if (network_id && walletInfo.networkVersion && !areNetworksEqual) {
            setError({type: 'networksNotEqual', message: `Please change to ${NETWORK_IDS[network_id]}`,});
            if (!oneTimeWrongNetworkModal) {
                setOneTimeWrongNetworkModal(true);
                showModal({show: true, type: MODAL_TYPES.WRONG_NETWORK, params: {networkType: network_id.toString()}});
            }
        } else if (walletInfo.balance !== '' && Number(walletInfo.balance) < DEPOSIT_THERSHOLD) {
            setError({type: 'lowBalance', message: 'Insufficient balance in selected wallet'});
        } else {
            setError({type: '', message: ''});
        }
    }, [network_id, walletInfo]);

    useEffect(() => {
        if (walletProvider == null) return;
        const neededModal = walletProvider.getWarningModal();
        if (neededModal !== undefined) {
            setWalletProvider(null);
            showModal({show: true, type: neededModal});
            return
        }

        setSecurityNotificationDisplay(false);
        if (walletProvider.showLoader()) setLoadingWallet(true);
        connectWallet(walletProvider.providerType);
    }, [walletProvider]);

    const onWalletProviderClick = async (type: string) => {
        if (type === 'ledger' || type === 'trezor') {
            showModal({
                    show: true, type: MODAL_TYPES[`${type.toUpperCase()}`], params: {
                        onClick: () => {
                            hideModal();
                            setWalletProvider(new WalletProvidersContext(type, network_id));
                        },
                        onClose: () => {
                            hideModal();
                        }
                    }
                }
            );
            return
        }
        setWalletProvider(new WalletProvidersContext(type, network_id));
    };

    const connectWallet = async (type) => {
        await walletProvider.connect()
            .then(() => {
                notification.success({
                    message: '',
                    description: `Successfully connected to ${type.charAt(0).toUpperCase() + type.slice(1)}`
                });
                setLoadingWallet(false);
                walletProvider.subscribeToUpdate(onInfoUpdate);
                walletProvider.subscribeToLogout(onLogout);
                walletProvider.getInfo().then((info) => {
                    updateWalletInfo(info)
                });
            }, null)
            .catch((error) => {
                if (error.code === StrategyError.ERROR_CODE_NOT_CONNECTED) {
                    showReloadButton(true);
                    setError({type: 'disconnected', message: error.message});
                }
                console.log('Wallet provider connect error - ', error);
                disconnect();
            });
    };

    const updateWalletInfo = (info) => {
        const {networkName, networkVersion, selectedAddress, balance} = info;
        setWalletInfo((prevState) => ({
            ...prevState,
            networkName,
            networkVersion,
            selectedAddress: selectedAddress,
            balance
        }));
    };

    const onInfoUpdate = async () => updateWalletInfo(await walletProvider.getInfo());
    const onLogout = async () => disconnect();


    const setValidatorStatus = (accountId: string, status: string, txHash?: string) => {
        const newAccounts = [...bloxAccounts];
        newAccounts.forEach((account) => {
            if (account.id === accountId) {
                account.status = status
                if (txHash) account.depositTxHash = txHash
            }
        });
        setBloxAccounts(newAccounts);
    };

    const onDepositStart = async (sendAll: boolean = false, publicKey?: string) => {
        const accounts = sendAll ? [...bloxAccounts] : bloxAccounts.filter((account) => {
            return account.publicKey === publicKey
        });
        setInProgress(true);

        if (tx_data) {
            walletProvider.sendSignTransaction(depositTo, accounts[0].id, tx_data, onStart, onSuccess, onError);
        } else {
            await handleMultipleTransactions(accounts);
        }
    };

    const handleMultipleTransactions = async (accounts) => {
        const remainingTxs = accounts.filter(key => key.status === 'waiting');
        const nextTransaction = remainingTxs.shift();
        if (nextTransaction === undefined) {
            return;
        }
        let depositData = null;
        if(validatorsDepositData) depositData = validatorsDepositData.filter(deposit => prefix0x(deposit.pubkey) === nextTransaction.publicKey)[0];

        if (!depositData) {
            setInProgress(false);
            return;
        }

        setValidatorStatus(nextTransaction.id, BUTTON_STATE.WAITING_FOR_CONFIRMATION.key);
        walletProvider.sendSignTransaction(depositTo, nextTransaction.id, tx_data, onStart, onSuccess, onError, depositData);
        await handleMultipleTransactions(remainingTxs)
    };


    const onStart = async (txHash, accountId) => {
        console.log('deposit start---------', txHash);
        await sendAccountUpdate(false, accountId, txHash, () => {
            setValidatorStatus(accountId, BUTTON_STATE.PENDING.key);
            notification.success({
                message: '', description:
                    <NotificationContent>
                        Transaction hash: <br/>
                        <NotificationContentInnerWrapper>
                            <Span>{txHash}</Span>
                            <Icon color={'primary900'} name={'icons-export'} fontSize={'16px'}
                                  onClick={() => window.open(`${etherscanLink}${txHash}`, '_blank')}/>
                        </NotificationContentInnerWrapper>
                    </NotificationContent>
            });
            return;
        }, () => {
            setValidatorStatus(accountId, BUTTON_STATE.DEPOSIT.key);
            return;
        });
    };

    const onSuccess = async (error, txReceipt, accountId) => {
        console.log('deposit end---------', error, txReceipt);
        setInProgress(false);
        if (error) {
            setDepositLoadingStatus(false);
            notification.error({message: error.message, duration: 0});
        } else if (txReceipt) {
            if (txReceipt.status) {
                if(tx_data) setTxHash(txReceipt.transactionHash);
                await sendAccountUpdate(true, accountId, txReceipt.transactionHash, () => {
                    setSuccessDeposited([...successDeposited, account_id]);
                    setValidatorStatus(accountId, BUTTON_STATE.DEPOSITED.key, txReceipt.transactionHash);
                }, () => {
                    setValidatorStatus(accountId, BUTTON_STATE.DEPOSIT.key, txReceipt.transactionHash);
                });
                notification.success({
                    message: '', description: <NotificationContent>
                        Successfully deposited 32 ETH to <br/>
                        <NotificationContentInnerWrapper>
                            <Span>{depositTo}</Span>
                            <Icon name={'icons-export'} color={'primary900'} fontSize={'16px'}
                                  onClick={() => window.open(`${etherscanLink}${txReceipt.transactionHash}`, '_blank')}/>
                        </NotificationContentInnerWrapper>
                    </NotificationContent>
                });
                setDepositSuccessStatus(true);
            } else {
                setDepositLoadingStatus(false);
                notification.error({message: `Failed to send transaction`, duration: 0});
            }
        }
    };

    const onError = (walletProviderError, accountId) => {
        setDepositLoadingStatus(false);
        setInProgress(false);
        setValidatorStatus(accountId, BUTTON_STATE.DEPOSIT.key);
        const enableContractDataMessage = 'Failed to send transaction. Please enable contract data on your Ledger and try again.';
        let defaultMessage = 'Failed to send transaction. Please report us about this issue.';
        let errorMessage;
        const errorMessageString = String(walletProviderError.message);
        if (walletProviderError.message) {
            if (errorMessageString.indexOf('EnableContractData') !== -1) {
                errorMessage = enableContractDataMessage;
            } else {
                const errorPrefix = 'Error: ';
                const errorParts = errorMessageString.split(errorPrefix);
                if (errorParts.length > 1) {
                    errorParts.shift();
                    if (errorParts.length > 1) {
                        errorMessage = errorParts.join('. ');
                    } else {
                        errorMessage = errorParts[0];
                    }
                }
            }
        }
        if (!errorMessage) {
            errorMessage = defaultMessage;
        }

        notification.error({
            message: errorMessage,
            duration: 0
        });
        console.error(errorMessage, {
            depositTo,
            tx_data
        });
    };

    const disconnect = () => {
        setWalletInfo(initialWalletInfoState);
        setLoadingWallet(false);
        if (walletProvider != null) {
            walletProvider.disconnect();
            setWalletProvider(null);
        }
    };

    const sendAccountUpdate = async (deposited, accountId, txHash, onSuccess, onFailure) => {
        const userProfile: any = jwtDecode(id_token);
        deposited && analytics.identify(userProfile.sub);
        try {
            const res = await axios({
                url: `${process.env.REACT_APP_API_URL}/accounts/${accountId}`,
                method: 'patch',
                data: {deposited: deposited, depositTxHash: txHash},
                responseType: 'json',
                headers: {Authorization: `Bearer ${id_token}`},
            });
            onSuccess(res.data);
            deposited && analytics.track('validator-deposited', {
                provider: walletProvider.providerType,
                network: network_id === '1' ? 'mainnet' : 'prater'
            });
        } catch (error) {
            console.log(`Error updating account - ${error}`);
            onFailure(error);
            deposited && analytics.track('error-occurred', {
                reason: 'validator-deposited-failed',
                provider: walletProvider.providerType
            });
        }
    };

    if (network_id && depositTo && bloxAccounts && (tx_data || validatorsDepositData)) {
        let desktopAppLink = ''
            if(tx_data){
                desktopAppLink = `blox-live://tx_hash=${txHash}&account_id=${account_id}&network_id=${network_id}&deposit_to=${depositTo};`
            }else {
                desktopAppLink = `blox-live://account_id=${successDeposited}`;
            }

        const onGoBackClick = () => {
            const root = document.getElementById('root');
            const newIframe = document.createElement('iframe');
            newIframe.src = desktopAppLink;
            newIframe.width = '0px';
            newIframe.height = '0px';
            root.appendChild(newIframe);
        }

        return (
            <Wrapper>
                <Title>{network_id === "1" ? 'Mainnet' : 'Testnet'} Staking Deposit</Title>
                <Section>
                    <SubTitle>Deposit Method</SubTitle>
                    <DepositMethod>
                        {(!loadingWallet && (walletInfo.balance && walletInfo.networkName && walletInfo.networkVersion && walletInfo.selectedAddress)) ?
                            (<ConnectedWallet walletInfo={walletInfo} areNetworksEqual={areNetworksEqual}
                                              error={error} onDisconnect={disconnect}/>) :
                            (<ConnectWalletButton onWalletProviderClick={onWalletProviderClick}
                                                  disable={loadingWallet}/>
                            )}
                        {network_id === "5" &&
                        <NeedGoETH href={'https://discord.gg/wXxuQwY'} target={'_blank'}>Need GoETH?</NeedGoETH>}
                    </DepositMethod>
                    {error.type && <ErrorMessage>{error.message}</ErrorMessage>}
                    {isShowingReloadButton && (
                        <>
                            <br/>
                            <ReloadPageButton onClick={() => window.location.reload()}>Reload Page</ReloadPageButton>
                        </>
                    )}
                    {loadingWallet &&
                    <Loading> <Spinner width={'17px'} margin-right={'12px'}/> Waiting
                        for {walletProvider.providerType.charAt(0).toUpperCase() + walletProvider.providerType.slice(1)} wallet
                        to be connected</Loading>}
                </Section>
                <Section>
                    <SubTitle>Plan and Summary</SubTitle>
                    <StepsBoxes stepsData={stepsData}
                                depositTo={depositTo}
                                network_id={network_id}
                                walletInfo={walletInfo}
                                inProgress={inProgress}
                                bloxAccounts={bloxAccounts}
                                setStepsData={setStepsData}
                                onDepositStart={onDepositStart}
                                isLoadingDeposit={loadingDeposit}
                                checkedTerms={isTermsChecked} error={error}
                                setCheckedTermsStatus={() => setTermsCheck(!isTermsChecked)}
                    />
                </Section>
                <Faq networkId={network_id}/>
                <ModalsManager modal={modal} onClose={hideModal}/>
                {showSecurityNotification && <SecurityNotification hide={() => setSecurityNotificationDisplay(false)}/>}
                <a onClick={() => onGoBackClick()}>Go back to app</a>
                {isDepositSuccess && (
                    <DepositConfirmed>
                        Deposit executed &amp; confirmed! <br/>
                        <a onClick={() => onGoBackClick()}>Go back to app</a>
                    </DepositConfirmed>
                )}
                {(isDepositSuccess) && (
                    <iframe title={'depositSuccess'} width={'0px'} height={'0px'} src={desktopAppLink}/>
                )}
            </Wrapper>
        );
    }
    return null;
};

export default StakingDeposit;
