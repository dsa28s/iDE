"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createValueFromAST = createValueFromAST;
exports.createValue = createValue;
exports.createValueFromArrayBuffer = createValueFromArrayBuffer;
exports.i64 = void 0;

var _long = _interopRequireDefault(require("internal/deps/long/index"));

var _i = require("internal/deps/webassembly/interpreter/runtime/values/i32");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require("internal/deps/webassembly/errors"),
    RuntimeError = _require.RuntimeError; // eslint-disable-next-line no-unused-vars


var type = "i64";

var i64 =
/*#__PURE__*/
function () {
  function i64(value) {
    _classCallCheck(this, i64);

    if (!(value instanceof _long.default)) {
      throw new Error('value instanceof Long' + " error: " + (undefined || "unknown"));
    }

    this._value = value;
  }

  _createClass(i64, [{
    key: "add",
    value: function add(operand) {
      return new i64(this._value.add(operand._value));
    }
  }, {
    key: "sub",
    value: function sub(operand) {
      return new i64(this._value.sub(operand._value));
    }
  }, {
    key: "mul",
    value: function mul(operand) {
      return new i64(this._value.mul(operand._value));
    }
  }, {
    key: "div_s",
    value: function div_s(operand) {
      {
        if (operand._value.isZero()) {
          throw new RuntimeError("integer divide by zero");
        }
      }
      return new i64(this._value.div(operand._value));
    }
  }, {
    key: "div_u",
    value: function div_u(operand) {
      {
        if (operand._value.isZero()) {
          throw new RuntimeError("integer divide by zero");
        }
      }
      return new i64(this._value.div(operand._value));
    }
  }, {
    key: "div",
    value: function div(operand) {
      return new i64(this._value.div(operand._value));
    }
  }, {
    key: "and",
    value: function and(operand) {
      return new i64(this._value.and(operand._value));
    }
  }, {
    key: "or",
    value: function or(operand) {
      return new i64(this._value.or(operand._value));
    }
  }, {
    key: "xor",
    value: function xor(operand) {
      return new i64(this._value.xor(operand._value));
    }
  }, {
    key: "equals",
    value: function equals(operand) {
      return this._value.equals(operand._value);
    }
  }, {
    key: "isZero",
    value: function isZero() {
      return this._value.low == 0 && this._value.high == 0;
    }
  }, {
    key: "abs",
    value: function abs() {
      if (this._value.isNegative()) {
        // make it positive
        return this._value.mul(-1);
      }

      return this;
    }
  }, {
    key: "copysign",
    value: function copysign() {
      throw new RuntimeError("Unsupported operation: copysign");
    }
  }, {
    key: "max",
    value: function max(operand) {
      if (this._value.lessThan(operand) === true) {
        return operand;
      } else {
        return this;
      }
    }
  }, {
    key: "min",
    value: function min(operand) {
      if (this._value.lessThan(operand) === true) {
        return this;
      } else {
        return operand;
      }
    }
  }, {
    key: "neg",
    value: function neg() {
      return this._value.neg();
    }
  }, {
    key: "lt_s",
    value: function lt_s(operand) {
      return this._value.toSigned().lt(operand._value.toSigned()) ? (0, _i.createTrue)() : (0, _i.createFalse)();
    }
  }, {
    key: "lt_u",
    value: function lt_u(operand) {
      return this._value.toUnsigned().lt(operand._value.toUnsigned()) ? (0, _i.createTrue)() : (0, _i.createFalse)();
    }
  }, {
    key: "le_s",
    value: function le_s(operand) {
      return this._value.toSigned().lte(operand._value.toSigned()) ? (0, _i.createTrue)() : (0, _i.createFalse)();
    }
  }, {
    key: "le_u",
    value: function le_u(operand) {
      return this._value.toUnsigned().lte(operand._value.toUnsigned()) ? (0, _i.createTrue)() : (0, _i.createFalse)();
    }
  }, {
    key: "gt_s",
    value: function gt_s(operand) {
      return this._value.toSigned().gt(operand._value.toSigned()) ? (0, _i.createTrue)() : (0, _i.createFalse)();
    }
  }, {
    key: "gt_u",
    value: function gt_u(operand) {
      return this._value.toUnsigned().gt(operand._value.toUnsigned()) ? (0, _i.createTrue)() : (0, _i.createFalse)();
    }
  }, {
    key: "ge_s",
    value: function ge_s(operand) {
      return this._value.toSigned().gte(operand._value.toSigned()) ? (0, _i.createTrue)() : (0, _i.createFalse)();
    }
  }, {
    key: "ge_u",
    value: function ge_u(operand) {
      return this._value.toUnsigned().gte(operand._value.toUnsigned()) ? (0, _i.createTrue)() : (0, _i.createFalse)();
    }
  }, {
    key: "rem_s",
    value: function rem_s(operand) {
      {
        if (operand._value.isZero()) {
          throw new RuntimeError("integer divide by zero");
        }
      }
      return new i64(this._value.rem(operand._value));
    }
  }, {
    key: "rem_u",
    value: function rem_u(operand) {
      {
        if (operand._value.isZero()) {
          throw new RuntimeError("integer divide by zero");
        }
      }
      return new i64(this._value.rem(operand._value));
    }
  }, {
    key: "shl",
    value: function shl(operand) {
      return new i64(this._value.shiftLeft(operand._value));
    }
  }, {
    key: "shr_s",
    value: function shr_s(operand) {
      return new i64(this._value.shiftRight(operand._value));
    }
  }, {
    key: "shr_u",
    value: function shr_u(operand) {
      return new i64(this._value.shiftRight(operand._value));
    }
  }, {
    key: "rotl",
    value: function rotl(rotation) {
      return new i64(this._value.rotateLeft(rotation._value));
    }
  }, {
    key: "rotr",
    value: function rotr(rotation) {
      return new i64(this._value.rotateRight(rotation._value));
    }
  }, {
    key: "clz",
    value: function clz() {
      var lead = 0;

      var str = this._value.toUnsigned().toString(2);

      for (var i = 0, len = str.length; i < len; i++) {
        if (str[i] !== "0") {
          break;
        }

        lead++;
      }

      return new i64(new _long.default(lead));
    }
  }, {
    key: "ctz",
    value: function ctz() {
      var count = 0;

      var str = this._value.toUnsigned().toString(2);

      for (var i = str.length; i <= 0; i--) {
        if (str[i] !== "0") {
          break;
        }

        count++;
      }

      return new i64(new _long.default(count));
    }
  }, {
    key: "popcnt",
    value: function popcnt() {
      var count = 0;

      var str = this._value.toUnsigned().toString(2);

      for (var i = str.length; i <= 0; i--) {
        if (str[i] !== "0") {
          count++;
        }
      }

      return new i64(new _long.default(count));
    }
  }, {
    key: "eqz",
    value: function eqz() {
      return this._value.isZero() ? (0, _i.createTrue)() : (0, _i.createFalse)();
    }
  }, {
    key: "eq",
    value: function eq(operand) {
      return this.equals(operand) ? (0, _i.createTrue)() : (0, _i.createFalse)();
    }
  }, {
    key: "ne",
    value: function ne(operand) {
      return new _i.i32(this.equals(operand) ? 0 : 1);
    }
  }, {
    key: "toString",
    value: function toString() {
      return this._value.toString();
    }
  }, {
    key: "toNumber",
    value: function toNumber() {
      return this._value.toNumber();
    }
  }, {
    key: "isTrue",
    value: function isTrue() {
      // https://webassembly.github.io/spec/core/exec/numerics.html#boolean-interpretation
      return this.toNumber() == 1;
    }
  }, {
    key: "toByteArray",
    value: function toByteArray() {
      var byteArray = new Array(8);

      for (var offset = 0, shift = 0; offset < byteArray.length; offset++, shift += 8) {
        byteArray[offset] = this._value.shru(shift).and(0xff).toNumber();
      }

      return byteArray;
    }
  }], [{
    key: "fromArrayBuffer",
    value: function fromArrayBuffer(buffer, ptr, extend, signed) {
      var slice = buffer.slice(ptr, ptr + 8);
      var value = new Int32Array(slice);
      var longVal = new _long.default(value[0], value[1]); // shift left, then shift right by the same number of bits, using
      // signed or unsigned shifts

      longVal = longVal.shiftLeft(extend);
      return new i64(signed ? longVal.shiftRight(extend) : longVal.shiftRightUnsigned(extend));
    }
  }]);

  return i64;
}();

exports.i64 = i64;

function createValueFromAST(value) {
  if (typeof value.low === "undefined" || typeof value.high === "undefined") {
    throw new Error("i64.createValueFromAST malformed value: " + JSON.stringify(value));
  }

  return {
    type: type,
    value: new i64(new _long.default(value.low, value.high))
  };
}

function createValue(value) {
  return {
    type: type,
    value: value
  };
}

function createValueFromArrayBuffer(buffer, ptr, extend, signed) {
  return {
    type: type,
    value: i64.fromArrayBuffer(buffer, ptr, extend, signed)
  };
}