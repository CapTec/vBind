describe('events', function() {
  it('registers a subscriber when subscribe() is called', function() {
    var expected_evtName = 'test',
      expected_callback = function() {};

    registered = events.subscribe(expected_evtName, expected_callback);
    expect(events.subscribers[expected_evtName]).toContain(expected_callback);
    events.subscribers = {};
  });

  it('removes a subscriber when remove() is called', function() {
    var expected_evtName = 'test',
      expected_callback = function() {};

    registered = events.subscribe(expected_evtName, expected_callback);
    registered.remove();
    expect(events.subscribers[expected_evtName]).not.toContain(expected_callback);
    events.subscribers = {};
  });

  it('clears all subscribers when clear() is called', function() {
    var expected_evtName = 'test',
      expected_callback = function() {},
      r0 = events.subscribe(expected_evtName, expected_callback),
      r1 = events.subscribe(expected_evtName, expected_callback);

    events.clear();
    expect(events.subscribers).not.toContain(expected_callback);
    events.subscribers = {};
  });

  it('triggers callback when publish() is called', function() {
    var expected_evtName = 'test',
      expected_callback = jasmine.createSpy('expected_callback spy'),
      r0 = events.subscribe(expected_evtName, expected_callback);

    events.publish(expected_evtName);
    expect(expected_callback).toHaveBeenCalled();
    events.subscribers = {};
  });

  it('doesn\'t trigger a callback that has been removed', function() {
    var expected_evtName = 'test',
      expected_callback = jasmine.createSpy('expected_callback spy'),
      r0 = events.subscribe(expected_evtName, expected_callback);

    r0.remove();
    events.publish(expected_evtName);
    expect(expected_callback).not.toHaveBeenCalled();
    events.subscribers = {};
  });

  it('doesn\'t trigger an expected_callback that has not subscribed', function() {
    var expected_evtName = 'test',
      expected_callback = jasmine.createSpy('expected_callback spy');

    events.publish(expected_evtName);
    expect(expected_callback).not.toHaveBeenCalled();
    events.subscribers = {};
  });

  it('published expected_callback value is correct', function() {
    var expected_evtName = 'test',
      expected_callback = jasmine.createSpy('expected_callback spy'),
      r0 = events.subscribe(expected_evtName, expected_callback),
      result = {
        success: true,
        data: "string data"
      };
    events.publish(expected_evtName, result);
    expect(expected_callback).toHaveBeenCalledWith(result);
    events.subscribers = {};
  });
});
