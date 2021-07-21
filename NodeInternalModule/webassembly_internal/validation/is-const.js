"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isConst;

var _ast = require("internal/deps/webassembly_internal/ast/index");

/**
 * Determine if a sequence of instructions form a constant expression
 *
 * See https://webassembly.github.io/spec/core/multipage/valid/instructions.html#valid-constant
 */
function isConst(ast, moduleContext) {
  function isConstInstruction(instr) {
    if (instr.id === "const") {
      return true;
    }

    if (instr.id === "get_global") {
      var index = instr.args[0].value;
      return !moduleContext.isMutableGlobal(index);
    }

    if (instr.id === "end") {
      return true;
    }

    return false;
  }

  var errors = [];
  (0, _ast.traverse)(ast, {
    Global: function Global(path) {
      var isValid = path.node.init.reduce(function (acc, instr) {
        return acc && isConstInstruction(instr);
      }, true);

      if (!isValid) {
        errors.push("constant expression required: initializer expression cannot reference mutable global");
      } // check type
      // FIXME(sven): this is a quick fix but should ideally go through our
      // stacky type checker


      if (path.node.init.length > 0) {
        var type = path.node.globalType.valtype;
        var initType = path.node.init[0].object;

        if (initType && type !== initType) {
          errors.push("type mismatch in global initializer");
        }
      }
    }
  });
  return errors;
}