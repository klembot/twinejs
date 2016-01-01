/**
  //prefix-trigger

  This module adds an option to CodeMirror which  automatically triggers a
  function when typing a word that is prefixed by certain text. We use this to
  automatically pop open the autocomplete when the user is probably typing a
  passage name.

  The format of options to this option is:

  - `prefixes`: an array of strings that will trigger the callback,
                case-sensitive
  - `callback`: the function that will be called
**/

'use strict';
var CodeMirror = require('codemirror');

module.exports = {
  /**
    Attaches the trigger to CodeMirror.
    @method initialize
  **/
  initialize: function() {
    CodeMirror.defineOption('prefixTrigger', [], function(cm, opts) {
      if (opts.prefixes && opts.callback) {
        cm.on('inputRead', checkTrigger);
      } else {
        cm.off('inputRead', checkTrigger);
      }

      var prefixes = opts.prefixes;
      var callback = opts.callback;

      function checkTrigger(cm) {
        // If autocomplete is already active, stop.

        if (cm.state.completionActive) {
          return;
        }

        // Back up two words from the current cursor position.

        var curWord = cm.findWordAt(cm.getDoc().getCursor());
        curWord.anchor.ch--;
        var prevWordRange = cm.findWordAt(curWord.anchor);
        var prevWord = cm.getRange(prevWordRange.anchor, prevWordRange.head);

        // Do any of the words match?

        for (var i = prefixes.length; i >= 0; i--) {
          if (prevWord == prefixes[i]) {
            callback();

            // Ensure we only call the callback once.

            return;
          }
        }
      }
    });
  },
};
