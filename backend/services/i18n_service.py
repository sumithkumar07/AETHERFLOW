"""
Internationalization (i18n) Service
Handles multi-language support, translations, and localization.
"""

import json
import asyncio
from typing import Dict, List, Optional, Any
from enum import Enum
from dataclasses import dataclass
import re

class SupportedLanguage(str, Enum):
    ENGLISH = "en"
    SPANISH = "es"
    FRENCH = "fr"
    GERMAN = "de"
    ITALIAN = "it"
    PORTUGUESE = "pt"
    RUSSIAN = "ru"
    CHINESE_SIMPLIFIED = "zh-CN"
    CHINESE_TRADITIONAL = "zh-TW"
    JAPANESE = "ja"
    KOREAN = "ko"
    ARABIC = "ar"
    HINDI = "hi"
    DUTCH = "nl"
    POLISH = "pl"

@dataclass
class Translation:
    key: str
    language: str
    value: str
    context: Optional[str] = None
    pluralization: Optional[Dict[str, str]] = None

@dataclass
class LanguageInfo:
    code: str
    name: str
    native_name: str
    direction: str  # 'ltr' or 'rtl'
    completion_percentage: float

class I18nService:
    """Service for managing internationalization and localization."""
    
    def __init__(self, db_wrapper=None):
        self.db_wrapper = db_wrapper
        self.translations = {}
        self.language_info = {}
        self.default_language = SupportedLanguage.ENGLISH
        self.is_initialized = False
    
    async def initialize(self):
        """Initialize the i18n service."""
        try:
            await self._load_language_info()
            await self._load_translations()
            self.is_initialized = True
            print("✅ I18n Service initialized successfully")
        except Exception as e:
            print(f"⚠️ I18n Service initialization warning: {e}")
    
    async def get_translation(
        self, 
        key: str, 
        language: str = None, 
        params: Optional[Dict[str, Any]] = None,
        count: Optional[int] = None
    ) -> str:
        """Get translated text for a key in specified language."""
        
        if not language:
            language = self.default_language
        
        # Get translation
        translation_key = f"{language}.{key}"
        translation = self.translations.get(translation_key)
        
        if not translation:
            # Fallback to English
            fallback_key = f"{SupportedLanguage.ENGLISH}.{key}"
            translation = self.translations.get(fallback_key, key)
        
        # Handle pluralization
        if count is not None and isinstance(translation, dict):
            if count == 0:
                translation = translation.get('zero', translation.get('other', key))
            elif count == 1:
                translation = translation.get('one', translation.get('other', key))
            else:
                translation = translation.get('other', key)
        elif isinstance(translation, dict):
            translation = translation.get('other', key)
        
        # Handle parameter interpolation
        if params and isinstance(translation, str):
            for param_key, param_value in params.items():
                translation = translation.replace(f"{{{param_key}}}", str(param_value))
        
        return translation if isinstance(translation, str) else key
    
    async def get_translations_for_page(
        self, 
        page_key: str, 
        language: str = None
    ) -> Dict[str, str]:
        """Get all translations for a specific page."""
        
        if not language:
            language = self.default_language
        
        page_translations = {}
        prefix = f"{language}.{page_key}."
        
        for key, value in self.translations.items():
            if key.startswith(prefix):
                clean_key = key[len(prefix):]
                page_translations[clean_key] = value if isinstance(value, str) else value.get('other', clean_key)
        
        return page_translations
    
    async def get_all_translations(self, language: str = None) -> Dict[str, Any]:
        """Get all translations for a language."""
        
        if not language:
            language = self.default_language
        
        language_translations = {}
        prefix = f"{language}."
        
        for key, value in self.translations.items():
            if key.startswith(prefix):
                clean_key = key[len(prefix):]
                # Build nested dictionary structure
                self._set_nested_dict(language_translations, clean_key.split('.'), value)
        
        return language_translations
    
    async def get_supported_languages(self) -> List[LanguageInfo]:
        """Get list of supported languages with their information."""
        
        return list(self.language_info.values())
    
    async def detect_language(self, text: str) -> str:
        """Detect language of given text (simplified implementation)."""
        
        # In a real implementation, this would use a language detection library
        # For now, return English as default
        return SupportedLanguage.ENGLISH
    
    async def translate_text(
        self, 
        text: str, 
        target_language: str, 
        source_language: str = None
    ) -> str:
        """Translate text to target language (placeholder implementation)."""
        
        if not source_language:
            source_language = await self.detect_language(text)
        
        # In a real implementation, this would call a translation API
        # For now, return the original text with a language indicator
        if target_language == source_language:
            return text
        
        return f"[{target_language.upper()}] {text}"
    
    async def get_language_direction(self, language: str) -> str:
        """Get text direction for a language."""
        
        lang_info = self.language_info.get(language)
        return lang_info.direction if lang_info else 'ltr'
    
    async def format_date(self, date_obj, language: str = None, format_type: str = "medium") -> str:
        """Format date according to language locale."""
        
        if not language:
            language = self.default_language
        
        # Simplified date formatting based on language
        if language in [SupportedLanguage.ENGLISH]:
            if format_type == "short":
                return date_obj.strftime("%m/%d/%Y")
            elif format_type == "long":
                return date_obj.strftime("%B %d, %Y")
            else:  # medium
                return date_obj.strftime("%b %d, %Y")
        elif language in [SupportedLanguage.GERMAN, SupportedLanguage.FRENCH]:
            if format_type == "short":
                return date_obj.strftime("%d/%m/%Y")
            elif format_type == "long":
                return date_obj.strftime("%d %B %Y")
            else:  # medium
                return date_obj.strftime("%d %b %Y")
        else:
            # Default to ISO format
            return date_obj.strftime("%Y-%m-%d")
    
    async def format_number(self, number: float, language: str = None) -> str:
        """Format number according to language locale."""
        
        if not language:
            language = self.default_language
        
        # Simplified number formatting
        if language in [SupportedLanguage.ENGLISH]:
            return f"{number:,.2f}".rstrip('0').rstrip('.')
        elif language in [SupportedLanguage.GERMAN, SupportedLanguage.FRENCH]:
            return f"{number:,.2f}".replace(',', ' ').replace('.', ',').rstrip('0').rstrip(',')
        else:
            return str(number)
    
    async def get_completion_stats(self) -> Dict[str, Any]:
        """Get translation completion statistics."""
        
        stats = {
            "total_languages": len(self.language_info),
            "total_keys": len([k for k in self.translations.keys() if k.startswith(f"{self.default_language}.")]),
            "languages": {}
        }
        
        for lang_code, lang_info in self.language_info.items():
            lang_keys = len([k for k in self.translations.keys() if k.startswith(f"{lang_code}.")])
            completion_percentage = (lang_keys / stats["total_keys"] * 100) if stats["total_keys"] > 0 else 0
            
            stats["languages"][lang_code] = {
                "name": lang_info.name,
                "native_name": lang_info.native_name,
                "completion": round(completion_percentage, 1),
                "translated_keys": lang_keys
            }
        
        return stats
    
    async def _load_language_info(self):
        """Load supported language information."""
        
        languages = [
            LanguageInfo("en", "English", "English", "ltr", 100.0),
            LanguageInfo("es", "Spanish", "Español", "ltr", 85.0),
            LanguageInfo("fr", "French", "Français", "ltr", 80.0),
            LanguageInfo("de", "German", "Deutsch", "ltr", 75.0),
            LanguageInfo("it", "Italian", "Italiano", "ltr", 70.0),
            LanguageInfo("pt", "Portuguese", "Português", "ltr", 65.0),
            LanguageInfo("ru", "Russian", "Русский", "ltr", 60.0),
            LanguageInfo("zh-CN", "Chinese (Simplified)", "简体中文", "ltr", 55.0),
            LanguageInfo("zh-TW", "Chinese (Traditional)", "繁體中文", "ltr", 50.0),
            LanguageInfo("ja", "Japanese", "日本語", "ltr", 45.0),
            LanguageInfo("ko", "Korean", "한국어", "ltr", 40.0),
            LanguageInfo("ar", "Arabic", "العربية", "rtl", 35.0),
            LanguageInfo("hi", "Hindi", "हिन्दी", "ltr", 30.0),
            LanguageInfo("nl", "Dutch", "Nederlands", "ltr", 25.0),
            LanguageInfo("pl", "Polish", "Polski", "ltr", 20.0),
        ]
        
        for lang in languages:
            self.language_info[lang.code] = lang
    
    async def _load_translations(self):
        """Load translation data."""
        
        # Core translations for the AI Tempo platform
        base_translations = {
            # Common UI elements
            "common.loading": {"en": "Loading...", "es": "Cargando...", "fr": "Chargement...", "de": "Laden..."},
            "common.save": {"en": "Save", "es": "Guardar", "fr": "Sauvegarder", "de": "Speichern"},
            "common.cancel": {"en": "Cancel", "es": "Cancelar", "fr": "Annuler", "de": "Abbrechen"},
            "common.delete": {"en": "Delete", "es": "Eliminar", "fr": "Supprimer", "de": "Löschen"},
            "common.edit": {"en": "Edit", "es": "Editar", "fr": "Modifier", "de": "Bearbeiten"},
            "common.create": {"en": "Create", "es": "Crear", "fr": "Créer", "de": "Erstellen"},
            "common.search": {"en": "Search", "es": "Buscar", "fr": "Rechercher", "de": "Suchen"},
            "common.filter": {"en": "Filter", "es": "Filtrar", "fr": "Filtrer", "de": "Filtern"},
            
            # Navigation
            "nav.home": {"en": "Home", "es": "Inicio", "fr": "Accueil", "de": "Startseite"},
            "nav.templates": {"en": "Templates", "es": "Plantillas", "fr": "Modèles", "de": "Vorlagen"},
            "nav.chat": {"en": "Chat", "es": "Chat", "fr": "Chat", "de": "Chat"},
            "nav.integrations": {"en": "Integrations", "es": "Integraciones", "fr": "Intégrations", "de": "Integrationen"},
            "nav.settings": {"en": "Settings", "es": "Configuración", "fr": "Paramètres", "de": "Einstellungen"},
            "nav.login": {"en": "Sign In", "es": "Iniciar Sesión", "fr": "Se Connecter", "de": "Anmelden"},
            "nav.signup": {"en": "Sign Up", "es": "Registrarse", "fr": "S'inscrire", "de": "Registrieren"},
            
            # Homepage
            "home.title": {
                "en": "Code with AI Tempo",
                "es": "Código con AI Tempo",
                "fr": "Coder avec AI Tempo",
                "de": "Code mit AI Tempo"
            },
            "home.subtitle": {
                "en": "Build applications through conversation. Deploy with a thought. Experience the rhythm of AI-powered development.",
                "es": "Construye aplicaciones a través de la conversación. Despliega con un pensamiento. Experimenta el ritmo del desarrollo impulsado por IA.",
                "fr": "Créez des applications par la conversation. Déployez d'une pensée. Découvrez le rythme du développement alimenté par l'IA.",
                "de": "Erstelle Anwendungen durch Gespräche. Bereitstellung mit einem Gedanken. Erlebe den Rhythmus der KI-gesteuerten Entwicklung."
            },
            "home.start_coding": {"en": "Start Coding", "es": "Comenzar a Codificar", "fr": "Commencer à Coder", "de": "Beginne zu Programmieren"},
            "home.explore_templates": {"en": "Explore Templates", "es": "Explorar Plantillas", "fr": "Explorer les Modèles", "de": "Vorlagen Erkunden"},
            
            # Features
            "features.conversational_coding": {
                "en": "Conversational Coding",
                "es": "Codificación Conversacional",
                "fr": "Codage Conversationnel",
                "de": "Konversationelles Programmieren"
            },
            "features.multi_agent": {
                "en": "Multi-Agent Intelligence",
                "es": "Inteligencia Multi-Agente",
                "fr": "Intelligence Multi-Agent",
                "de": "Multi-Agent-Intelligenz"
            },
            "features.live_editor": {
                "en": "Live Code Editor",
                "es": "Editor de Código en Vivo",
                "fr": "Éditeur de Code en Direct",
                "de": "Live-Code-Editor"
            },
            "features.instant_deployment": {
                "en": "Instant Deployment",
                "es": "Despliegue Instantáneo",
                "fr": "Déploiement Instantané",
                "de": "Sofortbereitstellung"
            },
            
            # Chat Hub
            "chat.welcome": {
                "en": "Welcome back, {name}!",
                "es": "¡Bienvenido de nuevo, {name}!",
                "fr": "Bienvenue, {name}!",
                "de": "Willkommen zurück, {name}!"
            },
            "chat.ready_to_build": {
                "en": "Ready to build something amazing?",
                "es": "¿Listo para construir algo increíble?",
                "fr": "Prêt à construire quelque chose d'incroyable?",
                "de": "Bereit, etwas Erstaunliches zu bauen?"
            },
            "chat.project_idea_placeholder": {
                "en": "Describe your project idea in detail... The more context you provide, the better our AI can assist you!",
                "es": "Describe tu idea de proyecto en detalle... ¡Cuanto más contexto proporciones, mejor podrá ayudarte nuestra IA!",
                "fr": "Décrivez votre idée de projet en détail... Plus vous fournissez de contexte, mieux notre IA peut vous aider!",
                "de": "Beschreibe deine Projektidee im Detail... Je mehr Kontext du bereitstellst, desto besser kann unsere KI dir helfen!"
            },
            
            # Authentication
            "auth.email": {"en": "Email", "es": "Correo electrónico", "fr": "E-mail", "de": "E-Mail"},
            "auth.password": {"en": "Password", "es": "Contraseña", "fr": "Mot de passe", "de": "Passwort"},
            "auth.login_success": {
                "en": "Login successful! Welcome to AI Tempo.",
                "es": "¡Inicio de sesión exitoso! Bienvenido a AI Tempo.",
                "fr": "Connexion réussie! Bienvenue à AI Tempo.",
                "de": "Anmeldung erfolgreich! Willkommen bei AI Tempo."
            },
            
            # Project management
            "projects.recent": {"en": "Recent Projects", "es": "Proyectos Recientes", "fr": "Projets Récents", "de": "Aktuelle Projekte"},
            "projects.create_new": {"en": "Create New Project", "es": "Crear Nuevo Proyecto", "fr": "Créer un Nouveau Projet", "de": "Neues Projekt Erstellen"},
            "projects.status.active": {"en": "Active", "es": "Activo", "fr": "Actif", "de": "Aktiv"},
            "projects.status.completed": {"en": "Completed", "es": "Completado", "fr": "Terminé", "de": "Abgeschlossen"},
            
            # Templates
            "templates.title": {"en": "Templates", "es": "Plantillas", "fr": "Modèles", "de": "Vorlagen"},
            "templates.description": {
                "en": "Discover production-ready templates for web apps, mobile apps, APIs, and more.",
                "es": "Descubre plantillas listas para producción para aplicaciones web, móviles, APIs y más.",
                "fr": "Découvrez des modèles prêts pour la production pour les applications web, mobiles, les API et plus encore.",
                "de": "Entdecke produktionsreife Vorlagen für Web-Apps, mobile Apps, APIs und mehr."
            },
            
            # Error messages
            "error.generic": {
                "en": "An error occurred. Please try again.",
                "es": "Ocurrió un error. Por favor, inténtalo de nuevo.",
                "fr": "Une erreur s'est produite. Veuillez réessayer.",
                "de": "Ein Fehler ist aufgetreten. Bitte versuche es erneut."
            },
            "error.network": {
                "en": "Network error. Please check your connection.",
                "es": "Error de red. Por favor, verifica tu conexión.",
                "fr": "Erreur réseau. Veuillez vérifier votre connexion.",
                "de": "Netzwerkfehler. Bitte überprüfe deine Verbindung."
            },
            
            # Pluralization examples
            "notifications.count": {
                "en": {"zero": "No notifications", "one": "1 notification", "other": "{count} notifications"},
                "es": {"zero": "Sin notificaciones", "one": "1 notificación", "other": "{count} notificaciones"},
                "fr": {"zero": "Aucune notification", "one": "1 notification", "other": "{count} notifications"},
                "de": {"zero": "Keine Benachrichtigungen", "one": "1 Benachrichtigung", "other": "{count} Benachrichtigungen"}
            }
        }
        
        # Flatten translations into dot notation
        for key, languages in base_translations.items():
            for lang_code, translation in languages.items():
                self.translations[f"{lang_code}.{key}"] = translation
    
    def _set_nested_dict(self, dictionary: dict, keys: List[str], value: Any):
        """Set value in nested dictionary using key path."""
        
        for key in keys[:-1]:
            if key not in dictionary:
                dictionary[key] = {}
            dictionary = dictionary[key]
        
        dictionary[keys[-1]] = value

# Global service instance
i18n_service = None

def get_i18n_service():
    """Get the global i18n service instance."""
    return i18n_service

def set_i18n_service(service):
    """Set the global i18n service instance."""
    global i18n_service
    i18n_service = service