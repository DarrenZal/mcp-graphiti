# CodeArchGraph Knowledge Graph Generation Prompt

I want to build a comprehensive knowledge graph of this codebase using the group_id "rawr-mcp-graphiti" and following the CodeArchGraph schema. Please:

## Entity Extraction

1. **Identify Components** (major architectural elements):
   - Identify distinct functional parts of the system (e.g., CLI Tool, MCP Server, Docker Integration)
   - Extract name, description, responsibility, and status for each

2. **Map Modules** contained within Components:
   - Find groupings of related code files within each component
   - Document their purpose and responsibilities
   - Establish CONTAINS relationships between Components and their Modules

3. **Document Interfaces** between Components:
   - Identify how components interact (e.g., REST APIs, event systems, function calls)
   - Map which components EXPOSES interfaces and which CONSUMES them

4. **List Features** implemented by Components:
   - Identify user-visible functionality provided by the system
   - Establish IMPLEMENTS relationships between Components/Modules and Features

5. **Record Resources** the system depends on:
   - Document external dependencies (e.g., Neo4j, Docker, OpenAI API)
   - Map which Components/Modules DEPENDS_ON these Resources

6. **Identify Concepts** important to the system:
   - Document important abstract ideas (e.g., "Knowledge Graph", "MCP Protocol")
   - Establish RELATED_TO relationships with relevant Components/Modules/Features

## Relationship Mapping

For each entity you identify, please establish the appropriate relationships:

- **IMPLEMENTS**: Connect Components/Modules to the Features they implement
- **DEPENDS_ON**: Map dependency relationships between Components/Modules/Resources
- **EXPOSES**: Link Components/Modules to the Interfaces they provide
- **CONSUMES**: Connect Components/Modules to the Interfaces they use
- **CONTAINS**: Establish hierarchical relationships between Components and Modules
- **RELATED_TO**: Link Concepts to relevant Components/Modules/Features
- **EXTENDS**: Identify inheritance or extension relationships
- **LOCATED_IN**: Document where Components/Modules are located in the filesystem

Please be thorough in your analysis, focusing on real architectural elements rather than hypothetical ones. Once complete, provide a summary of what you've added to the knowledge graph.
