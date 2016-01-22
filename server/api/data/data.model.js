'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var MediaSchema = new mongoose.Schema({
  title: String,
  type: String,
  population: [mongoose.Schema.Types.Mixed],
  wordCount : Number,
  speakingTime : Number,
  averageSpeed : Number,
  averageWords : Number
});

var SentenceSchema = new mongoose.Schema({
  text: String,
  words: [String],
  source: {
  	type : mongoose.Schema.ObjectId,
  	ref : 'Media'
  },
  index : Number,
  subtitleInfo : {
  	start : String, 
  	end : String,
  	speed : Number  //seconds
  }
});
mongoose.model('Sentence', SentenceSchema);

export default mongoose.model('Media', MediaSchema);
