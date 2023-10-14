import { tokenise } from "./lex/lexer.ts";
import * as Parser from "./parse/parser.ts";
// import { evaluate } from "./runtime/interpreter.ts";

async function repl() {
  console.log("\nReplv0.0.1");
  while (true) {
    const input = prompt("> ");

    if (!input || input.includes("exit")) {
      throw new Error("Terminated");
    }

    const program = Parser.produceAST(input); //Parser.produceAST(input);
    console.log(JSON.stringify(program, null, 2));
    //const result = evaluate(program);
    //console.log(result);
  }
}

repl();
