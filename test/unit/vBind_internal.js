var stubbed_noop = function() {};
var mock = require('xhr-mock');

describe('VBind', function() {
  var VBind_Mock;

  beforeEach(function() {
    VBind_Mock = function(args) {
      VBind.call(this, args);
    };
    VBind_Mock.prototype = Object.create(VBind.prototype);
  });

  afterEach(function() {
    VBind_Mock = null;
  });

  describe('getExpressionVariables', function() {
    it('should return null if called with null', function() {
      var attributemock = null;
      var actual = VBind_Mock.prototype.getExpressionVariables(attributemock);
      var expected = null;

      expect(actual).toBe(expected);
    });

    it('should return null if called with undefined', function() {
      var attributemock = undefined;
      var actual = VBind_Mock.prototype.getExpressionVariables(attributemock);
      var expected = null;

      expect(actual).toBe(expected);
    });

    it('should return null if called with { value: null }', function() {
      var attributemock = {
        value: null
      };
      var actual = VBind_Mock.prototype.getExpressionVariables(attributemock);
      var expected = null;

      expect(actual).toBe(expected);
    });

    it('should return null if called with { value: undefined }', function() {
      var attributemock = {
        value: undefined
      };
      var actual = VBind_Mock.prototype.getExpressionVariables(attributemock);
      var expected = null;
      expect(actual).toBe(expected);
    });

    it('should return null if attribute.value is \'\'', function() {
      var attributemock = {
        value: ''
      };
      var actual = VBind_Mock.prototype.getExpressionVariables(attributemock);
      var expected = null;

      expect(actual).toBe(expected);
    });

    it('should return [\'variable\'] if attribute.value is \'${variable}\'', function() {
      var attributemock = {
        value: '${variable}'
      };
      var actual = VBind_Mock.prototype.getExpressionVariables(attributemock);
      var expected = ['variable'];

      expect(actual).toEqual(expected);
    });

    it('should return [\'variable\', \'variable2\'] if attribute.value is \'${variable}${variable2}\'', function() {
      var attributemock = {
        value: '${variable}${variable2}'
      };
      var actual = VBind_Mock.prototype.getExpressionVariables(attributemock);
      var expected = ['variable', 'variable2'];

      expect(actual).toEqual(expected);
    });
  });

  describe('getElementAttributes', function() {
    it('should return an array of objects if element has attributes set', function() {
      var mockelement = {
        attributes: [{
          name: "value",
          value: "any val"
        }]
      };
      var actual = VBind_Mock.prototype.getElementAttributes(mockelement);
      var expected = [{
        name: "value",
        value: "any val"
      }];

      expect(actual).toEqual(expected);
    });

    it('should return an empty array if element has no attributes', function() {
      var mockelement = {
        attributes: []
      };
      var actual = VBind_Mock.prototype.getElementAttributes(mockelement);
      var expected = [];

      expect(actual).toEqual(expected);
    });
  });

  describe('populateChildrenProperty', function() {
    it('should loop over child elements in VBind container and add them to VBind children', function() {
      var actual = [],
        expected = [{
          innerHTML: "<label>hello</label>"
        }, {
          innerHTML: "<label>world</label>"
        }],
        container = {
          children: [{
            innerHTML: "<label>hello</label>"
          }, {
            innerHTML: "<label>world</label>"
          }]
        };
      var state = {
        children: actual,
        container: container
      };


      VBind_Mock.prototype.populateChildrenProperty.call(state);
      expect(actual).toEqual(expected);
    })
  });

  describe('populateContainer', function() {
    it('should set VBind container.innerHTML with provided markup value', function() {
      var actual = {
        container: {
          innerHTML: ''
        },
        populateChildrenProperty: stubbed_noop,
        bindToData: stubbed_noop
      };

      var markup = '<h1>hello world</h1>';

      var expected = {
        innerHTML: '<h1>hello world</h1>'
      };

      VBind_Mock.prototype.populateContainer.call(actual, markup);

      expect(actual.container.innerHTML).toBe(expected.innerHTML);
    });
  });

  describe('get_template == 200', function() {
    it('should call success callback if readystate === 4 and status === 200', function(done) {
      mock.setup();
      mock.get('template1.html', function(req, res) {
        return res
          .status(200)
          .body('<h1>Heading</h1>');
      });

      var expected = '<h1>Heading</h1>';
      VBind.prototype.get_template('template1.html', function(actual) {
        mock.teardown();
        expect(actual).toBe(expected);
        done();
      }, stubbed_noop);
    });

    it('should call failure callback if readystate === 4 and status !== 200', function(done) {
      mock.setup();
      mock.get('template1.html', function(req, res) {
        return res
          .status(404)
          .body('NOT FOUND');
      });

      var expected = 'NOT FOUND';
      VBind.prototype.get_template('template1.html', stubbed_noop, function(actual) {
        mock.teardown();
        expect(actual).toBe(expected);
        done();
      });
    });
  });

  describe('bindSelect', function() {
    it('should call addEventListener', function() {
      var element = {
          addEventListener: stubbed_noop
        },
        data = {
          value: "test"
        },
        attribute = {
          name: "value",
          value: "test"
        },
        property = '';
      spyOn(element, 'addEventListener');
      VBind_Mock.prototype.elementValueListener = stubbed_noop;
      VBind_Mock.prototype.bindSelect(element, data, attribute, property);
      expect(element.addEventListener).toHaveBeenCalled();
    });
  });

  describe('elementValueListener', function() {
    it('should set data.value to specified element attribute value', function() {
      var args = {
        element: {
          value: "new value"
        },
        data: {
          value: "test"
        },
        attribute: {
          name: "value"
        },
        property: 'value'
      };

      VBind_Mock.prototype.elementValueListener.call(args);
      expect(args.data.value).toBe('new value');
    });
  });

  describe('elementFloatListener', function() {
    it('should set data.value to a float parsed from element attribute value', function() {
      var args = {
        element: {
          value: "12.420"
        },
        data: {
          value: "test"
        },
        attribute: {
          name: "value"
        },
        property: 'value'
      };
      var expected = 12.420;

      VBind_Mock.prototype.elementFloatListener.call(args);
      expect(args.data.value).toBe(expected);
    });
  });

  describe('bindInput()', function() {
    it('should call addEventListener with change when element.type is checkbox', function() {
      var element = {
        value: "new value",
        type: 'checkbox',
        addEventListener: function() {}
      };

      var data = {
        value: "test"
      };

      var property = "value";

      var attribute = {
        name: "value"
      }

      spyOn(element, 'addEventListener');

      VBind_Mock.prototype.elementValueListener = stubbed_noop;
      VBind_Mock.prototype.bindInput(element, data, attribute, property);
      expect(element.addEventListener.calls.allArgs()[0][0]).toEqual('change');
    });

    it('should call addEventListener with change when element.type is radio', function() {
      var element = {
        value: "new value",
        type: 'radio',
        addEventListener: function() {}
      };

      var data = {
        value: "test"
      };

      var property = "value";

      var attribute = {
        name: "value"
      }

      spyOn(element, 'addEventListener');

      VBind_Mock.prototype.elementValueListener = stubbed_noop;
      VBind_Mock.prototype.bindInput(element, data, attribute, property);
      expect(element.addEventListener.calls.allArgs()[0][0]).toEqual('change');
    });

    it('should call addEventListener with input when element.type is number', function() {
      var element = {
        value: "1",
        type: 'number',
        addEventListener: function() {}
      };

      var data = {
        value: "test"
      };

      var property = "value";

      var attribute = {
        name: "value"
      }

      spyOn(element, 'addEventListener');

      VBind_Mock.prototype.elementValueListener = stubbed_noop;
      VBind_Mock.prototype.bindInput(element, data, attribute, property);
      expect(element.addEventListener.calls.allArgs()[0][0]).toEqual('input');
    });

    it('should call addEventListener with input when element.type not radio/checkbox/text', function() {
      var element = {
        value: "1",
        type: 'date',
        addEventListener: function() {}
      };

      var data = {
        value: "test"
      };

      var property = "value";

      var attribute = {
        name: "value"
      }

      spyOn(element, 'addEventListener');

      VBind_Mock.prototype.elementValueListener = stubbed_noop;
      VBind_Mock.prototype.bindInput(element, data, attribute, property);
      expect(element.addEventListener.calls.allArgs()[0][0]).toEqual('input');
    });
  });

  describe('bind()', function() {
    it('should call bindInput if element tag name is "INPUT".', function() {
      var element = {
        tagName: 'INPUT'
      };

      VBind_Mock.prototype.bindInput = stubbed_noop;
      spyOn(VBind_Mock.prototype, 'bindInput');
      VBind_Mock.prototype.bind(element);
      expect(VBind_Mock.prototype.bindInput).toHaveBeenCalled();
    });

    it('should call bindSelect if element tag name is "SELECT".', function() {
      var element = {
        tagName: 'SELECT'
      };

      VBind_Mock.prototype.bindInput = stubbed_noop;
      spyOn(VBind_Mock.prototype, 'bindSelect');
      VBind_Mock.prototype.bind(element);
      expect(VBind_Mock.prototype.bindSelect).toHaveBeenCalled();
    });
  });

  describe('bindToData()', function() {
    it('should loop over provided children', function() {
      var state = {
        children: [{}, {}, {}],
        getElementAttributes: stubbed_noop,
        setTextContent: stubbed_noop,
        setAttributeValues: stubbed_noop
      };

      spyOn(state, 'getElementAttributes');

      VBind_Mock.prototype.bindToData.call(state);
      expect(state.getElementAttributes.calls.count()).toBe(3);
    });
  });

  describe('setAttributeToVariableValues', function() {
    it('should set element attribute value to data variable value', function() {
      var tmp = events.subscribe;
      events.subscribe = stubbed_noop;

      var variables = ['test'];
      var attribute = {
        name: 'selected',
        value: '${test}'
      };
      var data = {
        test: 'New Value'
      };
      var element = {
        selected: '${test}'
      };

      var state = {
        bind: stubbed_noop,
        data: data
      };

      VBind_Mock.prototype.setAttributeToVariableValues.call(state, element, variables, attribute);
      expect(element.selected).toBe('New Value');
      events.subscribe = tmp;
    });
  });

  describe('setAttributeValues', function() {
    it('should call getExpressionVariables 3 times if 3 attributes provided', function() {
      var state = {
        getExpressionVariables: stubbed_noop,
        setAttributeToVariableValues: stubbed_noop
      };
      var attributes = [{}, {}, {}];
      var element = {};
      spyOn(state, 'getExpressionVariables');

      VBind_Mock.prototype.setAttributeValues.call(state, element, attributes);
      expect(state.getExpressionVariables.calls.count()).toBe(3);
    });
  })

});
