import { tokenise } from "./lexer.ts";
import * as Parser from "./parser.ts";
import { evaluate } from "./runtime/interpreter.ts";

async function repl() {
  console.log("\nReplv0.0.1");
  while (true) {
    const input = prompt("> ");

    if (!input || input.includes("exit")) {
      throw new Error("Terminated");
    }

    const program = tokenise(input); //Parser.produceAST(input);
    console.log(program);
    //const result = evaluate(program);
    //console.log(result);
  }
}

repl();
