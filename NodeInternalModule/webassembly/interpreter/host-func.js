"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createHostfunc = createHostfunc;
exports.executeStackFrameAndGetResult = executeStackFrameAndGetResult;

var _errors = require("internal/deps/webassembly/errors");

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var t = require("internal/deps/webassembly_internal/ast/index");

var _require = require("internal/deps/webassembly/interpreter/runtime/castIntoStackLocalOfType"),
    castIntoStackLocalOfType = _require.castIntoStackLocalOfType;

var _require2 = require("internal/deps/webassembly/interpreter/kernel/exec"),
    executeStackFrame = _require2.executeStackFrame;

var _require3 = require("internal/deps/webassembly/interpreter/kernel/stackframe"),
    createStackFrame = _require3.createStackFrame;

var _require4 = require("internal/deps/webassembly/interpreter/kernel/signals"),
    ExecutionHasBeenTrapped = _require4.ExecutionHasBeenTrapped;

function createHostfunc(ir, moduleinst, exportinst, allocator, _ref) {
  var checkForI64InSignature = _ref.checkForI64InSignature,
      returnStackLocal = _ref.returnStackLocal;
  return function hostfunc() {
    var _stackFrame$locals;

    var exportinstAddr = exportinst.value.addr;
    /**
     * Find callable in instantiated function in the module funcaddrs
     */

    var hasModuleInstantiatedFunc = moduleinst.funcaddrs.indexOf(exportinstAddr);

    if (hasModuleInstantiatedFunc === -1) {
      throw new _errors.RuntimeError("Function at addr ".concat(exportinstAddr.index, " has not been initialized in the module.") + "Probably an internal failure");
    }

    var funcinst = allocator.get(exportinstAddr);

    if (funcinst === null) {
      throw new _errors.RuntimeError("Function was not found at addr ".concat(exportinstAddr.index));
    }

    var funcinstArgs = funcinst.type[0];

    if (checkForI64InSignature === true) {
      var funcinstResults = funcinst.type[1];
      /**
       * If the signature contains an i64 (as argument or result), the host
       * function immediately throws a TypeError when called.
       */

      var funcinstArgsHasi64 = funcinstArgs.indexOf("i64") !== -1;
      var funcinstResultsHasi64 = funcinstResults.indexOf("i64") !== -1;

      if (funcinstArgsHasi64 === true || funcinstResultsHasi64 === true) {
        throw new TypeError("Can not call this function from JavaScript: " + "i64 in signature.");
      }
    }
    /**
     * Check number of argument passed vs the function arity
     */


    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length !== funcinstArgs.length) {
      throw new _errors.RuntimeError("Function ".concat(exportinstAddr.index, " called with ").concat(args.length, " arguments but ") + funcinst.type[0].length + " expected");
    }

    var argsWithType = args.map(function (value, i) {
      return castIntoStackLocalOfType(funcinstArgs[i], value);
    });
    var stackFrame = createStackFrame(argsWithType, funcinst.module, allocator); // push func's params into stackFrame locals

    (_stackFrame$locals = stackFrame.locals).push.apply(_stackFrame$locals, _toConsumableArray(argsWithType)); // 2. Enter the block instr∗ with label
    // stackFrame.values.push(label.createValue(exportinst.name));


    stackFrame.labels.push({
      value: funcinst,
      arity: funcinstArgs.length,
      id: t.identifier(exportinst.name)
    });
    return executeStackFrameAndGetResult(ir, funcinst.atOffset, stackFrame, returnStackLocal);
  };
}

function executeStackFrameAndGetResult(ir, offset, stackFrame, returnStackLocal) {
  try {
    var res = executeStackFrame(ir, offset, stackFrame);

    if (returnStackLocal === true) {
      return res;
    }

    if (res != null && res.value != null) {
      if (!(res.type !== "label")) {
        throw new Error('res.type !== "label"' + " error: " + (undefined || "unknown"));
      }

      return res.value.toNumber();
    }
  } catch (e) {
    if (e instanceof ExecutionHasBeenTrapped) {
      throw e;
    } else {
      var err = new _errors.RuntimeError(e.message);
      err.stack = e.stack;
      throw err;
    }
  }
}