/**
 * Main application entry point
 */

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

/**
 * Initialize the application
 */
async function initApp() {
    try {
        // Show loading overlay
        showLoading();
        
        // Register the cose-bilkent layout if available
        if (typeof cytoscape !== 'undefined' && typeof cytoscapeCoseBilkent !== 'undefined') {
            console.log('Registering cose-bilkent layout');
            cytoscape.use(cytoscapeCoseBilkent);
        } else {
            console.warn('cose-bilkent layout not available');
        }
        
        // Add a cache-busting parameter to the URL
        CONFIG.dataUrl = CONFIG.dataUrl + '?t=' + new Date().getTime();
        console.log('Loading graph data with cache busting:', CONFIG.dataUrl);
        
        // Load graph data
        const data = await loadGraphData();
        
        // Initialize Cytoscape
        const cyInstance = initCytoscape(data);
        
        // Initialize UI components
        initUI();
        
        // Hide loading overlay
        hideLoading();
        
        console.log('CodeArchGraph Explorer initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        
        // Hide loading overlay
        hideLoading();
        
        // Show error message
        alert('Error loading graph data. Please check the console for details.');
    }
}

/**
 * Create a sample JSON file if no data is available
 * This is useful for development and testing
 */
function createSampleData() {
    const sampleData = {
        nodes: [
            {
                id: 1,
                name: "CLI Tool",
                description: "Command-line interface for managing Graphiti MCP",
                labels: ["Component"],
                group_id: "rawr-mcp-graphiti"
            },
            {
                id: 2,
                name: "MCP Server",
                description: "Server that implements the Model Context Protocol",
                labels: ["Component"],
                group_id: "rawr-mcp-graphiti"
            },
            {
                id: 3,
                name: "Neo4j Database",
                description: "Graph database for storing knowledge graphs",
                labels: ["Resource"],
                group_id: "rawr-mcp-graphiti"
            },
            {
                id: 4,
                name: "Command Handler",
                description: "Handles CLI commands",
                labels: ["Module"],
                group_id: "rawr-mcp-graphiti"
            },
            {
                id: 5,
                name: "Entity Registry",
                description: "Registry of entity types and their properties",
                labels: ["Module"],
                group_id: "rawr-mcp-graphiti"
            },
            {
                id: 6,
                name: "MCP Protocol",
                description: "Protocol for communication between AI agents and tools",
                labels: ["Interface"],
                group_id: "rawr-mcp-graphiti"
            },
            {
                id: 7,
                name: "Knowledge Graph",
                description: "Graph representation of knowledge",
                labels: ["Concept"],
                group_id: "rawr-mcp-graphiti"
            },
            {
                id: 8,
                name: "Project Initialization",
                description: "Feature to initialize a new project",
                labels: ["Feature"],
                group_id: "rawr-mcp-graphiti"
            }
        ],
        relationships: [
            {
                id: 1,
                source: 1,
                target: 4,
                type: "CONTAINS",
                group_id: "rawr-mcp-graphiti"
            },
            {
                id: 2,
                source: 2,
                target: 5,
                type: "CONTAINS",
                group_id: "rawr-mcp-graphiti"
            },
            {
                id: 3,
                source: 2,
                target: 3,
                type: "DEPENDS_ON",
                group_id: "rawr-mcp-graphiti"
            },
            {
                id: 4,
                source: 1,
                target: 8,
                type: "IMPLEMENTS",
                group_id: "rawr-mcp-graphiti"
            },
            {
                id: 5,
                source: 2,
                target: 6,
                type: "EXPOSES",
                group_id: "rawr-mcp-graphiti"
            },
            {
                id: 6,
                source: 1,
                target: 6,
                type: "CONSUMES",
                group_id: "rawr-mcp-graphiti"
            },
            {
                id: 7,
                source: 7,
                target: 2,
                type: "RELATED_TO",
                group_id: "rawr-mcp-graphiti"
            },
            {
                id: 8,
                source: 7,
                target: 3,
                type: "RELATED_TO",
                group_id: "rawr-mcp-graphiti"
            }
        ],
        metadata: {
            group_id: "rawr-mcp-graphiti",
            node_count: 8,
            relationship_count: 8,
            schema: "CodeArchGraph"
        }
    };
    
    // Create a Blob with the JSON data
    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    
    // Create a download link
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sample-knowledge-graph.json';
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    console.log('Sample data created and downloaded');
}

// Uncomment to create sample data for testing
// window.createSampleData = createSampleData;
