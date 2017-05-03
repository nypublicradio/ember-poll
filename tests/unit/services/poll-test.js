import { moduleFor, test } from 'ember-qunit';
import { later } from 'ember-runloop';

moduleFor('service:poll', 'Unit | Service | poll', {

});

test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});

test('it calls a function when you add a poll', function(assert) {
  assert.expect(1);

  let service = this.subject();
  let testFlag = false;
  let done = assert.async();

  const interval = 2;
  const delay = 20;

  function callback() {
    testFlag = true;
  }

  let poll1 = service.addPoll({ interval,  callback });

  later(function() {
    service.stopPoll(poll1);
    assert.equal(testFlag, true, "called callback");
    done();
  }, delay);
});

test('it stops a poll via handle', function(assert) {
  assert.expect(1);

  let service = this.subject();
  let counter = 0;
  let done = assert.async();

  const interval = 2;
  const delay = 20;

  function callback() {
    counter++;
  }

  let poll1 = service.addPoll({ interval,  callback });

  later(function() {
    service.stopPoll(poll1);
    let currentCount = counter;

    later(() => {
      assert.equal(currentCount, counter, 'counts should be equal after pausing');
      done();
    }, delay * 2);

  }, delay);
});

test('it calls a function repeatedly', function(assert) {
  assert.expect(1);

  let service = this.subject();
  let done = assert.async();
  let callCounter = 0;

  const interval = 2;
  const delay = 100;

  function callback() {
    callCounter++;
  }

  let poll1 = service.addPoll({ callback, interval });

  later(function() {
    service.stopPoll(poll1);
    // this is not a precision tool
    // we don't need to count exact calls/millisecond
    assert.ok(callCounter > 1, "called callback multiple times");
    done();
  }, delay);
});

test('it maintains multiple polls', function(assert) {
  assert.expect(4);

  let service = this.subject();
  let done = assert.async();
  let counter1 = 0;
  let counter2 = 0;

  const delay = 20;
  const interval = 2;

  function callback1() {
    counter1++;
  }

  function callback2() {
    counter2++;
  }

  service.addPoll({ interval, callback: callback1 });
  service.addPoll({ interval, callback: callback2 });

  later(function() {
    let current1 = counter1;
    let current2 = counter2;

    service.stopAll();
    assert.ok(counter1 > 0, 'callback 1 called');
    assert.ok(counter2 > 0, 'callback 2 called');

    later(function() {
      assert.equal(current1, counter1, 'callback 1 canceled');
      assert.equal(current2, counter2, 'callback 2 canceled');
      done();
    }, delay * 2);
  }, delay);
});

test('it can cancel a poll by label', function(assert) {
  assert.expect(1);

  let service = this.subject();
  let counter = 0;
  let done = assert.async();

  const interval = 2;
  const delay = 20;

  function callback() {
    counter++;
  }

  service.addPoll({ interval, callback, label: 'foo' });

  later(() => {
    service.stopPollByLabel('foo');
    let currentCount = counter;

    later(() => {
      assert.equal(currentCount, counter, 'counts should be equal after pausing');
      done();
    }, delay * 2);
  }, delay);
});

test('it can start a poll by Id', function(assert) {
  assert.expect(2);

  let service = this.subject();
  let counter = 0;
  let done = assert.async();

  const interval = 2;
  const delay = 20;

  function callback() {
    counter++;
  }

  let poll1 = service.addPoll({ interval, callback });

  later(() => {
    service.stopPoll(poll1);
    let currentCount = counter;

    later(() => {
      assert.equal(currentCount, counter, 'counts should be equal after pausing');
      poll1 = service.startPoll(poll1);

      later(() => {
        service.stopPoll(poll1);
        assert.notEqual(currentCount, counter, 'poll has restarted');
        done();
      }, delay);
    }, delay * 2);
  }, delay);

});

test('it can start a poll by label', function(assert) {
  assert.expect(2);

  let service = this.subject();
  let counter = 0;
  let done = assert.async();

  const interval = 2;
  const delay = 20;

  function callback() {
    counter++;
  }

  let poll1 = service.addPoll({ interval, callback, label: 'foo' });

  later(() => {
    service.stopPoll(poll1);
    let currentCount = counter;

    later(() => {
      assert.equal(currentCount, counter, 'counts should be equal after pausing');
      poll1 = service.startPollByLabel('foo');

      later(() => {
        service.stopPoll(poll1);
        assert.notEqual(currentCount, counter, 'poll has restarted');
        done();
      }, delay);
    }, delay * 2);
  }, delay);

});

test('it can clear a poll', function(assert) {
  assert.expect(4);

  let service = this.subject();
  let counter1 = 0;
  let counter2 = 0;
  let done = assert.async();

  const interval = 2;
  const delay = 20;

  let poll1 = service.addPoll({ interval, callback: () => counter1++ });
  let poll2 = service.addPoll({ interval, callback: () => counter2++ });

  later(function() {
    service.stopPoll(poll2);
    service.clearPoll(poll1);
    let currentCount1 = counter1;
    let currentCount2 = counter2;
    
    assert.equal(service._polls.length, 1, 'only one poll should remain');
    assert.notOk(service._polls.findBy('handle', poll1), 'cleared poll should be gone');

    later(() => {
      assert.equal(currentCount1, counter1, 'poll1 counts should be equal after pausing');
      assert.equal(currentCount2, counter2, 'poll2 counts should be equal after pausing');
      done();
    }, delay * 2);

  }, delay);
  
});

test('it can clear a poll by label', function(assert) {
  assert.expect(4);

  let service = this.subject();
  let counter1 = 0;
  let counter2 = 0;
  let done = assert.async();

  const interval = 2;
  const delay = 20;

  service.addPoll({ interval, label: 'poll1', callback: () => counter1++ });
  service.addPoll({ interval, label: 'poll2', callback: () => counter2++ });

  later(function() {
    service.stopPollByLabel('poll2');
    service.clearPollByLabel('poll1');
    let currentCount1 = counter1;
    let currentCount2 = counter2;
    
    assert.equal(service._polls.length, 1, 'only one poll should remain');
    assert.notOk(service._polls.findBy('label', 'poll1'), 'cleared poll should be gone');

    later(() => {
      assert.equal(currentCount1, counter1, 'poll1 counts should be equal after pausing');
      assert.equal(currentCount2, counter2, 'poll2 counts should be equal after pausing');
      done();
    }, delay * 2);

  }, delay);
  
});
