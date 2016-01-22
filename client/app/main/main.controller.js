'use strict';

(function() {

class MainController {

  constructor($http, $scope, socket, Auth) {
    this.$http = $http;
    this.awesomeThings = [];
    this.media = [];
    this.isLoggedIn = Auth.isLoggedIn();
    this.isAdmin = Auth.isAdmin();
    this.currentUser = Auth.getCurrentUser();
    this.mode = 'title';

    $http.get('/api/things').then(response => {
      this.awesomeThings = response.data;
      socket.syncUpdates('thing', this.awesomeThings);
    });

    $http.get('/api/data').then(response => {
      this.media = response.data;
      socket.syncUpdates('data', this.media);
    });

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('thing');
    });
  }

  mediaSelected(mediaId) {
    this.$http.get('/api/data/'+mediaId).then(response => {
      this.selectedMedia = response.data;
      this.wordList = [];
      this.loadMoreWords();
      this.mode = 'media'
    });
  }

  loadMoreWords() {
    if(this.selectedMedia) {
      var source = this.selectedMedia.population;
      var target = this.wordList;
      this.wordList = target.concat( source.slice(target.length, target.length + 20));
    }
  }

  showSentences(item) {
    var word = item[0];
    var source = this.selectedMedia.sentences;
    var sentences = [];
    _.forEach(source, function(sentence) {
      if(sentence.words.indexOf(word) !== -1) {
        sentences.push(sentence);
      }
    });
    item.sentences = sentences;
  }
}

angular.module('ghcapWebApp')
  .controller('MainController', MainController);

})();
