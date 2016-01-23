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
mongoose.model('Media', MediaSchema);

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


var MiscSchema = new mongoose.Schema({
  title: String,
  data: mongoose.Schema.Types.Mixed,
});
mongoose.model('Misc', MiscSchema);


export default mongoose;
