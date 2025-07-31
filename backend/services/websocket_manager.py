from typing import Dict, List
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    """WebSocket connection manager for real-time features"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.room_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected")
    
    def disconnect(self, websocket: WebSocket, client_id: str):
        """Remove a WebSocket connection"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        
        # Remove from all rooms
        for room_id, connections in self.room_connections.items():
            if websocket in connections:
                connections.remove(websocket)
        
        logger.info(f"Client {client_id} disconnected")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send a message to a specific WebSocket"""
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
    
    async def broadcast_to_room(self, room_id: str, message: str, exclude: WebSocket = None):
        """Broadcast a message to all connections in a room"""
        if room_id not in self.room_connections:
            return
        
        disconnected = []
        for connection in self.room_connections[room_id]:
            if connection == exclude:
                continue
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting to room {room_id}: {e}")
                disconnected.append(connection)
        
        # Remove disconnected connections
        for connection in disconnected:
            self.room_connections[room_id].remove(connection)
    
    def join_room(self, websocket: WebSocket, room_id: str):
        """Add a WebSocket to a room"""
        if room_id not in self.room_connections:
            self.room_connections[room_id] = []
        
        if websocket not in self.room_connections[room_id]:
            self.room_connections[room_id].append(websocket)
    
    def leave_room(self, websocket: WebSocket, room_id: str):
        """Remove a WebSocket from a room"""
        if room_id in self.room_connections and websocket in self.room_connections[room_id]:
            self.room_connections[room_id].remove(websocket)