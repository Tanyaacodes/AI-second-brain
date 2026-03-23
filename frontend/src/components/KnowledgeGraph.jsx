import React, { useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const KnowledgeGraph = ({ items }) => {
  const forceRef = useRef();

  // Graph data transformation: nodes (items) and links (common tags)
  const generateGraphData = () => {
    const nodes = items.map(item => ({
      id: item._id,
      name: item.title,
      type: item.type,
      val: 2 // size
    }));

    const links = [];
    // Similarity/Link logic: link items that share at least 1 tag
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const sharedTags = items[i].tags.filter(t => items[j].tags.includes(t));
        if (sharedTags.length > 0) {
          links.push({
            source: items[i]._id,
            target: items[j]._id,
            value: sharedTags.length // link strength
          });
        }
      }
    }

    return { nodes, links };
  };

  const graphData = generateGraphData();

  return (
    <div className="w-full h-[500px] border border-gray-100/20 rounded-2xl overflow-hidden bg-[#0A0A0B] shadow-2xl relative">
       <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs text-white/50 border border-white/5">
        Knowledge Graph View
      </div>
      <ForceGraph2D
        ref={forceRef}
        graphData={graphData}
        nodeLabel="name"
        backgroundColor="#0A0A0B"
        nodeColor={node => {
          switch(node.type) {
            case 'article': return '#3B82F6';
            case 'video': return '#EF4444';
            case 'tweet': return '#1DA1F2';
            case 'image': return '#10B981';
            default: return '#8B5CF6';
          }
        }}
        linkColor={() => 'rgba(255, 255, 255, 0.1)'}
        nodeRelSize={6}
        linkWidth={1.5}
        cooldownTicks={100}
      />
    </div>
  );
};

export default KnowledgeGraph;
