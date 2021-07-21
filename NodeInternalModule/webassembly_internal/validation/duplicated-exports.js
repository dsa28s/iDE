"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = validate;

var _ast = require("internal/deps/webassembly_internal/ast/index");

function duplicatedExports(name) {
  return "duplicate export name \"".concat(name, "\"");
}

function validate(ast) {
  var errors = [];
  var seenExports = {};
  (0, _ast.traverse)(ast, {
    ModuleExport: function (_ModuleExport) {
      function ModuleExport(_x) {
        return _ModuleExport.apply(this, arguments);
      }

      ModuleExport.toString = function () {
        return _ModuleExport.toString();
      };

      return ModuleExport;
    }(function (path) {
      var name = path.node.name;

      if (seenExports[name] !== undefined) {
        return errors.push(duplicatedExports(name));
      }

      seenExports[name] = true;
    })
  });
  return errors;
}