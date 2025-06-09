import { TodoProgram } from './../target/types/todo_program';
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";

describe("toggle-todo", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TodoProgram as Program<TodoProgram>;

  const name = "Tuan Kiet";
  const content = "Learn Anchor";

  let profile: anchor.web3.PublicKey;
  let todo: anchor.web3.PublicKey;

  before(async () => {
    // Derive profile PDA
    [profile] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), provider.publicKey.toBytes()],
      program.programId
    );

    // Create profile
    await program.methods
      .createProfile(name)
      .accountsPartial({
        creator: provider.publicKey,
        profile: profile,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Get todo count for PDA derivation
    const profileAccount = await program.account.profile.fetch(profile);
    const todoCount = profileAccount.todoCount;

    // Derive todo PDA
    const [todo] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("todo"), provider.publicKey.toBytes(), profile.toBytes()],
      program.programId
    );


    // Create todo
    await program.methods
      .createTodo(content)
      .accountsPartial({
        creator: provider.publicKey,
        profile: profile,
        todo: todo,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  });

  it("Toggles the todo completion status", async () => {
    // Fetch current todo state
    let todoAccount = await program.account.todo.fetch(todo);
    const initialStatus = todoAccount.completed;

    // Call toggleTodo
    const tx = await program.methods
      .toggleTodo()
      .accountsPartial({
        authority: provider.publicKey,
        todo: todo,
        profile: profile,
      })
      .rpc();

    console.log("Your transaction toggle todo signature:", tx);

    // Fetch new state
    todoAccount = await program.account.todo.fetch(todo);
    expect(todoAccount.completed).to.equal(!initialStatus); // Status should be flipped
  });
});
