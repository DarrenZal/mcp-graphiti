# Graphiti MCP Server • Fast Multi‑Project Knowledge Graphs

*Fork & extension of the official [`getzep/graphiti`](https://github.com/getzep/graphiti) MCP server—adding multi-server, single-DB support and a DX-focused CLI.*

> **Build per‑project temporal knowledge graphs that your AI agents can query over the [Model Context Protocol]—all in one command.**

---

## Why this repo exists

Graphiti already turns unstructured text into a **temporal graph** stored in Neo4j—each server ingests text, extracts entities & relationships via LLMs, and records every change as time‑stamped episodes so agents can ask versioned questions, but most IDEs and agent frameworks (Cursor, VS Code, LangGraph, Autogen, …) speak **MCP**—they expect an HTTP/SSE endpoint that they can list in a `mcp.json` file.\
Typical workflows force you to hand‑roll a dedicated server for every project. To remove that manual step, this CLI auto‑generates a *Docker Compose* file that spins up:

- **one Neo4j instance** (shared storage)
- **one "root" MCP server** (playground / smoke tests)
- **N project‑scoped MCP servers**—each with its own `group_id`, entity rules and OpenAI model

Unlike the upstream example, which assumes **one server per docker-compose file**, this fork automates **N servers against a single Neo4j** so you get:

| Benefit                   | Why it matters                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| **Project isolation**     | Different extraction rules or models can't collide.                                               |
| **Editor auto‑discovery** | `.cursor/mcp.json` is rewritten with the right port for each project—open the repo, tools appear. |
| **Crash containment**     | A runaway prompt that floods the graph only takes down *its* container.                           |
| **Zero‑downtime tweaks**  | Hot‑swap entity YAML or LLM model for *project B* without restarting *project A*.                 |

If your workload is small and homogeneous you *can* run a single server—just comment out the project entries in `mcp-projects.yaml`. The defaults aim for safety and DX first.

---

## Troubleshooting & Manual Setup

If you encounter issues with the CLI tool (such as `ImportError: cannot import name 'commands'`), you can set up Graphiti MCP manually using Docker:

### 1. Configure Environment

```bash
git clone https://github.com/rawr-ai/mcp-graphiti.git
cd mcp-graphiti
cp .env.example .env
```

Edit the `.env` file to:
- Add your OpenAI API key
- Set a secure Neo4j password (must be at least 8 characters)
- Make sure `GRAPHITI_ENV=dev` is set for local testing
- Make sure `MCP_ROOT_ENTITIES=` is empty or commented out to avoid command line errors

### 2. Start Services with Docker Compose

```bash
# Copy the base compose template
cp base-compose.yaml docker-compose.yml

# Create basic projects config
cat > mcp-projects.yaml << EOF
projects:
  - name: root
    path: .
    model: gpt-4o
EOF

# Start the services
docker compose up -d
```

### 3. Create Project Structure Manually

```bash
# Create basic project structure
mkdir -p ~/projects/myproject/ai/graph/entities

# Create entity definitions
cat > ~/projects/myproject/ai/graph/entities/basic.yaml << EOF
entity_types:
  - name: Feature
    description: A software feature or capability
    properties:
      - name: name
        description: Name of the feature
      - name: status
        description: Development status
      - name: priority
        description: Priority level
  
  - name: Document
    description: A document or resource
    properties:
      - name: title
        description: Title of the document
      - name: type
        description: Type of document
EOF

# Set up Cursor integration
mkdir -p ~/projects/myproject/.cursor
cat > ~/projects/myproject/.cursor/mcp.json << EOF
{
  "mcpServers": {
    "graphiti": {
      "transport": "sse",
      "url": "http://localhost:8000/sse"
    }
  }
}
EOF
```

### 4. Adding Additional Project-Specific Servers (Manual)

To add a project-specific server, edit your `docker-compose.yml` to add a new service:

```yaml
  mcp-myproject:
    image: mcp-graphiti-graphiti-mcp-root
    container_name: mcp-myproject
    restart: unless-stopped
    environment:
      - NEO4J_URI=${NEO4J_URI:-bolt://neo4j:7687}
      - NEO4J_USER=${NEO4J_USER:-neo4j}
      - NEO4J_PASSWORD=${NEO4J_PASSWORD}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_BASE_URL=${OPENAI_BASE_URL:-https://api.openai.com/v1}
      - MODEL_NAME=${MODEL_NAME:-gpt-4o}
      - MCP_GROUP_ID=myproject
      - MCP_USE_CUSTOM_ENTITIES=true
      - MCP_ENTITIES_DIR=/app/entities
    ports:
      - "8001:8000"
    volumes:
      - ~/projects/myproject/ai/graph/entities:/app/entities
    depends_on:
      neo4j:
        condition: service_healthy
```

Then restart the new service:

```bash
docker compose up -d
```

Update your project's Cursor config to point to the new port:

```bash
cat > ~/projects/myproject/.cursor/mcp.json << EOF
{
  "mcpServers": {
    "graphiti": {
      "transport": "sse",
      "url": "http://localhost:8001/sse"
    }
  }
}
EOF
```

### API Endpoint Notes

- The SSE endpoint is the primary interface for MCP clients: `/sse`
- The `/status` endpoint mentioned in the documentation doesn't exist (returns 404)
- Use Neo4j browser at `http://localhost:7474` to directly inspect your knowledge graph

---

## Five‑second tour

```bash
# 1 · Install CLI (isolated)
pipx install 'rawr-mcp-graphiti[cli]'  # or: git clone && pipx install .
#   ↳ Once installed, the `graphiti` command is available globally from any directory.

# 2 · Generate compose + IDE configs
#    (can be run from **any** directory — the CLI locates your repo automatically)
cd rawr-mcp-graphiti
graphiti compose              # reads mcp-projects.yaml

# 3 · Launch services (Neo4j + servers)
graphiti up -d                # ports 8000, 8001, …

# 4 · Init a new project
cd path/to/my‑kg        # switch to the project repo root
graphiti init [my-kg]   # writes mcp-config.yaml here

# 5 · Reload only that project
graphiti reload mcp-my-kg
```

Once containers are running you can:

- Open Neo4j browser at `http://localhost:7474` (credentials in `.env`).
- Point any MCP-compatible client to `http://localhost:800{N}/sse`.

---

## Knowledge Graphs as Code: Self-Referential Example

This repository includes a pre-built knowledge graph of its own architecture, stored as `graphiti-data/codearchgraph-knowledge.dump` and following the **CodeArchGraph schema**. This dump file allows you to quickly load a snapshot of the system's architecture into your local Neo4j instance. This serves as a practical demonstration of the "Knowledge Graphs as Code" concept, where architectural understanding is versioned alongside the codebase.

### The CodeArchGraph Schema

The knowledge graph uses a standardized schema with these key elements:

- **Components**: Major architectural elements (CLI Tool, MCP Server, Docker Integration)
- **Modules**: Related code groupings within components (Command Handler, Entity Registry)
- **Interfaces**: Communication boundaries between components (MCP Protocol, Docker API)
- **Features**: User-visible capabilities (Project Initialization, Graph Querying)
- **Resources**: External dependencies (Neo4j, OpenAI API)
- **Concepts**: Important abstract ideas (Knowledge Graph, Temporal Versioning)

These entities are linked by relationships like IMPLEMENTS, DEPENDS_ON, CONTAINS, and RELATED_TO.

### Using the Pre-built Graph

After setting up the repository:

1. Start the services:
   ```bash
   # Follow the standard setup steps
   cp .env.example .env   # Configure with your credentials
   docker compose up -d   # Or use graphiti up -d if CLI works
   ```

2. Restore the knowledge graph from the included dump file:
   ```bash
   ./scripts/restore-graph.sh
   ```
   This script uses the `graphiti-data/codearchgraph-knowledge.dump` file from the repository to load the graph into your Neo4j database.

3. Connect any MCP-compatible tool (like CLINE or Cursor) to query the system's architecture:
   ```
   What are the main Components of the rawr-mcp-graphiti system?
   How does the CLI Module interact with the Docker environment?
   Which Features are implemented by the MCP Server Component?
   ```

### MCP Client Configuration

#### Configuring CLINE

To connect CLINE to your Graphiti MCP server:

1. Create or edit your CLINE configuration file at `~/.clines.json`:
   ```json
   {
     "mcpServers": {
       "graphiti": {
         "transport": "sse",
         "url": "http://localhost:8000/sse"
       }
     }
   }
   ```

2. For project-specific graphs, use the appropriate port:
   ```json
   {
     "mcpServers": {
       "graphiti-projectname": {
         "transport": "sse",
         "url": "http://localhost:8001/sse"
       }
     }
   }
   ```

#### Setting CLINE Custom Instructions for Efficient Queries

To optimize Graphiti knowledge graph queries and minimize costs, configure CLINE with efficient custom instructions:

1. Open CLINE in your project
2. Navigate to Settings → Custom Instructions
3. Add the following instructions to the "About your project" or "Custom Instructions" field:

```
When answering questions about this codebase, follow this efficient process:

1. ALWAYS START with these THREE SEARCHES ONLY:

   search_nodes({"query": "comprehensive terms covering main concepts", "group_ids": ["rawr-mcp-graphiti"], "max_nodes": 25})
   
   search_facts({"query": "similar comprehensive terms", "group_ids": ["rawr-mcp-graphiti"], "max_facts": 25})
   
   get_episodes({"group_id": "rawr-mcp-graphiti", "last_n": 5})


2. ANALYZE ALL search results FULLY before making ANY additional calls.

3. FILE READING RESTRICTIONS:
   - Read at most ONE key file only if absolutely necessary
   - Identify the single most important file from search results first
   - Explain why this file is essential before reading it
   - Always prefer answering from knowledge graph results when possible

4. AVOID:
   - Making sequential/exploratory file reads
   - Reading multiple files for a single question
   - Making multiple MCP calls for similar information

Remember that batch searches with higher limits (25 results) are more cost-effective than multiple smaller searches.
```

These instructions significantly reduce token costs by minimizing the number of API calls while still providing comprehensive answers from the knowledge graph.

#### Configuring Cursor

Cursor's configuration is automatically updated when using the CLI:

```bash
graphiti init project-name
```

This creates or updates `.cursor/mcp.json` in your project directory with the appropriate configuration:

```json
{
  "mcpServers": {
    "graphiti": {
      "transport": "sse",
      "url": "http://localhost:8000/sse"
    }
  }
}
```

### Creating Your Own CodeArchGraph

To create a CodeArchGraph for your own projects:

1. Setup your project following the standard process
2. Define entity files using the CodeArchGraph schema
3. Use the provided prompt template with CLINE/Cursor to build the graph:
   ```bash
   # Copy the prompt template
   cp docs/codearchgraph-prompt.md ~/your-project/docs/
   # Edit as needed for your project name
   ```
4. Open CLINE/Cursor in your project and paste the prompt from `docs/codearchgraph-prompt.md`
5. Export and commit your knowledge graph alongside your code

### CodeArchGraph Generation Prompt

We've included a standardized prompt template in [docs/codearchgraph-prompt.md](docs/codearchgraph-prompt.md) that you can use with any MCP-compatible AI assistant (like CLINE or Cursor) to generate a knowledge graph following the CodeArchGraph schema. This prompt:

- Guides the AI through systematically identifying each entity type
- Structures the extraction process to ensure comprehensive coverage
- Maps relationships between entities according to the schema
- Can be customized for your own projects

Simply paste this prompt into CLINE/Cursor after connecting it to the MCP server to start building your own architecture knowledge graph.

## Why Use the Knowledge Graph? A Case Study on Efficiency and Insight

This repository's own architecture is ingested into a knowledge graph (see "Knowledge Graphs as Code" below). This allows for powerful, efficient querying about the codebase itself. A comparison vividly illustrates the benefits when addressing specific types of prompts.

**The Example Prompt (Querying the `rawr-mcp-graphiti` Knowledge Graph):**

> What are all the components that depend on the Neo4j database, and what specific functionality do they provide that requires database access? Explain how these components interact with each other when processing knowledge graph operations.

**Key Insights from the Comparison:**

* **Ideal for Architecture:** Questions about system architecture, component relationships, and dependencies are perfectly suited for the knowledge graph. The graph explicitly stores these high-level design choices. For this type of query, the knowledge graph approach was nearly 5x cheaper and required zero direct file reads, compared to a standard approach that read over 18 files.
* **Direct Relationship Mapping:** The KG directly maps how components like the `MCP Server` connect to or depend on resources like the `Neo4j database`.
* **Efficiency:** Instead of an AI agent reading through numerous files and inferring connections for architectural questions, it can directly query the KG.
* **Cost-Effectiveness:** For architectural queries, the KG approach is significantly cheaper (a ~78% cost reduction in the example) due to the focused nature of the queries and the reduced need for broad file analysis.

This case study demonstrates that for understanding complex system dependencies and architectural patterns, querying a well-structured knowledge graph is vastly more efficient and cost-effective than traditional file-based analysis by AI agents, while still providing high-quality, comprehensive answers.

---

## How it works under the hood

```text
┌────────────┐      ┌───────────────────┐
│  IDE / AI  │──SSE│  graphiti-mcp-A    │
└────────────┘      │  group_id=proj-A  │
      ▲             └────────┬──────────┘
      │  SSE                 │ Cypher
      │             ┌────────▼──────────┐
      │             │  Neo4j (temporal) │
      │             └────────┬──────────┘
┌────────────┐      ┌────────▼──────────┐
│  HTTP/CLI  │──SSE│  graphiti-mcp-B    │
└────────────┘      │  group_id=proj-B  │
                    └───────────────────┘
```

- `group_id` — every Graphiti write/read is namespaced by this string.  The CLI passes it as an env‑var so each container stays in its lane.
path/to/your/project/ai/graph/entities/` inside a project. Mount‑only volumes keep them read‑only to other projects.
- The **Compose generator** walks `mcp-projects.yaml`, assigns the next free port starting at `8001`, then patches `.cursor/mcp.json` for seamless editor support.

---

## Quick start in depth

### 1. Clone & configure

```bash
git clone https://github.com/rawr-ai/mcp-graphiti.git
cd mcp-graphiti
cp .env.example .env   # add Neo4j creds & OpenAI key
```

### 2. Install the CLI

*Users* (recommended) — `pipx install . --include-deps`\
*Contributors* — `python -m venv .venv && source .venv/bin/activate && uv pip sync uv.lock && pip install -e .`

### 3. Spin it up

```bash
graphiti compose   # generates docker-compose.yml
graphiti up -d
```

### 4. Create a project

```bash
cd ~/code
graphiti init acme-support-bot   # run in the **root** of the new project repo
cd acme-support-bot
# add entity YAMLs under ai/graph/entities/*.yaml
```

From anywhere on your machine, run `graphiti compose && graphiti up -d` to pick up the new project. A new server starts on the next port with `group_id=acme-support-bot`.

### Project Configuration (`mcp-projects.yaml`)

The `mcp-projects.yaml` file at the repository root is used to define and manage the individual projects that the `graphiti` CLI tools will recognize and manage. It allows you to configure multiple, isolated Graphiti MCP server instances running against a single Neo4j database.

Key points:

* **Project Definitions:** This file lists the projects, specifying details like their root directory path (relative to the repository root) and any specific configurations.
* **`.gitignore` Default:** By default, `mcp-projects.yaml` is included in the `.gitignore` file. This prevents accidental commits of potentially private project lists, especially in public forks or clones of this repository.
* **Managing Private Projects:** If you are using this repository structure to manage your own private projects, you should remove the `mcp-projects.yaml` entry from your local `.gitignore` file.

The `graphiti compose` command reads this file to generate the necessary `docker-compose.yml` configuration.

---

## Single-vs-multi server FAQ

|  Question                            |  Answer                                                                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Can I collapse to one server?**    | Yes—delete projects from `mcp-projects.yaml` or set `MCP_SINGLE_SERVER=true` and rerun `compose`.                                                      |
| **Is isolation only through ports?** | No, every query includes `group_id`; the extra container gives you crash & dependency isolation.                                                       |
| **Can I put a gateway in front?**   | Sure—any API gateway or reverse proxy can inject `group_id` (JWT claim, header, etc.) and route to the root server for a claims-based single endpoint. |

---

## Danger zone

Set `NEO4J_DESTROY_ENTIRE_GRAPH=true` **only when you really mean to wipe ALL projects.** The next `graphiti up` will obliterate every node, relationship and episode.

---

## Roadmap & contributions

- **RAWR CLI integration** — expose everything here under a `rawr graph` subcommand to drive the whole RAWR stack with one top‑level tool.
- **`graphiti prune`** — one‑liner to garbage‑collect orphaned `group_id` graphs and reclaim Neo4j disk space.

PRs and issues welcome!

---

© 2025 rawr‑ai • MIT License
