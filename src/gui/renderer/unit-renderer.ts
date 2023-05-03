import { Object3D, SpriteMaterial, Sprite, ColorRepresentation, Box3, Material, CanvasTexture } from "three";
import { TileBase } from "../../logic/map/common.notest";
import { Actionable, SpecsBase, SpecsFlag, SpecsType, UnitBase } from "../../logic/units/unit";
import { EventEmitter } from "../../util/events.notest";
import { PlaygroundView, PlaygroundViewThreeJS } from "../playground/playground";
import { DocumentCanvasContextProvider, MapPositionProvider, OrientationProvider } from "./providers";
import { Renderable, RenderablesFactory, RenderablesThreeJSFactory, SpawnSpecification } from "./renderables-factory";

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

export interface UnitSpawnSpecification extends SpawnSpecification{
    unit: SpecsBase&SpecsType&Actionable&SpecsFlag
}

export interface UnitRenderablesFactory extends RenderablesFactory{
    /**
     * Spawns new renderable for given unit data.
     * @param unit unit type and instance data to be spawned
     * @returns {Renderable} renderable or error is thrown when none can be spawned
     */
    spawn(unit: UnitSpawnSpecification):Renderable;

    _addHPBar(renderable: Renderable, unit: SpecsBase&SpecsType):void;
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
    constructor(loader:any){
        super(loader);        
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
    spawn(unit: UnitSpawnSpecification):Renderable{
        // it is assumed that the model items should be named accordingly to following rules
        // [STATE]_[HITPOINTS]_UNIT
        // the factory will translate unit data into proper object name
        // algorith:
        // [STATE] = unit.actionRunner.code or "DEFAULT" when not found
        // [HITPOINTS] = Math.round(10*unit.hitPoints/unit.unitSpecification.hitPoints), when not found search by adding 1 until one is found
        const names = this._generateNames(unit.unit);

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
            throw new Error(`No template found for unit type ${unit.unit.unitSpecification.name} ${unit.unit.unitSpecification.tuid}`);

        this._addHPBar(renderable, unit.unit);
        this._addFlag(renderable, unit.unit);
        // console.log(JSON.stringify(renderable.data.toJSON()));
        return renderable;
    }

    _addHPBar(renderable: Renderable, unit: SpecsBase&SpecsType){
        const object3D = <Object3D>renderable.data;
        var bbox = new Box3().setFromObject(object3D);
        // console.log("BBOX", bbox);
        const hitPoints = Math.round(10*unit.hitPoints/unit.unitSpecification.hitPoints);
        const colors:ColorRepresentation[] = [
            0xff0a0a, 0xff0a0a, 0xff0a0a,  // 0-2 hp
            0xfbf300, 0xfbf300, 0xfbf300,  // 3-5 hp
            0xf2c006, 0xf2c006, 0xf2c006,  // 6-8 hp
            0x3adb1a, 0x3adb1a              // 9-10 hp
        ]
        const lengths:number[] = [
            0.2, 0.2, 0.2,  // 0-2 hp
            0.5, 0.5, 0.5,  // 3-5 hp
            0.75, 0.75, 0.75,  // 6-8 hp
            1, 1              // 9-10 hp
        ]
        const material = new SpriteMaterial( { color: colors[hitPoints] } );
        const sprite = new Sprite( material );
        sprite.name = "UI_HP_BAR"
        // sprite.scale.set(1, lengths[hitPoints],0);
        // sprite.position.set(0, 0, lengths[hitPoints]-1);
        sprite.scale.set(0.5*lengths[hitPoints], 0.075, 1);
        // sprite.position.set((0.5*lengths[hitPoints]-0.5)/2 , 0, bbox.max.z+(0.5*bbox.max.z));
        sprite.position.set(0 , 0, bbox.max.z+(2*bbox.max.z));
        object3D.add(sprite);
        // console.log(object3D);
        
    }

    _addFlag(renderable: Renderable, unit: SpecsFlag):void{
        const object3D = <Object3D>renderable.data;
        var bbox = new Box3().setFromObject(object3D);

        const width:number = 256;
        const height:number = 256
        const offset:number = 30;
        // const offsetX:number = offset/Math.sqrt(2);
        const offsetY:number = offset/Math.sqrt(2);
        const borderColor: string = "#FFFFFF"

        const canvas = DocumentCanvasContextProvider.getInstance().createCanvas(width,height);
        var ctx = canvas.getContext( '2d' );
        // draw the triangle (it will be the border)
        ctx.beginPath();
        ctx.moveTo( 0, 0 );
        ctx.lineTo( width, 0 );
        ctx.lineTo( width/2, height );
        ctx.fillStyle = borderColor; // set dynamic color here
        ctx.fill();

        // draw the internal (offset) triangle (it will be the body)
        ctx.beginPath();
        ctx.moveTo( 0+offset, 0+offsetY );
        ctx.lineTo( width-offset, 0+offsetY );
        ctx.lineTo( width/2, height-offset );
        ctx.fillStyle = unit.flag; // set dynamic color here
        ctx.fill();

        const texture = new CanvasTexture( canvas );
        const material = new SpriteMaterial( { map: texture } );
        const sprite = new Sprite(material);
        sprite.scale.set(0.2,0.2,1)
        sprite.name = "UI_FLAG"
        // add it higher than the HP BAR
        sprite.position.set(0 , 0, bbox.max.z+(0.3*bbox.max.z));
        object3D.add(sprite);
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
    orientationProvider: OrientationProvider;

    constructor(emitter: EventEmitter, mapProvider: MapPositionProvider, orientationProvider: OrientationProvider){
        super(emitter);
        this.units = [];
        this.mapProvider = mapProvider
        this.orientationProvider = orientationProvider;
    }

    

    /**
     * Creates unit for rendering and optionally puts it at given position
     * @param unit unit to be created and rendered
     * @param at tile at which render should be rendered, when not provided then unit is not rendered unless move is called
     * @param direction direction where to face the unit
     */
    abstract put(unit: UnitBase, _at?: TileBase, direction?: string):void;

    /**
     * Removes using from rendering. The unit is no longer rendered at it's current positions
     * @param unit unit to be removed
     */
    abstract remove(unit: UnitBase): void;

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
    static MAP_NAME: string = "THE_MAP";
    view: PlaygroundViewThreeJS|undefined;
    holderObject: Object3D;

    constructor(emitter: EventEmitter, mapProvider: MapPositionProvider, orientationProvider: OrientationProvider){
        super(emitter, mapProvider, orientationProvider);
        this.holderObject = new Object3D();
        this.holderObject.name = UnitsRendererThreeJS.NAME;
    }
    initialize(): Promise<void> {
        // this.holderObject.add(new AxesHelper( 40 ) )
        // return this.renderablesFactory!.loadTemplates(["_UNIT"]);
        return Promise.resolve();
    }

    /**
     * Provides renderer with a view to which renderer will render;
     * @param view target view where to render
     */
    setView(view: PlaygroundView):void{
        this.view = view as PlaygroundViewThreeJS;
        // all units must be added as child objects in map so map controlls work correctly
        const mapObject = this.view.scene.getObjectByName( UnitsRendererThreeJS.MAP_NAME, true );
        if(mapObject)
            // when we have map we must add units under map object for proper map rotation 
            mapObject.add(this.holderObject);
        else{
            this.view.scene.add(this.holderObject);
        }
        
    }
    
    _dispose(object3D:THREE.Mesh){
        if(!object3D.geometry)
            return;
        
        object3D.geometry.dispose();
        
        if(Array.isArray(object3D.material)){
            const materials = object3D.material as Material[];
            materials.forEach((material)=>{
                material.dispose();    
            })
        }else{
            const material =  object3D.material as Material;
            material.dispose()
        }
        
        // todo texture?
    }

    /**
     * Removes and cleans resources for the unit.
     * @param unit unit to be removed and cleaned from memory
     */
    remove(unit: UnitBase): void {
        const that = this;
        // find the object
        let objects3D = that.holderObject.children.filter((item)=>{            
            return item.userData.unitData.uid == unit.uid;
        })

        if(objects3D&&objects3D[0]){
            let object3D = objects3D[0];
            // remove
            that.holderObject.remove(object3D);
            
            

            // release memory            
            // that._dispose(object3D as THREE.Mesh);
            object3D.traverse((child)=>{
                
                that._dispose(child as THREE.Mesh)
            })
        }
    }
    

    /**
     * Creates unit for rendering and optionally puts it at given position
     * @param unit unit to be created and rendered
     * @param at tile at which render should be rendered, when not provided then unit is not rendered unless move is called
     * @param direction direction where to face the unit
     */
    put(unit: UnitBase, _at?: TileBase, direction?: string):void{
        const renderable = (<UnitRenderablesFactory>this.renderablesFactory!).spawn({unit: unit});
        const object3D = renderable.data as Object3D;
        const scenePosition = this.mapProvider.yxToScenePosition(_at!.y,_at!.x);                

        const unitDirection = direction || "S";
        this.units.push({
            unit: unit,            
            renderable: renderable,
            direction:unitDirection,
        })

        this.holderObject.add(object3D);
        object3D.position.set( scenePosition.x, scenePosition.y,scenePosition.z)
        console.log(`Putting unit ${unit.uid}(${unit.unitSpecification.name}) at tile ${_at?.id}`)
        console.log(`Position is ${JSON.stringify(object3D.position)}`)
        // this._directionRotate(object3D, cDirection)
        this.orientationProvider.orientate(object3D, unitDirection);
        
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