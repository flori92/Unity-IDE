import React, { useEffect, useRef, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import * as d3 from 'd3';

interface Node {
  id: string;
  label: string;
  type: 'docker' | 'kubernetes' | 'ansible' | 'container' | 'pod' | 'service' | 'host';
  status: 'running' | 'stopped' | 'pending' | 'error';
  x?: number;
  y?: number;
}

interface Link {
  source: string;
  target: string;
  type: 'connection' | 'dependency';
}

const InfrastructureTopology: React.FC = () => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 350 });

  const mockData: { nodes: Node[]; links: Link[] } = {
    nodes: [
      { id: 'docker', label: 'Docker Engine', type: 'docker', status: 'running' },
      { id: 'container1', label: 'nginx', type: 'container', status: 'running' },
      { id: 'container2', label: 'postgres', type: 'container', status: 'running' },
      { id: 'container3', label: 'redis', type: 'container', status: 'stopped' },
      { id: 'k8s', label: 'K8s Cluster', type: 'kubernetes', status: 'running' },
      { id: 'pod1', label: 'app-pod-1', type: 'pod', status: 'running' },
      { id: 'pod2', label: 'app-pod-2', type: 'pod', status: 'running' },
      { id: 'service1', label: 'app-service', type: 'service', status: 'running' },
      { id: 'ansible', label: 'Ansible Controller', type: 'ansible', status: 'running' },
      { id: 'host1', label: 'web-server-1', type: 'host', status: 'running' },
      { id: 'host2', label: 'db-server-1', type: 'host', status: 'running' },
    ],
    links: [
      { source: 'docker', target: 'container1', type: 'connection' },
      { source: 'docker', target: 'container2', type: 'connection' },
      { source: 'docker', target: 'container3', type: 'connection' },
      { source: 'k8s', target: 'pod1', type: 'connection' },
      { source: 'k8s', target: 'pod2', type: 'connection' },
      { source: 'k8s', target: 'service1', type: 'connection' },
      { source: 'service1', target: 'pod1', type: 'dependency' },
      { source: 'service1', target: 'pod2', type: 'dependency' },
      { source: 'ansible', target: 'host1', type: 'connection' },
      { source: 'ansible', target: 'host2', type: 'connection' },
    ],
  };

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const width = dimensions.width;
    const height = dimensions.height;

    // Create container group
    const g = svg.append('g');

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Define arrow markers
    svg.append('defs').selectAll('marker')
      .data(['connection', 'dependency'])
      .enter().append('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', d => d === 'connection' ? theme.palette.primary.main : theme.palette.secondary.main);

    // Create force simulation
    const simulation = d3.forceSimulation(mockData.nodes as any)
      .force('link', d3.forceLink(mockData.links)
        .id((d: any) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(mockData.links)
      .enter().append('line')
      .attr('stroke', d => d.type === 'connection' ? theme.palette.primary.main : theme.palette.secondary.main)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => d.type === 'dependency' ? '5,5' : '0')
      .attr('marker-end', d => `url(#arrow-${d.type})`);

    // Create nodes
    const node = g.append('g')
      .selectAll('g')
      .data(mockData.nodes)
      .enter().append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Add circles for nodes
    node.append('circle')
      .attr('r', d => {
        switch (d.type) {
          case 'docker':
          case 'kubernetes':
          case 'ansible':
            return 25;
          case 'service':
            return 20;
          default:
            return 15;
        }
      })
      .attr('fill', d => {
        switch (d.type) {
          case 'docker':
            return theme.palette.info.main;
          case 'kubernetes':
            return theme.palette.success.main;
          case 'ansible':
            return theme.palette.warning.main;
          default:
            return theme.palette.grey[600];
        }
      })
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add status indicator
    node.append('circle')
      .attr('r', 5)
      .attr('cx', 15)
      .attr('cy', -15)
      .attr('fill', d => {
        switch (d.status) {
          case 'running':
            return theme.palette.success.main;
          case 'stopped':
            return theme.palette.error.main;
          case 'pending':
            return theme.palette.warning.main;
          default:
            return theme.palette.grey[500];
        }
      })
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 2);

    // Add labels
    node.append('text')
      .text(d => d.label)
      .attr('x', 0)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', theme.palette.text.primary);

    // Add icons (simplified representation)
    node.append('text')
      .text(d => {
        switch (d.type) {
          case 'docker': return '🐳';
          case 'kubernetes': return '☸️';
          case 'ansible': return '🎭';
          case 'container': return '📦';
          case 'pod': return '🟦';
          case 'service': return '🔄';
          case 'host': return '🖥️';
          default: return '●';
        }
      })
      .attr('x', 0)
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .style('cursor', 'pointer');

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [theme, dimensions]);

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const { width } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height: 350 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{
          background: theme.palette.background.default,
          borderRadius: theme.shape.borderRadius,
        }}
      />
    </Box>
  );
};

export default InfrastructureTopology;
