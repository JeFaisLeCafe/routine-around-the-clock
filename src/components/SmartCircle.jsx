import React, { useCallback, useEffect } from "react";
import * as d3 from "d3";

/*
{
  color: "#8f2d87",
  fromTime: "0",
  toTime: "60",
  type: "Sleep"
}
*/

function SmartCircle(props) {
  const { routines } = props;
  const timeInnerRadius = 290;
  const outerRadius = 350;
  const innerRadius = 300;

  const margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  };

  const width = 2 * outerRadius + margin.left + margin.right;
  const height = 2 * outerRadius + margin.top + margin.bottom;

  const drawChart = useCallback(() => {
    // Remove the old svg
    d3.select("#smart-circle").select("svg").remove();

    // Create new svg
    const svg = d3
      .select("#smart-circle")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const arcGenerator = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const timeArcGenerator = d3
      .arc()
      .innerRadius(timeInnerRadius)
      .outerRadius(innerRadius);

    const pieGenerator = d3
      .pie()
      .padAngle(0)
      .value((d) => d.toTime - d.fromTime);

    const arc = svg.selectAll().data(pieGenerator(routines)).enter();

    // Append arcs
    arc
      .append("path")
      .attr("d", arcGenerator)
      .style("fill", (d) => d.data.color);

    arc.append("path").attr("d", timeArcGenerator).style("fill", "purple");

    // Append text labels
    arc
      .append("text")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .text((d) => d.data.type)
      .style("fill", "black")
      .attr("transform", (d) => {
        const [x, y] = arcGenerator.centroid(d);
        return `translate(${x}, ${y})`;
      });
  }, [innerRadius, outerRadius, routines, height, width]);

  useEffect(() => {
    drawChart();
  }, [routines, drawChart]);

  return (
    <div
      id="smart-circle"
      className="flex items-center justify-center relative">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <p className="">BONJOUR</p>
        {props.children}
      </div>
    </div>
  );
}

export default SmartCircle;
