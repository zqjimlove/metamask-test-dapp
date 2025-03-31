import { MetaMaskSDK } from '@metamask/sdk';
import { createAppKit } from '@reown/appkit';
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5';
import { bsc, mainnet } from '@reown/appkit/networks';
import {
  handleNewAccounts,
  handleNewProviderDetail,
  removeProviderDetail,
  setActiveProviderDetail,
  updateFormElements,
  updateSdkConnectionState,
  updateWalletConnectState,
} from '.';

const dappMetadata = {
  name: 'E2e Test Dapp',
  description: 'This is the E2e Test Dapp',
  url: 'https://metamask.github.io/test-dapp/',
  icons: ['https://metamask.github.io/test-dapp/icon-192x192.png'],
};

// eslint-disable-next-line require-unicode-regexp
const isAndroid = /Android/i.test(navigator.userAgent);

const sdk = new MetaMaskSDK({ dappMetadata });

export const initializeWeb3Modal = () => {
  if (!isAndroid) {
    try {
      const web3Modal = createAppKit({
        adapters: [new Ethers5Adapter()],
        metadata: dappMetadata,
        networks: [mainnet],
        projectId: '15c0a5109c74b6d2dbf3cfc3b71b2c13',
        features: {
          analytics: true, // Optional - defaults to your Cloud configuration
        },
      });

      console.log('Web3Modal initialized successfully');
      return web3Modal;
    } catch (error) {
      console.error('Error initializing Web3Modal', error);
    }
  }

  console.log('Web3Modal is not initialized');
  return null;
};

export const walletConnect = initializeWeb3Modal();

function _setProviderDetail(provider, name, uuid) {
  const providerDetail = {
    info: {
      uuid,
      name,
      icon: `./${name}.svg`,
      rdns: 'io.metamask',
    },
    provider,
  };
  return providerDetail;
}

export async function handleSdkConnect(name, button, isConnected) {
  if (isConnected) {
    handleNewAccounts([]);
    updateFormElements();
    updateSdkConnectionState(false);
    removeProviderDetail(name);
    await sdk.terminate();
    button.innerText = 'Sdk Connect';
    button.classList.add('btn-primary');
    button.classList.remove('btn-danger');
  } else {
    await sdk.connect();
    const provider = sdk.getProvider();
    const uuid = sdk.getChannelId();
    const providerDetail = _setProviderDetail(provider, name, uuid);
    await setActiveProviderDetail(providerDetail);
    handleNewProviderDetail(providerDetail);
    updateSdkConnectionState(true);
    button.innerText = 'Sdk Connect - Disconnect';
    button.classList.remove('btn-primary');
    button.classList.add('btn-danger');

    updateFormElements();

    try {
      const newAccounts = await provider.request({
        method: 'eth_accounts',
      });
      handleNewAccounts(newAccounts);
    } catch (err) {
      console.error('Error on init when getting accounts', err);
    }
  }
}

export async function handleWalletConnect(name, button, isConnected) {
  console.log(
    '💬️ ~ handleWalletConnect ~ name, button, isConnected:',
    name,
    button,
    isConnected,
  );
  if (isConnected) {
    handleNewAccounts([]);
    updateFormElements();
    updateWalletConnectState(false);
    removeProviderDetail(name);
    button.innerText = 'Wallet Connect';
    button.classList.add('btn-primary');
    button.classList.remove('btn-danger');
  } else {
    const walletProvider = walletConnect.getWalletProvider();
    // console.log(
    //   '💬️ ~ handleWalletConnect ~ walletConnect.getWalletProvider():',
    //   walletConnect.getWalletProvider(),
    // );
    // const uuid = provider.signer.uri;
    const providerDetail = _setProviderDetail(walletProvider, name, Date.now());
    await setActiveProviderDetail(providerDetail);
    handleNewProviderDetail(providerDetail);
    updateWalletConnectState(true);
    button.innerText = 'Wallet Connect - Disconnect';
    button.classList.remove('btn-primary');
    button.classList.add('btn-danger');

    updateFormElements();

    try {
      const newAccounts = await provider.request({
        method: 'eth_accounts',
      });
      handleNewAccounts(newAccounts);
    } catch (err) {
      console.error('Error on init when getting accounts', err);
    }
  }
}
