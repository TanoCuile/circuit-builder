(function () {
    var elementTypeAdmin = angular.module('stri.admin.element_type', ['stri.element_type', 'stri.element'])
            // ElementTypeAdmin addition functions
            .directive('ngThumb', ['$window', function ($window) {
                var helper = {
                    support: !!($window.FileReader && $window.CanvasRenderingContext2D),
                    isFile: function (item) {
                        return angular.isObject(item) && item instanceof $window.File;
                    },
                    isImage: function (file) {
                        var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                    }
                };

                return {
                    restrict: 'A',
                    template: '<canvas/>',
                    link: function (scope, element, attributes) {
                        if (!helper.support) return;

                        var params = scope.$eval(attributes.ngThumb);

                        if (!helper.isFile(params.file)) return;
                        if (!helper.isImage(params.file)) return;

                        var canvas = element.find('canvas');
                        var reader = new FileReader();

                        reader.onload = onLoadFile;
                        reader.readAsDataURL(params.file);

                        function onLoadFile(event) {
                            var img = new Image();
                            img.onload = onLoadImage;
                            img.src = event.target.result;
                        }

                        function onLoadImage() {
                            var width = params.width || this.width / this.height * params.height;
                            var height = params.height || this.height / this.width * params.width;
                            canvas.attr({ width: width, height: height });
                            canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                        }
                    }
                }
            }])
            .controller('ElementTypeFormController',
                ['$scope', 'ElementType', '$mdDialog', '$http', 'FileUploader', 'ElementTypes', '$routeParams', 'ViewEditor',
                    function ($scope, ElementType, $mdDialog, $http, FileUploader, ElementTypes, $routeParams, ViewEditor) {
                        $scope.elementType = false;
                        $scope.elementsSelectViews = false;
                        $scope.newElementsViewName = '';
                        $scope.newView = false;
                        $scope.viewsHasChanged = {};
                        if ($routeParams.elementTypeName) {
                            ElementTypes.getElementTypes().then(function(){
                                $scope.elementType = ElementTypes.getType($routeParams.elementTypeName);
                                prepareAdminPage();
                            });
                        } else {
                            $scope.elementType = new ElementType({});
                            prepareAdminPage();
                        }
                        function prepareAdminPage(){
                            function getNewView() {
                                return {
                                    label: '',
                                    name: ''
                                };
                            }

                            $scope.addViewForm = false;
                            $scope.newView = getNewView();
                            $scope.addView = function () {
                                var view = $scope.elementType.createView($scope.newView.name, $scope.newView.label);
                                view.uploader = initializeUploader($scope.newView.name);
                                $scope.elementType.setView($scope.newView.name, view);

                                $scope.newView = getNewView();
                                $scope.addViewForm = false;
                            };
                            $scope.addViewFormShow = function(){
                                $scope.addViewForm = true;
                            };

                            $scope.algorithms = {};

                            angular.forEach($scope.elementType.getAlgorithms(), function (name, key) {
                                $scope.algorithms[key] = $scope.elementType.getStringAlgorithm(key);
                            });

                            //        $scope.targetParameter = $scope.elementType.createParameter();
                            $scope.targetPort = {};
                            $scope.targetActivePoint = {};

                            $scope.addParameter = function ($event) {
                                $scope.targetParameter = $scope.elementType.createParameter();

                                parameterFormShow($mdDialog, $event, function callback(parameter) {
                                    console.log("KEY", parameter);
                                    $scope.elementType.addParameter(parameter.machineName, parameter);
                                }, $scope.targetParameter);
                            };
                            $scope.removeParameter = function (key) {
                                $scope.elementType.removeParameter(key);
                            };
                            $scope.editParameter = function ($event, key, parameter) {
                                $scope.targetParameter = $scope.elementType.getParameter(key);

                                parameterFormShow($mdDialog, $event, function callback(parameter) {
                                    $scope.elementType.setParameter(key, parameter);
                                }, $scope.targetParameter);
                            };
                            $scope.$on('elementClick', function (e, data) {
                                if ($scope.newActivePoint) {
                                    $scope.newActivePoint.x(data.mouse[0]);
                                    $scope.newActivePoint.y(data.mouse[1]);
                                    data.view.activePoint(data.view.activePoints().length, $scope.newActivePoint);
                                    $scope.newActivePoint = false;
                                    $scope.$broadcast('changeActivePoints', data.view.activePoints());
                                    $scope.$apply();
                                } else if ($scope.newPort) {
                                    $scope.newPort.x(data.mouse[0]);
                                    $scope.newPort.y(data.mouse[1]);
                                    data.view.port(data.view.ports().length, $scope.newPort);
                                    $scope.newPort = false;
                                    $scope.$broadcast('changePorts', data.view.ports());
                                    $scope.$apply();
                                }
                            });
                            $scope.$on('selectLine', function (e, data){
                                console.log("Event", e, data);
                            });
                            $scope.newPort = false;
                            $scope.newActivePoint = false;
                            $scope.addPort = function () {
                                if ($scope.newActivePoint) {
                                    $scope.newActivePoint = false;
                                } else if (!$scope.newPort) {
                                    $scope.newPort = $scope.elementType.createPort({

                                    });
                                }
                            };
                            $scope.addActivePoint = function () {
                                if ($scope.newPort) {
                                    $scope.newPort = false;
                                } else if (!$scope.newActivePoint) {
                                    $scope.newActivePoint = $scope.elementType.createActivePoint({

                                    });
                                }
                            };

                            $scope.codeMirrorOptions = {
                                lineNumbers: true,
                                value: "",
                                mode: "javascript",
                                styleActiveLine: true,
                                matchBrackets: true,
                                theme: 'monokai'
                            };

                            $scope.uploader = new FileUploader({
                                url: '/admin/file/element_type',
                                onBeforeUploadItem: function (file) {
                                    file.formData.push({
                                        "elementType": $scope.elementType.machineName()
                                    });
                                },
                                onCompleteItem: function (file, response) {
                                    $scope.uploader.removeFromQueue(file);
                                    $scope.elementType.previews().push(response.file);
                                }
                            });
                            $scope.viewsUploader = {};
                            $scope.removePort = function(port, view) {
                                delete view.ports()[port];
                                $scope.$broadcast('changePorts', view.ports());
                            };
                            $scope.removeActivePoint = function(activePoint, view) {
                                delete view.activePoints()[activePoint];
                                $scope.$broadcast('changeActivePoints', view.activePoints());
                            };
                            $scope.toggleSize = function(view){
                                view.showSize = view.showSize?false:true;
                                $scope.elementsSelectViews = false;
                            };
                            $scope.selectViewParts = function (view){
                                $scope.elementsSelectViews = !$scope.elementsSelectViews;
                                view.showSize = false;
                            };
                            $scope.setSelectionsName = function (view) {
                                $scope.$broadcast('newViewName', view.newElementsViewName);
                                if (!$scope.viewsHasChanged[view.name()]) {
                                    $scope.viewsHasChanged[view.name()] = {};
                                }
                                $scope.viewsHasChanged[view.name()][ViewEditor.getEditor(view.name()).imageName] =
                                    ViewEditor.getEditor(view.name()).image;
                                view.details().push(view.newElementsViewName);
                                view.newElementsViewName = '';
                                $scope.elementsSelectViews = false;
                            };

                            function initializeUploader(viewName) {
                                var uploader = new FileUploader({
                                    url: '/admin/file/preview',
                                    onBeforeUploadItem: function (file) {
                                        file.formData.push({
                                            "elementType": $scope.elementType.machineName()
                                        });
                                    },
                                    onCompleteItem: function (file, response) {
                                        $scope.elementType.view(file.uploader.viewName).images().push(response.file);
                                        file.uploader.removeFromQueue(file);
                                    }
                                });
                                uploader.viewName = viewName;
                                return uploader;
                            }

                            $scope.portRole = [
                                {
                                    label: 'Both',
                                    value: 'both'
                                },
                                {
                                    label: 'In',
                                    value: 'in'
                                },
                                {
                                    label: 'Out',
                                    value: 'out'
                                }
                            ];
                            $scope.portDir = [
                                {
                                    label: 'Left',
                                    value: 'left'
                                },
                                {
                                    label: 'Right',
                                    value: 'right'
                                },
                                {
                                    label: 'Top',
                                    value: 'top'
                                },
                                {
                                    label: 'Bottom',
                                    value: 'bottom'
                                }
                            ];

                            $scope.elementRole = [
                                {
                                    label: 'Consumer',
                                    value: 'consumer'
                                },
                                {
                                    label: 'Source',
                                    value: 'source'
                                }
                            ];

                            angular.forEach($scope.elementType.getViews(), function(view, name){
                                view.uploader = initializeUploader(name);
                            });

                            $scope.removeViewImage = function(view, imageKey) {
                                view.images().splice(imageKey, 1);
                                view.image(view.images()[0]);
                            };
                            $scope.removePreview = function (key) {
                                $scope.elementType.previews().splice(key, 1);
                            };

                            $scope.save = function () {
                                var elementTypeData = $scope.elementType.toJSON();
                                var defer = null;
                                if (elementTypeData.id) {
                                    defer = $http.put('/api/element_type/' + elementTypeData.id,
                                        {'elementType': elementTypeData})
                                        .success(function(){
                                            saveImageChanges();
                                        });
                                } else {
                                    defer = $http.post('/api/element_type/', {'elementType': elementTypeData})
                                        .success(function (data) {
                                            $scope.elementType.id(data.id);
                                            saveImageChanges();
                                        });
                                }
                            };
                            function saveImageChanges() {
                                angular.forEach($scope.viewsHasChanged, function(images, viewName){
                                    angular.forEach(images, function(content, image){
                                        $scope.viewsHasChanged[viewName][image] =
                                            document.createElement("div").appendChild(content.cloneNode(true)).innerHTML;
                                    })
                                });
                                $http.put('/api/element_type/view/images/rewrite', {
                                    viewsData: $scope.viewsHasChanged,
                                    elementType: $scope.elementType.machineName()
                                }).success(function(){
                                    console.log("SUCCESS");
                                })
                            }
                            $scope.remove = function () {
                                if ($scope.elementType.id) {
                                    defer = $http.delete('/api/element_type/' + $scope.elementType.id);
                                }
                            }
                        }
                    }])
            .factory('ViewEditor', [function(){
                var editors = {};
                var Editor = function () {
                    this.image = '';
                    this.container = '';
                };
                return {
                    getEditor: function (viewName) {
                        return editors[viewName];
                    },
                    addEditor: function(viewName){
                        editors[viewName] = new Editor();
                        return editors[viewName];
                    }
                }
            }])
            .directive('viewEditor', ['$d3', 'ViewEditor', function($d3, ViewEditor){
                return {
                    templateNamespace: 'svg',
                    restrict: 'E',
                    replace: true,
                    scope: {
                        view: '=',
                        select: '=',
                        selectElement: '=',
                        newActivePoint: '=',
                        newPort: '='
                    },
                    template: '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' +
                        '<g class="editor-container">' +
                        "</g>" +
                        '</svg>',
                    link: function ($scope, el) {
                        var editorObject = ViewEditor.addEditor($scope.view.name());
                        var editor = $d3.select(el[0]);
                        var editorContainer = editor.select('g.editor-container');
                        var componentContainer = editorContainer.append('g').attr('class', 'component-container');
                        var controlsContainer = editorContainer.append('g').attr('class', 'editor-container');
                        var selectionDragger = $d3.behavior.drag();
                        var selectionArea = {x: 0, y: 0, w: 0, h: 0, bX: 0, bY: 0};
                        var selectionFrame = null;
                        function updateSelectionFrame(){
                            selectionFrame = selectionFrame
                                .attr('x', function(d){return d.x;})
                                .attr('y', function(d){return d.y;})
                                .attr('width', function(d){return d.w;})
                                .attr('height', function(d){return d.h;})
                            ;
                        }
                        selectionDragger
                            .on('dragstart', function(){
                                selectionFrame = componentContainer.selectAll('rect.selection')
                                    .data([selectionArea]);
                                selectionFrame.enter().append('rect')
                                    .attr('fill', 'none')
                                    .attr('class', 'selection');
                                var mouse = $d3.mouse(this);

                                selectionArea.x = mouse[0];
                                selectionArea.y = mouse[1];
                                selectionArea.bX = mouse[0];
                                selectionArea.bY = mouse[1];
                                selectionArea.w = 0;
                                selectionArea.h = 0;

                                updateSelectionFrame();
                            })
                            .on('drag', function(){
                                var mouse = $d3.mouse(this);
                                var move = [
                                    mouse[0] - selectionArea.bX,
                                    mouse[1] - selectionArea.bY
                                ];
                                if (move[0] > 0) {
                                    selectionArea.x = selectionArea.bX;
                                } else {
                                    selectionArea.x = mouse[0];
                                }
                                selectionArea.w = Math.abs(move[0]);
                                if (move[1] > 0) {
                                    selectionArea.y = selectionArea.bY;
                                } else {
                                    selectionArea.y = mouse[1];
                                }
                                selectionArea.h = Math.abs(move[1]);
                                updateSelectionFrame();
                            })
                            .on('dragend', function(){
                                selectionFrame.remove();
                                $scope.view.width(selectionArea.w);
                                $scope.view.height(selectionArea.h);
                                $scope.view.x(selectionArea.x);
                                $scope.view.y(selectionArea.y);
                            });
                            editor.call(
                                $d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", function zoom() {
                                        editorContainer.attr("transform", "scale(" + $d3.event.scale + ")");
                                    }
                                )
                            )
//                                .call(selectionDragger)
                        ;
                        function initControls(prefixClass, portsArray) {
                            var containerClass = prefixClass + '-container';
                            var portContainers = controlsContainer.selectAll('g.' + containerClass)
                                .data(portsArray);
                            portContainers.exit().remove();
                            portContainers = portContainers.enter()
                                .append('g')
                                .attr('class', containerClass);
//                                .call(customDrag);
                            portContainers.append('circle')
                                .attr('class', function (d) {
                                    return prefixClass + ' ' + prefixClass + '_' + d.id();
                                })
                                .attr('cx', function (port) {
                                    return port.x();
                                })
                                .attr('cy', function (port) {
                                    return port.y();
                                })
                                .attr('r', function (port) {
                                    return port.r();
                                })
//                                .on('click', function(){
//                                    if ($scope.selectElement) {
//                                        selectElement.call(this);
//                                    }
//                                })
                            ;
                            portContainers.append('circle')
                                .attr('class', function (d) {
                                    return prefixClass + 'Field ' + prefixClass + '_' + d.id();
                                })
                                .attr('cx', function (port) {
                                    return port.x();
                                })
                                .attr('cy', function (port) {
                                    return port.y();
                                })
                                .attr('r', function (port) {
                                    return port.r() + 3;
                                })
//                                .on('click', function(){
//                                    if ($scope.selectElement) {
//                                        selectElement.call(this.pare);
//                                    }
//                                })
                            ;
                        }

                        function resetPorts(ports) {
                            console.error("Check ports", ports);
                            var prefixClass = 'port';
                            var portsArray = [];
                            angular.forEach(ports, function (port) {
                                portsArray.push(port);
                            });
                            initControls(prefixClass, portsArray);
                        }

                        $scope.$on('changePorts', function(e, ports){
                            resetPorts(ports);
                        });
                        resetPorts($scope.view.ports());
                        function resetActivePoints(activePoints) {
                            console.log("Check", activePoints);
                            var prefixClass = 'activePoint';
                            var activePointsArray = [];
                            angular.forEach(activePoints, function (point) {
                                activePointsArray.push(point);
                            });
                            initControls(prefixClass, activePointsArray);
                        }

                        $scope.$on('changeActivePoints', function(e, activePoints){
                            resetActivePoints(activePoints);
                        });
                        resetActivePoints($scope.view.activePoints());
                        $scope.selectedPaths = [];
                        $scope.$on('newViewName', function(e, name){
                            console.log("Check", name, e, $scope.selectedPaths);
                            for (var i in $scope.selectedPaths) {
                                console.log("El", $scope.selectedPaths[i]);
                                $d3.select($scope.selectedPaths[i])
                                    .attr('selected', null)
                                    .attr('stroke', null)
                                    .attr('detail-name', name)
                                ;
                            }
                            $scope.selectedPaths.splice(0, $scope.selectedPaths.length);
                        });
                        function selectElement() {
                            var element = $d3.select(this);
                            if ($d3.select(this).attr('selected')) {
                                $scope.selectedPaths.splice(element.attr('selected') - 1, 1);
                                $d3.select(this)
                                    .attr('selected', null)
                                    .attr('stroke', null)
                                ;
                            } else {
                                $scope.selectedPaths.push(this);
                                element
                                    .attr('selected', $scope.selectedPaths.length + 1)
                                    .attr('stroke', '#ff2222')
                                ;
                            }
                        }

                        $scope.$watch('view.image()', function(image){
                            if (image) {
                                $scope.selectedPaths.splice(0, $scope.selectedPaths.length);
                                var imageElement = componentContainer
                                        .data([image])
                                    .each(function (d){
                                        var element = this;
                                        editorObject.image = this;
                                        $d3.xml(image, "image/svg+xml", function(xml) {
                                            element.appendChild(xml.documentElement);
                                            editorObject.imageName = image;
                                            $d3.select(element)
                                                .select('svg')
                                                 .attr('width', '100%')
                                                .attr('height', '100%')
                                                .selectAll('path,line,circle')
                                                .on('click', function(d, e){
                                                    if ($scope.selectElement) {
                                                        selectElement.call(this);
                                                    }
                                                })
                                            ;
                                        });
                                    })
                                        .on('click', function(){
                                            $d3.event.stopPropagation();
                                            $scope.$emit('elementClick', {view: $scope.view, el: this, mouse: d3.mouse(this)});
                                        })
                                    ;
                                imageElement.exit().remove();
//                                imageElement.enter()
////                                    .append('image');
//                                imageElement.attr('xlink:href', image)
//                                    .attr('width', '100%')
//                                    .attr('height', '100%')
                            }
                        });
                    }
                }
            }])
            .controller('ElementTypeList', [function () {

            }])
            .controller('ElementPropertyController', [
                '$scope', 'Parameter', '$mdDialog',
                function ($scope, Parameter, $mdDialog) {
                    $scope.callback = this.callback;
                    $scope.parameter = this.parameter;
                    $scope.allowedParameterTypes = this.parameter.getAllowedTypes();
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                    $scope.save = function (parameter) {
                        $mdDialog.hide(parameter);
                    };
                    $scope.configureOptions = function ($event) {
//                $scope.hide();
                        $mdDialog.show({
                            controller: 'PropertyOptionsController',
                            templateUrl: '/bundles/element/html/admin/parameter_options.edit.html',
                            targetEvent: $event,
                            bindToController: true,
                            locals: {
                                parameter: $scope.parameter,
                                options: $scope.parameter.options,
                                callback: $scope.callback
                            }
                        });
                    }
                }
            ])
            .controller('PropertyOptionsController', [
                '$scope', '$mdDialog',
                function ($scope, $mdDialog) {
                    $scope.options = this.options;
                    $scope.baseOptions = angular.copy(this.options);
                    $scope.parameter = this.parameter;
                    $scope.callback = this.callback;

                    $scope.addOption = function () {
                        $scope.options.push({
                            key: '',
                            label: ''
                        });
                    };
                    $scope.hide = function () {
                        $scope.options.splice(0, $scope.options.length).concat($scope.baseOptions);
                        parameterFormShow($mdDialog, {}, $scope.callback, $scope.parameter);
                    };
                    $scope.save = function (parameter) {
                        parameterFormShow($mdDialog, {}, $scope.callback, $scope.parameter);
                    };
                }
            ])
            .controller('ElementTypeListController', ['$scope', 'ElementTypes', function($scope, ElementTypes){
                ElementTypes.getElementTypes().then(function(){
                    $scope.elementTypes = ElementTypes.getTypeList();
                    console.log("ET", $scope.elementTypes['master'].view('defaultView'));
                });
            }])
        ;

    function parameterFormShow($mdDialog, $event, callback, targetParameter) {
        $mdDialog.show({
            controller: 'ElementPropertyController',
            templateUrl: '/bundles/element/html/admin/element_parameter.edit.html',
            targetEvent: $event,
            bindToController: true,
            locals: {
                parameter: targetParameter,
                callback: callback
            }
        }).then(function (parameter) {
            if (callback) {
                callback(parameter);
            }
        }, function () {
        });
    }
})();