'use strict';

var d3 = require('./vendor/d3');

function Projection (el) {
    this.el = el;
    this.canvas = this.el.append('svg');
    this.points = this.getPoints();
    this.features = this.getFeatures();
    this.projection = d3.geo.mercator().translate([0, 0]).scale(1);
    this.path = d3.geo.path().projection(this.projection);

    this.draw();
}
Projection.prototype.getFeatures = function () {
    return {
        type: 'MultiPoint',
        coordinates: this.points.map(function (d) {
            return [d.longitude, d.latitude];
        })
    };
};
Projection.prototype.getBoundingBox = function () {
    return this.el.node().getBoundingClientRect();
};
Projection.prototype.getPoints = function () {
    return JSON.parse(this.el.attr('data-points'));
};
Projection.prototype.setDimensions = function () {
    var bBox = this.getBoundingBox();
    var b, s, t;
    this.canvas.attr('width', bBox.width).attr('height', bBox.height);
    b = this.path.bounds(this.features);
    s = 0.95 / Math.max((b[1][0] - b[0][0]) / bBox.width, (b[1][1] - b[0][1]) / bBox.height);
    t = [(bBox.width - s * (b[1][0] + b[0][0])) / 2, (bBox.height - s * (b[1][1] + b[0][1])) / 2];
    this.projection.scale(s).translate(t);
};
Projection.prototype.draw = function () {
    var projection = this.projection;
    this.setDimensions();
    this.canvas.selectAll('.point')
        .data(this.points)
        .enter().append('circle', '.pin')
        .attr('r', 1)
        .attr('transform', function (d) {
            return 'translate(' + projection([d.longitude, d.latitude]) + ')';
        });
};


new Projection(d3.select('.projection'));
