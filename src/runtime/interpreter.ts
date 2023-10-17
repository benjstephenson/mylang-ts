import { NumericVal, RuntimeVal, isNumericVal } from "./values.ts"
import * as A from "../array.ts"
import * as AST from "../parse/ast.ts"
import * as Symbols from "../Symbols.ts"
import { ExhaustiveMatchError } from "../types.ts"


function evalNumericExpr(
  lhs: NumericVal,
  rhs: NumericVal,
  op: Symbols.InfixOperator,
): NumericVal {
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

function evalInfixExpr(infix: AST.InfixExpr): RuntimeVal {
  const lhs = evaluate(infix.left)
  const rhs = evaluate(infix.right)

  if (isNumericVal(lhs) && isNumericVal(rhs)) {
    return evalNumericExpr(lhs, rhs, infix.operator)
  }

  throw new Error(`type mismatch`)
}

function evalProgram(prog: AST.Program): RuntimeVal | undefined {
  if (!A.isNonEmpty(prog.body)) return undefined

  const [head, ...tail] = prog.body
  return tail.reduce((acc, expr) => evaluate(expr), evaluate(head))
}

export function evaluate(astNode: AST.Expr): RuntimeVal | undefined {
  switch (astNode._tag) {
    case "NumericLiteral":
      return NumericVal(astNode.value)

    case "InfixExpr":
      return evalInfixExpr(astNode)

    case "Program":
      return evalProgram(astNode)

    default:
      throw new Error(`Failed to eval node [${JSON.stringify(astNode)}]`)
  }
}
