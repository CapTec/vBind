var stubbednoop = function() {};
describe('VBind', function() {
  var VBind_Mock = null;;

  beforeEach(function() {
    VBind_Mock = function(args) {
      VBind.call(this, args);
    };
    VBind_Mock.prototype = Object.create(VBind.prototype);
    VBind_Mock.prototype.get_template = stubbednoop;
    VBind_Mock.prototype.populateContainer = stubbednoop;
  });

  afterEach(function(){
    VBind_Mock = null;
  });

  describe('constructor', function() {
    it('should throw Error if container is undefined', function() {
      var args = {
        data: null,
        template: null,
        model: null,
        path: null,
        container: undefined
      };

      expect(function() {
        new VBind_Mock(args)
      }).toThrow(new Error('No container element for template.'));
    });

    it('should throw Error if container is null', function() {
      var args = {
        data: null,
        template: null,
        model: null,
        path: null,
        container: null
      };

      expect(function() {
        new VBind_Mock(args)
      }).toThrow(new Error('No container element for template.'));
    });

    it('should get container using querySelector if string', function() {
      var expected_callback = jasmine.createSpy('expected_callback spy');
      var tmp = document.querySelector;

      document.querySelector = expected_callback;
      var args = {
        data: {},
        template: '',
        model: '',
        path: '',
        container: '#selector'
      };

      new VBind_Mock(args);
      expect(expected_callback).toHaveBeenCalled();
      document.querySelector = tmp;
    });

    it('should set VBind container to arg.container if not string', function() {
      VBind_Mock.prototype.overrideProps = stubbednoop; // stubbed

      var expected_container = {
        innerHTML: '<h1>Test</h1>'
      };

      var args = {
        data: {},
        template: '',
        model: '',
        path: '',
        container: expected_container
      };

      var mockinstance = new VBind_Mock(args);
      expect(mockinstance.container).toBe(expected_container);
    });

    it('should throw Error if data is undefined', function() {
      var args = {
        container: {},
        data: undefined,
        template: null,
        model: null,
        path: null
      };

      expect(function() {
        new VBind_Mock(args)
      }).toThrow(new Error('No data object for template binding.'));
    });

    it('should throw Error if data is null', function() {
      var args = {
        container: {},
        data: null,
        template: null,
        model: null,
        path: null
      };

      expect(function() {
        new VBind_Mock(args)
      }).toThrow(new Error('No data object for template binding.'));
    });

    it('should throw Error if path is undefined', function() {
      var args = {
        container: {},
        data: {},
        path: undefined,
        template: null,
        model: null
      };

      expect(function() {
        new VBind_Mock(args)
      }).toThrow(new Error('A template path must be specified'));
    });

    it('should throw Error if path is null', function() {
      var args = {
        container: {},
        data: {},
        path: null,
        template: null,
        model: null
      };

      expect(function() {
        new VBind_Mock(args)
      }).toThrow(new Error('A template path must be specified'));
    });

    it('should call failure callback on error', function() {
      var args = {
        data: {},
        template: '',
        model: '',
        path: '',
        container: {}
      };

      var get_template = function(path, success_callback, failure_callback) {
        failure_callback.call(this, 'timed out');
      };

      VBind_Mock.prototype.overrideProps = stubbednoop; // stubbed
      VBind_Mock.prototype.get_template = get_template;

      expect(function() {
        new VBind_Mock(args);
      }).toThrow(new Error('timed out'));
    });

    it('should call success callback on success', function() {
      var args = {
        data: {},
        template: '',
        model: '',
        path: '',
        container: {}
      };

      var get_template = function(path, success_callback, failure_callback) {
        success_callback.call(this, '<h1>test page</h1>');
      };

      VBind_Mock.prototype.overrideProps = stubbednoop; // stubbed
      VBind_Mock.prototype.get_template = get_template;
      VBind_Mock.prototype.populateContainer = jasmine.createSpy('success_callback called');
      var t0 = new VBind_Mock(args);

      expect(t0.populateContainer).toHaveBeenCalled();
    });
  });
});
