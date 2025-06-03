import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import { Solana } from "../target/types/solana"; // FIXED import path

describe("todo-program", () => {
  // Set up the provider and workspace
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Solana as Program<Solana>;

  const name = "Tuan Kiet";

  it("Create profile", async () => {
    // Derive the profile PDA
    const [profile, _bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), provider.publicKey.toBytes()],
      program.programId
    );

    // Send transaction to create the profile
    const tx = await program.methods
      .createProfile(name)
      .accountsPartial({
        creator: provider.publicKey,
        profile: profile,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Your transaction signature:", tx);

    // Fetch and test the profile account
    const profileAccount = await program.account.profile.fetch(profile);
    console.log(profileAccount);

    // Test fields
    expect(profileAccount.name).to.equal(name);
    // expect(profileAccount.todo_count).to.equal(0);

    // This assumes you have a `key` field in your Profile struct
    // If not, comment this out
    // expect(profileAccount.key.toBase58()).to.equal(profile.toBase58());

    expect(profileAccount.authority.toBase58()).to.equal(
      provider.publicKey.toBase58()
    );
  });
});
