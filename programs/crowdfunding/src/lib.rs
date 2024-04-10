use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("CzA626wF9ZKeGqyY1LgjUDc1BT5SFJp5qukjNm995Z8m");

#[program]
pub mod crowdfunding {
    use super::*;
    use anchor_lang::solana_program::entrypoint::ProgramResult;

    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        name: String,
        description: String,
        forge_mint: Pubkey,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        campaign.name = name;
        campaign.description = description;
        campaign.amount_donated = 0;
        campaign.amount_donated_forge = 0; 
        campaign.admin = *ctx.accounts.user.key;
        campaign.forge_mint = forge_mint;
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

    // New function to donate FORGE tokens
    pub fn donate_forge(ctx: Context<DonateForge>, amount: u64) -> ProgramResult {
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.campaign_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        (&mut ctx.accounts.campaign).amount_donated_forge += amount;
        Ok(())
    }

    // New function to withdraw FORGE tokens
    pub fn withdraw_forge(ctx: Context<WithdrawForge>, amount: u64, bump: u8) -> ProgramResult {
        let cpi_accounts = Transfer {
            from: ctx.accounts.campaign_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.campaign.to_account_info(),
        };
        let name=&ctx.accounts.campaign.name;
        let user = &ctx.accounts.user.key();
        let seeds = [name.as_ref(), b"CAMPAIGN_DEMO".as_ref(), user.as_ref(), &[bump]];
        let signer_seeds = &[&seeds[..]];

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        token::transfer(cpi_ctx, amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String, description: String, forge_mint: Pubkey)]
pub struct CreateCampaign<'info> {
    #[account(init, payer=user, space=9000, seeds=[b"CAMPAIGN_DEMO".as_ref(), user.key().as_ref(), name.as_ref()], bump)]
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

#[derive(Accounts)]
pub struct DonateForge<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub campaign_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawForge<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub campaign_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Campaign {
    pub name: String,
    pub description: String,
    pub amount_donated: u64,
    pub admin: Pubkey,
    pub amount_donated_forge: u64,
    pub forge_mint: Pubkey,
}
