;(function() {
// takes a raw input and determines its
// primitive type.  Outputs all input as a string.
var condition, color_select, format, expectation, mainjs;
condition = function () {
  
  function condition(blob) {
    var type = typeof blob;
    switch (type) {
    case 'number' || 'boolean' || 'function':
      blob = blob.toString();
      break;
    case 'object':
      type = blob instanceof Array ? 'array' : 'object';
      type = blob !== null ? type : 'null';
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
}();
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
expectation = function () {
  
  function Expectation(thing) {
    this.toEqual = function (otherThing) {
      if (thing === otherThing) {
        return true;
      }
      return false;
    };
    return this;
  }
  return Expectation;
}();
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
      console.log(logPart[0], logPart[1]);
      if (opts.log) {
        console.log(blob);
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
      return new Expectation(thing);
    };
    return this;
  }
  return Xcon.call(window.console);
}(format, expectation);
}());