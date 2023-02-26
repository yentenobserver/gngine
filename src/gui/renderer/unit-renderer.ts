import { Object3D } from "three";
import { TileBase } from "../../logic/map/common.notest";
import { Actionable, SpecsBase, SpecsType, UnitBase } from "../../logic/units/unit";
import { EventEmitter } from "../../util/events.notest";
import { PlaygroundView, PlaygroundViewThreeJS } from "../playground/playground";
import { MapPositionProvider } from "./map-renderers";
import { Renderable, RenderablesFactory, RenderablesSpecification, RenderablesThreeJSFactory } from "./renderables-factory";

import { Renderer } from "./renderers";


interface UnitHolder{
    unit: UnitBase,
    renderable: Renderable,
    direction: string
}

// export enum RenderableWorkerState {
//     DEFAULT = "Default"
// }

// export interface RenderableWorkerEvent {
//     state?: RenderableWorkerState,
//     data: any
// }

// export interface RenderableWorkerStateMapItem {
//     state: RenderableWorkerState,
//     renderable: Renderable
// }

// export interface RenderablesSpecificationUnits extends RenderablesSpecification{
//     units: UnitRenderableSpecificationItem[]
// }

// export interface UnitRenderableSpecificationItem{    
//     state: RenderableWorkerState       
// }

export interface UnitRenderablesFactory extends RenderablesFactory{
    /**
     * Spawns new renderable for given unit data.
     * @param unit unit type and instance data to be spawned
     * @returns {Renderable} renderable or error is thrown when none can be spawned
     */
    spawn(unit: SpecsBase&SpecsType&Actionable):Renderable;
}

/**
 * Renderable factory for units. It spawns assets for a given unit type and unit instance (state and hit points). 
 * It is assumed that associated asset should have at least one object which matches following name criteria:
 * [TYPE]_[STATE]_[HITPOINTS]_UNIT
 * 
 * algorithm:
 * [TYPE] = unit.unitSpecification.tuid
 * [STATE] = unit.actionRunner.code or "DEFAULT" when not found
 * [HITPOINTS] = Math.round(10*unit.hitPoints/unit.unitSpecification.hitPoints), when not found search by adding 1 until one is found
 * 
 * So if one wants to have only one asset rendered regardless of state and remaining hitpoints one should have an asset named
 * DEFAULT_10_UNIT. This asset will be selected when no better matching asset is found.
 * 
 */
export class UnitRenderablesThreeJSFactory extends RenderablesThreeJSFactory implements UnitRenderablesFactory {
    constructor(specification: RenderablesSpecification, loader:any){
        super(specification, loader);        
    }

    /**
     * Build list of asset names to spawn according to algorithm. First we try to find most matching asset of given unit type ie. matching both current state
     * of unit (running action) and unit's hitpoints. If none is found we try to find a matching state with the closest hitpoints. If none is found then we try to find a DEFAULT state asset with matching hit points.
     * When none is found then we find a DEFAULT state asset with more hit points (moving up) then the unit's hit points.
     * If none found then a fallback asset should be loaded ie. asset named DEFAULT_10_UNIT.
     * @param unit 
     * @returns 
     */
    _generateNames(unit: SpecsBase&SpecsType&Actionable):string[]{
        // first try finding with state and HP matching
        // then try to find with state and most close HP matching
        // then try to find with DEFAULT and HP matching
        // then try to find with DEFAULT and most close HP matching moving up (up to 10).
        

        const namesToCheck = [];

        const hitPoints = Math.round(10*unit.hitPoints/unit.unitSpecification.hitPoints);

        // generate all possible names to find
        // start with state
        if(unit.actionRunner){
            for(let i=hitPoints; i<=10; i++){
                let currentName = `${unit.unitSpecification.tuid}_${unit.actionRunner.code}_${i}_UNIT`;
                namesToCheck.push(currentName);
            }
        }
        // now lets check DEFAULT state
        for(let i=hitPoints; i<=10; i++){
            let currentName = `${unit.unitSpecification.tuid}_DEFAULT_${i}_UNIT`;
            namesToCheck.push(currentName);
        }

        return namesToCheck;        
    }

    /**
     * Spawns new renderable for given unit data.
     * @param unit unit type and instance data to be spawned
     * @returns {Renderable} renderable or error is thrown when none can be spawned
     */
    spawn(unit: SpecsBase&SpecsType&Actionable):Renderable{
        // it is assumed that the model items should be named accordingly to following rules
        // [STATE]_[HITPOINTS]_UNIT
        // the factory will translate unit data into proper object name
        // algorith:
        // [STATE] = unit.actionRunner.code or "DEFAULT" when not found
        // [HITPOINTS] = Math.round(10*unit.hitPoints/unit.unitSpecification.hitPoints), when not found search by adding 1 until one is found
        const names = this._generateNames(unit);

        let renderable = undefined;

        for(let i=0; i<names.length; i++){
            try{
                renderable = this.spawnRenderableObject(names[i]);
                // return first match, do not check any more
                break;
            }
            catch(error:any){}
            finally{}
        }
        if(!renderable)
            throw new Error(`No template found for unit type ${unit.unitSpecification.name} ${unit.unitSpecification.tuid}`);

        return renderable;
    }
}

// /**
//  * unit with hit points
//  */
// export class UnitRenderableFactory {
//     // defines which type of units this renderer handles
//     unitType: SpecsType;
//     // factory capable of spawning multiple flavours of units
//     renderablesFactory: RenderablesFactory;

//     constructor(unitType: SpecsType, renderablesFactory: RenderablesFactory){
//         this.unitType = unitType;
//         this.renderablesFactory = renderablesFactory;
//     }

//     // creates new renderable flavour of given unit type
//     spawn(flavour: string):Renderable{
//         return this.renderablesFactory.spawnRenderableObject(flavour);
//     };
//     // should be called before spawn() calls are made
//     initialize():Promise<void>{
//         return this.renderablesFactory.loadTemplates([`${this.unitType.unitSpecification.tuid}_UNIT`]);
//     };
// }

// export interface UnitRendererThreeJs extends UnitRenderer{
//     // factory that will be used for spawning renderables to be rendered
//     renderablesFactory: RenderablesFactory;

    
// }

// export interface RenderableWorker {
//     // factory that will be used for spawning renderables to be rendered
//     factory: RenderablesFactory;
//     // stores eventual renderable version of the item that shall be managerd by this worker
//     renderables: RenderableWorkerStateMapItem[];

//     // specification for renderables
//     specification: RenderablesSpecification;
    
//     // current state of the worker, there might be a different renderable used for different states
//     state: RenderableWorkerState;

//     /**
//      * Renderable worker should respond accordingly to this event
//      * @param event 
//      */
//     onEvent(event: RenderableWorkerEvent):void;
//     /**
//      * Displays renderable
//      */
//     show():void;
//     /**
//      * Hides renderable
//      */
//     hide():void;
//     /**
//      * Releases renderable resources (if any)
//      */
//     dispose():void;

//     /**
//      * Should create all necessary renderables for all possible worker states
//      */
//     start():Promise<void>;

// }



// /**
//  * Stores and manages render of the given unit
//  */
// export abstract class RenderableWorkerUnits implements RenderableWorker{
//     factory: RenderablesFactory;
//     renderables: RenderableWorkerStateMapItem[];
//     state: RenderableWorkerState;
//     specification: RenderablesSpecification;

//     constructor(factory: RenderablesFactory){
//         this.factory = factory;
//         this.renderables = [];
//         this.state = RenderableWorkerState.DEFAULT
//         this.specification = factory.specification;
//     }
    

//     abstract onEvent(event: RenderableWorkerEvent):void;
//     abstract show(): void;
//     abstract hide(): void;
//     abstract dispose(): void;
//     start():Promise<void>{
//         (<RenderablesSpecificationUnits>this.specification).units
//         .forEach((item: UnitRenderableSpecificationItem)=>{
//             item.
//         })
//         this.factory.spawnRenderableObject()
//     }   
// }

// export class RenderableWorkerUnitsThreeJs extends RenderableWorkerUnits{

//     /**
//      * Should generate 
//      * @param unit 
//      */
//      abstract _createHitPointsIndicator(unit: UnitHolder):void;
// }

/**
 * Renders units (usually on map but not always).
 * One when setting renderablesFactory must provide an UnitRenderableFactory
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
    abstract put(unit: UnitBase, _at?: TileBase, direction?: string):void;

    // /**
    //  * Triggers unit appearance at to (when from is empty) or unit move (probably
    //  * with animation) between from and to.
    //  * When there is no such unit created exception is thrown
    //  * @param unit target unit
    //  * @param to target tile
    //  * @param direction direction where to face the unit at "to" position
    //  * @param from start tile
    //  */
    // abstract move(unit: UnitBase, to: TileBase, direction: string, from?:TileBase):void    
}
export class UnitsRendererThreeJS extends UnitsRenderer {
    static NAME: string = "THE_UNITS";
    view: PlaygroundViewThreeJS|undefined;
    holderObject: Object3D;

    constructor(emitter: EventEmitter, mapProvider: MapPositionProvider){
        super(emitter, mapProvider);
        this.holderObject = new Object3D();
        this.holderObject.name = UnitsRendererThreeJS.NAME;
    }
    initialize(): Promise<void> {
        return this.renderablesFactory!.loadTemplates(["_UNIT"]);
    }

    /**
     * Provides renderer with a view to which renderer will render;
     * @param view target view where to render
     */
    setView(view: PlaygroundView):void{
        this.view = view as PlaygroundViewThreeJS;
        this.view.scene.add(this.holderObject);
    }
    
    /**
     * Creates unit for rendering and optionally puts it at given position
     * @param unit unit to be created and rendered
     * @param at tile at which render should be rendered, when not provided then unit is not rendered unless move is called
     * @param direction direction where to face the unit
     */
    put(unit: UnitBase, _at?: TileBase, direction?: string):void{
        const renderable = (<UnitRenderablesFactory>this.renderablesFactory!).spawn(unit);
        const object3D = renderable.data as Object3D;
        const scenePosition = this.mapProvider.xyToScenePosition(_at!.y,_at!.x);
        // todo add hitpoints bar
        // todo add unit icon sprite

        const unitDirection = direction || "S";
        this.units.push({
            unit: unit,            
            renderable: renderable,
            direction:unitDirection,
        })

        this.holderObject.add(object3D);
        object3D.position.set( scenePosition.x, scenePosition.y,scenePosition.z)
        
        // this._directionRotate(object3D, cDirection)

        
        object3D.userData.unitData = unit

        // if(at){
        //     this.move(unit, at, unitDirection);
        // }        
    }

    // /**
    //  * Triggers unit appearance at to (when from is empty) or unit move (probably
    //  * with animation) between from and to.
    //  * When there is no such unit created exception is thrown
    //  * @param unit target unit
    //  * @param to target tile
    //  * @param direction direction where to face the unit at "to" position
    //  * @param from start tile
    //  */
    // abstract move(unit: UnitBase, to: TileBase, direction: string, from?:TileBase):void    
}