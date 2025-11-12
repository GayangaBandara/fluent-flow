import io
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture(autouse=True)
def no_whisper(monkeypatch):
    # Monkeypatch whisper usage and TTS to avoid heavy dependencies in tests
    monkeypatch.setattr('main.load_model', lambda *args, **kwargs: None, raising=False)
    monkeypatch.setattr('main.generate_local_llm', lambda text: 'Simulated reply for: ' + text, raising=False)
    monkeypatch.setattr('main.synthesize_tts', lambda text, out: True, raising=False)

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.json()
    assert 'status' in data
    assert 'message' in data
    assert 'service' in data
    assert 'huggingface_configured' in data
    assert data['status'] == 'healthy'
    assert 'Voice-First-Chat API is running' in data['message']

def test_audio_endpoint_echo():
    # Send a tiny dummy audio file (empty wav) as form-data
    data = {
        'file': ('test.wav', io.BytesIO(b'RIFF....WAVEfmt '), 'audio/wav')
    }
    resp = client.post('/audio', files=data)
    assert resp.status_code == 200
    j = resp.json()
    assert 'transcript' in j
    assert 'reply' in j
