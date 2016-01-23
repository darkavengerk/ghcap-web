/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var db = require('./data.model');
var DataEvents = require('./data.events');
var Data = db.model('Media');
var Sentence = db.model('Sentence');
var Misc = db.model('Misc');
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

  }

  socket.on('media:get', function(query, fn) {
    Data.find(query, function(err, result) {
      fn(result);
    });
  });

  socket.on('misc:save common words', function(words, fn) {
    Misc.update({title:'common-words'}, {title:'common-words', data:words}, {upsert:true}, function(err, result) {
      fn([err, result]);
    });
  });

  socket.on('data:save', function(data, fn) {
    console.log('Saving a doc', data.title, data.type);
    var wordMap = {};
    var sentences = [];
    var spokenTime = 0;
    var wordCount = 0;

    _.forEach(data.raw, function(data, index) {
      var words = data.words;
      var text = data.text;
      spokenTime += data.duration;
      wordCount += data.count;
      _.forEach(words, function(word) {
        if(!wordMap[word]) wordMap[word] = 0;
        wordMap[word] += 1;
      });
    });

    var population = _.pairs(wordMap);
    population = _.sortBy(population, function(item) {
      return item[1] * -1;
    });

    var media = new Data({
      title : data.title,
      type : data.type,
      wordCount : wordCount,
      speakingTime : spokenTime,
      averageSpeed : wordCount/spokenTime * 1000,
      population : population
    });

    var sentences = _.map(data.raw, function(data, index) {
      var words = data.words;
      var text = data.text;
      return {
        text : text,
        words : words,
        source : media._id,
        index : index,
        subtitleInfo : {
          start : data.start,
          end : data.end,
          speed : data.count / data.duration * 1000
        }
      };
    });

    media.save(function(err, result) {
      console.log('Done creating a media :', err);
      Sentence.create(sentences, function(err, result) {
        console.log('Done creating sentences: ', err);
        if(fn) fn({result:'ok'});
      });
    });
  });
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
