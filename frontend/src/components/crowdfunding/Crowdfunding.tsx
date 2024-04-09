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
  Signer,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { Mint, getMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

import idl from "./crowdfunding.json"; 

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

  console.log("campaigns, :",campaigns)

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
      const campaign_name = "Akhil's Crowdfunding 2"
      const new_campaign_description = "Akhil's Crowdfunding 2"
      const [campaign] = PublicKey.findProgramAddressSync(
        [Buffer.from("CAMPAIGN_DEMO"), publicKey.toBuffer(), Buffer.from(campaign_name)],
        program.programId
      );

      const transaction = await program.methods
        .createCampaign(campaign_name, new_campaign_description)
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


  //Psudeo
  const donateForge = async (publicKey: string) => {
    try {
      const provider = getProvider();
      if(provider){

        //@ts-ignore
        const program = new Program(idl, programID, provider);
  
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const mintAccountPublicKey = new PublicKey("FQLCN4gYBgRDirdFiGfZUsGCoC4i5vpq33ePGWAZrqeN");
        let mintAccount: Mint = await getMint(connection, mintAccountPublicKey);
  
        //This might not work, proposed alternative is to get the token account and if it doesn't exist we can create it: https://solana.stackexchange.com/questions/1231/how-do-i-get-or-create-associated-token-accounts-with-the-wallet-adapter
        const userTokenAccount = await getOrCreateAssociatedTokenAccount(connection, provider?.wallet as unknown as Signer,mintAccountPublicKey, provider.wallet.publicKey)
  
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
      }
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
      <button onClick={createCampaign}>Create Campaign</button>
      <button onClick={getAllCampaigns}>Get Campaign</button>
      {campaigns &&
        campaigns.map((campaign: any) => {
          return (
            <div key={campaign?.pubkey.toString()}>
              <p>Campaign ID: {campaign?.pubkey.toString()}</p>
              <p>
                Balance:{" "}
                {(campaign.amountDonated / LAMPORTS_PER_SOL).toString()}
              </p>
              <p>Name: {campaign.name}</p>
              <p>Description: {campaign.description}</p>
              <p>Admin PubKey: {campaign.admin.toString()}</p>
              <button onClick={() => donate(campaign?.pubkey.toString())}>
                Donate!
              </button>
              <button onClick={() => withdraw(campaign?.pubkey.toString())}>
                Withdraw!
              </button>
            </div>
          );
        })}
    </div>
  );
};

export default WalletButton;
