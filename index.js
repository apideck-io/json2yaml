(function () {
  "use strict";

  var typeOf = require('remedial').typeOf,
    maxText = 60,
    wrap = require('wordwrap')(maxText);

  function stringify(data) {
    var handlers, indentLevel = '';
    const depth = 0

    handlers = {
      "undefined": function () {
        // objects will not have `undefined` converted to `null`
        // as this may have unintended consequences
        // For arrays, however, this behavior seems appropriate
        return 'null';
      },
      "null": function () {
        return 'null';
      },
      "number": function (x) {
        return x;
      },
      "boolean": function (x) {
        return x ? 'true' : 'false';
      },
      "string": function (x) {
        var output = '|';
        if (x.length <= maxText && x.indexOf('\n') === -1) {
          return JSON.stringify(x);
        }
        var text = wrap(x).split(/\\n|\n/);
        indentLevel = indentLevel.replace(/$/, '  ');
        text.forEach(function (y) {
          output += '\n' + indentLevel + y;

        });
        indentLevel = indentLevel.replace(/  /, '');

        return output;
      },
      "date": function (x) {
        return x.toJSON();
      },
      "array": function (x) {
        var output = '';

        if (0 === x.length) {
          output += '[]';
          return output;
        }

        indentLevel = indentLevel.replace(/$/, '  ');
        x.forEach(function (y) {
          // TODO how should `undefined` be handled?
          var handler = handlers[typeOf(y)];

          if (!handler) {
            throw new Error('what the crap: ' + typeOf(y));
          }

          output += '\n' + indentLevel + '- ' + handler(y);

        });
        indentLevel = indentLevel.replace(/  /, '');

        return output;
      },
      "object": function (x, depth) {
        depth++
        var output = '';

        if (0 === Object.keys(x).length) {
          output += '{}';
          return output;
        }

        indentLevel = indentLevel.replace(/$/, depth === 1 ? '' : '  ');
        Object.keys(x).forEach(function (k) {
          var val = x[k],
            handler = handlers[typeOf(val)];

          if ('undefined' === typeof val) {
            // the user should do
            // delete obj.key
            // and not
            // obj.key = undefined
            // but we'll error on the side of caution
            return;
          }

          if (!handler) {
            throw new Error('what the crap: ' + typeOf(val));
          }

          if (isNaN(k)) {
            output += '\n' + indentLevel + k + ': ' + handler(val);
          } else {
            output += '\n' + indentLevel + `"${k.toString()}"` + ': ' + handler(val);
          }
        });
        indentLevel = indentLevel.replace(/  /, '');

        return output;
      },
      "function": function () {
        // TODO this should throw or otherwise be ignored
        return '[object Function]';
      }
    };

    const output = '---' + handlers[typeOf(data)](data, depth) + '\n';
    var lines = output.split('\n');
    lines.splice(0,1);
    var newtext = lines.join('\n');

    return newtext
  }

  module.exports.stringify = stringify;
}());
