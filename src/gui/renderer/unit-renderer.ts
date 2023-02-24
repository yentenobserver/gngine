import { TileBase } from "../../logic/map/common.notest";
import { UnitBase } from "../../logic/units/unit";
import { EventEmitter } from "../../util/events.notest";
import { Renderable, RenderablesFactory, RenderableSpecificationItem, RenderablesSpecification } from "./renderables-factory";

import { MapPositionProvider, Renderer } from "./renderers";

interface UnitHolder{
    unit: UnitBase,
    renderable: Renderable,
    direction: string
}

export enum RenderableWorkerState {
    DEFAULT = "Default"
}

export interface RenderableWorkerEvent {
    state?: RenderableWorkerState,
    data: any
}

export interface RenderableWorkerStateMapItem {
    state: RenderableWorkerState,
    renderable: Renderable
}

export interface RenderablesSpecificationUnits extends RenderablesSpecification{
    units: UnitRenderableSpecificationItem[]
}

export interface UnitRenderableSpecificationItem{    
    state: RenderableWorkerState       
}


export interface RenderableWorker {
    // factory that will be used for spawning renderables to be rendered
    factory: RenderablesFactory;
    // stores eventual renderable version of the item that shall be managerd by this worker
    renderables: RenderableWorkerStateMapItem[];

    // specification for renderables
    specification: RenderablesSpecification;
    
    // current state of the worker, there might be a different renderable used for different states
    state: RenderableWorkerState;

    /**
     * Renderable worker should respond accordingly to this event
     * @param event 
     */
    onEvent(event: RenderableWorkerEvent):void;
    /**
     * Displays renderable
     */
    show():void;
    /**
     * Hides renderable
     */
    hide():void;
    /**
     * Releases renderable resources (if any)
     */
    dispose():void;

    /**
     * Should create all necessary renderables for all possible worker states
     */
    start():Promise<void>;

}



/**
 * Stores and manages render of the given unit
 */
export abstract class RenderableWorkerUnits implements RenderableWorker{
    factory: RenderablesFactory;
    renderables: RenderableWorkerStateMapItem[];
    state: RenderableWorkerState;
    specification: RenderablesSpecification;

    constructor(factory: RenderablesFactory){
        this.factory = factory;
        this.renderables = [];
        this.state = RenderableWorkerState.DEFAULT
        this.specification = factory.specification;
    }
    

    abstract onEvent(event: RenderableWorkerEvent):void;
    abstract show(): void;
    abstract hide(): void;
    abstract dispose(): void;
    start():Promise<void>{
        (<RenderablesSpecificationUnits>this.specification).units
        .forEach((item: UnitRenderableSpecificationItem)=>{
            item.
        })
        this.factory.spawnRenderableObject()
    }   
}

export class RenderableWorkerUnitsThreeJs extends RenderableWorkerUnits{

    /**
     * Should generate 
     * @param unit 
     */
     abstract _createHitPointsIndicator(unit: UnitHolder):void;
}

/**
 * Renders units (usually on map but not always)
 */
export abstract class UnitsRenderer extends Renderer {
    units: UnitHolder[];
    mapProvider: MapPositionProvider;
    constructor(emitter: EventEmitter, mapProvider: MapPositionProvider){
        super(emitter);
        this.units = [];
        this.mapProvider = mapProvider
    }

    
    

    /**
     * Creates unit for rendering and optionally puts it at given position
     * @param unit unit to be created and rendered
     * @param at tile at which render should be rendered, when not provided then unit is not rendered unless move is called
     * @param direction direction where to face the unit
     */
    put(unit: UnitBase, at?: TileBase, direction?: string):void{
        const renderable = this.renderablesFactory!.spawnRenderableObject(unit.unitSpecification!.tuid);
        // todo add hitpoints bar
        // todo add unit icon sprite

        const unitDirection = direction || "S";
        this.units.push({
            unit: unit,            
            renderable: renderable,
            direction:unitDirection,
        })
        if(at){
            this.move(unit, at, unitDirection);
        }        
    }

    /**
     * Triggers unit appearance at to (when from is empty) or unit move (probably
     * with animation) between from and to.
     * When there is no such unit created exception is thrown
     * @param unit target unit
     * @param to target tile
     * @param direction direction where to face the unit at "to" position
     * @param from start tile
     */
    abstract move(unit: UnitBase, to: TileBase, direction: string, from?:TileBase):void    
}