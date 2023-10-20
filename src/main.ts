import { pipe } from "./functions.ts"
import * as Parser from "./parse/parser.ts"
import * as Env from "./runtime/environment.ts"
import { evaluate } from "./runtime/interpreter.ts"
import { False, NumericVal, True } from "./runtime/values.ts"

const [_, env] = pipe(
  Env.Environment(),
  Env.declare("x", NumericVal(100)),
  Env.map(Env.declare("True", True)),
  Env.map(Env.declare("False", False))
)


async function repl() {
  console.log("\nReplv0.0.1")
  while (true) {
    const input = prompt("> ")

    if (!input || input.includes("exit")) {
      throw new Error("Terminated")
    }

    const program = Parser.produceAST(input)
    console.log(JSON.stringify(program, null, 2))

    const result = evaluate(program, env)
    console.log(result)
  }
}

async function run(filename: string) {
  const input = await Deno.readTextFile(filename);
  const program = Parser.produceAST(input);
  console.log(JSON.stringify(program, null, 2));

  const result = evaluate(program, env);
  console.log(JSON.stringify(result, null, 2));
}

// repl()
run("./test.txt");
