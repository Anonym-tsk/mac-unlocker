'use strict';

var console = global.window.console;
var serialport = require('serialport');
var Storage = require('./js/Storage');
var Unlocker = require('./js/Unlocker');
var Tray = require('./js/Tray');
var Mac = require('./js/Mac');

function $(parent, selector) {
    if (!selector) {
        selector = parent;
        parent = document;
    }
    return parent.querySelector(selector);
}

document.addEventListener('DOMContentLoaded', function() {

    /********************** Порты *******************/

    var $portSection = $('.ports'),
        $portEmpty = $($portSection, '.port-empty'),
        $portSelect = $($portSection, '.port-select'),
        $portSuccess = $($portSection, '.port-message.success'),
        $portError = $($portSection, '.port-message.error');

    function _createPort(port) {
        var currentPort = Storage.getPort();

        $portEmpty.style.display = 'none';
        $portSelect.style.display = 'block';

        var $option = document.createElement('option');
        $option.value = port.comName;
        $option.textContent = port.comName + (port.manufacturer ? ' - ' + port.manufacturer : '');
        $option.selected = currentPort && currentPort === port.comName;

        $portSelect.appendChild($option);
    }

    // Выбор порта
    $portSelect.addEventListener('change', function() {
        Storage.setPort($portSelect.value);
        Unlocker.disconnect(Unlocker.connect);
    });

    // Инициализация портов
    serialport.list(function(err, ports) {
        if (!err) {
            ports.forEach(function(port) {
                _createPort(port);
            });
        }
    });


    /***************** Пароль разблокировки *****************/

    var $keychainSection = $('.keychain'),
        $keychainInput = $($keychainSection, '.keychain-input'),
        $keychainButton = $($keychainSection, '.keychain-button'),
        $keychainYes = $($keychainSection, '.keychain-yes'),
        $keychainNo = $($keychainSection, '.keychain-no'),
        $keychainSuccess = $($keychainSection, '.keychain-message.success'),
        $keychainError = $($keychainSection, '.keychain-message.error');

    function _keychainUnlock() {
        $keychainYes.style.display = 'none';
        $keychainNo.style.display = 'none';
        $keychainInput.style.display = 'block';
        $keychainInput.focus();
        $keychainButton.removeAttribute('disabled');
    }

    function _keychainLock() {
        $keychainYes.style.display = 'block';
        $keychainNo.style.display = 'none';
        $keychainInput.style.display = 'none';
        $keychainInput.value = '';
        $keychainButton.disabled = true;
    }

    Mac.hasPassword(function(value) {
        $keychainYes.style.display = value ? 'block' : 'none';
        $keychainNo.style.display = value ? 'none' : 'block';
    });

    $keychainYes.addEventListener('click', _keychainUnlock);
    $keychainNo.addEventListener('click', _keychainUnlock);

    $keychainButton.addEventListener('click', function() {
        var password = $keychainInput.value;
        Mac.savePassword(password, function(success) {
            $keychainSuccess.style.display = success ? 'block' : 'none';
            $keychainError.style.display = success ? 'none' : 'block';
        });
        _keychainLock();
    });


    /********************* Ключи *********************/

    // TODO: При добавлении нового ключа, надо или добавлять скролл, или менять размер окна
    var $keysSection = $('.keys'),
        $keysEmpty = $($keysSection, '.key-empty'),
        $keysList = $($keysSection, '.key-list');

    function _createKey(key) {
        $keysEmpty.style.display = 'none';
        $keysList.style.display = 'block';

        var $key = document.createElement('div'),
            $keyId = document.createElement('div'),
            $keyRemove = document.createElement('button');

        $key.className = 'key';
        $keyId.className = 'key-id area';
        $keyRemove.className = 'key-remove';

        $keyId.textContent = key;
        $keyRemove.textContent = 'Удалить';

        $key.appendChild($keyId);
        $key.appendChild($keyRemove);

        $keysList.appendChild($key);

        $keyRemove.addEventListener('click', function(key) {
            Storage.removeKey(key);
            $keysList.removeChild(this);

            if (!$keysList.textContent) {
                _noKeys();
            }
        }.bind($key, key));
    }

    function _noKeys() {
        $keysList.style.display = 'none';
        $keysEmpty.style.display = 'block';
    }

    // Инициализация ключей
    Storage.getKeys().forEach(_createKey);


    /********************* Добавление ключей *********************/

    var $addSection = $('.add'),
        $addMessage = $($addSection, '.add-message'),
        $addId = $($addSection, '.add-id'),
        $addButton = $($addSection, '.add-button');

    function _createAdd(key) {
        $addMessage.style.display = 'none';
        $addId.style.display = 'block';
        $addId.textContent = key;
        $addButton.removeAttribute('disabled');
    }

    function _noAdd() {
        $addId.style.display = 'none';
        $addMessage.style.display = 'block';
        $addButton.disabled = true;
    }

    $addButton.addEventListener('click', function() {
        if (this.getAttribute('disabled')) {
            return;
        }

        var key = $addId.textContent;
        if (!Storage.hasKey(key)) {
            Storage.addKey(key);
            _createKey(key);
        }
        _noAdd();
    });


    /********************* Кнопки *********************/

    $('.action-close').addEventListener('click', function() {
        window.close();
    });

    /**************************************************/


    // Поехали
    Unlocker.onConnected(function() {
        $portError.style.display = 'none';
        $portSuccess.style.display = 'block';
        Tray.setIconNormal();
    });

    Unlocker.onConnectionLost(function() {
        $portSuccess.style.display = 'none';
        $portError.style.display = 'block';
        Tray.setIconError();
    });

    Unlocker.onKey(_createAdd);
});
