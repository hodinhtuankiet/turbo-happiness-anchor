use anchor_lang::prelude::*;
mod state;
use crate::state::Profile;
declare_id!("HvtHn5An3ky8Pz7Wp73KKi3tZLsi442C5Ht5P9SLHbBJ");

#[program]
pub mod solana {
    use super::*;

    pub fn create_profile(ctx: Context<CreateProfile>, name: String) -> Result<()> {
        let profile = &mut ctx.accounts.profile;
        profile.name = name;
        profile.authority = ctx.accounts.creator.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateProfile<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + Profile::SPACE,
        seeds = [b"profile", creator.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, Profile>,

    pub system_program: Program<'info, System>,
}