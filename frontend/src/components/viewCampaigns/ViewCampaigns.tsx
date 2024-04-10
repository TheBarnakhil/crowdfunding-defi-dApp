"use client";

import { useEffect, useState } from "react";

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
import { ViewCampaignCard } from "./ViewCampaignCard";
import { useRouter } from "next/navigation";

const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet"); // Adjust for your environment: local, devnet, or mainnet-beta
const opts = { preflightCommitment: "processed" };

const ViewCampaigns = () => {
    const wallet = useAnchorWallet();
    const { select, wallets, publicKey, disconnect, sendTransaction } = useWallet();
    const [error, setError] = useState("");
    const [campaigns, setCampaigns] = useState([]);

    const campaign_name = "Akhil's Crowdfunding Demo"
    const router = useRouter()

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

    useEffect(() => {getAllCampaigns()}, [])

    console.log("campaigns, :", campaigns)

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
            if (provider) {
                const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
                const mintAccountPublicKey = new PublicKey("FQLCN4gYBgRDirdFiGfZUsGCoC4i5vpq33ePGWAZrqeN"); // Replace with your FORGE token mint address
                let mintAccount: Mint = await getMint(connection, mintAccountPublicKey);

                const userTokenAccount = await getOrCreateAssociatedTokenAccount(connection, provider?.wallet as unknown as Signer, mintAccountPublicKey, provider.wallet.publicKey);
                // @ts-ignore
                const program = new Program(idl, programID, provider);

                const [campaign] = PublicKey.findProgramAddressSync(
                    [Buffer.from("CAMPAIGN_DEMO"), provider.wallet.publicKey.toBuffer(), Buffer.from(campaign_name)],
                    program.programId
                );

                const campaignTokenAccount = await getOrCreateAssociatedTokenAccount(connection, provider?.wallet as unknown as Signer, mintAccountPublicKey, campaign, true);

                console.log("userTokenAccount", userTokenAccount.address.toString());
                console.log("campaignTokenAccount", campaignTokenAccount.address.toString());

                // //@ts-ignore
                // const program = new Program(idl, programID, provider);

                console.log(mintAccount.decimals, "mintAccount.decimals")

                await program.methods
                    .donateForge(new BN(0.2 * 10 ** mintAccount.decimals)) // Assuming 0.2 FORGE tokens, adjust decimals as necessary
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
            if (provider) {
                const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
                const mintAccountPublicKey = new PublicKey("FQLCN4gYBgRDirdFiGfZUsGCoC4i5vpq33ePGWAZrqeN"); // Replace with your FORGE token mint address
                let mintAccount: Mint = await getMint(connection, mintAccountPublicKey);




                //@ts-ignore
                const program = new Program(idl, programID, provider);

                const [campaign, bump] = await PublicKey.findProgramAddressSync(
                    [Buffer.from("CAMPAIGN_DEMO"), provider.wallet.publicKey.toBuffer(), Buffer.from(campaign_name)],
                    program.programId
                );

                const userTokenAccount = await getOrCreateAssociatedTokenAccount(connection, provider?.wallet as unknown as Signer, mintAccountPublicKey, provider.wallet.publicKey);
                const campaignTokenAccount = await getOrCreateAssociatedTokenAccount(connection, provider?.wallet as unknown as Signer, mintAccountPublicKey, campaign, true);
                console.log("userTokenAccount", userTokenAccount.address.toString(), "campaignTokenAccount", campaignTokenAccount.address.toString());


                await program.methods
                    .withdrawForge(new BN(0.2 * 10 ** mintAccount.decimals), bump) // Assuming 0.2 FORGE tokens, adjust decimals as necessary
                    .accounts({
                        campaign: campaign,
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
        <div className="flex flex-col justify-center max-h-[38rem] overflow-y-scroll pt-[8rem] items-center">
            {campaigns &&
                campaigns.map((campaign: any) => {
                    return (
                        <div key={campaign?.pubkey.toString()} className="mt-5">
                            <ViewCampaignCard campaign={campaign} donate={donate} donateForge={donateForge} withdraw={withdraw} withdrawForge={withdrawForge}/>
                        </div>
                    );
                })}
        </div>
    );
};

export default ViewCampaigns;
