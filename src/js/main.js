//require("./lib/social"); //Do not delete
var d3 = require('d3');

// var formatthousands = d3.format("0,000");
var formatthousands = d3.format(",d");

var margin = {
  x: 200,
  y: 50 }
if (screen.width > 768) {
  var W = 900;
  var H = 900;
} else if (screen.width <= 768 && screen.width > 480) {
  var W = 650;
  var H = 900;
} else if (screen.width <= 480) {
  var W = 320;
  var H = 700;
  var margin = {
    x: 50,
    y: 20 }
}

function color_function(d) {
  if (d == "Other") {
    return "#555";
  } else {
    return "#D13D59";
  }
}

function linewidth(d) {
  var result = d/1.8e5+2;
  return result;
}

d3.select("#node-graph").append("svg")
  .attr("width",W)
  .attr("height",H);

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    g = svg.append("g")
      // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      .attr("transform", "translate(40,0)");

var tree = d3.tree()
  .size([H-margin.y,W-margin.x]);

var stratify = d3.stratify()
  .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

var root = stratify(campaignData)
    .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });

var link = g.selectAll(".link")
  .data(tree(root).descendants().slice(1))
  .enter().append("path")
    .attr("class", "link")
      .attr("stroke-width",function(d) {
        return linewidth(d.data.value);
      })
      .attr("stroke",function(d){
        var result = color_function(d.id.substring(d.id.lastIndexOf(".") + 1));
        return result;
      })
    .attr("d", function(d) {
      return "M" + d.y + "," + d.x
          + "C" + (d.y + d.parent.y) / 2 + "," + d.x
          + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
          + " " + d.parent.y + "," + d.parent.x;
    })
    .on("mouseover", function(d) {
      var split_str = d.id.split(".");
      tooltip.html(`
        <div><b>Donor</b>: ${d.id.substring(d.id.lastIndexOf(".") + 1)}</div>
        <div><b>Recipent</b>: ${split_str[ split_str.length - 2 ]}</div>
        <div><b>Amount</b>: $${formatthousands(d.data.value)}</div>
      `);
      tooltip.style("visibility", "visible");
  })
  .on("mousemove", function() {
    if (screen.width <= 480) {
      return tooltip
        .style("top",(d3.event.pageY+40)+"px")//(d3.event.pageY+40)+"px")
        .style("left",10+"px");
    } else {
      return tooltip
        .style("top", (d3.event.pageY+20)+"px")
        .style("left",(d3.event.pageX-80)+"px");
    }
  })
  .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

var node = g.selectAll(".node")
  .data(root.descendants())
  .enter().append("g")
    .attr("class", function(d) {
      return "node" + (d.children ? " node--internal" : " node--leaf");
    })
      .attr("fill",function(d){
        var result = color_function(d.id.substring(d.id.lastIndexOf(".") + 1));
        return result;
      })
    .attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    })

// show tooltip
var tooltip = d3.select("#node-graph")
    .append("div")
    .attr("class","tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")

node.append("circle")
    .attr("r", function(d){
      return (linewidth(d.data.value)/2);
    });

node.append("text")
    // how far the text is spaced from the nodes vertically
    .attr("dy", 20)
    .attr("x", function(d) {
      // how far the text is spaced from the nodes horizonally
      return d.children ? 50 : -50;
    })
    .style("text-anchor", function(d) {
      return d.children ? "end" : "start";
    })
    .text(function(d) {
      return d.id.substring(d.id.lastIndexOf(".") + 1);
    });
