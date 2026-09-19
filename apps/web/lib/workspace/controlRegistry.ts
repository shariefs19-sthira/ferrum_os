import type { StudioParameters } from "../types"
export type ProductControlId='landintel'|'designstudio'|'structura'|'boq-pro'|'promarket'|'buildos'|'procurehub'|'investflow'|'communitybuild'|'transact'
export type ControlValueRef='ruleset:maxFloors'|'ruleset:minSetbackM'|'ruleset:maxSetbackM'
export type ControlValue=number|ControlValueRef
export type ControlDefinition={id:string;label:string;type:'slider'|'chip'|'toggle';param:keyof StudioParameters;min?:ControlValue;max?:ControlValue;step?:number;options?:Array<{label:string;value:number}>;offValue?:number;onValue?:number;help:string}
const height=(id:string,label:string):ControlDefinition=>({id,label,type:'slider',param:'floors',min:1,max:'ruleset:maxFloors',step:1,help:'Changes storeys within the indicative sample-rules ceiling.'})
// Only DesignStudio owns building-model knobs (storeys). Every other product's
// real controls live in its own tool (components/workspace/ProductToolSurface),
// so mapping floors/setback onto Land, Structure, Cost, ... as "proxies" was
// misleading and has been removed. Entries stay (empty) so the id space is total.
export const productControlRegistry:Record<ProductControlId,ControlDefinition[]>={
 landintel:[],designstudio:[height('design-height','How tall?')],structura:[],'boq-pro':[],promarket:[],buildos:[],procurehub:[],investflow:[],communitybuild:[],transact:[],
}
export function resolveControlValue(value:ControlValue|undefined,context:{maxFloors:number;minSetbackM:number;maxSetbackM:number},fallback:number){if(typeof value==='number')return value;if(value==='ruleset:maxFloors')return context.maxFloors;if(value==='ruleset:minSetbackM')return context.minSetbackM;if(value==='ruleset:maxSetbackM')return context.maxSetbackM;return fallback}
