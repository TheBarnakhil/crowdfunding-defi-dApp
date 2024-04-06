use anchor_lang::prelude::*;

declare_id!("3KUxYdGpEHpKeCHjBWAV1dHgF1cKjwhDJuTWnyNKvx9j");

#[program]
pub mod crowdfunding {
    use super::*;
    use anchor_lang::solana_program::entrypoint::ProgramResult;

    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        name: String,
        description: String,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        campaign.name = name;
        campaign.description = description;
        campaign.amount_donated = 0;
        campaign.admin = *ctx.accounts.user.key;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> ProgramResult {
        let campaign = &mut ctx.accounts.campaign;
        let user = &mut ctx.accounts.user;
        //Only the admin should be able to withdraw funds
        if campaign.admin != *user.key {
            return Err(ProgramError::IncorrectProgramId);
        };

        // Calculating the rent balance based on the length of the data
        let rent_balance = Rent::get()?.minimum_balance(campaign.to_account_info().data_len());

        //Checking if the campaign account has sufficient sol as compared to the amount being withdrawn
        //Subtracting the rent balance from the actual sol to make sure that we will have enough rent balance after withdrawl
        if **campaign.to_account_info().lamports.borrow() - rent_balance < amount {
            return Err(ProgramError::InsufficientFunds);
        };
        **campaign.to_account_info().try_borrow_mut_lamports()? -= amount;
        match user.to_account_info().try_borrow_mut_lamports() {
            Ok(mut lamports) => {
                **lamports += amount;
            }
            Err(e) => {
                println!("Error: {:?}", e);
                return Err(ProgramError::AccountBorrowFailed);
            }
        }
        Ok(())
    }

    //This is a native way of implementing this
    pub fn donate(ctx: Context<Donate>, amount: u64) -> ProgramResult {
        //Using the native system instruction to create an instruction for transfer of funds
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.campaign.key(),
            amount,
        );

        //Invoke the instruction and provide an array of accounts
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.campaign.to_account_info(),
            ],
        )
        .unwrap();

        (&mut ctx.accounts.campaign).amount_donated += amount;
        Ok(())
    }

    //TODO: This was suggested here : https://stackoverflow.com/questions/70528742/how-to-transfer-sol-in-anchor-smart-contract-instruction
    // pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
    //     use anchor_lang::system_program;

    //     let cpi_context = CpiContext::new(
    //         ctx.accounts.system_program.to_account_info(),
    //         system_program::Transfer {
    //             from: ctx.accounts.user.clone(),
    //             to: ctx.accounts.campaign_account.clone(),
    //         },
    //     );
    //     system_program::transfer(cpi_context, amount)?;
    //     Ok(())
    // }
}

#[derive(Accounts)]
pub struct CreateCampaign<'info> {
    #[account(init, payer=user, space=9000, seeds=[b"CAMPAIGN_DEMO".as_ref(), user.key().as_ref()], bump)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Campaign {
    pub name: String,
    pub description: String,
    pub amount_donated: u64,
    pub admin: Pubkey,
}
