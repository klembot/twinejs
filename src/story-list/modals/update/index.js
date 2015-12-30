'use strict';
var locale = require('../../../locale');
var confirm = require('../../../ui/modal/confirm');
var data = require('../../../data');
var TwineApp = require('../../../common/app');

module.exports = {
  /**
    How often we check for a new version of Twine, in milliseconds.

    @property UPDATE_CHECK_DELAY
    @final
  **/
  CHECK_INTERVAL: 1000 * 60 * 60 * 24, // 1 day

  check: function() {
    var now = new Date().getTime();
    var currentBuild = TwineApp.version().buildNumber;
    var lastUpdateSeenPref = data.pref('lastUpdateSeen', currentBuild);

    // Force last update to be at least the current app version

    if (lastUpdateSeenPref.get('value') < currentBuild) {
      lastUpdateSeenPref.save({ value: currentBuild });
    }

    var lastUpdateCheckPref = data.pref('lastUpdateCheckTime', now);

    if (now > lastUpdateCheckPref.get('value') + this.CHECK_INTERVAL) {
      TwineApp.checkForUpdate(lastUpdateSeenPref.get('value'), function(data) {
        lastUpdateSeenPref.save({ value: data.buildNumber });

        // L10n: %1$s will have a version number, i.e. 2.0.6,
        // interpolated into it.
        var message = locale.say(
          'A new version of Twine, %1$s, has been released.',
          data.version
        );

        confirm({
          confirmLabel:
            '<i class="fa fa-download"></i> ' + locale.say('Download'),
          cancelLabel: locale.say('Not Right Now'),
          content: message,
          callback: function(confirmed) {
            if (confirmed) {
              window.open(data.url, '_blank');
            }
          },
        });
      });
    }
  },
};
