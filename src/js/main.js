//require("./lib/social"); //Do not delete
var d3 = require('d3');

// -----------------------------------------------------------------------------
// reload page if the reader re-orients their device ---------------------------
// -----------------------------------------------------------------------------

window.addEventListener("orientationchange", function() {
  window.location.reload();
}, false);


// var formatthousands = d3.format("0,000");
var formatthousands = d3.format(",d");

var horiz_spacing = {
  left: 100,
  right: -50
}

var left_alignment = 70;
var margin = {
  x: 200,
  y: 50 }
if (screen.width > 768) {
  var W = 900;
  var H = 900;
} else if (screen.width <= 768 && screen.width > 667) {
  var W = 750;
  var H = 800;
  var horiz_spacing = {
    left: 100,
    right: 0
  }
} else if (screen.width <= 667 && screen.width > 480) {
  var W = 525;
  var H = 600;
  var horiz_spacing = {
    left: 50,
    right: 0
  }
  var left_alignment = 40;
} else if (screen.width <= 480) {
  var W = 320;
  var H = 600;
  var margin = {
    x: 120,
    y: 0 };
  var horiz_spacing = {
    left: 0,
    right: -10
  };
  var left_alignment = 40;
}

function color_function(d) {
  if (d == "Doris Fisher"){
    return '#A2B685';
  } else if (d == "Ron Conway") {
    return '#869FBF';
  } else if (d == "California Charter Schools Assoc") {
    return '#FFE64C';
  } else {
    return "#D13D59";
  }
}

function linewidth(d) {
  if (screen.width <= 480) {
    var result = d/1.5e5+8;
  } else {
    var result = d/0.7e5+6;
  }
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
      .attr("transform", "translate("+left_alignment+",0)");

var tree = d3.tree()
  .size([H-margin.y,W-margin.x]);

// var diagonal = d3.diagonal()
//  .projection(function(d) { return [d.x, d.y]; });

// console.log(diagonal);

var stratify = d3.stratify()
  .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

var root = stratify(campaignData)
    .sort(function(a, b) {
      return (a.height - b.height) || a.id.localeCompare(b.id);
    });

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
    // .attr("d", diagonal)
    .attr("d", function(d) {
      return "M" + d.y + "," + d.x
          + "C" + (d.y + d.parent.y) / 2 + "," + d.x
          + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
          + " " + d.parent.y + "," + d.parent.x;
    })
    .on("mouseover", function(d) {
      var split_str = d.id.split(".");
      var donor = d.id.substring(d.id.lastIndexOf(".") + 1);
      var recipient = split_str[ split_str.length - 2 ];
      if (donor.substr(donor.length-5) == "Assoc") {
        donor = donor+".";
      }
      if (recipient.substr(recipient.length-5) == "Assoc") {
        recipient = recipient+".";
      }
      tooltip.html(`
        <div><span class="bold">Donor</span>: ${donor}</div>
        <div><span class="bold">Recipient</span>: ${recipient}</div>
        <div><span class="bold">Amount</span>: $${formatthousands(d.data.value)}</div>
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
      // return "translate(" + (W-d.y) + "," + d.x + ")";
    })
    .on("mouseover", function(d) {
      var split_str = d.id.split(".");
      if (split_str[ split_str.length - 2 ]) {
        var donor = d.id.substring(d.id.lastIndexOf(".") + 1);
        var recipient = split_str[ split_str.length - 2 ];
        if (donor.substr(donor.length-5) == "Assoc") {
          donor = donor+".";
        }
        if (recipient.substr(recipient.length-5) == "Assoc") {
          recipient = recipient+".";
        }
        tooltip.html(`
          <div><span class="bold">Donor</span>: ${donor}</div>
          <div><span class="bold">Recipient</span>: ${recipient}</div>
          <div><span class="bold">Amount</span>: $${formatthousands(d.data.value)}</div>
        `);
      } else {
        var donor = d.id.substring(d.id.lastIndexOf(".") + 1);
        tooltip.html(`
          <div><span class="bold">Candidate</span>: ${donor}</div>
          <div><span class="bold">Amount</span>: $${formatthousands(d.data.value)}</div>
        `);
      }
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

if (screen.width <= 480) {
  node.append("text")
      // how far the text is spaced from the nodes vertically
      .attr("dy", function(d) {
        return 20;
      })
      .attr("x", function(d) {
        var res = d.children ? horiz_spacing.left : horiz_spacing.right;
        if (d.children){
          if (d.id.substring(d.id.lastIndexOf(".") + 1) == "Independent Expenditure Committees"){
            return res+100;
          } else if (d.id.substring(d.id.lastIndexOf(".") + 1) == "Equality California PAC") {
            return res;
          } else {
            return res+30;
          }
        } else {
          if ((d.id.substring(d.id.lastIndexOf(".") + 1) == "Doris Fisher") || (d.id.substring(d.id.lastIndexOf(".") + 1) == "Ron Conway")) {
            return res+10;
          } else {
            return res-30;
          }
        }
        return res;
      })
      .style("text-anchor", function(d) {
        return d.children ? "end" : "start";
      })
      .text(function(d) {
        var text_str = d.id.substring(d.id.lastIndexOf(".") + 1);
        if (text_str.substr(text_str.length-5) == "Assoc") {
          text_str = text_str+".";
        }
        return text_str;
      })
} else if (screen.width <= 568 && screen.width > 480) {
  node.append("text")
      // how far the text is spaced from the nodes vertically
      .attr("dy", function(d) {
        return 20;
      })
      .attr("x", function(d) {
        var res = d.children ? horiz_spacing.left : horiz_spacing.right;
        console.log(res);
        if (d.children){
          if (d.id.substring(d.id.lastIndexOf(".") + 1) == "Independent Expenditure Committees"){
            return res+100;
          } else {
            return res;
          }
        } else {
          return res;
        }
        return res;
      })
      .style("text-anchor", function(d) {
        return d.children ? "end" : "start";
      })
      .text(function(d) {
        var text_str = d.id.substring(d.id.lastIndexOf(".") + 1);
        if (text_str.substr(text_str.length-5) == "Assoc") {
          text_str = text_str+".";
        }
        return text_str;
      })
} else {
  node.append("text")
      // how far the text is spaced from the nodes vertically
      .attr("dy", function(d) {
        return 20;
      })
      .attr("x", function(d) {
        // how far the text is spaced from the nodes horizonally
        return d.children ? horiz_spacing.left : horiz_spacing.right;
      })
      .style("text-anchor", function(d) {
        return d.children ? "end" : "start";
      })
      .text(function(d) {
        var text_str = d.id.substring(d.id.lastIndexOf(".") + 1);
        if (text_str.substr(text_str.length-5) == "Assoc") {
          text_str = text_str+".";
        }
        return text_str;
      })
}
