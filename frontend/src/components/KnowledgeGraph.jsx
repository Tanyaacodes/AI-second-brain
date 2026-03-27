import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Music, Play, Pause } from 'lucide-react';
import * as d3 from 'd3';

const KnowledgeGraph = ({ items, labelsOn, interactiveOn }) => {
  const forceRef = useRef();
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isDancing, setIsDancing] = useState(false);
  const beatIntensityRef = useRef(0);
  
  // Track container size for "Bulletproof" Canvas Sizing (Fixes Black Screen)
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        });
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Scattering and auto-centering
  useEffect(() => {
    if (forceRef.current) {
      forceRef.current.d3Force('charge').strength(-300);
      forceRef.current.d3Force('link').distance(120);
      forceRef.current.d3Force('x', d3.forceX().strength(0.1));
      forceRef.current.d3Force('y', d3.forceY().strength(0.1));
      
      setTimeout(() => {
        if (forceRef.current) forceRef.current.zoomToFit(400, 150); 
      }, 800);
    }
  }, [items]);

  // Audio Analyzer logic for "Dance" (Fixes Spin & 2nd Time Error)
  useEffect(() => {
    if (isDancing) {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio Playback Refused:", e));
      }

      const animate = () => {
        try {
          const graph = forceRef.current;
          // CRITICAL: Type check prevents the "2nd time" crash
          if (analyserRef.current && graph && typeof graph.d3Simulation === 'function') {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
            
            beatIntensityRef.current = average / 25; 

            // REVEALING THE "USER FAVORITE" MOVEMENT
            const simulation = graph.d3Simulation();
            if (simulation) {
              simulation.alphaTarget(0.8).restart(); // Keeps physics "hot"
              
              const nodes = simulation.nodes();
              nodes.forEach(node => {
                // High-energy vibration and spin from the first version
                const multiplier = average / 4; 
                node.vx += (Math.random() - 0.5) * multiplier;
                node.vy += (Math.random() - 0.5) * multiplier;
                
                // Extra jitter for visual "spin" sensation
                if (average > 30) {
                  node.x += (Math.random() - 0.5) * (average / 12);
                  node.y += (Math.random() - 0.5) * (average / 12);
                }
              });
            }

            if (graph.d3Force && graph.d3Force('charge')) {
               graph.d3Force('charge').strength(-350 - (average * 50));
            }
          }
        } catch (e) {}
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      beatIntensityRef.current = 0;
      if (audioRef.current) {
        audioRef.current.pause();
        const graph = forceRef.current;
        if (graph && typeof graph.d3Simulation === 'function') {
            const sim = graph.d3Simulation();
            if (sim) sim.alphaTarget(0).alpha(0.1).restart();
            if (graph.d3Force && graph.d3Force('charge')) {
                graph.d3Force('charge').strength(-250);
            }
        }
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDancing]);

  const toggleDance = () => {
    if (!audioRef.current) {
        const audio = new Audio('/beat.mp3');
        audio.loop = true;
        audio.crossOrigin = "anonymous";
        audioRef.current = audio;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 128;
        
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContext.destination);
    }

    if (analyserRef.current && analyserRef.current.context.state === 'suspended') {
        analyserRef.current.context.resume();
    }
    
    setIsDancing(!isDancing);
  };

  const TAG_PALETTE = [
    '#FF3366', '#33CCFF', '#33FF99', '#CC33FF', '#FF9933', 
    '#1DA1F2', '#EAB308', '#EC4899', '#06B6D4', '#A3E635',
  ];

  const getSimilarity = (t1, t2) => {
    if (!t1 || !t2) return 0;
    const w1 = new Set(t1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const w2 = new Set(t2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    if (w1.size === 0 || w2.size === 0) return 0;
    const intersection = new Set([...w1].filter(x => w2.has(x)));
    return intersection.size / Math.max(w1.size, w2.size);
  };

  const clusters = [];
  const assigned = new Set();
  items.forEach((item, i) => {
    if (assigned.has(i)) return;
    const cluster = [i];
    assigned.add(i);
    items.forEach((other, j) => {
      if (assigned.has(j)) return;
      if (getSimilarity(item.title, other.title) > 0.4 || 
          (item.tags && other.tags && item.tags.some(t => other.tags.includes(t)))) {
        cluster.push(j);
        assigned.add(j);
      }
    });
    clusters.push(cluster);
  });

  const nodeColorMap = {};
  clusters.forEach((cluster, idx) => {
    const color = TAG_PALETTE[idx % TAG_PALETTE.length];
    cluster.forEach(itemIdx => {
      nodeColorMap[items[itemIdx]._id] = color;
    });
  });

  const generateGraphData = () => {
    const nodes = items.map(item => ({
      id: item._id,
      name: item.title,
      tag: (item.tags && item.tags.length > 0) ? item.tags[0] : item.title?.split(' ')[0] || 'item',
      type: item.type,
      color: nodeColorMap[item._id] || '#ffffff',
      val: 2
    }));

    const links = [];
    clusters.forEach(cluster => {
      for (let i = 0; i < cluster.length; i++) {
        for (let j = i + 1; j < cluster.length; j++) {
          links.push({
            source: items[cluster[i]]._id,
            target: items[cluster[j]]._id,
            color: nodeColorMap[items[cluster[i]]._id] + '44'
          });
        }
      }
    });
    return { nodes, links };
  };

  const graphData = generateGraphData();

  return (
    <div 
      ref={containerRef} 
      style={{ 
        backgroundColor: isDancing ? `rgba(10, 10, 11, ${1 - (beatIntensityRef.current * 0.05)})` : '#0A0A0B',
        boxShadow: isDancing ? `inset 0 0 ${beatIntensityRef.current * 100}px rgba(249, 115, 22, ${beatIntensityRef.current * 0.1})` : 'none'
      }}
      className="w-full h-full overflow-hidden relative transition-colors duration-100"
    >
       <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs text-white/50 border border-white/5 font-black uppercase tracking-widest">
        Graph Engine View
      </div>

      {interactiveOn && (
          <button 
            onClick={toggleDance}
            style={{ 
              transform: isDancing ? `scale(${1 + (beatIntensityRef.current * 0.2)})` : 'scale(1)',
              transition: isDancing ? 'none' : 'transform 0.5s ease' 
            }}
            className={`absolute bottom-6 right-6 z-20 p-4 rounded-full border transition-all duration-500 shadow-2xl group ${
                isDancing 
                ? 'bg-orange-500 border-orange-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]' 
                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-orange-400'
            }`}
            title="Dance with Dots (Sync with Beat)"
          >
            {isDancing ? <Pause size={20} className="fill-current" /> : <Music size={20} />}
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/80 rounded-lg text-[9px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                {isDancing ? 'Pause Dance' : 'Dance with Dots'}
            </span>
          </button>
      )}

      <ForceGraph2D
        ref={forceRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#0A0A0B"
        nodeColor={node => node.color}
        linkColor={link => link.color ? link.color + 'AA' : 'rgba(255,255,255,0.3)'}
        nodeRelSize={9}
        linkWidth={link => Math.max(1.5, (link.value || 1) * 1.2)}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.003}
        linkDirectionalParticleColor={link => link.color || '#ffffff'}
        cooldownTicks={100}
        enableNodeDrag={interactiveOn}
        enablePanInteraction={interactiveOn}
        enableZoomInteraction={interactiveOn}
        nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.tag || node.name?.split(' ')[0] || 'item';
            const fontSize = Math.max(10 / globalScale, 3);
            const intensity = beatIntensityRef.current || 0;
            
            const x = node.x;
            const y = node.y;

            const pulseScale = 1 + (intensity * 0.9);
            const coreRadius = 5 * pulseScale;
            const haloRadius = 11 * pulseScale;

            // 1. Draw Halo
            ctx.beginPath();
            ctx.arc(x, y, haloRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color + '22';
            ctx.fill();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = node.color + '55';
            ctx.stroke();

            // 2. Draw Core Dot
            ctx.beginPath();
            ctx.arc(x, y, coreRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x, y, 1 * pulseScale, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            // 3. Draw Labels
            if (labelsOn) {
                ctx.font = `700 ${fontSize}px Inter, sans-serif`;
                const textWidth = ctx.measureText(label).width;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
                ctx.beginPath();
                ctx.roundRect(x - textWidth / 2 - 5, y + 10 + coreRadius, textWidth + 10, fontSize + 6, 4);
                ctx.fill();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(label, x, y + 10 + coreRadius + (fontSize + 6) / 2);
            }
        }}
      />
    </div>
  );
};

export default KnowledgeGraph;
