import type { StudioParameters } from "../types"
export type ProductControlId='landintel'|'designstudio'|'structura'|'boq-pro'|'promarket'|'buildos'|'procurehub'|'investflow'|'communitybuild'|'transact'
export type ControlValueRef='ruleset:maxFloors'|'ruleset:minSetbackM'|'ruleset:maxSetbackM'
export type ControlValue=number|ControlValueRef
export type ControlDefinition={id:string;label:string;type:'slider'|'chip'|'toggle';param:keyof StudioParameters;min?:ControlValue;max?:ControlValue;step?:number;options?:Array<{label:string;value:number}>;offValue?:number;onValue?:number;help:string}
const height=(id:string,label:string):ControlDefinition=>({id,label,type:'slider',param:'floors',min:1,max:'ruleset:maxFloors',step:1,help:'Changes storeys within the indicative sample-rules ceiling.'})
const open=(id:string,label:string):ControlDefinition=>({id,label,type:'slider',param:'setbackM',min:'ruleset:minSetbackM',max:'ruleset:maxSetbackM',step:.5,help:'Moves the building edge inward; both metric and imperial readouts update.'})
const families=(id:string,label:string):ControlDefinition=>({id,label,type:'chip',param:'floors',options:[{label:'One',value:1},{label:'Three',value:3},{label:'Five',value:5}],help:'Selects a deterministic occupancy proxy for this indicative massing preview.'})
export const productControlRegistry:Record<ProductControlId,ControlDefinition[]>={
 landintel:[open('land-open','How much open ground?')],designstudio:[height('design-height','How tall?')],structura:[height('structure-levels','How many supported levels?')],'boq-pro':[height('boq-levels','How many floors to measure?')],promarket:[families('market-families','How many families?')],buildos:[height('build-levels','How many active levels?')],procurehub:[families('procure-scale','What project scale?')],investflow:[height('invest-height','How much building potential?')],communitybuild:[families('community-families','How many families?')],transact:[open('transact-envelope','How much boundary margin?')],
}
export function resolveControlValue(value:ControlValue|undefined,context:{maxFloors:number;minSetbackM:number;maxSetbackM:number},fallback:number){if(typeof value==='number')return value;if(value==='ruleset:maxFloors')return context.maxFloors;if(value==='ruleset:minSetbackM')return context.minSetbackM;if(value==='ruleset:maxSetbackM')return context.maxSetbackM;return fallback}
