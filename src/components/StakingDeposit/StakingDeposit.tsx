import jwtDecode from 'jwt-decode';
import {useEffect, useState} from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Analytics from 'analytics';

import {NETWORK_IDS} from 'service/WalletProviders/Metamask/constants';

import bloxAnalyticsPlugin from 'service/analytics/blox-analytics-plugin';

import {
    Wrapper, Section, Title, SubTitle, Total, ErrorMessage, StepsBoxes,
    ConnectedWallet, NeedGoETH, DepositMethod, ConnectWalletButton, Faq, SecurityNotification
} from './components';
import {Icon} from 'common/components';

import {STEP_BOXES} from './constants';
import parsedQueryString from 'common/helpers/getParsedQueryString';
import {notification} from 'antd';

import ModalsManager from '../ModalsManager';
import useModals from '../ModalsManager/useModals';
import {MODAL_TYPES} from '../ModalsManager/constants';
import WalletProvidersContext from "../../service/WalletProviders/WalletProvidersContext";
import {Spinner} from "../../common/components";
import { StrategyError } from "../../service/WalletProviders/Metamask/MetaMaskStrategy";


const qsObject: Record<string, any> = parsedQueryString(location.search);
const { network_id, public_key, account_id, tx_data, id_token } = qsObject;
const deposit_to = process.env.REACT_APP_DEPOSIT_CONTRACT_ADDRESS;

console.warn('🧧️ DEPOSIT CONTRACT ADDRESS: ', deposit_to);

const analytics = Analytics({
  app: 'blox-live',

  plugins: [
    bloxAnalyticsPlugin(id_token),
  ]
});

const initialWalletInfoState = {
    networkVersion: '',
    networkName: '',
    selectedAddress: '',
    balance: '',
};

const initialErrorState = {type: '', message: ''};

const etherscanLink = network_id === '1' ? 'https://etherscan.io/tx/' : 'https://goerli.etherscan.io/tx/';

const NotificationContent = styled.div`
    width:350px;
    display:flex;
    flex-direction:column;
`;

const NotificationContentInnerWrapper = styled.div`
    display:flex;
`;

const Span = styled.span`
    width:200px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
`;

const DepositConfirmed = styled.div`
    width:858px;
    display:flex;
    flex-direction:column;
    align-items:center;
`;

const ReloadPageButton = styled.button`
  width: 182px;
  height: 32px;
  font-size: 14px;
  font-weight: 900;
  border-radius: 4px;
  border: solid 1px ${({theme}) => theme.gray400};
  color:${({theme}) => 'white'};
  background-color: ${({theme}) => theme.primary900};
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
   &:hover {
    color:${({theme}) => theme.primary600};
    background-color: transparent;
  }
  &:active{
    color:${({theme}) => theme.primary600};
    background-color: transparent;
  }
`;

const DEPOSIT_THERSHOLD = 32.01;

const StakingDeposit = () => {
    const [walletProvider, setWalletProvider] = useState(null);
    const [walletInfo, setWalletInfo] = useState(initialWalletInfoState);
    const [checkedTerms, setCheckedTermsStatus] = useState(false);
    const [error, setError] = useState(initialErrorState);
    const [stepsData, setStepsData] = useState(STEP_BOXES);
    const [isLoadingDeposit, setDepositLoadingStatus] = useState(false);
    const [isLoadingWallet, setLoadingWallet] = useState(false);
    const [isDepositSuccess, setDepositSuccessStatus] = useState(false);
    const [txHash, setTxHash] = useState('');
    const [oneTimeWrongNetworkModal, setOneTimeWrongNetworkModal] = useState(false);
    const [showSecurityNotification, setSecurityNotificationDisplay] = useState(true);
    const [checkingDeposited, setCheckingDepositedStatus] = useState(false);
    const [alreadyDeposited, setAlreadyDeposited] = useState(false);
    const [isShowingReloadButton, showReloadButton] = useState(false);

    const {showModal, hideModal, modal} = useModals();

    const areNetworksEqual = network_id === walletInfo.networkVersion;

    useEffect(() => {
        document.title = 'Blox Staking - Transfers Hub';
        const placement = 'bottomRight';
        notification.config({placement});
        // window.history.replaceState(null, null, window.location.pathname);
        setTimeout(() => setSecurityNotificationDisplay(false), 5000);

    }, []);

    useEffect(() => {
        if (qsObject.network_id && walletInfo.networkVersion && !areNetworksEqual) {
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
    }, [qsObject, walletInfo]);

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
                    setError({ type: 'disconnected', message: error.message });
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

    const isUnknownAccountStatus = async () => {
        const account = await getAccount();
        return account.status === 'unknown_status';
    }

    const checkIfAlreadyDeposited = async () => {
        let deposited = false;
        setCheckingDepositedStatus(true);
        const account = await getAccount();
        if (account) {
            if (account.depositTxHash && account.deposited) {
                deposited = true;
            }
            if (account.depositTxHash) {
                const result = await walletProvider.getReceipt(account.depositTxHash);
                if (result == null) return true;
                deposited = result.status;
            }
        }
        return deposited;
    };

    const showAlreadyDepositedNotification = () => {
        notification.success({message: '', description: <div style={{padding: 8}}>
            Your Staking Deposit was already executed. Go to Desktop App
        </div>});
    };

    const onDepositStart = async () => {
        const alreadyDepositedFallback = () => {
            showAlreadyDepositedNotification();
            setAlreadyDeposited(true);
            setCheckingDepositedStatus(false);
        }

        const unknownAccountStatus = await isUnknownAccountStatus();
        if (!unknownAccountStatus) {
            return alreadyDepositedFallback();
        }

        const deposited = await checkIfAlreadyDeposited();
        if (deposited) {
            return alreadyDepositedFallback();
        }

        const onStart = async (txHash) => {
            console.log('deposit start---------', txHash);
            setTxHash(txHash);
            setCheckingDepositedStatus(false);
            setDepositLoadingStatus(true);
            await sendAccountUpdate(false, txHash, () => {
                notification.success({message: '', description:
                <NotificationContent>
                    Transaction hash: <br />
                    <NotificationContentInnerWrapper>
                        <Span>{txHash}</Span>
                        <Icon color={'primary900'} name={'icons-export'} fontSize={'16px'} onClick={() => window.open(`${etherscanLink}${txHash}`, '_blank')}/>
                    </NotificationContentInnerWrapper>
                </NotificationContent>});
                return;
            }, () => {
                return;
            });
        };

        const onSuccess = async (error, txReceipt) => {
            console.log('deposit end---------', error, txReceipt);
            if (error) {
                setCheckingDepositedStatus(false);
                setDepositLoadingStatus(false);
                notification.error({ message: error.message, duration: 0 });
            } else if (txReceipt) {
                if (txReceipt.status) {
                    await sendAccountUpdate(true, txReceipt.transactionHash, () => {
                    }, () => {
                    });
                    notification.success({
                        message: '', description: <NotificationContent>
                            Successfully deposited 32 ETH to <br />
                            <NotificationContentInnerWrapper>
                                <Span>{deposit_to}</Span>
                                <Icon name={'icons-export'} color={'primary900'} fontSize={'16px'} onClick={() => window.open(`${etherscanLink}${txReceipt.transactionHash}`, '_blank')}/>
                            </NotificationContentInnerWrapper>
                        </NotificationContent>
                    });
                    setDepositSuccessStatus(true);
                } else {
                    setDepositLoadingStatus(false);
                    notification.error({ message: `Failed to send transaction`, duration: 0 });
                }
            }
        };

        const onError = (walletProviderError) => {
            setCheckingDepositedStatus(false);
            setDepositLoadingStatus(false);

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
                deposit_to,
                tx_data
            });
        };

        walletProvider.sendSignTransaction(deposit_to, tx_data, onStart, onSuccess, onError);
    };

    const disconnect = () => {
        setWalletInfo(initialWalletInfoState);
        setLoadingWallet(false);
        if (walletProvider != null) {
            walletProvider.disconnect();
            setWalletProvider(null);
        }
    };

    const getAccount = async function getAccountData () {
        try {
            if (this.account) {
                return this.account;
            }
            const res = await axios({
                url: `${process.env.REACT_APP_API_URL}/accounts`,
                method: 'get',
                responseType: 'json',
                headers: {Authorization: `Bearer ${id_token}`},
            });
            this.account = res.data.filter((account) => account.id === Number(account_id))[0];
            return this.account;
        } catch (error) {
            return error;
        }
    };

    const sendAccountUpdate = async (deposited, txHash, onSuccess, onFailure) => {
        const userProfile: any = jwtDecode(id_token);
        deposited && analytics.identify(userProfile.sub);
        try {
            const res = await axios({
                url: `${process.env.REACT_APP_API_URL}/accounts/${account_id}`,
                method: 'patch',
                data: {deposited: deposited, depositTxHash: txHash},
                responseType: 'json',
                headers: {Authorization: `Bearer ${id_token}`},
            });
            onSuccess(res.data);
            deposited && analytics.track('validator-deposited', {
                provider: walletProvider.providerType,
                network: network_id === '1' ? 'mainnet': 'pyrmont'
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

    const Loading = styled.div`        
        display:flex;        
        color:${({theme}) => theme.primary900};
        width: 320px;
        height: 16px;
        margin-top: 8px;        
        font-size: 11px;
        font-weight: 500;
    `;
    if (network_id && deposit_to && public_key) {
        const desktopAppLink = `blox-live://tx_hash=${txHash}&account_id=${account_id}&network_id=${network_id}&deposit_to=${deposit_to}`;

        const onGoBackClick = () => {
            const root = document.getElementById('root');
            const newIframe = document.createElement('iframe');
            newIframe.src=desktopAppLink;
            newIframe.width='0px';
            newIframe.height='0px';
            root.appendChild(newIframe);
        }

        return (
            <Wrapper>
                <Title>{network_id === "1" ? 'Mainnet' : 'Testnet'} Staking Deposit</Title>
                <Section>
                    <SubTitle>Deposit Method</SubTitle>
                    <DepositMethod>
                        {(!isLoadingWallet && (walletInfo.balance && walletInfo.networkName && walletInfo.networkVersion && walletInfo.selectedAddress)) ?
                            (<ConnectedWallet walletInfo={walletInfo} areNetworksEqual={areNetworksEqual}
                                              error={error} onDisconnect={disconnect}/>) :
                            (<ConnectWalletButton onWalletProviderClick={onWalletProviderClick} disable={isLoadingWallet}/>
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
                    {isLoadingWallet &&
                    <Loading> <Spinner width={'17px'} margin-right={'12px'}/> Waiting for {walletProvider.providerType.charAt(0).toUpperCase() + walletProvider.providerType.slice(1)} wallet to be connected</Loading>}
                </Section>
                <Section>
                    <SubTitle>Plan and Summary</SubTitle>
                    <StepsBoxes stepsData={stepsData} setStepsData={setStepsData}
                                checkedTerms={checkedTerms} error={error}
                                setCheckedTermsStatus={() => setCheckedTermsStatus(!checkedTerms)}
                                walletInfo={walletInfo}
                                onDepositStart={onDepositStart}
                                depositTo={deposit_to}
                                publicKey={public_key}
                                network_id={network_id}
                                isLoadingDeposit={isLoadingDeposit}
                                isDepositSuccess={isDepositSuccess}
                                txHash={txHash}
                                walletType={walletProvider ? walletProvider.providerType : null}
                                alreadyDeposited={alreadyDeposited}
                                checkingDeposited={checkingDeposited}
                    />
                    <Total>Total: 32 {network_id === "1" ? 'ETH' : 'GoETH'} + gas fees</Total>
                </Section>
                <Faq networkId={network_id}/>
                <ModalsManager modal={modal} onClose={hideModal}/>
                {showSecurityNotification && <SecurityNotification hide={() => setSecurityNotificationDisplay(false)}/>}
                {isDepositSuccess && (
                    <DepositConfirmed>
                        Deposit executed &amp; confirmed! <br />
                        <a onClick={() => onGoBackClick()} >Go back to app</a>
                    </DepositConfirmed>
                )}
                {(isDepositSuccess && txHash) && (
                    <iframe title={'depositSuccess'} width={'0px'} height={'0px'} src={desktopAppLink}/>
                )}
            </Wrapper>
        );
    }
    return null;
};

export default StakingDeposit;
