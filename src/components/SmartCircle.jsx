import React, { useCallback, useEffect } from "react";
import * as d3 from "d3";
import { axisRadialInner } from "d3-radial-axis";

/*
{
  color: "#8f2d87",
  fromTime: "0",
  toTime: "60",
  type: "Sleep"
}

var arc = d3
  .arc()
  .innerRadius(40)
  .outerRadius(45)
  .startAngle(10)
  .endAngle(8);
*/

function SmartCircle(props) {
  const { routines } = props;
  const outerRadius = 310;
  const innerRadius = 240;

  const width = 2 * outerRadius;
  const height = 2 * outerRadius;
  const hourScale = d3.scaleLinear().domain([0, 24]).range([0, 360]);

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

    for (let routine of routines) {
      const startAngle = (Math.PI * 2 * parseInt(routine.fromTime)) / (48 * 30);
      const endAngle = (Math.PI * 2 * parseInt(routine.toTime)) / (48 * 30);

      const routineArc = d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(startAngle)
        .endAngle(endAngle);

      svg
        .append("path")
        .attr("class", "arc")
        .attr("d", routineArc)
        .attr("fill", routine.color);
      //for some reason this needs to be done separatly from the above
      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(routine.type)
        .style("fill", "black")
        .attr("transform", (d) => {
          const [x, y] = routineArc.centroid(d);
          return `translate(${x}, ${y})`;
        });
    }

    // Add axis
    svg
      .append("g")
      .classed("axis", true)
      .call(
        axisRadialInner(
          hourScale.copy().range([0, 2 * Math.PI]),
          outerRadius - outerRadius / 5
        )
          .ticks(24)
          .tickSize(15)
          .tickPadding(20)
      );
  }, [innerRadius, outerRadius, routines, height, width, hourScale]);

  useEffect(() => {
    drawChart();
  }, [routines, drawChart]);

  return (
    <div
      id="smart-circle"
      className="flex items-center justify-center relative">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {props.children}
      </div>
      <div className="absolute w-3 h-3 rounded-full bg-black top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
    </div>
  );
}

export default SmartCircle;
