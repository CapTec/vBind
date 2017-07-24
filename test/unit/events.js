describe('events', function() {
	it('registers a subscriber', function() {
		var subEvtName = 'test',
			callback = function() {};

		registered = events.subscribe(subEvtName, callback);
		expect(events.subscribers[subEvtName]).toContain(callback);
		events.subscribers = {};
	});

	it('removes a subscriber', function() {
		var subEvtName = 'test',
			callback = function() {};

		registered = events.subscribe(subEvtName, callback);
		registered.remove();
		expect(events.subscribers[subEvtName]).not.toContain(callback);
		events.subscribers = {};
	});

	it('clears all subscribers', function() {
		var subEvtName = 'test',
			callback = function() {},
			r0 = events.subscribe(subEvtName, callback),
			r1 = events.subscribe(subEvtName, callback);

		events.clear();
		expect(events.subscribers).not.toContain(callback);
		events.subscribers = {};
	});

	it('publishes an event', function() {
		var subEvtName = 'test',
			callback = jasmine.createSpy('callback spy'),
			r0 = events.subscribe(subEvtName, callback);

		events.publish(subEvtName);
		expect(callback).toHaveBeenCalled();
		events.subscribers = {};
	});

	it('doesn\'t publish a removed event', function() {
		var subEvtName = 'test',
			callback = jasmine.createSpy('callback spy'),
			r0 = events.subscribe(subEvtName, callback);

		r0.remove();
		events.publish(subEvtName);
		expect(callback).not.toHaveBeenCalled();
		events.subscribers = {};
	});

	it('doesn\'t trigger a callback that is not subscribed', function() {
		var subEvtName = 'test',
			callback = jasmine.createSpy('callback spy');

		events.publish(subEvtName);
		expect(callback).not.toHaveBeenCalled();
		events.subscribers = {};
	});

	it('published callback value is correct', function() {
		var subEvtName = 'test',
			callback = jasmine.createSpy('callback spy'),
			r0 = events.subscribe(subEvtName, callback),
			result = {
				success: true,
				data: "string data"
			};
		events.publish(subEvtName, result);
		expect(callback).toHaveBeenCalledWith(result);
		events.subscribers = {};
	});
});
