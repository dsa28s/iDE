"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _ast = require("internal/deps/webassembly_internal/ast/index");

/**
 * Determine if a sequence of instructions form a constant expression
 *
 * See https://webassembly.github.io/spec/core/multipage/valid/instructions.html#valid-constant
 */
function _default(ast
/*, moduleContext: Object */
) {
  var errors = [];
  (0, _ast.traverse)(ast, {
    ModuleImport: function ModuleImport(_ref) {
      var node = _ref.node;
      var mutability = node.descr.mutability;

      if (mutability === "var") {
        errors.push("mutable globals cannot be imported");
      }
    }
  });
  return errors;
}