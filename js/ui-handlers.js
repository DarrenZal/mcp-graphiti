/**
 * UI event handlers and DOM manipulation
 */

// Store active filters
let activeNodeTypes = [];
let activeRelationshipTypes = [];
let selectedNode = null;

/**
 * Initialize UI components
 */
function initUI() {
    // Initialize filter panels
    initFilters();
    
    // Initialize legend
    initLegend();
    
    // Initialize search
    initSearch();
    
    // Initialize layout selector
    initLayoutSelector();
    
    // Initialize node details panel
    initNodeDetailsPanel();
    
    // Initialize fullscreen button
    initFullscreenButton();
    
    // Log the number of nodes and edges
    if (cy) {
        console.log(`Graph contains ${cy.nodes().length} nodes and ${cy.edges().length} edges`);
        
        // Apply filters immediately to hide Episodic and Unknown nodes by default
        console.log('Applying initial filters to hide Episodic and Unknown nodes');
        filterGraph(activeNodeTypes, activeRelationshipTypes);
    }
}

/**
 * Initialize filter panels
 */
function initFilters() {
    const nodeTypes = getNodeTypes();
    const relationshipTypes = getRelationshipTypes();
    
    // Initialize node type filters
    const nodeTypeFiltersContainer = document.getElementById('nodeTypeFilters');
    nodeTypeFiltersContainer.innerHTML = '';
    
    nodeTypes.forEach(type => {
        const color = CONFIG.nodeTypes[type]?.color || '#666';
        const container = document.createElement('div');
        container.className = 'filter-checkbox-container';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `filter-node-${type}`;
        // Set Episodic and Unknown types to unchecked by default
        checkbox.checked = !(type === 'Episodic' || type === 'Unknown');
        checkbox.addEventListener('change', updateFilters);
        
        const label = document.createElement('label');
        label.htmlFor = `filter-node-${type}`;
        label.innerHTML = `<span class="filter-color-indicator" style="background-color: ${color}"></span> ${type}`;
        
        container.appendChild(checkbox);
        container.appendChild(label);
        nodeTypeFiltersContainer.appendChild(container);
    });
    
    // Initialize relationship type filters
    const relationshipTypeFiltersContainer = document.getElementById('relationshipTypeFilters');
    relationshipTypeFiltersContainer.innerHTML = '';
    
    relationshipTypes.forEach(type => {
        const color = CONFIG.relationshipTypes[type]?.color || '#999';
        const container = document.createElement('div');
        container.className = 'filter-checkbox-container';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `filter-rel-${type}`;
        checkbox.checked = true;
        checkbox.addEventListener('change', updateFilters);
        
        const label = document.createElement('label');
        label.htmlFor = `filter-rel-${type}`;
        label.innerHTML = `<span class="filter-color-indicator" style="background-color: ${color}"></span> ${type}`;
        
        container.appendChild(checkbox);
        container.appendChild(label);
        relationshipTypeFiltersContainer.appendChild(container);
    });
    
    // Initialize reset filters button
    document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);
    
    // Set initial active filters, excluding Episodic and Unknown
    activeNodeTypes = nodeTypes.filter(type => type !== 'Episodic' && type !== 'Unknown');
    activeRelationshipTypes = [...relationshipTypes];
}

/**
 * Reset filters to show all node and relationship types
 */
function resetFilters() {
    // Reset checkboxes
    document.querySelectorAll('[id^="filter-node-"]').forEach(checkbox => {
        checkbox.checked = true;
    });
    
    document.querySelectorAll('[id^="filter-rel-"]').forEach(checkbox => {
        checkbox.checked = true;
    });
    
    // Update filters
    updateFilters();
}

/**
 * Update filters based on checkbox state
 */
function updateFilters() {
    if (!cy) return;
    
    // Get selected node types
    activeNodeTypes = [];
    document.querySelectorAll('[id^="filter-node-"]').forEach(checkbox => {
        if (checkbox.checked) {
            const type = checkbox.id.replace('filter-node-', '');
            activeNodeTypes.push(type);
        }
    });
    
    // Get selected relationship types
    activeRelationshipTypes = [];
    document.querySelectorAll('[id^="filter-rel-"]').forEach(checkbox => {
        if (checkbox.checked) {
            const type = checkbox.id.replace('filter-rel-', '');
            activeRelationshipTypes.push(type);
        }
    });
    
    // Apply filters
    filterGraph(activeNodeTypes, activeRelationshipTypes);
}

/**
 * Initialize legend
 */
function initLegend() {
    const legendContainer = document.getElementById('legendContainer');
    legendContainer.innerHTML = '';
    
    // Add node type legend items
    const nodeTypesHeading = document.createElement('h6');
    nodeTypesHeading.textContent = 'Node Types';
    legendContainer.appendChild(nodeTypesHeading);
    
    Object.entries(CONFIG.nodeTypes).forEach(([type, config]) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const colorIndicator = document.createElement('div');
        colorIndicator.className = 'legend-color';
        colorIndicator.style.backgroundColor = config.color;
        
        const label = document.createElement('div');
        label.className = 'legend-label';
        label.textContent = type;
        
        legendItem.appendChild(colorIndicator);
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
    });
    
    // Add relationship type legend items
    const relTypesHeading = document.createElement('h6');
    relTypesHeading.textContent = 'Relationship Types';
    relTypesHeading.style.marginTop = '16px';
    legendContainer.appendChild(relTypesHeading);
    
    Object.entries(CONFIG.relationshipTypes).forEach(([type, config]) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const colorIndicator = document.createElement('div');
        colorIndicator.className = 'legend-color';
        colorIndicator.style.backgroundColor = config.color;
        
        const label = document.createElement('div');
        label.className = 'legend-label';
        label.textContent = type;
        
        legendItem.appendChild(colorIndicator);
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
    });
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    // Search button click handler
    searchBtn.addEventListener('click', () => {
        performSearch(searchInput.value);
    });
    
    // Search input enter key handler
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
}

/**
 * Perform search and highlight matching nodes
 * @param {String} query Search query
 */
function performSearch(query) {
    if (!cy || !query) return;
    
    // Reset previous highlighting
    resetHighlighting();
    
    // Find matching nodes
    const matches = searchNodes(query);
    
    if (matches.length > 0) {
        // Highlight matches
        matches.forEach(node => {
            node.addClass('search-match');
        });
        
        // Center view on first match
        cy.fit(matches, 50);
        
        // If only one match, show its details
        if (matches.length === 1) {
            showNodeDetails(matches[0]);
        }
    } else {
        alert('No matches found for: ' + query);
    }
}

/**
 * Initialize layout selector
 */
function initLayoutSelector() {
    const layoutSelect = document.getElementById('layoutSelect');
    const applyLayoutBtn = document.getElementById('applyLayoutBtn');
    
    // Populate layout selector
    Object.keys(CONFIG.layouts).forEach(layoutName => {
        const option = document.createElement('option');
        option.value = layoutName;
        option.textContent = layoutName.charAt(0).toUpperCase() + layoutName.slice(1);
        layoutSelect.appendChild(option);
    });
    
    // Set default layout
    layoutSelect.value = CONFIG.defaultLayout;
    
    // Apply layout button click handler
    applyLayoutBtn.addEventListener('click', () => {
        applyLayout(layoutSelect.value);
    });
}

/**
 * Initialize node details panel
 */
function initNodeDetailsPanel() {
    const closeBtn = document.getElementById('closeNodeDetailsBtn');
    
    // Close button click handler
    closeBtn.addEventListener('click', () => {
        hideNodeDetails();
    });
    
    // Set up Cytoscape node click handler only if cy is defined
    if (cy) {
        cy.on('tap', 'node', function(evt) {
            const node = evt.target;
            showNodeDetails(node);
            highlightNode(node);
        });
        
        // Background click handler to close details panel
        cy.on('tap', function(evt) {
            if (evt.target === cy) {
                hideNodeDetails();
                resetHighlighting();
            }
        });
    } else {
        console.warn('Cytoscape instance not initialized when setting up node details panel');
    }
}

/**
 * Show node details in the panel
 * @param {Object} node Cytoscape node
 */
function showNodeDetails(node) {
    if (!node) return;
    
    selectedNode = node;
    const details = getNodeDetails(node);
    
    // Set panel title
    document.getElementById('nodeDetailsTitle').textContent = details.name;
    
    // Build details content
    const content = document.getElementById('nodeDetailsContent');
    content.innerHTML = '';
    
    // Node type
    const typeElement = document.createElement('div');
    typeElement.innerHTML = `<strong>Type:</strong> ${details.type}`;
    content.appendChild(typeElement);
    
    // Properties table
    const propertiesHeading = document.createElement('h6');
    propertiesHeading.textContent = 'Properties';
    propertiesHeading.style.marginTop = '16px';
    content.appendChild(propertiesHeading);
    
    const propertiesTable = document.createElement('table');
    propertiesTable.className = 'property-table';
    
    // Filter out internal properties and common properties
    const excludedProps = ['id', 'labels', 'name', 'group_id'];
    
    for (const [key, value] of Object.entries(details.properties)) {
        if (excludedProps.includes(key)) continue;
        if (typeof value === 'object') continue;
        
        const row = document.createElement('tr');
        
        const keyCell = document.createElement('td');
        keyCell.textContent = key;
        
        const valueCell = document.createElement('td');
        valueCell.textContent = value;
        
        row.appendChild(keyCell);
        row.appendChild(valueCell);
        propertiesTable.appendChild(row);
    }
    
    content.appendChild(propertiesTable);
    
    // Incoming relationships
    if (details.incomingRelationships.length > 0) {
        const incomingHeading = document.createElement('h6');
        incomingHeading.textContent = 'Incoming Relationships';
        incomingHeading.style.marginTop = '16px';
        content.appendChild(incomingHeading);
        
        const incomingList = document.createElement('ul');
        incomingList.className = 'related-nodes-list';
        
        details.incomingRelationships.forEach(rel => {
            const item = document.createElement('li');
            item.textContent = `${rel.source} (${rel.type})`;
            item.dataset.nodeId = rel.sourceId;
            item.addEventListener('click', () => {
                const node = cy.getElementById(rel.sourceId);
                if (node.length > 0) {
                    showNodeDetails(node);
                    highlightNode(node);
                    cy.center(node);
                }
            });
            incomingList.appendChild(item);
        });
        
        content.appendChild(incomingList);
    }
    
    // Outgoing relationships
    if (details.outgoingRelationships.length > 0) {
        const outgoingHeading = document.createElement('h6');
        outgoingHeading.textContent = 'Outgoing Relationships';
        outgoingHeading.style.marginTop = '16px';
        content.appendChild(outgoingHeading);
        
        const outgoingList = document.createElement('ul');
        outgoingList.className = 'related-nodes-list';
        
        details.outgoingRelationships.forEach(rel => {
            const item = document.createElement('li');
            item.textContent = `${rel.target} (${rel.type})`;
            item.dataset.nodeId = rel.targetId;
            item.addEventListener('click', () => {
                const node = cy.getElementById(rel.targetId);
                if (node.length > 0) {
                    showNodeDetails(node);
                    highlightNode(node);
                    cy.center(node);
                }
            });
            outgoingList.appendChild(item);
        });
        
        content.appendChild(outgoingList);
    }
    
    // Show the panel
    document.getElementById('nodeDetailsPanel').style.display = 'block';
}

/**
 * Hide node details panel
 */
function hideNodeDetails() {
    document.getElementById('nodeDetailsPanel').style.display = 'none';
    selectedNode = null;
}

/**
 * Initialize fullscreen button
 */
function initFullscreenButton() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    fullscreenBtn.addEventListener('click', () => {
        const elem = document.documentElement;
        
        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
                elem.msRequestFullscreen();
            }
            fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
            fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen"></i>';
        }
    });
    
    // Update button icon when fullscreen state changes
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
        } else {
            fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen"></i>';
        }
    });
}

/**
 * Show loading overlay
 */
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}
