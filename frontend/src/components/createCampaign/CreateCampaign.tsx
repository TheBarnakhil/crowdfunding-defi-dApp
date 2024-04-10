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
    Transaction,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { Mint, getMint, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID, createAssociatedTokenAccount, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token";

import idl from "@/metadata/crowdfunding.json";
import { CreateCampaignCard } from "./CreateCampaignCard";
import { LampContainer } from "../ui/lamp";

const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet"); // Adjust for your environment: local, devnet, or mainnet-beta
const opts = { preflightCommitment: "processed" };

const WalletButton = () => {
    const wallet = useAnchorWallet();
    const { publicKey, sendTransaction } = useWallet();
    const [campaigns, setCampaigns] = useState([]);

    // const campaign_name = "Akhil's Crowdfunding Demo"


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

    console.log("campaigns, :", campaigns)

    const createCampaign = async (campaign_name: String, campaign_description: String) => {
        if (!publicKey) {
            console.error("Wallet is not connected.");
            return;
        }

        try {
            const connection = new Connection(network, "processed");
            const provider = getProvider();
            // @ts-ignore
            const program = new Program(idl, programID, provider);
            console.log(program, "Program");
            // const new_campaign_description = "Akhil's Crowdfunding Demo"
            const forge_mint_address = "FQLCN4gYBgRDirdFiGfZUsGCoC4i5vpq33ePGWAZrqeN";

            const [campaign] = PublicKey.findProgramAddressSync(
                [Buffer.from("CAMPAIGN_DEMO"), publicKey.toBuffer(), Buffer.from(campaign_name)],
                program.programId
            );

            let ata = await getAssociatedTokenAddress(
                new PublicKey(forge_mint_address), // mint
                campaign, // owner
                true, // allowOwnerOffCurve
            );

            console.log(`ATA: ${ata.toBase58()}`);


            let tx = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    publicKey, // payer
                    ata, // ata
                    campaign, // owner
                    new PublicKey(forge_mint_address) // mint
                )
            );

            console.log(`txhash: ${await sendTransaction(tx, connection)}`);


            const transaction = await program.methods
                .createCampaign(campaign_name, campaign_description, new PublicKey(forge_mint_address))
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

            return "success"
        } catch (err) {
            console.error("Error creating campaign account:", err);
            return "error"
        }
    };

    return (
        <div className="flex justify-center items-center">
                <CreateCampaignCard createCampaign={createCampaign} />
        </div>
    );
};

export default WalletButton;
