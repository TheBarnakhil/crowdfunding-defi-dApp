"use client";
import React, { useContext } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";


import { z } from "zod"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { CampaignDispatchContext } from "@/lib/context";

const formSchema = z.object({
    campaign_name: z.string().min(2).max(50),
    campaign_description: z.string().min(2).max(50),
})

const BottomGradient = () => {
    return (
        <>
            <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex flex-col space-y-2 w-full", className)}>
            {children}
        </div>
    );
};


export const CreateCampaignForm = (props: any) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            campaign_name: "",
            campaign_description: ""
        },
    })

    const setCampaign = useContext(CampaignDispatchContext);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        let success = await props?.createCampaign(values.campaign_name, values.campaign_description)
        console.log(success)
        console.log(values)
        setCampaign({name: values.campaign_name, description: values.campaign_description})
    }


    return (

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="campaign_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Campaign Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Campaign Name" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your campaign name.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="campaign_description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Campaign Description</FormLabel>
                            <FormControl>
                                <Input placeholder="Campaign Description" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your campaign description.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
