"""
Extensions Marketplace API Routes
Provides endpoints for browsing, installing, and managing VS Code compatible extensions
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import json
import aiofiles
import os
from datetime import datetime

router = APIRouter()

# Pydantic models
class Extension(BaseModel):
    id: str = Field(..., description="Extension identifier")
    name: str = Field(..., description="Display name")
    publisher: str = Field(..., description="Publisher name")
    version: str = Field(..., description="Current version")
    description: str = Field(..., description="Extension description")
    category: str = Field(..., description="Extension category")
    tags: List[str] = Field(default=[], description="Extension tags")
    icon: Optional[str] = Field(None, description="Extension icon URL")
    downloads: int = Field(default=0, description="Download count")
    rating: float = Field(default=0.0, description="Average rating")
    installed: bool = Field(default=False, description="Installation status")
    compatible: bool = Field(default=True, description="AETHERFLOW compatibility")

class ExtensionInstallRequest(BaseModel):
    extension_id: str
    version: Optional[str] = None

class ExtensionCategory(BaseModel):
    id: str
    name: str
    description: str
    count: int

# Mock extensions data (in production, this would come from VS Code marketplace API)
MOCK_EXTENSIONS = [
    {
        "id": "ms-python.python",
        "name": "Python",
        "publisher": "Microsoft",
        "version": "2024.0.1",
        "description": "IntelliSense, Pylint, debugging, code navigation, code formatting, Jupyter notebook support",
        "category": "Programming Languages",
        "tags": ["python", "jupyter", "debugging"],
        "icon": "https://ms-python.gallerycdn.vsassets.io/extensions/ms-python/python/2024.0.1/1704736649414/Microsoft.VisualStudio.Services.Icons.Default",
        "downloads": 89562341,
        "rating": 4.5,
        "installed": False,
        "compatible": True
    },
    {
        "id": "esbenp.prettier-vscode",
        "name": "Prettier - Code formatter",
        "publisher": "Prettier",
        "version": "10.1.0",
        "description": "Code formatter using prettier",
        "category": "Formatters",
        "tags": ["formatter", "javascript", "typescript"],
        "icon": "https://esbenp.gallerycdn.vsassets.io/extensions/esbenp/prettier-vscode/10.1.0/1687714943194/Microsoft.VisualStudio.Services.Icons.Default",
        "downloads": 34567890,
        "rating": 4.7,
        "installed": True,
        "compatible": True
    },
    {
        "id": "ms-vscode.vscode-typescript-next",
        "name": "TypeScript Importer",
        "publisher": "Microsoft",
        "version": "5.0.4",
        "description": "Provides TypeScript and JavaScript language support",
        "category": "Programming Languages",
        "tags": ["typescript", "javascript", "intellisense"],
        "icon": "https://ms-vscode.gallerycdn.vsassets.io/extensions/ms-vscode/vscode-typescript-next/5.0.4/1704202847644/Microsoft.VisualStudio.Services.Icons.Default",
        "downloads": 45123789,
        "rating": 4.6,
        "installed": False,
        "compatible": True
    },
    {
        "id": "bradlc.vscode-tailwindcss",
        "name": "Tailwind CSS IntelliSense",
        "publisher": "Brad Cornes",
        "version": "0.10.5",
        "description": "Intelligent Tailwind CSS tooling for VS Code",
        "category": "Themes",
        "tags": ["tailwind", "css", "autocomplete"],
        "icon": "https://bradlc.gallerycdn.vsassets.io/extensions/bradlc/vscode-tailwindcss/0.10.5/1703159370066/Microsoft.VisualStudio.Services.Icons.Default",
        "downloads": 12345678,
        "rating": 4.8,
        "installed": False,
        "compatible": True
    },
    {
        "id": "github.copilot",
        "name": "GitHub Copilot",
        "publisher": "GitHub",
        "version": "1.156.0",
        "description": "AI-powered code suggestions",
        "category": "Machine Learning",
        "tags": ["ai", "copilot", "suggestions"],
        "icon": "https://github.gallerycdn.vsassets.io/extensions/github/copilot/1.156.0/1704285742663/Microsoft.VisualStudio.Services.Icons.Default",
        "downloads": 23456789,
        "rating": 4.4,
        "installed": False,
        "compatible": False  # Incompatible with AETHERFLOW (we have our own AI)
    },
    {
        "id": "ms-vscode.vscode-json",
        "name": "JSON Language Features",
        "publisher": "Microsoft",
        "version": "1.0.1",
        "description": "Provides rich language support for JSON",
        "category": "Programming Languages",
        "tags": ["json", "language"],
        "icon": "https://ms-vscode.gallerycdn.vsassets.io/extensions/ms-vscode/vscode-json/1.0.1/1604945616740/Microsoft.VisualStudio.Services.Icons.Default",
        "downloads": 67890123,
        "rating": 4.3,
        "installed": True,
        "compatible": True
    }
]

EXTENSION_CATEGORIES = [
    {"id": "programming-languages", "name": "Programming Languages", "description": "Language support and syntax highlighting", "count": 245},
    {"id": "themes", "name": "Themes", "description": "Color themes and UI customization", "count": 189},
    {"id": "formatters", "name": "Formatters", "description": "Code formatting tools", "count": 67},
    {"id": "debuggers", "name": "Debuggers", "description": "Debugging tools and extensions", "count": 45},
    {"id": "machine-learning", "name": "Machine Learning", "description": "AI and ML development tools", "count": 78},
    {"id": "snippets", "name": "Snippets", "description": "Code snippets and templates", "count": 156},
    {"id": "keymaps", "name": "Keymaps", "description": "Keyboard shortcuts from other editors", "count": 23},
    {"id": "other", "name": "Other", "description": "Miscellaneous extensions", "count": 234}
]

@router.get("/extensions", response_model=List[Extension])
async def get_extensions(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "downloads",
    installed_only: bool = False
):
    """Get list of available extensions with filtering and sorting"""
    try:
        extensions = MOCK_EXTENSIONS.copy()
        
        # Apply filters
        if category and category != "all":
            extensions = [ext for ext in extensions if ext["category"].lower().replace(" ", "-") == category]
        
        if search:
            search_lower = search.lower()
            extensions = [ext for ext in extensions 
                         if search_lower in ext["name"].lower() 
                         or search_lower in ext["description"].lower()
                         or any(search_lower in tag.lower() for tag in ext["tags"])]
        
        if installed_only:
            extensions = [ext for ext in extensions if ext["installed"]]
        
        # Apply sorting
        if sort_by == "downloads":
            extensions.sort(key=lambda x: x["downloads"], reverse=True)
        elif sort_by == "rating":
            extensions.sort(key=lambda x: x["rating"], reverse=True)
        elif sort_by == "name":
            extensions.sort(key=lambda x: x["name"])
        elif sort_by == "recent":
            # For demo purposes, reverse the order
            extensions.reverse()
        
        return [Extension(**ext) for ext in extensions]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching extensions: {str(e)}")

@router.get("/extensions/categories", response_model=List[ExtensionCategory])
async def get_extension_categories():
    """Get list of extension categories"""
    try:
        return [ExtensionCategory(**cat) for cat in EXTENSION_CATEGORIES]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")

@router.get("/extensions/{extension_id}", response_model=Extension)
async def get_extension_details(extension_id: str):
    """Get detailed information about a specific extension"""
    try:
        extension = next((ext for ext in MOCK_EXTENSIONS if ext["id"] == extension_id), None)
        if not extension:
            raise HTTPException(status_code=404, detail="Extension not found")
        
        return Extension(**extension)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching extension details: {str(e)}")

@router.post("/extensions/install")
async def install_extension(request: ExtensionInstallRequest):
    """Install an extension"""
    try:
        extension = next((ext for ext in MOCK_EXTENSIONS if ext["id"] == request.extension_id), None)
        if not extension:
            raise HTTPException(status_code=404, detail="Extension not found")
        
        if not extension["compatible"]:
            raise HTTPException(status_code=400, detail="Extension is not compatible with AETHERFLOW")
        
        # In production, this would actually install the extension
        # For now, just mark it as installed
        extension["installed"] = True
        
        return {
            "success": True,
            "message": f"Extension '{extension['name']}' installed successfully",
            "extension_id": request.extension_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error installing extension: {str(e)}")

@router.delete("/extensions/{extension_id}")
async def uninstall_extension(extension_id: str):
    """Uninstall an extension"""
    try:
        extension = next((ext for ext in MOCK_EXTENSIONS if ext["id"] == extension_id), None)
        if not extension:
            raise HTTPException(status_code=404, detail="Extension not found")
        
        if not extension["installed"]:
            raise HTTPException(status_code=400, detail="Extension is not installed")
        
        # Mark as uninstalled
        extension["installed"] = False
        
        return {
            "success": True,
            "message": f"Extension '{extension['name']}' uninstalled successfully",
            "extension_id": extension_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uninstalling extension: {str(e)}")

@router.get("/extensions/{extension_id}/readme")
async def get_extension_readme(extension_id: str):
    """Get extension README content"""
    try:
        extension = next((ext for ext in MOCK_EXTENSIONS if ext["id"] == extension_id), None)
        if not extension:
            raise HTTPException(status_code=404, detail="Extension not found")
        
        # Mock README content
        readme_content = f"""# {extension['name']}

{extension['description']}

## Features

- Advanced language support
- IntelliSense and autocompletion
- Error detection and diagnostics
- Code formatting and linting

## Installation

This extension is compatible with AETHERFLOW IDE and can be installed directly from the marketplace.

## Usage

Once installed, the extension will automatically activate when working with relevant file types.

## Requirements

- AETHERFLOW IDE v2.0 or higher
- Node.js (for some features)

## Release Notes

### Version {extension['version']}

- Latest features and bug fixes
- Improved performance
- Enhanced compatibility

For more information, visit the [extension homepage](https://marketplace.visualstudio.com/).
"""
        
        return {
            "content": readme_content,
            "format": "markdown"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching README: {str(e)}")

@router.get("/extensions/installed/count")
async def get_installed_extensions_count():
    """Get count of installed extensions"""
    try:
        installed_count = len([ext for ext in MOCK_EXTENSIONS if ext["installed"]])
        return {"count": installed_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error counting installed extensions: {str(e)}")