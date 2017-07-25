var stubbed_noop = function() {};

describe('VBind', function() {
  it('should attempt to override data properties with _overrideProps()', function() {
    var expected = {
      data: {
        test: true,
        property: "lol"
      },
      _override: function(prop) {}
    };

    spyOn(expected, '_override');

    VBind.prototype._overrideProps.call(expected);

    expect(expected._override).toHaveBeenCalled();
    expect(expected._override.calls.allArgs()).toContain(['property']);
    expect(expected._override.calls.allArgs()).toContain(['test']);
  });

  it('should call over-write getters and setters for data object', function() {
    var VBind_Mock = function(args) {
      VBind.call(this, args);
    };
    VBind_Mock.prototype = Object.create(VBind.prototype);

    var expected = {
      data: {
        test: true
      },
      model: 'event_id',
      propertySetter: VBind_Mock.prototype.propertySetter,
      propertyGetter: VBind_Mock.prototype.propertyGetter
    };
    spyOn(expected, 'propertySetter');
    spyOn(expected, 'propertyGetter');

    VBind_Mock.prototype._override.call(expected, 'test');

    expected.data.test = false;
    expect(expected.propertySetter).toHaveBeenCalled();
    var tmp = expected.data.test;
    expect(expected.propertyGetter).toHaveBeenCalled();
    console.log(tmp);

  });
});
