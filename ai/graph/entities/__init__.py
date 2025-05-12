"""
CodeArchGraph Entity Definitions

This package contains entity definitions that conform to the CodeArchGraph schema
for representing software architecture as a knowledge graph.
"""

# Import all entity types to register them
from .core.Component import Component
from .core.Module import Module
from .core.Interface import Interface
from .core.Feature import Feature
from .core.Resource import Resource
from .core.Concept import Concept

# Optional: Create a mapping of entity names to classes
ENTITIES = {
    "Component": Component,
    "Module": Module,
    "Interface": Interface,
    "Feature": Feature,
    "Resource": Resource,
    "Concept": Concept
}
