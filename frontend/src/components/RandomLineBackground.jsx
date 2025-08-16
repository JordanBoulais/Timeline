import React, { useEffect, useRef } from "react";

const RandomLineBackground = () => {
  const canvasRef = useRef(null);
  const linesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.lineCap = "butt";

    // Initialize random lines and store their properties in linesRef
    for (let i = 0; i < 50; i++) {
        let y = Math.random() * canvas.height;
      linesRef.current.push({
        x1: Math.random() * canvas.width,
        y1: y,
        x2: Math.random() * canvas.width,
        y2: y,
        color: Math.random() > 0.5 ? "white" : "black",
        lineWidth: Math.random() * 200,
        alpha: Math.random() * 0.02,
        speedX: Math.random() * 2 - 1, // random horizontal speed
      });
    }

    // Function to animate the lines
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before redrawing

      linesRef.current.forEach((line) => {
        // Update line positions based on speed
        line.x1 += line.speedX;
        line.x2 += line.speedX;

        // Handle boundary collisions by reversing direction
        if (line.x1 < 0 || line.x1 > canvas.width) line.speedX *= -1;
        if (line.x2 < 0 || line.x2 > canvas.width) line.speedX *= -1;

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.lineWidth;
        ctx.globalAlpha = line.alpha;
        ctx.stroke();
      });

      requestAnimationFrame(animate); // Recursively call animate to create the animation loop
    };

    animate(); // Start the animation loop

    return () => {
      // Cleanup on component unmount
      cancelAnimationFrame(animate);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: -1000,
        width: "100vw", // scale to full viewport width
        height: "100vh", // scale to full viewport height
      }}
    />
  );
};

export default RandomLineBackground;

