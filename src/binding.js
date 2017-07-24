(function (namespace) {
  'use string';
  var events = namespace.events;

  function Template(args) {
    if (args.container !== null) {
      if (typeof args.container !== 'string') {
        this.container = args.container;
      } else {
        this.container = document.querySelector(args.container);
      }
    } else {
      throw new Error('No container element or selector provided for template.');
    }

    if (typeof args.data !== 'undefined' && args.data !== null) {
      this.data = args.data;
    }

    if (typeof args.path === 'string') {
      getTemplate(args.path, populateContainer.bind(this));
    } else {
      throw new Error('A template path must be specified');
    }

    if (typeof args.model === 'string') {
      this.model = args.model;
    }

    overrideProps(this.data, this.model);
  }

  Template.prototype = {
    children: [],
    container: null
  };

  /*
   * overrides properties on the data object to allow property
   * future property value changes to be propogated to the eventing system
   * @param {Object} data - The data to publish changes for
   * @param {string} model - The model name to publish changes for
   */
  function overrideProps(data, model) {
    for (var prop in data) {
      if (!data.hasOwnProperty(prop))
        cotinue;

      override.call(data, prop, model);
    }
  }

  function override(prop, model) {
    var _private = this[prop];
    Object.defineProperty(this, prop, {
      get: function () {
        return _private;
      },
      set: function (val) {
        _private = val;
        events.publish(model + '.' + prop + ':change', val);
      }
    });
  };

  /*
   * sets the text content of a given element, replaces variable
   * expressions with actual values where appropriate
   */
  function setTextContent(element) {
    if (element.textContent && element.textContent.length > 0) {
      var text = element.textContent;

      var variables = getExpressionVariables({
          name: 'textContent',
          value: element.textContent
        });

      if (variables !== null) {
        for (var i = 0; i < variables.length; i++) {
          var variable = variables[i];
          setElementText.call(this, variable, element, text);
        }
      }
    }
  }

  /*
   * dataChanged callback function. Used when bound data changes to update DOM
   * elements to reflect the underlying data change
   */
  function dataChanged(value, variable, element, text) {
    var variables = getExpressionVariables({
        value: text
      });
    var idx = variables.indexOf(variable);

    if (idx > -1) {
      variables.splice(idx, 1);
    }

    var txt = text;
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
    if (this.data.hasOwnProperty(variable)) {
      events.subscribe(this.model + '.' + variable + ':change', function (value) {
        dataChanged.call(this, value, variable, element, text, this.data);
      }
        .bind(this));
      events.publish(this.model + '.' + variable + ':change', this.data[variable]);
    }
  }

  /*
   * Binds DOM element attribute values to the underlying bound data
   */
  function setAttributeValues(element, attributes) {
    for (var i = 0; i < attributes.length; i++) {
      var attribute = attributes[i];
      var variables = getExpressionVariables(attribute);
      setAttributeToVariableValues.call(this, element, variables, attribute);
    }
  }

  function setAttributeToVariableValues(element, variables, attribute) {
    if (variables !== null) {
      for (var i = 0; i < variables.length; i++) {
        var variable = variables[i];
        if (this.data.hasOwnProperty(variable)) {
          bind.call(this, element, this.data, attribute, variable);
          element[attribute.name] = attribute.value.replace('${' + variable + '}', this.data[variable]);
          events.subscribe(this.model + '.' + variable + ':change', function (value) {
            element[attribute.name] = value;
          });
        }
      }
    }
  }

  function bindToData() {
    for (var i = 0; i < this.children.length; i++) {
      var element = this.children[i];
      var attributes = getElementAttributes(element);
      setTextContent.call(this, element);
      setAttributeValues.call(this, element, attributes);

    }
  }

  function getExpressionVariables(attribute) {
    var variables = null;
    if (attribute.value !== null || attribute.value !== '') {
      var regex = /\${([A-Za-z\d]+?)\}/g;
      let m;
      while ((m = regex.exec(attribute.value)) !== null) {
        if (variables === null) {
          variables = [];
        }

        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        if (m.length > 0) {
          variables.push(m[1]);
        }
      }
    }
    return variables;
  }

  function getElementAttributes(el) {
    return [].slice.call(el.attributes).map(function (attr) {
      return {
        name: attr.name,
        value: attr.value
      }
    });
  }

  function populateChildrenProperty() {
    for (var i = this.container.children.length - 1; i >= 0; i--) {
      var elem = this.container.children[i];
      this.children.push(elem);
    }
  }

  /*
   * populates the Template container with the given markup
   * @param {string} markup - The HTML markup to inject into the 
   *                          current container
   */
  function populateContainer(markup) {
    this.container.innerHTML = markup;
    populateChildrenProperty.call(this);
    bindToData.call(this);
  }

  /*
   * Binds an element via native DOM events to a specified data object
   */
  function bind(element, data, attribute, property) {
    switch (element.tagName.toLowerCase()) {
    case 'input':
      if (element.type === 'checkbox' || element.type === 'radio') {
        element.addEventListener('change', function (e) {
          data[property] = element[attribute.name];
        }
          .bind(this));
      } else if (element.type === 'number') {
        element.addEventListener('input', function (e) {
          data[property] = parseFloat(element[attribute.name]);
        }
          .bind(this));
      } else {
        element.addEventListener('input', function (e) {
          data[property] = element[attribute.name];
        }
          .bind(this));
      }
      break;
    case 'select':
      element.addEventListener('change', function (e) {
        data[property] = element[attribute.name];
      }
        .bind(this));
      break;
    }
  }

  /*
   * Load the resource at a given path using aync ajax
   * @param {string} path - The path of the resource to load
   * @param {callback} callback - A function to execute when async loading is complete
   *
   */
  function getTemplate(path, callback) {
    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        callback.call(null, this.responseText);
      }
    });

    xhr.open("GET", path);
    xhr.send(null);
  }

  namespace.Template = Template;
}(window));
