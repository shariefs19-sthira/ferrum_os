from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class ULPINRequest(BaseModel):
    ulpin: str

class ULPINResponse(BaseModel):
    success: bool
    data: dict | None = None
    message: str

@router.post("/ulpin/lookup", response_model=ULPINResponse)
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
        "maxFAR": 1.75
    }
    
    return ULPINResponse(
        success=True,
        data=mock_land_data,
        message="Land data retrieved successfully"
    )
