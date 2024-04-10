import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
// import { CreateCampaignForm } from "./CreateCampaignForm"
import { useContext } from "react";
import { CampaignContext } from "@/lib/context";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Campaign } from "./types";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export type Props = {
    campaign: Campaign;
    donate: (publicKey: string) => Promise<void>;
    donateForge: (publicKey: string) => Promise<void>;
    withdraw: (publicKey: string) => Promise<void>;
    withdrawForge: (publicKey: string) => Promise<void>;
}

export const ViewCampaignCard = (props: Props) => {
    const { campaign, donate, withdraw, donateForge, withdrawForge } = props;
    return (
        <Card className="w-[50rem] min-w-[50rem]">
            <CardHeader>
                <CardTitle>{campaign.name}</CardTitle>
                <CardDescription>{campaign.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Amount of sol donated: {(campaign.amountDonated / LAMPORTS_PER_SOL).toString()}</p>
                <p>Forge amount donated: {(campaign.amountDonatedForge / LAMPORTS_PER_SOL).toString()} </p>
            </CardContent>
            <CardFooter>
                <div className="flex flex-row gap-x-6 pl-16">
                <Button onClick={() => donate(campaign?.pubkey.toString())}>
                    Donate!
                </Button>
                <Button onClick={() => withdraw(campaign?.pubkey.toString())}>
                    Withdraw!
                </Button>
                <Button onClick={() => donateForge(campaign?.pubkey.toString())}>
                    Donate Forge!
                </Button>
                <Button onClick={() => withdrawForge(campaign?.pubkey.toString())}>
                    Withdraw Forge!
                </Button>
                </div>
            </CardFooter>

        </Card>

    )
}