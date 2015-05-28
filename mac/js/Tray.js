'use strict';

var console = global.window.console;
var gui = global.window.nwDispatcher.requireNwGui();

var _tray;
var _settingsWindow;
var _settingsOpenedHandler;
var _settingsClosedHandler;

function _exitClickHandler() {
    gui.App.quit();
}

function _settingsClickHandler() {
    if (_settingsWindow && !_settingsWindow.closed) {
        _settingsWindow.focus();
        return false;
    }
    _settingsWindow = gui.Window.open('settings.html', {
        toolbar: false,
        resizable: false,
        show: true,
        height: 383,
        width: 394
    });
    _settingsWindow.on('document-end', function() {
        _settingsWindow.focus();
        _settingsOpenedHandler && _settingsOpenedHandler();
    });
    _settingsWindow.on('closed', function() {
        _settingsWindow = null;
        _settingsClosedHandler && _settingsClosedHandler();
    });
}

module.exports = {
    create: function() {
        var menu = new gui.Menu();

        menu.append(new gui.MenuItem({
            type: 'normal',
            label: 'Настройки',
            click: _settingsClickHandler
        }));

        menu.append(new gui.MenuItem({
            type: 'separator'
        }));

        menu.append(new gui.MenuItem({
            type: 'normal',
            label: 'Выход',
            click: _exitClickHandler
        }));

        _tray = new gui.Tray({
            title: '',
            icon: 'img/lock_error.png',
            iconsAreTemplates: false,
            alticon: '',
            tooltip: window.document.title,
            menu: menu
        });
    },

    setIconNormal: function() {
        _tray.icon = 'img/lock.png';
    },

    setIconError: function() {
        _tray.icon = 'img/lock_error.png';
    },

    onSettingsOpened: function(callback) {
        _settingsOpenedHandler = callback;
    },

    onSettingsClosed: function(callback) {
        _settingsClosedHandler = callback;
    }
};
