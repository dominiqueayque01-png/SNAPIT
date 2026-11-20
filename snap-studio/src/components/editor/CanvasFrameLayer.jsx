import { useMemo, memo } from "react";
import { Group, Rect, Line, Text, Circle, Image as KonvaImage } from "react-konva";

// Generate a reusable subtle organic film-grain pattern canvas once per session
let cachedGrainCanvas = null;
function getGrainCanvas() {
  if (cachedGrainCanvas || typeof document === "undefined") return cachedGrainCanvas;
  const size = 256;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const imgData = ctx.createImageData(size, size);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.random() * 255;
    d[i] = v;
    d[i + 1] = v * 0.96;
    d[i + 2] = v * 0.9;
    d[i + 3] = Math.random() > 0.5 ? 54 : 18;
  }
  ctx.putImageData(imgData, 0, 0);
  cachedGrainCanvas = c;
  return cachedGrainCanvas;
}

function FrameVisual({ frameId, docWidth, docHeight, frameColor, frameTextColor, frameCaption }) {
  const minEdge = Math.min(docWidth, docHeight);
  const sidePad = Math.round(minEdge * 0.055);
  const bottomChin = Math.round(minEdge * 0.165);
  const color = frameColor || "#fdfbf7";
  const ink = frameTextColor || "#2a211f";
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, ".");

  if (!frameId || frameId === "none") return null;

  if (frameId === "classic-polaroid" || frameId === "blush-polaroid" || frameId === "scrapbook-washi") {
    const isBlush = frameId === "blush-polaroid";
    const isWashi = frameId === "scrapbook-washi";
    const borderStroke = isBlush ? "#d4556b" : "#d9cbbd";

    return (
      <Group listening={false}>
        {/* Top, Left, Right, Bottom Polaroid Mat Bars */}
        <Rect x={0} y={0} width={docWidth} height={sidePad} fill={color} />
        <Rect x={0} y={0} width={sidePad} height={docHeight} fill={color} />
        <Rect x={docWidth - sidePad} y={0} width={sidePad} height={docHeight} fill={color} />
        <Rect x={0} y={docHeight - bottomChin} width={docWidth} height={bottomChin} fill={color} />

        {/* Subtle inner photo cutout edge */}
        <Rect
          x={sidePad}
          y={sidePad}
          width={docWidth - sidePad * 2}
          height={docHeight - sidePad - bottomChin}
          stroke={isBlush ? "#d4556b" : "rgba(42,33,31,0.16)"}
          strokeWidth={isBlush ? 2 : 1.5}
          dash={isBlush ? [8, 5] : undefined}
        />

        {/* Outer archival rule */}
        <Rect
          x={1}
          y={1}
          width={docWidth - 2}
          height={docHeight - 2}
          stroke={borderStroke}
          strokeWidth={2}
        />

        {/* Scrapbook Washi Tape Corners */}
        {isWashi && (
          <>
            <Rect
              x={sidePad * 0.4}
              y={sidePad * 0.8}
              width={Math.round(minEdge * 0.19)}
              height={Math.round(minEdge * 0.048)}
              fill="rgba(244, 165, 181, 0.8)"
              rotation={-28}
            />
            <Rect
              x={docWidth - sidePad * 2.4}
              y={sidePad * 0.15}
              width={Math.round(minEdge * 0.19)}
              height={Math.round(minEdge * 0.048)}
              fill="rgba(243, 213, 141, 0.82)"
              rotation={26}
            />
          </>
        )}

        {/* Handwritten Chin Caption + Studio Date */}
        <Text
          x={sidePad}
          y={docHeight - bottomChin + Math.round(bottomChin * 0.16)}
          width={docWidth - sidePad * 2}
          text={frameCaption || "sweet sunday memories"}
          fontFamily="Reenie Beanie"
          fontSize={Math.max(24, Math.round(bottomChin * 0.42))}
          fill={ink}
          align="center"
        />
        <Text
          x={sidePad}
          y={docHeight - Math.round(bottomChin * 0.28)}
          width={docWidth - sidePad * 2}
          text={`${dateStamp} · SNAP! STUDIO`}
          fontFamily="Courier Prime"
          fontSize={Math.max(11, Math.round(bottomChin * 0.14))}
          letterSpacing={2}
          fill={ink}
          opacity={0.68}
          align="center"
        />
      </Group>
    );
  }

  if (frameId === "retro-film") {
    const rail = Math.round(minEdge * 0.075);
    const holeW = Math.round(rail * 0.42);
    const holeH = Math.round(rail * 0.56);
    const step = Math.round(holeH * 1.85);
    const count = Math.max(4, Math.floor((docHeight - rail) / step));
    const holes = Array.from({ length: count }, (_, i) => Math.round(rail * 0.5 + i * step));

    return (
      <Group listening={false}>
        <Rect x={0} y={0} width={rail} height={docHeight} fill="#1f1917" />
        <Rect x={docWidth - rail} y={0} width={rail} height={docHeight} fill="#1f1917" />
        <Rect x={0} y={0} width={docWidth} height={Math.round(rail * 0.45)} fill="#1f1917" />
        <Rect
          x={0}
          y={docHeight - Math.round(rail * 0.65)}
          width={docWidth}
          height={Math.round(rail * 0.65)}
          fill="#1f1917"
        />

        {holes.map((hy, idx) => (
          <Group key={idx}>
            <Rect
              x={Math.round((rail - holeW) / 2)}
              y={hy}
              width={holeW}
              height={holeH}
              cornerRadius={3}
              fill="#f6f0e8"
            />
            <Rect
              x={docWidth - rail + Math.round((rail - holeW) / 2)}
              y={hy}
              width={holeW}
              height={holeH}
              cornerRadius={3}
              fill="#f6f0e8"
            />
          </Group>
        ))}

        <Text
          x={rail + 10}
          y={docHeight - Math.round(rail * 0.48)}
          text="SNAP! 400TX  ▲ 04A"
          fontFamily="Courier Prime"
          fontSize={Math.max(11, Math.round(rail * 0.24))}
          fontStyle="bold"
          fill="#e6ad52"
          letterSpacing={2}
        />
        <Text
          x={rail}
          y={docHeight - Math.round(rail * 0.48)}
          width={docWidth - rail * 2 - 10}
          text={dateStamp}
          fontFamily="Courier Prime"
          fontSize={Math.max(11, Math.round(rail * 0.24))}
          fill="#e6ad52"
          align="right"
        />
      </Group>
    );
  }

  if (frameId === "vintage-viewfinder") {
    const inset = Math.round(minEdge * 0.05);
    const arm = Math.round(minEdge * 0.075);
    const cx = docWidth / 2;
    const cy = docHeight / 2;

    return (
      <Group listening={false}>
        <Rect
          x={inset}
          y={inset}
          width={docWidth - inset * 2}
          height={docHeight - inset * 2}
          stroke="rgba(253, 251, 247, 0.35)"
          strokeWidth={1.5}
        />
        {/* Four viewfinder corner brackets */}
        <Line points={[inset, inset + arm, inset, inset, inset + arm, inset]} stroke="#fdfbf7" strokeWidth={3} />
        <Line points={[docWidth - inset - arm, inset, docWidth - inset, inset, docWidth - inset, inset + arm]} stroke="#fdfbf7" strokeWidth={3} />
        <Line points={[inset, docHeight - inset - arm, inset, docHeight - inset, inset + arm, docHeight - inset]} stroke="#fdfbf7" strokeWidth={3} />
        <Line points={[docWidth - inset - arm, docHeight - inset, docWidth - inset, docHeight - inset, docWidth - inset, docHeight - inset - arm]} stroke="#fdfbf7" strokeWidth={3} />

        {/* Center optical cross */}
        <Line points={[cx - 14, cy, cx + 14, cy]} stroke="#e6ad52" strokeWidth={1.8} />
        <Line points={[cx, cy - 14, cx, cy + 14]} stroke="#e6ad52" strokeWidth={1.8} />

        {/* Top-left REC dot & text */}
        <Circle x={inset + 22} y={inset + 24} radius={6} fill="#d4556b" />
        <Text
          x={inset + 36}
          y={inset + 16}
          text="REC · ISO 640"
          fontFamily="Courier Prime"
          fontSize={Math.max(13, Math.round(minEdge * 0.022))}
          fontStyle="bold"
          fill="#fdfbf7"
          shadowColor="#000"
          shadowBlur={4}
        />
        <Text
          x={inset + 16}
          y={docHeight - inset - Math.max(26, Math.round(minEdge * 0.036))}
          text={`${dateStamp}   1/125   F2.8`}
          fontFamily="Courier Prime"
          fontSize={Math.max(12, Math.round(minEdge * 0.02))}
          fill="#e6ad52"
          shadowColor="#000"
          shadowBlur={4}
        />
      </Group>
    );
  }

  if (frameId === "pastel-double" || frameId === "minimalist-mat") {
    const pad = Math.round(minEdge * (frameId === "minimalist-mat" ? 0.065 : 0.048));
    return (
      <Group listening={false}>
        <Rect x={0} y={0} width={docWidth} height={pad} fill={color} />
        <Rect x={0} y={docHeight - pad} width={docWidth} height={pad} fill={color} />
        <Rect x={0} y={0} width={pad} height={docHeight} fill={color} />
        <Rect x={docWidth - pad} y={0} width={pad} height={docHeight} fill={color} />

        <Rect
          x={pad}
          y={pad}
          width={docWidth - pad * 2}
          height={docHeight - pad * 2}
          stroke={frameId === "pastel-double" ? "#2a211f" : "#c9bcae"}
          strokeWidth={frameId === "pastel-double" ? 2.5 : 1.5}
        />
        {frameId === "pastel-double" && (
          <Rect
            x={Math.round(pad * 0.45)}
            y={Math.round(pad * 0.45)}
            width={docWidth - Math.round(pad * 0.9)}
            height={docHeight - Math.round(pad * 0.9)}
            stroke="#d4556b"
            strokeWidth={1.5}
          />
        )}
      </Group>
    );
  }

  return null;
}

function OverlayVisuals({ overlayIds, overlayOpacity, docWidth, docHeight }) {
  const grainCanvas = useMemo(() => {
    if (!overlayIds.includes("film-grain")) return null;
    return getGrainCanvas();
  }, [overlayIds]);

  const dateText = useMemo(() => {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `'${yy} ${mm} ${dd}`;
  }, []);

  if (!overlayIds.length) return null;
  const alpha = overlayOpacity ?? 0.55;

  return (
    <Group listening={false}>
      {overlayIds.includes("warm-leak") && (
        <Rect
          x={0}
          y={0}
          width={docWidth}
          height={docHeight}
          opacity={alpha * 0.72}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: docWidth * 0.78, y: docHeight * 0.55 }}
          fillLinearGradientColorStops={[
            0,
            "rgba(236, 138, 46, 0.85)",
            0.38,
            "rgba(218, 92, 72, 0.35)",
            1,
            "rgba(236, 138, 46, 0)"
          ]}
        />
      )}

      {overlayIds.includes("rose-leak") && (
        <Rect
          x={0}
          y={0}
          width={docWidth}
          height={docHeight}
          opacity={alpha * 0.68}
          fillLinearGradientStartPoint={{ x: docWidth, y: docHeight }}
          fillLinearGradientEndPoint={{ x: docWidth * 0.2, y: docHeight * 0.25 }}
          fillLinearGradientColorStops={[
            0,
            "rgba(212, 85, 107, 0.8)",
            0.42,
            "rgba(244, 172, 190, 0.32)",
            1,
            "rgba(212, 85, 107, 0)"
          ]}
        />
      )}

      {overlayIds.includes("vignette") && (
        <Rect
          x={0}
          y={0}
          width={docWidth}
          height={docHeight}
          opacity={alpha * 0.9}
          fillRadialGradientStartPoint={{ x: docWidth / 2, y: docHeight / 2 }}
          fillRadialGradientEndPoint={{ x: docWidth / 2, y: docHeight / 2 }}
          fillRadialGradientStartRadius={Math.min(docWidth, docHeight) * 0.34}
          fillRadialGradientEndRadius={Math.max(docWidth, docHeight) * 0.72}
          fillRadialGradientColorStops={[
            0,
            "rgba(26, 18, 16, 0)",
            0.7,
            "rgba(26, 18, 16, 0.16)",
            1,
            "rgba(26, 18, 16, 0.72)"
          ]}
        />
      )}

      {overlayIds.includes("film-grain") && grainCanvas && (
        <KonvaImage
          x={0}
          y={0}
          width={docWidth}
          height={docHeight}
          image={grainCanvas}
          opacity={alpha * 0.65}
        />
      )}

      {overlayIds.includes("dust-scratches") && (
        <Group opacity={alpha * 0.75}>
          <Line
            points={[docWidth * 0.18, 0, docWidth * 0.184, docHeight]}
            stroke="rgba(253, 251, 247, 0.38)"
            strokeWidth={1}
          />
          <Line
            points={[docWidth * 0.74, docHeight * 0.12, docWidth * 0.738, docHeight * 0.66]}
            stroke="rgba(253, 251, 247, 0.28)"
            strokeWidth={1}
          />
          <Circle x={docWidth * 0.32} y={docHeight * 0.24} radius={2} fill="rgba(253,251,247,0.65)" />
          <Circle x={docWidth * 0.66} y={docHeight * 0.42} radius={1.6} fill="rgba(253,251,247,0.55)" />
          <Circle x={docWidth * 0.24} y={docHeight * 0.72} radius={2.4} fill="rgba(253,251,247,0.5)" />
          <Circle x={docWidth * 0.82} y={docHeight * 0.78} radius={1.8} fill="rgba(253,251,247,0.6)" />
        </Group>
      )}

      {overlayIds.includes("date-stamp") && (
        <Text
          x={Math.round(docWidth * 0.05)}
          y={Math.round(docHeight * 0.88)}
          width={Math.round(docWidth * 0.9)}
          text={dateText}
          fontFamily="Courier Prime"
          fontSize={Math.max(18, Math.round(Math.min(docWidth, docHeight) * 0.036))}
          fontStyle="bold"
          letterSpacing={3}
          fill="#ff8a3d"
          shadowColor="#ff5500"
          shadowBlur={8}
          opacity={Math.min(1, alpha + 0.35)}
          align="right"
        />
      )}
    </Group>
  );
}

function CanvasFrameLayer({
  frameId,
  frameColor,
  frameTextColor,
  frameCaption,
  overlayIds,
  overlayOpacity,
  docWidth,
  docHeight
}) {
  return (
    <Group listening={false}>
      <OverlayVisuals
        overlayIds={overlayIds}
        overlayOpacity={overlayOpacity}
        docWidth={docWidth}
        docHeight={docHeight}
      />
      <FrameVisual
        frameId={frameId}
        frameColor={frameColor}
        frameTextColor={frameTextColor}
        frameCaption={frameCaption}
        docWidth={docWidth}
        docHeight={docHeight}
      />
    </Group>
  );
}

export default memo(CanvasFrameLayer);
