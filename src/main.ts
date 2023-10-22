import { pipe } from "./functions"
import * as Parser from "./parse/parser"
import * as Env from "./runtime/environment"
import { evaluate } from "./runtime/interpreter"
import { False, NumericVal, True } from "./runtime/values"
import * as fs from "fs"
import { PrettyPrinter } from "mismatched"

const env = Env.createGlobalEnv()

async function repl() {
  console.log("\nReplv0.0.1")
  while (true) {
    const input = prompt("> ")

    if (!input || input.includes("exit")) {
      throw new Error("Terminated")
    }

    const program = Parser.produceAST([input])
    console.log(JSON.stringify(program, null, 2))

    // const result = evaluate(program, env)
    // console.log(result)
  }
}

async function run(filename: string) {
  // const input = (await Deno.readTextFile(filename)).split("\\n")
  const input = fs.readFileSync(filename, "utf-8").split("\\n")
  const program = Parser.produceAST(input)
  PrettyPrinter.logToConsole(program)

  const [result, e] = evaluate(program, env)

}

// repl()
run("./test.txt")
