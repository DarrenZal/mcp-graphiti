from pydantic import BaseModel, Field

class Component(BaseModel):
    """
    Represents a distinct functional part of the system as defined in CodeArchGraph.
    
    Instructions for identifying and extracting components:
    1. Look for major architectural elements (like "CLI Tool", "MCP Server", "Docker Integration")
    2. Focus on large-scale organizational units that have clear responsibilities
    3. Identify parts of the system that provide core functionality
    4. Components typically consist of multiple modules working together
    5. Components often interact with other components through well-defined interfaces
    
    Examples in this codebase might include:
    - "CLI Tool" - The command-line interface for managing Graphiti projects
    - "MCP Server" - The Model Context Protocol server implementation
    - "Docker Integration" - The system responsible for container management
    """
    
    name: str = Field(..., description="Unique identifier for this component")
    description: str = Field(..., description="Human-readable explanation of the component")
    status: str = Field(default="active", description="Current state (active, deprecated, planned)")
    created_at: str = Field(default="", description="When this component was added to the system")
    modified_at: str = Field(default="", description="When this component was last modified")
    responsibility: str = Field(default="", description="Primary purpose in the system")
    maintainer: str = Field(default="", description="Team/individual responsible for this component")
