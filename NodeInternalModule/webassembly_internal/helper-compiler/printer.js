"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dumpIR = dumpIR;

var _index = require("internal/deps/webassembly_internal/helper-compiler/index");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function printInstruction(instruction) {
  var out = "";

  if (typeof instruction.type === "string") {
    // $FlowIgnore
    if (instruction.type === "InternalEndAndReturn") {
      out += "_end_and_return";
    } // $FlowIgnore


    if (instruction.type === "InternalBrUnless") {
      out += "_br_unless";
      out += " " + instruction.target;
    } // $FlowIgnore


    if (instruction.type === "InternalGoto") {
      out += "_goto";
      out += " " + instruction.target;
    } // $FlowIgnore


    if (instruction.type === "InternalCallExtern") {
      out += "_extern_call";
      out += " " + instruction.target;
    }
  }

  if (typeof instruction.object === "string") {
    out += instruction.object;
    out += ".";
  }

  if (typeof instruction.id === "string") {
    out += instruction.id;
  }

  if (instruction.args !== undefined) {
    // $FlowIgnore
    instruction.args.forEach(function (arg) {
      out += " "; // $FlowIgnore

      out += arg.value;
    });
  }

  if (_typeof(instruction.index) === "object") {
    // $FlowIgnore
    out += " @" + String(instruction.index.value);
  }

  return out;
}

function dumpIR(ir) {
  var out = "";
  out += "Func table:\n";
  ir.funcTable.forEach(function (func) {
    if (func.name === _index.kStart) {
      out += "__start" + " at " + func.startAt + "\n";
      return;
    }

    out += func.name + " at " + func.startAt + "\n";
  });
  out += "\n";

  for (var offset in ir.program) {
    out += offset + " | ";
    out += printInstruction(ir.program[parseInt(offset)]);
    out += "\n";
  }

  return out;
}