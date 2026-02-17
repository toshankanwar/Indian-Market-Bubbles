import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";

const BubbleChart = ({ stocks, timePeriod, onStockClick }) => {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const floatingTimerRef = useRef(null);
  const floatDelayRef = useRef(null);

  const getColor = useCallback((change) => {
    const c = parseFloat(change) || 0;
    if (c >= 5) return "#00e676";
    if (c >= 3) return "#00c853";
    if (c >= 1) return "#2e7d32";
    if (c >= 0.01) return "#1b5e20";
    if (c >= -0.01 && c <= 0.01) return "#37474f";
    if (c >= -1) return "#b71c1c";
    if (c >= -3) return "#c62828";
    if (c >= -5) return "#d50000";
    return "#ff1744";
  }, []);

  const cleanup = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.stop();
      simulationRef.current = null;
    }
    if (floatingTimerRef.current) {
      clearInterval(floatingTimerRef.current);
      floatingTimerRef.current = null;
    }
    if (floatDelayRef.current) {
      clearTimeout(floatDelayRef.current);
      floatDelayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!stocks || stocks.length === 0 || !svgRef.current) return;

    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    cleanup();
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const totalStocks = stocks.length;
    const screenArea = width * height;
    const screenDiag = Math.sqrt(width * width + height * height);
    const smallestSide = Math.min(width, height);

    // ===========================================================
    //  STEP 1: DEVICE MULTIPLIER
    // ===========================================================

    let deviceMultiplier;
    if (screenDiag < 600) deviceMultiplier = 1.0;
    else if (screenDiag < 900) deviceMultiplier = 1.1;
    else if (screenDiag < 1200) deviceMultiplier = 1.2;
    else if (screenDiag < 1600) deviceMultiplier = 1.3;
    else if (screenDiag < 2000) deviceMultiplier = 1.45;
    else if (screenDiag < 2600) deviceMultiplier = 1.6;
    else deviceMultiplier = 1.8;

    // ===========================================================
    //  STEP 2: CALCULATE RADIUS WITH HIGH CONTRAST
    //
    //  The key insight: we need the RATIO between biggest and
    //  smallest bubble to be at least 3:1 to 4:1 for good
    //  visualization. Previous approach compressed everything.
    //
    //  New approach:
    //  1. Rank stocks by |change| from 0 to 1
    //  2. Apply a power curve (exponent > 1) to amplify differences
    //  3. Map the curved rank to radius range
    // ===========================================================

    const absChanges = stocks.map((s) =>
      Math.abs(parseFloat(s.changes?.[timePeriod] || 0))
    );

    // Sort changes to get ranking
    const sortedChanges = [...absChanges].sort((a, b) => a - b);

    // Calculate min/max radius based on screen and count
    let minRadius, maxRadius;
    if (totalStocks <= 10) {
      minRadius = smallestSide * 0.04 * deviceMultiplier;
      maxRadius = smallestSide * 0.18 * deviceMultiplier;
    } else if (totalStocks <= 20) {
      minRadius = smallestSide * 0.03 * deviceMultiplier;
      maxRadius = smallestSide * 0.15 * deviceMultiplier;
    } else if (totalStocks <= 50) {
      minRadius = smallestSide * 0.022 * deviceMultiplier;
      maxRadius = smallestSide * 0.12 * deviceMultiplier;
    } else if (totalStocks <= 100) {
      minRadius = smallestSide * 0.016 * deviceMultiplier;
      maxRadius = smallestSide * 0.09 * deviceMultiplier;
    } else {
      minRadius = smallestSide * 0.012 * deviceMultiplier;
      maxRadius = smallestSide * 0.07 * deviceMultiplier;
    }

    // Ensure minimum readable size
    minRadius = Math.max(14, minRadius);
    maxRadius = Math.max(minRadius * 3.5, maxRadius); // At least 3.5x ratio

    // Calculate radius for each stock
    const finalRadii = absChanges.map((change) => {
      // Find this stock's percentile rank (0 to 1)
      const rank = sortedChanges.filter((c) => c <= change).length / totalStocks;

      // Apply power curve to amplify differences
      // exponent = 2.2 means:
      //   - Bottom 50% stocks → compressed into smaller sizes
      //   - Top 20% stocks → get much bigger bubbles
      //   - Creates clear visual hierarchy
      const curved = Math.pow(rank, 2.2);

      // Also blend in the actual change value for extra differentiation
      // This ensures that a 5% change stock is noticeably bigger than 2% change
      const maxChange = Math.max(...absChanges, 0.1);
      const changeRatio = change / maxChange;
      const changeBoost = Math.pow(changeRatio, 1.5);

      // Final blend: 60% rank-based + 40% change-based
      const blended = curved * 0.6 + changeBoost * 0.4;

      // Map to radius range
      const radius = minRadius + blended * (maxRadius - minRadius);

      return radius;
    });

    // ===========================================================
    //  STEP 3: VERIFY TOTAL AREA FITS ON SCREEN
    //  Scale down proportionally if bubbles would overflow
    // ===========================================================

    const totalBubbleArea = finalRadii.reduce(
      (sum, r) => sum + Math.PI * r * r,
      0
    );
    const maxAllowedArea = screenArea * 0.52;

    let scaleFactor = 1;
    if (totalBubbleArea > maxAllowedArea) {
      scaleFactor = Math.sqrt(maxAllowedArea / totalBubbleArea);
    }

    // Apply scale but preserve the min:max ratio
    const scaledRadii = finalRadii.map((r) => {
      const scaled = r * scaleFactor;
      return Math.max(minRadius * 0.8, scaled); // Allow slightly below min after scaling
    });

    // ===========================================================
    //  STEP 4: BUILD BUBBLE DATA – SPIRAL PLACEMENT
    // ===========================================================

    // Create indexed array for sorting by size
    const indexed = stocks.map((stock, i) => ({
      stock,
      radius: scaledRadii[i],
      change: parseFloat(stock.changes?.[timePeriod] || 0),
    }));

    // Sort by radius descending → big bubbles placed first (center)
    indexed.sort((a, b) => b.radius - a.radius);

    const avgR =
      scaledRadii.reduce((a, b) => a + b, 0) / scaledRadii.length || 30;
    const gap = Math.max(2, avgR * 0.06);

    const bubbleData = indexed.map((item, i) => {
      const angle = i * 0.9;
      const spiralR = Math.sqrt(i + 1) * avgR * 1.1;

      return {
        ...item.stock,
        radius: item.radius,
        change: item.change,
        x:
          width / 2 +
          Math.cos(angle) * Math.min(spiralR, width * 0.35),
        y:
          height / 2 +
          Math.sin(angle) * Math.min(spiralR, height * 0.35),
        vx: 0,
        vy: 0,
      };
    });

    // ===========================================================
    //  STEP 5: FORCE SIMULATION – STABLE
    // ===========================================================

    const simulation = d3
      .forceSimulation(bubbleData)
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.3))
      .force(
        "charge",
        d3.forceManyBody().strength((d) => -d.radius * 0.15)
      )
      .force(
        "collision",
        d3
          .forceCollide()
          .radius((d) => d.radius + gap)
          .strength(0.9)
          .iterations(5)
      )
      .force("x", d3.forceX(width / 2).strength(0.008))
      .force("y", d3.forceY(height / 2).strength(0.008))
      .alpha(0.4)
      .alphaDecay(0.008)
      .alphaMin(0.001)
      .velocityDecay(0.55);

    simulationRef.current = simulation;

    // ===========================================================
    //  STEP 6: DRAW BUBBLES
    // ===========================================================

    const nodes = svg
      .selectAll("g")
      .data(bubbleData, (d) => d.symbol)
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag()
          .on("start", function (event, d) {
            if (!event.active) simulation.alphaTarget(0.06).restart();
            d.fx = d.x;
            d.fy = d.y;
            d3.select(this)
              .select("circle")
              .transition()
              .duration(200)
              .attr("stroke", "rgba(255,255,255,0.25)")
              .attr("stroke-width", 2);
          })
          .on("drag", function (event, d) {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", function (event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
            d3.select(this)
              .select("circle")
              .transition()
              .duration(500)
              .attr("stroke", "rgba(255,255,255,0.06)")
              .attr("stroke-width", 0.5);
          })
      );

    // Circles
    nodes
      .append("circle")
      .attr("r", 0)
      .attr("fill", (d) => getColor(d.change))
      .attr("stroke", "rgba(255,255,255,0.06)")
      .attr("stroke-width", 0.5)
      .transition()
      .duration(1200)
      .delay((_, i) => i * 8)
      .ease(d3.easeElasticOut.amplitude(0.5).period(1.0))
      .attr("r", (d) => d.radius);

    // Symbol
    nodes
      .append("text")
      .attr("class", "symbol-label")
      .text((d) => {
        if (d.radius < 18) return "";
        if (d.radius < 26) return d.symbol.substring(0, 3);
        if (d.radius < 36) return d.symbol.substring(0, 5);
        return d.symbol;
      })
      .attr("text-anchor", "middle")
      .attr("dy", (d) => {
        if (d.radius >= 70) return "-0.6em";
        if (d.radius >= 50) return "-0.3em";
        if (d.radius >= 35) return "0em";
        return "0.15em";
      })
      .attr("fill", "white")
      .attr("font-size", (d) => `${Math.max(7, d.radius / 3.2)}px`)
      .attr("font-weight", "bold")
      .attr("font-family", "'Segoe UI', system-ui, sans-serif")
      .style("pointer-events", "none")
      .style("user-select", "none")
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay((_, i) => i * 8 + 500)
      .attr("opacity", 1);

    // Change %
    nodes
      .append("text")
      .attr("class", "change-label")
      .text((d) => {
        if (d.radius < 24) return "";
        return `${d.change >= 0 ? "+" : ""}${d.change}%`;
      })
      .attr("text-anchor", "middle")
      .attr("dy", (d) => {
        if (d.radius >= 70) return "0.8em";
        if (d.radius >= 50) return "1em";
        if (d.radius >= 35) return "1.2em";
        return "1.4em";
      })
      .attr("fill", "rgba(255,255,255,0.85)")
      .attr("font-size", (d) => `${Math.max(6, d.radius / 4)}px`)
      .attr("font-weight", "600")
      .attr("font-family", "'Segoe UI', system-ui, sans-serif")
      .style("pointer-events", "none")
      .style("user-select", "none")
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay((_, i) => i * 8 + 600)
      .attr("opacity", 1);

    // Price
    nodes
      .append("text")
      .attr("class", "price-label")
      .text((d) => {
        if (d.radius < 42) return "";
        return `₹${d.ltp?.toLocaleString("en-IN")}`;
      })
      .attr("text-anchor", "middle")
      .attr("dy", "2.2em")
      .attr("fill", "rgba(255,255,255,0.3)")
      .attr("font-size", (d) => `${Math.max(6, d.radius / 5)}px`)
      .attr("font-family", "'Segoe UI', system-ui, sans-serif")
      .style("pointer-events", "none")
      .style("user-select", "none")
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay((_, i) => i * 8 + 700)
      .attr("opacity", 1);

    // Company name
    nodes
      .append("text")
      .attr("class", "name-label")
      .text((d) => {
        if (d.radius < 58) return "";
        const name = d.name || "";
        return name.length > 16 ? name.substring(0, 15) + "…" : name;
      })
      .attr("text-anchor", "middle")
      .attr("dy", "-1.5em")
      .attr("fill", "rgba(255,255,255,0.2)")
      .attr("font-size", (d) => `${Math.max(6, d.radius / 6.5)}px`)
      .attr("font-family", "'Segoe UI', system-ui, sans-serif")
      .style("pointer-events", "none")
      .style("user-select", "none")
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay((_, i) => i * 8 + 800)
      .attr("opacity", 1);

    // ===========================================================
    //  HOVER / CLICK
    // ===========================================================

    nodes
      .on("mouseover", function (event, d) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(400)
          .ease(d3.easeElasticOut.amplitude(0.4).period(0.8))
          .attr("r", d.radius * 1.15)
          .attr("stroke", "rgba(255,255,255,0.25)")
          .attr("stroke-width", 2);
        d3.select(this).raise();
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(600)
          .ease(d3.easeQuadOut)
          .attr("r", d.radius)
          .attr("stroke", "rgba(255,255,255,0.06)")
          .attr("stroke-width", 0.5);
      });

    nodes.on("click", function (event, d) {
      event.stopPropagation();
      d3.select(this)
        .select("circle")
        .transition()
        .duration(120)
        .attr("r", d.radius * 1.4)
        .attr("stroke", "white")
        .attr("stroke-width", 3)
        .transition()
        .duration(500)
        .ease(d3.easeElasticOut.amplitude(0.5).period(0.6))
        .attr("r", d.radius * 1.1)
        .attr("stroke", "rgba(255,255,255,0.25)")
        .attr("stroke-width", 2);
      if (onStockClick) onStockClick(d);
    });

    svg.on("click", function (event) {
      if (event.target === svgRef.current) {
        if (onStockClick) onStockClick(null);
        nodes
          .select("circle")
          .transition()
          .duration(400)
          .attr("r", (d) => d.radius)
          .attr("stroke", "rgba(255,255,255,0.06)")
          .attr("stroke-width", 0.5);
      }
    });

    // ===========================================================
    //  TICK
    // ===========================================================

    simulation.on("tick", () => {
      nodes.attr("transform", (d) => {
        const padding = d.radius + gap + 2;
        if (d.x < padding) {
          d.x = padding;
          d.vx *= -0.3;
        }
        if (d.x > width - padding) {
          d.x = width - padding;
          d.vx *= -0.3;
        }
        if (d.y < padding) {
          d.y = padding;
          d.vy *= -0.3;
        }
        if (d.y > height - padding) {
          d.y = height - padding;
          d.vy *= -0.3;
        }
        return `translate(${d.x},${d.y})`;
      });
    });

    // Ambient floating
    floatDelayRef.current = setTimeout(() => {
      floatingTimerRef.current = setInterval(() => {
        if (simulation.alpha() < 0.01) {
          simulation.alpha(0.008).restart();
          bubbleData.forEach((d) => {
            if (!d.fx && !d.fy) {
              d.vx += (Math.random() - 0.5) * 0.15;
              d.vy += (Math.random() - 0.5) * 0.15;
            }
          });
        }
      }, 4000);
    }, 5000);

    const handleResize = () => cleanup();
    window.addEventListener("resize", handleResize);

    return () => {
      cleanup();
      window.removeEventListener("resize", handleResize);
    };
  }, [stocks, timePeriod, getColor, onStockClick, cleanup]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ touchAction: "none" }}
    />
  );
};

export default BubbleChart;