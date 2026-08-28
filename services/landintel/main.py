from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from io import BytesIO

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
    mode: str = "fallback"

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "landintel"}

@app.post("/api/v1/ulpin/lookup", response_model=ULPINResponse)
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
                        if isinstance(body, dict) and body.get("data"):
                            return ULPINResponse(success=True, data=body.get("data"), message="Land data retrieved from plot-data API", mode="live")
                        if isinstance(body, dict) and body.get("ulpin"):
                            return ULPINResponse(success=True, data=body, message="Land data retrieved from plot-data API", mode="live")
                        external_info = "Unexpected response shape from external API"
                    else:
                        external_info = f"External API returned status {resp.status_code}"
            except Exception:
                import json
                import urllib.request
                req = urllib.request.Request(f"{plot_api.rstrip('/')}/lookup", data=json.dumps({"ulpin": request.ulpin}).encode(), headers={"Content-Type": "application/json"})
                if api_key:
                    req.add_header("Authorization", f"Bearer {api_key}")
                with urllib.request.urlopen(req, timeout=5) as r:
                    if r.status != 200:
                        external_info = f"External API returned status {r.status}"
                    else:
                        body = json.loads(r.read())
                        if isinstance(body, dict) and body.get("data"):
                            return ULPINResponse(success=True, data=body.get("data"), message="Land data retrieved from plot-data API", mode="live")
                        if isinstance(body, dict) and body.get("ulpin"):
                            return ULPINResponse(success=True, data=body, message="Land data retrieved from plot-data API", mode="live")
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
        "maxHeight": "15m",
        "soilType": "Red Sandy Loam",
        "floodRisk": "Low",
        "liquefactionRisk": "Medium",
        "foundationRecommendation": "Shallow footing acceptable. Verify bearing capacity at 1.5m depth.",
        "note": "offline-fallback"
    }

    message = "Offline fallback: mock data used"
    if external_info:
        message = f"{message} ({external_info})"

    return ULPINResponse(
        success=True,
        data=mock_land_data,
        message=message,
        mode="fallback"
    )

@app.get("/api/v1/ulpin/{ulpin}/report")
async def generate_land_report(ulpin: str):
    if not ulpin.isdigit() or len(ulpin) != 14:
        raise HTTPException(status_code=400, detail="Invalid ULPIN")
    
    land_data = {
        "ulpin": ulpin,
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "village": "Yelahanka",
        "surveyNo": "45/2",
        "area": 2400.5,
        "ownerName": "Ramesh Kumar",
        "zoning": "Residential",
        "maxFAR": 1.75,
        "maxHeight": "15m",
        "soilType": "Red Sandy Loam",
        "floodRisk": "Low",
        "liquefactionRisk": "Medium",
        "foundationRecommendation": "Shallow footing acceptable."
    }
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    elements = []
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#1e40af'), spaceAfter=30)
    elements.append(Paragraph("Land Feasibility Report", title_style))
    elements.append(Spacer(1, 0.2*inch))
    
    elements.append(Paragraph(f"<b>ULPIN:</b> {land_data['ulpin']}", styles['Normal']))
    elements.append(Spacer(1, 0.3*inch))
    
    elements.append(Paragraph("<b>Land Details</b>", styles['Heading2']))
    land_details = [['Owner Name:', land_data['ownerName']], ['Area:', f"{land_data['area']} sq.ft"], ['District:', land_data['district']], ['Village:', land_data['village']], ['Survey No:', land_data['surveyNo']], ['State:', land_data['state']]]
    land_table = Table(land_details, colWidths=[2*inch, 4*inch])
    land_table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')), ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke), ('ALIGN', (0, 0), (-1, -1), 'LEFT'), ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, 0), 12), ('BOTTOMPADDING', (0, 0), (-1, 0), 12), ('BACKGROUND', (0, 1), (-1, -1), colors.beige), ('GRID', (0, 0), (-1, -1), 1, colors.black)]))
    elements.append(land_table)
    elements.append(Spacer(1, 0.4*inch))
    
    elements.append(Paragraph("<b>Zoning Summary</b>", styles['Heading2']))
    zoning_data = [['Permissible Use:', land_data['zoning']], ['Max FAR:', str(land_data['maxFAR'])], ['Max Height:', land_data['maxHeight']]]
    zoning_table = Table(zoning_data, colWidths=[2*inch, 4*inch])
    zoning_table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')), ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke), ('ALIGN', (0, 0), (-1, -1), 'LEFT'), ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, 0), 12), ('BOTTOMPADDING', (0, 0), (-1, 0), 12), ('BACKGROUND', (0, 1), (-1, -1), colors.lightgreen), ('GRID', (0, 0), (-1, -1), 1, colors.black)]))
    elements.append(zoning_table)
    elements.append(Spacer(1, 0.4*inch))

    elements.append(Paragraph("<b>Soil & Hazard Profile</b>", styles['Heading2']))
    soil_data = [['Soil Type:', land_data['soilType']], ['Flood Risk:', land_data['floodRisk']], ['Liquefaction Risk:', land_data['liquefactionRisk']], ['Recommendation:', land_data['foundationRecommendation']]]
    soil_table = Table(soil_data, colWidths=[2*inch, 4*inch])
    soil_table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f59e0b')), ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke), ('ALIGN', (0, 0), (-1, -1), 'LEFT'), ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, 0), 12), ('BOTTOMPADDING', (0, 0), (-1, 0), 12), ('BACKGROUND', (0, 1), (-1, -1), colors.lightyellow), ('GRID', (0, 0), (-1, -1), 1, colors.black)]))
    elements.append(soil_table)
    elements.append(Spacer(1, 0.5*inch))
    
    disclaimer = Paragraph("<i><b>Disclaimer:</b> This report is based on mock data for demonstration purposes. Please verify all information with relevant government authorities.</i>", ParagraphStyle('Disclaimer', parent=styles['Normal'], fontSize=8, textColor=colors.grey))
    elements.append(disclaimer)
    
    doc.build(elements)
    buffer.seek(0)
    
    return Response(content=buffer.getvalue(), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=land_report_{ulpin}.pdf"})