from pydantic import BaseModel, Field

class Module(BaseModel):
    """
    Represents a grouping of related code files as defined in CodeArchGraph.
    
    Instructions for identifying and extracting modules:
    1. Look for directories or packages that implement specific functionality
    2. Focus on cohesive code units that work together toward a common purpose
    3. Modules are typically contained within Components
    4. Look for logical groupings like "Command Handling", "Configuration Management", "Entity Registry"
    5. Modules are more fine-grained than Components but larger than individual classes
    
    Examples in this codebase might include:
    - "Command Processor" - Code that parses and executes CLI commands
    - "Docker Compose Generator" - Module that generates docker-compose files
    - "Entity Registry" - Code for managing registered entity types
    """
    
    name: str = Field(..., description="Unique identifier for this module")
    description: str = Field(..., description="Human-readable explanation of the module")
    status: str = Field(default="active", description="Current state (active, deprecated, planned)")
    created_at: str = Field(default="", description="When this module was added to the system")
    modified_at: str = Field(default="", description="When this module was last modified")
    responsibility: str = Field(default="", description="Primary purpose in the system")
    maintainer: str = Field(default="", description="Team/individual responsible for this module")
