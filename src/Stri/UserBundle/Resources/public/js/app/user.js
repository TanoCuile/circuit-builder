(function (){
    angular.module('stri.user', [])
        .factory('User', ['$q', '$http', function ($q, $http){
            function User(data) {
                var userData = {
                    id: 0,
                    name: "",
                    role: "student",
                    group: {
                        id: 1,
                        name: ""
                    }
                };
                function userPrepareData(newData) {
                    userData.id = newData.id;
                    userData.name = newData.name;
                    userData.role = newData.role;
                }
                function getterSetter(fieldName, variable) {
                    return function (value) {
                        if (typeof(value) != 'undefined') {
                            variable[fieldName] = value;
                            return this;
                        }
                        return variable[fieldName];
                    }.bind(self);
                }
                this.id = getterSetter('id', userData);
                this.name = getterSetter('name', userData);
                this.role = getterSetter('role', userData);
                userPrepareData(data);
            }
            var queue = [];
            var onLoad = false;
            var currentUser = null;
            return {
                getCurrentUser: function() {
                    var defer = $q.defer();
                    if (!currentUser && !onLoad) {
                        $http.get('/api/user/')
                            .success(function (userData){
                                if (typeof(userData) == 'string') {
                                    try{
                                        userData = JSON.parse(userData);
                                    } catch(err) {
                                        userData = {}
                                    }
                                }
                                currentUser = new User(userData);
                                defer.resolve(currentUser);
                                while(queue.length > 0){
                                    queue[0].resolve(currentUser);
                                    queue.splice(0, 1);
                                }
                                onLoad = false;
                            });
                    } else if(onLoad) {
                        queue.push(defer);
                    } else {
                        defer.resolve(currentUser);
                    }

                    return defer.promise;
                },
                getUser: function(userId) {
                    var defer = $q.defer();
                    $http.get('/api/user/' + userId)
                        .success(function (userData){
                            if (typeof(userData) == 'string') {
                                try{
                                    userData = JSON.parse(userData);
                                } catch(err) {
                                    userData = {}
                                }
                            }
                            defer.resolve(new User(userData));
                        });

                    return defer.promise;
                }
            }
        }])
    ;
})();