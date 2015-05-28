'use strict';

var Tray = require('./js/Tray');
var Unlocker = require('./js/Unlocker');
var Mac = require('./js/Mac');

var _reconnectionTimeout = null;

function _reconfigure() {
    Unlocker.onConnected(function() {
        clearTimeout(_reconnectionTimeout);
        Tray.setIconNormal();
    });

    Unlocker.onConnectionLost(function() {
        Tray.setIconError();
        _reconnectionTimeout = setTimeout(Unlocker.connect, 1000);
    });

    Unlocker.onKey(function(key, valid) {
        if (valid) {
            console.log('Valid key');
            Mac.toggleLock();
        } else {
            console.log('Invalid key');
        }
    });
}

// Create tray icon
Tray.create();

// Setup tray
Tray.onSettingsOpened(function() {
    clearTimeout(_reconnectionTimeout);
});

Tray.onSettingsClosed(_reconfigure);

// Setup unlocker
_reconfigure();

// Connect
Unlocker.connect();