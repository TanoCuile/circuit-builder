(function(angular){
    var app = angular.module('app', [
        'stri.element',
        'stri.circuit',
        'ngTouch',
        'ngMaterial',
        'ngDraggable',
        'ngRoute',
        'ngResource',
        'ngSanitize',
        'RecursionHelper'
    ]);
    app.factory('MainMenuItems', [function(){
        var list = [];
        return {
            clear: function(){
                list.splice(0, list.length);
                return this;
            },
            sort: function() {
                list.sort(function(a, b){
                    if (a.weight > b.weight)
                        return 1;
                    if(b.weight > a.weight)
                        return -1;
                    return 0;
                });
                return this;
            },
            addItem: function (name, link, classes, weight, reload){
                list.push({
                    name: name,
                    link: link,
                    classes: classes,
                    weight: weight,
                    relaod: reload
                });
                this.sort();
                return this;
            },
            getList: function(){
                return list;
            }
        }
    }]);
    app.controller('LeftSidebarController', ['$scope', 'MainMenuItems', 'User', function($scope, MainMenuItems, User){
        MainMenuItems.clear()
            .addItem('Home', '/', 'md-primary', 0)
            .addItem('Circuits', '/circuits', 'md-primary', 2)
//            .addItem('Blog', '/blog', 'md-primary', 10)
        ;
        User.getCurrentUser().then(
            function(user){
                if (user.id() == 0){
                    MainMenuItems.addItem('Login', '/login', 'md-primary', 3);
                    MainMenuItems.addItem('Register', '/register', 'md-primary', 3);
                } else {
                    MainMenuItems.addItem('Your circuits', '/your-circuits', 'md-primary', 3);
                }
            }
        );
        $scope.list = MainMenuItems.getList();
    }]);
    app.directive('mainMenu', [function(){
        return {
            scope: {
                list: '='
            },
            templateUrl: '/bundles/home/html/front/main-menu.html',
            link: function($scope, attr){
                console.log("$scope", $scope);
            }
        }
    }]);
    app.controller('PageController', ['$scope', function($scope){
        $scope.pageData = {
            title: 'Circuit builder'
        }
    }]);
    app.controller('ContentController', ['$scope', function($scope){
    }]);
    app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
        $routeProvider.when('/', {
            controller: 'ContentController',
            templateUrl: '/bundles/home/html/front/index.html'
        });
        $routeProvider.when('/circuits', {
            controller: 'ContentController',
            templateUrl: '/bundles/home/html/front/circuits.html'
        });
        $routeProvider.when('/circuits/new', {
            controller: 'ContentController',
            templateUrl: '/bundles/home/html/front/circuit.html'
        });
        $routeProvider.when('/circuits/:circuitId', {
            controller: 'ContentController',
            templateUrl: '/bundles/home/html/front/circuit.html'
        });

        $locationProvider.html5Mode(true);
    }]);
})(angular);