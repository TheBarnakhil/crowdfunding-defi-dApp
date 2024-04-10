"use client";
import dynamic from "next/dynamic";
import { WavyBackground } from "@/components/ui/wavy-background";
import { WalletWrapper } from "@/components/wrapper/WalletWrapper";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const ViewAllCampaigns = dynamic(() => import("@/components/viewCampaigns/ViewCampaigns"), {
  ssr: false,
});

export default function CreateCampaign() {
  return (
    <WalletWrapper>
      <main className="min-h-screen bg-slate-950 h-dvh">
      <header className="flex min-h-7 justify-end p-8">
        <WalletMultiButton/>
      </header>
      <ViewAllCampaigns />
      </main>
    </WalletWrapper>
  );
}
