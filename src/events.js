(function(global) {
  'use strict';
  var events = {
    subscribers: {}
  };

  /*
   * Registers a subscription event listener.
   * @param {String} eventName - The event name for a listener to subscribe.
   * @param {Function} listener - The callback for when an event is published.
   * @returns {Object} - Removes a subscription.
   */
  events.subscribe = function(eventName, listener) {
    if (!this.subscribers.hasOwnProperty(eventName)) {
      this.subscribers[eventName] = [];
    }

    var index = this.subscribers[eventName].push(listener) - 1;

    return {
      remove: function() {
        delete events.subscribers[eventName][index];
	  }
    };
  };

  /*
   * Publishes an event to all registered listeners.
   * @param {String} eventName - The event name to publish.
   * @param {Object} info - The object to pass to a listener function.
   */
  events.publish = function(eventName, info) {
    if (!this.subscribers.hasOwnProperty(eventName)) {
      return;
    }

    this.subscribers[eventName].forEach(function(item) {
      item(typeof info !== 'undefined' ? info : {});
    });
  }

  /*
   * Removes all event subscribers
   */
  events.clear = function() {
    this.subscribers = {};
  }

  global.events = events;
}(window)); // iife for global namespace
