'use strict';
let app = angular.module('kitchenApp', ['ui.router']);
let apiUrl = "http://localhost:3000";
let socketUrl = "http://localhost:4000"
let socket = io.connect(socketUrl);


app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("login");

  $stateProvider
    .state('login', {
      url: "/login",
      templateUrl: "./partials/login.html",
      controller: "loginCtrl",
      authenticate: false
    })
    .state('main', {
      url: "/main",
      templateUrl: "./partials/main.html",
      controller: "mainCtrl",
      authenticate: false
    })

})


app.controller('loginCtrl',function ($rootScope,$scope, $state) {
  $scope.login = function (storeCode) {
    localStorage.setItem('storeCode', JSON.stringify(storeCode));
    $state.go('main');
  }
})

app.controller('mainCtrl',function ($rootScope,$scope, $state, orderService) {
  let storeCode = localStorage.getItem('storeCode');
  storeCode = JSON.parse(storeCode);

  socket.on('newOrder', function (resp) {
    $scope.$apply(function() { $scope.orders = resp.order; });

  })

    orderService.getStoreOrders(storeCode)
    .then(function (resp) {
      $scope.orders = resp.data;
    },function (err) {
      console.log(err);
      alert('wow much error')
    })

})

app.run(function ($rootScope, $state, AuthService) {
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
    if (toState.authenticate && !AuthService.isAuthenticated()){
      // User isn’t authenticated
      $state.transitionTo("login");
      event.preventDefault();
    }
  });
});


app.service('AuthService',function ($http) {
  this.isAuthenticated = function (params) {
      if(typeof localStorage.token === 'undefined'){
        return false;
      }else if(localStorage.token == null){
          return false;
      }else{
          return true;
      }
  }
});

app.service('orderService',function ($http) {
  this.getStoreOrders = function (storeCode) {
    return $http.get(`${apiUrl}/orders/${storeCode}`)
  }
});
