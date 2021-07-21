"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCompiledModule = createCompiledModule;
exports.Module = void 0;

var _wastIdentifierToIndex = require("internal/deps/webassembly_internal/ast/transform/wast-identifier-to-index/index");

var _denormalizeTypeReferences = require("internal/deps/webassembly_internal/ast/transform/denormalize-type-references/index");

var _helperCompiler = require("internal/deps/webassembly_internal/helper-compiler/index");

var _validation = _interopRequireDefault(require("internal/deps/webassembly_internal/validation/index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var t = require("internal/deps/webassembly_internal/ast/index");

var Module = function Module(ir, ast, exports, imports) {
  _classCallCheck(this, Module);

  this._ir = ir;
  this._ast = ast;
  this.exports = exports;
  this.imports = imports;
};

exports.Module = Module;

function createCompiledModule(ast) {
  var exports = [];
  var imports = []; // Do compile-time ast manipulation in order to remove WAST
  // semantics during execution

  (0, _denormalizeTypeReferences.transform)(ast);
  (0, _wastIdentifierToIndex.transform)(ast);
  (0, _validation.default)(ast);
  t.traverse(ast, {
    ModuleExport: function (_ModuleExport) {
      function ModuleExport(_x) {
        return _ModuleExport.apply(this, arguments);
      }

      ModuleExport.toString = function () {
        return _ModuleExport.toString();
      };

      return ModuleExport;
    }(function (_ref) {
      var node = _ref.node;

      if (node.descr.exportType === "Func") {
        exports.push({
          name: node.name,
          kind: "function"
        });
      }
    })
  });
  /**
   * Compile
   */

  var ir = (0, _helperCompiler.toIR)(ast);
  return new Module(ir, ast, exports, imports);
}