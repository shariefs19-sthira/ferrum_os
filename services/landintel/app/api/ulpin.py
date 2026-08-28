from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

telemetry_counts = {"live": 0, "fallback": 0}

class ULPINRequest(BaseModel):
    ulpin: str

class ULPINResponse(BaseModel):
    success: bool
    data: dict | None = None
    message: str
    mode: str = "fallback"
    telemetry: dict | None = None

@router.post("/ulpin/lookup", response_model=ULPINResponse)
async def lookup_ulpin(request: ULPINRequest):
    if not request.ulpin.isdigit() or len(request.ulpin) != 14:
        raise HTTPException(status_code=400, detail="ULPIN must be exactly 14 digits")

    import os
    external_info = None
    plot_api = os.getenv("PLOT_DATA_API_URL")
    api_key = os.getenv("PLOT_DATA_API_KEY")

    if plot_api:
        try:
            try:
                import httpx
                async with httpx.AsyncClient(timeout=5) as client:
                    headers = {"Content-Type": "application/json"}
                    if api_key:
                        headers["Authorization"] = f"Bearer {api_key}"
                    url = f"{plot_api.rstrip('/')}/lookup"
                    resp = await client.post(url, json={"ulpin": request.ulpin}, headers=headers)
                    if resp.status_code == 200:
                        body = resp.json()
                        data = None
                        if isinstance(body, dict) and body.get("data"):
                            data = body.get("data")
                        elif isinstance(body, dict) and body.get("ulpin"):
                            data = body
                        if data:
                            telemetry_counts["live"] += 1
                            return ULPINResponse(
                                success=True,
                                data=data,
                                message="Land data retrieved from plot-data API",
                                mode="live",
                                telemetry=dict(telemetry_counts)
                            )
                        external_info = "Unexpected response shape from external API"
                    else:
                        external_info = f"External API returned status {resp.status_code}"
            except Exception:
                import json
                import urllib.request
                req = urllib.request.Request(
                    f"{plot_api.rstrip('/')}/lookup",
                    data=json.dumps({"ulpin": request.ulpin}).encode(),
                    headers={"Content-Type": "application/json"},
                )
                if api_key:
                    req.add_header("Authorization", f"Bearer {api_key}")
                with urllib.request.urlopen(req, timeout=5) as r:
                    if r.status != 200:
                        external_info = f"External API returned status {r.status}"
                    else:
                        body = json.loads(r.read())
                        data = None
                        if isinstance(body, dict) and body.get("data"):
                            data = body.get("data")
                        elif isinstance(body, dict) and body.get("ulpin"):
                            data = body
                        if data:
                            telemetry_counts["live"] += 1
                            return ULPINResponse(
                                success=True,
                                data=data,
                                message="Land data retrieved from plot-data API",
                                mode="live",
                                telemetry=dict(telemetry_counts)
                            )
                        external_info = "Unexpected response shape from external API"
        except Exception as e:
            external_info = str(e)
    else:
        external_info = "PLOT_DATA_API_URL not configured"

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
        "note": "offline-fallback"
    }

    message = "Offline fallback: mock data used"
    if external_info:
        message = f"{message} ({external_info})"

    telemetry_counts["fallback"] += 1
    return ULPINResponse(
        success=True,
        data=mock_land_data,
        message=message,
        mode="fallback",
        telemetry=dict(telemetry_counts)
    )
