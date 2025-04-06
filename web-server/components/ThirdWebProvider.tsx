"use client";

import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  safeWallet,
  paperWallet,
  magicLink,
} from "@thirdweb-dev/react";

const Provider = ({ children }) => {
  return (
    <ThirdwebProvider
      supportedWallets={[metamaskWallet(), coinbaseWallet(), safeWallet()]}
      activeChain="goerli"
      clientId="your-client-id"
    >
      {children}
    </ThirdwebProvider>
  );
};
export default Provider;

export const ThirdWebWrapper = (Ele) => {
  return function Pay(props) {
    return (
      <Provider>
        <Ele {...props} />
      </Provider>
    );
  };
};
