(function(){
    angular.module('stri.circuit_simulator_view', [])
        .factory('View', [function(){
            function View(data) {
                this.id = data.id ? data.id : 0;
                this.type = data.type ? data.type : 'view';
                this.data = data.data ? data.data : [];
                this.properties = data.properties ? data.properties : {};
                this.source = data.source ? data.source : '';

                this.getPropertyValue = function () {
                    if (this.properties.property && this.source) {
                        return this.source.stage()[this.properties.property];
                    }
                    return null;
                };

                this.toJSON = function () {
                    return {
                        id: this.id,
                        type: this.type,
                        data: this.data,
                        properties: this.properties,
                        source: this.source ? this.source.id() : ''
                    }
                }
            }

            return View;
        }])
        .factory('BinaryView', ['View', function (View){
            return function (data) {
                var view = new View(data);
                view.type = 'binary';
                this.isNormal = true;
                this.type = function() {
                    return 'binary';
                };
                this.level = function (level){
                    if (level) {
                        if (typeof(level) == 'string') {
                            view.properties.level = parseFloat(level);
                        } else {
                            view.properties.level = level;
                        }
                        return this;
                    }
                    return view.properties.level;
                };
                this.rule = function (rule) {
                    if (typeof(rule) != 'undefined') {
                        view.properties.rule = rule;
                        return this;
                    }
                    return view.properties.rule;
                };
                this.ruleCallback = function (callback) {
                    if (typeof(callback) != 'undefined') {
                        view.properties.callback = callback;
                        return this;
                    }
                    return view.properties.callback;
                };
                this.source = function(source) {
                    if (source) {
                        view.source = source;
                    }
                    return view.source
                };
                this.property = function(property) {
                    if (property) {
                        view.properties.property = property;
                        return this;
                    }
                    return view.properties.property;
                };
                this.normal = function () {
                    if (typeof(this.rule()) != 'callback') {
                        if (this.rule().indexOf('<') >= 0 && view.getPropertyValue() < this.level()) {
                            return true;
                        } else if (this.rule().indexOf('>') >= 0 && view.getPropertyValue() > this.level()) {
                            return true;
                        } else if (this.rule().indexOf('=') >= 0 && view.getPropertyValue() == this.level()) {
                            return true;
                        }
                        return false;
                    } else if (this.ruleCallback()) {
                        var callBack = new Function('value', 'sourceParameters', this.ruleCallback());
                        return callback(view.getPropertyValue(), this.source().parameters());
                    }
                };
                this.checkElement = function () {
                    this.isNormal = this.normal();
                    view.data = this.isNormal;
                };
                this.toJSON = function (){
                    return view.toJSON();
                };
            }
        }])
        .factory('ChartView', ['View', function (View){
            return function (data) {
                var view = new View(data);
                view.type = 'chart';
                this.view = function(){
                    return view;
                };
                this.type = function() {
                    return 'chart';
                };
                this.data = function() {
                    return view.data;
                };
                this.transformCallback = function (callback) {
                    if (typeof(callback) != 'undefined') {
                        view.properties.callback = callback;
                        return this;
                    }
                    return view.properties.callback;
                };
                this.source = function(source) {
                    if (source) {
                        view.source = source;
                    }
                    return view.source
                };
                this.property = function(property) {
                    if (property) {
                        view.properties.property = property;
                        return this;
                    }
                    return view.properties.property;
                };
                this.label = function () {
                    return view.properties.label;
                };
                this.checkElement = function () {
                    var value = view.getPropertyValue();
                    if (this.transformCallback()) {
                        var callback = new Function('value', 'sourceParameters', this.transformCallback());
                        value = callback(view.getPropertyValue(), this.source().parameters());
                    }
                    view.data.push(value);
                    if (view.data.length > 30) {
                        view.data.splice(0, view.data.length - 30);
                    }
                };
                this.toJSON = function (){
                    return view.toJSON();
                };
            }
        }])
        .factory('TableView', ['View', function (View){
            return function (data) {
                var view = new View(data);
                view.type = 'table';
                this.view = function(){
                    return view;
                },
                    this.type = function() {
                        return 'table';
                    };
                this.data = function() {
                    return view.data;
                };
                this.source = function(source) {
                    if (source) {
                        view.source = source;
                    }
                    return view.source
                };
                this.property = function(property) {
                    if (property) {
                        view.properties.property = property;
                        return this;
                    }
                    return view.properties.property;
                };
                this.label = function () {
                    return view.properties.label;
                };
                this.checkElement = function () {
                    var value = view.getPropertyValue();
                    view.data.push(value);
                    if (view.data.length > 30) {
                        view.data.splice(0, view.data.length - 30);
                    }
                };
                this.toJSON = function (){
                    return view.toJSON();
                };
            }
        }])
        .directive('binaryView', [function () {
            return {
                restrict: 'E',
                templateUrl: '/bundles/circuit/html/views/binary_view.html',
                scope: {
                    view: '='
                },
                link: function($scope, el){

                }
            }
        }])
        .directive('chartView', [function () {
            return {
                restrict: 'E',
                templateUrl: '/bundles/circuit/html/views/chart_view.html',
                scope: {
                    views: '='
                },
                link: function($scope, el){
                    $scope.charts = {};
                    $scope.options = {};
                    var checkViews = function(e, views){
                        $scope.charts = {};
                        $scope.options = {};
                        for (var vid in views) {
                            if (views[vid].type() == 'chart'){
                                if (!$scope.options[views[vid].property()]) {
                                    $scope.options[views[vid].property()] = [];
                                }
                                $scope.options[views[vid].property()].push({
                                    label: views[vid].label(),
                                    data: views[vid].data()
                                });
                            }
                        }
                        console.log("OPTS", $scope.options);
                    };
//                    checkViews();
                    $scope.$on('changeViews', checkViews);
                    $scope.$on('emulationStart', function (){
                    });
                }
            }
        }])
        .directive('chart', [function(){
            return {
                restrict: 'E',
                scope: {
                    'options': '=',
                    'property': '='
                },
                template: '<div></div>',
                link: function($scope, el){
                    var series = [];
                    for (var sid in $scope.options){
                        series.push({name: $scope.options[sid].label, data: $scope.options[sid].data});
                    }
                    $scope.chart = new Highcharts.Chart({
                        chart: {
                            type: 'line',
                            renderTo: el[0]
                        },
                        title: {
                            text: ''
                        },
                        subtitle: {
                            text: ''
                        },
                        xAxis: {
                        },
                        yAxis: {
                            title: {
                                text: $scope.property
                            }
                        },
                        plotOptions: {
                            line: {
                                dataLabels: {
                                    enabled: true
                                },
                                enableMouseTracking: false
                            }
                        },
                        series: series
                    });
                    $scope.$on('emulationAction', function(){
                        for (var sid in series){
                            $scope.chart.series[sid].setData(series[sid].data);
                        }
                    });
                }
            }
        }])
        .directive('tableView', [function() {
            return {
                restrict: 'E',
                templateUrl: '/bundles/circuit/html/views/table_view.html',
                scope: {
                    views: '='
                },
                link: function($scope, el) {
                    $scope.data = {};
                    $scope.labels = {};
                    $scope.stream = [];
                    $scope.configData = {};
                    $scope.config = function(view){

                    };
                    var checkViews = function(e, views){
                        $scope.data = {};
                        $scope.labels = {};
                        $scope.stream = [];
                        $scope.configData = {};
                        for (var vid in views) {
                            if (views[vid].type() == 'table'){
                                $scope.configData[vid] = views[vid];
                                $scope.data[vid] = views[vid].data();
                                $scope.labels[vid] = views[vid].label();
                            }
                        }
                    };
//                    checkViews();
                    $scope.$on('changeViews', checkViews);
                    $scope.$on('emulationStart', function (){
                    });

                    $scope.$on('emulationAction', function(){
                        var date = (new Date());
                        var item = [date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()];
                        for (var did in $scope.data) {
                            item.push($scope.data[did][$scope.data[did].length - 1]);
                        }
                        $scope.stream.push(item);
                        if ($scope.stream.length > 20) {
                            $scope.stream.splice(0, 1);
                        }
                        $scope.$apply();
//                        angular.forEach($scope.data, function(data, property){
//                            for (var sid in data){
//
//                            }
//                        });
//                        $scope.chart.series[0].setData($scope.view.data());
                    });
                    $scope.trackingId = function (t, i){
                        return i * 100 + t;
                    }
                }
            }
        }])
        .factory('ViewManager', ['BinaryView', 'TableView', 'ChartView', 'View', function (binary, table, chart, view) {
            return {
                initializeView: function(viewData){
                    switch (viewData.type) {
                        case 'table':
                            return new table(viewData);
                        case 'chart':
                            return new chart(viewData);
                    }
                },
                initializeTableView: function () {
                    return table({});
                },
                getViewTypes: function(){
                    return [
//                        'binary',
                        'chart',
                        'table'
                    ];
                },
                getViewConfig: function(source){
                    return new view({source: source});
                }
            }
        }]);
})();