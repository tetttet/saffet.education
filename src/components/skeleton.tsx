/** Grey placeholder block; the shimmer comes from `.skeleton` in globals.css. */
export function Bone({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <span className={`skeleton block rounded-md ${className}`} style={style} />;
}

