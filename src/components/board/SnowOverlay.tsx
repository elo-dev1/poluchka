import React, { useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  angle: number;
  opacity: number;
}

export const SnowOverlay: React.FC = () => {
  const { snowEnabled } = useGame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!snowEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const count = Math.min(50, Math.floor(width / 30));
    const flakes: Snowflake[] = [];

    for (let i = 0; i < count; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1 + Math.random() * 2.5,
        speed: 0.6 + Math.random() * 1.4,
        wind: -0.4 + Math.random() * 0.8,
        angle: Math.random() * Math.PI * 2,
        opacity: 0.3 + Math.random() * 0.6,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      flakes.forEach((f) => {
        f.angle += 0.015;
        f.y += f.speed;
        f.x += Math.sin(f.angle) * 0.8 + f.wind * 0.3;

        if (f.y > height) {
          f.y = -10;
          f.x = Math.random() * width;
        }
        if (f.x > width) f.x = 0;
        if (f.x < 0) f.x = width;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [snowEnabled]);

  if (!snowEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      style={{ opacity: 0.8 }}
    />
  );
};
