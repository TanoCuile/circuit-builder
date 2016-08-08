(function(){
    angular.module('stri.element')
        .factory('Point', ['ActivePoint', 'IOPoint', 'idGenerator', function (ActivePoint, IOPoint, idGenerator) {
            return function (data) {
                var pointData = {
                    x: 0,
                    y: 0,
                    dir: 'left',
                    fix: false,
                    source: null
                };
                this.prepareData = function (newData) {
                    if (newData.config) {
                        pointData = {
                            fix: true,
                            source: newData
                        }
                    } else {
                        pointData = {
                            x: newData.x?newData.x:pointData.x,
                            y: newData.y?newData.y:pointData.y,
                            dir: newData.dir?newData.dir:pointData.dir,
                            fix: newData.fix || newData.fix == false?newData.fix:pointData.fix
                        };
                    }
                    pointData.id = newData.id ? newData.id : idGenerator.generate();
                };
                this.prepareData(data);
                this.fix = function (fix) {
                    if (fix || fix === false) {
                        pointData.fix = fix;
                        return this;
                    }
                    return pointData.fix || pointData.source;
                };
                this.x = function (x) {
                    if (pointData.source) {
                        return pointData.source.X.call(pointData.source);
                    }
                    if (x) {
                        pointData.x = x;
                        return this
                    }
                    return pointData.x;
                };
                this.y = function (y) {
                    if (pointData.source) {
                        return pointData.source.Y.call(pointData.source);
                    }
                    if (y) {
                        pointData.y = y;
                        return this
                    }
                    return pointData.y;
                };
                this.dir = function(dir) {
                    if (pointData.source) {
                        return pointData.source.dir.call(pointData.source);
                    }
                    if (dir) {
                        pointData.dir = dir;
                        return this;
                    }
                    return pointData.dir;
                };
                this.id = function (){
                    return pointData.id;
                };
                this.toJSON = function (){
                    var simplified = {};
                    if (pointData.source) {
                        simplified.source = pointData.source.id;
                    } else {
                        simplified.x = pointData.x;
                        simplified.y = pointData.y;
                        simplified.dir = pointData.dir;
                        simplified.fix = pointData.fix;
                    }
                    simplified.id = pointData.id;
                    return simplified;
                }
            }
        }])
        .factory('Connection', ['Point', 'idGenerator', function(Point, idGenerator){
            // No mater is "from" source port
            return function (data){
                var error = false;
                var path = [];
                // Line color line style
                var properties = {
                    id: idGenerator.generate(),
                    color: '#000',
                    style: 'solid',
                    width: 2
                };
                var source = null;
                var goal = null;

                this.path = function(newPath) {
                    if (newPath) {
                        path = newPath;
                        return this;
                    }
                    return path;
                };
                this.properties = function(newProperties){
                    if (newProperties) {
                        properties.color = newProperties.color?newProperties.color:properties.color;
                        properties.style = newProperties.style?newProperties.style:properties.style;
                        properties.width = newProperties.width?newProperties.width:properties.width;
                        properties.id = newProperties.id?newProperties.id:properties.id;
                        return this;
                    }
                    return properties;
                };

                this.validateConnection = function(){
                    if (['both', 'out'].indexOf(source.config.role()) >= 0 && ['both', 'in'].indexOf(goal.config.role()) >= 0) {
                        error = false;
                    } else if(['both', 'out'].indexOf(goal.config.role()) && ['both', 'in'].indexOf(source.config.role())) {
                        var tmp = goal;
                        goal = source;
                        source = tmp;
                        error = false;
                    } else {
                        source = null;
                        goal = null;
                        error = 'I the connection must have source and goal';
                    }
                    return error === false;
                };
                this.id = function(){
                    return properties.id;
                }
                this.goal = function () {
                    return goal;
                };
                this.source = function(){
                    return source;
                };

                // For simulation
                this.zeroStage = function(){
                    return {};
                };
                this.getStage = function (){
                    if (source && source.getStage()) {
                        return source.getStage();
                    }
                    return this.zeroStage();
                };
                this.getOtherSide = function(id){
                    if (goal.id == id) {
                        return source;
                    } else if(source.id == id) {
                        return goal;
                    }
                    return false;
                }
                this.prepareConnection = function(from, to, points, properties){
                    var path = [];
                    var oldPoints = {};
                    for (var id in points) {
                        var fromPoint = {};
                        var toPoint = {};
                        if (points[id].from.source) {
                            fromPoint = new Point(from.id == points[id].from.source ? from : to);
                        } else {
                            if (!oldPoints[points[id].from.id]) {
                                fromPoint = new Point(points[id].from);
                                oldPoints[points[id].from.id] = fromPoint;
                            } else{
                                fromPoint = oldPoints[points[id].from.id];
                            }
                        }
                        if (points[id].to.source) {
                            toPoint = new Point(to.id == points[id].from.source ? to : from);
                        } else {
                            if (!oldPoints[points[id].to.id]) {
                                toPoint = new Point(points[id].to);
                                oldPoints[points[id].to.id] = toPoint;
                            } else{
                                toPoint = oldPoints[points[id].to.id];
                            }
                        }
                        path.push({
                            from: fromPoint,
                            to: toPoint
                        });
                    }
                    this.path(path);
                    this.properties(properties);

                    source = from;
                    goal = to;
                    if (!this.validateConnection()) {
                        delete this;
                        return false;
                    }
                    source.connections.push(this.id());
                    goal.connections.push(this.id());
                };
                this.prepareConnection(data.source, data.goal, data.path, data.properties);
                this.toJSON = function(){
                    if (this.validateConnection()) {
                        return {
                            id: this.id(),
                            path: path,
                            properties: properties,
                            source: source?source.id:null,
                            goal: goal?goal.id:null
                        }
                    }
                }
            };
        }])
})();