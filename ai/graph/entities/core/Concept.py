from pydantic import BaseModel, Field

class Concept(BaseModel):
    """
    Represents important abstract ideas in the system as defined in CodeArchGraph.
    
    Instructions for identifying and extracting concepts:
    1. Look for important abstract ideas that are fundamental to understanding the system
    2. Focus on domain-specific terminology and architectural principles
    3. Concepts are often mentioned across multiple components or documentation
    4. Concepts help explain "why" certain design decisions were made
    5. Concepts bridge technical implementation and domain understanding
    
    Examples in this codebase might include:
    - "Knowledge Graph" - The core data structure concept for representing code relationships
    - "Temporal Versioning" - The concept of tracking changes over time in the graph
    - "Model Context Protocol" - The conceptual framework for agent-tool communication
    """
    
    name: str = Field(..., description="Unique identifier for this concept")
    description: str = Field(..., description="Human-readable explanation of the concept")
    status: str = Field(default="active", description="Current state (active, deprecated, planned)")
    created_at: str = Field(default="", description="When this concept was added to the system")
    modified_at: str = Field(default="", description="When this concept was last modified")
    responsibility: str = Field(default="", description="Primary purpose in the system")
    maintainer: str = Field(default="", description="Team/individual responsible for this concept")
    related_concepts: str = Field(default="", description="Other concepts that are related to this one")
