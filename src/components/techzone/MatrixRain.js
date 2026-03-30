import React, { useRef, useEffect } from 'react';

const MatrixRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = 500, H = 320;
    canvas.width = W;
    canvas.height = H;

    const fontSize = 13;
    const cols = Math.floor(W / fontSize);
    const drops = Array(cols).fill(1);
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>/{}[];domthedeveloper'.split('');
    let mouseCol = -1;

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      mouseCol = Math.floor((e.clientX - rect.left) * scaleX / fontSize);
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', () => { mouseCol = -1; });

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 8, 15, 0.05)';
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const nearMouse = mouseCol !== -1 && Math.abs(i - mouseCol) < 3;

        if (nearMouse) {
          ctx.fillStyle = '#64c8ff';
          ctx.shadowColor = '#64c8ff';
          ctx.shadowBlur = 12;
          ctx.font = `bold ${fontSize + 2}px "JetBrains Mono", monospace`;
        } else {
          const brightness = 0.4 + Math.random() * 0.6;
          ctx.fillStyle = `rgba(100, 200, 255, ${brightness})`;
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
        }

        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        // head glow
        if (drops[i] > 0) {
          ctx.fillStyle = nearMouse ? 'rgba(100, 200, 255, 1)' : 'rgba(200, 230, 255, 0.9)';
          ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        }

        ctx.shadowBlur = 0;

        if (drops[i] * fontSize > H && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += nearMouse ? 1.5 : 1;
      }
    };

    const interval = setInterval(draw, 45);
    return () => {
      clearInterval(interval);
      canvas.removeEventListener('mousemove', handleMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', maxWidth: 500, height: 'auto', borderRadius: 8, cursor: 'crosshair', display: 'block', background: '#050810' }}
    />
  );
};

export default MatrixRain;
