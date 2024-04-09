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
import { Mint, getMint, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";

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
      const campaign_name = "Akhil's Crowdfunding"
      const new_campaign_description = "Akhil's Crowdfunding"
      const forge_mint_address = "FQLCN4gYBgRDirdFiGfZUsGCoC4i5vpq33ePGWAZrqeN";

      const [campaign] = PublicKey.findProgramAddressSync(
        [Buffer.from("CAMPAIGN_DEMO"), publicKey.toBuffer(), Buffer.from(campaign_name)],
        program.programId
      );

      const transaction = await program.methods
        .createCampaign(campaign_name, new_campaign_description, new PublicKey(forge_mint_address))
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

  const donateForge = async (publicKey: string) => {
    try {
      const provider = getProvider();
      if(provider){
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const mintAccountPublicKey = new PublicKey("FQLCN4gYBgRDirdFiGfZUsGCoC4i5vpq33ePGWAZrqeN"); // Replace with your FORGE token mint address
        let mintAccount: Mint = await getMint(connection, mintAccountPublicKey);

        const userTokenAccount = await getOrCreateAssociatedTokenAccount(connection, provider?.wallet as unknown as Signer, mintAccountPublicKey, provider.wallet.publicKey);
        const campaignTokenAccount = await getOrCreateAssociatedTokenAccount(connection, provider?.wallet as unknown as Signer, mintAccountPublicKey, new PublicKey(publicKey), true);

        //@ts-ignore
        const program = new Program(idl, programID, provider);

        console.log(mintAccount.decimals, "mintAccount.decimals")

        await program.methods
          .donateForge(new BN(0.2 * 10**mintAccount.decimals)) // Assuming 0.2 FORGE tokens, adjust decimals as necessary
          .accounts({
            campaign: new PublicKey(publicKey),
            user: provider?.wallet.publicKey,
            userTokenAccount: userTokenAccount.address,
            campaignTokenAccount: campaignTokenAccount.address,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
        console.log("Donated FORGE tokens to:", publicKey.toString());
        getAllCampaigns();
      }
    } catch (err) {
      console.error("Error while donating FORGE tokens", err);
    }
 };


  const withdrawForge = async (publicKey: string) => {
    try {
      const provider = getProvider();
      if(provider){
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const mintAccountPublicKey = new PublicKey("FQLCN4gYBgRDirdFiGfZUsGCoC4i5vpq33ePGWAZrqeN"); // Replace with your FORGE token mint address
        let mintAccount: Mint = await getMint(connection, mintAccountPublicKey);

        const userTokenAccount = await getOrCreateAssociatedTokenAccount(connection, provider?.wallet as unknown as Signer, mintAccountPublicKey, provider.wallet.publicKey);
        const campaignTokenAccount = await getOrCreateAssociatedTokenAccount(connection, provider?.wallet as unknown as Signer, mintAccountPublicKey, new PublicKey(publicKey), true);

        //@ts-ignore
        const program = new Program(idl, programID, provider);

        await program.methods
          .withdrawForge(new BN(0.2 * 10**mintAccount.decimals)) // Assuming 0.2 FORGE tokens, adjust decimals as necessary
          .accounts({
            campaign: new PublicKey(publicKey),
            user: provider?.wallet.publicKey,
            userTokenAccount: userTokenAccount.address,
            campaignTokenAccount: campaignTokenAccount.address,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
        console.log("Withdrew FORGE tokens from:", publicKey.toString());
        getAllCampaigns();
      }
    } catch (err) {
      console.error("Error withdrawing FORGE tokens", err);
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
              <ul>Campaign ID: {campaign?.pubkey.toString()}</ul>
              <ul>
                Balance:{" "}
                {(campaign.amountDonated / LAMPORTS_PER_SOL).toString()}
              </ul>
              <ul>Name: {campaign.name}</ul>
              <ul>Description: {campaign.description}</ul>
              <ul>Admin PubKey: {campaign.admin.toString()}</ul>
              <ul>Forge mint address: {campaign?.forgeMint?.toString() || ""}</ul>
              <ul>Forge amount donated: {(campaign.amountDonatedForge/ LAMPORTS_PER_SOL).toString()} </ul> 
              <button onClick={() => donate(campaign?.pubkey.toString())}>
                Donate!
              </button>
              <button onClick={() => withdraw(campaign?.pubkey.toString())}>
                Withdraw!
              </button>
              <button onClick={() => donateForge(campaign?.pubkey.toString())}>
                Donate Forge!
              </button>
              <button onClick={() => withdrawForge(campaign?.pubkey.toString())}>
                Withdraw Forge!
              </button>
            </div>
          );
        })}
    </div>
  );
};

export default WalletButton;
