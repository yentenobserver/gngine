import { TileBase } from "../logic/map/common.notest";
import { AssetSpecs } from "./assets";

export interface TileSpecs {
    tile: TileBase,
    asset: AssetSpecs
}