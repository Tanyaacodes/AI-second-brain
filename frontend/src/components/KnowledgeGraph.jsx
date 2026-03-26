import React, { useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const KnowledgeGraph = ({ items, labelsOn, interactiveOn }) => {
  const forceRef = useRef();
  
  // Scattering and auto-centering
  useEffect(() => {
    if (forceRef.current) {
      forceRef.current.d3Force('charge').strength(-200);
      forceRef.current.d3Force('link').distance(80);
      
      // Auto-zoom to fit items on screen
      setTimeout(() => {
        forceRef.current.zoomToFit(400, 50);
      }, 500);
    }
  }, [items]);

  // Build a tag-to-color map so items sharing a tag get EXACTLY the same color
  const TAG_PALETTE = [
    '#f97316', // orange
    '#3B82F6', // blue
    '#10B981', // emerald
    '#8b5cf6', // violet
    '#EF4444', // red
    '#1DA1F2', // twitter blue
    '#eab308', // yellow
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#a3e635', // lime
  ];

  // Assign colors by first tag across all items — consistent per tag string
  const tagColorMap = {};
  let colorIdx = 0;
  items.forEach(item => {
    const primaryTag = (item.tags && item.tags.length > 0) ? item.tags[0].toLowerCase() : (item.type || 'other');
    if (!tagColorMap[primaryTag]) {
      tagColorMap[primaryTag] = TAG_PALETTE[colorIdx % TAG_PALETTE.length];
      colorIdx++;
    }
  });

  const getNodeColor = (item) => {
    const primaryTag = (item.tags && item.tags.length > 0) ? item.tags[0].toLowerCase() : (item.type || 'other');
    return tagColorMap[primaryTag] || '#ffffff';
  };

  // Graph data transformation: nodes (items) and links (common tags)
  const generateGraphData = () => {
    const nodes = items.map(item => ({
      id: item._id,
      name: item.title,
      tag: (item.tags && item.tags.length > 0) ? item.tags[0] : item.title?.split(' ')[0] || 'item',
      type: item.type,
      color: getNodeColor(item),
      val: 2
    }));

    const links = [];
    // Link items that share at least 1 tag — color the link by source node color
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const sharedTags = (items[i].tags || []).filter(t => (items[j].tags || []).includes(t));
        if (sharedTags.length > 0) {
          const srcColor = getNodeColor(items[i]);
          links.push({
            source: items[i]._id,
            target: items[j]._id,
            value: sharedTags.length,
            color: srcColor   // Line inherits source node color
          });
        }
      }
    }

    return { nodes, links };
  };

  const graphData = generateGraphData();

  return (
    <div className="w-full h-full border border-gray-100/20 rounded-[48px] overflow-hidden bg-[#0A0A0B] shadow-2xl relative">
       <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs text-white/50 border border-white/5 font-black uppercase tracking-widest">
        Graph Engine View
      </div>
      <ForceGraph2D
        ref={forceRef}
        graphData={graphData}
        backgroundColor="#0A0A0B"
        nodeColor={node => node.color}
        linkColor={link => link.color ? link.color + 'AA' : 'rgba(255,255,255,0.3)'}
        nodeRelSize={6}
        linkWidth={link => Math.max(1.5, (link.value || 1) * 1.2)}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.003}
        linkDirectionalParticleColor={link => link.color || '#ffffff'}
        cooldownTicks={100}
        
        // INTERACTIVITY TOGGLE
        enableNodeDrag={interactiveOn}
        enablePanInteraction={interactiveOn}
        enableZoomInteraction={interactiveOn}
        
        // PREMIUM DOT DESIGN + LABELS
        nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.tag || node.name?.split(' ')[0] || 'item';
            const fontSize = Math.max(10 / globalScale, 3);
            
            // 1. Draw Halo (Glowing Ring)
            ctx.beginPath();
            ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color + '22'; // Very faint halo
            ctx.fill();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = node.color + '55';
            ctx.stroke();

            // 2. Draw Core Dot
            ctx.beginPath();
            ctx.arc(node.x, node.y, 3.5, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.fill();
            
            // Add a small center point for detail
            ctx.beginPath();
            ctx.arc(node.x, node.y, 1, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            // 3. Draw Labels (only if toggled ON)
            if (labelsOn) {
                ctx.font = `700 ${fontSize}px Inter, sans-serif`;
                const textWidth = ctx.measureText(label).width;
                
                // Draw pill background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
                ctx.beginPath();
                ctx.roundRect(
                    node.x - textWidth / 2 - 5, 
                    node.y + 10, 
                    textWidth + 10, 
                    fontSize + 6, 
                    4
                );
                ctx.fill();

                // Draw label text
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(label, node.x, node.y + 10 + (fontSize + 6) / 2);
            }
        }}
      />
    </div>
  );
};

export default KnowledgeGraph;
