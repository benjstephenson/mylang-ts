import { BooleanVal, isNumericVal, NumericVal, RuntimeVal } from "./values.ts"
import * as A from "../array.ts"
import * as AST from "../parse/ast.ts"
import * as Symbols from "../Symbols.ts"
import { ExhaustiveMatchError } from "../types.ts"
import * as Env from "./environment.ts"

function evalNumericExpr(lhs: NumericVal, rhs: NumericVal, op: Symbols.InfixOperator): NumericVal {

  const doCalc = (): number => {
    switch (op) {
      case "+":
        return lhs.value + rhs.value
      case "-":
        return lhs.value - rhs.value
      case "*":
        return lhs.value * rhs.value
      case "/":
        return lhs.value / rhs.value
      case "%":
        return lhs.value % rhs.value
      case "^":
        return lhs.value ^ rhs.value
      default:
        return ExhaustiveMatchError(op)
    }
  }

  return NumericVal(doCalc())
}

// function evaliateBooleanExpr(lhs: BooleanVal, rhs: BooleanVal, op: Symbols.InfixOperator) {
// }

function evalIdentifier(id: AST.Identifier, env: Env.Environment): [RuntimeVal, Env.Environment] {
  return [Env.lookup(id.symbol)(env), env]
}

function evalLetDeclaration(letDecl: AST.LetDeclaration, env: Env.Environment): [RuntimeVal, Env.Environment] {
  const [value, updatedEnv] = evaluate(letDecl.value, env)
  return Env.declare(letDecl.identifier, value)(updatedEnv)
}

function evalInfixExpr(infix: AST.InfixExpr, env: Env.Environment): [RuntimeVal, Env.Environment] {

  const [lhs, lhsEnv] = evaluate(infix.left, env)
  const [rhs, rhsEnv] = evaluate(infix.right, lhsEnv)

  if (isNumericVal(lhs) && isNumericVal(rhs)) {
    return [evalNumericExpr(lhs, rhs, infix.operator), rhsEnv]
  }

  throw new Error(
    `type mismatch: ${lhs._tag} and ${rhs._tag} are incompatible`,
  )
}

function evalProgram(prog: AST.Program, env: Env.Environment): [RuntimeVal, Env.Environment] {

  if (!A.isNonEmpty(prog.body)) {
    throw new Error("Cannot evaluate an empty program")
  }

  const [head, ...tail] = prog.body

  return tail.reduce(
    (acc, expr) => {
      const [_, e] = acc
      return evaluate(expr, e)
    },
    evaluate(head, env)
  )
}

export function evaluate(astNode: AST.Expr, env: Env.Environment): [RuntimeVal, Env.Environment] {
  switch (astNode._tag) {
    case "Identifier":
      return evalIdentifier(astNode, env)

    case "LetDeclaration":
      return evalLetDeclaration(astNode, env)

    case "NumericLiteral":
      return [NumericVal(astNode.value), env]

    case "InfixExpr":
      return evalInfixExpr(astNode, env)

    case "Program":
      return evalProgram(astNode, env)

    default:
      throw new Error(
        `Failed to eval node [${JSON.stringify(astNode, null, 2)}]`,
      )
  }
}
