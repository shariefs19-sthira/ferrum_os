export const SQM_TO_SQFT = 10.763910416709722
export const SQM_PER_CENT = 40.468564224
export const SQM_PER_GUNTHA = 101.17141056
export const SQM_PER_GROUND = 222.967296
export const SQM_PER_ACRE = 4046.8564224
export const METRES_TO_FEET = 3.280839895013123
export const KM_PER_MILE = 1.609344
export const MILES_PER_KM = 1 / KM_PER_MILE

export type AreaUnit = 'sqm' | 'sqft' | 'cent' | 'guntha' | 'ground' | 'acre'
export type DistanceUnit = 'km' | 'mi'

export function kmAndMiles(km: number): { km: number; mi: number } {
  return { km, mi: km * MILES_PER_KM }
}

export function convertArea(areaSqm: number): Record<AreaUnit, number> {
  return {
    sqm: areaSqm,
    sqft: areaSqm * SQM_TO_SQFT,
    cent: areaSqm / SQM_PER_CENT,
    guntha: areaSqm / SQM_PER_GUNTHA,
    ground: areaSqm / SQM_PER_GROUND,
    acre: areaSqm / SQM_PER_ACRE,
  }
}

export function metresAndFeet(metres: number): { metres: number; feet: number } {
  return { metres, feet: metres * METRES_TO_FEET }
}
