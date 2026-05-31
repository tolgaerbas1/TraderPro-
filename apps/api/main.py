# FastAPI backend placeholder — install Python 3.11+ then:
# pip install -r requirements.txt
# uvicorn main:app --reload --port 8000

from fastapi import FastAPI

app = FastAPI(title="TraderPro API", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok", "broker": "mock", "ibkr": "not_connected"}
