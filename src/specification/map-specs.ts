import { TileBase } from "../logic/map/common.notest";
import { AssetReference } from "./assets";


export interface MapSpecs {
    name: string,
    kind: string,
    size: string,
    tags: string[],
    address: string,
    latlon: string[]
}
export interface Map {
    specs: MapSpecs,
    tiles: TileBase[],
    assets: AssetReference[]    // all asset references for the assets necessary to render this map
}