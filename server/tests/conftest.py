import pytest
from fastapi.testclient import TestClient
from server.app import app
import os
from dotenv import load_dotenv

load_dotenv()

@pytest.fixture
def client():
    """
    Create a TestClient instance.
    """
    return TestClient(app)

@pytest.fixture
def test_headers():
    """
    Return headers for authenticated requests if credentials exist.
    """
    # This is a placeholder. For real tests you might want to mock auth 
    # or get a real token if doing integration tests.
    return {"Authorization": "Bearer test_token"}
