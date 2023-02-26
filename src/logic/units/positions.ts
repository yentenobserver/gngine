import { TileBase } from "../map/common.notest";
import { UnitBase } from "./unit";

export interface UnitPosition {
    unit: UnitBase;
    tile: TileBase;
  }

export class UnitPositions {

    _positions:UnitPosition[];
    constructor(){
      this._positions = [];
    }
  
    get(unitId:string):UnitPosition{
      const unitPosition = this._positions.find((item:UnitPosition)=>{
        return item.unit.uid == unitId
      })
      if(!unitPosition)
        throw new Error(`Can't get unit ${unitId}`);
      
      return unitPosition;
    }
    set(unit:UnitBase, tile:TileBase):void{
      const idx:number = this._positions.findIndex((item:UnitPosition)=>{
        return item.unit == unit
      })
      // if exists replace
      if(idx>=0){
        this._positions[idx] = {unit: unit, tile: tile};
      }else{
        // add new
        this._positions.push({
          unit: unit,
          tile: tile
        })
      }
  
    }
  }
  