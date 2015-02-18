'use strict';

var d3 = require('./vendor/d3');

function Projection (el) {
    window.foo = this;

    this.el = el;
    this.canvas = this.el.append('svg');
    this.points = this.getPoints();
    this.projection = d3.geo.mercator().scale(1).translate([0, 0]);
    this.path = d3.geo.path().projection(this.projection);

    this.setDimensions();
    this.draw();
}
Projection.prototype.getBoundingBox = function () {
    var rect;
    rect = this.el.node().getBoundingClientRect();
    return {
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
        bottom: rect.bottom,
        right: rect.right
    };
};
Projection.prototype.getPoints = function () {
    return JSON.parse(this.el.attr('data-points')).map(function (point) {
        return [point.longitude, point.latitude];
    });
};
Projection.prototype.setDimensions = function () {
    var bBox, bounds, scale, translate;
    bBox = this.getBoundingBox();
    this.canvas
        .attr('width', bBox.width)
        .attr('height', bBox.height);
    bounds = this.path.bounds(this.points);
    scale = 0.95 / Math.max((bounds[1][0] - bounds[0][0]) / bBox.width, (bounds[1][1] - bounds[0][1]) / bBox.height);
    translate = [(bBox.width - scale * (bounds[1][0] + bounds[0][0])) / 2, (bBox.height - scale * (bounds[1][1] + bounds[0][1])) / 2];
    this.projection.scale(scale).translate(translate);
};
Projection.prototype.draw = function () {
    var projection = this.projection;
    this.canvas.selectAll('.point')
        .data(this.points)
        .enter().append('circle', '.pin')
        .attr('r', 5)
        .attr('transform', function (d) {
            return 'translate(' + projection(d).join(',') + ')';
        });
};
new Projection(d3.select('.projection'));
