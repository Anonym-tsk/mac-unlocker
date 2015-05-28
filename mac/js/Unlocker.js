'use strict';

var console = global.window.console;
var serialport = require('serialport');
var Storage = require('./Storage');

var _serial = null;
var _onDisconnectHandler;
var _onOpenHandler;
var _onKeyHandler;

function _isValidKey(key) {
    var keys = Storage.getKeys();
    for (var i = 0, l = keys.length; i < l; i++) {
        if (keys[i] === key) {
            return true;
        }
    }
    return false;
}

function _validKeyHandler() {
    // отправляем команду Arduino "мигнуть зелёным"
    _serial.write('M1F');
}

function _invalidKeyHandler() {
    // отправляем команду Arduino "мигнуть красным"
    _serial.write('M0F');
}

function _serialDataHandler(data) {
    var keyCode = data.match(/S([0-9]+)E/i);
    if (keyCode && keyCode[1]) {
        _serial.flush(function() {
            var isValid = _isValidKey(keyCode[1]);
            isValid ? _validKeyHandler() : _invalidKeyHandler();
            _onKeyHandler && _onKeyHandler(keyCode[1], isValid);
        });
    }
}

function _serialOpenHandler() {
    console.log('Connection opened');

    _serial.on('data', _serialDataHandler);
    _onOpenHandler && _onOpenHandler();
}

function _serialCloseHandler() {
    console.log('Connection closed');

    _onDisconnectHandler && _onDisconnectHandler();
}

module.exports = {
    connect: function() {
        var port = Storage.getPort();
        if (port) {
            _serial = new serialport.SerialPort(port, {
                baudrate: 115200,
                parser: serialport.parsers.readline('\n', 'utf8')
            });
            _serial.on('open', _serialOpenHandler);
            _serial.on('close', _serialCloseHandler);
            _serial.on('error', _serialCloseHandler);
        }
    },

    disconnect: function(callback) {
        if (_serial && _serial.isOpen()) {
            _serial.removeAllListeners('open');
            _serial.removeAllListeners('close');
            _serial.removeAllListeners('error');
            _serial.removeAllListeners('data');
            _serial.close(function () {
                console.log('Disconnected');

                _serial = null;
                callback && callback();
            });
        } else if (callback) {
            callback();
        }
    },

    onConnected: function(callback) {
        _onOpenHandler = callback;
    },

    onConnectionLost: function(callback) {
        _onDisconnectHandler = callback;
    },

    onKey: function(callback) {
        _onKeyHandler = callback;
    }
};
