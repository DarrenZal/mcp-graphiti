from pydantic import BaseModel, Field

class Interface(BaseModel):
    """
    Represents a defined way for components to interact as defined in CodeArchGraph.
    
    Instructions for identifying and extracting interfaces:
    1. Look for APIs, protocols, or defined contracts between system parts
    2. Focus on the boundaries between components where data or control flows
    3. Interfaces can be REST APIs, function signatures, CLI commands, etc.
    4. Identify what data/parameters pass through the interface
    5. Determine which component exposes the interface and which consumes it
    
    Examples in this codebase might include:
    - "MCP Protocol" - The Model Context Protocol interface that clients connect to
    - "CLI Command API" - The interface exposed by the CLI for command execution
    - "Docker API" - The interface used to interact with Docker daemon
    """
    
    name: str = Field(..., description="Unique identifier for this interface")
    description: str = Field(..., description="Human-readable explanation of the interface")
    status: str = Field(default="active", description="Current state (active, deprecated, planned)")
    created_at: str = Field(default="", description="When this interface was added to the system")
    modified_at: str = Field(default="", description="When this interface was last modified")
    responsibility: str = Field(default="", description="Primary purpose in the system")
    maintainer: str = Field(default="", description="Team/individual responsible for this interface")
    parameters: str = Field(default="", description="Information about the interface parameters or data format")
