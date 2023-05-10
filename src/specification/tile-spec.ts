import { TileBase } from "../logic/map/common.notest";
import { AssetReference } from "./assets";

export interface TileSpecs {
    tile: TileBase,
    asset: AssetReference
}