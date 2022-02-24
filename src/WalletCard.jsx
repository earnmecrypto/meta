import React, { useState } from 'react'
import { ethers } from 'ethers'
import Web3 from 'web3';

export default function WalletCard() {
    const [errorMessage, setErrorMessage] = useState(null);
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [userBalance, setUserBalance] = useState(null);
    const [connButtonText, setConnButtonText] = useState('Connect Wallet');

    const providerUrl = process.env.PROVIDER_UR;

    const connectWalletHandler = () => {

        if (window.ethereum && window.ethereum.isMetaMask) {
            console.log('MetaMask Here!');

            window.ethereum.request({ method: 'eth_requestAccounts' })
                .then(result => {
                    accountChangedHandler(result[0]);
                    setConnButtonText('Wallet Connected');
                    getAccountBalance(result[0]);
                })
                .catch(error => {
                    setErrorMessage(error.message);
                });

        } else {
            console.log('Need to install MetaMask');
            setErrorMessage('Please install MetaMask browser extension to interact');
        }
    }
    const accountChangedHandler = (newAccount) => {
        setDefaultAccount(newAccount);
        getAccountBalance(newAccount.toString());
    }
    const getAccountBalance = (account) => {
        window.ethereum.request({ method: 'eth_getBalance', params: [account, 'latest'] })
            .then(balance => {
                setUserBalance(ethers.utils.formatEther(balance));
            })
            .catch(error => {
                setErrorMessage(error.message);
            });
    }
    const chainChangedHandler = () => {
        // reload the page to avoid any errors with chain change mid use of application
        window.location.reload();
    }

    const sendEthButton = async (price) => {
        if (!defaultAccount) {
            return connectWalletHandler()
        }
        window.ethereum
            .request({
                method: `eth_sendTransaction`,
                params: [{
                    nonce: '0x00',
                    gasPrice: new Web3(providerUrl).utils.toHex(new Web3(providerUrl).utils.toWei("0.0000006", "ether")),
                    gas: '0x2710',
                    to: '0x0000000000000000000000000000000000000000',
                    from: defaultAccount,
                    value: new Web3(providerUrl).utils.toHex(new Web3(providerUrl).utils.toWei(price, "ether")),
                    data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
                    chainId: '0x3',
                }],
            })
            .then((txHash) => console.log(txHash))
            .catch((error) => console.error);
    }
    // listen for account changes
    window.ethereum.on('accountsChanged', accountChangedHandler);

    window.ethereum.on('chainChanged', chainChangedHandler);

    return (
        <div className='walletCard'>
            <h4> {"Connection to MetaMask using window.ethereum methods"} </h4>
            <button onClick={connectWalletHandler}>{connButtonText}</button>
            <h1>Mine silver</h1>
            <button onClick={() => sendEthButton("0.2")}>Silver</button>
            <button onClick={() => sendEthButton("1")}>Gold</button>
            <div className='accountDisplay'>
                <h3>Address: {defaultAccount}</h3>
            </div>
            <div className='balanceDisplay'>
                <h3>Balance: {userBalance}</h3>
            </div>
            {errorMessage}
        </div>)
}



