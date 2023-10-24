import { Object3D} from "three";
import { TileBase } from "gameyngine";

import { EventEmitter } from "eventemitter3";
import { PlaygroundView, PlaygroundViewThreeJS } from "../playground/playground";
import { MapPositionProvider, OrientationProvider } from "./providers";
import { Renderable } from "./renderables-factory";

import { Renderer } from "./renderers";

export interface LayeredRendererOptions {
    interactable: boolean // when true Renderables handled by this Renderer will generate interaction events
}

export interface LayerOptions {
    interactable: boolean // when true Renderables handled by this Renderer will generate interaction events
    interactableNameSuffixes: string[] // Renderables which name ends with any of these will be used for interactions
}

export abstract class LayeredRenderer extends Renderer {    
    mapProvider: MapPositionProvider;
    orientationProvider: OrientationProvider;    
    NAME_PREFIX: string;

    constructor(emitter: EventEmitter, mapProvider: MapPositionProvider, orientationProvider: OrientationProvider){
        super(emitter);        
        this.mapProvider = mapProvider
        this.orientationProvider = orientationProvider;        
        this.NAME_PREFIX = "LAYER_";      
    }    
    /**
     * Registers new layer
     * @param name layer name
     * @param _options options
     */
    abstract registerLayer(name: string, _options?: LayerOptions):void;

    /**
     * Puts renderable at given tile at layer. Important - renderable must be "faced" south and it's origin/pivot point
     * must be at the center of the plane on which the renderable stands.
     * @param renderable renderable object to be rendered on given layer at given location
     * @param layer target layer
     * @param at location of the renderable
     * @param direction where does renderable face
     */
    abstract put(renderable: Renderable, layer: string,  at: TileBase, direction?: string):void;

    /**
     * Removes the renderable from given layer and releases resources
     * @param renderable target renderable to be removed
     * @param layerName layer from which to remove
     */
    abstract remove(renderable: Renderable, layerName: string): void;
}
/**
 * Renders any renderables on dedicated layer (other than map layer)/
 */
export class LayeredRenderer3JS extends LayeredRenderer {    
    layers: Object3D[];   
    view: PlaygroundViewThreeJS|undefined; 
    holderObject: Object3D;

    constructor(emitter: EventEmitter, mapProvider: MapPositionProvider, orientationProvider: OrientationProvider){
        super(emitter, mapProvider, orientationProvider);        
        this.layers = [];     
        this.holderObject = new Object3D();
        this.holderObject.name = "LAYERS"     
    }

    /**
     * Provides renderer with a view to which renderer will render;
     * @param view target view where to render
     */
    setView(view: PlaygroundView):void{
        this.view = view as PlaygroundViewThreeJS;
        this.view.scene.add(this.holderObject);
    }

    registerLayer(name: string, _options?: LayerOptions):void{        
        const theName = `${this.NAME_PREFIX }${name}`;
        const layer = new Object3D();
        layer.name = theName;        
        if(this.hasLayer(name)){
            throw new Error(`Layer already registered ${name} `);
        }
        this.layers.push(layer);
        this.holderObject.add(layer);
        // TODO:  playground - mark suffixes        
    }

    hasLayer(name: string){
        const theName = `${this.NAME_PREFIX }${name}`;
        const exists = this.layers.find((item:Object3D)=>{
            return item.name == theName
        })

        if(exists) return true;
        return false;
    }

    getLayer(name: string):Object3D{
        const theName = `${this.NAME_PREFIX }${name}`;

        const layer = this.layers.find((item:Object3D)=>{
            return item.name == theName
        })

        if(!layer)
            throw new Error(`No such layer ${name}`);

        return layer;
    }

    put(renderable: Renderable, layerName: string,  at: TileBase, direction?: string, data?: any):void{
        const object3D = renderable.data as Object3D;
        const scenePosition = this.mapProvider.yxToScenePosition(at!.y,at!.x);                

        const renderablesDirection = direction || "S";        

        const layer = this.getLayer(layerName);
          
        // make sure we add only when there is no such object
        let existingObject = layer.children.find((item:Object3D)=>{
            return item.uuid == renderable.id && item.type.toLowerCase()=="object3d"
        })
        
        if(!existingObject)
            layer.add(object3D);

        object3D.position.set( scenePosition.x, scenePosition.y,scenePosition.z)        
        this.orientationProvider.orientate(object3D, renderablesDirection);
        
        object3D.userData = data
    }


    remove(renderable: Renderable, layerName: string): void{        
        const layer = this.getLayer(layerName);
        let object = layer.children.find((item:Object3D)=>{
            return item.uuid == renderable.id && item.type.toLowerCase()=="object3d"
        })

        if(!object)
            throw new Error(`No such object ${renderable.id}`);

        layer.remove(object);
        renderable.delete!();
    }
}
// export class UnitsRendererThreeJS extends LayeredRenderer {
//     static NAME: string = "THE_UNITS";
//     static MAP_NAME: string = "THE_MAP";
//     view: PlaygroundViewThreeJS|undefined;
//     holderObject: Object3D;

//     constructor(emitter: EventEmitter, mapProvider: MapPositionProvider, orientationProvider: OrientationProvider){
//         super(emitter, mapProvider, orientationProvider);
//         this.holderObject = new Object3D();
//         this.holderObject.name = UnitsRendererThreeJS.NAME;
//     }
//     initialize(): Promise<void> {
//         // this.holderObject.add(new AxesHelper( 40 ) )
//         // return this.renderablesFactory!.loadTemplates(["_UNIT"]);
//         return Promise.resolve();
//     }

//     /**
//      * Provides renderer with a view to which renderer will render;
//      * @param view target view where to render
//      */
//     setView(view: PlaygroundView):void{
//         this.view = view as PlaygroundViewThreeJS;
//         // all units must be added as child objects in map so map controlls work correctly
//         const mapObject = this.view.scene.getObjectByName( UnitsRendererThreeJS.MAP_NAME, true );
//         if(mapObject)
//             // when we have map we must add units under map object for proper map rotation 
//             mapObject.add(this.holderObject);
//         else{
//             this.view.scene.add(this.holderObject);
//         }
        
//     }
    
//     _dispose(object3D:THREE.Mesh){
//         if(!object3D.geometry)
//             return;
        
//         object3D.geometry.dispose();
        
//         if(Array.isArray(object3D.material)){
//             const materials = object3D.material as Material[];
//             materials.forEach((material)=>{
//                 material.dispose();    
//             })
//         }else{
//             const material =  object3D.material as Material;
//             material.dispose()
//         }
        
//         // todo texture?
//     }

//     /**
//      * Removes and cleans resources for the unit.
//      * @param unit unit to be removed and cleaned from memory
//      */
//     remove(unit: UnitBase): void {
//         const that = this;
//         // find the object
//         let objects3D = that.holderObject.children.filter((item)=>{            
//             return item.userData.unitData.uid == unit.uid;
//         })

//         if(objects3D&&objects3D[0]){
//             let object3D = objects3D[0];
//             // remove
//             that.holderObject.remove(object3D);
            
            

//             // release memory            
//             // that._dispose(object3D as THREE.Mesh);
//             object3D.traverse((child)=>{
                
//                 that._dispose(child as THREE.Mesh)
//             })
//         }
//     }
    

//     /**
//      * Creates unit for rendering and optionally puts it at given position
//      * @param unit unit to be created and rendered
//      * @param at tile at which render should be rendered, when not provided then unit is not rendered unless move is called
//      * @param direction direction where to face the unit
//      */
//     put(unit: UnitBase, _at?: TileBase, direction?: string):void{
//         const renderable = (<UnitRenderablesFactory>this.renderablesFactory!).spawn({unit: unit});
//         const object3D = renderable.data as Object3D;
//         const scenePosition = this.mapProvider.yxToScenePosition(_at!.y,_at!.x);                

//         const unitDirection = direction || "S";
//         this.units.push({
//             unit: unit,            
//             renderable: renderable,
//             direction:unitDirection,
//         })

//         this.holderObject.add(object3D);
//         object3D.position.set( scenePosition.x, scenePosition.y,scenePosition.z)
//         // console.log(`Putting unit ${unit.uid}(${unit.unitSpecification.name}) at tile ${_at?.id}`)
//         // console.log(`Position is ${JSON.stringify(object3D.position)}`)
//         // this._directionRotate(object3D, cDirection)
//         this.orientationProvider.orientate(object3D, unitDirection);
        
//         object3D.userData.unitData = unit

//         // if(at){
//         //     this.move(unit, at, unitDirection);
//         // }        
//     }

//     // /**
//     //  * Triggers unit appearance at to (when from is empty) or unit move (probably
//     //  * with animation) between from and to.
//     //  * When there is no such unit created exception is thrown
//     //  * @param unit target unit
//     //  * @param to target tile
//     //  * @param direction direction where to face the unit at "to" position
//     //  * @param from start tile
//     //  */
//     // abstract move(unit: UnitBase, to: TileBase, direction: string, from?:TileBase):void    
// }