"use client";

interface TechCornersProps {
  color?: string;
  size?: number;
}

export default function TechCorners({ color = "rgba(255,255,255,0.12)", size = 8 }: TechCornersProps) {
  return (
    <>
      <span
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          width: size * 2,
          height: size * 2,
          borderTop: `1px solid ${color}`,
          borderLeft: `1px solid ${color}`,
        }}
      />
      <span
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: size * 2,
          height: size * 2,
          borderTop: `1px solid ${color}`,
          borderRight: `1px solid ${color}`,
        }}
      />
      <span
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: size * 2,
          height: size * 2,
          borderBottom: `1px solid ${color}`,
          borderLeft: `1px solid ${color}`,
        }}
      />
      <span
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{
          width: size * 2,
          height: size * 2,
          borderBottom: `1px solid ${color}`,
          borderRight: `1px solid ${color}`,
        }}
      />
    </>
  );
}
