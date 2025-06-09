use anchor_lang::prelude::*;
mod state;
use crate::state::Profile;
use crate::state::Todo;
declare_id!("HvtHn5An3ky8Pz7Wp73KKi3tZLsi442C5Ht5P9SLHbBJ");

#[program]
pub mod todo_program {
    use super::*;

    pub fn create_profile(ctx: Context<CreateProfile>, name: String) -> Result<()> {
        let profile = &mut ctx.accounts.profile;
        let key = profile.key();
        profile.name = name;
        profile.key = key;
        profile.authority = ctx.accounts.creator.key();
        profile.todo_count = 0;
        Ok(())
    }
     pub fn create_todo(ctx: Context<CreateTodo>, content: String) -> Result<()> {
        let todo: &mut Account<Todo> = &mut ctx.accounts.todo;
        todo.content = content;
        todo.completed = false;
        todo.profile = ctx.accounts.profile.key();

        let profile: &mut Account<Profile> = &mut ctx.accounts.profile;
        profile.todo_count += 1;

        Ok(())
    }
    pub fn toggle_todo(ctx: Context<ToggleTodo>) -> Result<()> {
        let todo = &mut ctx.accounts.todo;
        todo.completed = !todo.completed; // Flip the boolean value
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

#[derive(Accounts)]
pub struct CreateTodo<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + Todo::INIT_SPACE,
        seeds = [b"todo", creator.key().as_ref(),profile.todo_count.to_le_bytes().as_ref()],
        bump
    )]
    pub todo: Account<'info, Todo>,

    #[account(
        mut,
        seeds = [b"profile", creator.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, Profile>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ToggleTodo<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"todo", authority.key().as_ref(), todo.profile.to_bytes().as_ref()],
        bump,
        has_one = profile
    )]
    pub todo: Account<'info, Todo>,

    #[account(
        seeds = [b"profile", authority.key().as_ref()],
        bump,
        constraint = profile.authority == authority.key()
    )]
    pub profile: Account<'info, Profile>,
}
