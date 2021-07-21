"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "decode", {
  enumerable: true,
  get: function get() {
    return _decoder.decode;
  }
});
Object.defineProperty(exports, "encode", {
  enumerable: true,
  get: function get() {
    return _encoder.encode;
  }
});

var _decoder = require("internal/deps/webassembly_internal/utf8/decoder");

var _encoder = require("internal/deps/webassembly_internal/utf8/encoder");