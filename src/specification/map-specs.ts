import { TileSpecs } from "./tile-spec";

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
    tiles: TileSpecs[]
}