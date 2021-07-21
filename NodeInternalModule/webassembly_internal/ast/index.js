"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  numberLiteralFromRaw: true,
  withLoc: true,
  withRaw: true,
  funcParam: true,
  indexLiteral: true,
  memIndexLiteral: true,
  instruction: true,
  objectInstruction: true,
  traverse: true,
  signatures: true,
  cloneNode: true,
  moduleContextFromModuleAST: true
};
Object.defineProperty(exports, "numberLiteralFromRaw", {
  enumerable: true,
  get: function get() {
    return _nodeHelpers.numberLiteralFromRaw;
  }
});
Object.defineProperty(exports, "withLoc", {
  enumerable: true,
  get: function get() {
    return _nodeHelpers.withLoc;
  }
});
Object.defineProperty(exports, "withRaw", {
  enumerable: true,
  get: function get() {
    return _nodeHelpers.withRaw;
  }
});
Object.defineProperty(exports, "funcParam", {
  enumerable: true,
  get: function get() {
    return _nodeHelpers.funcParam;
  }
});
Object.defineProperty(exports, "indexLiteral", {
  enumerable: true,
  get: function get() {
    return _nodeHelpers.indexLiteral;
  }
});
Object.defineProperty(exports, "memIndexLiteral", {
  enumerable: true,
  get: function get() {
    return _nodeHelpers.memIndexLiteral;
  }
});
Object.defineProperty(exports, "instruction", {
  enumerable: true,
  get: function get() {
    return _nodeHelpers.instruction;
  }
});
Object.defineProperty(exports, "objectInstruction", {
  enumerable: true,
  get: function get() {
    return _nodeHelpers.objectInstruction;
  }
});
Object.defineProperty(exports, "traverse", {
  enumerable: true,
  get: function get() {
    return _traverse.traverse;
  }
});
Object.defineProperty(exports, "signatures", {
  enumerable: true,
  get: function get() {
    return _signatures.signatures;
  }
});
Object.defineProperty(exports, "cloneNode", {
  enumerable: true,
  get: function get() {
    return _clone.cloneNode;
  }
});
Object.defineProperty(exports, "moduleContextFromModuleAST", {
  enumerable: true,
  get: function get() {
    return _astModuleToModuleContext.moduleContextFromModuleAST;
  }
});

var _nodes = require("internal/deps/webassembly_internal/ast/nodes");

Object.keys(_nodes).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _nodes[key];
    }
  });
});

var _nodeHelpers = require("internal/deps/webassembly_internal/ast/node-helpers");

var _traverse = require("internal/deps/webassembly_internal/ast/traverse");

var _signatures = require("internal/deps/webassembly_internal/ast/signatures");

var _utils = require("internal/deps/webassembly_internal/ast/utils");

Object.keys(_utils).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _utils[key];
    }
  });
});

var _clone = require("internal/deps/webassembly_internal/ast/clone");

var _astModuleToModuleContext = require("internal/deps/webassembly_internal/ast/transform/ast-module-to-module-context/index");