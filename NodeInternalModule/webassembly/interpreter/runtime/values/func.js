"use strict";

var _errors = require("internal/deps/webassembly/errors");

function createInstance(atOffset, n, fromModule) {
  if (!(typeof atOffset === "number")) {
    throw new Error('typeof atOffset === "number"' + " error: " + (undefined || "unknown"));
  }

  //       [param*, result*]
  var type = [[], []];

  if (n.signature.type !== "Signature") {
    throw new _errors.RuntimeError("Function signatures must be denormalised before execution");
  }

  var signature = n.signature;
  signature.params.forEach(function (param) {
    type[0].push(param.valtype);
  });
  signature.results.forEach(function (result) {
    type[1].push(result);
  });
  var code = n.body;
  return {
    atOffset: atOffset,
    type: type,
    code: code,
    module: fromModule,
    isExternal: false
  };
}

module.exports = {
  createInstance: createInstance
};