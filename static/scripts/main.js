'use strict';

var d3 = require('./vendor/d3');
var vertices;

function Projection (el) {
    var _this = this;
    this.el = el;
    this.canvas = this.el.append('svg').attr('preserveAspectRatio', 'xMinYMin meet');
    this.features = this.getFeatures();
    this.projection = d3.geo.mercator().translate([0, 0]).scale(1);
    this.voronoi = d3.geom.voronoi();
    this.voronoiPath = this.canvas.append('g').selectAll('path');
    this.path = d3.geo.path().projection(this.projection);
    this.bounds = this.path.bounds(this.features);
    this.setDimensions();

    vertices = [[0,0]].concat(this.getPoints());
    this.fills = vertices.map(function () {
        var diffuser = 0.15;
        return 'rgba(255, 255, 255, ' + Math.random() * diffuser + ')';
    });

    d3.select('body').on('mousemove', function() {
        vertices[0] = d3.mouse(this);
        _this.draw();
    });

    this.draw();
}
Projection.prototype.getFeatures = function () {
    return {
        type: 'MultiPoint',
        coordinates: this.getPoints().map(function (d) {
            return [d.longitude, d.latitude];
        })
    };
};
Projection.prototype.getDimensions = function () {
    var node;
    node = this.el.node();
    return { width: node.offsetWidth, height: node.offsetHeight };
};
Projection.prototype.getPoints = function () {
    return JSON.parse(this.el.attr('data-points')).map(function (d, id) {
        d.id = id;
        return d;
    });
};
Projection.prototype.getVoronoiData = function () {
    var data, seen;
    data = [];
    seen = [];
    vertices.slice(1).forEach(function (d) {
        var hash, projection;
        projection = this.projection([d.longitude, d.latitude]);
        hash = projection.join(',');
        if (seen.indexOf(hash) === -1) { data.push(projection); }
        seen.push(hash);
    }, this);
    data[0] = vertices[0];
    return data;
};
Projection.prototype.setDimensions = function () {
    var b, d, n, s, t;
    n = this.el.node();
    b = this.bounds;
    d = { width: n.offsetWidth, height: n.offsetHeight };
    this.canvas
        .attr('viewBox', [0, 0, d.width, d.height].join(' '));
    s = 0.95 / Math.max((b[1][0] - b[0][0]) / d.width, (b[1][1] - b[0][1]) / d.height);
    t = [(d.width - s * (b[1][0] + b[0][0])) / 2, (d.height - s * (b[1][1] + b[0][1])) / 2];
    this.projection.scale(s).translate(t);
    this.voronoi.clipExtent([[0, 0], [d.width, d.height]]);
};
Projection.prototype.draw = function () {
    var points, projection, _this;
    _this = this;

    var polygon = function (d) { return 'M' + d.join('L') + 'Z'; };

    projection = this.projection;
    points = this.canvas.selectAll('.point')
        .data(this.getPoints(), function (d) { return d.id; });
    points.enter()
        .append('circle')
        .attr('class', 'point')
        .attr('r', 1)
        .attr('transform', function (d) {
            return 'translate(' + projection([d.longitude, d.latitude]) + ')';
        });

    this.voronoiPath = this.voronoiPath.data(this.voronoi(this.getVoronoiData()), polygon);
    this.voronoiPath.exit().remove();
    this.voronoiPath.enter().append('path')
        .attr('fill', function (d, i) { return _this.fills[i]; }, this)
        .attr('d', polygon);
    this.voronoiPath.order();
};

new Projection(d3.select('.projection'));
