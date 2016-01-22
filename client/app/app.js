'use strict';

angular.module('ghcapWebApp', [
  'ghcapWebApp.auth',
  'ghcapWebApp.admin',
  'ghcapWebApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'validation.match',
  'infinite-scroll'
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
