import { TileBase } from "../map/common.notest";
import { ActionBase } from "./actions/action";

export class ActionRunner {

}

export interface Actionable {
    actionsAllowed: ActionBase[];
    actionsQueue: ActionBase[];
    actionRunner: ActionRunner|undefined
}

export abstract class UnitActionable implements Actionable {
    actionsAllowed: ActionBase[];
    actionsQueue: ActionBase[];
    actionRunner: ActionRunner | undefined;
    
    constructor(){
        this.actionsAllowed = [];
        this.actionsQueue = [];        
    }
}

export class UnitSpecs {
    tuid: string;
    name: string;

    constructor(){
        this.tuid = ""
        this.name = ""
    }
}

export abstract class UnitBase extends UnitActionable implements SpecsBase {
    uid: string;
    actionPoints: number;
    hitPoints: number;
    unitSpecification: UnitSpecs|undefined;

    sight: number;
    strength: number;
    rangeStrength: number;

    i: string; // unit unique id
    ap: number;
    
    constructor(){
        super();
        this.ap = 0;
        this.i = "";
        this.actionPoints = 0;
        this.hitPoints = 0;
        this.uid = ""
        this.unitSpecification = undefined;
        this.sight = 0;
        this.strength = 0;
        this.rangeStrength = 0;
    }

    abstract attackStrength(unit: UnitBase):number;
    abstract defendStrength(unit: UnitBase):number;
    abstract gainBattleExperience(enemyStrength: number,damageInflicted: number,damageTaken: number):void;
}

export interface Specs {}

export interface SpecsBase extends Specs {
    uid: string;
    actionPoints: number;
    hitPoints: number;
    sight: number;
    strength: number;
    rangeStrength: number;    
}

export interface SpecsLocation extends Specs {
    tile: TileBase    
}