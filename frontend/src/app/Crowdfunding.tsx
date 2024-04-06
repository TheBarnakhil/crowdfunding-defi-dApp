"use client";

import { useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Keypair,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import idl from "./crowdfunding.json"; // The path to your JSON IDL file

const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet"); // Adjust for your environment: local, devnet, or mainnet-beta
const opts = { preflightCommitment: "processed" };

const WalletButton = () => {
  const wallet = useAnchorWallet();
  const { select, wallets, publicKey, disconnect } = useWallet();
  const [error, setError] = useState("");
  const [campaigns, setCampaigns] = useState([]);

  const getProvider = () => {
    if (!wallet) return null;
    const connection = new Connection(network, "processed");
    return new AnchorProvider(connection, wallet, {
      preflightCommitment: "processed",
    });
  };

  console.log(
    publicKey?.toBase58(),
    "publickKey",
    wallet?.publicKey?.toBase58()
  );

  const getAllCampaigns = async () => {
    const connection = new Connection(network, "processed");
    const provider = getProvider();
    // @ts-ignore
    const program = new Program(idl, programID, provider);
    Promise.all(
      (await connection.getProgramAccounts(programID)).map(
        async (campaign) => ({
          ...(await program.account.campaign.fetch(campaign.pubkey)),
          pubkey: campaign.pubkey,
        })
      )
    ).then((campaigns: any) => setCampaigns(campaigns));
  };

  const createCampaign = async () => {
    setError("");
    if (!publicKey) {
      setError("Wallet is not connected.");
      return;
    }

    try {
      const provider = getProvider();
      // @ts-ignore
      const program = new Program(idl, programID, provider);
      console.log(program, "Program");
      const [campaign] = PublicKey.findProgramAddressSync(
        [Buffer.from("CAMPAIGN_DEMO"), publicKey.toBuffer()],
        program.programId
      );

      const transaction = await program.methods
        .createCampaign("new_campaign_name", "new_campaign_description")
        .accounts({
          campaign: campaign,
          user: provider?.wallet.publicKey || publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      // await provider?.sendAndConfirm(transaction);
      console.log(
        transaction,
        "Campaign account created!",
        campaign.toString()
      );
    } catch (err) {
      console.error("Error creating campaign account:", err);
    }
  };

  const donate = async (publicKey: string) => {
    try {
      const provider = getProvider();
      //@ts-ignore
      const program = new Program(idl, programID, provider);

      await program.methods
        .donate(new BN(0.2 * LAMPORTS_PER_SOL))
        .accounts({
          campaign: publicKey,
          user: provider?.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      console.log("Donated some money to:", publicKey.toString());
      getAllCampaigns();
    } catch (err) {
      console.error("Error while donating", err);
    }
  };

  const withdraw = async (publicKey: string) => {
    try {
      const provider = getProvider();
      //@ts-ignore
      const program = new Program(idl, programID, provider);

      await program.methods
        .withdraw(new BN(0.2 * LAMPORTS_PER_SOL))
        .accounts({
          campaign: publicKey,
          user: provider?.wallet.publicKey,
        })
        .rpc();
      getAllCampaigns();
      console.log("Withdrew some money from:", publicKey.toString());
    } catch (err) {
      console.error("Error withdrawing", err);
    }
  };

  return (
    <div>
      <WalletMultiButton />
      <WalletDisconnectButton />
      <button onClick={createCampaign}>Create Campaign</button>
      <button onClick={getAllCampaigns}>Get Campaign</button>
      {campaigns &&
        campaigns.map((campaign: any) => {
          return (
            <div key={campaign.pubkey.toString()}>
              <p>Campaign ID: {campaign?.pubkey.toString()}</p>
              <p>
                Balance:{" "}
                {(campaign.amountDonated / LAMPORTS_PER_SOL).toString()}
              </p>
              <p>Name: {campaign.name}</p>
              <p>Name: {campaign.description}</p>
              <button onClick={() => donate(campaign?.pubkey.toString())}>
                Donate!
              </button>
              <button onClick={() => withdraw(campaign?.pubkey.toString())}>
                Withdraw!
              </button>
            </div>
          );
        })}
      {/* {greetingAccountPublicKey && (
        <button onClick={incrementGreeting}>Increment Greeting</button>
      )} */}
      {/* {error && <p style={{ color: "red" }}>{error}</p>} */}
    </div>
  );
};

export default WalletButton;
