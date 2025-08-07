import React, { useEffect, useRef } from "react";

const SeparatorLine = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 300
    canvas.height = 20;
    ctx.beginPath();
    let y = 10;
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    //ctx.globalAlpha = Math.random() * 0.01;
    ctx.stroke();

  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        zIndex: -1000,
        width: "300px",
        height: "20px",
      }}
    />
  );
};

export default SeparatorLine;
