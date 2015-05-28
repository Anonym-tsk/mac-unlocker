'use strict';

/**
 * Prefix for LocalStorage keys.
 * @type {string}
 */
var LS_PREFIX = '_unlocker_';

/**
 * LocalStorage reference.
 * @type {Storage}
 */
var storage = (function() {
    var id = new Date, st, res;
    try {
        (st = window.localStorage).setItem(id, id);
        res = st.getItem(id) == id;
        st.removeItem(id);
        return res && st;
    } catch (exception) {}
}());

/**
 * Get item from storage.
 * @param {string} name
 * @return {string|number|[]|boolean}
 * @private
 */
function _getItem(name) {
    try {
        return storage && JSON.parse(storage.getItem(LS_PREFIX + name));
    } catch (e) {
        return null;
    }
}

/**
 * Set item to storage.
 * @param {string} name
 * @param {string|number|{}|[]} value
 * @private
 */
function _setItem(name, value) {
    try {
        storage && storage.setItem(LS_PREFIX + name, JSON.stringify(value));
    } catch (e) {
        // Переполнение хранилища или нет доступа не запись
    }
}

/**
 * Remove item from storage.
 * @param {string} name
 * @private
 */
function _removeItem(name) {
    storage && storage.removeItem(LS_PREFIX + name);
}

/**
 * Get storage size.
 * @return {number}
 * @private
 */
function _getLength() {
    return storage && storage.length;
}

module.exports = {
    getPort: function() {
        return _getItem('port');
    },
    setPort: function(value) {
        _setItem('port', value);
    },
    getKeys: function() {
        return _getItem('keys') || [];
    },
    addKey: function(id) {
        var keys = _getItem('keys') || [];
        keys.push(id);
        _setItem('keys', keys);
    },
    removeKey: function(id) {
        var keys = _getItem('keys') || [],
            index = keys.indexOf(id);
        if (index >= 0) {
            keys.splice(index, 1);
            _setItem('keys', keys);
        }
    },
    hasKey: function(id) {
        var keys = _getItem('keys') || [];
        return !!~keys.indexOf(id);
    }
};
