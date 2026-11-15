export default function Tooltip({ text, children }) {
  return (
    <div className="snap-tooltip-wrapper" title={text}>
      {children}
    </div>
  );
}
