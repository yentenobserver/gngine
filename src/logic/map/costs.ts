import { TileBase, TileTerrainLandModifications } from "./common.notest";

export interface TerrainCost {
    MOUNTAINS: number,
    HILLS: number,
    PLAINS: number,
    RIVER: number,
    IMPASSABLE: number
}

export abstract class CostCalculator {
    abstract cost(from: TileBase, to: TileBase):number;
}

export class CostCalculatorConst extends CostCalculator{
    
    constCost:number;

    constructor(cost:number){
        super();
        this.constCost = cost
    }

    cost(_from: TileBase, _to: TileBase): number {
        return this.constCost;
    }

}

export class CostCalculatorTerrain extends CostCalculator{
    
    terrainCost:TerrainCost;

    constructor(terrainCost:TerrainCost){
        super();
        this.terrainCost = terrainCost
    }

    cost(_from: TileBase, _to: TileBase): number {
        let s = _to.t.kind as keyof TerrainCost;
        
        // also handle impassable terrain which is a modification of terrain
        if(_to.t.modifications?.join(",").includes(TileTerrainLandModifications.IMPASSABLE)){
            s = "IMPASSABLE" as keyof TerrainCost
        };        
        
        const cost: number = this.terrainCost[s];     
        if(!cost)
            throw new Error("Invalid arguments")   
        return cost;
    }

}