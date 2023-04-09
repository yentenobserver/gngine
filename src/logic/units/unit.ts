import { TileBase } from "../map/common.notest";
import { ActionBase } from "./actions/action";

export class ActionRunner {

}

export interface Actionable {
    actionsAllowed: ActionBase[];
    actionsQueue: ActionBase[];
    actionRunner: ActionBase|undefined
}

export abstract class UnitActionable implements Actionable {
    actionsAllowed: ActionBase[];
    actionsQueue: ActionBase[];
    actionRunner: ActionBase | undefined;
    
    constructor(){
        this.actionsAllowed = [];
        this.actionsQueue = [];        
    }
}

export class UnitSpecs {
    tuid: string; // unit type id
    name: string; // unit type name
    hitPoints: number; // unit type initial hitPoints

    constructor(){
        this.tuid = ""
        this.name = ""
        this.hitPoints = 10;
    }
}

export abstract class UnitBase extends UnitActionable implements SpecsBase, SpecsType, SpecsFlag {
    uid: string;
    actionPoints: number;
    hitPoints: number;
    unitSpecification: UnitSpecs;

    sight: number;
    strength: number;
    rangeStrength: number;

    flag: string;
          
    constructor(){
        super();                
        this.actionPoints = 0;
        this.hitPoints = 0;
        this.uid = ""
        this.unitSpecification = {
            hitPoints: 10,
            name: "DEFAULT",
            tuid: "T_DEFAULT"
        };
        this.sight = 0;
        this.strength = 0;
        this.rangeStrength = 0;
        this.flag = "#FF0000"   // red team by default
    }
    

    abstract attackStrength(unit: UnitBase):number;
    abstract defendStrength(unit: UnitBase):number;
    abstract gainBattleExperience(enemyStrength: number,damageInflicted: number,damageTaken: number):void;
}
/**
 * View to a unit instance data
 */
export interface Specs {}
/**
 * Unit instance base data
 */
export interface SpecsBase extends Specs {
    uid: string;
    actionPoints: number;
    hitPoints: number;
    sight: number;
    strength: number;
    rangeStrength: number;    
}
export interface SpecsFlag extends Specs{
    flag: string // hex color of flag
}
/**
 * Unit instance location data
 */
export interface SpecsLocation extends Specs {
    tile: TileBase    
}
/**
 * Unit instance type data
 */
export interface SpecsType extends Specs {
    unitSpecification: UnitSpecs;  
}