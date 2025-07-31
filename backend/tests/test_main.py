import pytest
import asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from models.database import init_db, get_database
from utils.id_generator import IDGenerator

class TestApp:
    """Test cases for the main FastAPI application"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    @pytest.fixture
    async def async_client(self):
        """Create async test client"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            yield ac
    
    def test_root_endpoint(self, client):
        """Test the root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "AI Code Studio API"
        assert "status" in data
        assert data["status"] == "running"
    
    def test_health_endpoint(self, client):
        """Test the health check endpoint"""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "services" in data
        assert "timestamp" in data

class TestIDGenerator:
    """Test cases for ID generation utilities"""
    
    def test_generate_uuid(self):
        """Test UUID generation"""
        uuid1 = IDGenerator.generate_uuid()
        uuid2 = IDGenerator.generate_uuid()
        
        assert uuid1 != uuid2
        assert len(uuid1) == 36  # Standard UUID length
        assert "-" in uuid1
    
    def test_generate_short_id(self):
        """Test short ID generation"""
        short_id = IDGenerator.generate_short_id(8)
        assert len(short_id) == 8
        assert short_id.isalnum()
        
        # Test different lengths
        assert len(IDGenerator.generate_short_id(12)) == 12
        assert len(IDGenerator.generate_short_id(16)) == 16
    
    def test_generate_project_id(self):
        """Test project ID generation"""
        project_id = IDGenerator.generate_project_id()
        assert project_id.startswith("proj_")
        assert len(project_id) == 15  # "proj_" + 10 chars
    
    def test_generate_conversation_id(self):
        """Test conversation ID generation"""
        conv_id = IDGenerator.generate_conversation_id()
        assert conv_id.startswith("conv_")
        assert len(conv_id) == 17  # "conv_" + 12 chars
    
    def test_validate_id(self):
        """Test ID validation"""
        # Valid IDs
        assert IDGenerator.validate_id("proj_abc123", "project")
        assert IDGenerator.validate_id("conv_xyz789", "conversation")
        assert IDGenerator.validate_id("general_id123")
        
        # Invalid IDs
        assert not IDGenerator.validate_id("")
        assert not IDGenerator.validate_id(None)
        assert not IDGenerator.validate_id("short")
        assert not IDGenerator.validate_id("proj_abc", "conversation")  # Wrong prefix

class TestPerformanceMetrics:
    """Test cases for performance monitoring"""
    
    def test_response_time_headers(self, client):
        """Test that performance headers are added"""
        response = client.get("/")
        
        assert "X-Response-Time" in response.headers
        assert "X-Request-ID" in response.headers
        assert "X-Server-Timing" in response.headers
        
        # Validate response time format
        response_time = response.headers["X-Response-Time"]
        assert response_time.endswith("s")
        
        # Validate request ID format
        request_id = response.headers["X-Request-ID"]
        assert request_id.startswith("req_")

class TestErrorHandling:
    """Test cases for error handling"""
    
    def test_404_error(self, client):
        """Test 404 error handling"""
        response = client.get("/nonexistent-endpoint")
        assert response.status_code == 404
        
        data = response.json()
        assert "detail" in data
    
    def test_method_not_allowed(self, client):
        """Test method not allowed error"""
        response = client.post("/")  # Root only accepts GET
        assert response.status_code == 405

class TestSecurity:
    """Test cases for security middleware"""
    
    def test_security_headers(self, client):
        """Test that security headers are present"""
        response = client.get("/")
        
        expected_headers = [
            "X-Content-Type-Options",
            "X-Frame-Options", 
            "X-XSS-Protection",
            "Strict-Transport-Security",
            "Content-Security-Policy",
            "Referrer-Policy"
        ]
        
        for header in expected_headers:
            assert header in response.headers
    
    def test_cors_headers(self, client):
        """Test CORS headers"""
        response = client.options("/", headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET"
        })
        
        # Should have CORS headers
        assert "Access-Control-Allow-Origin" in response.headers

# Integration Tests
class TestIntegration:
    """Integration test cases"""
    
    @pytest.mark.asyncio
    async def test_database_connection(self):
        """Test database connection"""
        try:
            db = await init_db()
            assert db is not None
        except Exception as e:
            # Database might not be available in test environment
            pytest.skip(f"Database not available: {e}")
    
    def test_api_endpoints_exist(self, client):
        """Test that all expected API endpoints exist"""
        endpoints = [
            "/api/health",
            "/api/auth/register",
            "/api/auth/login", 
            "/api/projects",
            "/api/templates",
            "/api/integrations",
            "/api/ai/chat"
        ]
        
        for endpoint in endpoints:
            response = client.get(endpoint)
            # Should not be 404 (might be 401, 422, etc. but endpoint exists)
            assert response.status_code != 404

# Performance Tests
class TestPerformance:
    """Performance test cases"""
    
    def test_response_time(self, client):
        """Test API response times"""
        import time
        
        start_time = time.time()
        response = client.get("/")
        end_time = time.time()
        
        response_time = end_time - start_time
        
        # API should respond within 1 second
        assert response_time < 1.0
        assert response.status_code == 200
    
    def test_concurrent_requests(self, client):
        """Test handling concurrent requests"""
        import threading
        import time
        
        results = []
        
        def make_request():
            start = time.time()
            response = client.get("/")
            end = time.time()
            results.append({
                "status_code": response.status_code,
                "response_time": end - start
            })
        
        # Create 10 concurrent requests
        threads = []
        for _ in range(10):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Verify all requests succeeded
        assert len(results) == 10
        for result in results:
            assert result["status_code"] == 200
            assert result["response_time"] < 2.0  # Allow more time for concurrent requests

if __name__ == "__main__":
    pytest.main([__file__])