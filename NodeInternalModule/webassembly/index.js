function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _require = require("internal/deps/webassembly_internal/wast-parser/index"),
    parse = _require.parse;

var _require2 = require("internal/deps/webassembly_internal/wasm-parser/index"),
    decode = _require2.decode;

var _require3 = require("internal/deps/webassembly/interpreter/index"),
    Instance = _require3.Instance;

var _require4 = require("internal/deps/webassembly/interpreter/runtime/values/memory"),
    Memory = _require4.Memory;

var _require5 = require("internal/deps/webassembly/interpreter/runtime/values/table"),
    Table = _require5.Table;

var _require6 = require("internal/deps/webassembly/errors"),
    RuntimeError = _require6.RuntimeError,
    CompileError = _require6.CompileError,
    LinkError = _require6.LinkError;

var _require7 = require("internal/deps/webassembly/compiler/compile/module"),
    createCompiledModule = _require7.createCompiledModule,
    Module = _require7.Module;

var _require8 = require("internal/deps/webassembly/check-endianness"),
    checkEndianness = _require8.checkEndianness;

var WebAssembly = {
  instantiate: function instantiate(buff) {
    var importObject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return new Promise(function (resolve, reject) {
      if (checkEndianness() === false) {
        return reject(new RuntimeError("expected the system to be little-endian"));
      }

      if (buff instanceof ArrayBuffer === false && buff instanceof Uint8Array === false) {
        return reject("Module must be either an ArrayBuffer or an Uint8Array (BufferSource), " + _typeof(buff) + " given.");
      }

      var ast = decode(buff);
      var module = createCompiledModule(ast);
      var instance = new Instance(module, importObject);
      resolve({
        instance: instance,
        module: module
      });
    });
  },
  compile: function compile(buff) {
    return new Promise(function (resolve) {
      var ast = decode(buff);
      resolve(createCompiledModule(ast));
    });
  },
  validate: function validate(buff) {
    try {
      createCompiledModule(decode(buff));
      return true;
    } catch (e) {
      return false;
    }
  },
  // FIXME(sven): remove this
  instantiateFromSource: function instantiateFromSource(content) {
    var importObject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var ast = parse(content);
    var module = createCompiledModule(ast);
    console.warn("using deprecated instantiateFromSource");
    return new Instance(module, importObject);
  },
  Instance: Instance,
  Module: Module,
  Memory: Memory,
  Table: Table,
  RuntimeError: RuntimeError,
  LinkError: LinkError,
  CompileError: CompileError
};
module.exports = WebAssembly;