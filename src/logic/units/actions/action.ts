import { Events } from "../../../util/eventDictionary.notest";
import { EventEmitter, EventProducer } from "../../../util/events.notest";
import { TileBase } from "../../map/common.notest";
import { CostCalculator, CostCalculatorTerrain, TerrainCost } from "../../map/costs";
import { MapBase, Path, Paths } from "../../map/map";
import { SpecsBase, SpecsLocation } from "../unit";

export interface ActionContext {}

export interface ActionContextUnitMove extends ActionContext {
    to: TileBase
}

export interface ActionContextUnitAttack extends ActionContext {
    target: SpecsBase
    targetTile: TileBase
}

export abstract class ActionBase implements EventProducer{
    emitter: EventEmitter;  
    code: string; // unique action code

    constructor(emitter: EventEmitter, code: string){
        this.emitter = emitter;
        this.code = code;
    }

    abstract rangeAndCosts():Paths;        
    abstract perform(context:ActionContext|undefined):void;
}

export interface Autonomous {
    isAutonomous:boolean;


}

export abstract class ActionUnit extends ActionBase{  
    specs: SpecsBase;
    mapEngine: MapBase|undefined;
    location: SpecsLocation;
    calculator: CostCalculator|undefined;

    constructor(specs: SpecsBase, location: SpecsLocation, calculator: CostCalculator|undefined, mapEngine: MapBase|undefined, emitter:EventEmitter, code: string){
        super(emitter, code);
        this.specs = specs;
        this.mapEngine = mapEngine;
        this.location = location;
        this.calculator = calculator;
    }

    
}

export class ActionUnitMove extends ActionUnit{
    
    constructor(specs: SpecsBase, location: SpecsLocation, terrainCost: TerrainCost, mapEngine: MapBase, emitter: EventEmitter){
        let calculator:CostCalculator = new CostCalculatorTerrain(terrainCost);
        super(specs, location, calculator, mapEngine,emitter, "ActionUnitMove");
    }

    rangeAndCosts(): Paths {
        return this.mapEngine!.paths(this.calculator!, this.location.tile, undefined, this.specs.actionPoints );
        // throw new Error("Method not implemented.");
    }  
    perform(_context: ActionContextUnitMove): void {
        const paths = this.rangeAndCosts();
        const path = paths.paths.get(_context.to);
        if(!path)
            throw new Error(`Path not found to ${_context.to.id}`);
        this.emitter.emit(Events.UNIT.POSITION, this.specs, path.target);
        this.emitter.emit(Events.UNIT.CONSUME_AP, this.specs, path.cost);        
    }
}

export class ActionUnitAttack extends ActionUnit{
    
    constructor(specs: SpecsBase, location: SpecsLocation, terrainCost: TerrainCost, mapEngine: MapBase, emitter: EventEmitter){
        let calculator:CostCalculator = new CostCalculatorTerrain(terrainCost);
        super(specs, location, calculator, mapEngine, emitter, "ActionUnitAttack");
    }

    rangeAndCosts(): Paths {
        return this.mapEngine!.paths(this.calculator!, this.location.tile, undefined, this.specs.actionPoints );
        // throw new Error("Method not implemented.");
    } 
    perform(_context: ActionContextUnitAttack): void {
        const paths = this.rangeAndCosts();
        const path = paths.paths.get(_context.targetTile);
        if(!path)
            throw new Error(`Path not found to ${_context.targetTile.id}`);
        
        const nearEnemyTile = path.steps[path.steps.length-2];
        
        this.emitter.emit(Events.UNIT.POSITION, this.specs, nearEnemyTile);
        this.emitter.emit(Events.UNIT.BATTLE, this.specs, _context.target, _context.targetTile);
        this.emitter.emit(Events.UNIT.CONSUME_AP, this.specs, path.cost);               
    }   
}

export class ActionUnitFortify extends ActionUnit{
    

    constructor(specs:SpecsBase, location: SpecsLocation, emitter: EventEmitter){
        super(specs, location, undefined, undefined, emitter, "ActionUnitFortify");
    }

    _actionCost(){
        return Math.max(this.specs.actionPoints,1);
    }

    rangeAndCosts(): Paths {
        const pathMap = new Map<TileBase, Path>();
        pathMap.set(this.location.tile, {
            // fortification consumes all action points
            cost: this._actionCost(),
            // origin tile is the unit location
            origin: this.location.tile,
            // empty steps as origin == target
            steps: [],
            // target tile is the unit location
            target: this.location.tile
        })
        const paths:Paths = {
            origin: this.location.tile,
            paths: pathMap
        }
        return paths;
        // throw new Error("Method not implemented.");
    }  
    perform(): void {
        const actionPoints = this._actionCost();
        this.emitter.emit(Events.UNIT.RUNNER_ACTION, this.specs, this);
        this.emitter.emit(Events.UNIT.CONSUME_AP, this.specs, actionPoints);                   
    }  
}

export class ActionUnitFieldOfView extends ActionUnit implements Autonomous{
    
    isAutonomous: boolean;

    constructor(specs: SpecsBase, location: SpecsLocation, calculator: CostCalculator, mapEngine: MapBase, emitter: EventEmitter){
        super(specs, location, calculator, mapEngine, emitter, "ActionUnitFieldOfView")
        this.isAutonomous = true;        
    }
    
    rangeAndCosts(): Paths {
        return this.mapEngine!.paths(this.calculator!, this.location.tile, undefined, this.specs.sight );
        // throw new Error("Method not implemented.");
    }  
    
    perform(_context: ActionContext | undefined): void {
        const fovPaths = this.rangeAndCosts();
        const fovTiles:TileBase[] = [];

        fovPaths.paths.forEach((_path:Path, tile:TileBase)=>{
            fovTiles.push(tile);
        })

        fovTiles.push(fovPaths.origin);
        this.emitter.emit(Events.MAP.FOV,fovTiles);
        // emit(MAP_FOV, fovTiles) 
        
    }  
}
export class ActionUnitLandFieldOfView extends ActionUnitFieldOfView implements Autonomous{

    constructor(specs: SpecsBase, location: SpecsLocation, terrainCost: TerrainCost, mapEngine: MapBase, emitter: EventEmitter){
        let calculator:CostCalculator = new CostCalculatorTerrain(terrainCost);
        super(specs, location, calculator, mapEngine, emitter);
        this.code = "ActionUnitLandFieldOfView"
    }  
} 
// 1. when action is selected - draw range
  //  2. eventual  show paths when hovering over tiles within range
  // 3. when actiom is performed - consume action points and/or according to path cost
  //  4. eventual change position according to path
