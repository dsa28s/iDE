"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flatten = flatten;

var _ast = require("internal/deps/webassembly_internal/ast/index");

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function flatten(ast) {
  /**
   * Remove nested instructions
   *
   * For example:
   *
   * (call 0
   *   (i32.const 1)
   *   (i32.const 2)
   * )
   *
   * into:
   *
   * (i32.const 1)
   * (i32.const 2)
   * (call 0)
   *
   */
  function CallInstructionVisitor(path) {
    var instrArgs = path.node.instrArgs; // $FlowIgnore

    if (typeof instrArgs === "undefined" || instrArgs.length === 0) {
      // no nested instructions
      return;
    } // $FlowIgnore


    instrArgs.forEach(path.insertBefore);
    path.node.instrArgs = [];
    didFlatten = true;
  }

  function InstrVisitor(path) {
    if (path.node.args.length === 0) {
      // no nested instructions
      return;
    }

    path.node.args = path.node.args.reduce(function (acc, arg) {
      if ((0, _ast.isInstruction)(arg) === false) {
        return _toConsumableArray(acc).concat([arg]);
      }

      path.insertBefore(arg);
      didFlatten = true;
      return acc;
    }, []);
  }

  var didFlatten = true;

  while (didFlatten) {
    didFlatten = false;
    (0, _ast.traverse)(ast, {
      CallInstruction: CallInstructionVisitor,
      Instr: InstrVisitor
    });
  }

  return ast;
}