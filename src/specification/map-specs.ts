import { TileBase } from "../logic/map/common.notest";
import { AssetReference } from "./assets";

export interface MapSpecsOptions {
    backgroundImgUrl?: string
    showGrid?:boolean
}

export interface MapSpecs {
    id: string,    
    name: string,
    kind: string,
    size: string,
    tags: string[],
    address: string,
    latlon: string[],
    isPublic?: boolean // when true than map is available to all users
    options?: MapSpecsOptions
}
/**
 * Describes ready to render map with all necessary assets' data.
 */
export interface Map {
    specs: MapSpecs,
    tiles?: TileBase[],
    assets?: AssetReference[]    // all asset references for the assets necessary to render this map
}