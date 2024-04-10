"use client";
import React, { useMemo } from "react";

import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { CampaignContextProvider, InitialiseCampaign } from "@/lib/context";

type Props = {
    children: React.ReactNode;
}

export const WalletWrapper = ({ children }: Props) => {
    const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

    const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

    return (
        <React.StrictMode>
            <CampaignContextProvider value={InitialiseCampaign}>
                <ConnectionProvider endpoint={endpoint}>
                    <WalletProvider wallets={wallets} autoConnect>
                        <WalletModalProvider>
                            {children}
                        </WalletModalProvider>
                    </WalletProvider>
                </ConnectionProvider>
            </CampaignContextProvider>
        </React.StrictMode>
    );
}
