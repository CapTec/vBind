(function(global) {
	'use strict';
    var subscribers = {};

    var events = {};

    /*
     * Registers a subscription event listener.
     * @param {String} eventName - The event name for a listener to subscribe.
     * @param {Function} listener - The callback for when an event is published.
     * @returns {Object} - Removes a subscription.
     */
    events.subscribe = function(eventName, listener) {
        if (!subscribers.hasOwnProperty(eventName)) {
            subscribers[eventName] = [];
        }

        var index = subscribers[eventName].push(listener) - 1;

        return {
            remove: function() {
                delete subscribers[eventName][index];
            }
        };
    };

    /*
     * Publishes an event to all registered listeners.
     * @param {String} eventName - The event name to publish.
     * @param {Object} info - The object to pass to a listener function.
     */
    events.publish = function(eventName, info) {

        if (!subscribers.hasOwnProperty(eventName)) {
            return;
        }

        subscribers[eventName].forEach(function(item) {
            item(info != undefined ? info : {});
        });
    }

    events.emit = events.publish;

    /*
     * Removes all event subscribers
     */
    events.clear = function() {
        subscribers = {};
    }

    global.events = events;
}(window)); // iife for global namespace
