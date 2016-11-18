import Service from 'ember-service';
import { bind } from 'ember-runloop';
import { A as emberArray } from 'ember-array/utils';

export default Service.extend({
  init() {
    this._super(...arguments);
    this.set('_polls', emberArray([]));
  },
  willDestroy() {
    this.stopAll();
  },

  addPoll({interval, callback, label}) {
    if (interval <= 1) {
      throw new Error('Polling interval must be greater than 1');
    }

    let handle = this._schedule(callback, interval);
    let poll = { handle, callback, interval };
    if (label) {
      poll.label = label;
    }
    this._polls.pushObject(poll);
    return handle;
  },

  startPoll(oldHandle) {
    let newHandle = this._startPoll('handle', oldHandle);
    return newHandle;
  },
  startPollByLabel(label) {
    let newHandle = this._startPoll('label', label);
    return newHandle;
  },

  stopPoll(handle) {
    clearInterval(handle);
  },
  stopPollByLabel(label) {
    let poll = this._polls.findBy('label', label);
    if (poll) {
      this.stopPoll(poll.handle);
    }
  },
  stopAll() {
    let handles = this._polls.mapBy('handle');
    handles.forEach(this.stopPoll);
  },

  _schedule(fn, interval) {
    return setInterval(bind(this, fn), interval);
  },
  _startPoll(key, value) {
    let poll = this._polls.findBy(key, value);
    if (poll) {
      let {callback, interval} = poll;
      let newHandle = this._schedule(callback, interval);
      return newHandle;
    } else {
      console.warn(`No poll was found for ${key} {$value}`);
    }
  }
});
