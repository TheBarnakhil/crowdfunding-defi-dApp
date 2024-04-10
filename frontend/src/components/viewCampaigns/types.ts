import { PublicKey } from "@solana/web3.js";

export type Campaign = {
    pubkey: PublicKey;
    name: string;
    description: string;
    admin: PublicKey;
    amountDonated: number;
    forgeMint: PublicKey;
    amountDonatedForge: number;
}