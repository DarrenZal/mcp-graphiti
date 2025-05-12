from pydantic import BaseModel, Field

class Feature(BaseModel):
    """
    Represents user-visible functionality or capabilities as defined in CodeArchGraph.
    
    Instructions for identifying and extracting features:
    1. Look for capabilities that provide value to users or other systems
    2. Focus on what the system can do rather than how it does it
    3. Features are implemented by Components and Modules
    4. Consider both user-facing and system-facing features
    5. Features should be expressed in terms of capabilities, not implementation details
    
    Examples in this codebase might include:
    - "Project Initialization" - The ability to create new Graphiti projects
    - "Knowledge Graph Generation" - Creating a knowledge graph from code
    - "Multi-project Support" - Supporting multiple knowledge graph projects
    """
    
    name: str = Field(..., description="Unique identifier for this feature")
    description: str = Field(..., description="Human-readable explanation of the feature")
    status: str = Field(default="active", description="Current state (active, deprecated, planned)")
    created_at: str = Field(default="", description="When this feature was added to the system")
    modified_at: str = Field(default="", description="When this feature was last modified")
    responsibility: str = Field(default="", description="Primary purpose in the system")
    maintainer: str = Field(default="", description="Team/individual responsible for this feature")
    user_benefit: str = Field(default="", description="The value this feature provides to users")
