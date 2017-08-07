describe('ChangePublisher', function() {
  it('should override properties of data object and publish event if data changes', function(done) {
    var model = 'testModel',
      ref0 = null,
      ref1 = null,
      expectedValue0 = 'value2',
      expectedValue1 = 'value3',
      expected = {
        property0_callback: function(actualValue) {
          ref0.remove();
          expect(expectedValue0).toBe(actualValue);
          var tmp = data.property0;
          expect(expectedValue0).toBe(tmp);
          done();
        },
        property1_callback: function(actualValue) {
          ref1.remove();
          expect(expectedValue1).toBe(actualValue);
          var tmp = data.property1;
          expect(expectedValue1).toBe(tmp);
          done();
        }
      },
      data = {
        property0: 'value0',
        property1: 'value1'
      };

    ref0 = events.subscribe(model + '.property0' + ':change', expected.property0_callback);
    ref1 = events.subscribe(model + '.property1' + ':change', expected.property1_callback);

    var publisher = new ChangePublisher({
      data: data,
      model: model
    });

    data.property0 = expectedValue0; // triggers setter that notifies the event system
    data.property1 = expectedValue1; // triggers setter that notifies the event system
  });
});
