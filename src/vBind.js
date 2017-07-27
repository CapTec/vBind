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

    this._get_template(args.path, this._populateContainer.bind(this), function(result) {
      throw new Error(result);
    }.bind(this));

    if (typeof args.model === 'string')
      this.model = args.model;

    this._overrideProps();
  }

  VBind.prototype = {
    children: [],
    container: null,
    propertySetter: propertySetter,
    propertyGetter: propertyGetter,
    _overrideProps: overrideProps,
    _override: override,
    _bindToData: bindToData,
    _setElementText: setElementText,
    _setTextContent: setTextContent,
    _setAttributeToVariableValues: setAttributeToVariableValues,
    _bind: bind,
    _bindInput: bindInput,
    _bindSelect: bindSelect,
    _setAttributeValues: setAttributeValues,
    _dataChanged: dataChanged,
    _get_template: get_template,
    _populateContainer: populateContainer,
    _getExpressionVariables: getExpressionVariables,
    _getElementAttributes: getElementAttributes,
    _populateChildrenProperty: populateChildrenProperty,
    populateContainer: populateContainer,
    bindSelect: bindSelect,
    selectListener: selectListener,
    bindChkOrRadio: bindChkOrRadio
  };

  /*
   * overrides properties on the data object to allow
   * future property value changes to be propogated to the eventing system
   * @param {Object} data - The data to publish changes for
   * @param {string} model - The model name to publish changes for
   */
  function overrideProps() {
    for (var prop in this.data) {
      this._override(prop);
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
      this._setElementText(variable, element, text);
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
      this._dataChanged(value, variable, element, text, this.data);
    }.bind(this));

    events.publish(this.model + '.' + variable + ':change', this.data[variable]);
  }

  /*
   * Binds DOM element attribute values to the underlying bound data
   */
  function setAttributeValues(element, attributes) {
    for (var i = 0; i < attributes.length; i++) {
      var attribute = attributes[i];
      var variables = getExpressionVariables(attribute);
      this._setAttributeToVariableValues(element, variables, attribute);
    }
  }

  function setAttributeToVariableValues(element, variables, attribute) {
    if (variables === null)
      return;

    for (var i = 0; i < variables.length; i++) {
      var variable = variables[i];
      if (!this.data.hasOwnProperty(variable))
        continue;

      this._bind(element, this.data, attribute, variable);
      element[attribute.name] = attribute.value.replace('${' + variable + '}', this.data[variable]);
      events.subscribe(this.model + '.' + variable + ':change', function(value) {
        element[attribute.name] = value;
      });
    }
  }

  function bindToData() {
    for (var i = 0; i < this.children.length; i++) {
      var element = this.children[i];
      var attributes = getElementAttributes(element);
      this._setTextContent( element);
      this._setAttributeValues(element, attributes);
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
    this._populateChildrenProperty.call(this);
    this._bindToData();
  }

  /*
   * Binds an element via native DOM events to a specified data object
   */
  function bind(element, data, attribute, property) {
    switch (element.tagName.toLowerCase()) {
      case 'input':
        this._bindInput(element, data, attribute, property);
        break;
      case 'select':
        this._bindSelect(element, data, attribute, property);
        break;
    }
  }

  function bindInput(element, data, attribute, property) {
    if (element.type === 'checkbox' || element.type === 'radio') {
      element.addEventListener('change', bindChkOrRadio.bind(this, element, data, attribute, property));
    } else if (element.type === 'number') {
      element.addEventListener('input', function(e) {
        data[property] = parseFloat(element[attribute.name]);
      }.bind(this));
    } else {
      element.addEventListener('input', function(e) {
        data[property] = element[attribute.name];
      }.bind(this));
    }
  }

  function bindChkOrRadio(element, data, attribute, property) {
    data[property] = element[attribute.name];
  }

  function bindSelect(element, data, attribute, property) {
    var args = {
      element: element,
      data: data,
      attribute: attribute,
      property: property
    };
    element.addEventListener('change', selectListener.bind(args));
  }

  function selectListener(event) {
    this.data[this.property] = this.element[this.attribute.name];
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
