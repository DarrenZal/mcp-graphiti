# CodeArchGraph Schema Entities

This directory contains entity definitions that conform to the CodeArchGraph schema for representing software architecture in a knowledge graph.

## Core Entities

- **Component**: Distinct functional parts of the system (e.g., CLI Tool, MCP Server)
- **Module**: Grouping of related code files (e.g., Command Processor, Entity Registry)
- **Interface**: How components interact (e.g., MCP Protocol, CLI Command API)
- **Feature**: User-visible functionality (e.g., Project Initialization, Knowledge Graph Generation)
- **Resource**: External dependencies (e.g., Neo4j Database, OpenAI API)
- **Concept**: Important abstract ideas (e.g., Knowledge Graph, Temporal Versioning)

## Core Relationships

- **IMPLEMENTS**: Component/Module → Feature
- **DEPENDS_ON**: Component/Module → Component/Module/Resource
- **EXPOSES**: Component/Module → Interface
- **CONSUMES**: Component/Module → Interface
- **CONTAINS**: Component → Module
- **RELATED_TO**: Concept → Component/Module/Feature
- **EXTENDS**: Component/Module → Component/Module
- **LOCATED_IN**: Component/Module → File/Directory

These entity definitions guide LLM-based entity extraction when generating the knowledge graph.
