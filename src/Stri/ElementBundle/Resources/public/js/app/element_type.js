(function () {
    angular.module('stri.element_type', [])
        // Describe ActivePoint functionality
        .provider('ActivePoint', [function () {
            function ActivePoint(data) {
                var pointData = {
                    x: 0,
                    y: 0,
                    id: '',
                    dir: '',
                    callback: ''
                };

                this.prepareData = function (newData) {
                    pointData.x = newData.x ? newData.x : pointData.x;
                    pointData.y = newData.y ? newData.y : pointData.y;
                    pointData.id = newData.id ? newData.id : pointData.id;
                    pointData.dir = newData.dir ? newData.dir : pointData.dir;
                    pointData.callback = newData.callback ? newData.callback : pointData.callback;
                };
                this.prepareData(data);
                this.r = function () {
                    return 3;
                };
                this.id = function (id) {
                    if (id) {
                        pointData.id = id;
                        return this;
                    } else {
                        return pointData.id;
                    }
                };
                this.x = function (x) {
                    if (x) {
                        pointData.x = x;
                        return this;
                    } else {
                        return pointData.x;
                    }
                };
                this.y = function (y) {
                    if (y) {
                        pointData.y = y;
                        return this;
                    } else {
                        return pointData.y;
                    }
                };
                this.dir = function (dir) {
                    if (dir) {
                        pointData.dir = dir;
                        return this;
                    }
                    return pointData.dir;
                };
                this.callback = function (callback) {
                    if (callback) {
                        pointData.callback = callback;
                        return this;
                    } else {
                        return pointData.callback;
                    }
                };
                this.toJSON = function () {
                    return pointData;
                }
            }

            return {
                constructor: ActivePoint,
                $get: [function () {
                    return ActivePoint
                }]
            }
        }])
        // Describe Port(i.e. IOPoint) functionaliy
        .provider('IOPoint', ['ActivePointProvider', function (ActivePoint) {
            function IOPoint(data) {
                var pointData = {
                    x: 0,
                    y: 0,
                    id: '',
                    dir: 'left',
                    callback: '',
                    role: 'both' //in,out,both,
                };

                this.prepareData = function (newData) {
                    pointData.x = newData.x ? newData.x : pointData.x;
                    pointData.y = newData.y ? newData.y : pointData.y;
                    pointData.id = newData.id ? newData.id : pointData.id;
                    pointData.dir = newData.dir ? newData.dir : pointData.dir;
                    pointData.callback = newData.callback ? newData.callback : pointData.callback;
                    pointData.role = newData.role ? newData.role : pointData.role;
                };

                this.prepareData(data);

                this.r = function () {
                    return 3;
                };
                this.id = function (id) {
                    if (id) {
                        pointData.id = id;
                        return this;
                    } else {
                        return pointData.id;
                    }
                };
                this.x = function (x) {
                    if (x) {
                        pointData.x = x;
                        return this;
                    } else {
                        return pointData.x;
                    }
                };
                this.y = function (y) {
                    if (y) {
                        pointData.y = y;
                        return this;
                    } else {
                        return pointData.y;
                    }
                };
                this.dir = function (dir) {
                    if (dir) {
                        pointData.dir = dir;
                        return this;
                    }
                    return pointData.dir;
                };
                this.callback = function (callback) {
                    if (callback) {
                        pointData.callback = callback;
                        return this;
                    } else {
                        return pointData.callback;
                    }
                }

                this.role = function (role) {
                    if (role) {
                        pointData.role = role;
                        return this;
                    }
                    return pointData.role;
                }

                this.toJSON = function () {
                    return pointData;
                }
            }

            IOPoint.prototype = new ActivePoint.constructor({});

            return {
                constructor: IOPoint,
                $get: [function () {
                    return IOPoint;
                }]
            };
        }])
        // ElementTypeView contains view-depended data like: ports ActivePoints
        .provider('ElementTypeView', ['ActivePointProvider', 'IOPointProvider', function (ActivePoint, IOPoint) {
            function ElementTypeView(name, label, isDefault) {
                var viewData;
                if (typeof(name) == 'string') {
                    viewData = {
                        name: name,
                        label: label,
                        details: [],
                        shortCut: {
                            title: '',
                            position: {
                                x: 0,
                                y: 0
                            }
                        },
                        isDefault: isDefault ? isDefault : false
                    };
                } else if (typeof(name) == 'object') {
                    viewData = name;
                }

                this.prepareData = function () {
                    if (!viewData.name) {
                        console.error("View without name");
                    }
                    viewData = angular.extend({}, {
                        label: '',
                        image: '',
                        images: [],
                        details: [],
                        ports: [],
                        activePoints: []
                    }, viewData);
                    if (!viewData.shortCut) {
                        viewData.shortCut = {
                            title: '',
                            position: {
                                x: 0,
                                y: 0
                            }
                        }
                    }
                    if (!viewData.size) {
                        viewData.size = {
                            width: 0,
                            height: 0,
                            x: 0,
                            y: 0
                        };
                    }

                    if (!viewData.images){
                        viewData.images = [];
                    }

                    if (viewData.ports && viewData.ports.length != 0) {
                        angular.forEach(viewData.ports, function (port, key) {
                            if (!(port instanceof IOPoint.constructor)) {
                                viewData.ports[key] = new IOPoint.constructor(port);
                            }
                        });
                    } else {
                        viewData.ports = {};
                    }
                    if (viewData.activePoints && viewData.activePoints.length != 0) {
                        angular.forEach(viewData.activePoints, function (activePoint, key) {
                            if (!(activePoint instanceof ActivePoint.constructor)) {
                                viewData.activePoints[key] = new ActivePoint.constructor(activePoint);
                            }
                        });
                    } else {
                        viewData.activePoints = {};
                    }
                };
                this.prepareData();
                this.image = function (image) {
                    if (image) {
                        viewData.image = iamge;
                        return this;
                    } else {
                        return viewData.image;
                    }
                };
                this.images = function (images) {
                    if (images) {
                        viewData.images = iamge;
                        return this;
                    } else {
                        return viewData.images;
                    }
                };
                this.selectImage = function (id) {
                    if (viewData.images[id]) {
                        viewData.image = viewData.images[id];
                    }
                };
                this.width = function (width) {
                    if (width) {
                        viewData.size.width = width;
                        return this;
                    }
                    return viewData.size.width;
                };
                this.height = function (height) {
                    if (height) {
                        viewData.size.height = height;
                        return this;
                    }
                    return viewData.size.height;
                };
                this.y = function (y) {
                    if (y) {
                        viewData.size.y = y;
                        return this;
                    }
                    return viewData.size.y;
                };
                this.x = function (x) {
                    if (x) {
                        viewData.size.x = x;
                        return this;
                    }
                    return viewData.size.x;
                };
                this.name = function (name) {
                    if (name) {
                        viewData.name = name;
                        return this;
                    } else {
                        return viewData.name;
                    }
                };
                this.label = function (label) {
                    if (label) {
                        viewData.label = label;
                        return this;
                    } else {
                        return viewData.label;
                    }
                };
                this.shortCut = function (shortCut) {
                    if (shortCut) {
                        viewData.shortCut.title = shortCut;
                        return this;
                    }
                    return viewData.shortCut.title;
                };
                this.shortCutX = function (shortCutX) {
                    if (shortCutX) {
                        viewData.shortCut.position.x = shortCutX;
                        return this;
                    }
                    return viewData.shortCut.position.x;
                };
                this.shortCutY = function (shortCutY) {
                    if (shortCutY) {
                        viewData.shortCut.position.y = shortCutY;
                        return this;
                    }
                    return viewData.shortCut.position.y;
                };
                this.details = function(){
                    return viewData.details;
                };
                this.activePoints = function () {
                    return viewData.activePoints;
                };
                this.activePoint = function (key, pointData) {
                    if (pointData) {
                        if (!(pointData instanceof ActivePoint.constructor)) {
                            pointData = new ActivePoint.constructor(pointData);
                        }
                        viewData.activePoints[key] = pointData;
                        return this;
                    } else if (pointData === false) {
                        delete(viewData.activePoint[key]);
                        return false;
                    } else {
                        return viewData.activePoints[key];
                    }
                };
                this.port = function (key, portData) {
                    if (portData) {
                        if (!(portData instanceof IOPoint.constructor)) {
                            portData = new IOPoint.constructor(portData);
                        }
                        viewData.ports[key] = portData;
                        return this;
                    } else if (portData === false) {
                        delete(viewData.ports[key]);
                        return this;
                    } else {
                        return viewData.ports[key];
                    }
                };
                this.ports = function () {
                    return viewData.ports;
                };
                this.toJSON = function () {
                    var simplified = angular.copy(viewData);
                    simplified.ports = {};
                    simplified.activePoints = {};

                    angular.forEach(this.ports(), function (port, key) {
                        simplified.ports[key] = port.toJSON();
                    });
                    angular.forEach(this.activePoints(), function (activePoint, key) {
                        simplified.activePoints[key] = activePoint.toJSON();
                    });
                    return simplified;
                }
            };
            return {
                constructor: ElementTypeView,
                $get: [function () {
                    return ElementTypeView;
                }]
            }
        }])
        // ElementType parameter
        .provider('Parameter', [function () {
            function Parameter(data) {
                this.machineName = '';
                this.label = '';
                this.type = 'text';
                this.defaultValue = '';
                this.options = [];
                this.additional = {};
                this.prepareData = function (newData) {
                    this.machineName = newData.machineName ? newData.machineName : '';
                    this.label = newData.label ? newData.label : '';
                    this.type = newData.type ? newData.type : '';
                    this.defaultValue = newData.defaultValue ? newData.defaultValue : '';
                    this.options = newData.options ? newData.options : [];
                    this.additional = newData.additional ? newData.additional : {};
                    this.role = newData.role ? newData.role : 'eleemnt';
                };
                this.prepareData(data ? data : {});
                this.getAllowedTypes = function () {
                    return {
                        text: {
                            label: 'Text'
                        },
                        checkbox: {
                            label: 'Checkbox'
                        },
                        checkboxes: {
                            label: 'Multiple'
                        },
                        select: {
                            label: 'Select'
                        },
//                        callback: {
//                            label: 'Callback'
//                        }
                    }
                };
                this.toJSON = function () {
                    return {
                        'machineName': this.machineName,
                        label: this.label,
                        type: this.type,
                        defaultValue: this.defaultValue,
                        options: this.options,
                        additional: this.additional
                    }
                }
            };
            return {
                constructor: Parameter,
                $get: [function () {
                    return Parameter;
                }]
            }
        }])
        .provider('ElementType', [
            'ActivePointProvider', 'IOPointProvider', 'ParameterProvider', 'ElementTypeViewProvider',
            function (ActivePoint, IOPoint, Parameter, ElementTypeView) {
                function ElementType(data) {
                    var typeData = {
                        name: '',
                        machineName: '',
                        previews: []
                    };
                    var self = this;

                    function emptyCallback() {
                    };
                    var emptyAlgorithm = {
                        tick: 'console.log("tick")',
                        click: 'console.log("click")',
                        start: 'console.log("start")'
                    };

                    function prepareCallback(newData, key) {
                        var callBack = emptyAlgorithm[key];
                        if (!newData.algorithm[key])
                            newData.algorithm[key] = callBack;
                        else if (typeof(newData.algorithm[key]) == 'string')
                            newData.algorithm[key] = new Function(newData.algorithm[key]);
                    }

                    function prepareData(newData) {
                        newData.id = newData.id ? newData.id : null;
                        newData.name = newData.name ? newData.name : '';
                        newData.machineName = newData.machineName ? newData.machineName : '';
                        newData.previews = newData.previews ? newData.previews : [];
                        if (!newData.algorithm || newData.algorithm.length == 0) {
                            newData.algorithm = {
                                start: emptyAlgorithm['start'],
                                tick: emptyAlgorithm['tick'],
                                click: emptyAlgorithm['click']
                            };
                        } else {
//                            prepareCallback(newData, 'start');
//                            prepareCallback(newData, 'tick');
//                            prepareCallback(newData, 'click');
                        }
                        if (!newData.parameters || newData.parameters.length == 0) {
                            newData.parameters = {};
                        } else {
                            angular.forEach(newData.parameters, function (parameter, key) {
                                newData.parameters[key] = new Parameter.constructor(parameter);
                            });
                        }
                        if (!newData.views || newData.views.length == 0) {
                            newData.views = {
                                defaultView: new ElementTypeView.constructor('defaultView', 'Default', true)
                            }
                        } else {
                            angular.forEach(newData.views, function (view, name) {
                                if (!(view instanceof ElementTypeView.constructor)) {
                                    newData.views[name] = new ElementTypeView.constructor(view);
                                }
                            });
                        }

                        return newData;
                    }

                    this.createActivePoint = function (defaults) {
                        return new ActivePoint.constructor(defaults);
                    };
                    this.createPort = function (defaults) {
                        return new IOPoint.constructor(defaults);
                    };
                    this.createParameter = function (defaults) {
                        return new Parameter.constructor(defaults);
                    };
                    this.getStringAlgorithm = function (name) {
                        return this.getAlgorithm(name);//.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1]
                    };
                    this.createView = function createView(name, label, isDefault) {
                        return new ElementTypeView.constructor(name, label, isDefault);
                    };

                    function getterSetter(fieldName, variable) {
                        return function (value) {
                            if (typeof(value) != 'undefined') {
                                variable[fieldName] = value;
                                return this;
                            }
                            return variable[fieldName];
                        }.bind(self);
                    }

                    function getter(fieldName, variable) {
                        return function () {
                            return variable[fieldName];
                        }.bind(self);
                    }

                    this.previews = function () {
                        return typeData.previews;
                    };

                    this.setData = function (newData) {
                        typeData = prepareData(newData);

                        this.role = getterSetter('role', typeData);
                        this.name = getterSetter('name', typeData);
                        this.preview = getterSetter('preview', typeData);
                        this.machineName = getterSetter('machineName', typeData);
                        this.id = getterSetter('id', typeData);
                    };
                    // Parameters collection
                    this.getParameters = function () {
                        return typeData.parameters;
                    };
                    // Parameter edit
                    this.getParameter = function (key) {
                        return typeData.parameters[key];
                    };
                    this.setParameter = function (key, value) {
                        if (!(value instanceof Parameter.constructor)) {
                            value = new Parameter.constructor(value);
                        }
                        typeData.parameters[key] = value;
                        return this;
                    };
                    this.addParameter = function (name, parameter) {
                        typeData.parameters[name] = parameter;
                        return this;
                    };
                    this.removeParameter = function (name) {
                        delete(typeData.parameters[name]);
                        return this;
                    };
                    // Algorithm managing
                    this.getAlgorithm = function (name) {
                        return typeData.algorithm[name];
                    };
                    this.getAlgorithms = function () {
                        return typeData.algorithm;
                    };
                    this.setAlgorithm = function (name, value) {
                        typeData.algorithm[name] = value;
                    };
                    // Manage views
                    this.view = function (name, data) {
                        if (data) {
                            typeData.views[name] = data;
                            return this;
                        }
                        return typeData.views[name];
                    };
                    this.setView = function (name, view) {
                        typeData.views[name] = view;
                        return this;
                    };
                    this.getViews = function () {
                        return typeData.views;
                    };
                    this.removeView = function (name) {
                        delete(typeData.views[name]);
                        return this;
                    };
                    this.setData(data);

                    this.toJSON = function () {
                        var simplified = {};

                        angular.forEach(typeData, function (value, key) {
                            simplified[key] = value;
                        });

                        simplified.views = {};
                        simplified.parameters = {};

                        angular.forEach(typeData.views, function (view, machineName) {
                            simplified.views[machineName] = view.toJSON();
                        });
                        angular.forEach(typeData.parameters, function (parameter, machineName) {
                            simplified.parameters[machineName] = parameter.toJSON();
                        });
                        simplified.algorithm = {
                            start: this.getStringAlgorithm('start'),
                            tick: this.getStringAlgorithm('tick'),
                            click: this.getStringAlgorithm('click')
                        };
                        console.log("Algo", simplified.algorithm);
                        return simplified;
                    }
                }

                return {
                    constructor: ElementType,
                    $get: [function () {
                        return ElementType;
                    }]
                };
            }])
        // Provide manage ElementTypes collection
        .provider('ElementTypes', [function () {
            var typesList = null;
            var typesTree = {};
            var callbackQueue = [];
            var onLoading = false;
            return {
                getTypeList: function () {
                    return typesList;
                },
                getTypesTree: function () {
                    return typesTree;
                },
                // TODO: Async loading
                getType: function (name) {
                    return typesList[name];
                },
                // TODO: Load previews
                $get: ['$q', '$http', 'ElementType', function ($q, $http, ElementType) {
                    function prepareElementTypes() {
                        // TODO: Temp
                        var defer = $q.defer();
                        if (!typesList && !onLoading) {
                            onLoading = true;
                            $http.get('/api/element_type')
                                .success(function (elementTypesData) {
                                    typesList = {};
                                    if (typeof(elementTypesData) == 'string') {
                                        try {
                                            elementTypesData = JSON.parse(elementTypesData);
                                        } catch (err) {
                                            elementTypesData = [];
                                        }
                                    }
                                    angular.forEach(elementTypesData, function (elementType, key) {
                                        typesList[key] = new ElementType(elementType);
                                    });
                                    defer.resolve(typesList);

                                    var i = 0;
                                    while (callbackQueue.length > 0) {
                                        callbackQueue[0].resolve(typesList);
                                        callbackQueue.splice(0, 1);
                                        ++i;
                                    }
                                    onLoading = false;
                                });
                        } else if (onLoading) {
                            callbackQueue.push(defer);
                        } else {
                            defer.resolve(typesList);
                        }
                        return defer.promise;
                    }

                    return {
                        getElementTypes: prepareElementTypes,
                        getTypeList: function () {
                            return typesList;
                        },
                        getTypesTree: function () {
                            return typesTree;
                        },
                        getType: function (name) {
                            return typesList[name];
                        }
                    };
                }]
            }
        }])
        .run(['ElementTypes', function (ElementTypes) {
            ElementTypes.getElementTypes();
        }])
    ;

})();