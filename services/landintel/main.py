from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="LandIntel API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ULPINRequest(BaseModel):
    ulpin: str

class ULPINResponse(BaseModel):
    success: bool
    data: dict | None = None
    message: str

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "landintel"}

@app.post("/api/v1/ulpin/lookup", response_model=ULPINResponse)
async def lookup_ulpin(request: ULPINRequest):
    if not request.ulpin.isdigit() or len(request.ulpin) != 14:
        raise HTTPException(status_code=400, detail="ULPIN must be exactly 14 digits")
    
    mock_land_data = {
        "ulpin": request.ulpin,
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "village": "Yelahanka",
        "surveyNo": "45/2",
        "area": 2400.5,
        "ownerName": "Ramesh Kumar",
        "zoning": "Residential",
        "maxFAR": 1.75,
        "maxHeight": "15m"
    }
    
    return ULPINResponse(
        success=True,
        data=mock_land_data,
        message="Land data retrieved successfully"
    )