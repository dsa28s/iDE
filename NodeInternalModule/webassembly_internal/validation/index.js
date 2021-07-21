"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = validateAST;
exports.getValidationErrors = getValidationErrors;
Object.defineProperty(exports, "isConst", {
  enumerable: true,
  get: function get() {
    return _isConst.default;
  }
});
Object.defineProperty(exports, "getType", {
  enumerable: true,
  get: function get() {
    return _typeInference.getType;
  }
});
Object.defineProperty(exports, "typeEq", {
  enumerable: true,
  get: function get() {
    return _typeInference.typeEq;
  }
});
exports.stack = void 0;

var _importOrder = _interopRequireDefault(require("internal/deps/webassembly_internal/validation/import-order"));

var _isConst = _interopRequireDefault(require("internal/deps/webassembly_internal/validation/is-const"));

var _typeChecker = _interopRequireDefault(require("internal/deps/webassembly_internal/validation/type-checker"));

var _imports = _interopRequireDefault(require("internal/deps/webassembly_internal/validation/imports"));

var _duplicatedExports = _interopRequireDefault(require("internal/deps/webassembly_internal/validation/duplicated-exports"));

var _ast = require("internal/deps/webassembly_internal/ast/index");

var _typeInference = require("internal/deps/webassembly_internal/validation/type-inference");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function validateAST(ast) {
  var errors = getValidationErrors(ast);

  if (errors.length !== 0) {
    var errorMessage = "Validation errors:\n" + errors.join("\n");
    throw new Error(errorMessage);
  }
}

function getValidationErrors(ast) {
  var errors = [];
  var modules = []; // $FlowIgnore

  if (ast.type === "Module") {
    modules = [ast];
  } // $FlowIgnore


  if (ast.type === "Program") {
    modules = ast.body.filter(function (_ref) {
      var type = _ref.type;
      return type === "Module";
    });
  }

  modules.forEach(function (m) {
    var moduleContext = (0, _ast.moduleContextFromModuleAST)(m); // $FlowIgnore

    errors.push.apply(errors, _toConsumableArray((0, _imports.default)(ast, moduleContext)));
    errors.push.apply(errors, _toConsumableArray((0, _isConst.default)(ast, moduleContext)));
    errors.push.apply(errors, _toConsumableArray((0, _importOrder.default)(ast)));
    errors.push.apply(errors, _toConsumableArray((0, _typeChecker.default)(ast, moduleContext)));
    errors.push.apply(errors, _toConsumableArray((0, _duplicatedExports.default)(ast)));
  });
  return errors;
}

var stack = _typeChecker.default;
exports.stack = stack;