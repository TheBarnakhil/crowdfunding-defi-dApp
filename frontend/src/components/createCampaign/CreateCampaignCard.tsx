import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"  
import { CreateCampaignForm } from "./CreateCampaignForm"
import { useContext } from "react";
import { CampaignContext } from "@/lib/context";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";


export const CreateCampaignCard = (props: any) => {
    const campaign = useContext(CampaignContext);
    const router = useRouter();

    return(
        <Card className="w-1/3">
            <CardHeader>
                <CardTitle>Create a campaign!</CardTitle>
                <CardDescription>You can create a campaign here!</CardDescription>
            </CardHeader>
            <CardContent>
                <CreateCampaignForm {...props}/>
            </CardContent>
            {
                campaign?.name && 
                (   <CardFooter>
                    <p>Success creating the campaign: {campaign.name}</p>
                    <Button onClick={() => router.push("/view")}>View Campaigns</Button>
                    </CardFooter>
                )
            }
        </Card>

    )
}