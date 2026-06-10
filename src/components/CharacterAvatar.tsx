'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

// Line-art portrait in the LCB terminal palette: off-white strokes on the
// dark panel, near-black side-swept hair, navy polo. Pupils follow the
// cursor, the eyes blink idly, and hovering earns you a wink.

const LINE = 'var(--lcb-white)';
const FACE = '#161e2c';
const HAIR = '#0a0d13';
const POLO = 'var(--lcb-navy)';

const EYES = {
  left:  { cx: 79,  cy: 105 },
  right: { cx: 123, cy: 105 },
};
const PUPIL_RANGE = 3.5; // max pupil travel in viewBox px

const eyeTransition = { duration: 0.12, ease: 'easeOut' as const };

export default function CharacterAvatar({ size = 260 }: { size?: number }) {
  const reduceMotion = useReducedMotion() ?? false;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [blinking, setBlinking] = useState(false);
  const [hovered, setHovered] = useState(false);

  const pupilX = useMotionValue(0);
  const pupilY = useMotionValue(0);
  const springX = useSpring(pupilX, { stiffness: 260, damping: 22 });
  const springY = useSpring(pupilY, { stiffness: 260, damping: 22 });

  // Pupils track the cursor anywhere on the page (motion values only — no
  // React state is written here).
  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / 40;
      const dy = (e.clientY - (r.top + r.height / 2)) / 40;
      pupilX.set(Math.max(-PUPIL_RANGE, Math.min(PUPIL_RANGE, dx)));
      pupilY.set(Math.max(-PUPIL_RANGE, Math.min(PUPIL_RANGE, dy)));
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduceMotion, pupilX, pupilY]);

  // Idle blink every 4-6 seconds.
  useEffect(() => {
    if (reduceMotion) return;
    let blinkTimer: ReturnType<typeof setTimeout>;
    let openTimer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      blinkTimer = setTimeout(() => {
        setBlinking(true);
        openTimer = setTimeout(() => {
          setBlinking(false);
          schedule();
        }, 160);
      }, 4000 + Math.random() * 2000);
    };
    schedule();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(openTimer);
    };
  }, [reduceMotion]);

  const wink = !reduceMotion && hovered;
  const blink = !reduceMotion && blinking;
  const leftEyeScale = blink ? 0.08 : 1;
  const rightEyeScale = wink ? 0.1 : blink ? 0.08 : 1;

  const eye = (which: 'left' | 'right', scaleY: number) => {
    const { cx, cy } = EYES[which];
    return (
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={{ scaleY }}
        transition={eyeTransition}
      >
        <ellipse cx={cx} cy={cy} rx={6.5} ry={7.5} fill="rgba(232,230,224,0.07)" stroke={LINE} strokeWidth={4} />
        <motion.g style={{ x: springX, y: springY }}>
          <circle cx={cx} cy={cy} r={2.8} fill={LINE} />
        </motion.g>
      </motion.g>
    );
  };

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label="Cartoon portrait of Martin — he winks when you hover"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{ display: 'block', cursor: 'default' }}
    >
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Ears */}
        <ellipse cx={49} cy={100} rx={9} ry={13} fill={FACE} stroke={LINE} strokeWidth={5} />
        <ellipse cx={153} cy={100} rx={9} ry={13} fill={FACE} stroke={LINE} strokeWidth={5} />

        {/* Neck */}
        <rect x={86} y={140} width={30} height={26} rx={6} fill={FACE} stroke={LINE} strokeWidth={5} />

        {/* Polo shoulders + collar */}
        <path
          d="M 36,202 C 38,176 56,162 80,157 L 101,164 L 122,157 C 146,162 164,176 166,202 Z"
          fill={POLO}
          stroke={LINE}
          strokeWidth={5}
        />
        <line x1={101} y1={166} x2={101} y2={198} stroke={LINE} strokeWidth={3} opacity={0.45} />
        <circle cx={101} cy={178} r={2.2} fill={LINE} opacity={0.8} />
        <circle cx={101} cy={190} r={2.2} fill={LINE} opacity={0.8} />
        <path d="M 80,157 L 98,162 L 87,175 Z" fill={POLO} stroke={LINE} strokeWidth={4} />
        <path d="M 122,157 L 104,162 L 115,175 Z" fill={POLO} stroke={LINE} strokeWidth={4} />

        {/* Head */}
        <path
          d="M 50,95
             C 50,52 72,32 101,32
             C 130,32 152,52 152,95
             C 152,122 144,137 129,146
             C 120,151.5 110,154 101,154
             C 92,154 82,151.5 73,146
             C 58,137 50,122 50,95
             Z"
          fill={FACE}
          stroke={LINE}
          strokeWidth={5}
        />

        {/* Side-swept hair, fringe sweeping to the viewer's right */}
        <path
          d="M 48,100
             C 44,42 74,26 103,26
             C 136,26 156,48 154,100
             L 150,100
             C 150,80 146,66 137,58
             C 139,72 134,80 122,85
             C 126,70 118,58 103,54
             C 105,66 98,74 86,77
             C 80,66 68,64 61,70
             C 55,78 52,88 52,100
             Z"
          fill={HAIR}
          stroke={LINE}
          strokeWidth={5}
        />

        {/* Brows */}
        <path d="M 70,93 Q 79,88 88,92" fill="none" stroke={LINE} strokeWidth={4} />
        <motion.path
          d="M 114,92 Q 123,88 132,93"
          fill="none"
          stroke={LINE}
          strokeWidth={4}
          animate={{ y: wink ? 3 : 0 }}
          transition={eyeTransition}
        />

        {/* Eyes (right one winks on hover) */}
        {eye('left', leftEyeScale)}
        {eye('right', rightEyeScale)}

        {/* Mouth: smile ↔ grin crossfade */}
        <motion.path
          d="M 84,128 Q 101,140 118,128"
          fill="none"
          stroke={LINE}
          strokeWidth={5}
          animate={{ opacity: wink ? 0 : 1 }}
          transition={eyeTransition}
        />
        <motion.path
          d="M 80,126 Q 101,147 122,126"
          fill="none"
          stroke={LINE}
          strokeWidth={5}
          animate={{ opacity: wink ? 1 : 0 }}
          transition={eyeTransition}
        />
      </g>
    </svg>
  );
}
