import { NumberVal, RuntimeVal } from "./values.ts";
import * as AST from "../ast.ts";
//
// function evalNumericExpr(
//   lhs: NumberVal,
//   rhs: NumberVal,
//   op: string,
// ): NumberVal {
//   const doCalc = () => {
//     switch (op) {
//       case "+":
//         return lhs.value + rhs.value;
//       case "-":
//         return lhs.value - rhs.value;
//       case "*":
//         return lhs.value * rhs.value;
//       case "/":
//         return lhs.value / rhs.value;
//       case "%":
//         return lhs.value % rhs.value;
//     }
//   }
//
//   return { type: 'number' value: doCalc() }
// }
//
// function evalInfixExpr(infix: AST.InfixExpr): RuntimeVal {
//   const lhs = evaluate(infix.left);
//   const rhs = evaluate(infix.right);
//
//   if (lhs.type === "number" && rhs.type === "number") {
//     return evalNumericExpr(lhs, rhs, infix.operator);
//   }
//
//   throw new Error(`type mismatch`);
// }
//
// function evalProgram(prog: AST.Program): RuntimeVal {
//   return prog.body.reduce((acc, expr) => evaluate(expr));
// }
//
// export function evaluate(astNode: AST.Expr): RuntimeVal {
//   switch (astNode.kind) {
//     case "NumericLiteral":
//       return { value: astNode.value, type: "number" };
//
//     case "InfixExpr":
//       return evalInfixExpr(astNode);
//
//     case "Program":
//       return evalProgram(astNode);
//
//     default:
//       throw new Error(`Failed to eval node [${JSON.stringify(astNode)}]`);
//   }
// }
