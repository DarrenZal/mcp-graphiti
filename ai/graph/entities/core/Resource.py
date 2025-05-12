from pydantic import BaseModel, Field

class Resource(BaseModel):
    """
    Represents external dependencies or assets as defined in CodeArchGraph.
    
    Instructions for identifying and extracting resources:
    1. Look for external systems, services, or libraries that the codebase depends on
    2. Focus on dependencies that are used by Components or Modules
    3. Resources include databases, APIs, libraries, or other external assets
    4. Identify version information if available
    5. Consider both runtime and development-time dependencies
    
    Examples in this codebase might include:
    - "Neo4j Database" - The graph database used to store knowledge graphs
    - "OpenAI API" - The external service used for LLM capabilities
    - "Docker Engine" - The container runtime used for deployment
    """
    
    name: str = Field(..., description="Unique identifier for this resource")
    description: str = Field(..., description="Human-readable explanation of the resource")
    status: str = Field(default="active", description="Current state (active, deprecated, planned)")
    created_at: str = Field(default="", description="When this resource was added to the system")
    modified_at: str = Field(default="", description="When this resource was last modified")
    responsibility: str = Field(default="", description="Primary purpose in the system")
    maintainer: str = Field(default="", description="Team/individual responsible for this resource")
    version: str = Field(default="", description="Version information if applicable")
    access_method: str = Field(default="", description="How this resource is accessed or integrated")
