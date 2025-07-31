import uuid
from typing import Optional
import secrets
import string

class IDGenerator:
    """
    Centralized ID generation utility to replace MongoDB ObjectIds with UUIDs
    for better JSON serialization and API consistency
    """
    
    @staticmethod
    def generate_uuid() -> str:
        """Generate a standard UUID4"""
        return str(uuid.uuid4())
    
    @staticmethod
    def generate_short_id(length: int = 8) -> str:
        """Generate a shorter, URL-safe ID for public use"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(length))
    
    @staticmethod
    def generate_project_id() -> str:
        """Generate a project-specific ID with prefix"""
        short_id = IDGenerator.generate_short_id(10)
        return f"proj_{short_id}"
    
    @staticmethod
    def generate_conversation_id() -> str:
        """Generate a conversation-specific ID with prefix"""
        short_id = IDGenerator.generate_short_id(12)
        return f"conv_{short_id}"
    
    @staticmethod
    def generate_template_id() -> str:
        """Generate a template-specific ID with prefix"""
        short_id = IDGenerator.generate_short_id(8)
        return f"tmpl_{short_id}"
    
    @staticmethod
    def generate_integration_id() -> str:
        """Generate an integration-specific ID with prefix"""
        short_id = IDGenerator.generate_short_id(10)
        return f"intg_{short_id}"
    
    @staticmethod
    def generate_user_id() -> str:
        """Generate a user-specific ID with prefix"""
        short_id = IDGenerator.generate_short_id(12)
        return f"user_{short_id}"
    
    @staticmethod
    def generate_session_id() -> str:
        """Generate a session ID for authentication"""
        return f"sess_{IDGenerator.generate_short_id(16)}"
    
    @staticmethod
    def validate_id(id_value: str, id_type: Optional[str] = None) -> bool:
        """Validate an ID format"""
        if not id_value or not isinstance(id_value, str):
            return False
            
        if id_type:
            expected_prefix = {
                'project': 'proj_',
                'conversation': 'conv_',
                'template': 'tmpl_',
                'integration': 'intg_',
                'user': 'user_',
                'session': 'sess_'
            }.get(id_type)
            
            if expected_prefix and not id_value.startswith(expected_prefix):
                return False
                
        return len(id_value) >= 8 and all(c.isalnum() or c == '_' for c in id_value)

# Global ID generator instance
id_gen = IDGenerator()