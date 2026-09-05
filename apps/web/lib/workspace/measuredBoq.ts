import type { CatalogItem } from "../rateEngine/catalogTypes"
import type { StudioPlan } from "../types"

export type MeasuredBoqLine={item:CatalogItem;quantity:number;unit:string;rateInr:number|null;amountInr:number|null;basis:string}
export const workspaceBoqCatalog:CatalogItem[]=[
 ["earthwork","Excavation","m3"],["pcc","Plain cement concrete blinding","m3"],["rcc-slab","Reinforced concrete slabs","m3"],["rebar","Reinforcement steel","kg"],["blockwork","External blockwork","m2"],["plaster","Internal and external plaster","m2"],["flooring","Floor finish","m2"],["paint","Wall and ceiling paint","m2"],["doors","Internal doors","nos"],["windows","Room windows","nos"],
].map(([id,name,unit],index)=>({id,category:id==="rebar"?"steel":id==="paint"?"paint":id==="doors"?"doors-hardware":"civil",itemCode:`FOS-M-${String(index+1).padStart(3,"0")}`,name,hooks:{unit},price:undefined,gst:undefined})) as CatalogItem[]

export function measureBoq(plan:StudioPlan,catalog:CatalogItem[]=workspaceBoqCatalog):MeasuredBoqLine[]{
 const footprint=plan.buildingWidthM*plan.buildingDepthM
 const gross=footprint*plan.floors
 const wallFace=2*(plan.buildingWidthM+plan.buildingDepthM)*plan.floorHeightM*plan.floors
 const quantities=[footprint*.45,footprint*.075,gross*.125,gross*.125*95,wallFace*.85,wallFace*1.7,gross,wallFace*1.7+gross,plan.rooms.length,plan.rooms.length]
 const bases=["footprint × 0.45 m","footprint × 0.075 m","gross floor area × 0.125 m","RCC volume × 95 kg/m³","perimeter wall face × 85%","perimeter wall face × 1.7 faces","gross floor area","plaster area + ceilings","one per generated room","one per generated room"]
 return catalog.slice(0,10).map((item,index)=>{const rate=item.price?.provenance.status==="VERIFIED-PUBLIC"?item.price.amountInr:null;const quantity=Number(quantities[index].toFixed(item.hooks.unit==="nos"?0:2));return{item,quantity,unit:item.hooks.unit,rateInr:rate,amountInr:rate===null?null:Number((quantity*rate).toFixed(2)),basis:bases[index]}})
}
