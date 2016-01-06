'use strict';

angular.module('ghcapWebApp.auth', [
  'ghcapWebApp.constants',
  'ghcapWebApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
