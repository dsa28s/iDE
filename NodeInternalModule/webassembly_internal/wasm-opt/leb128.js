"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shrinkPaddedLEB128 = shrinkPaddedLEB128;

var _ast = require("internal/deps/webassembly_internal/ast/index");

var _encoder = require("internal/deps/webassembly_internal/wasm-gen/encoder/index");

var _helperBuffer = require("internal/deps/webassembly_internal/helper-buffer/index");

function shiftFollowingSections(ast, _ref, deltaInSizeEncoding) {
  var section = _ref.section;
  // Once we hit our section every that is after needs to be shifted by the delta
  var encounteredSection = false;
  (0, _ast.traverse)(ast, {
    SectionMetadata: function SectionMetadata(path) {
      if (path.node.section === section) {
        encounteredSection = true;
        return;
      }

      if (encounteredSection === true) {
        (0, _ast.shiftSection)(ast, path.node, deltaInSizeEncoding);
      }
    }
  });
}

function shrinkPaddedLEB128(ast, uint8Buffer) {
  (0, _ast.traverse)(ast, {
    SectionMetadata: function SectionMetadata(_ref2) {
      var node = _ref2.node;

      /**
       * Section size
       */
      {
        var newu32Encoded = (0, _encoder.encodeU32)(node.size.value);
        var newu32EncodedLen = newu32Encoded.length;
        var start = node.size.loc.start.column;
        var end = node.size.loc.end.column;
        var oldu32EncodedLen = end - start;

        if (newu32EncodedLen !== oldu32EncodedLen) {
          var deltaInSizeEncoding = oldu32EncodedLen - newu32EncodedLen;
          uint8Buffer = (0, _helperBuffer.overrideBytesInBuffer)(uint8Buffer, start, end, newu32Encoded);
          shiftFollowingSections(ast, node, -deltaInSizeEncoding);
        }
      }
    }
  });
  return uint8Buffer;
}