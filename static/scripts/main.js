'use strict';

var d3 = require('./vendor/d3');

function Projection (el) {
    this.el = el;
    this.canvas = this.el.append('svg');
    this.points = this.canvas.selectAll('.point')
        .data(this.getPoints(), function (d) { return d.id; });
    this.features = this.getFeatures();
    this.projection = d3.geo.mercator().translate([0, 0]).scale(1);
    this.path = d3.geo.path().projection(this.projection);
    this.bounds = this.path.bounds(this.features);

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
Projection.prototype.setDimensions = function () {
    var b, d, s, t;
    b = this.bounds;
    d = this.getDimensions();
    this.canvas.attr('width', d.width).attr('height', d.height);
    s = 0.95 / Math.max((b[1][0] - b[0][0]) / d.width, (b[1][1] - b[0][1]) / d.height);
    t = [(d.width - s * (b[1][0] + b[0][0])) / 2, (d.height - s * (b[1][1] + b[0][1])) / 2];
    this.projection.scale(s).translate(t);
};
Projection.prototype.draw = function () {
    var projection = this.projection;
    this.setDimensions();
    this.points.enter()
        .append('circle')
        .attr('class', 'point')
        .attr('r', 1)
        .attr('transform', function (d) {
            return 'translate(' + projection([d.longitude, d.latitude]) + ')';
        });
    this.points.exit().remove();
};


new Projection(d3.select('.projection'));
