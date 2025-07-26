#!/usr/bin/env python3
"""
Quick test for collaboration features
"""

import asyncio
import aiohttp
import json
import uuid
import websockets
from datetime import datetime

# Get backend URL from frontend .env file
BACKEND_URL = "https://e521396d-be5e-4b8c-bb03-30b7592a1cf2.preview.emergentagent.com"
API_V1_BASE_URL = f"{BACKEND_URL}/api/v1"
WS_BASE_URL = BACKEND_URL.replace("https://", "wss://")

async def test_collaboration():
    """Test collaboration features"""
    async with aiohttp.ClientSession() as session:
        # First create a project and file for testing
        project_data = {
            "name": "Collaboration Test Project",
            "description": "Test project for collaboration"
        }
        
        async with session.post(f"{API_V1_BASE_URL}/projects", json=project_data) as response:
            if response.status == 200:
                project = await response.json()
                project_id = project["id"]
                print(f"✅ Created test project: {project_id}")
            else:
                print(f"❌ Failed to create project: {response.status}")
                return
        
        # Create a test file
        file_data = {
            "name": "test.py",
            "type": "file",
            "content": "print('Hello World')"
        }
        
        async with session.post(f"{API_V1_BASE_URL}/projects/{project_id}/files", json=file_data) as response:
            if response.status == 200:
                file = await response.json()
                file_id = file["id"]
                print(f"✅ Created test file: {file_id}")
            else:
                print(f"❌ Failed to create file: {response.status}")
                return
        
        # Test collaboration health
        async with session.get(f"{API_V1_BASE_URL}/collaboration/health") as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Collaboration health: {data['status']}")
            else:
                print(f"❌ Collaboration health failed: {response.status}")
        
        # Test collaboration stats
        async with session.get(f"{API_V1_BASE_URL}/collaboration/stats") as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Collaboration stats: {data['database']['total_rooms']} rooms")
            else:
                print(f"❌ Collaboration stats failed: {response.status}")
        
        # Create collaboration room
        room_data = {
            "project_id": project_id,
            "name": "Test Room",
            "description": "Test collaboration room",
            "is_public": True,
            "max_users": 10
        }
        
        async with session.post(f"{API_V1_BASE_URL}/collaboration/rooms", json=room_data) as response:
            if response.status == 200:
                room = await response.json()
                room_id = room["id"]
                print(f"✅ Created collaboration room: {room_id}")
            else:
                error_text = await response.text()
                print(f"❌ Failed to create room: {response.status} - {error_text}")
                return
        
        # Get room info
        async with session.get(f"{API_V1_BASE_URL}/collaboration/rooms/{room_id}") as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Got room info: {data['room']['name']}")
            else:
                error_text = await response.text()
                print(f"❌ Failed to get room info: {response.status} - {error_text}")
        
        # Get project rooms
        async with session.get(f"{API_V1_BASE_URL}/collaboration/projects/{project_id}/rooms") as response:
            if response.status == 200:
                rooms = await response.json()
                print(f"✅ Got project rooms: {len(rooms)} rooms")
            else:
                error_text = await response.text()
                print(f"❌ Failed to get project rooms: {response.status} - {error_text}")
        
        # Send chat message
        chat_data = {
            "message": "Hello from collaboration test!",
            "message_type": "text"
        }
        
        async with session.post(f"{API_V1_BASE_URL}/collaboration/rooms/{room_id}/chat", json=chat_data) as response:
            if response.status == 200:
                message = await response.json()
                print(f"✅ Sent chat message: {message['id']}")
            else:
                error_text = await response.text()
                print(f"❌ Failed to send chat: {response.status} - {error_text}")
        
        # Get chat history
        async with session.get(f"{API_V1_BASE_URL}/collaboration/rooms/{room_id}/chat") as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Got chat history: {len(data['messages'])} messages")
            else:
                error_text = await response.text()
                print(f"❌ Failed to get chat history: {response.status} - {error_text}")
        
        # Test edit operations
        edit_data = {
            "file_id": file_id,
            "operations": [
                {
                    "file_id": file_id,
                    "operation_type": "insert",
                    "position": 0,
                    "content": "# Collaborative Edit\n",
                    "user_id": "test_user"
                }
            ],
            "base_version": 0
        }
        
        async with session.post(f"{API_V1_BASE_URL}/collaboration/files/{file_id}/edit", json=edit_data) as response:
            if response.status == 200:
                result = await response.json()
                print(f"✅ Applied edit operations: version {result['new_version']}")
            else:
                error_text = await response.text()
                print(f"❌ Failed to apply edits: {response.status} - {error_text}")
        
        # Test WebSocket connection
        try:
            ws_url = f"{WS_BASE_URL}/api/v1/collaboration/rooms/{room_id}/ws?user_name=TestUser&avatar_color=%23FF5733"
            print(f"Connecting to WebSocket: {ws_url}")
            
            async with websockets.connect(ws_url) as websocket:
                # Wait for connection message
                response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                response_data = json.loads(response)
                
                if response_data.get("type") == "connected":
                    print(f"✅ WebSocket connected: {response_data['user_id']}")
                    
                    # Test ping/pong
                    ping_message = {
                        "type": "ping",
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    await websocket.send(json.dumps(ping_message))
                    pong_response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    pong_data = json.loads(pong_response)
                    
                    if pong_data.get("type") == "pong":
                        print("✅ WebSocket ping/pong working")
                    else:
                        print(f"❌ Invalid pong response: {pong_data}")
                else:
                    print(f"❌ Invalid connection response: {response_data}")
                    
        except Exception as e:
            print(f"❌ WebSocket test failed: {e}")
        
        # Cleanup
        async with session.delete(f"{API_V1_BASE_URL}/projects/{project_id}") as response:
            if response.status == 200:
                print("✅ Cleaned up test project")
            else:
                print(f"❌ Failed to cleanup: {response.status}")

if __name__ == "__main__":
    asyncio.run(test_collaboration())