# ember-poll

*A polling service for your ember apps*

![Download count all time](https://img.shields.io/npm/dt/ember-poll.svg) [![npm version](https://badge.fury.io/js/ember-poll.svg)](http://badge.fury.io/js/ember-poll) [![CircleCI](https://circleci.com/gh/nypublicradio/ember-poll.svg?style=shield)](https://circleci.com/gh/nypublicradio/ember-poll/tree/master) [![Ember Observer Score](http://emberobserver.com/badges/ember-poll.svg)](http://emberobserver.com/addons/ember-poll)

Ember provides equivalents for `setTimeout`, but nothing for `setInterval`. This add-on offers a service you can use to manage intervals throughout your app.

One way that people will try to set up a poll in their Ember app is by calling a nested `run.later` based on some known timeout, like so:
```javascript
Ember.component.extend({
  init() {
    this._super(..arguments);
    this._poll(1000);
  },
  
  myPoller() {
    // do something on an interval
  },
  
  _poll(interval) {
    this.myPoller();
    
    Ember.run.later(() => this._poll(interval), interval);
  }
})
```

The problem with this is that any promise-waiters like `andThen` in your tests will never resolve, since each poll adds a new item to the runloop.

Instead, this service uses the native `setInterval` to start a poll, and also provides various methods to manage and track any it is given.

We can rely on the native `setInterval` function if the passed function is bound using `Ember.run.bind`, which ensures the given function is executed within an Ember runloop. This simplifies the the scheduling logic and allows us to maintain a single handler for every tick of the event loop.

## Installing

`npm install ember-poll --save-dev`

## Usage

Set up a poll anytime. Like maybe when a certain route is entered.
```javascript
import Ember from 'ember';

export default Ember.Route.extend({
  poll: Ember.service.inject(),
  
  model() {
    return this.store.find('post');
  },
  
  didTransition() {
    let pollFunction = () => Ember.$.ajax('/api/ping');
    let pollId = this.get('poll').addPoll({
      interval: 60 * 1000, // one minute
      callback: pollFunction
    });
    
    this.set('pollId', pollId);
  },
  
  
  willTransition() {
    let pollId = this.get('pollId');
    this.get('poll').stopPoll(pollId);
  }
  
});
```

Label polls for easier reference:
```javascript
this.get('poll').addPoll({
  interval: 60 * 1000,
  callback: callbackFn,
  label: 'server ping'
});

// later...
this.get('poll').stopPollByLabel('server ping');
```

Set up multiple polls and manage them all:
```javascript
this.get('poll').addPoll({
  interval: 60 * 1000,
  callback: () => Ember.$.ajax('/api/ping'),
  label: 'server ping'
});

let weatherPoll = this.get('poll').addPoll({
  interval: 60 * 1000 * 30,
  callback: otherCallback,
  label: 'weather update'
});

// and stop them all at once
this.get('poll').stopAll();

// restart a specific poll using its ID
this.get('poll').startPoll(weatherPoll);

// restart a specific poll using its label
this.get('poll').startPollByLabel('server ping');
```

## API
This service exposes for adding, stopping, and restarting polls.

* `addPoll({ interval, callback, [label] })`

`interval Number`

`callback Function`

`label String`

returns `pollId Number`

Adds a poll to the service and starts it *immediately*. Returns a unique id which can be used to reference the poll in other parts of the API.

* `startPoll( pollId )`

`pollId Number`

returns `pollId Number`

Starts a previously added poll and returns its *new* ID. *Note:* each time a polls is started, it is assigned a new id which must be tracked by the user for future reference.

* `startPollByLabel( pollLabel )`

`pollLabel String`

returns `pollId Number`

See `startPoll` for description. *Note:* a given poll's label is constant between starts and stops. This method will still return the polls updated ID.

* `stopPoll( pollId )`

`pollId Number`

returns `void`

Stops a previously added poll.

* `stopPollByLabel( pollLabel )`

`pollLabel String`

returns `void`

Stops a previously added poll.

* `stopAll()`

returns `void`

Stops all polls.

## Contributing

* `git clone https://github.com/nypublicradio/ember-poll` this repository
* `cd ember-poll`
* `npm install`
* `bower install`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
