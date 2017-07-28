(function(namespace) {
  'use strict';
  var events = namespace.events;

  function VBind(args) {
    if (typeof args.container === 'undefined' || args.container === null)
      throw new Error('No container element for template.');

    this.container = (typeof args.container === 'string') ?
      document.querySelector(args.container) : args.container;

    if (typeof args.data === 'undefined' || args.data === null)
      throw new Error('No data object for template binding.');

    this.data = args.data;

    if (typeof args.path === 'undefined' || args.path === null)
      throw new Error('A template path must be specified');

    this.get_template(args.path, this.populateContainer.bind(this), function(result) {
      throw new Error(result);
    }.bind(this));

    if (typeof args.model === 'string')
      this.model = args.model;

    this.overrideProps();
  }

  VBind.prototype = {
    children: [],
    container: null,
    propertySetter: propertySetter,
    propertyGetter: propertyGetter,
    overrideProps: overrideProps,
    override: override,
    bindToData: bindToData,
    setElementText: setElementText,
    setTextContent: setTextContent,
    setAttributeToVariableValues: setAttributeToVariableValues,
    bind: bind,
    setAttributeValues: setAttributeValues,
    dataChanged: dataChanged,
    get_template: get_template,
    populateContainer: populateContainer,
    getExpressionVariables: getExpressionVariables,
    getElementAttributes: getElementAttributes,
    populateChildrenProperty: populateChildrenProperty,
    bindSelect: bindSelect,
    elementValueListener: elementValueListener,
    elementFloatListener: elementFloatListener,
    bindInput: bindInput
  };

  /*
   * overrides properties on the data object to allow
   * future property value changes to be propogated to the eventing system
   * @param {Object} data - The data to publish changes for
   * @param {string} model - The model name to publish changes for
   */
  function overrideProps() {
    for (var prop in this.data) {
      this.override(prop);
    }
  }

  function override(prop) {
    var args = {
        scope: this,
        private: this.data[prop],
        prop: prop
      };

    Object.defineProperty(args.scope.data, prop, {
      get: args.scope.propertyGetter.bind(args),
      set: args.scope.propertySetter.bind(args)
    });
  };

  function propertySetter(val) {
    this.private = val;
    events.publish(this.scope.model + '.' + this.prop + ':change', val);
  }

  function propertyGetter() {
    return this.private;
  }

  /*
   * sets the text content of a given element, replaces variable
   * expressions with actual values where appropriate
   */
  function setTextContent(element) {
    if (element.textContent && element.textContent.length <= 0)
      return;

    var text = element.textContent,
      variables = getExpressionVariables({
        name: 'textContent',
        value: element.textContent
      });

    if (variables === null)
      return;

    for (var i = 0; i < variables.length; i++) {
      var variable = variables[i];
      this.setElementText(variable, element, text);
    }
  }

  /*
   * dataChanged callback function. Used when bound data changes to update DOM
   * elements to reflect the underlying data change
   */
  function dataChanged(value, variable, element, text) {
    var variables = getExpressionVariables({
        value: text
      }),
      idx = variables.indexOf(variable),
      txt = text;

    if (idx > -1)
      variables.splice(idx, 1);

    for (var i = 0; i < variables.length; i++) {
      var vari = variables[i];
      txt = txt.replace('${' + vari + '}', this.data[vari]);
    }

    element.textContent = txt.replace('${' + variable + '}', value);
  }

  /*
   * wires up a subscriber that listens for model data changes
   */
  function setElementText(variable, element, text) {
    if (!this.data.hasOwnProperty(variable))
      return;

    events.subscribe(this.model + '.' + variable + ':change', function(value) {
      this.dataChanged(value, variable, element, text, this.data);
    }.bind(this));

    events.publish(this.model + '.' + variable + ':change', this.data[variable]);
  }

  /*
   * Binds DOM element attribute values to the underlying bound data
   */
  function setAttributeValues(element, attributes) {
    for (var i = 0; i < attributes.length; i++) {
      var attribute = attributes[i];
      var variables = this.getExpressionVariables(attribute);
      this.setAttributeToVariableValues(element, variables, attribute);
    }
  }

  function setAttributeToVariableValues(element, variables, attribute) {
    if (variables === null)
      return;

    for (var i = 0; i < variables.length; i++) {
      var variable = variables[i];
      if (!this.data.hasOwnProperty(variable))
        continue;

      this.bind(element, this.data, attribute, variable);
      element[attribute.name] = attribute.value.replace('${' + variable + '}', this.data[variable]);
      events.subscribe(this.model + '.' + variable + ':change', function(value) {
        element[attribute.name] = value;
      });
    }
  }

  function bindToData() {
    for (var i = 0; i < this.children.length; i++) {
      var element = this.children[i];
      var attributes = this.getElementAttributes(element);
      this.setTextContent(element);
      this.setAttributeValues(element, attributes);
    }
  }

  function getExpressionVariables(attribute) {
    var variables = null;
    if (typeof attribute === 'undefined' ||
     attribute === null ||
     attribute.value === null ||
     attribute.value === '')
      return variables;

    var regex = /\${([A-Za-z\d]+?)\}/g;
    let m;
    while ((m = regex.exec(attribute.value)) !== null) {
      if (variables === null)
        variables = [];

      if (m.index === regex.lastIndex)
        regex.lastIndex++;

      if (m.length > 0)
        variables.push(m[1]);
    }

    return variables;
  }

  function getElementAttributes(el) {
    return [].slice.call(el.attributes).map(function(attr) {
      return {
        name: attr.name,
        value: attr.value
      }
    });
  }

  function populateChildrenProperty() {
    for (var i = 0; i < this.container.children.length; i++) {
      var elem = this.container.children[i];
      this.children.push(elem);
    }
  }

  /*
   * populates the VBind container with the given markup
   * @param {string} markup - The HTML markup to inject into the
   *                          current container
   */
  function populateContainer(markup) {
    this.container.innerHTML = markup;
    this.populateChildrenProperty.call(this);
    this.bindToData();
  }

  /*
   * Binds an element via native DOM events to a specified data object
   */
  function bind(element, data, attribute, property) {
    switch (element.tagName.toLowerCase()) {
      case 'input':
        this.bindInput(element, data, attribute, property);
        break;
      case 'select':
        this.bindSelect(element, data, attribute, property);
        break;
    }
  }

  function bindInput(element, data, attribute, property) {
    var args = {
      element: element,
      data: data,
      attribute: attribute,
      property: property
    };

    if (element.type === 'checkbox' || element.type === 'radio') {
      element.addEventListener('change', this.elementValueListener.bind(args));
    } else if (element.type === 'number') {
      element.addEventListener('input', this.elementFloatListener.bind(args));
    } else {
      element.addEventListener('input', this.elementValueListener.bind(args));
    }
  }

  function bindSelect(element, data, attribute, property) {
    var args = {
      element: element,
      data: data,
      attribute: attribute,
      property: property
    };
    element.addEventListener('change', elementValueListener.bind(args));
  }

  function elementValueListener(event) {
    this.data[this.property] = this.element[this.attribute.name];
  }

  function elementFloatListener(event) {
    this.data[this.property] = parseFloat(this.element[this.attribute.name]);
  }

  /*
   * Load the resource at a given path using async ajax
   * @param {string} path - The path of the resource to load
   * @param {callback} callback - A function to execute when async loading is complete
   *
   */
  function get_template(path, success_callback, failure_callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function() {
      if (this.readyState === 4 && xhr.status === 200) {
        success_callback(this.responseText);
      } else if(this.readyState === 4 && xhr.status !== 200) {
        failure_callback(this.responseText);
      }
    });

    xhr.open("GET", path);
    xhr.send(null);
  }

  namespace.VBind = VBind;
}(window));
