;(function() {
var get_type, condition, color_select, format, is_equal, expectation, mainjs;
get_type = function () {
  
  function getType(blob) {
    var type = typeof blob;
    if (blob === void 0) {
      type = 'undefined';
    }
    if (type === 'object') {
      type = blob instanceof Array ? 'array' : 'object';
      type = blob !== null ? type : 'null';
    }
    return type;
  }
  return getType;
}();
// takes a raw input and determines its
// primitive type.  Outputs all input as a string.
condition = function (getType) {
  
  function condition(blob) {
    var type = getType(blob);
    switch (type) {
    case 'number':
    case 'boolean':
    case 'function':
      blob = blob.toString();
      break;
    case 'object':
    case 'array':
    case 'null':
      blob = JSON.stringify(blob);
      break;
    case 'undefined':
      blob = 'undefined';
      break;
    }
    return {
      'type': type,
      'text': blob
    };
  }
  return condition;
}(get_type);
// returns a random color to improve contrast between
// adjacent .out logs.  Colors should be non-red and
// non-green to differentiate between .run() and .out()
// logs.
color_select = function () {
  
  function colorSelect() {
    var outColors = [
        'blue',
        'darkgray',
        'black',
        'darkorange',
        'chocolate',
        'brown',
        'darkmagenta',
        'darkgoldenrod',
        'darkslateblue',
        'dimgray',
        'indigo',
        'maroon',
        'midnightblue',
        'navy',
        'purple',
        'royalblue',
        'sienna',
        'saddlebrown',
        'slateblue',
        'slategray',
        'teal',
        'steelblue'
      ], random = Math.floor(Math.random() * outColors.length), color = outColors[random];
    if (color === colorSelect.last) {
      colorSelect();
    } else {
      colorSelect.last = color;
      return color;
    }
  }
  colorSelect.last = null;
  return colorSelect;
}();
// formats a log message with options
// to be passed to the .out method
format = function (condition, colorSelect) {
  
  function format(blob, opts) {
    opts = opts || {};
    var logMessage, logParams, props = condition(blob), type = props.type, text = props.text || '', color = opts.color || colorSelect(), fontWeight = opts.fnName ? 'bold' : 'normal';
    type = opts.error ? 'error' : type;
    type = opts.fnName ? opts.fnName + '(' + opts.fnArgs + ') returns ' + type : type;
    logMessage = '%c' + type + ':\n' + text;
    logParams = 'color:' + color + ';font-weight:' + fontWeight;
    return [
      logMessage,
      logParams
    ];
  }
  return format;
}(condition, color_select);
// based on a solution by Ebrahim Byagowi.  Original code can be found at:
// http://stackoverflow.com/questions/201183/how-to-determine-equality-for-two-javascript-objects/16788517#16788517
is_equal = function () {
  
  function isEqual(thing, otherThing) {
    if (thing instanceof Function) {
      if (otherThing instanceof Function) {
        return thing.toString() === otherThing.toString();
      }
      return false;
    }
    if (thing === null || thing === void 0 || otherThing === null || otherThing === void 0) {
      return thing === otherThing;
    }
    if (thing === otherThing || thing.valueOf() === otherThing.valueOf()) {
      return true;
    }
    // if one of them is date, they must had equal valueOf
    if (thing instanceof Date || otherThing instanceof Date) {
      return false;
    }
    // if they are not function or strictly equal, they both need to be Objects
    if (!(thing instanceof Object) || !(otherThing instanceof Object)) {
      return false;
    }
    var thingKeys = Object.keys(thing), otherKeys = Object.keys(otherThing), equal = otherKeys.every(function (key) {
        return thingKeys.indexOf(key) !== -1;
      }) && thingKeys.every(function (key) {
        return isEqual(thing[key], otherThing[key]);
      });
    return equal;
  }
  return isEqual;
}();
expectation = function (isEqual) {
  
  function Expectation(thing, opts) {
    opts = opts || {};
    var not = opts.not || false;
    this.message = '';
    this.toEqual = function (otherThing) {
      var result = isEqual(thing, otherThing);
      result = not ? !result : result;
      return result;
    };
    this.toBeTruthy = function () {
      var result = not ? !thing : !!thing;
      return result;
    };
    this.toBeFalsy = function () {
      var result = not ? !!thing : !thing;
      return result;
    };
    this.toBeDefined = function () {
      var result = not ? thing === void 0 : thing !== void 0;
      return result;
    };
    return this;
  }
  return Expectation;
}(is_equal);
mainjs = function (format, Expectation) {
  
  function Xcon() {
    // skins a console.log message to display the primitive type as well
    // as the expected output of a vanilla .log() command
    // opts: {
    //     "color": "#f9f9f9", // specify a css color
    //     "log": true // also calls native console.log, which is useful for large objects and arrays
    // }
    // sometimes this function is called from console.run() to output
    // function return values.  In that case,
    // opts: {
    //     "color": "darkgreen", // or red
    //     "fnName": "nameOfFunction",
    //     "fnArgs": "all passed arguments",
    //     "error": true // indicates a thrown error
    // }
    this.out = this.out || function (blob, opts) {
      opts = opts || {};
      var logPart = format(blob, opts);
      this.log(logPart[0], logPart[1]);
      if (opts.log) {
        this.log(blob);
      }
    };
    // given a function, calls that function, returns the output,
    // and calls .out() to skin the output in green (success)
    // or red (failure).  Arguments, function name, and any error
    // messages are logged.
    this.run = this.run || function (fn, args, context) {
      if (typeof fn !== 'function') {
        this.out(arguments[0], arguments[1]);
        return arguments[0];
      }
      context = context || this;
      args = args || [];
      var result, opts = {
          'fnName': fn.name || 'anonymous function',
          'fnArgs': args.toString()
        };
      try {
        result = fn.apply(context, args);
        opts.color = 'darkgreen';
        this.out(result, opts);
        return result;
      } catch (e) {
        opts.color = 'red';
        opts.error = true;
        this.out(e.message, opts);
      }
    };
    this.expect = this.expect || function (thing) {
      var expect = new Expectation(thing);
      expect.not = new Expectation(thing, { 'not': true });
      return expect;
    };
    return this;
  }
  return Xcon.call(window.console);
}(format, expectation);
}());