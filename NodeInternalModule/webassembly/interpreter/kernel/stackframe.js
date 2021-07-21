"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStackFrame = createStackFrame;
exports.createChildStackFrame = createChildStackFrame;

function createStackFrame(locals, originatingModule, allocator) {
  return {
    locals: locals,
    globals: [],

    /**
     * Labels are named block of code.
     * We maintain a map to access the block for a given identifier.
     *
     * https://webassembly.github.io/spec/core/exec/runtime.html#labels
     */
    labels: [],

    /**
     * Local applicatif Stack for the current stackframe.
     *
     * https://webassembly.github.io/spec/core/exec/runtime.html#stack
     */
    values: [],

    /**
     * We keep a reference to its originating module.
     *
     * When we need to lookup a function by addr for example.
     */
    originatingModule: originatingModule,

    /**
     * For shared memory operations
     */
    allocator: allocator,

    /**
     * The callee address
     */
    returnAddress: -1
  };
}

function createChildStackFrame(parent, pc) {
  var locals = parent.locals,
      originatingModule = parent.originatingModule,
      allocator = parent.allocator,
      trace = parent.trace;
  var frame = createStackFrame(locals, originatingModule, allocator);
  frame.trace = trace;
  frame.returnAddress = pc;
  return frame;
}