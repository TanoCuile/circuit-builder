(function (angular) {
    var admin = angular.module('admin', [
        'app',
        'stri.admin.element_type',
        'schemaForm',
        'angularFileUpload',
        'ui.codemirror',
        'angularFileUpload'
    ]);
    admin.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.when('/admin', {
            controller: 'ContentController',
            templateUrl: '/bundles/home/html/admin/index.html'
        });
        $routeProvider.when('/admin/element_type', {
            controller: 'ContentController',
            templateUrl: '/bundles/element/html/admin/element_type.list.html'
        });
        $routeProvider.when('/admin/element_type/new', {
            controller: 'ContentController',
            templateUrl: '/bundles/element/html/admin/element_type.edit.html'
        });
        $routeProvider.when('/admin/element_type/:elementTypeName', {
            controller: 'ContentController',
            templateUrl: '/bundles/element/html/admin/element_type.edit.html'
        });

        $locationProvider.html5Mode(true);
    }]);
    admin.controller('AdminLeftSidebarController',
        ['$scope', 'MainMenuItems', 'User', function ($scope, MainMenuItems, User) {
            MainMenuItems.clear()
                .addItem('Home', '/', 'md-primary', 0)
                .addItem('Circuits', '/circuits', 'md-primary', 2)
            ;
            User.getCurrentUser().then(
                function (user) {
                    if (user.id() == 0) {
                        MainMenuItems.addItem('Login', '/login', 'md-primary', 3);
                        MainMenuItems.addItem('Register', '/register', 'md-primary', 3);
                    } else {
                        MainMenuItems.addItem('Your circuits', '/your-circuits', 'md-primary', 3);
                    }
                }
            );
            $scope.list = MainMenuItems.getList();
        }
        ]);
})(angular);