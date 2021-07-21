"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.executeStackFrame = executeStackFrame;

var _long = _interopRequireDefault(require("internal/deps/long/index"));

var _memory2 = require("internal/deps/webassembly/interpreter/runtime/values/memory");

var _errors = require("internal/deps/webassembly/errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return _sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _require = require("internal/deps/webassembly/interpreter/kernel/instruction/binop"),
    binopi32 = _require.binopi32,
    binopi64 = _require.binopi64,
    binopf32 = _require.binopf32,
    binopf64 = _require.binopf64;

var _require2 = require("internal/deps/webassembly/interpreter/kernel/instruction/unop"),
    unopi32 = _require2.unopi32,
    unopi64 = _require2.unopi64,
    unopf32 = _require2.unopf32,
    unopf64 = _require2.unopf64;

var _require3 = require("internal/deps/webassembly/interpreter/runtime/castIntoStackLocalOfType"),
    castIntoStackLocalOfType = _require3.castIntoStackLocalOfType;

var i32 = require("internal/deps/webassembly/interpreter/runtime/values/i32");

var i64 = require("internal/deps/webassembly/interpreter/runtime/values/i64");

var f32 = require("internal/deps/webassembly/interpreter/runtime/values/f32");

var f64 = require("internal/deps/webassembly/interpreter/runtime/values/f64");

var label = require("internal/deps/webassembly/interpreter/runtime/values/label");

var _require4 = require("internal/deps/webassembly/interpreter/kernel/signals"),
    createTrap = _require4.createTrap;

var _require5 = require("internal/deps/webassembly/interpreter/kernel/instruction/comparison"),
    compare = _require5.compare;

function executeStackFrame(_ref, offset, firstFrame) {
  var program = _ref.program;

  if (!(_typeof(program) === "object")) {
    throw new _errors.RuntimeError('typeof program === "object"' + " error: " + (undefined || "unknown"));
  }

  var callStack = [firstFrame]; // because it's used a macros
  // eslint-disable-next-line prefer-const

  var framepointer = 0;

  function getLocalByIndex(frame, index) {
    var local = frame.locals[index];

    if (typeof local === "undefined") {
      throw newRuntimeError("Assertion error: no local value at index " + index);
    }

    frame.values.push(local);
  }

  function setLocalByIndex(frame, index, value) {
    if (!(typeof index === "number")) {
      throw new _errors.RuntimeError('typeof index === "number"' + " error: " + (undefined || "unknown"));
    }

    frame.locals[index] = value;
  }

  function pushResult(frame, res) {
    if (typeof res === "undefined") {
      return;
    }

    frame.values.push(res);
  }

  function popArrayOfValTypes(frame, types) {
    if (frame.values.length < types.length) {
      throw new _errors.RuntimeError("Assertion error: expected " + JSON.stringify(types.length) + " on the stack, found " + frame.values.length);
    }

    return types.map(function (type) {
      return pop1OfType(frame, type);
    });
  }

  function valueTypeEq(l, r) {
    // compatibility with our parser
    if (l === "u32") {
      l = "i32";
    }

    if (l === "u64") {
      l = "i64";
    }

    if (r === "u32") {
      r = "i32";
    }

    if (r === "u64") {
      r = "i64";
    }

    return l === r;
  }

  function pop1OfType(frame, type) {
    if (frame.values.length < 1) {
      throw new _errors.RuntimeError("Assertion error: expected " + JSON.stringify(1) + " on the stack, found " + frame.values.length);
    }

    var v = frame.values.pop();

    if (typeof type === "string" && valueTypeEq(v.type, type) === false) {
      throw newRuntimeError("Internal failure: expected value of type " + type + " on top of the stack, type given: " + v.type);
    }

    return v;
  }

  function pop1(frame) {
    if (frame.values.length < 1) {
      throw new _errors.RuntimeError("Assertion error: expected " + JSON.stringify(1) + " on the stack, found " + frame.values.length);
    }

    return frame.values.pop();
  }

  function pop2(frame, type1, type2) {
    if (frame.values.length < 2) {
      throw new _errors.RuntimeError("Assertion error: expected " + JSON.stringify(2) + " on the stack, found " + frame.values.length);
    }

    var c2 = frame.values.pop();
    var c1 = frame.values.pop();

    if (valueTypeEq(c2.type, type2) === false) {
      throw newRuntimeError("Internal failure: expected c2 value of type " + type2 + " on top of the stack, given type: " + c2.type);
    }

    if (valueTypeEq(c1.type, type1) === false) {
      throw newRuntimeError("Internal failure: expected c1 value of type " + type1 + " on top of the stack, given type: " + c1.type);
    }

    return [c1, c2];
  }

  function getMemoryOffset(frame, instruction) {
    if (instruction.namedArgs && instruction.namedArgs.offset) {
      // $FlowIgnore
      var _offset = instruction.namedArgs.offset.value;

      if (_offset < 0) {
        throw newRuntimeError("offset must be positive");
      }

      if (_offset > 0xffffffff) {
        throw newRuntimeError("offset must be less than or equal to 0xffffffff");
      }

      return _offset;
    } else {
      return 0;
    }
  }

  function getMemory(frame) {
    if (frame.originatingModule.memaddrs.length !== 1) {
      throw newRuntimeError("unknown memory");
    }

    var memAddr = frame.originatingModule.memaddrs[0];
    return frame.allocator.get(memAddr);
  }

  function newRuntimeError(msg) {
    return new _errors.RuntimeError(msg);
  }

  function getActiveStackFrame() {
    if (!(framepointer > -1)) {
      throw new _errors.RuntimeError('framepointer > -1' + " error: " + ("call stack underflow" || "unknown"));
    }

    var frame = callStack[framepointer];

    if (!(frame !== undefined)) {
      throw new _errors.RuntimeError('frame !== undefined' + " error: " + ("no frame at " + framepointer || "unknown"));
    }

    return frame;
  }

  var offsets = Object.keys(program);
  var pc = offsets.indexOf(String(offset));

  while (true) {
    var frame = getActiveStackFrame();
    var instruction = program[parseInt(offsets[pc])];

    if (!(instruction !== undefined)) {
      throw new _errors.RuntimeError('instruction !== undefined' + " error: " + ("no instruction at pc ".concat(pc, " in frame ").concat(framepointer) || "unknown"));
    }

    if (typeof frame.trace === "function") {
      frame.trace(framepointer, pc, instruction, frame);
    }

    pc++;

    switch (instruction.type) {
      case "InternalEndAndReturn":
        {
          if (frame.returnAddress !== -1) {
            pc = frame.returnAddress; // raw goto

            var activeFrame = getActiveStackFrame(); // pass the result of the previous call into the new active fame

            var res = void 0;

            if (activeFrame.values.length > 0) {
              res = pop1(activeFrame);
            } // Pop active frame from the stack


            callStack.pop();
            framepointer--;
            var newStackFrame = getActiveStackFrame();

            if (res !== undefined && newStackFrame !== undefined) {
              pushResult(newStackFrame, res);
            }

            break;
          } else {
            var activeFrame = getActiveStackFrame();

            if (activeFrame.values.length > 0) {
              return pop1(activeFrame);
            } else {
              return;
            }
          }
        }

      case "InternalGoto":
        {
          var target = instruction.target;
          pc = offsets.indexOf(String(target));
          break;
        }

      case "InternalCallExtern":
        {
          var _target = instruction.target; // 2. Assert: due to validation, F.module.funcaddrs[x] exists.

          var funcaddr = frame.originatingModule.funcaddrs[_target];

          if (typeof funcaddr === "undefined") {
            throw newRuntimeError("No function was found in module at address ".concat(_target));
          } // 3. Let a be the function address F.module.funcaddrs[x]


          var subroutine = frame.allocator.get(funcaddr);

          if (_typeof(subroutine) !== "object") {
            throw newRuntimeError("Cannot call function at address ".concat(funcaddr, ": not a function"));
          } // 4. Invoke the function instance at address a
          // FIXME(sven): assert that res has type of resultType


          var _subroutine$type = _slicedToArray(subroutine.type, 2),
              argTypes = _subroutine$type[0],
              resultType = _subroutine$type[1];

          var args = popArrayOfValTypes(frame, argTypes);

          if (!subroutine.isExternal) {
            throw new _errors.RuntimeError('subroutine.isExternal' + " error: " + (undefined || "unknown"));
          }

          var _res = subroutine.code(args.map(function (arg) {
            return arg.value;
          }));

          if (typeof _res !== "undefined") {
            pushResult(frame, castIntoStackLocalOfType(resultType, _res));
          }

          break;
        }
    }

    switch (instruction.id) {
      case "const":
        {
          // https://webassembly.github.io/spec/core/exec/instructions.html#exec-const
          // $FlowIgnore
          var _n2 = instruction.args[0];

          if (typeof _n2 === "undefined") {
            throw newRuntimeError("const requires one argument, none given.");
          }

          if (_n2.type !== "NumberLiteral" && _n2.type !== "LongNumberLiteral" && _n2.type !== "FloatLiteral") {
            throw newRuntimeError("const: unsupported value of type: " + _n2.type);
          }

          pushResult(frame, // $FlowIgnore
          castIntoStackLocalOfType(instruction.object, _n2.value));
          break;
        }

      /**
       * Control Instructions
       *
       * https://webassembly.github.io/spec/core/exec/instructions.html#control-instructions
       */

      case "nop":
        {
          // Do nothing
          // https://webassembly.github.io/spec/core/exec/instructions.html#exec-nop
          break;
        }

      case "drop":
        {
          // https://webassembly.github.io/spec/core/exec/instructions.html#exec-drop
          // 1. Assert: due to validation, a value is on the top of the stack.
          if (frame.values.length < 1) {
            throw new _errors.RuntimeError("Assertion error: expected " + JSON.stringify(1) + " on the stack, found " + frame.values.length);
          }

          // 2. Pop the value valval from the stack.
          pop1(frame);
          break;
        }

      case "call":
        {
          // FIXME(sven): check spec compliancy
          // $FlowIgnore
          var index = instruction.index.value;

          var stackframe = require("internal/deps/webassembly/interpreter/kernel/stackframe");

          var activeFrame = getActiveStackFrame();
          var newStackFrame = stackframe.createChildStackFrame(activeFrame, pc); // move active frame

          framepointer++;

          if (framepointer >= 300) {
            throw new _errors.RuntimeError("Maximum call stack depth reached");
          } // Push the frame on top of the stack


          callStack[framepointer] = newStackFrame;
          pc = offsets.indexOf(String(index));
          break;
        }

      case "end":
        {
          // 3. Assert: due to validation, the label L is now on the top of the stack.
          // 4. Pop the label from the stack.
          var found = false;
          var index = frame.values.slice(0).reverse().findIndex(function (_ref2) {
            var type = _ref2.type;
            return type === "label";
          }); // some expression like inittializer don't have labels currently, so this is
          // guarantee to fail
          // assertRuntimeError(index !== -1, "POP_LABEL: label not found")

          if (index !== -1) {
            var initialOrderIndex = frame.values.length - 1 - index;
            frame.values.splice(initialOrderIndex, 1);
          }

          break;
        }

      case "loop":
      case "block":
        {
          // https://webassembly.github.io/spec/core/exec/instructions.html#blocks
          // FIXME(sven): check spec compliancy
          var block = instruction; // 2. Enter the block instr∗ with label

          frame.labels.push({
            value: block,
            arity: 0,
            // $FlowIgnore
            id: block.label
          }); // $FlowIgnore

          pushResult(frame, label.createValue(block.label.value)); // $FlowIgnore

          break;
        }

      case "br":
        {
          // FIXME(sven): check spec compliancy
          // $FlowIgnore
          var _label = instruction.args[0]; // $FlowIgnore

          pc = offsets.indexOf(String(_label.value));
          break;
        }

      case "br_if":
        {
          // $FlowIgnore
          var _label2 = instruction.args[0]; // 1. Assert: due to validation, a value of type i32 is on the top of the stack.
          // 2. Pop the value ci32.const c from the stack.

          var c = pop1OfType(frame, "i32");

          if (c.value.eqz().isTrue() === false) {
            // 3. If c is non-zero, then
            // 3. a. Execute the instruction (br l).
            // $FlowIgnore
            pc = offsets.indexOf(String(_label2.value));
          } else {// 4. Else:
            // 4. a. Do nothing.
          }

          break;
        }

      /**
       * Administrative Instructions
       *
       * https://webassembly.github.io/spec/core/exec/runtime.html#administrative-instructions
       */

      case "unreachable": // https://webassembly.github.io/spec/core/exec/instructions.html#exec-unreachable

      case "trap":
        {
          // signalling abrupt termination
          // https://webassembly.github.io/spec/core/exec/runtime.html#syntax-trap
          throw createTrap();
        }

      case "local":
        {
          // $FlowIgnore
          var _instruction$args = _slicedToArray(instruction.args, 1),
              valtype = _instruction$args[0];

          if (valtype.name === "i64") {
            var init = castIntoStackLocalOfType(valtype.name, new _long.default(0, 0));
            frame.locals.push(init);
          } else {
            // $FlowIgnore
            var _init = castIntoStackLocalOfType(valtype.name, 0);

            frame.locals.push(_init);
          } // $FlowIgnore


          break;
        }

      /**
       * Memory Instructions
       *
       * https://webassembly.github.io/spec/core/exec/instructions.html#memory-instructions
       */

      case "get_local":
        {
          // https://webassembly.github.io/spec/core/exec/instructions.html#exec-get-local
          // $FlowIgnore
          var _index = instruction.args[0];

          if (typeof _index === "undefined") {
            throw newRuntimeError("get_local requires one argument, none given.");
          }

          if (_index.type === "NumberLiteral" || _index.type === "FloatLiteral") {
            getLocalByIndex(frame, _index.value);
          } else {
            throw newRuntimeError("get_local: unsupported index of type: " + _index.type);
          }

          break;
        }

      case "set_local":
        {
          // https://webassembly.github.io/spec/core/exec/instructions.html#exec-set-local
          // $FlowIgnore
          var _index2 = instruction.args[0];

          if (_index2.type === "NumberLiteral") {
            // WASM
            // 4. Pop the value val from the stack
            var val = pop1(frame); // 5. Replace F.locals[x] with the value val

            setLocalByIndex(frame, _index2.value, val);
          } else {
            throw newRuntimeError("set_local: unsupported index of type: " + _index2.type);
          }

          break;
        }

      case "tee_local":
        {
          // https://webassembly.github.io/spec/core/exec/instructions.html#exec-tee-local
          // $FlowIgnore
          var _index3 = instruction.args[0];

          if (_index3.type === "NumberLiteral") {
            // 1. Assert: due to validation, a value is on the top of the stack.
            // 2. Pop the value val from the stack.
            var _val = pop1(frame); // 3. Push the value valval to the stack.


            pushResult(frame, _val); // 4. Push the value valval to the stack.

            pushResult(frame, _val); // 5. Execute the instruction (set_local x).
            // 5. 4. Pop the value val from the stack

            var val2 = pop1(frame); // 5. 5. Replace F.locals[x] with the value val

            setLocalByIndex(frame, _index3.value, val2);
          } else {
            throw newRuntimeError("tee_local: unsupported index of type: " + _index3.type);
          }

          break;
        }

      case "set_global":
        {
          // https://webassembly.github.io/spec/core/exec/instructions.html#exec-set-global
          // $FlowIgnore
          var _index4 = instruction.args[0]; // 2. Assert: due to validation, F.module.globaladdrs[x] exists.
          // $FlowIgnore

          var globaladdr = frame.originatingModule.globaladdrs[_index4.value];

          if (typeof globaladdr === "undefined") {
            // $FlowIgnore
            throw newRuntimeError("Global address ".concat(_index4.value, " not found"));
          } // 4. Assert: due to validation, S.globals[a] exists.


          var globalinst = frame.allocator.get(globaladdr);

          if (_typeof(globalinst) !== "object") {
            throw newRuntimeError("Unexpected data for global at ".concat(globaladdr.toString()));
          } // 7. Pop the value val from the stack.


          var _val2 = pop1(frame); // 8. Replace glob.value with the value val.


          globalinst.value = _val2.value;
          frame.allocator.set(globaladdr, globalinst);
          break;
        }

      case "get_global":
        {
          // https://webassembly.github.io/spec/core/exec/instructions.html#exec-get-global
          // $FlowIgnore
          var _index5 = instruction.args[0]; // 2. Assert: due to validation, F.module.globaladdrs[x] exists.
          // $FlowIgnore

          var _globaladdr = frame.originatingModule.globaladdrs[_index5.value];

          if (typeof _globaladdr === "undefined") {
            throw newRuntimeError( // $FlowIgnore
            "Unknown global at index: ".concat(_index5.value.toString()));
          } // 4. Assert: due to validation, S.globals[a] exists.


          var _globalinst = frame.allocator.get(_globaladdr);

          if (_typeof(_globalinst) !== "object") {
            throw newRuntimeError("Unexpected data for global at ".concat(_globaladdr.toString()));
          } // 7. Pop the value val from the stack.


          pushResult(frame, _globalinst);
          break;
        }

      /**
       * Memory operations
       */
      // https://webassembly.github.io/spec/core/exec/instructions.html#exec-storen

      case "store":
      case "store8":
      case "store16":
      case "store32":
        {
          // $FlowIgnore
          var id = instruction.id,
              object = instruction.object;
          var memory = getMemory(frame); // $FlowIgnore

          var _pop = pop2(frame, "i32", object),
              _pop2 = _slicedToArray(_pop, 2),
              c1 = _pop2[0],
              c2 = _pop2[1];

          var ptr = c1.value.toNumber() + getMemoryOffset(frame, instruction);
          var valueBuffer = c2.value.toByteArray();

          switch (id) {
            case "store":
              break;

            case "store8":
              valueBuffer = valueBuffer.slice(0, 1);
              break;

            case "store16":
              valueBuffer = valueBuffer.slice(0, 2);
              break;

            case "store32":
              valueBuffer = valueBuffer.slice(0, 4);
              break;

            default:
              throw newRuntimeError("illegal operation: " + id);
          }

          if (ptr + valueBuffer.length > memory.buffer.byteLength) {
            throw newRuntimeError("memory access out of bounds");
          }

          var memoryBuffer = new Uint8Array(memory.buffer); // load / store use little-endian order

          for (var ptrOffset = 0; ptrOffset < valueBuffer.length; ptrOffset++) {
            memoryBuffer[ptr + ptrOffset] = valueBuffer[ptrOffset];
          }

          break;
        }
      // https://webassembly.github.io/spec/core/exec/instructions.html#and

      case "load":
      case "load16_s":
      case "load16_u":
      case "load8_s":
      case "load8_u":
      case "load32_s":
      case "load32_u":
        {
          // $FlowIgnore
          var _id = instruction.id,
              _object = instruction.object;

          var _memory = getMemory(frame);

          var _ptr = pop1OfType(frame, "i32").value.toNumber() + getMemoryOffset(frame, instruction); // for i32 / i64 ops, handle extended load


          var extend = 0; // for i64 values, increase the bitshift by 4 bytes

          var extendOffset = _object === "i32" ? 0 : 32;
          var signed = false;

          switch (_id) {
            case "load16_s":
              extend = 16 + extendOffset;
              signed = true;
              break;

            case "load16_u":
              extend = 16 + extendOffset;
              signed = false;
              break;

            case "load8_s":
              extend = 24 + extendOffset;
              signed = true;
              break;

            case "load8_u":
              extend = 24 + extendOffset;
              signed = false;
              break;

            case "load32_u":
              extend = 0 + extendOffset;
              signed = false;
              break;

            case "load32_s":
              extend = 0 + extendOffset;
              signed = true;
              break;
          } // check for memory access out of bounds


          switch (_object) {
            case "u32":
            case "i32":
            case "f32":
              {
                if (_ptr + 4 > _memory.buffer.byteLength) {
                  throw newRuntimeError("memory access out of bounds");
                }

                break;
              }

            case "i64":
            case "f64":
              {
                if (_ptr + 8 > _memory.buffer.byteLength) {
                  throw newRuntimeError("memory access out of bounds");
                }

                break;
              }

            default:
              // $FlowIgnore
              throw new _errors.RuntimeError("Unsupported " + _object + " load");
          }

          switch (_object) {
            case "i32":
            case "u32":
              pushResult(frame, i32.createValueFromArrayBuffer(_memory.buffer, _ptr, extend, signed));
              break;

            case "i64":
              pushResult(frame, i64.createValueFromArrayBuffer(_memory.buffer, _ptr, extend, signed));
              break;

            case "f32":
              pushResult(frame, f32.createValueFromArrayBuffer(_memory.buffer, _ptr));
              break;

            case "f64":
              pushResult(frame, f64.createValueFromArrayBuffer(_memory.buffer, _ptr));
              break;

            default:
              throw new _errors.RuntimeError("Unsupported " + _object + " load");
          }

          break;
        }

      /**
       * Binary operations
       */

      case "add":
      case "mul":
      case "sub":
      /**
       * There are two seperated operation for both signed and unsigned integer,
       * but since the host environment will handle that, we don't have too :)
       */

      case "div_s":
      case "div_u":
      case "rem_s":
      case "rem_u":
      case "shl":
      case "shr_s":
      case "shr_u":
      case "rotl":
      case "rotr":
      case "div":
      case "min":
      case "max":
      case "copysign":
      case "or":
      case "xor":
      case "and":
        {
          var binopFn = void 0; // $FlowIgnore

          switch (instruction.object) {
            case "i32":
              binopFn = binopi32;
              break;

            case "i64":
              binopFn = binopi64;
              break;

            case "f32":
              binopFn = binopf32;
              break;

            case "f64":
              binopFn = binopf64;
              break;

            default:
              throw createTrap("Unsupported operation " + instruction.id + " on " + // $FlowIgnore
              instruction.object);
          }

          var _pop3 = pop2(frame, instruction.object, instruction.object),
              _pop4 = _slicedToArray(_pop3, 2),
              _c = _pop4[0],
              _c2 = _pop4[1]; // $FlowIgnore


          pushResult(frame, binopFn(_c, _c2, instruction.id));
          break;
        }

      /**
       * Comparison operations
       */

      case "eq":
      case "ne":
      case "lt_s":
      case "lt_u":
      case "le_s":
      case "le_u":
      case "gt":
      case "gt_s":
      case "gt_u":
      case "ge_s":
      case "ge_u":
        {
          // $FlowIgnore
          var _pop5 = pop2(frame, instruction.object, instruction.object),
              _pop6 = _slicedToArray(_pop5, 2),
              _c3 = _pop6[0],
              _c4 = _pop6[1]; // $FlowIgnore


          pushResult(frame, compare(_c3, _c4, instruction.id));
          break;
        }

      /**
       * Unary operations
       */

      case "abs":
      case "neg":
      case "clz":
      case "ctz":
      case "popcnt":
      case "eqz":
      case "reinterpret/f32":
      case "reinterpret/f64":
        {
          var unopFn = void 0; // for conversion operations, the operand type appears after the forward-slash
          // e.g. with i32.reinterpret/f32, the oprand is f32, and the resultant is i32

          var opType = instruction.id.indexOf("/") !== -1 ? // $FlowIgnore
          instruction.id.split("/")[1] : // $FlowIgnore
          instruction.object;

          switch (opType) {
            case "i32":
              unopFn = unopi32;
              break;

            case "i64":
              unopFn = unopi64;
              break;

            case "f32":
              unopFn = unopf32;
              break;

            case "f64":
              unopFn = unopf64;
              break;

            default:
              throw createTrap( // $FlowIgnore
              "Unsupported operation " + instruction.id + " on " + opType);
          }

          var _c5 = pop1OfType(frame, opType); // $FlowIgnore


          pushResult(frame, unopFn(_c5, instruction.id));
          break;
        }

      case "return":
        {
          if (frame.returnAddress !== -1) {
            pc = frame.returnAddress; // raw goto

            var activeFrame = getActiveStackFrame();
            var res = void 0;

            if (activeFrame.values.length > 0) {
              res = pop1(activeFrame);
            }

            callStack.pop();
            framepointer--;
            var newStackFrame = getActiveStackFrame();

            if (res !== undefined && newStackFrame !== undefined) {
              pushResult(newStackFrame, res);
            }
          }

          var activeFrame = getActiveStackFrame();

          if (activeFrame.values.length > 0) {
            return pop1(activeFrame);
          } else {
            return;
          }
        }
    }
  }
}