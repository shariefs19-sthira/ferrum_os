from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title='BOQ Pro')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Material(BaseModel):
    name: str
    quantity: float
    unit: str
    rate: float

class BOQRequest(BaseModel):
    materials: List[Material]

@app.get('/')
def root():
    return {'status': 'ok', 'service': 'boq-pro', 'message': 'BOQ Pro API Ready'}

@app.post('/api/calculate')
def calculate_boq(request: BOQRequest):
    subtotal = sum(m.quantity * m.rate for m in request.materials)
    gst = subtotal * 0.18
    total = subtotal + gst
    return {
        'subtotal': round(subtotal, 2),
        'gst_18': round(gst, 2),
        'grand_total': round(total, 2),
        'items': len(request.materials)
    }

@app.get('/api/materials')
def get_material_catalog():
    return {
        'concrete': [
            {'name': 'M20 Concrete', 'unit': 'm3', 'rate': 4500},
            {'name': 'M25 Concrete', 'unit': 'm3', 'rate': 5200},
            {'name': 'M30 Concrete', 'unit': 'm3', 'rate': 6000}
        ],
        'steel': [
            {'name': 'TMT Bar Fe 500', 'unit': 'kg', 'rate': 65},
            {'name': 'TMT Bar Fe 550', 'unit': 'kg', 'rate': 70}
        ],
        'masonry': [
            {'name': 'Red Brick', 'unit': 'nos', 'rate': 8},
            {'name': 'Concrete Block', 'unit': 'nos', 'rate': 45}
        ]
    }
