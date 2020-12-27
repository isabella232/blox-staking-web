import React, {useEffect, useState} from 'react';
import axios from 'axios';

import {NETWORK_IDS} from 'service/WalletProviders/Metamask/constants';

import {
    Wrapper, Section, Title, SubTitle, Total, ErrorMessage, StepsBoxes,
    ConnectedWallet, NeedGoETH, DepositMethod, ConnectWalletButton, Faq, SecurityNotification
} from './components';
import { Icon } from 'common/components';

import {STEP_BOXES} from './constants';
import parsedQueryString from 'common/helpers/getParsedQueryString';
import {notification} from 'antd';

import ModalsManager from '../ModalsManager';
import useModals from '../ModalsManager/useModals';
import {MODAL_TYPES} from '../ModalsManager/constants';
import WalletProvidersContext from "../../service/WalletProviders/WalletProvidersContext";
import {Spinner} from "../../common/components";
import styled from "styled-components";


const qsObject: Record<string, any> = parsedQueryString(location.search);
const {network_id, deposit_to, public_key, account_id, tx_data, id_token} = qsObject; // TODO: replace account id with of public key

const initialWalletInfoState = {
    networkVersion: '',
    networkName: '',
    selectedAddress: '',
    balance: '',
};

const initialErrorState = {type: '', message: ''};

// let walletProvider: WalletProvidersContext;

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
    const [showSecurityNotification, setSecurityNotificationDisplay] = React.useState(true);

    const {showModal, hideModal, modal} = useModals();

    const areNetworksEqual = network_id === walletInfo.networkVersion;

    useEffect(() => {
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
        if (walletProvider.providerType === 'ledger' || walletProvider.providerType === 'trezor') {
            showModal({
                    show: true, type: MODAL_TYPES[`${walletProvider.providerType.toUpperCase()}`], params: {
                        onClick: () => {
                            hideModal();
                            connectWallet(walletProvider.providerType);
                        }
                    }
                }
            );
            return
        }
        setSecurityNotificationDisplay(false);
        setLoadingWallet(true);
        connectWallet(walletProvider.providerType);
    }, [walletProvider]);

    const onWalletProviderClick = async (type: string) => {
        setWalletProvider(new WalletProvidersContext(type, network_id));
    };

    const connectWallet = async (type) => {
        await walletProvider.connect()
            .then(() => {
                notification.success({
                    message: '',
                    description: `Successfully connected to ${type}`
                });
                setLoadingWallet(false);
                walletProvider.subscribeToEvent('networkChanged', onNetworkChange);
                walletProvider.subscribeToEvent('accountsChanged', onAccountChange);
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

    const onNetworkChange = async () => updateWalletInfo(await walletProvider.getInfo());

    const onAccountChange = async (accountsList) => {
        accountsList.length === 0 ? disconnect() : updateWalletInfo(await walletProvider.getInfo());
    };

    const onDepositStart = () => {
        const onStart = async (txHash) => {
            setTxHash(txHash);
            setDepositLoadingStatus(true);
            await sendAccountUpdate(false, txHash, () => {
                notification.success({message: '', description: `Transaction hash: ${txHash}`});
                return;
            }, () => {
                return;
            });
        };

        const onSuccess = async (error, txReceipt) => {
          const etherscanLink = network_id === '1' ? 'https://etherscan.io/tx/' : 'https://goerli.etherscan.io/tx/';
            setDepositLoadingStatus(false);
            if (error) {
                notification.error({message: '', description: error});
            } else if (txReceipt) {
                if (txReceipt.status) {
                    await sendAccountUpdate(true, txReceipt.transactionHash, () => {
                    }, () => {
                    });
                    notification.success({message: '', description: <div>
                            Successfully deposited 32 ETH to {deposit_to}
                            <a href={`${etherscanLink}${txHash}`} rel="noreferrer" target={'_blank'}>
                                <Icon name={'close'} color={'primary900'} fontSize={'16px'} />
                            </a>
                        </div>});
                    setDepositSuccessStatus(true);
                } else {
                    notification.error({message: '', description: `Failed to send transaction`});
                }
            }
        };

        walletProvider.sendSignTransaction(deposit_to, tx_data, onStart, onSuccess);
    };

    const disconnect = () => {
        setWalletInfo(initialWalletInfoState);
        setLoadingWallet(false);
        if (walletProvider != null) {
            walletProvider.disconnect();
            setWalletProvider(null);
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
        return (
            <Wrapper>
                <Title>{network_id === "1" ? 'Mainnet' : 'Testnet'} Staking Deposit</Title>
                <Section>
                    <SubTitle>Deposit Method</SubTitle>
                    <DepositMethod>
                        {(walletProvider != null && !isLoadingWallet) ?
                            (<ConnectedWallet walletInfo={walletInfo} areNetworksEqual={areNetworksEqual}
                                              error={error} onDisconnect={disconnect}/>) :
                            (<ConnectWalletButton onWalletProviderClick={onWalletProviderClick}/>
                            )}
                        {network_id === "5" &&
                        <NeedGoETH href={'https://discord.gg/wXxuQwY'} target={'_blank'}>Need GoETH?</NeedGoETH>}
                    </DepositMethod>
                    {error.type && <ErrorMessage>{error.message}</ErrorMessage>}
                    {isLoadingWallet &&
                    <Loading> <Spinner width={'17px'} margin-right={'12px'}/> Waiting for Portis wallet to be connected</Loading>}
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
                    />
                    <Total>Total: 32 ETH + gas fees</Total>
                </Section>
                <Faq networkId={network_id}/>
                <ModalsManager modal={modal} onClose={hideModal}/>
                {isDepositSuccess && txHash && (
                    <iframe title={'depositSuccess'} width={'0px'} height={'0px'} src={desktopAppLink}/>
                )}
                {showSecurityNotification && <SecurityNotification hide={() => setSecurityNotificationDisplay(false)}/>}
            </Wrapper>
        );
    }
    return null;
};

export default StakingDeposit;
