import { Solana } from './../target/types/solana';
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";

describe("todo-program", () => {
  const provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const program = anchor.workspace.Solana as Program<Solana>;

  const name = "Khac Vy";

  it("Create profile", async () => {
    const [profile, _bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), provider.publicKey.toBytes()],
      program.programId
    );

    const tx = await program.methods
      .createProfile(name)
      .accounts({
        creator: provider.publicKey,
        profile: profile,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Your transaction signature", tx);
  });
});
