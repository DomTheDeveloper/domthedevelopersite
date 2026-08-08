import React, { useEffect, useRef } from 'react';
import { REEL_W, REEL_H, REEL_SECONDS } from '../reels/engine';
import { drawReel } from '../reels/reels';

/* Renders one reel into a 9:16 canvas.
 *
 * Playback state arrives through refs rather than props-in-deps, so toggling
 * play/pause never tears down and restarts the rAF loop (which would drop the
 * elapsed time and stutter the frame clock).
 */
const ReelCanvas = ({ reel, active, playing, reduced, seekSignal, onFrame, onEnded }) => {
  const canvasRef = useRef(null);
  const stateRef = useRef({ t: 0, last: 0 });
  const liveRef = useRef({ active, playing, reduced, onFrame, onEnded });

  useEffect(() => {
    liveRef.current = { active, playing, reduced, onFrame, onEnded };
  }, [active, playing, reduced, onFrame, onEnded]);

  // Any change to seekSignal rewinds to the top.
  useEffect(() => {
    stateRef.current.t = 0;
  }, [seekSignal]);

  // Leaving the viewport rewinds, so a reel always starts from frame zero.
  useEffect(() => {
    if (!active) stateRef.current.t = 0;
  }, [active]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return undefined;
    const ctx = cvs.getContext('2d');
    if (!ctx) return undefined;

    let raf = 0;
    let cancelled = false;
    let ended = false;
    const clock = stateRef.current;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = cvs.clientWidth || 360;
      const h = cvs.clientHeight || 640;
      const nw = Math.floor(w * dpr);
      const nh = Math.floor(h * dpr);
      if (cvs.width !== nw || cvs.height !== nh) {
        cvs.width = nw;
        cvs.height = nh;
      }
    };

    const paint = () => {
      resize();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      ctx.scale(cvs.width / REEL_W, cvs.height / REEL_H);
      drawReel(reel, ctx, clock.t);
    };

    const frame = (now) => {
      if (cancelled) return;
      const s = clock;
      const live = liveRef.current;
      const dt = s.last ? Math.min(0.05, (now - s.last) / 1000) : 0;
      s.last = now;

      if (live.active && live.playing && !live.reduced) {
        s.t += dt;
        if (s.t >= REEL_SECONDS) {
          s.t = REEL_SECONDS;
          if (!ended) { ended = true; live.onEnded?.(); }
        } else {
          ended = false;
        }
      }

      paint();
      live.onFrame?.(s.t / REEL_SECONDS);
      raf = requestAnimationFrame(frame);
    };

    // Reduced motion gets one representative still instead of 30s of motion.
    if (reduced) {
      clock.t = 6;
      paint();
      window.addEventListener('resize', paint);
      return () => { window.removeEventListener('resize', paint); };
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clock.last = 0;
    };
  }, [reel, reduced]);

  return (
    <canvas
      ref={canvasRef}
      className="reel__canvas"
      aria-label={`${reel.title} — a 30 second vertical reel about Dom the Developer`}
      role="img"
    />
  );
};

export default ReelCanvas;
