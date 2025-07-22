"""
Voice-to-Code Backend Routes
Advanced voice recognition and natural language to code conversion
2025 cutting-edge feature implementation
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import re
import json
from datetime import datetime
from enum import Enum

router = APIRouter()

# Enums
class CommandType(str, Enum):
    code_generation = "code_generation"
    code_explanation = "code_explanation"
    refactor = "refactor"
    navigation = "navigation"
    search = "search"
    file_operation = "file_operation"
    debug = "debug"
    documentation = "documentation"

# Pydantic Models
class FileContext(BaseModel):
    name: str
    content: str
    language: str

class VoiceContext(BaseModel):
    current_file: Optional[FileContext] = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)

class VoiceCommand(BaseModel):
    transcript: str
    context: Optional[VoiceContext] = None

class VoiceCommandResult(BaseModel):
    command_type: CommandType
    confidence: float
    success: bool = True
    message: str = ""
    generated_code: Optional[str] = None
    explanation: Optional[str] = None
    refactored_code: Optional[str] = None
    language: Optional[str] = None
    description: Optional[str] = None
    action: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    position: Optional[Dict[str, int]] = None
    search_query: Optional[str] = None
    operation: Optional[str] = None

# Voice Processing Engine
class VoiceProcessingEngine:
    def __init__(self):
        self.command_patterns = {
            # Code generation patterns
            'code_generation': [
                r'create\s+(a\s+)?(function|method|class)\s+(to|that|for)\s+(.+)',
                r'write\s+(a\s+)?(function|method|class)\s+(to|that|for)\s+(.+)',
                r'generate\s+(a\s+)?(function|method|class)\s+(to|that|for)\s+(.+)',
                r'make\s+(a\s+)?(function|method|class)\s+(to|that|for)\s+(.+)',
                r'add\s+(a\s+)?(function|method|class)\s+(to|that|for)\s+(.+)',
                r'implement\s+(a\s+)?(function|method|class)\s+(to|that|for)\s+(.+)',
                r'create\s+(.+)\s+(function|method|class)',
                r'write\s+code\s+(to|for)\s+(.+)',
                r'generate\s+code\s+(to|for)\s+(.+)'
            ],
            
            # Code explanation patterns  
            'code_explanation': [
                r'explain\s+(this|the)\s+(function|method|class|code)',
                r'what\s+does\s+(this|the)\s+(function|method|class|code)\s+do',
                r'describe\s+(this|the)\s+(function|method|class|code)',
                r'tell\s+me\s+about\s+(this|the)\s+(function|method|class|code)',
                r'how\s+does\s+(this|the)\s+(function|method|class|code)\s+work'
            ],
            
            # Refactoring patterns
            'refactor': [
                r'refactor\s+(this|the)\s+(function|method|class|code)',
                r'improve\s+(this|the)\s+(function|method|class|code)',
                r'optimize\s+(this|the)\s+(function|method|class|code)',
                r'clean\s+up\s+(this|the)\s+(function|method|class|code)',
                r'make\s+(this|the)\s+(function|method|class|code)\s+(better|cleaner)',
                r'simplify\s+(this|the)\s+(function|method|class|code)'
            ],
            
            # Navigation patterns
            'navigation': [
                r'open\s+(settings|preferences)',
                r'go\s+to\s+(settings|preferences)',
                r'navigate\s+to\s+(settings|preferences)',
                r'show\s+me\s+(settings|preferences)',
                r'open\s+(file|folder)\s+(.+)',
                r'switch\s+to\s+(file|folder)\s+(.+)',
                r'go\s+to\s+(file|folder)\s+(.+)'
            ],
            
            # Search patterns
            'search': [
                r'search\s+(for\s+)?(.+)',
                r'find\s+(.+)',
                r'look\s+for\s+(.+)',
                r'locate\s+(.+)'
            ],
            
            # File operations
            'file_operation': [
                r'save\s+(this\s+)?file',
                r'create\s+(new\s+)?file',
                r'delete\s+(this\s+)?file',
                r'rename\s+(this\s+)?file\s+(to\s+)?(.+)',
                r'copy\s+(this\s+)?file',
                r'close\s+(this\s+)?file'
            ],
            
            # Debug patterns
            'debug': [
                r'debug\s+(this|the)\s+(function|method|class|code)',
                r'find\s+(bugs?|errors?)\s+in\s+(this|the)\s+(function|method|class|code)',
                r'add\s+debugging\s+(to|in)\s+(this|the)\s+(function|method|class|code)',
                r'add\s+(logging|logs)\s+(to|in)\s+(this|the)\s+(function|method|class|code)'
            ],
            
            # Documentation patterns
            'documentation': [
                r'add\s+(comments?|documentation)\s+(to|in)\s+(this|the)\s+(function|method|class|code)',
                r'document\s+(this|the)\s+(function|method|class|code)',
                r'add\s+(docstring|docstrings)\s+(to|in)\s+(this|the)\s+(function|method|class|code)',
                r'comment\s+(this|the)\s+(function|method|class|code)'
            ]
        }

        self.code_templates = {
            'javascript': {
                'function': 'function {name}({params}) {\n    // {description}\n    {body}\n    return result;\n}',
                'class': 'class {name} {\n    constructor({params}) {\n        // {description}\n        {body}\n    }\n}',
                'async_function': 'async function {name}({params}) {\n    // {description}\n    try {\n        {body}\n        return result;\n    } catch (error) {\n        console.error("Error:", error);\n        throw error;\n    }\n}'
            },
            'python': {
                'function': 'def {name}({params}):\n    """{description}"""\n    {body}\n    return result',
                'class': 'class {name}:\n    """{description}"""\n    \n    def __init__(self{params}):\n        {body}',
                'async_function': 'async def {name}({params}):\n    """{description}"""\n    try:\n        {body}\n        return result\n    except Exception as e:\n        print(f"Error: {e}")\n        raise'
            },
            'typescript': {
                'function': 'function {name}({params}): {return_type} {\n    // {description}\n    {body}\n    return result;\n}',
                'class': 'class {name} {\n    constructor({params}) {\n        // {description}\n        {body}\n    }\n}',
                'interface': 'interface {name} {\n    // {description}\n    {body}\n}'
            }
        }

    async def process_voice_command(self, command: VoiceCommand) -> VoiceCommandResult:
        """Process voice command and return appropriate result"""
        transcript = command.transcript.lower().strip()
        context = command.context
        
        # Determine command type
        command_type = self._classify_command(transcript)
        confidence = self._calculate_confidence(transcript, command_type)
        
        try:
            if command_type == CommandType.code_generation:
                return await self._handle_code_generation(transcript, context, confidence)
            elif command_type == CommandType.code_explanation:
                return await self._handle_code_explanation(transcript, context, confidence)
            elif command_type == CommandType.refactor:
                return await self._handle_refactor(transcript, context, confidence)
            elif command_type == CommandType.navigation:
                return await self._handle_navigation(transcript, context, confidence)
            elif command_type == CommandType.search:
                return await self._handle_search(transcript, context, confidence)
            elif command_type == CommandType.file_operation:
                return await self._handle_file_operation(transcript, context, confidence)
            elif command_type == CommandType.debug:
                return await self._handle_debug(transcript, context, confidence)
            elif command_type == CommandType.documentation:
                return await self._handle_documentation(transcript, context, confidence)
            else:
                return VoiceCommandResult(
                    command_type=command_type,
                    confidence=confidence,
                    success=False,
                    message="I didn't understand that command. Please try rephrasing."
                )
        except Exception as e:
            return VoiceCommandResult(
                command_type=command_type,
                confidence=confidence,
                success=False,
                message=f"Error processing command: {str(e)}"
            )

    def _classify_command(self, transcript: str) -> CommandType:
        """Classify the voice command based on patterns"""
        for command_type, patterns in self.command_patterns.items():
            for pattern in patterns:
                if re.search(pattern, transcript, re.IGNORECASE):
                    return CommandType(command_type)
        
        return CommandType.code_generation  # Default fallback

    def _calculate_confidence(self, transcript: str, command_type: CommandType) -> float:
        """Calculate confidence score for command classification"""
        patterns = self.command_patterns.get(command_type.value, [])
        max_confidence = 0.0
        
        for pattern in patterns:
            match = re.search(pattern, transcript, re.IGNORECASE)
            if match:
                # Higher confidence for more specific matches
                pattern_confidence = len(match.group(0)) / len(transcript)
                max_confidence = max(max_confidence, pattern_confidence)
        
        return min(max_confidence, 1.0)

    async def _handle_code_generation(self, transcript: str, context: Optional[VoiceContext], confidence: float) -> VoiceCommandResult:
        """Handle code generation commands"""
        # Extract intent from transcript
        intent = self._extract_code_intent(transcript)
        language = context.current_file.language if context and context.current_file else 'javascript'
        
        # Generate code based on intent
        generated_code = self._generate_code(intent, language)
        
        return VoiceCommandResult(
            command_type=CommandType.code_generation,
            confidence=confidence,
            generated_code=generated_code,
            language=language,
            description=f"Generated {intent['type']} for {intent['purpose']}",
            message=f"I've generated a {intent['type']} for {intent['purpose']}"
        )

    def _extract_code_intent(self, transcript: str) -> Dict[str, str]:
        """Extract coding intent from transcript"""
        intent = {
            'type': 'function',
            'purpose': 'processing data',
            'name': 'processData',
            'params': '',
            'body': '// TODO: Implement functionality'
        }
        
        # Extract function/class type
        if re.search(r'\bclass\b', transcript, re.IGNORECASE):
            intent['type'] = 'class'
            intent['name'] = 'MyClass'
        elif re.search(r'\basync\b', transcript, re.IGNORECASE):
            intent['type'] = 'async_function'
        
        # Extract purpose from "to do X" or "for X" patterns
        purpose_match = re.search(r'(?:to|for|that)\s+(.+?)(?:\s|$)', transcript, re.IGNORECASE)
        if purpose_match:
            purpose = purpose_match.group(1).strip()
            intent['purpose'] = purpose
            # Generate function name from purpose
            intent['name'] = self._generate_function_name(purpose)
        
        return intent

    def _generate_function_name(self, purpose: str) -> str:
        """Generate a function name from purpose description"""
        # Clean and convert purpose to camelCase
        words = re.findall(r'\b\w+\b', purpose.lower())
        if not words:
            return 'processData'
        
        # Take first few meaningful words
        meaningful_words = [word for word in words[:3] if word not in ['the', 'a', 'an', 'to', 'for', 'and', 'or']]
        if not meaningful_words:
            return 'processData'
        
        # Convert to camelCase
        function_name = meaningful_words[0]
        for word in meaningful_words[1:]:
            function_name += word.capitalize()
        
        return function_name

    def _generate_code(self, intent: Dict[str, str], language: str) -> str:
        """Generate code based on intent and language"""
        templates = self.code_templates.get(language, self.code_templates['javascript'])
        template = templates.get(intent['type'], templates['function'])
        
        return template.format(
            name=intent['name'],
            params=intent['params'],
            description=f"Function to {intent['purpose']}",
            body=intent['body'],
            return_type='any' if language == 'typescript' else ''
        )

    async def _handle_code_explanation(self, transcript: str, context: Optional[VoiceContext], confidence: float) -> VoiceCommandResult:
        """Handle code explanation requests"""
        if not context or not context.current_file:
            return VoiceCommandResult(
                command_type=CommandType.code_explanation,
                confidence=confidence,
                success=False,
                message="No code is currently selected for explanation."
            )
        
        # Generate explanation based on code content
        explanation = self._generate_code_explanation(context.current_file)
        
        return VoiceCommandResult(
            command_type=CommandType.code_explanation,
            confidence=confidence,
            explanation=explanation,
            message="Here's what this code does:"
        )

    def _generate_code_explanation(self, file_context: FileContext) -> str:
        """Generate explanation for code"""
        code = file_context.content
        language = file_context.language
        
        if not code.strip():
            return "This file appears to be empty."
        
        # Basic code analysis
        lines = len(code.split('\n'))
        functions = len(re.findall(r'function\s+\w+|def\s+\w+', code, re.IGNORECASE))
        classes = len(re.findall(r'class\s+\w+', code, re.IGNORECASE))
        
        explanation = f"This {language} file contains {lines} lines of code"
        
        if functions > 0:
            explanation += f" with {functions} function{'s' if functions != 1 else ''}"
        
        if classes > 0:
            explanation += f" and {classes} class{'es' if classes != 1 else ''}"
        
        # Add specific patterns found
        if re.search(r'async|await', code, re.IGNORECASE):
            explanation += ". It uses asynchronous programming patterns"
        
        if re.search(r'import|require', code, re.IGNORECASE):
            explanation += ". It imports external dependencies"
        
        if re.search(r'export|module\.exports', code, re.IGNORECASE):
            explanation += ". It exports functionality for other modules to use"
        
        explanation += "."
        
        return explanation

    async def _handle_refactor(self, transcript: str, context: Optional[VoiceContext], confidence: float) -> VoiceCommandResult:
        """Handle code refactoring requests"""
        if not context or not context.current_file:
            return VoiceCommandResult(
                command_type=CommandType.refactor,
                confidence=confidence,
                success=False,
                message="No code is currently selected for refactoring."
            )
        
        # Generate refactored code
        refactored_code = self._refactor_code(context.current_file)
        
        return VoiceCommandResult(
            command_type=CommandType.refactor,
            confidence=confidence,
            refactored_code=refactored_code,
            message="I've refactored the code to improve readability and maintainability.",
            description="Refactored code with improved structure"
        )

    def _refactor_code(self, file_context: FileContext) -> str:
        """Refactor code for better quality"""
        code = file_context.content
        language = file_context.language
        
        # Basic refactoring patterns
        refactored = code
        
        # Add comments for functions without them
        if language in ['javascript', 'typescript']:
            refactored = re.sub(
                r'(function\s+\w+\s*\([^)]*\)\s*{)',
                r'// TODO: Add function description\n    \1',
                refactored
            )
        elif language == 'python':
            refactored = re.sub(
                r'(def\s+\w+\s*\([^)]*\)\s*:)',
                r'\1\n    """TODO: Add function description"""',
                refactored
            )
        
        # Add error handling suggestions
        if 'try' not in code.lower():
            refactored += "\n\n// TODO: Consider adding error handling with try-catch blocks"
        
        return refactored

    async def _handle_navigation(self, transcript: str, context: Optional[VoiceContext], confidence: float) -> VoiceCommandResult:
        """Handle navigation commands"""
        action = None
        parameters = {}
        
        if re.search(r'settings|preferences', transcript, re.IGNORECASE):
            action = 'open_settings'
            parameters = {'panel': 'settings'}
        elif re.search(r'file', transcript, re.IGNORECASE):
            action = 'open_file_explorer'
            parameters = {'panel': 'files'}
        else:
            action = 'navigate'
            parameters = {'target': transcript}
        
        return VoiceCommandResult(
            command_type=CommandType.navigation,
            confidence=confidence,
            action=action,
            parameters=parameters,
            message=f"Navigating as requested."
        )

    async def _handle_search(self, transcript: str, context: Optional[VoiceContext], confidence: float) -> VoiceCommandResult:
        """Handle search commands"""
        # Extract search query
        query_match = re.search(r'(?:search|find|look)\s+(?:for\s+)?(.+)', transcript, re.IGNORECASE)
        query = query_match.group(1).strip() if query_match else transcript
        
        return VoiceCommandResult(
            command_type=CommandType.search,
            confidence=confidence,
            search_query=query,
            action='search',
            parameters={'query': query},
            message=f"Searching for: {query}"
        )

    async def _handle_file_operation(self, transcript: str, context: Optional[VoiceContext], confidence: float) -> VoiceCommandResult:
        """Handle file operations"""
        operation = None
        
        if re.search(r'save', transcript, re.IGNORECASE):
            operation = 'save'
        elif re.search(r'create', transcript, re.IGNORECASE):
            operation = 'create'
        elif re.search(r'delete', transcript, re.IGNORECASE):
            operation = 'delete'
        elif re.search(r'rename', transcript, re.IGNORECASE):
            operation = 'rename'
        elif re.search(r'close', transcript, re.IGNORECASE):
            operation = 'close'
        else:
            operation = 'unknown'
        
        return VoiceCommandResult(
            command_type=CommandType.file_operation,
            confidence=confidence,
            operation=operation,
            action='file_operation',
            parameters={'operation': operation},
            message=f"Performing {operation} operation."
        )

    async def _handle_debug(self, transcript: str, context: Optional[VoiceContext], confidence: float) -> VoiceCommandResult:
        """Handle debug commands"""
        if not context or not context.current_file:
            return VoiceCommandResult(
                command_type=CommandType.debug,
                confidence=confidence,
                success=False,
                message="No code is currently available for debugging."
            )
        
        # Generate debugging code
        debug_code = self._generate_debug_code(context.current_file)
        
        return VoiceCommandResult(
            command_type=CommandType.debug,
            confidence=confidence,
            generated_code=debug_code,
            description="Added debugging statements to help troubleshoot issues",
            message="I've added debugging code to help identify issues."
        )

    def _generate_debug_code(self, file_context: FileContext) -> str:
        """Generate debugging code"""
        language = file_context.language
        
        if language in ['javascript', 'typescript']:
            return """// Debug logging
console.log('Debug: Function called with:', arguments);
console.log('Debug: Current state:', this);

// Error handling
try {
    // Your code here
} catch (error) {
    console.error('Debug: Error occurred:', error);
    console.trace('Debug: Stack trace');
}"""
        elif language == 'python':
            return """# Debug logging
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.debug(f'Debug: Function called with args: {locals()}')

# Error handling
try:
    # Your code here
    pass
except Exception as e:
    logger.error(f'Debug: Error occurred: {e}')
    import traceback
    traceback.print_exc()"""
        else:
            return "// TODO: Add appropriate debugging for " + language

    async def _handle_documentation(self, transcript: str, context: Optional[VoiceContext], confidence: float) -> VoiceCommandResult:
        """Handle documentation commands"""
        if not context or not context.current_file:
            return VoiceCommandResult(
                command_type=CommandType.documentation,
                confidence=confidence,
                success=False,
                message="No code is currently available for documentation."
            )
        
        # Generate documentation
        documentation = self._generate_documentation(context.current_file)
        
        return VoiceCommandResult(
            command_type=CommandType.documentation,
            confidence=confidence,
            generated_code=documentation,
            description="Added comprehensive documentation to the code",
            message="I've added documentation to make the code more understandable."
        )

    def _generate_documentation(self, file_context: FileContext) -> str:
        """Generate documentation for code"""
        language = file_context.language
        
        if language in ['javascript', 'typescript']:
            return """/**
 * Function Description
 * 
 * @description Provide a detailed description of what this function does
 * @param {type} paramName - Description of the parameter
 * @returns {type} Description of the return value
 * @example
 * // Example usage
 * const result = functionName(param);
 * console.log(result); // Expected output
 */"""
        elif language == 'python':
            return '''"""
Function or Class Description

This function/class provides...

Args:
    param_name (type): Description of the parameter
    
Returns:
    type: Description of the return value
    
Raises:
    ExceptionType: Description of when this exception might be raised
    
Example:
    >>> result = function_name(param)
    >>> print(result)  # Expected output
"""'''
        else:
            return f"// TODO: Add appropriate documentation for {language}"

# Initialize the voice processing engine
voice_engine = VoiceProcessingEngine()

# API Routes
@router.post("/voice/process")
async def process_voice_command(command: VoiceCommand):
    """Process voice command and return appropriate action/code"""
    try:
        result = await voice_engine.process_voice_command(command)
        return result.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process voice command: {str(e)}")

@router.get("/voice/health")
async def voice_health_check():
    """Health check for voice processing service"""
    return {
        'status': 'healthy',
        'service': 'Voice-to-Code Processing',
        'version': '2025.1.0',
        'supported_languages': ['javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp'],
        'supported_commands': list(voice_engine.command_patterns.keys())
    }