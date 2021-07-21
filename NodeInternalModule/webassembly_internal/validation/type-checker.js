"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = validate;

var _ast = require("internal/deps/webassembly_internal/ast/index");

var _getType = _interopRequireDefault(require("internal/deps/webassembly_internal/validation/type-checker/get-type"));

var _types = require("internal/deps/webassembly_internal/validation/type-checker/types");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function createTypeChecker() {
  var errors = [];
  var stopFuncCheck = false; // current function name is injected during the traversal

  var currentFuncName;

  function onError(msg, index) {
    msg += " at " + (currentFuncName || "unknown");

    if (typeof index === "number") {
      msg += ":" + index;
    }

    msg += ".";
    errors.push(msg);
  }

  function checkTypes(a, b, index) {
    if (a === _types.ANY && b) {
      return;
    }

    if (b === _types.ANY && a) {
      return;
    } // the type u32 is equal to i32


    if (a === "u32") a = "i32";
    if (b === "u32") b = "i32"; // the type u64 is equal to i64

    if (a === "u64") a = "i64";
    if (b === "u64") b = "i64";

    if (a !== b) {
      onError("Expected type ".concat(a, " but got ").concat(b || "none"), index);
      stopFuncCheck = true;
    }
  }

  function isEmptyStack(stack) {
    // Polymorphic types are allowed in empty stack
    return stack.filter(function (t) {
      return t !== _types.POLYMORPHIC;
    }).length === 0;
  }

  function checkStacks(expectedStack, actualStack) {
    if (!(expectedStack !== undefined)) {
      throw new Error('expectedStack !== undefined' + " error: " + (undefined || "unknown"));
    }

    if (!(actualStack !== undefined)) {
      throw new Error('actualStack !== undefined' + " error: " + (undefined || "unknown"));
    }

    if (actualStack !== false) {
      var j = actualStack.length - 1;

      for (var i = 0; i < expectedStack.length; ++i) {
        var expected = expectedStack[i];
        var actual = actualStack[j];

        if (actual === _types.POLYMORPHIC || stopFuncCheck) {
          return;
        }

        checkTypes(expected, actual);
        --j;
      } // There are still types left on the resulting stack


      if (!isEmptyStack(actualStack.slice(0, j + 1))) {
        onError("Stack contains additional type ".concat(actualStack.slice(0, j + 1)));
      }
    }
  }

  function applyInstruction(moduleContext, stack, instruction, index) {
    // Return was called or a type error has occured, skip everything
    if (stack === false || stack.return) {
      return stack;
    } // Workaround for node.args which sometimes does not contain instructions (i32.const, call)


    if ((0, _ast.isInstruction)(instruction) === false) {
      return stack;
    } // Recursively evaluate all nested instructions


    if (instruction.args) {
      stack = instruction.args.reduce(applyInstruction.bind(null, moduleContext), stack);
    }

    if (instruction.instrArgs) {
      stack = instruction.instrArgs.reduce(applyInstruction.bind(null, moduleContext), stack);
    }

    if (instruction.intrs) {
      stack = instruction.intrs.reduce(applyInstruction.bind(null, moduleContext), stack);
    }

    var type = (0, _getType.default)(moduleContext, stack, instruction);

    if (type.error) {
      onError(type.error, index);
      return false;
    } // Structured control flow
    // Update context
    // Run on empty stack


    if (instruction.type === "BlockInstruction" || instruction.type === "LoopInstruction") {
      moduleContext.addLabel(type.result);
      var newStack = instruction.instr.reduce(applyInstruction.bind(null, moduleContext), []);

      if (!stopFuncCheck) {
        checkStacks(type.result, newStack);
      }

      stack = _toConsumableArray(stack).concat(_toConsumableArray(type.result));
      moduleContext.popLabel();
    } else if (instruction.type === "IfInstruction") {
      moduleContext.addLabel(type.result); // Condition can be nested as well

      if (instruction.test) {
        stack = instruction.test.reduce(applyInstruction.bind(null, moduleContext), stack);
      }

      var actual;

      for (var _i = 0; _i < type.args.length; ++_i) {
        var argType = type.args[_i];

        if (stack[stack.length - 1] === _types.POLYMORPHIC || stopFuncCheck) {
          return false;
        }

        actual = stack.pop();
        checkTypes(argType, actual, index);
      }

      var stackConsequent = instruction.consequent.reduce(applyInstruction.bind(null, moduleContext), []);
      var stackAlternate = instruction.alternate.reduce(applyInstruction.bind(null, moduleContext), []);
      var i = 0;
      var j = 0;
      var compareLengths = true;

      while (i < stackConsequent.length && j < stackAlternate.length) {
        if (stackConsequent[i] === _types.POLYMORPHIC || stackAlternate[j] === _types.POLYMORPHIC) {
          compareLengths = false;
          break;
        }

        checkTypes(stackConsequent[i], stackAlternate[j], index);
        ++i;
        ++j;
      }

      while (compareLengths && i < stackConsequent.length) {
        if (stackConsequent[i] === _types.POLYMORPHIC) {
          compareLengths = false;
        }

        ++i;
      }

      while (compareLengths && j < stackConsequent.length) {
        if (stackConsequent[j] === _types.POLYMORPHIC) {
          compareLengths = false;
        }

        ++j;
      }

      if (compareLengths && stackConsequent.length !== stackAlternate.length) {
        onError("Type mismatch in if, got ".concat(stackConsequent, " and ").concat(stackAlternate), index);
      }

      checkStacks(type.result, stackConsequent);
      moduleContext.popLabel();
      stack = type.result;
    } else {
      if (stack === false) {
        return false;
      }

      var _actual;

      for (var _i2 = 0; _i2 < type.args.length; ++_i2) {
        var _argType = type.args[_i2];

        if (stack[stack.length - 1] === _types.POLYMORPHIC || stopFuncCheck) {
          return false;
        }

        _actual = stack.pop();
        checkTypes(_argType, _actual, index);
      }

      stack = _toConsumableArray(stack).concat(_toConsumableArray(type.result));
    }

    return stack;
  }

  return {
    getErrors: function getErrors() {
      return errors;
    },
    addError: function addError(msg) {
      errors.push(msg);
    },
    setStopFuncCheck: function setStopFuncCheck(state) {
      stopFuncCheck = state;
    },
    getStopFuncCheck: function getStopFuncCheck() {
      return stopFuncCheck;
    },
    setCurrentFuncName: function setCurrentFuncName(name) {
      currentFuncName = name;
    },
    applyInstruction: applyInstruction,
    checkStacks: checkStacks
  };
}

function validate(ast) {
  if (!ast.body || !ast.body[0] || !ast.body[0].fields) {
    return [];
  } // Module context


  var moduleContext = (0, _ast.moduleContextFromModuleAST)(ast.body[0]);
  var typeChecker = createTypeChecker(); // Simulate stack types throughout all function bodies

  (0, _ast.traverse)(ast, {
    Func: function Func(_ref) {
      var node = _ref.node;
      typeChecker.setStopFuncCheck(false);
      typeChecker.setCurrentFuncName(node.name.value); // resolve signature

      var signature;
      {
        // signature might be a reference to a type
        if ((0, _ast.isSignature)(node.signature)) {
          signature = node.signature;
        } else {
          if (!(0, _ast.isNumberLiteral)(node.signature)) {
            throw new Error('isNumberLiteral(node.signature)' + " error: " + (undefined || "unknown"));
          }

          var typeId = node.signature.value;

          if (!moduleContext.hasType(typeId)) {
            throw new Error('moduleContext.hasType(typeId)' + " error: " + (undefined || "unknown"));
          }

          signature = moduleContext.getType(typeId);
        }
      }
      var expectedResult = signature.results;
      moduleContext.newContext(node.name.value, expectedResult); // Parameters are local variables

      signature.params.forEach(function (p) {
        return moduleContext.addLocal(p.valtype);
      });
      var resultingStack = node.body.reduce(typeChecker.applyInstruction.bind(null, moduleContext), []);

      if (typeChecker.getStopFuncCheck()) {
        return typeChecker.getErrors();
      } // Compare the two stacks


      typeChecker.checkStacks(expectedResult, resultingStack);
    }
  });
  return typeChecker.getErrors();
}