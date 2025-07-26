"""
Cosmic Routes - API endpoints for cosmic-level features

This module provides REST API endpoints for:
- Code evolution and genetic algorithms
- Karma reincarnation tracking
- Digital archaeology system
- VIBE token economy
- Nexus event coordination
- Cosmic debugging sessions
- Reality metrics
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from slowapi import Limiter
from slowapi.util import get_remote_address
import uuid

# Import cosmic service
from services.cosmic_service import get_cosmic_service

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create router
router = APIRouter(prefix="/api/v1/cosmic", tags=["Cosmic Features"])

# === REQUEST MODELS ===

class CodeEvolutionRequest(BaseModel):
    code: str = Field(..., min_length=10, max_length=50000)
    language: str = Field(..., min_length=2, max_length=20)
    generations: Optional[int] = Field(default=5, ge=1, le=10)
    user_id: Optional[str] = Field(default=None)

class KarmaReincarnationRequest(BaseModel):
    code: str = Field(..., min_length=10, max_length=50000)
    language: str = Field(..., min_length=2, max_length=20)
    user_id: str = Field(..., min_length=1)

class DigitalArchaeologyRequest(BaseModel):
    project_id: str = Field(..., min_length=1)
    user_id: str = Field(..., min_length=1)

class CodeImmortality(BaseModel):
    project_id: str = Field(..., min_length=1)
    user_id: str = Field(..., min_length=1)

class NexusEventRequest(BaseModel):
    source_platform: str = Field(..., min_length=1, max_length=50)
    target_platform: str = Field(..., min_length=1, max_length=50)
    action: str = Field(..., min_length=1, max_length=100)
    payload: Dict[str, Any] = Field(default_factory=dict)
    user_id: str = Field(..., min_length=1)

class CosmicDebugRequest(BaseModel):
    project_id: str = Field(..., min_length=1)
    commit_hash: Optional[str] = Field(default=None, max_length=40)
    user_id: Optional[str] = Field(default=None)

class VibeTokenTransaction(BaseModel):
    user_id: str = Field(..., min_length=1)
    amount: int = Field(..., ge=1, le=1000)
    transaction_type: str = Field(..., pattern="^(mine|spend|transfer)$")
    reason: Optional[str] = Field(default="Manual transaction", max_length=200)

# === COSMIC EVOLUTION ENDPOINTS ===

@router.post("/evolve-code")
@limiter.limit("5/minute")
async def evolve_code_genetically(
    request: Request,
    evolution_request: CodeEvolutionRequest
):
    """
    Evolve code using genetic algorithms
    """
    try:
        cosmic_service = get_cosmic_service()
        if not cosmic_service:
            raise HTTPException(status_code=503, detail="Cosmic service unavailable")

        result = await cosmic_service.evolve_code_genetically(
            code=evolution_request.code,
            language=evolution_request.language,
            generations=evolution_request.generations,
            user_id=evolution_request.user_id
        )

        if result.get('success'):
            return {
                "status": "evolution_complete",
                "original_code": result['original_code'],
                "evolved_code": result['evolved_code'],
                "fitness_improvement": result['fitness_improvement'],
                "generations": result['generations'],
                "evolution_id": result['evolution_id'],
                "message": f"Code evolved through {evolution_request.generations} generations"
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Evolution failed'))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cosmic evolution error: {str(e)}")

@router.get("/evolution-history/{user_id}")
@limiter.limit("10/minute")
async def get_evolution_history(request: Request, user_id: str):
    """
    Get user's code evolution history
    """
    try:
        cosmic_service = get_cosmic_service()
        if not cosmic_service:
            raise HTTPException(status_code=503, detail="Cosmic service unavailable")

        # Get evolution records from database
        evolutions = await cosmic_service.db.code_evolutions.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(50).to_list(50)

        # Fix ObjectId serialization issue by converting to strings
        serialized_evolutions = []
        for evolution in evolutions:
            if '_id' in evolution:
                evolution['_id'] = str(evolution['_id'])
            serialized_evolutions.append(evolution)

        return {
            "user_id": user_id,
            "evolution_count": len(serialized_evolutions),
            "evolutions": serialized_evolutions
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evolution history error: {str(e)}")

# === KARMA REINCARNATION ENDPOINTS ===

@router.post("/karma/reincarnate")
@limiter.limit("10/minute")
async def process_karma_reincarnation(
    request: Request,
    karma_request: KarmaReincarnationRequest
):
    """
    Process code through karma reincarnation cycle
    """
    try:
        cosmic_service = get_cosmic_service()
        if not cosmic_service:
            raise HTTPException(status_code=503, detail="Cosmic service unavailable")

        result = await cosmic_service.process_karma_reincarnation(
            code=karma_request.code,
            language=karma_request.language,
            user_id=karma_request.user_id
        )

        if result.get('success'):
            return {
                "status": "reincarnation_complete",
                "code_hash": result['code_hash'],
                "quality": result['quality'],
                "karma_debt": result['karma_debt'],
                "reincarnation_path": result['reincarnation_path'],
                "message": result['message'],
                "cycles": result['cycles']
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Reincarnation failed'))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Karma reincarnation error: {str(e)}")

@router.get("/karma/history/{user_id}")
@limiter.limit("15/minute")
async def get_karma_history(request: Request, user_id: str):
    """
    Get user's karma reincarnation history
    """
    try:
        cosmic_service = get_cosmic_service()
        if not cosmic_service:
            raise HTTPException(status_code=503, detail="Cosmic service unavailable")

        history = await cosmic_service.get_karma_history(user_id)
        
        return {
            "user_id": user_id,
            "karma_records": len(history),
            "history": history
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Karma history error: {str(e)}")

# === DIGITAL ARCHAEOLOGY ENDPOINTS ===

@router.post("/archaeology/mine")
@limiter.limit("3/minute")
async def mine_legacy_code(
    request: Request,
    archaeology_request: DigitalArchaeologyRequest
):
    """
    Mine legacy code for VIBE tokens and learning opportunities
    """
    try:
        cosmic_service = get_cosmic_service()
        if not cosmic_service:
            raise HTTPException(status_code=503, detail="Cosmic service unavailable")

        result = await cosmic_service.mine_legacy_code(
            project_id=archaeology_request.project_id,
            user_id=archaeology_request.user_id
        )

        if result.get('success'):
            return {
                "status": "archaeology_complete",
                "findings": result['findings'],
                "vibe_earned": result['vibe_earned'],
                "files_analyzed": result['files_analyzed'],
                "session_id": result['session_id'],
                "message": f"Discovered {len(result['findings'])} archaeological findings"
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Archaeology failed'))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Digital archaeology error: {str(e)}")

@router.get("/archaeology/sessions/{user_id}")
@limiter.limit("10/minute")
async def get_archaeology_sessions(request: Request, user_id: str):
    """
    Get user's archaeology session history
    """
    try:
        cosmic_service = get_cosmic_service()
        if not cosmic_service:
            raise HTTPException(status_code=503, detail="Cosmic service unavailable")

        sessions = await cosmic_service.db.archaeology_sessions.find(
            {"user_id": user_id}
        ).sort("timestamp", -1).limit(20).to_list(20)

        total_vibe = sum(session.get('total_vibe_earned', 0) for session in sessions)
        
        return {
            "user_id": user_id,
            "session_count": len(sessions),
            "total_vibe_earned": total_vibe,
            "sessions": sessions
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Archaeology sessions error: {str(e)}")

# === CODE IMMORTALITY ENDPOINTS ===

@router.post("/immortality/activate")
@limiter.limit("5/minute")
async def activate_code_immortality(
    request: Request,
    immortality_request: CodeImmortality
):
    """
    Activate code immortality for a project
    """
    try:
        cosmic_service = get_cosmic_service()
        if not cosmic_service:
            raise HTTPException(status_code=503, detail="Cosmic service unavailable")

        result = await cosmic_service.activate_code_immortality(
            project_id=immortality_request.project_id,
            user_id=immortality_request.user_id
        )

        if result.get('success'):
            return {
                "status": "immortality_activated",
                "immortality_id": result['immortality_id'],
                "features": result['features'],
                "message": result['status']
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Immortality activation failed'))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code immortality error: {str(e)}")

@router.get("/immortality/status/{project_id}")
@limiter.limit("15/minute")
async def get_immortality_status(request: Request, project_id: str):
    """
    Get code immortality status for a project
    """
    try:
        cosmic_service = get_cosmic_service()
        if not cosmic_service:
            raise HTTPException(status_code=503, detail="Cosmic service unavailable")

        immortality_record = await cosmic_service.db.code_immortality.find_one(
            {"project_id": project_id}
        )

        if immortality_record:
            return {
                "project_id": project_id,
                "status": immortality_record.get("status", "unknown"),
                "activated_at": immortality_record.get("activated_at"),
                "auto_maintenance": immortality_record.get("auto_maintenance", False),
                "backup_frequency": immortality_record.get("backup_frequency", "unknown"),
                "immortality_id": immortality_record.get("immortality_id")
            }
        else:
            return {
                "project_id": project_id,
                "status": "not_activated",
                "message": "Code immortality not activated for this project"
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Immortality status error: {str(e)}")

# === NEXUS EVENTS ENDPOINTS ===

@router.post("/nexus/create")
@limiter.limit("10/minute")
async def create_nexus_event(
    request: Request,
    nexus_request: NexusEventRequest
):
    """
    Create a cross-platform nexus event
    """
    try:
        cosmic_service = get_cosmic_service()
        if not cosmic_service:
            raise HTTPException(status_code=503, detail="Cosmic service unavailable")

        result = await cosmic_service.create_nexus_event(
            source_platform=nexus_request.source_platform,
            target_platform=nexus_request.target_platform,
            action=nexus_request.action,
            payload=nexus_request.payload,
            user_id=nexus_request.user_id
        )

        if result.get('success'):
            return {
                "status": "nexus_created",
                "event_id": result['event_id'],
                "description": result['description'],
                "quantum_signature": result['quantum_signature'],
                "result": result['result']
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Nexus event failed'))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nexus event error: {str(e)}")

@router.get("/nexus/events/{user_id}")
@limiter.limit("15/minute")
async def get_nexus_events(request: Request, user_id: str):
    """
    Get user's nexus event history
    """
    try:
        cosmic_service = get_cosmic_service()
        if not cosmic_service:
            raise HTTPException(status_code=503, detail="Cosmic service unavailable")

        events = await cosmic_service.db.nexus_events.find(
            {"payload.user_id": user_id}
        ).sort("timestamp", -1).limit(50).to_list(50)

        return {
            "user_id": user_id,
            "event_count": len(events),
            "events": events
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nexus events error: {str(e)}")

# === COSMIC DEBUGGING ENDPOINTS ===

@router.post("/debug/time-travel")
@limiter.limit("5/minute")
async def start_cosmic_debug_session(
    request: Request,
    debug_request: CosmicDebugRequest
):
    """
    Start a cosmic debugging session with time travel
    """
    try:
        cosmic_service = get_cosmic_service()
        if not cosmic_service:
            raise HTTPException(status_code=503, detail="Cosmic service unavailable")

        result = await cosmic_service.start_cosmic_debug_session(
            project_id=debug_request.project_id,
            commit_hash=debug_request.commit_hash,
            user_id=debug_request.user_id
        )

        if result.get('success'):
            return {
                "status": "debug_session_started",
                "session_id": result['session_id'],
                "destination": result['destination'],
                "available_timepoints": result['available_timepoints'],
                "message": result['message'],
                "temporal_status": result['temporal_status']
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Cosmic debug failed'))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cosmic debug error: {str(e)}")

@router.get("/debug/sessions/{user_id}")
@limiter.limit("15/minute")
async def get_debug_sessions(request: Request, user_id: str):
    """
    Get user's cosmic debugging session history
    """
    try:
        cosmic_service = get_cosmic_service()
        if not cosmic_service:
            raise HTTPException(status_code=503, detail="Cosmic service unavailable")

        sessions = await cosmic_service.db.cosmic_debug_sessions.find(
            {"user_id": user_id}
        ).sort("started_at", -1).limit(20).to_list(20)

        # Fix ObjectId serialization issue by converting to strings
        serialized_sessions = []
        for session in sessions:
            if '_id' in session:
                session['_id'] = str(session['_id'])
            serialized_sessions.append(session)

        return {
            "user_id": user_id,
            "session_count": len(serialized_sessions),
            "sessions": serialized_sessions
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Debug sessions error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Debug sessions error: {str(e)}")

# === VIBE TOKEN ECONOMY ENDPOINTS ===

@router.post("/vibe/transaction")
@limiter.limit("20/minute")
async def process_vibe_transaction(
    request: Request,
    transaction: VibeTokenTransaction
):
    """
    Process VIBE token transaction
    """
    try:
        # In a real implementation, this would integrate with the cosmic service
        # For now, we'll simulate the transaction
        
        transaction_record = {
            "transaction_id": str(uuid.uuid4()),
            "user_id": transaction.user_id,
            "amount": transaction.amount,
            "type": transaction.transaction_type,
            "reason": transaction.reason,
            "timestamp": datetime.utcnow(),
            "status": "completed"
        }

        return {
            "status": "transaction_complete",
            "transaction_id": transaction_record["transaction_id"],
            "amount": transaction.amount,
            "type": transaction.transaction_type,
            "new_balance": 1000 + transaction.amount,  # Simulated balance
            "message": f"VIBE token {transaction.transaction_type} successful"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"VIBE transaction error: {str(e)}")

@router.get("/vibe/balance/{user_id}")
@limiter.limit("30/minute")
async def get_vibe_balance(request: Request, user_id: str):
    """
    Get user's VIBE token balance
    """
    try:
        # Simulate getting balance
        balance = {
            "user_id": user_id,
            "balance": 1000,  # Simulated balance
            "karma_level": "Journeyman",
            "total_earned": 2500,
            "total_spent": 1500,
            "last_updated": datetime.utcnow()
        }

        return balance

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"VIBE balance error: {str(e)}")

# === REALITY METRICS ENDPOINTS ===

@router.get("/reality/metrics")
@limiter.limit("10/minute")
async def get_reality_metrics(request: Request):
    """
    Get current reality metrics and cosmic statistics
    """
    try:
        cosmic_service = get_cosmic_service()
        if not cosmic_service:
            raise HTTPException(status_code=503, detail="Cosmic service unavailable")

        metrics = await cosmic_service.get_reality_metrics()
        return metrics

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reality metrics error: {str(e)}")

@router.get("/reality/status")
@limiter.limit("20/minute")
async def get_cosmic_status(request: Request):
    """
    Get current cosmic system status
    """
    try:
        return {
            "cosmic_status": "operational",
            "reality_version": "2.0.cosmic",
            "quantum_coherence": "stable",
            "vibe_frequency": 432,
            "active_features": [
                "Code Evolution",
                "Karma Reincarnation", 
                "Digital Archaeology",
                "Code Immortality",
                "Nexus Events",
                "Cosmic Debugging",
                "VIBE Economy"
            ],
            "timestamp": datetime.utcnow(),
            "message": "All cosmic systems operational"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cosmic status error: {str(e)}")

# === COSMIC UTILITIES ===

@router.post("/utilities/cleanse")
@limiter.limit("5/minute")
async def perform_ritual_cleanse(request: Request, target: str = "code"):
    """
    Perform ritual cleansing on various targets
    """
    try:
        cleansing_effects = {
            "dependencies": "Unused packages banished to the shadow realm",
            "code": "Technical debt transformed into wisdom",
            "git": "Commit history purified of shame",
            "mind": "Mental blocks dissolved in cosmic fire",
            "cache": "Temporary files sent to the void",
            "karma": "Negative karma neutralized"
        }

        effect = cleansing_effects.get(target, "Unknown cleansing performed")
        
        return {
            "status": "cleanse_complete",
            "target": target,
            "effect": effect,
            "purity_level": "95%",
            "vibe_cost": 30,
            "message": f"Ritual cleansing of {target} successful"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ritual cleanse error: {str(e)}")

@router.get("/utilities/cosmic-time")
@limiter.limit("30/minute")
async def get_cosmic_time(request: Request):
    """
    Get current cosmic time and temporal status
    """
    try:
        import time
        import math
        
        # Calculate cosmic time based on various factors
        current_time = datetime.utcnow()
        unix_time = time.time()
        
        # Simulate cosmic time calculation
        cosmic_phase = math.sin(unix_time / 86400) * 100  # Daily cycle
        quantum_flux = math.cos(unix_time / 3600) * 50   # Hourly fluctuation
        
        return {
            "current_time": current_time,
            "cosmic_phase": round(cosmic_phase, 2),
            "quantum_flux": round(quantum_flux, 2),
            "temporal_stability": "stable",
            "vibe_frequency": 432 + (cosmic_phase / 10),
            "reality_coherence": "99.7%",
            "dimension": "Prime Reality",
            "message": "Temporal coordinates locked"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cosmic time error: {str(e)}")