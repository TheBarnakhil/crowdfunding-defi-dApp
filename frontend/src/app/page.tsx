"use client";
import dynamic from "next/dynamic";
import { WavyBackground } from "@/components/ui/wavy-background";
import { WalletWrapper } from "@/components/wrapper/WalletWrapper";

const ConnectWallet = dynamic(() => import("@/components/home/Home"), {
  ssr: false,
});

export default function Home() {
  return (
    <WalletWrapper>
      <main className="flex min-h-screen flex-col items-center justify-center place-center">
        <WavyBackground className="w-full mx-auto">
          <ConnectWallet />
        </WavyBackground>
      </main>
    </WalletWrapper>
  );
}
