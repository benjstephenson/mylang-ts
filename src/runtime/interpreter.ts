import { BooleanVal, Fun, isFun, isNativeFn, isNumericVal, NumericVal, ObjectVal, RuntimeVal, StringVal, UnitVal } from "./values"
import * as A from "../array"
import * as AST from "../parse/ast"
import * as Symbols from "../Symbols"
import { ExhaustiveMatchError, showLoc } from "../types"
import * as Env from "./environment"
import { pipe } from "../functions"

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

function evaliateBooleanExpr(lhs: BooleanVal, rhs: BooleanVal, op: Symbols.InfixOperator) {
}

function evalObjectExpr(obj: AST.ObjectLiteral, env: Env.Environment): [RuntimeVal, Env.Environment] {
  const [objectProperties, updatedEnvironment] = obj.properties.reduce<[[string, RuntimeVal][], Env.Environment]>(([props, e], { key, value }) => {
    if (value === undefined) {

      return [A.push([key, Env.lookup(key)(e)], props), e]
    }

    const [val, updatedEnv] = evaluate(value, e)
    return [A.push([key, val], props), updatedEnv]

  }, [A.empty<[string, RuntimeVal]>(), env])

  return [ObjectVal(objectProperties), updatedEnvironment]

}

function evalIdentifier(id: AST.Identifier, env: Env.Environment): [RuntimeVal, Env.Environment] {
  return [Env.lookup(id.symbol)(env), env]
}

function evalFunDeclaration(funDecl: AST.FunDeclaration, env: Env.Environment): [RuntimeVal, Env.Environment] {
  const f = Fun(funDecl.name, funDecl.parameters, env, funDecl.body)
  return Env.declare(f.name, f)(env)
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

function evalCallExpr(expr: AST.CallExpr, env: Env.Environment): [RuntimeVal, Env.Environment] {

  const [args, updatedEnv] = expr.args.reduce<[RuntimeVal[], Env.Environment]>(
    ([args, e], arg) => {
      const [a, updatedEnv] = evaluate(arg, e)
      return [A.push(a, args), updatedEnv]
    }
    , [A.empty<RuntimeVal>(), env]
  )
  const [fun, updatedEnv2] = evaluate(expr.caller, updatedEnv)

  if (isNativeFn(fun))
    return [fun.call(args, updatedEnv2), updatedEnv2]
  else if (isFun(fun)) {

    if (args.length !== fun.parameters.length)
      throw new Error(`Argument length mismatch calling ${fun.name} at ${showLoc(expr.caller.loc)}`)

    const zipped = A.zip(args, fun.parameters)

    const scope = zipped.reduce((acc, [argVal, name]) =>
      Env.declare(name, argVal)(acc)[1]
      , Env.Environment(fun.declarationEnv))

    return fun.body.reduce<[RuntimeVal, Env.Environment]>(([_, e], expr) => evaluate(expr, e), [UnitVal, scope])
  }

  throw new Error(`${fun._tag} is not callable, at ${showLoc(expr.caller.loc)}`)

}

function evalProgram(prog: AST.Program, env: Env.Environment): [RuntimeVal, Env.Environment] {

  if (!A.isNonEmpty(prog.body)) return [UnitVal, env]

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

    case "Fun":
      return evalFunDeclaration(astNode, env)


    case "LetDeclaration":
      return evalLetDeclaration(astNode, env)

    case "ObjectLiteral":
      return evalObjectExpr(astNode, env)

    case "NumericLiteral":
      return [NumericVal(astNode.value), env]

    case "StringLiteral":
      return [StringVal(astNode.value), env]

    case "InfixExpr":
      return evalInfixExpr(astNode, env)

    case "CallExpr":
      return evalCallExpr(astNode, env)

    case "Program":
      return evalProgram(astNode, env)

    default:
      throw new Error(
        `Failed to eval ${JSON.stringify(astNode, null, 2)} node at ${showLoc(astNode.loc)}`,
      )
  }
}
