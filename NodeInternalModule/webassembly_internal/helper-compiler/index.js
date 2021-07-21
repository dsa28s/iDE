"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  toIR: true,
  listOfInstructionsToIr: true,
  kStart: true
};
exports.toIR = toIR;
exports.listOfInstructionsToIr = listOfInstructionsToIr;
Object.defineProperty(exports, "kStart", {
  enumerable: true,
  get: function get() {
    return _module.kStart;
  }
});

var _ast = require("internal/deps/webassembly_internal/ast/index");

var _helperFlattenAst = require("internal/deps/webassembly_internal/helper-flatten-ast/index");

var _module = require("internal/deps/webassembly_internal/helper-compiler/module");

var _printer = require("internal/deps/webassembly_internal/helper-compiler/printer");

Object.keys(_printer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _printer[key];
    }
  });
});

function toIR(ast) {
  var program = {};
  var funcTable = []; // flatten the ast first
  // TODO(sven): do it in a single pass?

  (0, _helperFlattenAst.flatten)(ast);
  var module = new _module.Module(ast);
  (0, _ast.traverse)(ast, {
    Start: function (_Start) {
      function Start(_x) {
        return _Start.apply(this, arguments);
      }

      Start.toString = function () {
        return _Start.toString();
      };

      return Start;
    }(function (_ref) {
      var node = _ref.node;

      var _module$emitStartFunc = module.emitStartFunc(parseInt(node.index.value)),
          name = _module$emitStartFunc.name,
          startAt = _module$emitStartFunc.startAt;

      funcTable.push({
        name: name,
        startAt: startAt
      });
    }),
    Func: function (_Func) {
      function Func(_x2) {
        return _Func.apply(this, arguments);
      }

      Func.toString = function () {
        return _Func.toString();
      };

      return Func;
    }(function (funcPath) {
      module.beginFuncBody(funcPath.node);
      (0, _ast.traverse)(funcPath.node, {
        Instruction: function (_Instruction) {
          function Instruction(_x3) {
            return _Instruction.apply(this, arguments);
          }

          Instruction.toString = function () {
            return _Instruction.toString();
          };

          return Instruction;
        }(function (path) {
          module.onFuncInstruction(path.node);
        })
      });

      var _module$finalizeFunc = module.finalizeFunc(funcPath.node),
          name = _module$finalizeFunc.name,
          instructions = _module$finalizeFunc.instructions,
          startAt = _module$finalizeFunc.startAt;

      funcTable.push({
        name: name,
        startAt: startAt
      });
      instructions.forEach(function (instruction) {
        program[instruction.offset] = instruction.node;
      });
    })
  });
  return {
    // $FlowIgnore
    funcTable: funcTable,
    program: program
  };
}

function listOfInstructionsToIr(instrs) {
  var program = {};
  var funcTable = [];
  var module = new _module.Module((0, _ast.program)([]));
  var fakeFunc = (0, _ast.func)((0, _ast.identifier)("main"), [], instrs);
  module.beginFuncBody(fakeFunc);
  instrs.forEach(function (i) {
    return module.onFuncInstruction(i);
  });

  var _module$finalizeFunc2 = module.finalizeFunc(fakeFunc),
      name = _module$finalizeFunc2.name,
      instructions = _module$finalizeFunc2.instructions,
      startAt = _module$finalizeFunc2.startAt;

  funcTable.push({
    name: name,
    startAt: startAt
  });
  instructions.forEach(function (instruction) {
    program[instruction.offset] = instruction.node;
  });
  return {
    // $FlowIgnore
    funcTable: funcTable,
    program: program
  };
}