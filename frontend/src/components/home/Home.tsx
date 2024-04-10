'use client'
import { useAnchorWallet } from "@solana/wallet-adapter-react";

import idl from "@/metadata/crowdfunding.json";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";


const ConnectWallet = () => {
    const wallet = useAnchorWallet();
    const router = useRouter();

    const words = [
        {
          text: "Crowdfuding",
          className: "text-white dark:text-white"
        },
        {
          text: "Defi",
          className: "text-white dark:text-white"
        },
        {
          text: "App",
          className: "text-white dark:text-white"
        }
      ];

    return (
        <div className="flex flex-col items-center justify-center h-[40rem] ">
        <p className="text-neutral-200 text-lg  mb-10">
            Your go to DeFi crowdfunding app!
        </p>
        <TypewriterEffect words={words} />
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-10">
            <h2 className="text-white mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                {wallet ? "You are connected!" : "Connect your wallet:"}
            </h2>
            <WalletMultiButton className="rounded-lg"/>
        </div>
        {
            wallet && (
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-10">
                    <button onClick={() => router.push('/create')} className="w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm">
                        Create a campaign!
                    </button>
                    <button onClick={() => router.push('/view')} className="w-40 h-10 rounded-xl bg-white text-black border border-black  text-sm">
                        View all campaigns!
                    </button>
                </div>
            )
        }
      </div>
    );
};

export default ConnectWallet;
