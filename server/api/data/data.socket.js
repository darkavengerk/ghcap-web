/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var DataEvents = require('./data.events');
var _ = require('lodash');

// Model events to emit
var events = ['save', 'remove'];

export function register(socket) {
  // Bind model events to socket events
  for (var i = 0, eventsLength = events.length; i < eventsLength; i++) {
    var event = events[i];
    var listener = createListener('data:' + event, socket);

    DataEvents.on(event, listener);
    socket.on('disconnect', removeListener(event, listener));

    socket.on('data:save', function(data, fn) {
      console.log(data.title);
      var wordMap = {};
      _.forEach(data.raw, function(data, index) {
        var words = data.words;
        var text = data.text;
        _.forEach(words, function(word) {
          if(!wordMap[word]) wordMap[word] = 0;
          wordMap[word] += 1;
        });
      });
      console.log(wordMap);
      if(fn) fn({result:'ok'});
    });
  }
}


function createListener(event, socket) {
  return function(doc) {
    socket.emit(event, doc);
  };
}

function removeListener(event, listener) {
  return function() {
    DataEvents.removeListener(event, listener);
  };
}
