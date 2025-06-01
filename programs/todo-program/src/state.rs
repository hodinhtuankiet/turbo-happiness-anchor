use anchor_lang::prelude::*;

#[account]
pub struct Profile {
    pub name: String,       // max 100 bytes (use 4 + 100 for allocation)
    pub key: Pubkey,
    pub authority: Pubkey,
}

impl Profile {
    pub const SPACE: usize = 4 + 100 + 32 + 32;
}
