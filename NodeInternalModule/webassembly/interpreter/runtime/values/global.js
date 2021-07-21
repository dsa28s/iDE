"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createInstance = createInstance;

var _validation = require("internal/deps/webassembly_internal/validation/index");

var _require = require("internal/deps/webassembly/interpreter/partial-evaluation"),
    evaluate = _require.evaluate;

var _require2 = require("internal/deps/webassembly/errors"),
    CompileError = _require2.CompileError;

function createInstance(allocator, node) {
  var value;
  var _node$globalType = node.globalType,
      valtype = _node$globalType.valtype,
      mutability = _node$globalType.mutability; // None or multiple constant expressions in the initializer seems not possible
  // TODO(sven): find a specification reference for that
  // FIXME(sven): +1 because of the implicit end, change the order of validations

  if (node.init.length > 2 || node.init.length === 1) {
    throw new CompileError("type mismatch");
  } // Validate the type


  var resultInferedType = (0, _validation.getType)(node.init);

  if (resultInferedType != null && (0, _validation.typeEq)([node.globalType.valtype], resultInferedType) === false) {
    throw new CompileError("type mismatch");
  }

  var res = evaluate(allocator, node.init);

  if (res != null) {
    value = res.value;
  }

  return {
    type: valtype,
    mutability: mutability,
    value: value
  };
}