use anchor_lang::prelude::*;

#[account]
pub struct Profile {
    pub name: String,       // max 100 bytes (use 4 + 100 for allocation)
    pub key: Pubkey,
    pub authority: Pubkey,
    pub todo_count: u8, // number of todos
}

impl Profile {
    pub const SPACE: usize = 4 + 100 + 32 + 32 + 1;
}


#[account]
#[derive(InitSpace)]
pub struct Todo {
    #[max_len(200)]
    pub content: String,       // max 100 bytes (use 4 + 100 for allocation)
    pub completed: bool,
    pub profile: Pubkey,   // key of the profile this todo belongs to
}