import { TodoProgram } from './../target/types/todo_program';
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";

describe("create-todo", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TodoProgram as Program<TodoProgram>;
  const name = "Tuan Kiet";

  let profile: anchor.web3.PublicKey;
  let profileAccount: any;

  before(async () => {
    // Derive profile PDA
    [profile] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), provider.publicKey.toBytes()],
      program.programId
    );

    // Call createProfile
    const tx = await program.methods
      .createProfile(name)
      .accountsPartial({
        creator: provider.publicKey,
        profile: profile,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    profileAccount = await program.account.profile.fetch(profile);

    console.log("Profile created", profileAccount);
    console.log("Your transaction create profile signature", tx);
  });

  it("Create todo", async () => {
    const content = "Learn Rust";

    // Convert todo_count to number first before using in Buffer.from
    const todoCount = profileAccount.todoCount;

    const [todo] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("todo"), provider.publicKey.toBytes(), Buffer.from([todoCount])],
      program.programId
    );

    const tx = await program.methods
      .createTodo(content)
      .accountsPartial({
        creator: provider.publicKey,
        profile: profile,
        todo: todo,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Your transaction create todo signature:", tx);

    const todoAccount = await program.account.todo.fetch(todo);
    expect(todoAccount.content).to.equal(content);
    expect(todoAccount.completed).to.equal(false);

    // Save current count
    const currentTodoCount = todoCount;

    // Fetch updated profileAccount
    profileAccount = await program.account.profile.fetch(profile);
    console.log("profileAccount after creating todo:", profileAccount);

    // Compare new count to previous
    expect(profileAccount.todoCount).to.equal(currentTodoCount + 1);
  });
});
