export const lerp = (a, b, t) => a + (b - a) * t;

export const smoothstep = (min, max, value) => {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
};

export const getPointID = (j, i, gridH) => i * gridH + j;

export const hash = (n) => (Math.sin(n) * 43758.5453123) % 1;

export const getPointsForGridId = () => [];

export const getEdgeIdsForGridId = () => [];
