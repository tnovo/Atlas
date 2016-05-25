"use strict";
define(['knockout','d3', 'lodash', 'D3-Labeler/labeler'], function (ko, d3, _) {

  var catLineHeight = 38;
  var margin = {
      top: 0,
      right: 0,
      bottom: 30,
      left: 0
    };
  var vizHeight = 270;
  //var categoryBandHeight = categoryCount => vizHeight / categoryCount;
  //var categoryPos = categoryIdx => margin.top + categoryBandHeight * categoryIdx + categoryBandHeight * 1/2;
  //var mainHeight = 270;
  //var height = category.length * 35 - margin.top - margin.bottom;
  var minWidth = 900;
  var width = minWidth - margin.left - margin.right;

  var xScale = d3.scale.linear();
  function relativeXscale(x) {
    return xScale(x) - xScale(0);
  }
  var x = d=>{
    if (!d) debugger;
    //return d.startDate;
    return d.startDay;
  };
  // these are hardcoded now, but should be parameters to make this chart more reusable
  var endX = d => d.endDay;
  var y = d=>d.domain;
  var tipText = d=>d.conceptName;
  var pointClass = d=>d.domain;
  var radius = d=>2;

  var highlightFunc = ()=>{};
  var highlightFunc2 = ()=>{};
  ko.bindingHandlers.profileChart = {
    init: function (element, valueAccessor, allBindingsAccessor) {
      valueAccessor().highlightRecs.subscribe(recs=> {
        highlightFunc(recs);
        highlightFunc2(recs);
      });
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
      width = Math.max(minWidth, element.offsetWidth - margin.left - margin.right);
      var va = valueAccessor();
      console.log(width, va.showing());
      if (va.showing()) {
        categoryScatterPlot(element, va.recs(), 
                            pointyLine, //triangle,
                           null, va.zoomFilter);
        if (va.allRecs.length != va.recs().length)
         inset(element, va.allRecs, va.recs(), va.zoomFilter);
      }
    }
  };
  function categoryScatterPlot(element, points, 
                              pointFunc,
                              verticalLines, 
                              zoomFilter
                              ) {
    /* verticleLines: [{xpos, color},...] */
    //var mainHeight = categories.length * catLineHeight;

    xScale.domain([d3.min(points.map(x)), d3.max(points.map(endX))]);

    var categories = _.chain(points).map(y).uniq().value();
    var yScale = d3.scale.ordinal()
                   .domain(categories.sort())
                   .rangeRoundBands([margin.top, vizHeight + margin.top], .1);
                   //.rangeRoundBands([margin.top + vizHeight/categories.length/2, vizHeight + margin.top - vizHeight/categories.length/2], .1);

    $(element).empty();

    var svg = d3.select(element).append("svg")
      .attr("width", width)
      //.attr("width", width + margin.left + margin.right)
      .attr("height", vizHeight + margin.top + margin.bottom);
    xScale.range([0, width]);

    var focus = svg.append("g")
      //.attr("class", "focus")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    var brushed = function () {
      //xScale.domain(brush.empty() ? x2Scale.domain() : brush.extent());
      focus.selectAll('g.point')
        .attr("transform", function(d,i) {
          return "translate(" + (xScale(x(d)) + jitter(i).x) + "," + 
                                (yScale(y(d)) + yScale.rangeBand()/2 + jitter(i).y) +")";
        })
      //var member = self.members()[self.currentMemberIndex];
      focus.selectAll("line.index")  // not drawing vertLines right now
        .attr('x1', function (d) {
          return xScale(d)
        })
        .attr('y1', margin.top)
        .attr('x2', function (d) {
          return xScale(d)
        })
        .attr('y2', vizHeight)
      focus.select(".x.axis").call(xAxis);
    }

    var brush = d3.svg.brush()
      .x(xScale)
      .on("brush", brushed)
      .on("brushend", function() {
        if (brush.empty()) {
          //console.log(`empty brush setting zoomFilter to null`);
          zoomFilter(null);
        } else {
          //console.log(`brush ${brush.extent().join(',')} setting zoomFilter to ${brush.extent()}`);
          zoomFilter(brush.extent());
        }
        //zoomFilter.notifySubscribers();
        //holdBrushExtent(brush.extent());
      });

    var focusTip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function (d) {
        return tipText(d);
      });

    svg.call(focusTip);

    var letterSpacingScale = d3.scale.log()
          .domain([.8,20])
          .range([-.2, 2]);
    focus.selectAll('rect.category')
          .data(categories)
          .enter()
          .append('rect')
          .attr('class','category')
          .attr('width', width)
          .attr('height', yScale.rangeBand())
          .attr('y', d => yScale(d))
    focus.selectAll('text.category')
          .data(categories)
          .enter()
          .append('text')
          .attr('class','category')
          .attr('font-size', yScale.rangeBand() * .8)
          .attr('y', d => yScale(d) + yScale.rangeBand() * .8)
          .attr('x', width/2)
          .attr('text-anchor', 'middle')
          .style('letter-spacing', 0)
          .text(d=>d)
          .style('letter-spacing', function(d) {
            var ratio = width / this.getBBox().width;
            var ls = letterSpacingScale(ratio);
            console.log(ratio, ls);
            return ls + 'em';
          });

    var pointGs = focus.selectAll("g.point")
      .data(points);
    pointGs.exit().remove();
    pointGs
      .enter()
      .append("g")
        .classed('point', true);
    focus.selectAll("g.point")
      .attr("transform", function(d,i) {
        return "translate(" + (xScale(x(d)) + jitter(i).x) + "," + 
                              (yScale(y(d)) + yScale.rangeBand()/2 + jitter(i).y) +")";
      })
      .attr('class', function (d) {
        return pointClass(d);
      })
      .classed('point', true)
      .on('mouseover', function (d) {
        focusTip.show(d);
      })
      .on('mouseout', function (d) {
        focusTip.hide(d);
      })
      .each(pointFunc);


    if (points.length <= 50) {
      // labeler usage from https://github.com/tinker10/D3-Labeler demo
      var label_array = points.map((d,i)=>{
        d.x = xScale(x(d)) + jitter(i).x;
        d.y = yScale(y(d)) + yScale.rangeBand()/2 + jitter(i).y;
        d.r = 8;
        return {
          x: d.x,
          y: d.y,
          name: tipText(d),
          width: 0, height: 0,
          rec: d,
        };
      });
      var labels = focus.selectAll('.labels')
                     .data(label_array)
                     .enter()
                     .append('text')
                     .attr('class','label')
                     .attr('text-anchor','start')
                     .text(d=>d.name)
                     .attr('x', d=>d.x)
                     .attr('y', d=>d.y)
                     .attr('fill','black');
      var index=0;
      labels.each(function() {
        label_array[index].width = this.getBBox().width;
        label_array[index].height = this.getBBox().height;
        index += 1;
      });
      var links = focus.selectAll('.link')
                       .data(label_array)
                       .enter()
                       .append('line')
                       .attr('class','link')
                       .attr('x1', d=>d.x)
                       .attr('y1', d=>d.y)
                       .attr('x2', d=>d.x)
                       .attr('y2', d=>d.y)
      var sim_ann = d3.labeler()
                      .label(label_array)
                      .anchor(points)
                      .width(width)
                      .height(vizHeight)
                      .start(2000)
      labels.transition().duration(2000)
            .attr('x', d=>d.x)
            .attr('y', d=>d.y)
      links.transition().duration(2000)
            .attr('x2', d=>d.x)
            .attr('y2', d=>d.y)
    }

    focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (vizHeight + margin.top) + ")")
      .call(xAxis);

    focus.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y", margin.top)
      .attr("height", vizHeight);
    highlightFunc = function(recs) {
      if (recs.length === 0) {
        pointGs.classed('highlighted', false);
        pointGs.classed('unhighlighted', false);
        labels && labels.classed('highlighted', false);
        labels && labels.classed('unhighlighted', false);
        links && links.classed('highlighted', false);
        links && links.classed('unhighlighted', false);
      } else {
        pointGs.classed('highlighted', d => _.find(recs,d));
        pointGs.classed('unhighlighted', d => !_.find(recs,d));
        labels && labels.classed('highlighted', d => _.find(recs,d.rec));
        labels && labels.classed('unhighlighted', d => !_.find(recs,d.rec));
        links && links.classed('highlighted', d => _.find(recs,d.rec));
        links && links.classed('unhighlighted', d => !_.find(recs,d.rec));
      }
    };
    //console.log('profileChart just drew');
    /*
    if (holdBrushExtent()) {
      brush.extent(holdBrushExtent());
      brush.event(focus.select('g.x.brush'));
    }
    */
  }
  function inset(element, allPoints, filteredPoints, zoomFilter) {
    var insetWidth = (width + margin.left + margin.right) * .3
    var insetHeight = (vizHeight + margin.top + margin.bottom) * .3;
    var ixScale = d3.scale.linear()
                    .range([5,insetWidth])
                    .domain([d3.min(allPoints.map(x)), d3.max(allPoints.map(endX))]);
    var categories = _.chain(allPoints).map(y).uniq().value();
    var iyScale = d3.scale.ordinal().rangePoints([5, insetHeight])
                                    .domain(categories.sort());
    var svg = d3.select(element).append("svg")
      .attr("class", "inset")
      .attr("width", insetWidth + 10)
      .attr("height", insetHeight + 10)
      .style('position','absolute') // the main svg is centered in div so this
      .style('right', margin.right) // doesn't line up the right edges like I wanted
    var points = svg.selectAll("rect")
      .data(allPoints);
    points.exit().remove();
    points
      .enter()
      .append("rect")
    svg.selectAll("rect")
      .attr("x", (d,i) => ixScale(x(d)))
      .attr("y", (d,i) => iyScale(y(d)))
      .attr('class', function (d) {
        return pointClass(d);
      })
      .attr('width', 1)
      .attr('height', 1)
      .classed('filteredout', d => {
        //return allPoints.length != filteredPoints.length && !_.find(filteredPoints, d)
        return !_.find(filteredPoints, d)
      });
    highlightFunc2 = function(recs) {
      points.classed('highlighted', d => _.find(recs,d));
    }
    if (zoomFilter()) {
      var zoomDays = zoomFilter()[1] - zoomFilter()[0];
      var edges = [{x: ixScale(zoomFilter()[0]), 
                    width: ixScale(zoomDays) - ixScale(0)}];
      //console.log(zoomFilter(), zoomDays, edges);
      var insetZoom = svg
        .selectAll('rect.insetZoom')
        .data(edges)
        .enter()
           .append('rect')
           .attr('class', 'insetZoom')
        .attr('x', d=>d.x)
        .attr('width', d=>d.width)
        .attr('y', 5)
        .attr('height', insetHeight)
      var drag = d3.behavior.drag();
      insetZoom.call(drag);
      drag.on('drag', function(d) {
        d.x += d3.event.dx;
        insetZoom.attr('x', d.x)
        //.style('cursor', '-webkit-grabbing') doesn't work
      });
      drag.on('dragend', function(d) {
        var x = ixScale.invert(d.x);
        //insetZoom.style('cursor', '-webkit-grab')
        zoomFilter([x, x + zoomDays]);
      });

      var resizeLeft = svg
        .selectAll('rect.resizeLeft')
        .data(edges)
        .enter()
          .append('rect')
          .attr('class', 'resizeLeft')
        .attr('x', d=>d.x - 3)
        .attr('width', 6)
        .attr('y', 5)
        .attr('height', insetHeight)
      var resizeLeftDrag = d3.behavior.drag();
      resizeLeft.call(resizeLeftDrag);
      resizeLeftDrag.on('drag', function(d) {
        d.x += d3.event.dx;
        d.width -= d3.event.dx;
        //console.log(d);
        resizeLeft.attr('x', d.x - 3)
        insetZoom.attr('x', d.x)
                 .attr('width', d.width)
      });
      resizeLeftDrag.on('dragend', function(d) {
        var x = ixScale.invert(d.x);
        //insetZoom.style('cursor', '-webkit-grab')
        zoomFilter([x, zoomFilter()[1]]);
      });

      var resizeRight = svg
        .selectAll('rect.resizeRight')
        .data(edges)
        .enter()
          .append('rect')
          .attr('class', 'resizeRight')
        .attr('x', d=>d.x + d.width - 3)
        .attr('width', 6)
        .attr('y', 5)
        .attr('height', insetHeight)
      var resizeRightDrag = d3.behavior.drag();
      resizeRight.call(resizeRightDrag);
      resizeRightDrag.on('drag', function(d) {
        d.width += d3.event.dx;
        //console.log(d);
        resizeRight.attr('x', d.x + d.width - 3)
        insetZoom.attr('width', d.width)
      });
      resizeRightDrag.on('dragend', function(d) {
        var width = ixScale.invert(d.width) - ixScale.invert(0);
        zoomFilter([zoomFilter()[0], zoomFilter()[0] + width]);
      });
    }
  }
  function circle(datum) {
    var g = d3.select(this);
    g.selectAll('circle.' + pointClass(datum))
      .data([datum])
      .enter()
      .append('circle')
        .classed(pointClass(datum), true);
    g.selectAll('circle.' + pointClass(datum))
      .attr('r', radius(datum))
      //.attr('fill', 'blue');
  }
  function triangle(datum) {
    var g = d3.select(this);
    g.selectAll('path.' + pointClass(datum))
      .data([datum])
      .enter()
      .append('path')
        .attr('d', 'M 0 -3 L -3 3 L 3 3 Z')
        .attr('transform', 'scale(2)')
        .classed(pointClass(datum), true);
  }
  function pointyLine(datum) {
    // draw base of triangles at 0
    var tb = 6, th = 6; // triangle base, height
    var g = d3.select(this);
    g.selectAll('path.' + pointClass(datum))
      .data([datum])
      .enter()
      .append('path')
        .attr('d', function(d) {
          var length = relativeXscale(d.endDay-d.startDay);
          if (isNaN(length)) debugger;
          var path = [];
          path.push(`m ${tb/2} 0`);       // right corner, left triangle
          path.push(`l -${tb} 0`);        // left corner, left triangle
          path.push(`l ${tb/2} -${th}`);  // top corner, left triangle
          path.push(`l ${tb/2} ${th}`);   // right corner, left triangle
          if (length > tb) {
            path.push(`l ${length} 0`);     // right corner, right triangle
            path.push(`l -${tb/2} -${th}`); // top corner, right triangle
            path.push(`l -${tb/2} ${th}`);  // left corner, right triangle
            path.push(`l 0 -2`);            // line thickness
            path.push(`l -${length - tb} 0 Z`);   
          } else {
          }
          return path.join(' ');
              //'m 0 -3 l -3 6 l 6 0 Z M 4 -3 L 0 3 L 7 3 Z'
        })
        .classed(pointClass(datum), true);
  }
  var jitterOffsets = []; // keep them stable as points move around
  function jitter(i, maxX=6, maxY=12) {
    jitterOffsets[i] = jitterOffsets[i] || 
      { x: (Math.random() - .5) * maxX, y: (Math.random() - .5) * maxY };
    return jitterOffsets[i];
  }
});
