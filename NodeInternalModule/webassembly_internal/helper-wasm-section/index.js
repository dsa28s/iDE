"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "resizeSectionByteSize", {
  enumerable: true,
  get: function get() {
    return _resize.resizeSectionByteSize;
  }
});
Object.defineProperty(exports, "resizeSectionVecSize", {
  enumerable: true,
  get: function get() {
    return _resize.resizeSectionVecSize;
  }
});
Object.defineProperty(exports, "createEmptySection", {
  enumerable: true,
  get: function get() {
    return _create.createEmptySection;
  }
});
Object.defineProperty(exports, "removeSections", {
  enumerable: true,
  get: function get() {
    return _remove.removeSections;
  }
});

var _resize = require("internal/deps/webassembly_internal/helper-wasm-section/resize");

var _create = require("internal/deps/webassembly_internal/helper-wasm-section/create");

var _remove = require("internal/deps/webassembly_internal/helper-wasm-section/remove");