'use strict';

var exec = require('child_process').exec;

// Название ключницы
var KEYCHAIN = 'arduino_mac_unlocker';

function _exec(command, errorCallback, successCallback) {
    exec(command, function(error, stdout, stderr) {
        if (error || stderr && !stdout) {
            var message = stderr.replace(/.*security:.*SecKeychain.*: /, '');
            errorCallback && errorCallback(error, message);
        } else {
            successCallback && successCallback(stdout);
        }
    });
}

module.exports = {
    isLocked: function(callback) {
        exec('ps aux | grep ScreenSaverEngine.app | grep -vc grep', function (error, stdout, stderr) {
            callback(parseInt(stdout, 10) > 0);
        });
    },

    lock: function() {
        exec('open -a /System/Library/Frameworks/ScreenSaver.framework/Versions/Current/Resources/ScreenSaverEngine.app');
    },

    unlock: function() {
        _exec(
            'security -q find-generic-password -w -a ' + KEYCHAIN,
            function(error, message) {
                console.warn(message);
            },
            function(result) {
                exec('osascript -e \'tell application "System Events"\' -e \'key code 56\' -e \'delay 0.5\' -e \'keystroke "' + result + '"\' -e \'key code 36\' -e \'end tell\'');
            }
        );
    },

    savePassword: function(password, callback, noDelete) {
        _exec(
            'security -q add-generic-password -a "' + KEYCHAIN + '" -s "Unlocker password" -w "' + password + '" -T "/usr/bin/security"',
            function(error, message) {
                if (noDelete) {
                    callback(false);
                } else {
                    this.deletePassword(this.savePassword.bind(this, password, callback, true));
                }
            }.bind(this),
            function(result) {
                callback && callback(true);
            }
        );
    },

    deletePassword: function(successCallback) {
        _exec('security -q delete-generic-password -a ' + KEYCHAIN, null, successCallback);
    },

    hasPassword: function(callback) {
        _exec(
            'security -q find-generic-password -w -a ' + KEYCHAIN,
            callback.bind(null, false),
            callback.bind(null, true)
        );
    },

    toggleLock: function() {
        this.isLocked(function(status) {
            status ? this.unlock() : this.lock();
        }.bind(this));
    }
};
