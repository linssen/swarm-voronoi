'use strict';

var d3 = require('./vendor/d3');

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
    this.fills = this.setFills();
    this.mouse = [0, 0];

    d3.select('body').on('mousemove', function() {
        _this.mouse = d3.mouse(this);
        _this.draw();
    });

    this.draw();
}
Projection.prototype.setFills = function () {
    var fillDiffuse = 0.2;
    return [].concat(this.features.coordinates).map(function () {
        return 'rgba(255, 255, 255, ' + Math.random() * fillDiffuse + ')';
    });
};
Projection.prototype.getFeatures = function () {
    return {
        type: 'MultiPoint',
        coordinates: this.getPoints().map(function (d) {
            return [d.longitude, d.latitude];
        })
    };
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
    this.getPoints().forEach(function (d) {
        var hash, projection;
        projection = this.projection([d.longitude, d.latitude]);
        hash = projection.join(',');
        if (seen.indexOf(hash) === -1) { data.push(projection); }
        seen.push(hash);
    }, this);
    return [this.mouse].concat(data);

};
Projection.prototype.setDimensions = function () {
    var b, d, n, s, t;
    n = this.el.node();
    b = this.bounds;
    d = { w: n.offsetWidth, h: n.offsetHeight };
    this.canvas.attr('viewBox', [0, 0, d.w, d.h].join(' '));
    s = 0.95 / Math.max((b[1][0] - b[0][0]) / d.w, (b[1][1] - b[0][1]) / d.h);
    t = [(d.w - s * (b[1][0] + b[0][0])) / 2, (d.h - s * (b[1][1] + b[0][1])) / 2];
    this.projection.scale(s).translate(t);
    this.voronoi.clipExtent([[0, 0], [d.w, d.h]]);
};
Projection.prototype.draw = function () {
    var data, points, polygon;

    data = this.getVoronoiData();
    polygon = function (d) { return 'M' + d.join('L') + 'Z'; };

    points = this.canvas.selectAll('circle')
        .data(data.slice(1), function (d) { return d.id; });
    points.enter()
        .append('circle')
        .attr('r', 1)
        .attr('transform', function (d) {
            return 'translate(' + d.join(',') + ')';
        });

    this.voronoiPath = this.voronoiPath.data(this.voronoi(data), polygon);
    this.voronoiPath.enter().append('path')
        .attr('fill', function (d, i) { return this.fills[i]; }.bind(this))
        .attr('d', polygon);
    this.voronoiPath.exit().remove();
    this.voronoiPath.order();
};

new Projection(d3.select('.projection'));
