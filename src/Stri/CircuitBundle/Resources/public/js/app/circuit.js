(function () {
    angular.module('stri.circuit', ['stri.element', 'stri.circuit_simulator', 'stri.user', 'stri.circuit_engine', 'stri.circuit_simulator_view'])
        .factory('CircuitType', [function () {
            return function (data) {
                console.log("Data", data);
                var typeData = {
                    id: data.id,
                    name: data.name,
                    elements: data.elements
                };

                this.id = function (){
                    return typeData.id;
                };
                this.name = function (name) {
                    if (name) {
                        typeData.name = name;
                        return this;
                    }
                    return typeData.name;
                };

                this.elements = function(elements) {
                    if (elements) {
                        typeData.elements = elements;
                        return this;
                    }
                    return typeData.elements;
                };

                this.toJSON = function () {
                    return {
                        'id': this.id(),
                        'name': this.name(),
                        'elements': this.elements()
                    };
                }
            }
        }])
        .factory('CircuitTypes', ['$q', '$http', 'CircuitType', function ($q, $http, CircuitType) {
            var types = null;
            var onLoad = false;
            var queue = [];
            return {
                getTypes: function () {
                    var defer = $q.defer();

                    if (types) {
                        defer.resolve(types);
                        return defer.promise;
                    }

                    if (onLoad) {
                        queue.push(defer);
                    } else {
                        onLoad = true;
                        $http.get('/bundles/circuit/js/test/circuit_types.json')
                            .success(function (typesData) {
                                if (typeof(typesData) == 'string') {
                                    try {
                                        typesData = JSON.parse(typesData);
                                    } catch (err) {
                                        typesData = [];
                                    }
                                }
                                types = [];

                                angular.forEach(typesData, function (typeData) {
                                    types.push(new CircuitType(typeData))
                                });
                                defer.resolve(types);
                                while (queue.length > 0) {
                                    queue[0].resolve(types);
                                    queue.splice(0, 1);
                                }
                                onLoad = false;
                            });
                    }
                    return defer.promise;
                }
            }
        }])
        .factory('Circuit', [
            '$q',
            '$http',
            '$routeParams',
            'CircuitTypes',
            'Element',
            'Connection',
            'User',
            'Emulator',
            'ViewManager',
            '$rootScope',
            function ($q, $http, $routeParams, CircuitTypes, Element, Connection, User, Emulator, ViewManager, $rootScope) {
                function Circuit(data) {
                    var circuitData = {
                        id: data.id,
                        parameters: {},
                        connections: [],
                        revision: 1,
                        access: data.access,
                        elements: [],
                        views: [],
                        circuitType: data.type,
                        preview: '',
                        type: '',
                        author: 0,
                        name: "",
                        description: ""
                    };
                    var stage = '';

                    var controls = {};

                    if (data.parameters) {
                        circuitData.parameters = data.parameters;
                    }

                    if (data.elements) {
                        angular.forEach(data.elements, function (element) {
                            var elementObject = initializeElement(element);
                            angular.forEach(elementObject.ports(), function (port, key) {
                                controls[port.id] = port;
                            });
                            angular.forEach(elementObject.activePoints(), function (activePoint, key) {
                                controls[activePoint.id] = activePoint;
                            });
                            circuitData.elements.push(elementObject);
                        });
                    }

                    if (data.connections) {
                        angular.forEach(data.connections, function (connection) {
                            connection.source = controls[connection.source];
                            connection.goal = controls[connection.goal];
                            circuitData.connections.push(initializeConnection(connection));
                        });
                    }
                    if (data.views && data.views.length > 0) {
                        angular.forEach(data.views, function(view){
                            if (view.source) {
                                for(var eid in circuitData.elements) {
                                    if (circuitData.elements[eid].id() == view.source) {
                                        view.source = circuitData.elements[eid];
                                        circuitData.views.push(ViewManager.initializeView(view));
                                        break;
                                    }
                                }
                            }
                        }.bind(this));
                        $rootScope.$broadcast('changeViews', circuitData.views);
                    }

                    if (data.author) {
                        circuitData.author = User.getUser(data.author);
                    }
                    if (data.name) {
                        circuitData.name = data.name;
                    }
                    if (data.description) {
                        circuitData.description = data.description;
                    }
                    if (data.type) {
                        circuitData.circuitType = data.type;
                    }
                    var self = this;

                    function getterSetter(fieldName, variable) {
                        return function (value) {
                            if (typeof(value) != 'undefined') {
                                variable[fieldName] = value;
                                return this;
                            }
                            return variable[fieldName];
                        }.bind(self);
                    }

                    this.name = getterSetter('name', circuitData);
                    this.id = getterSetter('id', circuitData);
                    this.author = getterSetter('author', circuitData);
                    this.revision = getterSetter('revision', circuitData);
                    this.access = getterSetter('access', circuitData);
                    this.circuitType = getterSetter('circuitType', circuitData);
                    this.description = getterSetter('description', circuitData);
                    this.views = getterSetter('views', circuitData);

                    this.elements = function () {
                        return circuitData.elements;
                    };
                    this.connections = function () {
                        return circuitData.connections;
                    };
                    this.getTableView = function(){

                    };

                    // TODO: Initialize

                    function initializeConnection(connection) {
                        return new Connection(connection);
                    }

                    function initializeElement(element) {
                        return new Element(element);
                    }

                    /**
                     * Create new element(after drop for example)
                     * @param elementType
                     * @param position
                     */
                    this.createElement = function (elementType, position) {
                        circuitData.push(new Element({
                            elementType: elementType,
                            position: position
                        }));
                    };

                    this.addElement = function (element) {
                        circuitData.elements.push(element);
                        if (this.addElementView) {
                            this.addElementView(element);
                        }
                    };

                    this.stage = function(newStage){
                        if (newStage) {
                            stage = newStage;
                            return this;
                        }
                        return stage;
                    };

                    this.toJSON = function () {
                        var connections = [];
                        for (var cid in this.connections()){
                            connections.push(this.connections()[cid].toJSON());
                        }
                        var elements = [];
                        for (var eid in this.elements()) {
                            elements.push(this.elements()[eid].toJSON());
                        }
                        var views = [];
                        for (var vid in this.views()) {
                            views.push(this.views()[vid].toJSON());
                        }

                        var simplified = {
                            id: circuitData.id,
                            author: circuitData.author.id,
                            name: circuitData.name,
                            description: circuitData.description,
                            parameters: circuitData.parameters,
                            type: circuitData.circuitType,
                            elements: elements,
                            connections: connections,
                            revision: circuitData.revision,
                            access: circuitData.access,
                            views: views
                        };
                        console.log("Simplified", simplified);
                        return  simplified;
                    }
                }

                return {
                    getCircuit: function (circuitId) {
                        var defer = $q.defer();

                        // Load circuitTypes
                        var circuitTypes = CircuitTypes.getTypes();

                        if (circuitId) {
                            $http.get('/api/circuit/' + circuitId)
                                .success(function (circuitData) {
                                    if (typeof(circuitData) == 'string') {
                                        try {
                                            circuitData = JSON.parse(circuitData);
                                        } catch (err) {
                                            circuitData = {};
                                        }
                                    }
                                    var circuit = new Circuit(circuitData);
                                    Emulator.initializeEmulator(circuit);
                                    defer.resolve(circuit);
                                })
                        } else {
                            var circuit = new Circuit({});
                            Emulator.initializeEmulator(circuit);
                            defer.resolve(circuit)
                        }

                        return defer.promise;
                    },
                    saveCircuit: function (circuit) {
                        if (circuit.id()) {
                            $http.put('/api/circuit/' + circuit.id(), {'circuit_data': circuit.toJSON()})
                                .success(function (data){
                                    circuit.id(data.id);
                                });
                        } else {
                            $http.post('/api/circuit/', {'circuit_data': circuit.toJSON()})
                                .success(function (data){
                                    circuit.id(data.id);
                                });
                        }
                    },
                    getCircuitList: function(page){
                        if (!page){
                            page = 0;
                        }
                        var defer = $q.defer();

                        $http.get('/api/circuit?page=' + page)
                            .success(function(data){
                                defer.resolve(data);
                            });

                        return defer.promise;
                    }
                }
            }])
        .directive('svgCanvas', [function () {
            return {
                templateNamespace: 'svg',
                restrict: 'E',
                replace: true,
                transclude: true,
                template: '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"><g ng-transclude></g></svg>',
                link: function ($scope, el) {
                    var container = d3.select(el[0]);
                    var content = container.select('g');
                    container.call(d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", function zoom() {
//                        content.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                    }));
                }
            }
        }])
        .controller('CircuitController', ['$scope', 'Circuit', 'ElementTypes', '$routeParams', '$mdDialog', 'CircuitEngine',
            function ($scope, Circuit, ElementTypes, $routeParams, $mdDialog, CircuitEngine) {
                $scope.circuit = false;
                ElementTypes.getElementTypes().then(function () {
                    // Load and initialize or create circuit
                    if ($routeParams.circuitId) {
                        Circuit.getCircuit($routeParams.circuitId)
                            .then(function (circuit) {
                                $scope.circuit = circuit;
                                CircuitEngine.initializeCircuitView($scope.circuit);
                            })
                        ;
                    } else {
                        Circuit.getCircuit()
                            .then(function (circuit) {
                                // Configure new circuit
                                $scope.circuit = circuit;
                                CircuitEngine.initializeCircuitView($scope.circuit);
                                $scope.configureCircuit();
                            })
                        ;
                    }
                });
                $scope.addElement = function (data, event) {
                    $scope.$broadcast('addElement', {
                        element: data,
                        position: {
                            x: event.x,
                            y: event.y
                        }
                    })
                };
                $scope.circuitManageMenu = [
                    ['Select', function ($itemScope) {
                        $scope.selected = $itemScope.item.name;
                    }],
                    null, // Dividier
                    ['Remove', function ($itemScope) {
                        $scope.items.splice($itemScope.$index, 1);
                    }]
                ];
                $scope.elementTypesShow = false;
                $scope.showElementsPanel = function () {
                    $scope.elementTypesShow = !$scope.elementTypesShow;
                };
                $scope.emulation = false;
                $scope.emulationToggle = function (circuit) {
                    if (!$scope.emulation) {
                        circuit.circuitValidator()
                            .then(function (){
                                $scope.$broadcast('emulationStart');
                                circuit.emulatorStart();
                                $scope.emulation = true;
                            });
                    } else {
                        circuit.emulatorStop();
                        $scope.emulation = false;
                    }
                };

                /**
                 * Show configuration circuit popup
                 */
                $scope.configureCircuit = function () {
                    $mdDialog.show({
                        controller: 'CircuitPropertiesController',
                        templateUrl: '/bundles/circuit/html/circuit_properties.html',
                        bindToController: true,
                        locals: {
                            circuit: $scope.circuit
                        }
                    }).then(function () {

                    })
                };
                $scope.saveCircuit = function (circuit) {
                    Circuit.saveCircuit($scope.circuit);
                };
                $scope.$on('changeElementModelData', function(event, element){
                    $mdDialog.show({
                        controller: 'ElementViewDataController',
                        templateUrl: '/bundles/element/html/element_view_data.html',
                        bindToController: true,
                        locals: {
                            element: element
                        }
                    }).then(function () {

                    })
                });
                $scope.$on('changeElementProperties', function(event, element){
                    $mdDialog.show({
                        controller: 'ElementPropertiesController',
                        templateUrl: '/bundles/element/html/element_properties.html',
                        bindToController: true,
                        locals: {
                            element: element
                        }
                    }).then(function () {

                    })
                });
                $scope.$on('addElementView', function(event, element){
                    $mdDialog.show({
                        controller: 'ViewConstructorController',
                        templateUrl: '/bundles/circuit/html/views/view_constructor.html',
                        bindToController: true,
                        locals: {
                            element: element
                        }
                    }).then(function (view) {
                        if (typeof(view) == 'object') {
                            $scope.circuit.views().push(view);
                            $scope.$broadcast('changeViews');
                        }
                    })
                });

                /**
                 * Show connection config popup
                 */
                $scope.configureConnection = function () {

                };

                /**
                 * Show element configuration popup
                 */
                $scope.configureElement = function () {

                };
            }])
        .controller('ViewConstructorController', ['$scope', 'ViewManager', '$mdDialog', function($scope, ViewManager, $mdDialog){
            $scope.element = this.element;
            $scope.config = ViewManager.getViewConfig($scope.element);
            $scope.types = ViewManager.getViewTypes();
            $scope.codeMirrorOptions = {
                lineNumbers: true,
                value: "",
                mode: "javascript",
                styleActiveLine: true,
                matchBrackets: true,
                theme: 'monokai'
            };
            $scope.add = function() {
                $mdDialog.hide(ViewManager.initializeView($scope.config));
            }
            $scope.cancel = function(){
                $mdDialog.cancel();
            }
        }])
        .controller('CircuitListController', ['$scope', 'Circuit', function($scope, Circuit){
            $scope.list = {};
            Circuit.getCircuitList().then(function(list){
                $scope.list = list;
            });
        }])
        .controller('ElementViewDataController', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
            $scope.element = this.element;
            $scope.save = function(){
                $mdDialog.hide();
            }
        }])
        .controller('ElementPropertiesController', ['$scope', '$mdDialog', function ($scope, $mdDialog){
            $scope.element = this.element;
            $scope.save = function(){
                $mdDialog.hide();
            }
        }])
        .controller('CircuitPropertiesController', ['$scope', 'CircuitTypes', '$mdDialog', function ($scope, CircuitTypes, $mdDialog) {
            $scope.circuit = this.circuit;
            CircuitTypes.getTypes().then(function (types) {
                $scope.types = types;
            });
            $scope.accessTypes = [
                {
                    value: 'public',
                    label: 'Public'
                },
                {
                    value: 'private',
                    label: 'Private'
                }
            ];
            $scope.save = function () {
                $mdDialog.hide();
            }
        }])
        .directive('circuit', [
            'Circuit',
            'Point',
            'Connection',
            'Element',
            'CircuitEngine',
            function (Circuit, Point, Connection, Element, CircuitEngine) {
                return {
                    templateNamespace: 'svg',
                    restrict: 'E',
                    replace: true,
                    scope: {
                        circuit: '=',
                        circuitConfig: '&',
                        elementConfig: '&'
                    },
                    template: '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' +
                        '<g class="circuit-container">' +
                        "</g>" +
                        '</svg>',
                    link: function ($scope, el) {
                        $scope.circuit.initializeEngine(el[0]);
                        // Contains action depended from scope
                        $scope.$on('addElement', function (e, data) {
                            if ($scope.circuit.stage() != 'building') {
                                return false;
                            }
                            var x = data.position.x;
                            var y = data.position.y;
                            var elementBox = el[0].getBoundingClientRect();
                            var element = new Element({
                                position: {
                                    x: x - elementBox.left,
                                    y: y - elementBox.top
                                },
                                elementType: data.element.name()
                            });
                            console.log($scope.circuit);
                            $scope.circuit.addElement(element);
                        });
                    }
                }
            }])
    ;
})();