(function () {
    angular.module('stri.circuit_engine', [])
        .factory('$d3', [function () {
            return d3;
        }])
        .factory('idGenerator', [function () {
            return {
                generate: function () {
                    return Math.random().toString(36).substr(2, 9);
                }
            };
        }])
        .factory('CircuitData', [function () {
            var circuitData = {};
            return circuitData;
        }])
        .factory('CircuitEngine', ['$d3', 'ElementEngine', 'CircuitData', 'ConnectionEngine', function ($d3, ElementEngine, engineData, ConnectionEngine) {
            function getCircuitMenu() {
                return [
                    {
                        title: function () {
                            return !engineData.circuitSelect ? 'Select' : 'Move'
                        },
                        action: function () {
                            engineData.circuitSelect = !engineData.circuitSelect;
                        }
                    }
                ]
            }
            var Engine = {
                initializeEngine: function(circuitContainer){
                    engineData.circuit = this;
                    engineData.circuit.stage('building');
                    engineData.elements = [];
                    engineData.connections = [];
                    engineData.controls = {};

                    engineData.circuitContainer = $d3.select(circuitContainer)
                        .on('contextmenu', $d3.contextMenu(getCircuitMenu()));
                    engineData.circuitContent = engineData.circuitContainer.select('g.circuit-container');
                    engineData.elementsContainer = engineData.circuitContent.append('g').attr('class', 'elements');
                    engineData.connectionsContainer = engineData.circuitContent.append('g').attr('class', 'connections');
                    engineData.labelsContainer = engineData.circuitContent.append('g').attr('class', 'labels');
                    engineData.controlsContainer = engineData.circuitContent.append('g').attr('class', 'controls');

                    engineData.circuitSelect = false;
                    engineData.circuitTranslate = 0;
                    engineData.circuitContainer.call(
                        $d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", function zoom() {
                                if (!engineData.circuitSelect) {
                                    engineData.circuitTranslate = $d3.event.translate;
                                }
                                engineData.circuitContent.attr("transform", "translate(" + engineData.circuitTranslate + ")scale(" + $d3.event.scale + ")");
                            }
                        )
                    );

                    engineData.elements = ElementEngine.initializeElements(engineData.circuit.elements());

                    this.updateControls();
                    ElementEngine.updateElements(engineData.elements);
                    engineData.connections = ConnectionEngine.initializeConnections(engineData.circuit.connections());
                    ConnectionEngine.updateConnections(engineData.connections);
                },
                updateControls: function(){
                    engineData.controls = [];
                    angular.forEach(engineData.elements, function (element) {
                        angular.forEach(element.ports(), function (port) {
                            engineData.controls[port.id] = port;
                        });
                        angular.forEach(element.activePoints(), function (activePoint) {
                            engineData.controls[activePoint.id] = activePoint;
                        });
                    });
                },
                addElementView: function(element){
                    ElementEngine.initializeElements([element]);
                    engineData.elements.push(element);
                    ElementEngine.updateElements([element]);
                    this.updateControls();
                }
            }

            return {
                initializeCircuitView: function (Circuit) {
                    angular.extend(Circuit, Engine);
                    return Circuit;
                }
            }
        }])
        .factory('ActivePointEngine', ['idGenerator', function (idGenerator) {
            function getDir(baseDir, rotation) {
                var directions = [
                    'top', 'right', 'bottom', 'left'
                ];
                var rIndex = rotation + directions.indexOf(baseDir);
                return directions[rIndex % 4];
            }

            function getRotationOffsetX(cx, cy, x, y, rotation) {
                var offsetX = x - cx;
                var offsetY = y - cx;
                switch (rotation){
                    case 0:
                        return cx + offsetX;
                    case 1:
                        return cx + offsetY;
                    case 2:
                        return cx - offsetX;
                    case 3:
                        return cx - offsetY;
                }
            }

            function getRotationOffsetY(cx, cy, x, y, rotation) {
                var offsetX = cx - x;
                var offsetY = cy - y;
                switch (rotation){
                    case 0:
                        return cy - offsetY;
                    case 1:
                        return cy - offsetX;
                    case 2:
                        return cy + offsetY;
                    case 3:
                        return cy + offsetX;
                }
            }

            return {
                getDir: getDir,
                initializeActivePoint: function (activePoint) {
                    activePoint.id = activePoint.id ? activePoint.id : idGenerator.generate();
                    angular.extend(activePoint, {
                        id: activePoint.id,
                        x: activePoint.config.x(),
                        y: activePoint.config.y(),
                        dir: function () {
                            return getDir(this.source.dir(), this.element().rotation());
                        },
                        X: function () {
                            if (this.element()) {
                                return getRotationOffsetX(this.element().cx(), this.element().cy(), this.element().x(), this.element().y(), this.element().rotation());
                            }
                            return this.x;
                        },
                        Y: function () {
                            if (this.element()) {
                                return getRotationOffsetY(this.element().cx(), this.element().cy(), this.element().x(), this.element().y(), this.element().rotation());
                            }
                            return this.y;
                        },
                        r: activePoint.config.r(),
                        element: function(element){
                            if (element) {
                                this.elementData = element;
                                return this;
                            }
                            return this.elementData;
                        }
                    });
                },
                update: function (selectionWithData) {

                }
            }
        }])
        .factory('PortEngine', ['idGenerator', function (idGenerator) {
            function getDir(baseDir, rotation) {
                var directions = [
                    'top', 'right', 'bottom', 'left'
                ];
                var rIndex = rotation + directions.indexOf(baseDir);
                return directions[rIndex % 4];
            }

            function getRotationOffsetX(cx, cy, x, y, rotation) {
                var offsetX = x - cx;
                var offsetY = y - cy;
                switch (rotation){
                    case 0:
                        return cx + offsetX;
                    case 1:
                        return cx + offsetY;
                    case 2:
                        return cx - offsetX;
                    case 3:
                        return cx - offsetY;
                }
            }

            function getRotationOffsetY(cx, cy, x, y, rotation) {
                var offsetX = x - cx;
                var offsetY = y - cy;
                switch (rotation){
                    case 0:
                        return cy + offsetY;
                    case 1:
                        return cy + offsetX;
                    case 2:
                        return cy - offsetY;
                    case 3:
                        return cy - offsetX;
                }
            }

            return {
                initializePort: function (port) {
                    port.id = port.id ? port.id : idGenerator.generate();
                    var y = port.config.y();
                    if (typeof(y) == 'string') {
                        y = parseFloat(y);
                    }
                    var x = port.config.x();
                    if (typeof(x) == 'string') {
                        x = parseFloat(x);
                    }
                    angular.extend(port, {
                        stage: {},
                        x: x,
                        y: y,
                        X: function () {
                            if (this.element()) {
                                return this.element().x() + getRotationOffsetX(this.element().width()()/2, this.element().height()()/2, this.x, this.y, this.element().rotation());
                            }
                            return this.x;
                        },
                        Y: function () {
                            if (this.element()) {
                                return this.element().y() + getRotationOffsetY(this.element().width()()/2, this.element().height()()/2, this.x, this.y, this.element().rotation());
                            }
                            return this.y;
                        },
                        r: port.config.r(),
                        role: port.config.role(),
                        dir: function () {
                            return getDir(this.config.dir(), this.element().rotation());
                        },
                        getStage: function(property, strict){
                            if (!property) {
                                var calculatedStage = {};
                                angular.forEach(this.element().stage(), function(val, prop){
                                    if (this.stage[prop]) {
                                        calculatedStage[prop] = this.stage[prop];
                                    } else {
                                        calculatedStage[prop] = val;
                                    }
                                }.bind(this));

                                if (this.element().elementType() == 'master') {
                                    console.log("Check", this.element().stage(), this.stage, calculatedStage);
                                }
                                return calculatedStage;
                            }
                            if (this.stage[property]){
                                return this.stage[property];
                            }
                            if (this.element().stage()[property]) {
                                return this.element().stage()[property];
                            } else if (this.element().parameters()[property] && !strict) {
                                return this.element().parameters()[property];
                            }
                        },
                        setStage: function(property, value) {
                            this.stage[property] = value;
                            return this;
                        },
                        element: function(element){
                            if (element) {
                                this.elementData = element;
                                return this;
                            }
                            return this.elementData;
                        }
                    });
                },
                update: function (selectionWithData) {

                }
            }
        }])
        .factory('ElementEngine', [
            'PortEngine',
            'ActivePointEngine',
            'idGenerator',
            '$d3',
            'CircuitData',
            'ConnectionEngine',
            'Connection',
            '$rootScope',
            function (Port, ActivePoint, idGenerator, $d3, CircuitData, ConnectionEngine, Connection, $rootScope) {
                var engine = {
                    rotation: function (rotation) {
                        if (rotation) {
                            this.viewData().rotation = rotation < 4 ? rotation : 0;
                            return this;
                        }
                        return this.viewData().rotation ? this.viewData().rotation : 0;
                    },
                    x: function (x) {
                        if (x) {
                            if (typeof(x) == 'string') {
                                x = parseFloat(x);
                            }
                            this.position().x = x;
                            return this;
                        }
                        if (typeof(this.position().x) == 'string') {
                            this.position().x = parseFloat(this.position().x);
                        }
                        return this.position().x;
                    },
                    cx: function(){
                        var width = this.width()();
                        if (typeof(width) == 'string') {
                            width = parseFloat(width);
                            this.width(width);
                        }
                        return this.x() + width/2
                    },
                    cy: function(){
                        var height = this.height()();
                        if (typeof(height) == 'string'){
                            height = parseFloat(height);
                            this.height(height);
                        }
                        return this.y() + height/2;
                    },
                    y: function (y) {
                        if (y) {
                            if (typeof(y) == 'string') {
                                y = parseFloat(y);
                            }
                            this.position().y = y;
                            return this;
                        }
                        if (typeof(this.position().y) == 'string') {
                            this.position().y = parseFloat(this.position().y);
                        }
                        return this.position().y;
                    },
                    shortCut: function() {
                        return this.viewData().shortCut;
                    },
                    getElementsSelection: function () {
                        var selector = getElementSelector([this]);
                        var elementsView = CircuitData.elementsContainer
                                .selectAll(selector)
                            ;
                        return elementsView;
                    },
                    getDetailDOM: function (detailName) {
                        var elementsView = this.getElementsSelection();
                        if (detailName == 'full') {
                        } else {
                            elementsView = elementsView.selectAll('[detail-name="' + detailName + '"]');
                        }
                        return elementsView;
                    },
                    // TODO: Activate controls
                    moveDetail: function (detailName, side, length) {
                        function parse (a)
                        {
                            var b={};
                            for (var i in a = a.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*,?)+\))+/g))
                            {
                                var c = a[i].match(/[\w\.\-]+/g);
                                b[c.shift()] = c;
                            }
                            return b;
                        }
                        function formatTransform(arr) {
                            var transform = '';
                            angular.forEach(arr, function(attrs, label){
                                transform += label + '(';
                                for (var i = 0; i < attrs.length; ++i) {
                                    transform += attrs[i];
                                    if (i < attrs.length - 1) {
                                        transform += ',';
                                    }
                                }
                                transform += ')';
                            });
                            return transform;
                        }
                        var elementsView = this.getDetailDOM(detailName);
//                        var controlsSelector = getControlsSelector([this]);
//                            controlsSelector = controlsSelector.selectAll('[detail-name="' + detailName + '"]');
                        elementsView.attr('transform', function(){
                            var transform = $d3.select(this).attr('transform');
                            if (transform) {
                                transform = parse(transform);
                                if (transform.translate) {
                                    transform.translate = [parseFloat(transform.translate[0]), parseFloat(transform.translate[1])];
                                } else {
                                    transform.translate = [0,0];
                                }
                            } else {
                                transform = {
                                    translate: [0,0]
                                };
                            }
                            console.log("Transform FROM", transform.translate);
                            switch (side){
                                case 'left':
                                    transform.translate[0] -= length;
                                    break;
                                case 'right':
                                    transform.translate[0] += length;
                                    break;
                                case 'top':
                                    transform.translate[1] -= length;
                                    break;
                                case 'bottom':
                                    transform.translate[1] += length;
                                    break;
                            }
                            return formatTransform(transform);
                        });
                    },
                    fillDetail: function (detailName, color){
                        this.getDetailDOM(detailName).attr('fill', color);
                    },
                    strokeDetail: function(detailName, color) {
                        this.getDetailDOM(detailName).attr('stroke', color);

                    },
                    showDetail: function(detailName) {
                        this.getDetailDOM(detailName).attr('visibility', 1);

                    },
                    hideDetail: function(detailName){
                        this.getDetailDOM(detailName).attr('visibility', 0);
                    }
                };

                function getMenu() {
                    return [
                        {
                            title: 'Add view',
                            action: function(elem, d, i) {
                                $rootScope.$broadcast('addElementView', d);
                            }
                        },
                        {
                            title: "Change parameters",
                            action: function (elem, d, i) {
                                $rootScope.$broadcast('changeElementProperties', d);
                            }
                        },
                        {
                            title: "Change model data",
                            action: function (elem, d, i) {
                                $rootScope.$broadcast('changeElementModelData', d);
                            }
                        },
                        {
                            title: 'Rotate',
                            action: function (elm, d, i) {
                                d.rotation(d.rotation() + 1);
                                updateElements([d]);
                                ConnectionEngine.resetElementConnections([d]);
                            }
                        },
                        {
                            title: 'Delete',
                            action: function (elm, d, i) {
                                if (CircuitData.circuit.stage() != 'building') {
                                    return false
                                }
                                var controls = [];
                                angular.forEach(d.ports(), function(port){
                                    controls.push(port.id);
                                });
                                angular.forEach(CircuitData.elements, function(element, key){
                                    if (element.id() == d.id()) {
                                        CircuitData.elements.splice(key, 1);
                                    }
                                });
                                angular.forEach(CircuitData.circuit.elements(), function(element, key){
                                    if (element.viewData().id == d.id()) {
                                        CircuitData.circuit.elements().splice(key, 1);
                                    }
                                });

                                var countConnections = CircuitData.circuit.connections().length;
                                for (var i = countConnections - 1; i >= 0; --i) {
                                    // We hope number of vieved connection equals for connection data
                                    if (controls.indexOf(CircuitData.connections[i].source().id) >= 0
                                        || controls.indexOf(CircuitData.connections[i].goal().id) >= 0
                                        ) {
                                        CircuitData.connections.splice(i, 1);
                                    }
                                    if (controls.indexOf(CircuitData.circuit.connections()[i].source().id) >= 0
                                        || controls.indexOf(CircuitData.circuit.connections()[i].goal().id) >= 0
                                        ) {
                                        CircuitData.circuit.connections().splice(i, 1);
                                    }
                                }

                                resetElements(CircuitData.elements);
                                ConnectionEngine.removeConnections([d]);
                                ConnectionEngine.updateConnections(CircuitData.connections);
                            }
                        }
                    ];
                }

                function getElementTransform(data) {
                    return 'translate(' + data.x() + ',' + data.y() + ')rotate(' + 90 * data.rotation() + ',' + (data.width()() / 2) + ',' + (data.height()() / 2) + ')';
                }

                function getLabelTransform(data, element) {
                    return 'translate(' + (element.x()) + ',' + (element.y()) + ')';
                }

                function updateControls(controlsWithData) {
                    controlsWithData.exit().remove();
                    var customDrag = d3.behavior.drag();
                    var controlsEnterQu = controlsWithData.enter()
                        .append('g')
                        .attr('class', function (d) {
                            return 'control_element control_element_' + d.id();
                        });
                    controlsWithData
                        .attr('transform', function (d) {
                            return getElementTransform(d);
                        });
                    var ports = controlsEnterQu.selectAll('circle.port')
                        .data(function (d) {
                            var ports = [];
                            for(var key in d.ports()) {
                                ports.push(d.ports()[key]);
                            }
                            return ports;
                        });
                    ports.exit().remove();
                    customDrag
                        .on('dragstart', function (d, e, i) {
                            if (CircuitData.circuit.stage() != 'building') {
                                return false
                            }
                            CircuitData.circuitContent
                                .attr('class', CircuitData.circuitContent.attr('class').replace(' onDrag', '') + ' onDrag');
                            CircuitData.tmpLine = CircuitData.connectionsContainer.selectAll('.tmp-line')
                                .data([
                                    {from: this}
                                ]);
                            CircuitData.tmpLine.exit().remove();
                            CircuitData.tmpLine.enter()
                                .append('line')
                                .attr('class', 'tmp-line');
                            var current = d3.select(this).selectAll('.port');
                            CircuitData.tmpLine
                                .attr('x2', d.X())
                                .attr('y2', d.Y())
                                .attr('x1', d.X())
                                .attr('y1', d.Y())
                            ;
                            $d3.event.sourceEvent.stopPropagation();
                        })
                        .on('drag', function (d, e, i) {
                            if (CircuitData.circuit.stage() != 'building') {
                                return false
                            }
                            var elementData = null;
                            if (CircuitData.selectedPort) {
                                CircuitData.tmpLine
                                    .attr('x2', CircuitData.selectedPort.X())
                                    .attr('y2', CircuitData.selectedPort.Y())
                                ;
                            } else {
                                CircuitData.tmpLine
                                    .attr('x2', d.element().x() + $d3.event.x)
                                    .attr('y2', d.element().y() + $d3.event.y)
                                ;
                            }
                        })
                        .on('dragend', function (d, e, i) {
                            if (CircuitData.circuit.stage() != 'building') {
                                return false
                            }
                            CircuitData.circuitContent
                                .attr('class', CircuitData.circuitContent.attr('class').replace(' onDrag', ''));
                            if (CircuitData.selectedPort) {
                                var newConnection = new Connection(
                                    {
                                        source: d,
                                        goal: CircuitData.selectedPort,
                                        path: []
                                    }
                                );
                                if (newConnection.source()) {
                                    CircuitData.circuit.connections().push(newConnection);
                                    ConnectionEngine.initializeConnection(newConnection);
                                    CircuitData.connections.push(newConnection);
                                    ConnectionEngine.addConnection(newConnection);
                                }
                            }
                            CircuitData.tmpLine.remove();
                            CircuitData.tmpLine = null;
                        });

                    var portContainers = ports.enter()
                        .append('g')
                        .attr('class', 'port-container')
                        .call(customDrag);
                    portContainers.append('circle')
                        .attr('class', function (d) {
                            return 'port port_' + d.id;
                        })
                        .attr('cx', function (port) {
                            return port.x;
                        })
                        .attr('cy', function (port) {
                            return port.y;
                        })
                        .attr('r', function (port) {
                            return port.r;
                        })
                        .on('mouseover', function (d) {
                            CircuitData.selectedPort = d;
                        })
                        .on('mouseout', function () {
                            CircuitData.selectedPort = null;
                        })
                    ;
                    portContainers.append('circle')
                        .attr('class', function (d) {
                            return 'portField port_' + d.id;
                        })
                        .attr('cx', function (port) {
                            return port.x;
                        })
                        .attr('cy', function (port) {
                            return port.y;
                        })
                        .attr('r', function (port) {
                            return port.r + 3;
                        })
                        .on('mouseover', function (d) {
                            CircuitData.selectedPort = d;
                        })
                        .on('mouseout', function () {
                            CircuitData.selectedPort = null;
                        })
                    ;
                }

                function updateLabel(labelsWithData) {
                    var labelDragger = $d3.behavior.drag();
                    labelDragger
                        .on('dragstart', function (d) {
                            $d3.event.sourceEvent.stopPropagation();
                        })
                        .on('drag', function (element) {
                            element.shortCut().position.x += $d3.event.dx;
                            element.shortCut().position.y += $d3.event.dy;
                            $d3.select(this).attr('transform', getLabelTransform(element.shortCut(), element));
                        })
                    ;
                    labelsWithData.exit().remove();
                    labelsWithData.enter()
                        .append('g')
                        .attr('class', function (d) {
                            return 'element element_' + d.id();
                        })
                        .on('contextmenu', $d3.contextMenu(getMenu()))
                        .call(labelDragger);
                    labelsWithData.append('text').text(function (element) {
                        return element.shortCut().title;
                    }).attr('x', function (element) {
                        return element.shortCut().position.x;
                    }).attr('y', function(element){
                        return element.shortCut().position.y;
                    });
                    labelsWithData.attr('transform', function (element) {
                        return getLabelTransform(element.shortCut(), element);
                    });
                }

                function update(selectionWithData, controlsWithData, labelsWithData) {
                    selectionWithData.exit().remove();

                    var dragger = $d3.behavior.drag();
                    dragger
                        .on('dragstart', function (element) {
                            $d3.event.sourceEvent.stopPropagation();
                        })
                        .on('drag', function (data) {
                            data.x(data.x() + $d3.event.dx);
                            data.y(data.y() + $d3.event.dy);
                            updateElements([data]);
                            ConnectionEngine.updatePointsConnections(data.ports());
                        })
                    ;

                    var containers = selectionWithData.enter()
                        .append('g')
                        .attr('class', function (d) {
                            return 'element element_' + d.id();
                        })
                        .on('contextmenu', $d3.contextMenu(getMenu()))
                        .call(dragger);
                    containers
                        .append('rect')
                        .attr('fill', '#000')
                        .attr('style', 'opacity: 0.01;')
                        .attr('width', function(d){
                            return d.width()();
                        })
                        .attr('height', function(d){
                            return d.height()();
                        });
                    var images = containers
                            .each(function(d) {
                                var element = this;
                                $d3.xml(d.view()(), "image/svg+xml", function(xml) {
                                    element.appendChild(xml.documentElement);
                                    $d3.select(element).select('svg')
                                        .attr('width', d.width()())
                                        .attr('height', d.height()())
                                        .selectAll('path,circle,line,rect')
                                        .on('click', function(e, d){
                                            console.log("Select", e, d);
                                        })
                                    ;
                                });
                            })
                        ;
                    selectionWithData
                        .attr('transform', function (data) {
                            return getElementTransform(data)
                        })
                    ;
                    if (controlsWithData) {
                        updateControls(controlsWithData);
                    }
                    if (labelsWithData) {
                        updateLabel(labelsWithData);
                    }
                }

                function removeElements() {
                    CircuitData.elementsContainer
                        .selectAll('.element')
                        .remove();
                    CircuitData.controlsContainer
                        .selectAll('.control_element')
                        .remove();
                    CircuitData.labelsContainer
                        .selectAll('.element')
                        .remove();
                }

                function resetElements(elements) {
                    removeElements();
                    if (elements.length > 0) {
                        updateElements(elements);
                    }
                }

                function getElementSelector(elements) {
                    var selector = '';
                    angular.forEach(elements, function (element) {
                        selector += 'g.element_' + element.id() + ',';
                    });
                    selector = selector.substr(0, selector.length - 1);
                    return selector;
                }

                function getControlsSelector(elements) {
                    var controlsSelector = '';
                    angular.forEach(elements, function (element) {
                        controlsSelector += 'g.control_element_' + element.id() + ',';
                    });
                    controlsSelector = controlsSelector.substr(0, controlsSelector.length - 1);
                    return controlsSelector;
                }

                function updateElements(elements) {
                    if (elements.length == 0) {
                        removeElements();
                        return false;
                    }
                    var selector = getElementSelector(elements);
                    var controlsSelector = getControlsSelector(elements);
                    var elementsView = CircuitData.elementsContainer
                            .selectAll(selector)
                            .data(elements)
                        ;
                    var controlsViews = CircuitData.controlsContainer
                        .selectAll(controlsSelector)
                        .data(elements);

                    var labels = CircuitData.labelsContainer
                        .selectAll(selector)
                        .data(elements);
                    update(elementsView, controlsViews, labels);
                }

                return {
                    initializeElements: function (elements) {
                        var elementObjects = [];
                        angular.forEach(elements, function (element) {
                            // Initialize sub elements
                            angular.forEach(element.ports(), function (port) {
                                Port.initializePort(port);
                                port.element(element);
                            });
                            angular.forEach(element.activePoints(), function (activePoint) {
                                ActivePoint.initializeActivePoint(activePoint);
                                activePoint.element(element);
                            });

                            angular.extend(element, engine);

                            elementObjects.push(element);
                        });
                        return elementObjects;
                    },
                    updateElementsList: function (elements) {

                    },
                    updateElements: updateElements
                }
            }])
        .factory('ConnectionEngine', ['CircuitData', 'Point', 'idGenerator', '$d3', function (CircuitData, Point, idGenerator, $d3) {
            var engine = {
                fromPoint: function(){
                    return CircuitData.controls[this.source().id];
                },
                toPoint: function(){
                    return CircuitData.controls[this.goal().id];
                },
                rebuildPath: function () {
                    if (this.source() && this.goal()) {
                        var lineData = [];
                        var currentPoint = new Point(this.fromPoint());
                        var endPoint = new Point(this.toPoint());
                        var dirAxis = getDirAxis(currentPoint.dir());
                        if (!isOnDir(currentPoint.dir(), currentPoint[dirAxis](), endPoint[dirAxis]())) {
                            var tmp = currentPoint;
                            currentPoint = endPoint;
                            endPoint = tmp;
                        }

                        function isOpposite(newDir1, newDir2) {
                            return ((newDir1 == 'top' && newDir2 == 'bottom')
                                || (newDir1 == 'bottom' && newDir2 == 'top')
                                || (newDir1 == 'left' && newDir2 == 'right')
                                || (newDir1 == 'right' && newDir2 == 'left'));
                        }

                        function isSame(pointFrom, pointTo) {
                            return (pointFrom.x() == pointTo.x() && pointFrom.y() == pointTo.y())
                                || ((pointFrom.x() == pointTo.x() || pointFrom.y() == pointTo.y())
                                && isOpposite(pointFrom.dir(), pointTo.dir()));
                        }

                        var minLen = 10;
                        var i = 0;

                        function towardDir(dir, len, currentPoint) {
                            var x = currentPoint.x();
                            var y = currentPoint.y();
                            switch (dir) {
                                case 'left':
                                    x -= len;
                                    break;
                                case 'top':
                                    y -= len;
                                    break;
                                case 'right':
                                    x += len;
                                    break;
                                case 'bottom':
                                    y += len;
                                    break;
                            }
                            return new Point({
                                x: x,
                                y: y,
                                dir: dir
                            });
                        }

                        function isOnDir(dir, startPosition, endPosition) {
                            if (['right', 'bottom'].indexOf(dir) >= 0 && startPosition < endPosition
                                || ['right', 'bottom'].indexOf(dir) < 0 && startPosition > endPosition) {
                                return true;
                            }
                            return false;
                        }

                        function getDirAxis(dir) {
                            if (['bottom', 'top'].indexOf(dir) >= 0) {
                                return 'y';
                            }
                            return 'x';
                        }

                        function checkOnAxis(newDir1, newDir2) {
                            var vertical = ['top', 'bottom'];
                            var horizontal = ['left', 'right'];
                            return (vertical.indexOf(newDir1) >= 0 && vertical.indexOf(newDir2) >= 0)
                                || (horizontal.indexOf(newDir1) >= 0 && horizontal.indexOf(newDir2) >= 0);
                        }

                        function getDir(pointFrom, pointTo) {
                            if (['top', 'bottom'].indexOf(pointFrom.dir()) >= 0) {
                                return pointFrom.x() < pointTo.x() ? 'right' : 'left';
                            } else {
                                return pointFrom.y() > pointTo.y() ? 'top' : 'bottom';
                            }
                        }

                        // Firstly check is points on the same line and move to one point
                        while (!isSame(currentPoint, endPoint)) {
                            // If it's not we build the path from first point to end point

                            // Detect current axis
                            dirAxis = getDirAxis(currentPoint.dir());
                            // And opposite
                            var oppositeAxis = dirAxis == 'y' ? 'x' : 'y';
                            var newPoint = {};
                            var newEndPoint = {};
                            // Check how much line we must build to new point
                            // If points aren't on opposite directions we build different line sizes, depends of needs
                            if (isOnDir(currentPoint.dir(), currentPoint[dirAxis](), endPoint[dirAxis]())) {
                                if (isOnDir(endPoint.dir(), endPoint[dirAxis](), currentPoint[dirAxis]())) {
                                    if (!checkOnAxis(currentPoint.dir(), endPoint.dir())) {
                                        newPoint = towardDir(currentPoint.dir(), Math.abs(endPoint[dirAxis]() - currentPoint[dirAxis]()), currentPoint);
                                    } else {
                                        newPoint = towardDir(currentPoint.dir(), Math.abs(endPoint[dirAxis]() - currentPoint[dirAxis]()) - minLen, currentPoint);
                                    }
                                } else {
                                    newPoint = towardDir(currentPoint.dir(), Math.abs(endPoint[dirAxis]() - currentPoint[dirAxis]()) - minLen, currentPoint);
                                }
                            } else {
                                // If on opposite - minimal line size
                                newPoint = towardDir(currentPoint.dir(), minLen, currentPoint);
                            }
                            // Push points data
                            newPoint.dir(getDir(currentPoint, endPoint));
                            lineData.push({
                                from: currentPoint,
                                to: newPoint
                            });
                            currentPoint = newPoint;
                            if (!isSame(newPoint, endPoint)) {
                                // Detect current axis
                                dirAxis = getDirAxis(endPoint.dir());
                                // And opposite
                                oppositeAxis = dirAxis == 'y' ? 'x' : 'y';
                                // Check how much line we must build to new point
                                // If points aren't on opposite directions we build different line sizes, depends of needs
                                if (isOnDir(endPoint.dir(), endPoint[dirAxis](), newPoint[dirAxis]())) {
                                    // TODO: Correct it!
//                                    if (baseStartPoint[dirAxis]() == currentPoint[dirAxis]()) {
//                                        newEndPoint = towardDir(endPoint.dir(), Math.abs(endPoint[dirAxis]() - currentPoint[dirAxis]()) - minLen, endPoint);
//                                    } else {
                                        newEndPoint = towardDir(endPoint.dir(), Math.abs(endPoint[dirAxis]() - currentPoint[dirAxis]()), endPoint);
//                                    }
                                } else {
                                    // If on opposite - minimal line size
                                    newEndPoint = towardDir(endPoint.dir(), minLen, endPoint);
                                }
                                // Push points data
                                newEndPoint.dir(getDir(endPoint, newPoint));
                                lineData.push({
                                    from: endPoint,
                                    to: newEndPoint
                                });
                                endPoint = newEndPoint;
                            } else {
                                break;
                            }
                            i++;
                            if (i > 100) {
                                console.error("Failed path building. Inf circle");
                                break;
                            }
                        }

                        var lastPoint = lineData.length >= 1 ? lineData[lineData.length - 1] : {to:currentPoint};
                        var subLastPoint = lineData.length >= 2 ? lineData[lineData.length - 2] : {to: endPoint};
                        lineData.push({
                            from: subLastPoint.to,
                            to: lastPoint.to
                        });
                        this.path(lineData);
                    }
                },
                checkPath: function () {
                    angular.forEach(this.path(), function (line) {
                        if (['bottom', 'top'].indexOf(line.from.dir()) >= 0) {
                            if (line.from.x() != line.to.x()) {
                                if (line.to.fix()) {
                                    line.from.x(line.to.x());
                                } else {
                                    line.to.x(line.from.x());
                                }
                            }
                        } else {
                            if (line.from.y() != line.to.y()) {
                                if (line.to.fix()) {
                                    line.from.y(line.to.y());
                                } else {
                                    line.to.y(line.from.y());
                                }
                            }
                        }
                    });
                }
            };

            function linePosition(lineSelection) {
                lineSelection.attr('x1', function (line) {
                    return line.from.x();
                })
                    .attr('x2', function (line) {
                        return line.to.x();
                    })
                    .attr('y1', function (line) {
                        return line.from.y()
                    })
                    .attr('y2', function (line) {
                        return line.to.y()
                    });
            }

            function isVertical(dir) {
                return ['bottom', 'top'].indexOf(dir) >= 0;
            }

            function updateConnections(connections) {
                if (connections.length == 0) {
                    CircuitData.connectionsContainer
                        .selectAll('.connection')
                        .remove();
                    return false;
                }
                var selector = '';
                angular.forEach(connections, function (connection) {
                    selector += ('.connection_' + connection.properties().id + ',');
                });
                selector = selector.substr(0, selector.length - 1);
                var connectionViews = CircuitData.connectionsContainer
                    .selectAll(selector)
                    .data(connections);
                connectionViews.exit().remove();
                connectionViews
                    .enter()
                    .append('g')
                    .attr('class', function (conn) {
                        return 'connection connection_' + conn.properties().id +
                            ' port_connection_' + conn.source().id + ' port_connection_' + conn.goal().id;
                    })
                ;
                var lines = connectionViews
                    .selectAll('line.schema-line')
                    .data(function (conn) {
                        return conn.path()
                    });
                lines.exit().remove();
                var lineDrager = $d3.behavior.drag();
                lineDrager
                    .on('dragstart', function (d) {
                        $d3.event.sourceEvent.stopPropagation();
                        if (d.from.fix() || d.to.fix()) {
                            var mouseCoords = $d3.mouse(this);
                            var newX = 0;
                            var newY = 0;
                            var newDir = '';
                            var connection = $d3.select(this.parentNode).datum();
                            if (d.from.fix()) {
                                if (isVertical(d.from.dir())) {
                                    newX = d.from.x();
                                    newY = d.from.y() + mouseCoords[1] / 3.14;
                                    newDir = 'left';
                                } else {
                                    newY = d.from.y();
                                    newX = d.from.x() + mouseCoords[0] / 3.14;
                                    newDir = 'top';
                                }
                            } else {
                                if (isVertical(d.from.dir())) {
                                    newX = d.from.x();
                                    newY = d.from.y() - mouseCoords[1] / 3.14;
                                    newDir = 'right';
                                } else {
                                    newY = d.from.y();
                                    newX = d.from.x() - mouseCoords[0] / 3.14;
                                    newDir = 'bottom';
                                }
                            }
                            var newPoint = new Point({
                                x: newX,
                                y: newY,
                                dir: newDir
                            });
                            var newSecondPoint = new Point({
                                x: newX,
                                y: newY,
                                dir: d.from.fix() ? d.from.dir() : d.to.dir()
                            });
                            connection.path().push({
                                from: newPoint,
                                to: newSecondPoint
                            });
                            if (d.from.fix()) {
                                connection.path().push({
                                    from: d.from,
                                    to: newPoint
                                });
                                d.from = newSecondPoint;
                            } else {
                                connection.path().push({
                                    from: newPoint,
                                    to: d.to
                                });
                                d.to = newSecondPoint;
                            }
                            updateConnections([connection]);
                        }
                    })
                    .on('drag', function (d) {
                        if (isVertical(d.from.dir())) {
                            d.from.x(d.from.x() + $d3.event.dx);
                            d.to.x(d.to.x() + $d3.event.dx);
                        } else {
                            d.from.y(d.from.y() + $d3.event.dy);
                            d.to.y(d.to.y() + $d3.event.dy);
                        }
                        linePosition($d3.select(this.parentNode).selectAll('line'));
                    })
                    .on('dragend', function () {

                    });
                lines
                    .enter()
                    .append('line')
                    .attr('class', function (d) {
                        if (!d.from) {
                            console.error("d", d);
                        }
                        return isVertical(d.from.dir()) ? 'vertical' : 'horizontal';
                    })
                    .call(lineDrager)
                ;
                linePosition(lines);
            }

            function removeConnections(elements){
                var selector = '';
                angular.forEach(elements, function (element) {
                    angular.forEach(element.ports(), function (point) {
                        selector += '.port_connection_' + point.id + ',';
                    });
                });
                selector = selector.substr(0, selector.length - 1);
                var connections = CircuitData.connectionsContainer
                    .selectAll(selector);
                connections.remove();
            }

            return {
                initializeConnection: function (connection) {
                    angular.extend(connection, engine);
                    if (connection.path().length == 0) {
                        connection.rebuildPath();
                    }
                },
                initializeConnections: function (connections) {
                    var preparedConnections = [];
                    var self = this;
                    angular.forEach(connections, function (connection) {
                        self.initializeConnection(connection);
                        preparedConnections.push(connection);
                    });
                    return preparedConnections;
                },
                addConnection: function (connection) {
                    var selector = '.port_connection_' + connection.source().id
                        + '.port_connection_' + connection.goal().id;

                    var connectionViews = CircuitData.connectionsContainer
                        .selectAll(selector)
                        .remove();
                    this.updateConnections([connection]);
                },
                updateConnections: updateConnections,
                updatePointsConnections: function (points) {
                    var selector = '';
                    angular.forEach(points, function (point) {
                        selector += '.port_connection_' + point.id + ',';
                    });
                    selector = selector.substr(0, selector.length - 1);
                    var selected = CircuitData.connectionsContainer
                        .selectAll(selector);
                    selected
                        .each(function (d) {
                            d.checkPath();
                        });
                    linePosition(selected
                        .selectAll('line'))
                    ;
                },
                removeConnections: removeConnections,
                resetElementConnections: function (elements) {
                    var selector = '';
                    angular.forEach(elements, function (element) {
                        angular.forEach(element.ports(), function (point) {
                            selector += '.port_connection_' + point.id + ',';
                        });
                    });
                    selector = selector.substr(0, selector.length - 1);
                    var connections = [];
                    var selected = CircuitData.connectionsContainer
                        .selectAll(selector)
                        .each(function (d) {
                            d.rebuildPath();
                            connections.push(d);
                        });
                    selected.selectAll('line').remove();
                    updateConnections(connections);
                },
                buildConnectionPath: function (fromPoint, toPoint) {

                },
                updateConnectionPath: function (connection) {

                }
            };
        }])
})();