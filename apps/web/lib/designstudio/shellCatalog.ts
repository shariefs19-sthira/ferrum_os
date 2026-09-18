import type { ParcelContext } from '../workspace/parcelContext'

export type RoofForm = 'flat' | 'hipped' | 'pitched' | 'stepped'

export type ShellGeometry = {
  roof: RoofForm
  roofPitchDeg: number
  courtyardRatio: number
  overhangM: number
  balconyDepthM: number
  taperPerFloor: number
  wallColor: string
  roofColor: string
  accentColor: string
}

export type BuildingShell = {
  id: string
  name: string
  region: string
  states: string[]
  climates: string[]
  buildingTypes: string[]
  plotAreaSqm: { min: number; max: number }
  floorRange: { min: number; max: number }
  summary: string
  passiveResponse: string[]
  geometry: ShellGeometry
  provenance: {
    basis: 'ORIGINAL TYPOLOGY STUDY'
    status: 'INDICATIVE'
    source: string
    sourceUrl: string
    reviewedAt: string
    copyrightBoundary: string
  }
}

export type ShellRecommendation = {
  shell: BuildingShell
  score: number
  reasons: string[]
  unknowns: string[]
  status: 'INDICATIVE'
}

const sharedBoundary = 'Original Ferrum massing study; no architect project geometry, drawings or trade dress reproduced.'

export const buildingShellCatalog: BuildingShell[] = [
  {
    id: 'kerala-courtyard', name: 'Kerala shaded courtyard', region: 'Kerala', states: ['Kerala'], climates: ['warm-humid'], buildingTypes: ['Residential', 'Hospitality'], plotAreaSqm: { min: 220, max: 4000 }, floorRange: { min: 1, max: 3 },
    summary: 'A low-rise, inward-looking shell with a protected court, deep eaves and a rain-responsive roof.',
    passiveResponse: ['Shaded internal court', 'Deep rain eaves', 'Cross-ventilation potential'],
    geometry: { roof: 'hipped', roofPitchDeg: 32, courtyardRatio: 0.22, overhangM: 1.2, balconyDepthM: 1.4, taperPerFloor: 0.02, wallColor: '#e7dfcf', roofColor: '#7f2d22', accentColor: '#4b392d' },
    provenance: { basis: 'ORIGINAL TYPOLOGY STUDY', status: 'INDICATIVE', source: 'Kerala Tourism — architectural heritage overview', sourceUrl: 'https://www.keralatourism.org/kerala-article/2007/architectural-heritage-kerala/61', reviewedAt: '2026-09-18', copyrightBoundary: sharedBoundary },
  },
  {
    id: 'coastal-karnataka-tile', name: 'Coastal Karnataka tiled house', region: 'Mangaluru and coastal Karnataka', states: ['Karnataka'], climates: ['warm-humid', 'coastal'], buildingTypes: ['Residential', 'Hospitality'], plotAreaSqm: { min: 180, max: 2500 }, floorRange: { min: 1, max: 3 },
    summary: 'A broad, pitched-roof shell with verandas and protected openings for monsoon conditions.',
    passiveResponse: ['Large pitched roof', 'Protected veranda edge', 'Ventilated roof volume'],
    geometry: { roof: 'pitched', roofPitchDeg: 30, courtyardRatio: 0.08, overhangM: 1.35, balconyDepthM: 1.8, taperPerFloor: 0.015, wallColor: '#eee5d4', roofColor: '#9b3f29', accentColor: '#594136' },
    provenance: { basis: 'ORIGINAL TYPOLOGY STUDY', status: 'INDICATIVE', source: 'Council of Architecture — climate-responsive architectural education context', sourceUrl: 'https://www.coa.gov.in/', reviewedAt: '2026-09-18', copyrightBoundary: sharedBoundary },
  },
  {
    id: 'bengaluru-contemporary', name: 'Bengaluru climate-responsive contemporary', region: 'Bengaluru and Deccan plateau', states: ['Karnataka', 'Telangana'], climates: ['temperate', 'composite'], buildingTypes: ['Residential', 'Commercial', 'Mixed Use'], plotAreaSqm: { min: 120, max: 8000 }, floorRange: { min: 1, max: 8 },
    summary: 'A compact contemporary shell with recessed glazing, terraces and a small ventilation court.',
    passiveResponse: ['Recessed solar exposure', 'Flexible terrace plates', 'Compact service core potential'],
    geometry: { roof: 'flat', roofPitchDeg: 0, courtyardRatio: 0.1, overhangM: 0.75, balconyDepthM: 1.5, taperPerFloor: 0.025, wallColor: '#d9ddd8', roofColor: '#66716d', accentColor: '#a4572e' },
    provenance: { basis: 'ORIGINAL TYPOLOGY STUDY', status: 'INDICATIVE', source: 'Bureau of Energy Efficiency — Eco Niwas Samhita', sourceUrl: 'https://beeindia.gov.in/en/programmes/energy-efficiency-in-buildings/eco-niwas-samhita', reviewedAt: '2026-09-18', copyrightBoundary: sharedBoundary },
  },
  {
    id: 'goa-indo-portuguese', name: 'Goa Indo-Portuguese veranda', region: 'Goa and Konkan', states: ['Goa'], climates: ['warm-humid', 'coastal'], buildingTypes: ['Residential', 'Hospitality'], plotAreaSqm: { min: 180, max: 3000 }, floorRange: { min: 1, max: 3 },
    summary: 'An original veranda-fronted shell informed by Goa’s Indo-Portuguese domestic tradition.',
    passiveResponse: ['Street-facing shaded veranda', 'High pitched roof', 'Cross-ventilated room depth'],
    geometry: { roof: 'hipped', roofPitchDeg: 34, courtyardRatio: 0.06, overhangM: 1, balconyDepthM: 2.1, taperPerFloor: 0, wallColor: '#f0cf9b', roofColor: '#8d3425', accentColor: '#2e6f6a' },
    provenance: { basis: 'ORIGINAL TYPOLOGY STUDY', status: 'INDICATIVE', source: 'Goa Tourism — heritage and built context', sourceUrl: 'https://goa-tourism.com/', reviewedAt: '2026-09-18', copyrightBoundary: sharedBoundary },
  },
  {
    id: 'chettinad-court', name: 'Chettinad linear courtyard', region: 'Chettinad, Tamil Nadu', states: ['Tamil Nadu'], climates: ['hot-dry', 'warm-humid'], buildingTypes: ['Residential', 'Hospitality'], plotAreaSqm: { min: 260, max: 5000 }, floorRange: { min: 1, max: 3 },
    summary: 'A deep-plan shell organised around sequential courts and protected perimeter walls.',
    passiveResponse: ['Sequential shaded courts', 'High thermal-mass envelope', 'Controlled street openings'],
    geometry: { roof: 'pitched', roofPitchDeg: 24, courtyardRatio: 0.28, overhangM: 0.75, balconyDepthM: 1.2, taperPerFloor: 0, wallColor: '#dfc19f', roofColor: '#9a4d35', accentColor: '#315f59' },
    provenance: { basis: 'ORIGINAL TYPOLOGY STUDY', status: 'INDICATIVE', source: 'Tamil Nadu Tourism — heritage context', sourceUrl: 'https://www.tamilnadutourism.tn.gov.in/', reviewedAt: '2026-09-18', copyrightBoundary: sharedBoundary },
  },
  {
    id: 'rajasthan-haveli', name: 'Rajasthan shaded haveli court', region: 'Rajasthan', states: ['Rajasthan'], climates: ['hot-dry'], buildingTypes: ['Residential', 'Hospitality', 'Mixed Use'], plotAreaSqm: { min: 220, max: 6000 }, floorRange: { min: 1, max: 4 },
    summary: 'A dense courtyard shell with shaded recesses and a high solid-to-void ratio.',
    passiveResponse: ['Self-shaded court', 'Protected openings', 'Thermal-mass potential'],
    geometry: { roof: 'flat', roofPitchDeg: 0, courtyardRatio: 0.25, overhangM: 0.55, balconyDepthM: 1.1, taperPerFloor: 0.018, wallColor: '#d9ad78', roofColor: '#a66b42', accentColor: '#73433c' },
    provenance: { basis: 'ORIGINAL TYPOLOGY STUDY', status: 'INDICATIVE', source: 'Rajasthan Tourism — heritage context', sourceUrl: 'https://www.tourism.rajasthan.gov.in/', reviewedAt: '2026-09-18', copyrightBoundary: sharedBoundary },
  },
  {
    id: 'gujarat-pol', name: 'Gujarat pol courtyard row', region: 'Ahmedabad and Gujarat', states: ['Gujarat'], climates: ['hot-dry', 'composite'], buildingTypes: ['Residential', 'Mixed Use'], plotAreaSqm: { min: 90, max: 1200 }, floorRange: { min: 2, max: 4 },
    summary: 'A narrow-frontage, deep-plan shell with a light court and shaded street edge.',
    passiveResponse: ['Compact party-wall form', 'Light and ventilation court', 'Shaded street frontage'],
    geometry: { roof: 'flat', roofPitchDeg: 0, courtyardRatio: 0.16, overhangM: 0.5, balconyDepthM: 1, taperPerFloor: 0.01, wallColor: '#d7b582', roofColor: '#9a7650', accentColor: '#356f6b' },
    provenance: { basis: 'ORIGINAL TYPOLOGY STUDY', status: 'INDICATIVE', source: 'UNESCO — Historic City of Ahmadabad', sourceUrl: 'https://whc.unesco.org/en/list/1551/', reviewedAt: '2026-09-18', copyrightBoundary: sharedBoundary },
  },
  {
    id: 'assam-raised', name: 'Assam raised flood-responsive shell', region: 'Assam and Brahmaputra valley', states: ['Assam'], climates: ['warm-humid', 'flood-prone'], buildingTypes: ['Residential', 'Community'], plotAreaSqm: { min: 140, max: 1800 }, floorRange: { min: 1, max: 2 },
    summary: 'A lightweight, raised shell with a steep roof and generous ventilation openings.',
    passiveResponse: ['Raised occupied floor', 'Fast-draining roof', 'Lightweight ventilated envelope'],
    geometry: { roof: 'pitched', roofPitchDeg: 38, courtyardRatio: 0, overhangM: 1.4, balconyDepthM: 1.6, taperPerFloor: 0, wallColor: '#c9b995', roofColor: '#65706c', accentColor: '#6a4934' },
    provenance: { basis: 'ORIGINAL TYPOLOGY STUDY', status: 'INDICATIVE', source: 'Assam State Disaster Management Authority', sourceUrl: 'https://asdma.assam.gov.in/', reviewedAt: '2026-09-18', copyrightBoundary: sharedBoundary },
  },
  {
    id: 'himalayan-stepped', name: 'Himalayan stepped compact shell', region: 'Western Himalaya', states: ['Himachal Pradesh', 'Uttarakhand'], climates: ['cold', 'mountain'], buildingTypes: ['Residential', 'Hospitality'], plotAreaSqm: { min: 120, max: 2400 }, floorRange: { min: 1, max: 4 },
    summary: 'A compact stepped shell with a protected pitched roof and reduced exposed surface area.',
    passiveResponse: ['Compact thermal envelope', 'Stepped terrain response', 'Snow and rain shedding roof'],
    geometry: { roof: 'stepped', roofPitchDeg: 36, courtyardRatio: 0, overhangM: 0.8, balconyDepthM: 1.2, taperPerFloor: 0.04, wallColor: '#b9aa91', roofColor: '#575a59', accentColor: '#5f4635' },
    provenance: { basis: 'ORIGINAL TYPOLOGY STUDY', status: 'INDICATIVE', source: 'Himachal Pradesh Tourism — heritage context', sourceUrl: 'https://himachaltourism.gov.in/', reviewedAt: '2026-09-18', copyrightBoundary: sharedBoundary },
  },
  {
    id: 'ladakh-solar', name: 'Ladakh solar compact court', region: 'Ladakh', states: ['Ladakh'], climates: ['cold-dry'], buildingTypes: ['Residential', 'Community', 'Hospitality'], plotAreaSqm: { min: 140, max: 2400 }, floorRange: { min: 1, max: 3 },
    summary: 'A compact flat-roof shell with a sun-facing edge and sheltered micro-court.',
    passiveResponse: ['Solar-oriented primary face', 'Compact thermal mass', 'Sheltered outdoor court'],
    geometry: { roof: 'flat', roofPitchDeg: 0, courtyardRatio: 0.1, overhangM: 0.35, balconyDepthM: 0.8, taperPerFloor: 0.035, wallColor: '#d7c39d', roofColor: '#8d8069', accentColor: '#8b3f34' },
    provenance: { basis: 'ORIGINAL TYPOLOGY STUDY', status: 'INDICATIVE', source: 'Ladakh Autonomous Hill Development Council', sourceUrl: 'https://leh.nic.in/', reviewedAt: '2026-09-18', copyrightBoundary: sharedBoundary },
  },
  {
    id: 'bengal-courtyard', name: 'Bengal shaded courtyard house', region: 'West Bengal', states: ['West Bengal'], climates: ['warm-humid'], buildingTypes: ['Residential', 'Community'], plotAreaSqm: { min: 180, max: 3000 }, floorRange: { min: 1, max: 3 },
    summary: 'A courtyard-centred shell with shaded circulation and a strong rain roof.',
    passiveResponse: ['Shaded circulation edge', 'Rain-protected court', 'Cross-ventilation potential'],
    geometry: { roof: 'hipped', roofPitchDeg: 30, courtyardRatio: 0.2, overhangM: 1.1, balconyDepthM: 1.35, taperPerFloor: 0.01, wallColor: '#ddd0b1', roofColor: '#8d4430', accentColor: '#365f57' },
    provenance: { basis: 'ORIGINAL TYPOLOGY STUDY', status: 'INDICATIVE', source: 'West Bengal Tourism — heritage context', sourceUrl: 'https://wbtourism.gov.in/', reviewedAt: '2026-09-18', copyrightBoundary: sharedBoundary },
  },
  {
    id: 'india-neutral-adaptive', name: 'Climate-adaptive neutral shell', region: 'India — location review required', states: [], climates: ['UNKNOWN'], buildingTypes: ['Residential', 'Commercial', 'Mixed Use'], plotAreaSqm: { min: 80, max: 12000 }, floorRange: { min: 1, max: 8 },
    summary: 'A restrained neutral shell used when regional evidence or a locked parcel is unavailable.',
    passiveResponse: ['Adjustable shading', 'Flexible court ratio', 'Material selection remains open'],
    geometry: { roof: 'flat', roofPitchDeg: 0, courtyardRatio: 0.08, overhangM: 0.7, balconyDepthM: 1.3, taperPerFloor: 0.02, wallColor: '#d8dbd8', roofColor: '#6a7471', accentColor: '#a85d32' },
    provenance: { basis: 'ORIGINAL TYPOLOGY STUDY', status: 'INDICATIVE', source: 'Ferrum internal neutral baseline', sourceUrl: '/documentation', reviewedAt: '2026-09-18', copyrightBoundary: sharedBoundary },
  },
]

const normalize = (value: string) => value.trim().toLowerCase()

export function recommendBuildingShells(parcel: ParcelContext | null, limit = 4): ShellRecommendation[] {
  return buildingShellCatalog
    .map((shell) => {
      const reasons: string[] = []
      let score = shell.id === 'india-neutral-adaptive' ? 1 : 0
      if (parcel) {
        if (shell.states.some((state) => normalize(state) === normalize(parcel.state))) { score += 8; reasons.push(`Regional match: ${parcel.state}`) }
        if (parcel.area_sqm > 0 && parcel.area_sqm >= shell.plotAreaSqm.min && parcel.area_sqm <= shell.plotAreaSqm.max) { score += 3; reasons.push(`Plot area ${Math.round(parcel.area_sqm)} m² is within the study range`) }
        if (shell.buildingTypes.some((type) => normalize(type) === normalize(parcel.land_use))) { score += 3; reasons.push(`Recorded use matches ${parcel.land_use}`) }
      }
      if (!reasons.length) reasons.push('Available as a comparative typology; locality fit is unverified')
      const unknowns = [
        ...(!parcel ? ['No locked LandIntel parcel; location, area and land use are UNKNOWN'] : []),
        ...(parcel && parcel.provenance.status !== 'VERIFIED' ? [`Parcel provenance is ${parcel.provenance.status}`] : []),
        'Planning approval, setbacks and height require authority verification',
        'Orientation, access, terrain and adjoining conditions require project evidence',
      ]
      return { shell, score, reasons, unknowns, status: 'INDICATIVE' as const }
    })
    .sort((a, b) => b.score - a.score || a.shell.name.localeCompare(b.shell.name))
    .slice(0, limit)
}

export function getBuildingShell(id: string): BuildingShell {
  return buildingShellCatalog.find((shell) => shell.id === id) ?? buildingShellCatalog.at(-1)!
}
