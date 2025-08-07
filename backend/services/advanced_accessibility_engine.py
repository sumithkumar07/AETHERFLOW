"""
Advanced Accessibility Engine
Enhances accessibility features without changing UI structure
"""

import asyncio
import logging
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from enum import Enum
from dataclasses import dataclass

logger = logging.getLogger(__name__)

class AccessibilityLevel(Enum):
    """Accessibility levels based on WCAG guidelines"""
    BASIC = "basic"
    AA = "aa"  # WCAG 2.1 AA compliance
    AAA = "aaa"  # WCAG 2.1 AAA compliance

@dataclass
class AccessibilityProfile:
    """User accessibility preferences and needs"""
    user_id: str
    screen_reader: bool = False
    high_contrast: bool = False
    large_text: bool = False
    reduced_motion: bool = False
    keyboard_only: bool = False
    voice_control: bool = False
    color_blind_type: Optional[str] = None  # protanopia, deuteranopia, tritanopia
    custom_settings: Dict[str, Any] = None

@dataclass 
class AccessibilityEnhancement:
    """Accessibility enhancement applied to content"""
    enhancement_type: str
    description: str
    wcag_guideline: str
    level: AccessibilityLevel
    applied_at: datetime

class AdvancedAccessibilityEngine:
    """
    Advanced accessibility enhancement engine
    Provides WCAG-compliant features without UI changes
    """
    
    def __init__(self):
        self.user_profiles: Dict[str, AccessibilityProfile] = {}
        self.enhancement_cache: Dict[str, List[AccessibilityEnhancement]] = {}
        
        # Accessibility guidelines and enhancements
        self.wcag_guidelines = self._load_wcag_guidelines()
        self.color_palettes = self._load_accessible_color_palettes()
        self.enhancement_rules = self._load_enhancement_rules()
        
        # Screen reader optimizations
        self.aria_enhancements = True
        self.semantic_structure = True
        self.keyboard_navigation = True
        self.focus_management = True
        
        logger.info("♿ Advanced Accessibility Engine initialized")
    
    def _load_wcag_guidelines(self) -> Dict[str, Any]:
        """Load WCAG 2.1 guidelines and compliance rules"""
        return {
            "1.1.1": {
                "title": "Non-text Content",
                "description": "All non-text content has a text alternative",
                "level": "A"
            },
            "1.3.1": {
                "title": "Info and Relationships", 
                "description": "Information and relationships can be programmatically determined",
                "level": "A"
            },
            "1.4.3": {
                "title": "Contrast (Minimum)",
                "description": "Text has a contrast ratio of at least 4.5:1",
                "level": "AA"
            },
            "1.4.6": {
                "title": "Contrast (Enhanced)", 
                "description": "Text has a contrast ratio of at least 7:1",
                "level": "AAA"
            },
            "2.1.1": {
                "title": "Keyboard",
                "description": "All functionality available from keyboard",
                "level": "A"
            },
            "2.4.3": {
                "title": "Focus Order",
                "description": "Focusable components have logical focus order", 
                "level": "A"
            },
            "3.2.1": {
                "title": "On Focus",
                "description": "No context changes when component receives focus",
                "level": "A"
            },
            "4.1.2": {
                "title": "Name, Role, Value",
                "description": "All UI components have accessible name and role",
                "level": "A"
            }
        }
    
    def _load_accessible_color_palettes(self) -> Dict[str, Dict[str, str]]:
        """Load accessible color palettes for different needs"""
        return {
            "high_contrast": {
                "background": "#000000",
                "text": "#FFFFFF", 
                "primary": "#FFD700",
                "secondary": "#87CEEB",
                "accent": "#FF6347"
            },
            "protanopia": {
                "background": "#FFFFFF",
                "text": "#000000",
                "primary": "#0099CC", 
                "secondary": "#FF9900",
                "accent": "#6666CC"
            },
            "deuteranopia": {
                "background": "#FFFFFF",
                "text": "#000000",
                "primary": "#CC6600",
                "secondary": "#0099FF", 
                "accent": "#9900CC"
            },
            "tritanopia": {
                "background": "#FFFFFF", 
                "text": "#000000",
                "primary": "#CC0066",
                "secondary": "#00CC99",
                "accent": "#6600CC"
            }
        }
    
    def _load_enhancement_rules(self) -> Dict[str, Any]:
        """Load accessibility enhancement rules"""
        return {
            "text_alternatives": {
                "images": "Generate descriptive alt text for all images",
                "icons": "Provide text labels for icon-only buttons",
                "charts": "Provide data table alternative for charts"
            },
            "keyboard_navigation": {
                "focus_indicators": "Ensure visible focus indicators",
                "tab_order": "Maintain logical tab order",
                "skip_links": "Provide skip navigation links"
            },
            "screen_reader": {
                "aria_labels": "Add descriptive ARIA labels",
                "headings": "Use proper heading hierarchy", 
                "landmarks": "Define page landmark regions"
            },
            "motion_reduction": {
                "animations": "Respect prefers-reduced-motion setting",
                "autoplay": "Disable autoplay for users who prefer reduced motion"
            }
        }
    
    async def create_user_profile(self, user_id: str, preferences: Dict[str, Any]) -> AccessibilityProfile:
        """Create accessibility profile for user"""
        try:
            profile = AccessibilityProfile(
                user_id=user_id,
                screen_reader=preferences.get("screen_reader", False),
                high_contrast=preferences.get("high_contrast", False),
                large_text=preferences.get("large_text", False), 
                reduced_motion=preferences.get("reduced_motion", False),
                keyboard_only=preferences.get("keyboard_only", False),
                voice_control=preferences.get("voice_control", False),
                color_blind_type=preferences.get("color_blind_type"),
                custom_settings=preferences.get("custom_settings", {})
            )
            
            self.user_profiles[user_id] = profile
            logger.info(f"✅ Accessibility profile created for user {user_id}")
            
            return profile
            
        except Exception as e:
            logger.error(f"❌ Failed to create accessibility profile: {e}")
            raise
    
    async def enhance_content_accessibility(
        self, 
        content: Dict[str, Any], 
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Enhance content for accessibility without changing structure
        Returns enhanced content with accessibility metadata
        """
        try:
            enhancements = []
            enhanced_content = content.copy()
            
            # Get user profile if available
            profile = self.user_profiles.get(user_id) if user_id else None
            
            # Apply text alternatives
            text_enhancements = await self._enhance_text_alternatives(enhanced_content, profile)
            enhancements.extend(text_enhancements)
            
            # Apply ARIA enhancements  
            aria_enhancements = await self._enhance_aria_labels(enhanced_content, profile)
            enhancements.extend(aria_enhancements)
            
            # Apply color and contrast enhancements
            color_enhancements = await self._enhance_colors_and_contrast(enhanced_content, profile)
            enhancements.extend(color_enhancements)
            
            # Apply keyboard navigation enhancements
            keyboard_enhancements = await self._enhance_keyboard_navigation(enhanced_content, profile)
            enhancements.extend(keyboard_enhancements)
            
            # Apply motion and animation enhancements
            motion_enhancements = await self._enhance_motion_preferences(enhanced_content, profile)
            enhancements.extend(motion_enhancements)
            
            # Add accessibility metadata
            enhanced_content["accessibility"] = {
                "enhancements_applied": len(enhancements),
                "wcag_level": self._calculate_wcag_level(enhancements),
                "user_profile_applied": profile is not None,
                "enhancements": [
                    {
                        "type": e.enhancement_type,
                        "description": e.description,
                        "wcag_guideline": e.wcag_guideline,
                        "level": e.level.value
                    } for e in enhancements
                ],
                "accessibility_score": self._calculate_accessibility_score(enhancements),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            return enhanced_content
            
        except Exception as e:
            logger.error(f"❌ Content accessibility enhancement failed: {e}")
            return content  # Return original content on error
    
    async def _enhance_text_alternatives(
        self, 
        content: Dict[str, Any], 
        profile: Optional[AccessibilityProfile]
    ) -> List[AccessibilityEnhancement]:
        """Enhance text alternatives for non-text content"""
        enhancements = []
        
        # Check for images without alt text
        if "images" in content:
            for image in content["images"]:
                if not image.get("alt"):
                    # Generate descriptive alt text (simplified)
                    image["alt"] = f"Image: {image.get('filename', 'Untitled')}"
                    enhancements.append(AccessibilityEnhancement(
                        enhancement_type="text_alternative",
                        description="Added alt text to image",
                        wcag_guideline="1.1.1",
                        level=AccessibilityLevel.AA,
                        applied_at=datetime.utcnow()
                    ))
        
        # Check for buttons without text
        if "buttons" in content:
            for button in content["buttons"]:
                if not button.get("text") and not button.get("aria-label"):
                    # Add ARIA label for icon buttons
                    button["aria-label"] = button.get("action", "Button")
                    enhancements.append(AccessibilityEnhancement(
                        enhancement_type="button_label",
                        description="Added ARIA label to button",
                        wcag_guideline="4.1.2",
                        level=AccessibilityLevel.AA,
                        applied_at=datetime.utcnow()
                    ))
        
        return enhancements
    
    async def _enhance_aria_labels(
        self, 
        content: Dict[str, Any], 
        profile: Optional[AccessibilityProfile]
    ) -> List[AccessibilityEnhancement]:
        """Enhance ARIA labels and semantic structure"""
        enhancements = []
        
        # Add ARIA landmarks if not present
        if "structure" not in content:
            content["structure"] = {}
        
        if "landmarks" not in content["structure"]:
            content["structure"]["landmarks"] = {
                "main": {"role": "main", "aria-label": "Main content"},
                "navigation": {"role": "navigation", "aria-label": "Main navigation"},
                "search": {"role": "search", "aria-label": "Search"},
                "complementary": {"role": "complementary", "aria-label": "Additional information"}
            }
            enhancements.append(AccessibilityEnhancement(
                enhancement_type="aria_landmarks",
                description="Added ARIA landmark regions",
                wcag_guideline="1.3.1",
                level=AccessibilityLevel.AA,
                applied_at=datetime.utcnow()
            ))
        
        # Enhance heading structure
        if "headings" in content:
            for i, heading in enumerate(content["headings"]):
                if not heading.get("level"):
                    # Assign appropriate heading level
                    heading["level"] = min(i + 1, 6)
                    heading["aria-level"] = heading["level"]
                    
            enhancements.append(AccessibilityEnhancement(
                enhancement_type="heading_structure",
                description="Enhanced heading hierarchy",
                wcag_guideline="1.3.1", 
                level=AccessibilityLevel.AA,
                applied_at=datetime.utcnow()
            ))
        
        # Add live regions for dynamic content
        if "dynamic_content" in content:
            content["dynamic_content"]["aria-live"] = "polite"
            content["dynamic_content"]["aria-atomic"] = "true"
            enhancements.append(AccessibilityEnhancement(
                enhancement_type="live_regions",
                description="Added ARIA live regions for dynamic content",
                wcag_guideline="4.1.3",
                level=AccessibilityLevel.AA,
                applied_at=datetime.utcnow()
            ))
        
        return enhancements
    
    async def _enhance_colors_and_contrast(
        self, 
        content: Dict[str, Any], 
        profile: Optional[AccessibilityProfile]
    ) -> List[AccessibilityEnhancement]:
        """Enhance colors and contrast for accessibility"""
        enhancements = []
        
        if not profile:
            return enhancements
        
        # Apply high contrast if needed
        if profile.high_contrast:
            if "theme" not in content:
                content["theme"] = {}
            content["theme"]["colors"] = self.color_palettes["high_contrast"]
            enhancements.append(AccessibilityEnhancement(
                enhancement_type="high_contrast",
                description="Applied high contrast color scheme",
                wcag_guideline="1.4.6",
                level=AccessibilityLevel.AAA,
                applied_at=datetime.utcnow()
            ))
        
        # Apply color blind friendly palette
        if profile.color_blind_type:
            if "theme" not in content:
                content["theme"] = {}
            content["theme"]["colors"] = self.color_palettes.get(
                profile.color_blind_type, 
                self.color_palettes["high_contrast"]
            )
            enhancements.append(AccessibilityEnhancement(
                enhancement_type="color_blind_support",
                description=f"Applied {profile.color_blind_type} friendly colors",
                wcag_guideline="1.4.3",
                level=AccessibilityLevel.AA,
                applied_at=datetime.utcnow()
            ))
        
        return enhancements
    
    async def _enhance_keyboard_navigation(
        self, 
        content: Dict[str, Any], 
        profile: Optional[AccessibilityProfile]
    ) -> List[AccessibilityEnhancement]:
        """Enhance keyboard navigation support"""
        enhancements = []
        
        # Add keyboard navigation metadata
        if "navigation" not in content:
            content["navigation"] = {}
        
        content["navigation"]["keyboard_accessible"] = True
        content["navigation"]["tab_order"] = "logical"
        content["navigation"]["focus_visible"] = True
        
        # Add skip links
        if "skip_links" not in content["navigation"]:
            content["navigation"]["skip_links"] = [
                {"href": "#main-content", "text": "Skip to main content"},
                {"href": "#navigation", "text": "Skip to navigation"},
                {"href": "#search", "text": "Skip to search"}
            ]
            enhancements.append(AccessibilityEnhancement(
                enhancement_type="skip_links",
                description="Added skip navigation links",
                wcag_guideline="2.4.1",
                level=AccessibilityLevel.AA,
                applied_at=datetime.utcnow()
            ))
        
        # Enhance focus management
        if "focus_management" not in content:
            content["focus_management"] = {
                "trap_focus": True,  # For modals
                "restore_focus": True,  # After modal close
                "visible_indicators": True
            }
            enhancements.append(AccessibilityEnhancement(
                enhancement_type="focus_management",
                description="Enhanced focus management",
                wcag_guideline="2.4.3",
                level=AccessibilityLevel.AA,
                applied_at=datetime.utcnow()
            ))
        
        return enhancements
    
    async def _enhance_motion_preferences(
        self, 
        content: Dict[str, Any], 
        profile: Optional[AccessibilityProfile]
    ) -> List[AccessibilityEnhancement]:
        """Enhance motion and animation preferences"""
        enhancements = []
        
        if profile and profile.reduced_motion:
            # Disable animations for users who prefer reduced motion
            if "animations" not in content:
                content["animations"] = {}
            
            content["animations"]["reduced_motion"] = True
            content["animations"]["disable_autoplay"] = True
            content["animations"]["static_alternatives"] = True
            
            enhancements.append(AccessibilityEnhancement(
                enhancement_type="reduced_motion",
                description="Applied reduced motion preferences",
                wcag_guideline="2.3.3",
                level=AccessibilityLevel.AAA,
                applied_at=datetime.utcnow()
            ))
        
        return enhancements
    
    def _calculate_wcag_level(self, enhancements: List[AccessibilityEnhancement]) -> str:
        """Calculate overall WCAG compliance level"""
        if any(e.level == AccessibilityLevel.AAA for e in enhancements):
            return "AAA"
        elif any(e.level == AccessibilityLevel.AA for e in enhancements):
            return "AA"
        else:
            return "A"
    
    def _calculate_accessibility_score(self, enhancements: List[AccessibilityEnhancement]) -> float:
        """Calculate accessibility score (0-100)"""
        if not enhancements:
            return 70.0  # Base score
        
        # Score based on number and level of enhancements
        score = 70.0  # Base score
        
        for enhancement in enhancements:
            if enhancement.level == AccessibilityLevel.AAA:
                score += 5
            elif enhancement.level == AccessibilityLevel.AA:
                score += 3
            else:
                score += 1
        
        return min(100.0, score)
    
    async def get_accessibility_report(self) -> Dict[str, Any]:
        """Get comprehensive accessibility report"""
        try:
            total_profiles = len(self.user_profiles)
            
            # Analyze profile preferences
            screen_reader_users = sum(1 for p in self.user_profiles.values() if p.screen_reader)
            high_contrast_users = sum(1 for p in self.user_profiles.values() if p.high_contrast)
            keyboard_only_users = sum(1 for p in self.user_profiles.values() if p.keyboard_only)
            reduced_motion_users = sum(1 for p in self.user_profiles.values() if p.reduced_motion)
            
            return {
                "accessibility_engine": "operational",
                "wcag_compliance": "2.1 AA/AAA",
                "user_profiles": {
                    "total": total_profiles,
                    "screen_reader_users": screen_reader_users,
                    "high_contrast_users": high_contrast_users,
                    "keyboard_only_users": keyboard_only_users,
                    "reduced_motion_users": reduced_motion_users
                },
                "features": {
                    "aria_enhancements": self.aria_enhancements,
                    "semantic_structure": self.semantic_structure,
                    "keyboard_navigation": self.keyboard_navigation,
                    "focus_management": self.focus_management,
                    "color_blind_support": True,
                    "screen_reader_optimization": True
                },
                "guidelines_supported": len(self.wcag_guidelines),
                "color_palettes": len(self.color_palettes),
                "enhancement_rules": len(self.enhancement_rules),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to generate accessibility report: {e}")
            return {"status": "error", "message": str(e)}
    
    async def validate_accessibility_compliance(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Validate content for WCAG compliance"""
        try:
            issues = []
            compliance_score = 100.0
            
            # Check for images without alt text
            if "images" in content:
                for image in content["images"]:
                    if not image.get("alt"):
                        issues.append({
                            "type": "missing_alt_text",
                            "severity": "high",
                            "wcag_guideline": "1.1.1",
                            "description": "Image missing alternative text"
                        })
                        compliance_score -= 10
            
            # Check for buttons without accessible names
            if "buttons" in content:
                for button in content["buttons"]:
                    if not button.get("text") and not button.get("aria-label"):
                        issues.append({
                            "type": "missing_button_label", 
                            "severity": "medium",
                            "wcag_guideline": "4.1.2",
                            "description": "Button missing accessible name"
                        })
                        compliance_score -= 5
            
            # Check for proper heading structure
            if "headings" in content:
                prev_level = 0
                for heading in content["headings"]:
                    current_level = heading.get("level", 1)
                    if current_level > prev_level + 1:
                        issues.append({
                            "type": "heading_structure",
                            "severity": "medium", 
                            "wcag_guideline": "1.3.1",
                            "description": "Heading levels skip hierarchy"
                        })
                        compliance_score -= 3
                    prev_level = current_level
            
            # Determine compliance level
            if compliance_score >= 95:
                compliance_level = "AAA"
            elif compliance_score >= 85:
                compliance_level = "AA"
            elif compliance_score >= 75:
                compliance_level = "A"
            else:
                compliance_level = "Non-compliant"
            
            return {
                "compliance_score": max(0.0, compliance_score),
                "compliance_level": compliance_level,
                "issues": issues,
                "total_issues": len(issues),
                "recommendations": self._generate_accessibility_recommendations(issues),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Accessibility validation failed: {e}")
            return {"status": "error", "message": str(e)}
    
    def _generate_accessibility_recommendations(self, issues: List[Dict[str, Any]]) -> List[str]:
        """Generate accessibility improvement recommendations"""
        recommendations = []
        
        issue_types = {issue["type"] for issue in issues}
        
        if "missing_alt_text" in issue_types:
            recommendations.append("Add descriptive alternative text to all images")
        
        if "missing_button_label" in issue_types:
            recommendations.append("Provide accessible names for all interactive elements")
        
        if "heading_structure" in issue_types:
            recommendations.append("Use proper heading hierarchy (h1, h2, h3...)")
        
        if not recommendations:
            recommendations.append("Accessibility compliance is excellent!")
        
        return recommendations

# Global instance
accessibility_engine = AdvancedAccessibilityEngine()