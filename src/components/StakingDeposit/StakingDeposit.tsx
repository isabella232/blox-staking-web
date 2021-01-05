import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import axios from 'axios';

import {NETWORK_IDS} from 'service/WalletProviders/Metamask/constants';

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


const qsObject: Record<string, any> = parsedQueryString(location.search);
const {network_id, deposit_to, public_key, account_id, tx_data, id_token} = qsObject;

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
        } else if (walletInfo.balance !== '' && Number(walletInfo.balance) < 33) {
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
        const deposited = await checkIfAlreadyDeposited();
        if (deposited) {
            showAlreadyDepositedNotification();
            setAlreadyDeposited(true);
            setCheckingDepositedStatus(false);
            return;
        }

        const onStart = async (txHash) => {
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
            if (error) {
                setCheckingDepositedStatus(false);
                setDepositLoadingStatus(false);
                notification.error({message: '', description: error});
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
                    notification.error({message: '', description: `Failed to send transaction`});
                }
            }
        };

        const onError = () => {
            setCheckingDepositedStatus(false);
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

    const getAccount = async () => {
        try {
            const res = await axios({
                url: `${process.env.REACT_APP_API_URL}/accounts`,
                method: 'get',
                responseType: 'json',
                headers: {Authorization: `Bearer ${id_token}`},
            });
            return res.data.filter((account) => account.id === Number(account_id))[0];
        } catch (error) {
            return error;
        }
    };

    const sendAccountUpdate = async (deposited, txHash, onSuccess, onFailure) => {
        try {
            const res = await axios({
                url: `${process.env.REACT_APP_API_URL}/accounts/${account_id}`,
                method: 'patch',
                data: {deposited: deposited, depositTxHash: txHash},
                responseType: 'json',
                headers: {Authorization: `Bearer ${id_token}`},
            });
            onSuccess(res.data);
        } catch (error) {
            console.log(`Error updating account - ${error}`);
            onFailure(error);
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
