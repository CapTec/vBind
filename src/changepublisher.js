(function(global_scope) {
  'use strict';

  /*
   * overrides properties on the data object to allow
   * future property value changes to be propogated to the eventing system
   * @param {Object} args - Argument object
   * @param {string} args.model - The model name to publish changes for
   * @param {Object} args.data - The data to publish changes for
   */
  function ChangePublisher(args) {
    init(args.data, args.model);
  }

  ChangePublisher.prototype = {
    init: init
  };

  function init(data, model) {
    for (var prop in data) {
      overrideProperty(data, prop, model);
    }
  }

  function overrideProperty(data, prop, model) {
    var args = {
        private: data[prop],
        prop: prop,
        model: model
      };

    Object.defineProperty(data, prop, {
      get: propertyGetter.bind(args),
      set: propertySetter.bind(args)
    });
  };

  function propertySetter(val) {
    this.private = val;
    events.publish(this.model + '.' + this.prop + ':change', val);
  }

  function propertyGetter() {
    return this.private;
  }

  global_scope.ChangePublisher = ChangePublisher;
}(window));
