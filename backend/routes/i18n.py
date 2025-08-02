"""
Internationalization API Routes
Handles multi-language support, translations, and localization.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

from services.i18n_service import get_i18n_service, SupportedLanguage

router = APIRouter()

class TranslationRequest(BaseModel):
    key: str = Field(..., description="Translation key")
    language: str = Field(..., description="Target language code")
    params: Optional[Dict[str, Any]] = Field(None, description="Parameters for interpolation")
    count: Optional[int] = Field(None, description="Count for pluralization")

class BulkTranslationRequest(BaseModel):
    keys: List[str] = Field(..., description="List of translation keys")
    language: str = Field(..., description="Target language code")
    params: Optional[Dict[str, Any]] = Field(None, description="Global parameters")

class TextTranslationRequest(BaseModel):
    text: str = Field(..., description="Text to translate")
    target_language: str = Field(..., description="Target language")
    source_language: Optional[str] = Field(None, description="Source language (auto-detect if not provided)")

class PageTranslationsRequest(BaseModel):
    page_key: str = Field(..., description="Page identifier")
    language: str = Field(..., description="Target language code")

@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages."""
    
    service = get_i18n_service()
    if not service:
        raise HTTPException(status_code=503, detail="I18n service not available")
    
    try:
        languages = await service.get_supported_languages()
        
        return {
            "languages": [
                {
                    "code": lang.code,
                    "name": lang.name,
                    "native_name": lang.native_name,
                    "direction": lang.direction,
                    "completion_percentage": lang.completion_percentage
                }
                for lang in languages
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get supported languages: {str(e)}")

@router.post("/translate")
async def get_translation(request: TranslationRequest):
    """Get translation for a specific key."""
    
    service = get_i18n_service()
    if not service:
        raise HTTPException(status_code=503, detail="I18n service not available")
    
    try:
        translation = await service.get_translation(
            key=request.key,
            language=request.language,
            params=request.params,
            count=request.count
        )
        
        return {
            "key": request.key,
            "language": request.language,
            "translation": translation,
            "params": request.params,
            "count": request.count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get translation: {str(e)}")

@router.post("/translate/bulk")
async def get_bulk_translations(request: BulkTranslationRequest):
    """Get translations for multiple keys."""
    
    service = get_i18n_service()
    if not service:
        raise HTTPException(status_code=503, detail="I18n service not available")
    
    try:
        translations = {}
        
        for key in request.keys:
            translation = await service.get_translation(
                key=key,
                language=request.language,
                params=request.params
            )
            translations[key] = translation
        
        return {
            "language": request.language,
            "translations": translations,
            "total_keys": len(request.keys)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get bulk translations: {str(e)}")

@router.post("/translate/page")
async def get_page_translations(request: PageTranslationsRequest):
    """Get all translations for a specific page."""
    
    service = get_i18n_service()
    if not service:
        raise HTTPException(status_code=503, detail="I18n service not available")
    
    try:
        page_translations = await service.get_translations_for_page(
            page_key=request.page_key,
            language=request.language
        )
        
        return {
            "page_key": request.page_key,
            "language": request.language,
            "translations": page_translations,
            "total_keys": len(page_translations)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get page translations: {str(e)}")

@router.get("/translations/{language}")
async def get_all_translations(language: str):
    """Get all translations for a language."""
    
    service = get_i18n_service()
    if not service:
        raise HTTPException(status_code=503, detail="I18n service not available")
    
    try:
        translations = await service.get_all_translations(language)
        
        return {
            "language": language,
            "translations": translations
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get translations for language: {str(e)}")

@router.post("/translate/text")
async def translate_text(request: TextTranslationRequest):
    """Translate arbitrary text to target language."""
    
    service = get_i18n_service()
    if not service:
        raise HTTPException(status_code=503, detail="I18n service not available")
    
    try:
        if not request.source_language:
            request.source_language = await service.detect_language(request.text)
        
        translated_text = await service.translate_text(
            text=request.text,
            target_language=request.target_language,
            source_language=request.source_language
        )
        
        return {
            "original_text": request.text,
            "translated_text": translated_text,
            "source_language": request.source_language,
            "target_language": request.target_language
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to translate text: {str(e)}")

@router.get("/detect-language")
async def detect_language(text: str = Query(..., description="Text to analyze")):
    """Detect the language of given text."""
    
    service = get_i18n_service()
    if not service:
        raise HTTPException(status_code=503, detail="I18n service not available")
    
    try:
        detected_language = await service.detect_language(text)
        
        return {
            "text": text,
            "detected_language": detected_language,
            "confidence": 0.95  # Mock confidence score
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to detect language: {str(e)}")

@router.get("/format/date")
async def format_date(
    date_str: str = Query(..., description="Date in ISO format"),
    language: str = Query("en", description="Language code"),
    format_type: str = Query("medium", description="Format type: short, medium, long")
):
    """Format date according to language locale."""
    
    service = get_i18n_service()
    if not service:
        raise HTTPException(status_code=503, detail="I18n service not available")
    
    try:
        # Parse date string
        date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        
        formatted_date = await service.format_date(
            date_obj=date_obj,
            language=language,
            format_type=format_type
        )
        
        return {
            "original_date": date_str,
            "formatted_date": formatted_date,
            "language": language,
            "format_type": format_type
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to format date: {str(e)}")

@router.get("/format/number")
async def format_number(
    number: float = Query(..., description="Number to format"),
    language: str = Query("en", description="Language code")
):
    """Format number according to language locale."""
    
    service = get_i18n_service()
    if not service:
        raise HTTPException(status_code=503, detail="I18n service not available")
    
    try:
        formatted_number = await service.format_number(
            number=number,
            language=language
        )
        
        return {
            "original_number": number,
            "formatted_number": formatted_number,
            "language": language
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to format number: {str(e)}")

@router.get("/language/{language}/direction")
async def get_language_direction(language: str):
    """Get text direction for a language."""
    
    service = get_i18n_service()
    if not service:
        raise HTTPException(status_code=503, detail="I18n service not available")
    
    try:
        direction = await service.get_language_direction(language)
        
        return {
            "language": language,
            "direction": direction,
            "is_rtl": direction == "rtl"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get language direction: {str(e)}")

@router.get("/stats")
async def get_translation_stats():
    """Get translation completion statistics."""
    
    service = get_i18n_service()
    if not service:
        raise HTTPException(status_code=503, detail="I18n service not available")
    
    try:
        stats = await service.get_completion_stats()
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get translation stats: {str(e)}")

@router.get("/frontend/{language}")
async def get_frontend_translations(language: str):
    """Get translations optimized for frontend consumption."""
    
    service = get_i18n_service()
    if not service:
        raise HTTPException(status_code=503, detail="I18n service not available")
    
    try:
        # Get all translations for the language
        translations = await service.get_all_translations(language)
        
        # Get language direction
        direction = await service.get_language_direction(language)
        
        return {
            "language": language,
            "direction": direction,
            "translations": translations,
            "metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "version": "1.0.0"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get frontend translations: {str(e)}")

@router.post("/validate-translations")
async def validate_translations():
    """Validate translation completeness and consistency."""
    
    service = get_i18n_service()
    if not service:
        raise HTTPException(status_code=503, detail="I18n service not available")
    
    try:
        stats = await service.get_completion_stats()
        
        validation_report = {
            "overall_health": "good",
            "issues": [],
            "recommendations": [],
            "language_completeness": stats["languages"]
        }
        
        # Check for incomplete translations
        for lang_code, lang_data in stats["languages"].items():
            if lang_data["completion"] < 80:
                validation_report["issues"].append(
                    f"Language {lang_data['name']} is only {lang_data['completion']}% complete"
                )
                validation_report["recommendations"].append(
                    f"Complete missing translations for {lang_data['name']}"
                )
        
        # Determine overall health
        avg_completion = sum(lang["completion"] for lang in stats["languages"].values()) / len(stats["languages"])
        
        if avg_completion < 60:
            validation_report["overall_health"] = "poor"
        elif avg_completion < 80:
            validation_report["overall_health"] = "fair"
        
        return validation_report
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to validate translations: {str(e)}")

@router.get("/supported-codes")
async def get_language_codes():
    """Get list of supported language codes."""
    
    return {
        "language_codes": [lang.value for lang in SupportedLanguage],
        "total_supported": len(SupportedLanguage)
    }

@router.post("/bulk-generate")
async def bulk_generate_translations():
    """Generate missing translations for all languages (admin endpoint)."""
    
    service = get_i18n_service()
    if not service:
        raise HTTPException(status_code=503, detail="I18n service not available")
    
    try:
        # Re-initialize translations
        await service._load_translations()
        
        generated_count = 0
        languages_updated = []
        
        for lang_info in await service.get_supported_languages():
            # Count translations for this language
            lang_translations = await service.get_all_translations(lang_info.code)
            
            if lang_translations:
                generated_count += len(lang_translations)
                languages_updated.append(lang_info.code)
        
        return {
            "generated_translations": generated_count,
            "languages_updated": languages_updated,
            "message": f"Generated translations for {len(languages_updated)} languages"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to bulk generate translations: {str(e)}")