/**
 * Configuration for the CodeArchGraph Explorer
 */

const CONFIG = {
    // Data source
    dataUrl: 'data/knowledge-graph-cleaned.json',
    
    // Node types and their visual styles
    nodeTypes: {
        Component: {
            color: '#4285F4',  // Google Blue
            shape: 'ellipse',
            size: 40
        },
        Module: {
            color: '#34A853',  // Google Green
            shape: 'round-rectangle',
            size: 35
        },
        Interface: {
            color: '#FBBC05',  // Google Yellow
            shape: 'diamond',
            size: 35
        },
        Feature: {
            color: '#EA4335',  // Google Red
            shape: 'hexagon',
            size: 35
        },
        Resource: {
            color: '#9C27B0',  // Purple
            shape: 'octagon',
            size: 35
        },
        Concept: {
            color: '#00ACC1',  // Cyan
            shape: 'tag',
            size: 35
        },
        // Additional node types from embedded subgraphs
        Episodic: {
            color: '#795548',  // Brown
            shape: 'round-rectangle',
            size: 45
        },
        Entity: {
            color: '#3F51B5',  // Indigo
            shape: 'ellipse',
            size: 35
        },
        Community: {
            color: '#009688',  // Teal
            shape: 'round-rectangle',
            size: 40
        },
        Unknown: {
            color: '#9E9E9E',  // Gray
            shape: 'ellipse',
            size: 30
        },
        Referenced: {
            color: '#FF9800',  // Orange
            shape: 'round-rectangle',
            size: 25
        },
        // Node types from embedded subgraphs based on UUID prefixes
        mod: {
            color: '#2196F3',  // Blue
            shape: 'round-rectangle',
            size: 35
        },
        if: {
            color: '#FFEB3B',  // Yellow
            shape: 'diamond',
            size: 35
        },
        res: {
            color: '#9C27B0',  // Purple
            shape: 'octagon',
            size: 35
        },
        feat: {
            color: '#F44336',  // Red
            shape: 'hexagon',
            size: 35
        },
        con: {
            color: '#00BCD4',  // Cyan
            shape: 'tag',
            size: 35
        }
    },
    
    // Relationship types and their visual styles
    relationshipTypes: {
        IMPLEMENTS: {
            color: '#4285F4',
            lineStyle: 'solid',
            width: 2,
            arrow: 'triangle'
        },
        EXPOSES: {
            color: '#FBBC05',
            lineStyle: 'solid',
            width: 2,
            arrow: 'triangle'
        },
        CONSUMES: {
            color: '#34A853',
            lineStyle: 'solid',
            width: 2,
            arrow: 'triangle'
        },
        CONTAINS: {
            color: '#9C27B0',
            lineStyle: 'dashed',
            width: 2,
            arrow: 'triangle'
        },
        RELATED_TO: {
            color: '#00ACC1',
            lineStyle: 'dotted',
            width: 1,
            arrow: 'none'
        },
        EXTENDS: {
            color: '#FF5722',
            lineStyle: 'solid',
            width: 2,
            arrow: 'triangle'
        },
        LOCATED_IN: {
            color: '#607D8B',
            lineStyle: 'dashed',
            width: 1,
            arrow: 'triangle'
        },
        // Additional relationship types from embedded subgraphs
        MENTIONS: {
            color: '#8BC34A',  // Light Green
            lineStyle: 'dotted',
            width: 1,
            arrow: 'none'
        },
        RELATES_TO: {
            color: '#FF9800',  // Orange
            lineStyle: 'dotted',
            width: 1,
            arrow: 'none'
        },
        HAS_MEMBER: {
            color: '#9C27B0',  // Purple
            lineStyle: 'dashed',
            width: 1,
            arrow: 'triangle'
        },
        REFERENCES: {
            color: '#FF9800',  // Orange
            lineStyle: 'dashed',
            width: 1,
            arrow: 'triangle'
        },
        DEPENDS_ON: {
            color: '#F44336',  // Red
            lineStyle: 'solid',
            width: 2,
            arrow: 'triangle'
        }
    },
    
    // Default layout options
    defaultLayout: 'cose-bilkent',
    
    // Layout configurations
    layouts: {
        'cose-bilkent': {
            name: 'cose-bilkent',
            idealEdgeLength: 100,
            nodeOverlap: 20,
            refresh: 20,
            fit: true,
            padding: 30,
            randomize: false,
            componentSpacing: 100,
            nodeRepulsion: 400000,
            edgeElasticity: 100,
            gravity: 80,
            numIter: 1000,
            animate: true
        },
        cose: {
            name: 'cose',
            idealEdgeLength: 100,
            nodeOverlap: 20,
            refresh: 20,
            fit: true,
            padding: 30,
            randomize: false,
            componentSpacing: 100,
            nodeRepulsion: 400000,
            edgeElasticity: 100,
            gravity: 80,
            numIter: 1000,
            animate: true
        },
        breadthfirst: {
            name: 'breadthfirst',
            fit: true,
            directed: true,
            padding: 30,
            spacingFactor: 1.2,
            animate: true
        },
        circle: {
            name: 'circle',
            fit: true,
            padding: 30,
            animate: true
        },
        grid: {
            name: 'grid',
            fit: true,
            padding: 30,
            avoidOverlap: true,
            animate: true
        },
        concentric: {
            name: 'concentric',
            fit: true,
            padding: 30,
            startAngle: 3 / 2 * Math.PI,
            sweep: undefined,
            clockwise: true,
            equidistant: false,
            minNodeSpacing: 10,
            animate: true
        }
    },
    
    // Cytoscape style
    cytoscapeStyle: [
        // Base node style
        {
            selector: 'node',
            style: {
                'label': 'data(name)',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-size': '10px',
                'text-wrap': 'wrap',
                'text-max-width': '80px',
                'background-color': '#666',
                'color': '#fff',
                'text-outline-width': 1,
                'text-outline-color': '#555',
                'text-outline-opacity': 0.5,
                'min-zoomed-font-size': '8px'
            }
        },
        
        // Base edge style
        {
            selector: 'edge',
            style: {
                'width': 1,
                'line-color': '#999',
                'target-arrow-color': '#999',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(type)',
                'font-size': '8px',
                'text-rotation': 'autorotate',
                'text-background-color': '#fff',
                'text-background-opacity': 0.7,
                'text-background-padding': '2px',
                'min-zoomed-font-size': '6px'
            }
        },
        
        // Embedded node style
        {
            selector: 'node.embedded-node',
            style: {
                'border-width': 2,
                'border-color': '#3f51b5',
                'border-style': 'dotted'
            }
        },
        
        // Embedded edge style
        {
            selector: 'edge.embedded-edge',
            style: {
                'line-style': 'dotted',
                'line-dash-pattern': [6, 3],
                'line-dash-offset': 1
            }
        },
        
        // Placeholder node style
        {
            selector: 'node.placeholder-node',
            style: {
                'border-width': 2,
                'border-color': '#ff9800',
                'border-style': 'dashed',
                'background-color': '#ffecb3'
            }
        },
        
        // Placeholder edge style
        {
            selector: 'edge.placeholder-edge',
            style: {
                'line-style': 'dashed',
                'line-color': '#ff9800',
                'target-arrow-color': '#ff9800',
                'width': 1
            }
        }
    ]
};
