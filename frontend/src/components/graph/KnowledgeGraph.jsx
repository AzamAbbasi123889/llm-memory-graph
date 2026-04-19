import { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

const truncate = (value = "", length = 60) =>
  value.length > length ? `${value.slice(0, length)}…` : value;

export default function KnowledgeGraph({
  graphRef,
  graphData,
  onNodeSelect
}) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 900, height: 640 });
  const [hoverNode, setHoverNode] = useState(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (!graphData?.nodes?.length) {
    return (
      <div className="flex h-full min-h-[560px] items-center justify-center rounded-[32px] border border-dashed border-border bg-bg-surface/60">
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold text-text-primary">No graph data yet</p>
          <p className="mt-2 text-sm text-text-muted">
            Ask a few questions and NeuroGraph will start weaving sessions, topics, and answers into a navigable graph.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100vh-180px)] min-h-[560px] overflow-hidden rounded-[32px] border border-border bg-bg-surface"
      onMouseMove={(event) => setPointer({ x: event.clientX, y: event.clientY })}
    >
      <ForceGraph2D
        ref={graphRef}
        width={size.width}
        height={size.height}
        graphData={graphData}
        backgroundColor="transparent"
        linkColor={() => "rgba(107, 114, 128, 0.24)"}
        linkWidth={1}
        cooldownTicks={120}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const size = node.val || 8;
          const label = node.label || node.name;
          const fontSize = 12 / globalScale;
          ctx.beginPath();
          ctx.fillStyle = node.color;
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
          ctx.fill();

          if (globalScale > 1.6 || hoverNode?.id === node.id) {
            ctx.font = `${fontSize}px Inter`;
            ctx.fillStyle = "#F1F0FF";
            ctx.fillText(truncate(label, 24), node.x + size + 4, node.y + 4);
          }
        }}
        onNodeHover={(node) => setHoverNode(node || null)}
        onNodeClick={(node) => onNodeSelect?.(node)}
      />

      {hoverNode ? (
        <div
          className="pointer-events-none fixed z-30 max-w-xs rounded-xl border border-border bg-bg-elevated px-3 py-2 text-xs text-text-primary shadow-card"
          style={{ left: pointer.x + 14, top: pointer.y + 14 }}
        >
          {truncate(hoverNode.preview || hoverNode.label || hoverNode.name)}
        </div>
      ) : null}
    </div>
  );
}

