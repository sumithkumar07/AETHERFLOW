#!/usr/bin/env python3
"""
Simple WebSocket test for VibeCode IDE
"""

import asyncio
import websockets
import json
import uuid

BACKEND_URL = "https://4268cb45-8b94-4483-b62a-57730437ba43.preview.emergentagent.com"
WS_BASE_URL = BACKEND_URL.replace("https://", "wss://")

async def test_websocket_simple():
    """Simple WebSocket connectivity test"""
    session_id = str(uuid.uuid4())
    ws_url = f"{WS_BASE_URL}/ws/ai/{session_id}"
    
    print(f"Testing WebSocket at: {ws_url}")
    
    try:
        # Try to connect with a shorter timeout
        async with websockets.connect(ws_url, open_timeout=10) as websocket:
            print("✅ WebSocket connection established")
            
            # Send a simple test message
            test_message = {
                "message": "Hello WebSocket",
                "context": {}
            }
            
            await websocket.send(json.dumps(test_message))
            print("✅ Message sent")
            
            # Wait for response
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=15.0)
                response_data = json.loads(response)
                print(f"✅ Received response: {response_data}")
                return True
            except asyncio.TimeoutError:
                print("❌ Response timeout")
                return False
                
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_websocket_simple())
    print(f"WebSocket test result: {'PASS' if result else 'FAIL'}")