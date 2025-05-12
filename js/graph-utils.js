/**
 * Utility functions for graph operations
 */

// Graph data storage
let graphData = null;
let cy = null;

/**
 * Load graph data from JSON file
 * @returns {Promise} Promise that resolves when data is loaded
 */
function loadGraphData() {
    return new Promise((resolve, reject) => {
        fetch(CONFIG.dataUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                graphData = data;
                console.log('Graph data loaded:', data);
                resolve(data);
            })
            .catch(error => {
                console.error('Error loading graph data:', error);
                reject(error);
            });
    });
}

/**
 * Initialize Cytoscape instance with graph data
 * @param {Object} data The graph data
 * @returns {Object} Cytoscape instance
 */
function initCytoscape(data) {
    // Create elements from graph data
    const elements = createCytoscapeElements(data);
    
    // Create style from config
    const style = createCytoscapeStyle();
    
    // Initialize Cytoscape
    cy = cytoscape({
        container: document.getElementById('cy'),
        elements: elements,
        style: style,
        layout: CONFIG.layouts.circle, // Use circle layout as fallback
        wheelSensitivity: 0.3,
        minZoom: 0.1,
        maxZoom: 3
    });
    
    // Try to use the default layout if available
    try {
        console.log('Applying layout:', CONFIG.defaultLayout);
        
        // Force the use of cose-bilkent layout for better network visualization
        const layout = cy.layout({
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
        });
        
        layout.run();
    } catch (error) {
        console.warn('Error applying cose-bilkent layout:', error);
        console.log('Trying standard cose layout');
        
        try {
            const layout = cy.layout({
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
            });
            layout.run();
        } catch (secondError) {
            console.warn('Error applying cose layout:', secondError);
            console.log('Falling back to circle layout');
            const layout = cy.layout(CONFIG.layouts.circle);
            layout.run();
        }
    }
    
    return cy;
}

/**
 * Create Cytoscape elements from graph data
 * @param {Object} data The graph data
 * @returns {Array} Array of Cytoscape elements
 */
function createCytoscapeElements(data) {
    console.log('Creating Cytoscape elements from graph data:', data);
    
    const elements = [];
    const processedNodes = new Set(); // Track processed nodes to avoid duplicates
    const processedEdges = new Set(); // Track processed edges to avoid duplicates
    
    // Map to store node properties by name for merging
    const nodePropertiesByName = new Map();
    
    // Counters for debugging
    let mainNodesCount = 0;
    let embeddedNodesCount = 0;
    let placeholderNodesCount = 0;
    let mainEdgesCount = 0;
    let embeddedEdgesCount = 0;
    let placeholderEdgesCount = 0;
    
    // First pass: collect all node properties by name for merging
    data.nodes.forEach(node => {
        const nodeName = node.name;
        if (nodeName) {
            if (!nodePropertiesByName.has(nodeName)) {
                nodePropertiesByName.set(nodeName, []);
            }
            nodePropertiesByName.get(nodeName).push(node);
        }
    });
    
    // Add nodes
    data.nodes.forEach(node => {
        // Determine node type from labels
        const nodeType = getNodeType(node.labels);
        
        // Add the main node
        // Handle nodes that might have uuid instead of id
        const nodeId = node.id || node.uuid;
        if (nodeId && !processedNodes.has(nodeId.toString())) {
            elements.push({
                data: {
                    id: nodeId.toString(),
                    name: node.name || `Node ${nodeId}`,
                    nodeType: nodeType,
                    properties: node,
                    labels: node.labels
                },
                classes: nodeType
            });
            processedNodes.add(nodeId.toString());
        }
        
        // Check if the node has content that contains a subgraph
        if (node.content && typeof node.content === 'string') {
            try {
                // Try to parse the content as JSON
                let contentObj;
                
                // Handle escaped JSON strings
                if (node.content.startsWith('{\\\"')) {
                    // Replace escaped quotes with regular quotes
                    const unescapedContent = node.content.replace(/\\"/g, '"');
                    contentObj = JSON.parse(unescapedContent);
                } else if (node.content.startsWith('{')) {
                    contentObj = JSON.parse(node.content);
                } else {
                    throw new Error('Content is not in JSON format');
                }
                
                console.log(`Processing embedded subgraph in node ${node.name || node.id}:`, contentObj);
                
                // Check if the content has nodes or edges
                if (contentObj.nodes) {
                    // Process embedded nodes
                    contentObj.nodes.forEach(embeddedNode => {
                        const embeddedNodeType = getNodeType(embeddedNode.labels || [embeddedNode.entity_type || 'Unknown']);
                        
                        if (!processedNodes.has(embeddedNode.uuid)) {
                            // Get the node ID (could be id or uuid)
                            const nodeId = node.id || node.uuid;
                            
                            const nodeData = {
                                id: embeddedNode.uuid,
                                name: embeddedNode.properties?.name || embeddedNode.uuid,
                                nodeType: embeddedNodeType,
                                properties: embeddedNode,
                                labels: embeddedNode.labels || [embeddedNode.entity_type],
                                isEmbedded: true
                            };
                            
                            // Only add parentNode if the parent node has an ID
                            if (nodeId) {
                                nodeData.parentNode = nodeId.toString();
                            }
                            
                            elements.push({
                                data: nodeData,
                                classes: embeddedNodeType + ' embedded-node'
                            });
                            processedNodes.add(embeddedNode.uuid);
                        }
                    });
                }
                
                // Process embedded edges
                const edgesList = contentObj.edges || contentObj.relationships || [];
                edgesList.forEach(embeddedEdge => {
                    const edgeId = embeddedEdge.uuid || `edge-${embeddedEdge.source_uuid}-${embeddedEdge.target_uuid}`;
                    
                    // Create placeholder nodes for source and target if they don't exist
                    if (embeddedEdge.source_uuid && !processedNodes.has(embeddedEdge.source_uuid)) {
                        console.log(`Creating placeholder node for source: ${embeddedEdge.source_uuid}`);
                        
                        // Extract a readable name from the UUID
                        const sourceName = embeddedEdge.source_uuid.replace(/^[a-z]+-/, '').replace(/-/g, ' ');
                        const sourceType = embeddedEdge.source_uuid.split('-')[0] || 'Unknown';
                        
                        // Get the node ID (could be id or uuid)
                        const nodeId = node.id || node.uuid;
                        
                        const sourceData = {
                            id: embeddedEdge.source_uuid,
                            name: sourceName.charAt(0).toUpperCase() + sourceName.slice(1),
                            nodeType: sourceType,
                            properties: { uuid: embeddedEdge.source_uuid },
                            labels: [sourceType],
                            isEmbedded: true,
                            isPlaceholder: true
                        };
                        
                        // Only add parentNode if the parent node has an ID
                        if (nodeId) {
                            sourceData.parentNode = nodeId.toString();
                        }
                        
                        elements.push({
                            data: sourceData,
                            classes: sourceType + ' embedded-node placeholder-node'
                        });
                        processedNodes.add(embeddedEdge.source_uuid);
                    }
                    
                    if (embeddedEdge.target_uuid && !processedNodes.has(embeddedEdge.target_uuid)) {
                        console.log(`Creating placeholder node for target: ${embeddedEdge.target_uuid}`);
                        
                        // Extract a readable name from the UUID
                        const targetName = embeddedEdge.target_uuid.replace(/^[a-z]+-/, '').replace(/-/g, ' ');
                        const targetType = embeddedEdge.target_uuid.split('-')[0] || 'Unknown';
                        
                        // Get the node ID (could be id or uuid)
                        const nodeId = node.id || node.uuid;
                        
                        const targetData = {
                            id: embeddedEdge.target_uuid,
                            name: targetName.charAt(0).toUpperCase() + targetName.slice(1),
                            nodeType: targetType,
                            properties: { uuid: embeddedEdge.target_uuid },
                            labels: [targetType],
                            isEmbedded: true,
                            isPlaceholder: true
                        };
                        
                        // Only add parentNode if the parent node has an ID
                        if (nodeId) {
                            targetData.parentNode = nodeId.toString();
                        }
                        
                        elements.push({
                            data: targetData,
                            classes: targetType + ' embedded-node placeholder-node'
                        });
                        processedNodes.add(embeddedEdge.target_uuid);
                    }
                    
                    if (!processedEdges.has(edgeId)) {
                        // Get the node ID (could be id or uuid)
                        const nodeId = node.id || node.uuid;
                        
                        const edgeData = {
                            id: edgeId,
                            source: embeddedEdge.source_uuid,
                            target: embeddedEdge.target_uuid,
                            type: embeddedEdge.relationship_type,
                            properties: embeddedEdge,
                            isEmbedded: true
                        };
                        
                        // Only add parentEdge if the parent node has an ID
                        if (nodeId) {
                            edgeData.parentEdge = nodeId.toString();
                        }
                        
                        elements.push({
                            data: edgeData,
                            classes: embeddedEdge.relationship_type + ' embedded-edge'
                        });
                        processedEdges.add(edgeId);
                    }
                });
                
            } catch (error) {
                console.warn('Error parsing node content as JSON:', error, node.content.substring(0, 100) + '...');
            }
        }
        
        // Check if the node has entity_edges that reference other edges
        if (node.entity_edges && Array.isArray(node.entity_edges)) {
            console.log(`Node ${node.name || node.id} has ${node.entity_edges.length} entity_edges`);
            
            // Process each entity edge reference
            node.entity_edges.forEach(edgeUuid => {
                // We don't have the actual edge data here, so we'll create placeholder edges
                // These will be replaced if the actual edge data is found elsewhere
                const edgeId = `entity-edge-${edgeUuid}`;
                
                if (!processedEdges.has(edgeId)) {
                    // Add a note about this edge to the console
                    console.log(`Adding placeholder for entity edge: ${edgeUuid}`);
                    
                    // We don't know the source and target, so we'll use the node as the source
                    // and create a dummy target
                    const dummyTargetId = `dummy-target-${edgeUuid.substring(0, 8)}`;
                    
                    // Add a dummy target node if it doesn't exist
                    if (!processedNodes.has(dummyTargetId)) {
                        elements.push({
                            data: {
                                id: dummyTargetId,
                                name: `Referenced Entity (${edgeUuid.substring(0, 8)})`,
                                nodeType: 'Unknown',
                                properties: { uuid: edgeUuid },
                                labels: ['Referenced'],
                                isPlaceholder: true
                            },
                            classes: 'Unknown placeholder-node'
                        });
                        processedNodes.add(dummyTargetId);
                    }
                    
                    // Get the node ID (could be id or uuid)
                    const nodeId = node.id || node.uuid;
                    
                    if (nodeId) {
                        // Add the edge
                        elements.push({
                            data: {
                                id: edgeId,
                                source: nodeId.toString(),
                                target: dummyTargetId,
                                type: 'REFERENCES',
                                properties: { uuid: edgeUuid },
                                isPlaceholder: true
                            },
                            classes: 'REFERENCES placeholder-edge'
                        });
                        processedEdges.add(edgeId);
                    } else {
                        console.warn(`Cannot create edge for entity edge ${edgeUuid}: source node has no id or uuid`);
                    }
                }
            });
        }
    });
    
    // Add edges
    data.relationships.forEach(rel => {
        // Skip edges with missing source or target
        if (!rel.source || !rel.target) {
            console.warn(`Skipping edge with missing source or target: ${JSON.stringify(rel)}`);
            return;
        }
        
        const edgeId = `edge-${rel.id}`;
        if (!processedEdges.has(edgeId)) {
            elements.push({
                data: {
                    id: edgeId,
                    source: rel.source.toString(),
                    target: rel.target.toString(),
                    type: rel.type,
                    properties: rel
                },
                classes: rel.type
            });
            processedEdges.add(edgeId);
        }
    });
    
    return elements;
}

/**
 * Get node type from labels
 * @param {Array} labels Array of node labels
 * @returns {String} Node type
 */
function getNodeType(labels) {
    // Check for known node types in labels
    for (const label of labels) {
        if (CONFIG.nodeTypes[label]) {
            return label;
        }
    }
    
    // Default to first label if no known type is found
    return labels[0] || 'Unknown';
}

/**
 * Create Cytoscape style from config
 * @returns {Array} Array of Cytoscape style rules
 */
function createCytoscapeStyle() {
    const style = [...CONFIG.cytoscapeStyle];
    
    // Add node type styles
    Object.entries(CONFIG.nodeTypes).forEach(([type, config]) => {
        style.push({
            selector: `node.${type}`,
            style: {
                'background-color': config.color,
                'shape': config.shape,
                'width': config.size,
                'height': config.size
            }
        });
    });
    
    // Add relationship type styles
    Object.entries(CONFIG.relationshipTypes).forEach(([type, config]) => {
        style.push({
            selector: `edge.${type}`,
            style: {
                'line-color': config.color,
                'target-arrow-color': config.color,
                'width': config.width,
                'line-style': config.lineStyle,
                'target-arrow-shape': config.arrow
            }
        });
    });
    
    return style;
}

/**
 * Apply layout to graph
 * @param {String} layoutName Name of the layout to apply
 */
function applyLayout(layoutName) {
    if (!cy || !CONFIG.layouts[layoutName]) return;
    
    const layout = cy.layout(CONFIG.layouts[layoutName]);
    layout.run();
}

/**
 * Get all node types in the graph
 * @returns {Array} Array of node types
 */
function getNodeTypes() {
    if (!cy) return [];
    
    const types = new Set();
    cy.nodes().forEach(node => {
        const nodeType = node.data('nodeType');
        if (nodeType) {
            types.add(nodeType);
        }
    });
    
    return Array.from(types);
}

/**
 * Get all relationship types in the graph
 * @returns {Array} Array of relationship types
 */
function getRelationshipTypes() {
    if (!cy) return [];
    
    const types = new Set();
    cy.edges().forEach(edge => {
        const relType = edge.data('type');
        if (relType) {
            types.add(relType);
        }
    });
    
    return Array.from(types);
}

/**
 * Filter graph by node and relationship types
 * @param {Array} nodeTypes Array of node types to show
 * @param {Array} relationshipTypes Array of relationship types to show
 */
function filterGraph(nodeTypes, relationshipTypes) {
    if (!cy) return;
    
    // Reset all elements
    cy.elements().removeClass('hidden');
    
    // Filter nodes
    cy.nodes().forEach(node => {
        const nodeType = node.data('nodeType');
        if (!nodeTypes.includes(nodeType)) {
            node.addClass('hidden');
        }
    });
    
    // Filter edges
    cy.edges().forEach(edge => {
        const relType = edge.data('type');
        const sourceVisible = !edge.source().hasClass('hidden');
        const targetVisible = !edge.target().hasClass('hidden');
        
        if (!relationshipTypes.includes(relType) || !sourceVisible || !targetVisible) {
            edge.addClass('hidden');
        }
    });
}

/**
 * Search for nodes by name or property
 * @param {String} query Search query
 * @returns {Array} Array of matching nodes
 */
function searchNodes(query) {
    if (!cy || !query) return [];
    
    const matches = [];
    const lowerQuery = query.toLowerCase();
    
    cy.nodes().forEach(node => {
        const name = node.data('name') || '';
        const properties = node.data('properties') || {};
        
        // Check name
        if (name.toLowerCase().includes(lowerQuery)) {
            matches.push(node);
            return;
        }
        
        // Check properties
        for (const [key, value] of Object.entries(properties)) {
            if (typeof value === 'string' && value.toLowerCase().includes(lowerQuery)) {
                matches.push(node);
                return;
            }
        }
    });
    
    return matches;
}

/**
 * Highlight a node and its connections
 * @param {Object} node Cytoscape node
 */
function highlightNode(node) {
    if (!cy || !node) return;
    
    // Reset previous highlighting
    cy.elements().removeClass('highlighted-node faded');
    
    // Highlight the selected node
    node.addClass('highlighted-node');
    
    // Get connected nodes
    const connectedEdges = node.connectedEdges();
    const connectedNodes = connectedEdges.connectedNodes().difference(node);
    
    // Fade all other elements
    cy.elements().difference(node).difference(connectedEdges).difference(connectedNodes).addClass('faded');
}

/**
 * Reset highlighting
 */
function resetHighlighting() {
    if (!cy) return;
    
    cy.elements().removeClass('highlighted-node faded search-match');
}

/**
 * Get node details for display
 * @param {Object} node Cytoscape node
 * @returns {Object} Node details
 */
function getNodeDetails(node) {
    if (!node) return null;
    
    const data = node.data();
    const properties = data.properties || {};
    const nodeType = data.nodeType || 'Unknown';
    
    // Get incoming and outgoing relationships
    const incomingEdges = node.incomers('edge');
    const outgoingEdges = node.outgoers('edge');
    
    const incomingRelationships = incomingEdges.map(edge => ({
        type: edge.data('type'),
        source: edge.source().data('name'),
        sourceId: edge.source().id()
    }));
    
    const outgoingRelationships = outgoingEdges.map(edge => ({
        type: edge.data('type'),
        target: edge.target().data('name'),
        targetId: edge.target().id()
    }));
    
    return {
        id: data.id,
        name: data.name,
        type: nodeType,
        properties: properties,
        incomingRelationships: incomingRelationships,
        outgoingRelationships: outgoingRelationships
    };
}

/**
 * Export the graph data as JSON
 * @returns {String} JSON string
 */
function exportGraphAsJson() {
    if (!graphData) return '';
    
    return JSON.stringify(graphData, null, 2);
}
