import React, { useEffect, useRef } from "react";

const RandomLineBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.lineCap = "butt";
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      let y = Math.random() * canvas.height;
      ctx.moveTo(Math.random() * canvas.width, y);
      ctx.lineTo(Math.random() * canvas.width, y);
      ctx.strokeStyle = Math.random() > 0.5 ? "white" : "black";
      ctx.lineWidth = Math.random() * 200;
      ctx.globalAlpha = Math.random() * 0.01;
      ctx.stroke();
    }
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
