from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import ulpin

app = FastAPI(title="LandIntel API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ulpin.router, prefix="/api/v1", tags=["land"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "landintel"}
