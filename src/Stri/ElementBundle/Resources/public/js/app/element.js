(function () {
    angular.module('stri.element', ['stri.element_type'])
        .factory('Element', ['Point', 'ElementTypes', 'idGenerator', function(Point, ElementTypes, idGenerator){
            return function (elementData){
                var data = {
                    parameters: {},
                    elementType: '',
                    stage: {},
                    modelData: {},
                    position: {
                        x: 0,
                        y: 0
                    },
                    viewData: {
                        title: '',
                        articleCode: '',
                        size: '',
                        weight: '',
                        manufacturer: '',
                        type: ''
                    },
                    activePoints: [],
                    ports: [],
                    currentView: 'defaultView'
                };
                var self = this;


                if (!elementData.elementType || !elementData.position) {
                    delete this;
                    return false;
                }

                this.elementType = getterSetter('elementType', data);
                this.elementType(elementData.elementType);
                var elementTypeData = ElementTypes.getType(this.elementType());
                this.currentView = getterSetter('currentView', data);
                this.parametersConfig = function(){
                    console.log("Conf", elementTypeData.getParameters());
                    return elementTypeData.getParameters();
                };
                this.currentView(elementData.currentView ? elementData.currentView : 'defaultView');

                // Element active points
                angular.forEach(elementTypeData.view(this.currentView()).activePoints(), function(activePoint, id){
                    if (elementData.activePoints && elementData.activePoints[id]) {
                        data.activePoints[id] = elementData.activePoints[id];
                        data.activePoints[id].config = activePoint;

                    } else {
                        data.activePoints[id] = {
                            config: activePoint
                        };
                    }
                });

                // Element ports
                angular.forEach(elementTypeData.view(this.currentView()).ports(), function(port, id){
                    if (elementData.ports && elementData.ports[id]) {
                        data.ports[id] = {};
                        data.ports[id].id = elementData.ports[id];
                        data.ports[id].config = port;
                        data.ports[id].connections = [];
                    } else {
                        data.ports[id] = {
                            config: port,
                            connections: []
                        };
                    }
                });

                if (!data.viewData.shortCut) {
                    data.viewData.shortCut = {
                        title:elementTypeData.view(this.currentView()).shortCut(),
                        position: {
                            x: elementTypeData.view(this.currentView()).shortCutX(),
                            y: elementTypeData.view(this.currentView()).shortCutY()
                        }
                    };
                }
                function getterSetter (fieldName, variable) {
                    return function (value){
                        if (typeof(value) != 'undefined'){
                            variable[fieldName] = value;
                            return this;
                        }
                        return variable[fieldName];
                    }.bind(self);
                }

                this.getElementTypeData = function (){
                    return elementTypeData;
                };
                this.viewData = getterSetter('viewData', data);
                this.viewData(elementData.viewData);
                this.id = getterSetter('id', data.viewData);
                this.parameters = getterSetter('parameters', data);
                this.stage = getterSetter('stage', data);
                this.modelData = getterSetter('modelData', data);
                this.position = function(newPosition) {
                    if (newPosition){
                        data.position.x = newPosition.x;
                        data.position.y = newPosition.y;
                        return this;
                    }
                    return data.position;
                };
                this.position(elementData.position);
                this.modelData(elementData.modelData);
                this.title = getterSetter('title', data.modelData);
                this.articleCode = getterSetter('articleCode', data.modelData);
                this.size = getterSetter('size', data.modelData);
                this.weight = getterSetter('weight', data.modelData);
                this.manufacturer = getterSetter('manufacturer', data.modelData);
                this.type = getterSetter('type', data.modelData);
                this.stage(elementData.stage && elementData.stage.length != 0 ? elementData.stage : {});
                this.parameters(elementData.parameters);
                if (!data.parameters) {
                    data.parameters = {};
                }
                angular.forEach(elementTypeData.getParameters(), function (parameter, key){
                    if (!data.parameters[parameter.machineName]) {
                        data.parameters[parameter.machineName] = parameter.defaultValue;
                    }
                });
                if (elementData.id) {
                    this.id(elementData.id);
                } else {
                    this.id(idGenerator.generate());
                }
                this.view = function(){
                    return elementTypeData.view(this.currentView()).image;
                };
                this.height = function(){
                    if (typeof(elementTypeData.view(this.currentView()).height) == 'string') {
                        elementTypeData.view(this.currentView()).height = parseFloat(elementTypeData.view(this.currentView()).height);
                    }
                    return elementTypeData.view(this.currentView()).height;
                };
                this.width = function(){
                    if (typeof(elementTypeData.view(this.currentView()).width) == 'string') {
                        elementTypeData.view(this.currentView()).width = parseFloat(elementTypeData.view(this.currentView()).width);
                    }
                    return elementTypeData.view(this.currentView()).width;
                };
                this.port = function(port, portData){
                    if (portData){
                        data.ports[port] = portData;
                    }
                    return data.ports[port];
                };
                this.ports = function(){
                    return data.ports;
                };
                this.activePoint = function(ap, apData){
                    if (apData) {
                        data.activePoints[ap] = apData;
                        return this;
                    }
                    return data.activePoints[ap];
                };
                this.activePoints = function (){
                    return data.activePoints;
                };

                this.action = function(actionName){
                    return elementTypeData.getStringAlgorithm(actionName);
                };
                this.validate = function(){
                    var valid = true;
                    angular.forEach(data.ports, function(port){
                        if (port.config.role() == 'in' && !port.connect.length == 0) {
                            valid = false;
                        }
                    });
                };
                this.depended = function(){
                    var dependions = [];
                    angular.forEach(data.ports, function(port){
                        if (port.config.role() == 'in' && !port.connect.length != 0) {
                            angular.forEach(port.connect, function(connId){
                                dependions.push(connId);
                            })
                        }
                    });
                    return dependions;
                };

                this.role = function(){
                    return elementTypeData.role()
                };

                this.toJSON = function(){
                    var portsForSave = {};
                    var activePointsForSave = {};
                    // Element active points
                    angular.forEach(data.activePoints, function(activePoint, id){
                        activePointsForSave[id] = activePoint.id;
                        activePointsForSave[id].config = id;
                    });

                    // Element ports
                    angular.forEach(data.ports, function(port, id){
                        portsForSave[id] = port.id;
                        portsForSave[id].config = id;
                    });

                    return {
                        id: data.viewData.id,
                        viewData: data.viewData,
                        position: data.position,
                        elementType: data.elementType,
                        ports: portsForSave,
                        activePoints: activePointsForSave,
                        modelData: data.modelData,
                        parameters: data.parameters,
                        stage: data.stage,
                        currentView: data.currentView
                    }
                };
            }
        }])
        .controller('ElementTypesController', ['$scope', 'ElementTypes', function($scope, ElementTypes){
            $scope.types = {};
            ElementTypes.getElementTypes().then(function(types){
                $scope.types = types;
            });
        }])
    ;
})();