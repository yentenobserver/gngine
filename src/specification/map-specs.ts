import { TileBaseDirected } from "../logic/map/common.notest";
import { AssetReference } from "./assets";

export interface MapSpecsOptions {
    backgroundImgUrl?: string
    showGrid?:boolean
}

export interface MapSpecs {
    id: string, // unique id of the map   
    name: string, // name of the map
    kind: string, // one of HexTile or QuadTile
    size: string, // size of map in "widthxheight" format i.e. 10x5
    tags: string[], // additional tags assigned with map
    address: string, // when map resembles real world place this contains it's address
    latlon: string[], // when map resembles real world place this contains it's location
    isPublic?: boolean // when true than map is available to all users
    options?: MapSpecsOptions // options that manage how map is rendered
}
/**
 * Describes ready to render map with all necessary assets' data.
 */
export interface Map {
    specs: MapSpecs, // map basic data
    tiles?: TileBaseDirected[], // tiles specifications
    assets?: AssetReference[]    // all asset references for the assets necessary to render this map
}