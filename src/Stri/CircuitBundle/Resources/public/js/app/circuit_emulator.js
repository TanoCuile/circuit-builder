(function(){
    angular.module('stri.circuit_simulator', [])
        .factory('Emulator', ['$q', '$rootScope', function($q, $rootScope){
            var i = 0;
            // TODO: No moves while emulation
            var connectionMap = {};
            var customVars = {};
            var emulation = false;

            function makeNumber(value) {
                if (typeof(value) == 'string') {
                    value = parseFloat(value.replace(',', '.'));
                }
                return value;
            }

            function getObjectPort(port) {
                var portObject = null;
                for (var pid in this.ports()) {
                    if (this.ports()[pid].config.id() == port) {
                        portObject = this.ports()[pid];
                        break;
                    }
                }
                return portObject;
            }

            function getConnected(portObject, cid) {
                return connectionMap[portObject.connections[cid]].getOtherSide(portObject.id);
            }

            var Emulator = {
                validationAlgorithm: function(algorithm){
                    var build = new Function('param', 'view', 'port', 'custom', 'tmp', algorithm);
                    // TODO: custom parser
                    build.call({}, param, view, port, custom, tmp);
                },
                callAlgorithm: function (algorithm, element, param, view, port, stage, custom, tmp){
                    var build = new Function('param', 'view', 'port', 'stage', 'custom', 'tmp', algorithm);
                    // TODO: custom parser
//                    try{
                        build.call({}, param, view, port, stage, custom, tmp);
//                    } catch(e) {
//                        console.error(e);
//                    }
                },
                run: function(algorithm, element) {
                    var tmpVars = {};
                    if (!customVars[element.id()]) {
                        customVars[element.id()] = {};
                    }
                    if (!customVars[element.id()]) {
                        customVars[element.id()] = {};
                    }
                    // On run elements don't change his stage
//                    element.stageChanged = {};

                    var param = function(param){
                        if (this.parameters()[param]) {
                            return makeNumber(this.parameters()[param]);
                        } else {
                            throw "No parameter found " + param;
                        }
                    }.bind(element);
                    var view = function(detailName, action, parameters){
                        switch(action){
                            case 'move':
                                if (parameters && parameters['len'] && parameters['side']) {
                                    this.moveDetail(detailName,  parameters['side'], parameters['len'])
                                } else {
                                    throw 'invalid parameters';
                                }
                                break;
                            case 'fill':
                                this.fillDetail(detailName, parameters.color);
                                break;
                            case 'stroke':
                                this.strokeDetail(detailName, parameters.color);
                                break;
                            case 'hide':
                                this.hideDetail(detailName);
                                break;
                            case 'show':
                                this.showDetail(detailName);
                                break;
                        }
                    }.bind(element);
                    var custom = function(variable, data) {
                        if (typeof(data) == 'undefined') {
                            return makeNumber(this.custom[variable]);
                        } else {
                            element.custom[variable] = makeNumber(data);
                            return this;
                        }
                    }.bind(element);
                    var stage = function(variable, data) {
                        if (typeof(data) == 'undefined') {
                            return makeNumber(this.stage()[variable]);
                        } else {
                            data = makeNumber(data);
                            this.stage()[variable] = data;
                            this.stageChanged[variable] = true;
                            return this;
                        }
                    }.bind(element);

                    var port = function(port, param, data){
                        var portObject = null;
                        if (typeof(data) != 'undefined') {
                            portObject = getObjectPort.call(this, port);
                            portObject.setStage(param, makeNumber(data));
                        } else {
                            var result = 0;
                            // TODO: Calculate it
                            portObject = getObjectPort.call(this, port);
                            for (var cid in portObject.connections) {
                                var value = getConnected(portObject, cid).getStage(param);

                                value = makeNumber(value);
                                // TODO: Check rule for multiple connections
                                result += value;
                            }
                            return result;
                        }
                    }.bind(element);
                    var tmp = function(variable, data){
                        if (typeof(data) == 'undefined') {
                            return makeNumber(tmpVars[variable]);
                        } else {
                            tmpVars[variable] = makeNumber(data);
                            return this;
                        }
                    }.bind(element);
                    this.callAlgorithm(algorithm, element, param, view, port, stage, custom, tmp);
                },
                buildConnectionMap: function (circuit) {
                    connectionMap = {};
                    for (var i in circuit.connections()) {
                        if (!connectionMap[circuit.connections()[i].id()]) {
                            connectionMap[circuit.connections()[i].id()] = circuit.connections()[i];
                        } else {
                            console.error("Connection map contains connection", circuit.connections()[i].id(), connectionMap);
                        }
                    }
                },
                // Run from source to end
                circuitRunner: function (circuit, operationCallback, onComplete) {
                    var steps = 0;
                    var fullFilledPorts = {};
                    var executedElements = {};
                    var onCheck = {};
                    this.buildConnectionMap(circuit);
                    angular.forEach(circuit.elements(), function(element){
                        if (element.role() == 'source' && !executedElements[element.id()]) {
                            setTimeout(function(){
                                checkTree(element);
                            }, 0);
                        }
                    });
                    function checkTree(element) {
                        if (!executedElements[element.id()]) {
                            onCheck[element.id()] = true;
                            operationCallback(element);
                            executedElements[element.id()] = true;
                            setTimeout(function(){
                                for (var p in element.ports()) {
                                    for (var c in element.ports()[p].connections) {
                                        var connection = connectionMap[element.ports()[p].connections[c]];
                                        var otherSide = connection.getOtherSide(element.ports()[p].id).element();
                                        if (steps < 100 && !executedElements[otherSide.id()]) {
                                            checkTree(otherSide);
                                            steps++;
                                        }
                                    }
                                }
                                delete onCheck[element.id()];
                                if (Object.keys(onCheck).length == 0 && onComplete) {
                                    onComplete(circuit);
                                }
                            },1);
                        }
                    }
                },
                circuitValidator: function (){
                    var defer = $q.defer();
                    this.circuitRunner(this, function (element){

                    }, function (circuit){
                        defer.resolve(circuit);
                    });
                    return defer.promise;
                },
                emulatorElementTick: function (element, circuit) {
//                    var algorithm = element.action('tick');
//                    this.callTickAlgorithm(algorithm, element);
                },
                emulatorTick: function (){
                    this.circuitRunner(this, function (element){
                        var stage = {};
                        angular.forEach(element.ports(), function(port, pid){
                            for (var cid in port.connections) {
                                stage = getConnected(port, cid).getStage();
                                angular.forEach(stage, function(val, prop){
                                    if (!element.stageChanged[prop]) {
                                        element.stage()[prop] = val;
                                    }
                                });
                                // TODO: Calculate multi stage
                            }
                        });
                        this.run(element.action('tick'), element);
                    }.bind(this), function (circuit){
                        for (var i in this.views()) {
                            this.views()[i].checkElement();
                        }
                        $rootScope.$broadcast('emulationAction');
                        setTimeout(function(){
                            if (emulation) {
                                this.emulatorTick();
                            }
                        }.bind(this), 400);
                    }.bind(this));
                },
                emulatorStart: function(){
                    this.stage('emulation');
                    emulation = true;
                    customVars = {};
                    this.circuitRunner(this, function (element){
                        element.custom = {};
                        element.stageChanged = {};
                        this.emulatorSaveState(element);
                        this.run(element.action('start'), element);
                    }.bind(this), function (){
                        this.emulatorTick();
                        $rootScope.$broadcast('emulationAction');
                    }.bind(this));
                    this.emulatorTick();
                },
                getDefaultState: function (selection, viewState) {
                    var attrs = ['transform', 'fill', 'stroke', 'visible'];
                    for (var i in attrs) {
                        var t = selection.attr(attrs[i]);
                        if (t)
                            viewState[attrs[i]] = t;
                    }
                },
                emulatorSaveState: function (element) {
                    element.viewState = {};
                    var selection = element.getElementsSelection();
                    this.getDefaultState(selection, element.viewState);
                    var details = element.getElementTypeData().view(element.currentView()).details();
                    element.detailsViewState = {};
                    for (var d in details) {
                        element.detailsViewState[details[d]] = {};
                        var detail = selection.selectAll('[detail-name="' + details[d] + '"]');
                        this.getDefaultState(detail, element.detailsViewState[details[d]]);
                    }
                },
                setDefaultState: function (viewState, selection) {
                    var attrs = ['transform', 'fill', 'stroke', 'visible'];
                    for (var i in attrs) {
                        if (viewState[attrs[i]]) {
                            selection.attr(attrs[i], viewState[attrs[i]]);
                        } else {
                            selection.attr(attrs[i], null);
                        }
                    }
                },
                emulatorResetState: function (element) {
                    var selection = element.getElementsSelection();
                    var viewState = element.viewState;

                    this.setDefaultState(viewState, selection);
                    var details = element.getElementTypeData().view(element.currentView()).details();
                    for (var d in details) {
                        var detail = selection.selectAll('[detail-name="' + details[d] + '"]');
                        this.setDefaultState(element.detailsViewState[details[d]], detail);
                    }
                },
                emulatorStop: function(){
                    emulation = false;
                    this.stage('building');
                    this.circuitRunner(this, function (element){
                        this.emulatorResetState(element);
                    }.bind(this), function (){
                        for (var i in this.views()) {
                            console.log("View", this.views()[i].data());
                        }
                        $rootScope.$broadcast('emulationAction');
                    }.bind(this));
                },
                initializeEmulator: function(container){
                    this.initializeEngine(container);
                }
            };

            return {
                initializeEmulator: function(circuit){
                    angular.extend(circuit, Emulator);
                }
            }
        }])
})();