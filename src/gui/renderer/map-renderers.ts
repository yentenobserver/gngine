import * as THREE from 'three'
import { TileBase } from "gameyngine";
import { Events } from '../../util/eventDictionary.notest';
import { EventEmitter } from 'eventemitter3';
import { EngineEvent, PlaygroundInteractionEvent, PlaygroundView, PlaygroundViewThreeJS, TileInteractionOperation } from '../playground/playground';
import { HexFlatTopPositionProviderThreeJs, MapPositionProvider, OrientationProvider, QuadOrientationProviderThreeJs, QuadPositionProviderThreeJs, ScenePosition, TilePosition } from './providers';
import { Renderable, RenderablesThreeJSFactory, RenderableThreeJS } from './renderables-factory';
import { Renderer, RendererOptions } from './renderers';
import { AreaMapIndicatorThreeJs, HexAreaMapIndicator3Js, MapIndicator, QuadAreaMapIndicator3Js } from './map-indicators';
import { Utils3JS } from '../../util/utils3JS';



// export interface TileHexPosition {
    
//     q: number,    
//     r: number,
// }

export interface MapWritable{
    add(object: Renderable):void;
}

export interface MapEvent extends EngineEvent {}
export enum DIRECTION {
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    UP = "UP",
    DOWN = "DOWN",
    IN = "IN",
    OUT = "OUT"
}
export interface MapRotateEvent extends MapEvent {
    direction: DIRECTION // LEFT, RIGHT
}

export interface MapZoomEvent extends MapEvent {
    direction: DIRECTION // IN, OUT
}

class MapPlaygroundEventHandler{
    shiftTiles:TileBase[];
    renderer: MapRenderer;
    constructor(mapRenderer:MapRenderer){
        this.shiftTiles = [];
        this.renderer = mapRenderer;
    }

    _onEvent(event:PlaygroundInteractionEvent|MapEvent|MapRotateEvent):void{
        
        switch(event.type){
            case Events.INTERACTIONS.TILE:
                let tileData:TileBase|undefined = undefined;
                let object:THREE.Object3D|undefined = undefined;
                for(let i=(<PlaygroundInteractionEvent>event).data.hierarchy.length-1; i>= 0; i--){
                    if((<PlaygroundInteractionEvent>event).data.hierarchy[i].userData.tileData){                
                        tileData = (<PlaygroundInteractionEvent>event).data.hierarchy[i].userData.tileData
                        object = (<PlaygroundInteractionEvent>event).data.hierarchy[i]
                    }
                } 
                tileData && (<PlaygroundInteractionEvent>event).originalEvent.type=="pointermove" && this.renderer.highlightTiles([tileData]);
                tileData && (<PlaygroundInteractionEvent>event).originalEvent.type=="pointerdown" && this.renderer.goToTile(tileData, object!);
                
                if(tileData && (<PlaygroundInteractionEvent>event).originalEvent.type=="pointerdown" && !(<PlaygroundInteractionEvent>event).originalEvent.shiftKey){
                    // reset previous
                    this.shiftTiles = [];
                    this.renderer.highlightTiles(this.shiftTiles, "_OnClick", "#1ECBE1")
                    // just in case next is shift click
                    this.shiftTiles.push(tileData);
                    // mark new
                    this.renderer.highlightTiles([tileData], "_OnClick", "#1ECBE1")
                    this.renderer.emitter.emit(Events.INTERACTIONS.MAP.TILE, {
                        type: Events.INTERACTIONS.MAP.TILE,
                        click: tileData, // clicked tile
                        selected: [], // tile selected or multiple tiles selected (with shift)
                        operation: TileInteractionOperation.ADD,
                        viewName: (<PlaygroundInteractionEvent>event).viewName, // name of the view that took part in the interaction
                        originalEvent: (<PlaygroundInteractionEvent>event).originalEvent, // original event from UI that triggered the interaction
                        interactingObject: (<PlaygroundInteractionEvent>event).interactingObject, // the object that took part in the interaction
                        data: (<PlaygroundInteractionEvent>event).data, // additional interaction data
                        worldPosition: (<PlaygroundInteractionEvent>event).worldPosition, // interacting object world position,
                        scenePosition: (<PlaygroundInteractionEvent>event).scenePosition // scene position when interaction took place
                    })
                } 

                if(tileData && (<PlaygroundInteractionEvent>event).originalEvent.type=="pointerdown" && (<PlaygroundInteractionEvent>event).originalEvent.shiftKey){
                    const isAlready = this.shiftTiles.find((item:TileBase)=>{
                        return item.id == tileData!.id
                    })

                    let operation: TileInteractionOperation;

                    if(isAlready){
                        // remove
                        this.shiftTiles = this.shiftTiles.filter((item)=>{return item.id != tileData!.id});
                        operation = TileInteractionOperation.GROUP_REMOVE;
                    }else{
                        this.shiftTiles.push(tileData);
                        operation = TileInteractionOperation.GROUP_ADD;
                    }       
                    this.renderer.highlightTiles(this.shiftTiles, "_OnClick", "#1ECBE1")  
                    this.renderer.emitter.emit(Events.INTERACTIONS.MAP.TILE, {
                        type: Events.INTERACTIONS.MAP.TILE,
                        click: tileData, // clicked tile
                        selected: this.shiftTiles, // tile selected or multiple tiles selected (with shift)
                        operation: operation,
                        viewName: (<PlaygroundInteractionEvent>event).viewName, // name of the view that took part in the interaction
                        originalEvent: (<PlaygroundInteractionEvent>event).originalEvent, // original event from UI that triggered the interaction
                        interactingObject: (<PlaygroundInteractionEvent>event).interactingObject, // the object that took part in the interaction
                        data: (<PlaygroundInteractionEvent>event).data, // additional interaction data
                        worldPosition: (<PlaygroundInteractionEvent>event).worldPosition, // interacting object world position,
                        scenePosition: (<PlaygroundInteractionEvent>event).scenePosition // scene position when interaction took place
                    })                  
                }
                 
            break;
            case Events.MAP.ROTATE:
                if((<MapRotateEvent>event).direction == DIRECTION.LEFT){
                    this.renderer.rotate(1)
                }else{
                    this.renderer.rotate(-1)
                }
            break;
            case Events.MAP.ZOOM:
                if((<MapZoomEvent>event).direction == DIRECTION.OUT){
                    this.renderer.zoom(-1)
                }else{
                    this.renderer.zoom(1)
                }
            break;
            case Events.INTERACTIONS.NON_CLASSIFIED:
                // clear highlight
                this.renderer.highlightTiles([]);
            break;
        }   
    }
}


export interface MapRendererOptions extends RendererOptions {
    backgroundImgUrl?: string,
    showGrid?: boolean,
    zoomLevel?: number
}

/**
 * Responsible for rendering map tiles and tile indicator (highligh element for selecting tile);
 * It reacts to following user interactions:
 * - when mouse pointer is moved then map highligh element is also moving
 * - when mouse is clicked, then view is centered on the clicked tile (alternatively)
 */
export abstract class MapRenderer extends Renderer implements MapPositionProvider, MapWritable, OrientationProvider{
    width: number;
    height: number;
    indicatorForTile: MapIndicator|undefined;

    indicators: Map<string, MapIndicator>;
    mapEventHandler: MapPlaygroundEventHandler;

    // tiles = Map<string,  // "x,y"->{o: object3D, d: direction N|S|E|W, p: scene position origin relative{x: , y: , z:}}
    constructor(width:number, height:number, emitter:EventEmitter, options?: MapRendererOptions){
        super(emitter, options);
        this.height = height;
        this.width = width       

        this.emitter.on(Events.INTERACTIONS.TILE,this._onEvent.bind(this))
        this.emitter.on(Events.INTERACTIONS.UNIT, this._onEvent.bind(this))
        this.emitter.on(Events.INTERACTIONS.NON_CLASSIFIED, this._onEvent.bind(this))
        // this.emitter.on(Events.INTERACTIONS.HUD, this._onEvent.bind(this))

        this.emitter.on(Events.MAP.ROTATE, this._onEvent.bind(this))
        this.emitter.on(Events.MAP.ZOOM, this._onEvent.bind(this))
        this.indicators = new Map<string, MapIndicator>();
 
        this.mapEventHandler = new MapPlaygroundEventHandler(this);
    }
    
    
    abstract orientate(object:any, direction:string):void;
    abstract add(renderable: Renderable): void;
    abstract initialize():Promise<void>;
    abstract remove(tile: TileBase):void;
    abstract replace(tile: TileBase, direction:string):void;
    abstract put(tile: TileBase, direction:string):void;
    abstract onTileChanged(tile: TileBase, direction: string):void;    
    abstract highlightTiles(tiles: TileBase[], indicatorName?: string, color?:string):void;
    abstract rotate(rotation: number):void;
    abstract goToTile(tile: TileBase, object?:THREE.Object3D):void;

    
    abstract yxToScenePosition(y: number, x:number):ScenePosition;
    abstract scenePositionToYX(sceneX: number, sceneY: number):TilePosition;    

    /**
     * Zoom levels are from 0 - farthest to 16 - closest
     * @param level 
     */
    abstract zoom(level: number):void;

    _onEvent(event:PlaygroundInteractionEvent|MapEvent|MapRotateEvent):void{
        this.mapEventHandler._onEvent(event);

        // switch(event.type){
        //     case Events.INTERACTIONS.TILE:
        //         let tileData:TileBase|undefined = undefined;
        //         let object:THREE.Object3D|undefined = undefined;
        //         for(let i=(<PlaygroundInteractionEvent>event).data.hierarchy.length-1; i>= 0; i--){
        //             if((<PlaygroundInteractionEvent>event).data.hierarchy[i].userData.tileData){                
        //                 tileData = (<PlaygroundInteractionEvent>event).data.hierarchy[i].userData.tileData
        //                 object = (<PlaygroundInteractionEvent>event).data.hierarchy[i]
        //             }
        //         } 
        //         tileData && (<PlaygroundInteractionEvent>event).originalEvent.type=="pointermove" && this.highlightTiles([tileData]);
        //         tileData && (<PlaygroundInteractionEvent>event).originalEvent.type=="pointerdown" && this.goToTile(tileData, object!);
        //         tileData && (<PlaygroundInteractionEvent>event).originalEvent.type=="pointerdown" && this.highlightTiles([tileData], "_OnClick", "#1ECBE1")
        //         tileData && (<PlaygroundInteractionEvent>event).originalEvent.type=="pointerdown" && (<PlaygroundInteractionEvent>event).originalEvent.ctrlKey && console.log("Click with ctrl")
        //     break;
        //     case Events.MAP.ROTATE:
        //         if((<MapRotateEvent>event).direction == DIRECTION.LEFT){
        //             this.rotate(1)
        //         }else{
        //             this.rotate(-1)
        //         }
        //     break;
        //     case Events.MAP.ZOOM:
        //         if((<MapZoomEvent>event).direction == DIRECTION.OUT){
        //             this.zoom(-1)
        //         }else{
        //             this.zoom(1)
        //         }
        //     break;
        //     case Events.INTERACTIONS.NON_CLASSIFIED:
        //         // clear highlight
        //         this.highlightTiles([]);
        //     break;
        // }            
    }

    /**
     * Registers new map indicator with given name
     * @param indicator 
     * @param name 
     */
    registerIndicator(name:string, indicator:MapIndicator){
        this.indicators.set(name, indicator);
    }
}



export abstract class MapRendererThreeJs extends MapRenderer{
    static NAME: string = "THE_MAP";
    tileSize: number;
    
    mapHolderObject: THREE.Object3D;
    declare renderablesFactory: RenderablesThreeJSFactory|undefined;
    declare view: PlaygroundViewThreeJS|undefined;

    state: {
        zoomLevel: number,  // current map zoom level
        current: {
            tile: TileBase|undefined,  // that that has focus
            tileWorldPos: THREE.Vector3|undefined,
            tileLocalPos: THREE.Vector3|undefined
        }
        
        
        lookAt: THREE.Vector3,
        sceneRotation: number
    }
    

    static HELPERS_HIGHLIGHTER = "MAP_HLPR_HIGHLIGHT";

    HELPERS:MapQuadRendererThreeJsHelpers = {
        Highlighter: undefined
    }
    

    constructor(width: number, height: number, emitter:EventEmitter, options?:MapRendererOptions){
        super(width, height, emitter, options);
        
        this.mapHolderObject = new THREE.Object3D();
        this.mapHolderObject.name = MapRendererThreeJs.NAME,

        
        
        this.tileSize = 1;  
        this.state = {
            zoomLevel: 10 ,
            current: {
                tile: undefined,
                tileWorldPos: new THREE.Vector3(this.yxToScenePosition(0,0).x, this.yxToScenePosition(0,0).y,0),
                tileLocalPos: new THREE.Vector3(this.yxToScenePosition(0,0).x, this.yxToScenePosition(0,0).y,0),
            },
            
            lookAt: new THREE.Vector3(0,0,0),
            sceneRotation: 0               
        }
                     

        // this.emitter.on(Events.INTERACTIONS.TILE,this._onEvent.bind(this))
        // this.emitter.on(Events.INTERACTIONS.UNIT, this._onEvent.bind(this))

    }   


    /**
     * Provides renderer with a view to which renderer will render;
     * @param view target view where to render
     */
    setView(view: PlaygroundView):void{
        this.view = view as PlaygroundViewThreeJS;
        this.view.scene.add(this.mapHolderObject);
    }
    
    _dispose(object3D:THREE.Mesh){
        if(!object3D.geometry)
            return;
        object3D.geometry.dispose();
        
        if(Array.isArray(object3D.material)){
            const materials = object3D.material as THREE.Material[];
            materials.forEach((material)=>{
                material.dispose();    
            })
        }else{
            const material =  object3D.material as THREE.Material;
            material.dispose()
        }                
        
        // todo texture?
    }
      
    /**
     * Shows highligh indicator
     * on tile that is the target of the event.
     */
    highlightTiles(tiles: TileBase[], indicatorName?: string, color?:string): void {
        const indicator = indicatorName?this.indicators.get(indicatorName):this.indicatorForTile;

        
        if(!indicator){
            throw new Error(`No indicator with name ${indicatorName}`);
        }

        indicator.forTiles(tiles, color);
    }

    _getMapObject():THREE.Object3D{
        let map:THREE.Object3D|undefined;

        // find the map object in scene
        this.view!.scene.traverse((item:THREE.Object3D)=>{
            if(item.name == MapRendererThreeJs.NAME){
                map = item
            }             
        })

        if(!map){
            throw new Error("Can't rotate. No map object in scene.");
        }
        return map;
    }

    rotate(rotation: number): void {
        // let map:THREE.Object3D|undefined;

        // // find the map object in scene
        // this.view!.scene.traverse((item:THREE.Object3D)=>{
        //     if(item.name == MapRendererThreeJs.NAME){
        //         map = item
        //     }             
        // })

        // if(!map){
        //     throw new Error("Can't rotate. No map object in scene.");
        // }

        

        const degree =  (this.state.sceneRotation + Math.sign(rotation)*360/60)%360;
        this.state.sceneRotation = degree

        const radians = Math.sign(rotation)*THREE.MathUtils.degToRad(360/60);
        // const degrees = Math.sign(rotation)*THREE.MathUtils.radToDeg(radians);

        // map!.rotateZ(radians)

        // lets rotate around our newly selected tile
        

        // const map = this._getMapObject();
        // this._rotateAboutPoint(map!, this.state.current.tileWorldPos!, new Vector3(0,0,1), radians, true);

        // this.view?.camera.position.applyAxisAngle(new Vector3(0,0,1), radians);
        // this.view?.camera.lookAt(this.state.current.tileWorldPos!)
        this._rotateCameraAroundPoint(this.view?.camera, this.state.current.tileWorldPos!, -radians);

    }    

    _getCameraDirectionFromPoint(camera: THREE.Camera, point: THREE.Vector3){
        // Create a vector from the camera position to the point of interest
        const direction = new THREE.Vector3()
        // direction.subVectors(point, camera.position)
        direction.subVectors(camera.position, point)


        // Get the camera angle from the direction vector
        const angle = Math.atan2(direction.y, direction.x)

        return angle;
    }

    // function rotateCameraAroundPoint(camera, point, angle) {
    //     // Calculate distance between camera and point
    //     const distance = camera.position.distanceTo(point);
      
    //     // Calculate new camera position
    //     const x = point.x + distance * Math.sin(angle);
    //     const y = point.y + distance * Math.cos(angle);
    //     const z = camera.position.z; // preserve z position
      
    //     // Set camera position
    //     camera.position.set(x, y, z);
      
    //     // Set camera lookAt target to point
    //     camera.lookAt(point);
    //   }

    _rotateCameraAroundPoint(camera:THREE.Camera, point: THREE.Vector3, angle: number) {

        const npoint = point.clone().setZ(camera.position.z);

        const cameraAngle = this._getCameraDirectionFromPoint(camera, npoint);

        const newAngle = cameraAngle+angle;

        // console.log("camera angle", cameraAngle, THREE.MathUtils.radToDeg(cameraAngle), cameraAngle-angle, THREE.MathUtils.radToDeg(cameraAngle-angle));
        // Calculate distance between camera and point
        const distance = camera.position.distanceTo(npoint);
        // console.log("distance", distance, "cam pos", camera.position, "target", npoint, "angle", angle);
        // Calculate new camera position
        const x = npoint.x + distance * Math.cos(newAngle);
        const y = npoint.y + distance * Math.sin(newAngle);
        const z = camera.position.z; // preserve z position
      
        // console.log("new pos", x, y, z);

        // translate???
        // Set camera position
        camera.position.set(x, y, z);
        // console.log("cam pos", camera.position);
      
        // const cameraAngleAfter = this._getCameraDirectionFromPoint(camera, npoint);

        // console.log("Camera angles", THREE.MathUtils.radToDeg(cameraAngle), THREE.MathUtils.radToDeg(cameraAngleAfter))

        // Set camera lookAt target to point
        camera.lookAt(point);
      }

    // obj - your object (THREE.Object3D or derived)
    // point - the point of rotation (THREE.Vector3)
    // axis - the axis of rotation (normalized THREE.Vector3)
    // theta - radian value of rotation
    // pointIsWorld - boolean indicating the point is in world coordinates (default = false)
    _rotateAboutPoint(obj:THREE.Object3D, point: THREE.Vector3, axis: THREE.Vector3, theta: number, pointIsWorld:boolean){
        pointIsWorld = (pointIsWorld === undefined)? false : pointIsWorld;

        if(pointIsWorld){
            obj.parent!.localToWorld(obj.position); // compensate for world coordinate
        }

        obj.position.sub(point); // remove the offset
        obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
        obj.position.add(point); // re-add the offset

        if(pointIsWorld){
            obj.parent!.worldToLocal(obj.position); // undo world coordinates compensation
        }

        obj.rotateOnAxis(axis, theta); // rotate the OBJECT
    }
    
    /**
     * Changes map zoom
     * 
     * 13 starting zoom level
     * 16 max zoom level (closest)
     * 1 min zoom level (farthest)
     * @param level when negative then map zooms out, when positive map zooms in     
     */
    zoom(level: number): void {
        const levels = [
            {distanceDelta: 0, zDelta: 16},//0 min zoom (birds eye view)
            {distanceDelta: 0, zDelta: 16},
            {distanceDelta: 0, zDelta: 16},
            {distanceDelta: 0, zDelta: 8},
            {distanceDelta: 0, zDelta: 4},
            {distanceDelta: 0, zDelta: 2},
            {distanceDelta: 0, zDelta: 1},
            {distanceDelta: 0, zDelta: 1},
            {distanceDelta: 0, zDelta: 1},
            {distanceDelta: 0, zDelta: 1},
            {distanceDelta: 0.2, zDelta: 0.8},
            {distanceDelta: 0.4, zDelta: 0.6},
            {distanceDelta: 0.6, zDelta: 0.3},
            {distanceDelta: 0.8, zDelta: 0.15},
            {distanceDelta: 0.8, zDelta: 0.125},
            {distanceDelta: 0.8, zDelta: 0.06} // 15 max zoom (max details)            
        ]
        // const prevPos = this.view!.camera.position.clone();
        const npoint = this.state.current.tileWorldPos?.clone();        

        const prevZoomLevel = this.state.zoomLevel;
        const newZoomLevel = level>=0?prevZoomLevel+1:prevZoomLevel-1;
        
        if(newZoomLevel<0 || newZoomLevel>15)
            return


        

        if(level>0){
            // first move along z axis (either up or down by zDelta)
            this.view!.camera.position.setZ(this.view!.camera.position.z-levels[newZoomLevel].zDelta);

            // then move towards or away from target point
            const direction = npoint!.clone().sub(this.view!.camera.position);
            direction.setLength(Math.sign(level)*levels[newZoomLevel].distanceDelta);
            this.view!.camera.position.add(direction);
        }else{
            
            // first move towards or away from target point
            const direction = npoint!.clone().sub(this.view!.camera.position);
            direction.setLength(Math.sign(level)*levels[prevZoomLevel].distanceDelta);
            this.view!.camera.position.add(direction);

            // then move along z axis (either up or down by zDelta)
            this.view!.camera.position.setZ(this.view!.camera.position.z+levels[prevZoomLevel].zDelta);
            

        }         
        // console.log(this.view!.camera.position.z)
        this.state.zoomLevel = newZoomLevel;
        this.view!.camera.lookAt(npoint);        
    } 

    goToTile(tile: TileBase, _object?: THREE.Object3D){

        // this.yxToScenePosition(tile.y, tile.x);
        
        // const objectWorldPosition = new THREE.Vector3();        
        // object.getWorldPosition(objectWorldPosition);

        // // const localPosition = object.position;
        // const localPosition = objectWorldPosition;
        const pos = this.yxToScenePosition(tile.y, tile.x);
        const worldPosition = new THREE.Vector3(pos.x, pos.y, pos.z)

        // console.log(">>>>>>>>>>>")
        // console.log("tile", localPosition)

        const from = this.state.current.tileWorldPos?.clone();
        from!.z = 0;

        const to = worldPosition.clone();
        to.z = 0;

        const translation = new THREE.Vector3();
        translation.subVectors(to, from!)

        this.view!.camera.position.add(translation)


        this.state.current.tile = tile;
        this.state.current.tileWorldPos = worldPosition;        
    }     
}

export interface Rotations {
    RIGHT: 90,
    LEFT: -90
}

export interface MapQuadRendererThreeJsHelpers {
    Highlighter: AreaMapIndicatorThreeJs|undefined
}



/**
 * Helper that can generate threejs plane of hex shapes. It uses flat top odd approach
 * for putting hexes into rows and columns
 */
export class PlaneHexFlatTopOddGeometryThreeJsHelper {
    
    _cols: number;
    _rows: number;
    _width: number;
    _height: number;    
    _size: number;
    _helper: HexFlatTopPositionProviderThreeJs;

    constructor(cols:number, rows:number, width: number){
        this._cols = cols;
        this._rows = rows;
        this._width = width;
        this._size = this._width/2;
        this._height = Math.sqrt(3)*this._size;
        
        this._helper = new HexFlatTopPositionProviderThreeJs(this._width);
        
    }
    getTileSize(){
        return {
            width: this._width,
            height: this._height
        }
    }
    /**
     * Creates shape of hexes map with given columns and rows. It uses flat top odd approach for 
     * positioning hexes on the plance
     * @returns {ShapeGeometry} threejs geometry of the plane with hexes generated
     */
    getGeometry():THREE.ShapeGeometry{
        const shapes: THREE.Shape[]=[];

        for(let q=0; q<this._cols; q++){
            for(let r=0; r<this._rows; r++){
                const center = this._helper.yxToScenePosition(r,q);
                const xCenter = center.x;
                const yCenter = center.y;
                

                // console.log(q,r, xCenter, yCenter, this._width, this._height, size);

                const hexShape = new THREE.Shape();
                const points = this._flat_hex_points(new THREE.Vector2(xCenter,yCenter),this._size);
                hexShape.moveTo(points[0].x, points[0].y);
                for(let i=1; i<6; i++){
                    hexShape.lineTo(points[i].x, points[i].y);
                }
                hexShape.lineTo(points[0].x, points[0].y);
                shapes.push(hexShape);
                // console.log(q,r,points);
            }
        }

        const geometry = new THREE.ShapeGeometry(shapes);  
        return geometry;
    }

    _flat_hex_points(center:THREE.Vector2, size:number):THREE.Vector2[]{
        const points:THREE.Vector2[] = [];

        for(let i=0; i<6; i++){
            points.push(this._flat_hex_corner_point(center, size, i));
        }
        return points;
    }
    /**
     * 
     * @param center 
     * @param size 
     * @param i hex cornerfrom 0 to 5
     * @returns 
     */
    _flat_hex_corner_point(center:THREE.Vector2, size:number, i: number):THREE.Vector2{
        var angle_deg = 60 * i;
        var angle_rad = Math.PI / 180 * angle_deg;
        return new THREE.Vector2(center.x + size * Math.cos(angle_rad), center.y + size * Math.sin(angle_rad));
    }
    
}



/**
 * ThreeJS implementation of quad map renderer. It renders quad map
 */
export class MapQuadRendererThreeJs extends MapRendererThreeJs{
        
    initialize(): Promise<void> {
        
        // const that = this;
        // this.mapHolderObject.add( new THREE.AxesHelper( 40 ) );

        // const helper = new PlaneHexFlatTopOddGeometryThreeJsHelper(5,3,1);
        // var geometry = helper.getGeometry();
        // var material = new THREE.MeshBasicMaterial( { wireframe: true, opacity: 0.5, transparent: true } );
        // var grid = new THREE.Mesh( geometry, material );
        
        // grid
        if((<MapRendererOptions>this.options).showGrid){
            var geometry = new THREE.PlaneGeometry( this.width, this.height, this.width, this.height );
            var material = new THREE.MeshBasicMaterial( { wireframe: true, opacity: 0.5, transparent: true } );
            var grid = new THREE.Mesh( geometry, material );
            // grid.rotation.order = 'YXZ';
            // grid.rotation.y = - Math.PI / 2;
            // grid.rotation.x = - Math.PI / 2;
            grid.position.z=-0.01
            this.mapHolderObject.add( grid );
        }
        
        // return this.renderablesFactory!.loadTemplates(["MAS", MapQuadRendererThreeJs.HELPERS_HIGHLIGHTER]).then(()=>{
        return this._createMapHelpers();
        // })            
        // return Promise.resolve();
    }

    remove(tile: TileBase): void {
        const that = this;
        // find the object
        let objects3D = that.mapHolderObject.children.filter((item)=>{
            // return item.userData&&item.userData.tileData?item.userData.tileData.x == tile.x && item.userData.tileData.y == tile.y:false;
            return item.type.toLowerCase()=="object3d" && item.userData && item.userData.tileData && item.userData.tileData.x == tile.x && item.userData.tileData.y == tile.y;
        })

        if(objects3D&&objects3D[0]){
            let object3D = objects3D[0];
            // remove
            that.mapHolderObject.remove(object3D);
            
            

            // release memory            
            // that._dispose(object3D as THREE.Mesh);
            object3D.traverse((child)=>{
                
                that._dispose(child as THREE.Mesh)
            })
        }
    }
    replace(tile: TileBase, direction: string): void {
        this.remove(tile);
        this.put(tile, direction)
    }
    put(tile: TileBase, direction?: string): void {
        this.remove(tile);
        const renderable = this.renderablesFactory!.spawnRenderableObject(tile.r!);
        const object3D = renderable.data as THREE.Object3D;

        const scenePosition = this.yxToScenePosition(tile.y,tile.x);
        const cDirection = direction||'S'

        // console.log(`Tile2Scene ${JSON.stringify(tile)} ${scenePosition.x}, ${scenePosition.y}, ${scenePosition.z}`)

        this.mapHolderObject.add(object3D);
        object3D.position.set( scenePosition.x, scenePosition.y,scenePosition.z)
        this.orientate(object3D, cDirection)

        
        object3D.userData.tileData = tile
        
    }
    onTileChanged(tile: TileBase, direction: string): void {
        this.replace(tile, direction);
    }

    /**
     * Converts tile coordinates (y - row, x-column) into scene x,y,z position
     * It is assumed that tile pivot point is at its base (x,y) center
     * @param y tile row
     * @param x tile column
     * @returns {x: number, y: number, z: number} position
     */
    yxToScenePosition(y: number, x:number){
        const provider = new QuadPositionProviderThreeJs(this.width, this.height, this.tileSize);
        return provider.yxToScenePosition(y,x);
        // // const originTilePosition = {
        // //     x: this._width/2+1,
        // //     y: this._height/2
        // // }

        // const _normalizedWidth = this.width/this.tileSize;
        // const _normalizedHeight = this.height/this.tileSize

        // const position = {
        //     x: x-_normalizedWidth/2+this.tileSize/2,
        //     y: (y-_normalizedHeight/2)<0?Math.abs(y-_normalizedHeight/2)-this.tileSize/2:-Math.abs(y-_normalizedHeight/2)-this.tileSize/2,
        //     z: 0
        // }
        // // console.log(x,y,position);
        // return position;
        
        // // 33,31 -> 0,-1,0

    }
    /**
     * Translates actual scene position (x,y) into map tile position (y,x)
     * @param sceneX scene x position
     * @param sceneY scene y position
     * @returns (y,x) tile position (row, column)
     */
    scenePositionToYX(sceneX:number,sceneY:number){  

        const provider = new QuadPositionProviderThreeJs(this.width, this.height, this.tileSize);
        return provider.scenePositionToYX(sceneX, sceneY);
        
        // const _tilesCountY = this.height/this.tileSize
        
        // const normSceneX = sceneX+this.width/2;
        // const normSceneY = sceneY+this.height/2;

        // const tileX = Math.floor(normSceneX);
        // const tileY =  Math.floor(_tilesCountY-normSceneY);

        // const position = {
        //     y:tileY,
        //     x: tileX
        // }
        // return position;
    }


    /**
     * adds any 3d object into map (map holder)
     * @param object THREEJS object 3d to be added
     */
    add(renderable: Renderable): void {
        const renderableThreeJs = <RenderableThreeJS>renderable;
        this.mapHolderObject.add(renderableThreeJs.data);
    }
    
    /**
     * It is assumed that object pivot point is at its base center.
     * It is also assumed that by default when loaded/spawned tile is S oriented.
     * Do not use it for rotation - only once when one wants to
     * put tile in proper orientation/direction.
     * @param object {THREE.Object3D} Renderable object to be oriented in direction
     * @param direction {string} target direction
     */
    orientate(object:THREE.Object3D, direction:string){
        const object3D = <THREE.Object3D>object;


        const provider = new QuadOrientationProviderThreeJs();

        provider.orientate(object3D, direction);

        // // const prevPosition = object3D.position;
        // switch (direction) {
        //     case 'N':                
        //       object3D.rotateZ(THREE.MathUtils.degToRad(180));
        //     //   object3D.position.setX(prevPosition.x+this.tileSize)
        //     //   object3D.position.setY(prevPosition.y+this.tileSize)
        //       break;
        //     case 'E':
        //       object3D.rotateZ(THREE.MathUtils.degToRad(90));
        //       // move back
        //     //   object3D.position.setX(prevPosition.x+this.tileSize)
        //       break;
        //     case 'W':
        //       object3D.rotateZ(THREE.MathUtils.degToRad(-90));
        //     //   object3D.position.setY(prevPosition.y+this.tileSize)
        //       break;
        //     default:
        //         // default is S south
        //         //   object3D.rotateZ(THREE.Math.degToRad(90));
        //       break;
        // }
    }

    async _createMapHelpers(){
        // const mapIndicator = new AreaMapIndicatorThreeJs(this, this.renderablesFactory!,"MAP_HLPR_HIGHLIGHT");
        const mapIndicator = await QuadAreaMapIndicator3Js.create(this);

        this.indicatorForTile = mapIndicator;

        const clickedIndicator = await QuadAreaMapIndicator3Js.create(this);
        this.registerIndicator("_OnClick",clickedIndicator);
    }

    
    
}

/**
 * ThreeJs implementation of the hexagonal map renderer. It renders hexagonal flat top odd map.
 */
export class MapHexFlatTopOddRendererThreeJs extends MapQuadRendererThreeJs{
    async initialize(): Promise<void> {
        
        // const that = this;
        // this.mapHolderObject.add( new THREE.AxesHelper( 40 ) );

        if((<MapRendererOptions>this.options).showGrid){
            const helper = new PlaneHexFlatTopOddGeometryThreeJsHelper(this.width,this.height,1);
            var geometry = helper.getGeometry();
            var material = new THREE.MeshBasicMaterial( { wireframe: true, opacity: 0.5, transparent: true } );
            
            
            var grid = new THREE.Mesh( geometry, material );
            grid.position.z=-0.01
            grid.name = "MAP_HELPER_GRID"
            
            this.mapHolderObject.add( grid );
        }

        if((<MapRendererOptions>this.options).backgroundImgUrl){
            try{
                const texture = await Utils3JS.texture((<MapRendererOptions>this.options).backgroundImgUrl!);
                const helper = new PlaneHexFlatTopOddGeometryThreeJsHelper(this.width,this.height,1);
                var geometry = helper.getGeometry();
                geometry.computeBoundingBox();
                let size = new THREE.Vector3();
                geometry.boundingBox?.getSize(size);
                // console.log(JSON.stringify(size));
    
                const backgroundGeometry = new THREE.PlaneGeometry(size.x, size.y);
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                });
                const background = new THREE.Mesh(backgroundGeometry, material);
                background.name = "MAP_IMAGE_BACKGROUND"
                background.position.z = -0.02
                background.position.x = background.position.x+size.x/2-helper.getTileSize().width/2; // minus tile.width/2
                background.position.y = background.position.y-size.y/2+helper.getTileSize().height/2; // plus tile.height/2
                this.mapHolderObject.add( background );
            }catch(error:any){
                console.error(`Can't load background from ${(<MapRendererOptions>this.options).backgroundImgUrl}. Check if background image exists and is publicly accessible.`, error);
            }            
        }
        
        // return this.renderablesFactory!.loadTemplates(["MAS", MapQuadRendererThreeJs.HELPERS_HIGHLIGHTER]).then(()=>{
        
        // })            
        return this._createMapHelpers();
    }

    async _createMapHelpers(){        
        const mapIndicator = await HexAreaMapIndicator3Js.create(this);
        this.indicatorForTile = mapIndicator;

        const clickedIndicator = await HexAreaMapIndicator3Js.create(this);
        this.registerIndicator("_OnClick",clickedIndicator);
    }

    yxToScenePosition(y: number, x:number){
        const helper = new HexFlatTopPositionProviderThreeJs(this.tileSize);
        return helper.yxToScenePosition(y, x);
    }
    orientate(_object:THREE.Object3D, _direction:string){
        // for hex map there is no such thing as orientate as hex dimensions are not equal
        return;
    }
}

