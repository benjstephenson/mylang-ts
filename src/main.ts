import * as Parser from "./parser.ts";

async function repl() {
  console.log("\nReplv0.0.1");
  while (true) {
    const input = prompt("> ");

    if (!input || input.includes("exit")) {
      throw new Error("Terminated");
    }

    const program = Parser.produceAST(input);
    console.log(program);
  }
}

repl();
