'use strict';

var d3 = require('./vendor/d3');

function Projection (el) {
    this.el = el;
    this.canvas = this.el.append('svg');
    this.points = this.getPoints();
    this.projection = d3.geo.mercator()
        .center(this.getCentre())
        .scale(1500000);
    this.path = d3.geo.path().projection(this.projection);

    this.setDimensions();
    this.draw();
}
Projection.prototype.getCentre = function () {
    return d3.geo.centroid({
        type: 'MultiPoint',
        coordinates: this.points.map(function (d) {
            return [d.longitude, d.latitude];
        })
    });
};
Projection.prototype.getBoundingBox = function () {
    return this.el.node().getBoundingClientRect();
};
Projection.prototype.getPoints = function () {
    return JSON.parse(this.el.attr('data-points'));
};
Projection.prototype.setDimensions = function () {
    var bBox = this.getBoundingBox();
    this.canvas.attr('width', bBox.width).attr('height', bBox.height);
    this.projection.translate([bBox.width / 2, bBox.height / 2]);
};
Projection.prototype.draw = function () {
    var projection = this.projection;
    this.canvas.selectAll('.point')
        .data(this.points)
        .enter().append('circle', '.pin')
        .attr('r', 5)
        .attr('transform', function (d) {
            return 'translate(' + projection([d.longitude, d.latitude]) + ')';
        });
};


new Projection(d3.select('.projection'));
