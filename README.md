# CodeArchGraph Explorer

An interactive web-based visualization tool for exploring the CodeArchGraph knowledge graph of the rawr-mcp-graphiti project.

## Overview

CodeArchGraph Explorer is a static website that provides an interactive visualization of the knowledge graph created for the rawr-mcp-graphiti project. It allows users to explore the components, modules, interfaces, features, resources, and concepts that make up the project, as well as the relationships between them.

## Features

- **Interactive Graph Visualization**: Explore the knowledge graph with an interactive visualization powered by Cytoscape.js.
- **Node Filtering**: Filter nodes by type (Component, Module, Interface, Feature, Resource, Concept).
- **Relationship Filtering**: Filter relationships by type (IMPLEMENTS, DEPENDS_ON, EXPOSES, CONSUMES, CONTAINS, RELATED_TO, EXTENDS, LOCATED_IN).
- **Search**: Search for nodes by name or property.
- **Node Details**: View detailed information about nodes, including properties and relationships.
- **Multiple Layouts**: Choose from different graph layouts (Cose, Breadth First, Circle, Grid, Concentric).
- **Fullscreen Mode**: View the graph in fullscreen mode for better visibility.

## Usage

### Local Development

To run the website locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/rawr-ai/mcp-graphiti.git
   cd mcp-graphiti
   ```

2. Start a local web server:
   ```bash
   # Using Python
   python -m http.server 8080 --directory website

   # Or using Node.js
   npx serve website
   ```

3. Open your browser and navigate to `http://localhost:8080`.

### Exporting Graph Data

The website requires a JSON file containing the knowledge graph data. This can be generated using the provided Python script:

```bash
# Make sure Neo4j is running
python scripts/export-graph-to-json.py
```

This will export the knowledge graph data to `website/data/knowledge-graph.json`.

### Hosting on GitHub Pages

The website can be deployed to GitHub Pages directly from the main repository using the provided script:

1. From the root of the repository, run the deployment script:
   ```bash
   ./scripts/deploy-to-github-pages.sh
   ```

2. The script will:
   - Create or update a `gh-pages` branch
   - Copy the website files to this branch
   - Push the branch to GitHub

3. After the first deployment, configure GitHub Pages in your repository settings:
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Under "Source", select the `gh-pages` branch
   - Click "Save"

4. The website will be available at `https://yourusername.github.io/mcp-graphiti/`.

## Data Structure

The knowledge graph data is stored in a JSON file with the following structure:

```json
{
  "nodes": [
    {
      "id": 1,
      "name": "Node Name",
      "description": "Node Description",
      "labels": ["NodeType"],
      "group_id": "rawr-mcp-graphiti",
      "property1": "value1",
      "property2": "value2"
    },
    ...
  ],
  "relationships": [
    {
      "id": 1,
      "source": 1,
      "target": 2,
      "type": "RELATIONSHIP_TYPE",
      "group_id": "rawr-mcp-graphiti",
      "property1": "value1",
      "property2": "value2"
    },
    ...
  ],
  "metadata": {
    "group_id": "rawr-mcp-graphiti",
    "node_count": 20,
    "relationship_count": 22,
    "schema": "CodeArchGraph",
    "created_at": "2025-05-12T01:54:00Z",
    "description": "Knowledge graph of the rawr-mcp-graphiti project architecture"
  }
}
```

## Customization

### Styling

The website's appearance can be customized by modifying the CSS file:

```
website/css/styles.css
```

### Configuration

The graph visualization can be customized by modifying the configuration file:

```
website/js/config.js
```

This file contains settings for node and relationship styles, layout options, and more.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Cytoscape.js](https://js.cytoscape.org/) - Graph visualization library
- [Bootstrap](https://getbootstrap.com/) - CSS framework
- [rawr-mcp-graphiti](https://github.com/rawr-ai/mcp-graphiti) - The project being visualized
