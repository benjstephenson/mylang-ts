import * as fs from "fs"
import * as Parser from "./parse/parser"
import * as Env from "./runtime/environment"
import { evaluate } from "./runtime/interpreter"
import { Location, showLoc } from "./types"

const env = Env.createGlobalEnv()

const printer = (key: string, value: any) => {
  if (value?._tag === "Location") {
    const loc = value as Location
    return `${loc.start}:${loc.end}`
  }

  return value
}

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
  const input = fs.readFileSync(filename, "utf-8").split("\\n")
  const program = Parser.produceAST(input)
  console.log(JSON.stringify(program, printer, 2))

  const [result, e] = evaluate(program, env)

}

// repl()
run("./test.txt")
