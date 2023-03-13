import * as THREE from 'three'
import { Shape, ShapeGeometry, Vector2, Vector3 } from 'three';

import { Material } from 'three';

import { TileBase } from "../../logic/map/common.notest";
import { Events } from '../../util/eventDictionary.notest';
import { EventEmitter } from '../../util/events.notest';
import { EngineEvent, PlaygroundInteractionEvent, PlaygroundView, PlaygroundViewThreeJS } from '../playground/playground';
import { Renderable, RenderablesFactory, RenderablesThreeJSFactory, RenderableThreeJS } from './renderables-factory';
import { Renderer } from './renderers';

export interface ScenePosition {
    x: number,
    y: number,
    z: number
}

export interface TilePosition {
    
    y: number,    
    x: number,
}

export interface TileHexPosition {
    
    q: number,    
    r: number,
}

/**
 * Provides translation between scene/world coordinates (pixel on screen/scene) vs map coordinates
 * (either x,y for quad maps or q,r for hex maps)
 */
export interface MapPositionProvider{
    /**
     * Converts TileBase tile position (row, column) into scene coordinates (x,y,z).
     * @see TileBase for more details
     * @param y tile row (aka r for hex tile)
     * @param x tile column (aka q for hex tile)
     */
    yxToScenePosition(y: number, x:number):ScenePosition,
    /**
     * Converts scene coordinates (x,y) into tile position (row, column)
     * @param {number} sceneX scene position.x
     * @param {number} sceneY scene position.y
     */
    scenePositionToYX(sceneX:number,sceneY:number):TilePosition,    
    // // hex map support
    // qrToScenePosition(q: number, r:number):ScenePosition,
    // scenePositionToQR(sceneX:number,sceneY:number):TileHexPosition,    
}


export interface OrientationProvider {
    /**
     * It is assumed that object pivot point is at its base center.
     * It is also assumed that by default when loaded/spawned tile is S oriented.
     * Do not use it for rotation - only once when one wants to
     * put tile in proper orientation/direction.
     * @param object 
     * @param direction 
     */
    orientate(object:any, direction:string):void;
}

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

    // tiles = Map<string,  // "x,y"->{o: object3D, d: direction N|S|E|W, p: scene position origin relative{x: , y: , z:}}
    constructor(width:number, height:number, emitter:EventEmitter){
        super(emitter);
        this.height = height;
        this.width = width       

        this.emitter.on(Events.INTERACTIONS.TILE,this._onEvent.bind(this))
        this.emitter.on(Events.INTERACTIONS.UNIT, this._onEvent.bind(this))
        // this.emitter.on(Events.INTERACTIONS.HUD, this._onEvent.bind(this))

        this.emitter.on(Events.MAP.ROTATE, this._onEvent.bind(this))
        this.emitter.on(Events.MAP.ZOOM, this._onEvent.bind(this))
 
    }
    
    
    abstract orientate(object:any, direction:string):void;
    abstract add(renderable: Renderable): void;
    abstract initialize():Promise<void>;
    abstract remove(tile: TileBase):void;
    abstract replace(tile: TileBase, direction:string):void;
    abstract put(tile: TileBase, direction:string):void;
    abstract onTileChanged(tile: TileBase, direction: string):void;    
    abstract highlightTiles(tiles: TileBase[]):void;
    abstract rotate(rotation: number):void;
    abstract goToTile(tile: TileBase, object:THREE.Object3D):void;

    
    abstract yxToScenePosition(y: number, x:number):ScenePosition;
    abstract scenePositionToYX(sceneX: number, sceneY: number):TilePosition;    

    /**
     * Zoom levels are from 0 - farthest to 16 - closest
     * @param level 
     */
    abstract zoom(level: number):void;

    _onEvent(event:PlaygroundInteractionEvent|MapEvent|MapRotateEvent):void{
        
        // console.log("Got map event", event);
        // check if this is a tile related event
        if(event.type == Events.INTERACTIONS.TILE){

            let tileData:TileBase|undefined = undefined;
            let object:THREE.Object3D|undefined = undefined;
            for(let i=(<PlaygroundInteractionEvent>event).data.hierarchy.length-1; i>= 0; i--){
                if((<PlaygroundInteractionEvent>event).data.hierarchy[i].userData.tileData){                
                    tileData = (<PlaygroundInteractionEvent>event).data.hierarchy[i].userData.tileData
                    object = (<PlaygroundInteractionEvent>event).data.hierarchy[i]
                }
            } 
            tileData && (<PlaygroundInteractionEvent>event).originalEvent.type=="pointermove" && this.highlightTiles([tileData]);
            tileData && (<PlaygroundInteractionEvent>event).originalEvent.type=="pointerdown" && this.goToTile(tileData, object!);
        }
        // if(event.type == Events.MAP.ROTATE && event.originalEvent.type=="pointerdown"){
        //     for(let i=event.data.hierarchy.length-1; i>= 0; i--){
        //         if([                    
        //             HudComponentMapNavigationThreeJs.CONTROLS.LEFT,
        //             HudComponentMapNavigationThreeJs.CONTROLS.RIGHT
        //             ].includes(event.data.hierarchy[i].name)){
        //                 event.data.hierarchy[i].name == HudComponentMapNavigationThreeJs.CONTROLS.LEFT?this.rotate(1):this.rotate(-1);
        //             }
        //         if([                    
        //             HudComponentMapNavigationThreeJs.CONTROLS.DOWN,
        //             HudComponentMapNavigationThreeJs.CONTROLS.UP
        //             ].includes(event.data.hierarchy[i].name)){
        //                 event.data.hierarchy[i].name == HudComponentMapNavigationThreeJs.CONTROLS.DOWN?this.zoom(-1):this.zoom(1);
        //             }
                
        //     }
        // }

        if(event.type == Events.MAP.ROTATE ){
            if((<MapRotateEvent>event).direction == DIRECTION.LEFT){
                this.rotate(1)
            }else{
                this.rotate(-1)
            }
        }

        if(event.type == Events.MAP.ZOOM ){
            if((<MapZoomEvent>event).direction == DIRECTION.OUT){
                this.zoom(-1)
            }else{
                this.zoom(1)
            }
        }
    }
}



export abstract class MapRendererThreeJs extends MapRenderer{
    static NAME: string = "THE_MAP";
    tileSize: number;
    
    mapHolderObject: THREE.Object3D;
    renderablesFactory: RenderablesThreeJSFactory|undefined;
    view: PlaygroundViewThreeJS|undefined;

    state: {
        zoomLevel: number,  // current map zoom level
        current: {
            tile: TileBase|undefined,  // that that has focus
            tileWorldPos: THREE.Vector3|undefined
        }
        
        
        lookAt: THREE.Vector3,
        sceneRotation: number
    }
    

    static HELPERS_HIGHLIGHTER = "MAP_HLPR_HIGHLIGHT";

    HELPERS:MapQuadRendererThreeJsHelpers = {
        Highlighter: undefined
    }
    

    constructor(width: number, height: number, emitter:EventEmitter){
        super(width, height, emitter);
        
        this.mapHolderObject = new THREE.Object3D();
        this.mapHolderObject.name = MapRendererThreeJs.NAME,
        
        this.tileSize = 1;  
        this.state = {
            zoomLevel: 13 ,
            current: {
                tile: undefined,
                tileWorldPos: undefined
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
        
        object3D.geometry.dispose();
        
        // warning, material may be an array
        const material =  object3D.material as Material;
        material.dispose()
        
        // todo texture?
    }
      
    /**
     * Shows highligh indicator
     * on tile that is the target of the event.
     */
    highlightTiles(tiles: TileBase[]): void {
        if(this.indicatorForTile){
            this.indicatorForTile.forTiles(tiles);
        }
    }

    rotate(rotation: number): void {
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

        const degree =  (this.state.sceneRotation + Math.sign(rotation)*360/60)%360;
        this.state.sceneRotation = degree

        const radians = Math.sign(rotation)*THREE.MathUtils.degToRad(360/60);

        map!.rotateZ(radians)
        

    }

    zoom(level: number): void {
        // 12 - 5
        // 13 - 4
        // 14 - 3
        // 15 - 2
        // 16 - 1
        // 0-16

        // (16-level)+1
        // // 4
        level>=0?this.state.zoomLevel+=1:this.state.zoomLevel-=1;

        this.state.zoomLevel = Math.max(Math.min(this.state.zoomLevel,16),0);


        const positionZ = 16-this.state.zoomLevel +1;

        this.view!.camera.position.z = positionZ;
        this.view!.camera.lookAt(this.state.lookAt);
    } 

    goToTile(tile: TileBase, object: THREE.Object3D){
        const objectWorldPosition = new THREE.Vector3();
        object.getWorldPosition(objectWorldPosition);

        if(this.state.current.tile){
            const currentScenePos = {y: this.state.current.tileWorldPos!.y ,x: this.state.current.tileWorldPos!.x }
            const targetScenePos = {x: objectWorldPosition.x, y: objectWorldPosition.y};            
            
            const deltaCurrent = new THREE.Vector2(this.view!.camera.position.x, this.view!.camera.position.y).sub(new THREE.Vector2(currentScenePos.x, currentScenePos.y));
            const delta =  new THREE.Vector2(this.view!.camera.position.x, this.view!.camera.position.y).sub(new THREE.Vector2(targetScenePos.x, targetScenePos.y));
            const deltadelta =  deltaCurrent.sub(delta);

            this.view!.camera.position.x += deltadelta.x;
            this.view!.camera.position.y += deltadelta.y;
            // console.log(`Camera pos after: ${JSON.stringify(this.view!.camera.position)}`);
            // this.view!.camera.lookAt(object.position.x, object.position.y, 0);
            // this.state.lookAt = new Vector3(object.position.x, object.position.y, 0);

        }
        else{
            const sceneXY = this.yxToScenePosition(tile.y, tile.x);
            this.view!.camera.position.x = sceneXY.x;
            this.view!.camera.position.y = sceneXY.y-5;
            this.view!.camera.lookAt(sceneXY.x, sceneXY.y, 0);            
            this.state.lookAt = new Vector3(sceneXY.x, sceneXY.y, 0);
            
        }
        this.state.current.tile = tile;
        this.state.current.tileWorldPos = objectWorldPosition;        
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
 * Annotates map tiles with some additional information/visualization
 */
export abstract class MapIndicator{

    // this factory should provide indicators objects that can be spawned by 
    // the Indicator
    renderablesFactory: RenderablesFactory;

    // provides position mapping from tile/map and scene coordinates
    mapProvider: MapPositionProvider&MapWritable;

    constructor(mapProvider: MapPositionProvider&MapWritable, renderablesFactory: RenderablesFactory){
        this.renderablesFactory = renderablesFactory;
        this.mapProvider = mapProvider
    };

    abstract forTile(tile: TileBase):void;
    abstract forTiles(tiles: TileBase[]):void;
    abstract hide():void;
    abstract show():void;
    abstract render(renderables: Renderable[], tiles: TileBase[], colorHex?: string):void;
}

export abstract class AreaMapIndicator extends MapIndicator{
    // renderables used for indicators
    renderables: Renderable[];
    tiles: TileBase[];
    renderableKey: string;
    colorHex?: string;

    constructor(mapProvider: MapPositionProvider&MapWritable, renderablesFactory: RenderablesFactory, renderableKey: string, colorHex?: string){
        super(mapProvider, renderablesFactory); 
        this.renderables = [];   
        this.tiles = [];   
        this.renderableKey = renderableKey;
        this.colorHex = colorHex;
    }
    forTile(tile: TileBase): void {
        this.hide();        
        if(this.renderables.length<=0){
            const renderable = this.renderablesFactory.spawnRenderableObject(this.renderableKey);
            this.renderables.push(renderable);
            this.mapProvider.add(renderable);
        }        
        this.tiles = [tile];
        this.render(this.renderables.slice(0,1),[tile],this.colorHex);        
        this.show();
    }
    forTiles(tiles: TileBase[]): void {
        this.hide();
        if(this.renderables.length<tiles.length){
            const delta = tiles.length-this.renderables.length;
            for(let i=0; i<delta;i++){
                const renderable = this.renderablesFactory.spawnRenderableObject(this.renderableKey);                
                this.renderables.push(renderable);
                this.mapProvider.add(renderable);
            }
        }
        this.tiles = tiles;
        this.render(this.renderables.slice(0,tiles.length),tiles,this.colorHex);        
        this.show();
        
    }
    hide(): void {
        for(let i=0;i<this.tiles.length;i++){
            this.renderables[i].hide&&this.renderables[i].hide!();
        }
    }
    show(): void {
        for(let i=0;i<this.tiles.length;i++){
            this.renderables[i].show&&this.renderables[i].show!();
        }
    } 

            
}

export class AreaMapIndicatorThreeJs extends AreaMapIndicator{

    render(renderables: Renderable[], tiles: TileBase[], _colorHex?: string): void {        
        if(renderables.length != tiles.length)
            throw new Error(`Renderables and tiles count mismatch. ${renderables.length} vs ${tiles.length}`);
        for(let i=0; i<tiles.length; i++){
            const pos = this.mapProvider.yxToScenePosition(tiles[i].y, tiles[i].x);
            const renderable = <RenderableThreeJS>renderables[i];            
            if(renderable.data.position.x !=pos.x || renderable.data.position.y !=pos.y){
                // console.log(`Cache size ${this.tiles.length} ${this.renderables.length}`)
                renderable.data.position.set(pos.x, pos.y, renderable.data.position.z);
            }
        }        
    }

}

/**
 * Provides set of position convertion between pixel world and map 
 * world (this instance is for hexagonal flat top maps)
 */
export class HexFlatTopPositionHelper implements MapPositionProvider {
    _width: number;
    _size: number;
    _height: number;

    constructor(hexWidth: number){
        this._width = hexWidth;
        this._size = this._width/2;
        this._height = Math.sqrt(3)*this._size;
    }
    yxToScenePosition(_y: number, _x: number): ScenePosition {
        const vector = this._qrToXY(_x,_y);
        return {
            x: vector.x,
            y: vector.y,
            z: 0
        }
    }
    scenePositionToYX(_sceneX: number, _sceneY: number): TilePosition {
        const qr = this._xyToQR(new Vector2(_sceneX, _sceneY));
        return {
            y: qr.r,
            x: qr.q
        }
    }



    _xyToQR(point: Vector2):{q: number, r:number}{
        var q = ( 2./3 * point.x                        ) / this._size
        var r = (-1./3 * point.x  +  Math.sqrt(3)/3 * point.y) / this._size
        // return axial_round(Hex(q, r))    
        return {
            q: Math.round(q),
            r: Math.round(r)
        }
    }        

    _qrToXY(q:number, r:number):Vector2{
        const xCenter = q*this._width*3/4;
        const yCenter = q%2==1?r*this._height+this._height/2:r*this._height;
        return new Vector2(xCenter, yCenter);
    }
    
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
    _helper: HexFlatTopPositionHelper;

    constructor(cols:number, rows:number, width: number){
        this._cols = cols;
        this._rows = rows;
        this._width = width;
        this._size = this._width/2;
        this._height = Math.sqrt(3)*this._size;
        
        this._helper = new HexFlatTopPositionHelper(this._width);
        
    }
    /**
     * Creates shape of hexes map with given columns and rows. It uses flat top odd approach for 
     * positioning hexes on the plance
     * @returns {ShapeGeometry} threejs geometry of the plane with hexes generated
     */
    getGeometry():ShapeGeometry{
        const shapes: Shape[]=[];

        for(let q=0; q<this._cols; q++){
            for(let r=0; r<this._rows; r++){
                const center = this._helper.yxToScenePosition(r,q);
                const xCenter = center.x;
                const yCenter = center.y;
                

                // console.log(q,r, xCenter, yCenter, this._width, this._height, size);

                const hexShape = new Shape();
                const points = this._flat_hex_points(new Vector2(xCenter,yCenter),this._size);
                hexShape.moveTo(points[0].x, points[0].y);
                for(let i=1; i<6; i++){
                    hexShape.lineTo(points[i].x, points[i].y);
                }
                hexShape.lineTo(points[0].x, points[0].y);
                shapes.push(hexShape);
                // console.log(q,r,points);
            }
        }

        const geometry = new ShapeGeometry(shapes);  
        return geometry;
    }

    _flat_hex_points(center:Vector2, size:number):Vector2[]{
        const points:Vector2[] = [];

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
    _flat_hex_corner_point(center:Vector2, size:number, i: number):Vector2{
        var angle_deg = 60 * i;
        var angle_rad = Math.PI / 180 * angle_deg;
        return new Vector2(center.x + size * Math.cos(angle_rad), center.y + size * Math.sin(angle_rad));
    }
    
}



// unit changed(unitUpdated, location/path)
// tile changed(tileUpdated)
export class MapQuadRendererThreeJs extends MapRendererThreeJs{
        
    initialize(): Promise<void> {
        
        // const that = this;
        this.mapHolderObject.add( new THREE.AxesHelper( 40 ) );

            // const helper = new PlaneHexFlatTopOddGeometryThreeJsHelper(5,3,1);
            // var geometry = helper.getGeometry();
            // var material = new THREE.MeshBasicMaterial( { wireframe: true, opacity: 0.5, transparent: true } );
            // var grid = new THREE.Mesh( geometry, material );
            
            // grid
            var geometry = new THREE.PlaneBufferGeometry( this.width, this.height, this.width, this.height );
            var material = new THREE.MeshBasicMaterial( { wireframe: true, opacity: 0.5, transparent: true } );
            var grid = new THREE.Mesh( geometry, material );
            // grid.rotation.order = 'YXZ';
            // grid.rotation.y = - Math.PI / 2;
            // grid.rotation.x = - Math.PI / 2;
            grid.position.z=-0.01
            this.mapHolderObject.add( grid );
        return this.renderablesFactory!.loadTemplates(["C_","instance", MapQuadRendererThreeJs.HELPERS_HIGHLIGHTER]).then(()=>{
            this._createMapHelpers();
        })            
    }

    remove(tile: TileBase): void {
        const that = this;
        // find the object
        let objects3D = that.mapHolderObject.children.filter((item)=>{
            // return item.userData&&item.userData.tileData?item.userData.tileData.x == tile.x && item.userData.tileData.y == tile.y:false;
            return item.userData.tileData.x == tile.x && item.userData.tileData.y == tile.y;
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
        const renderable = this.renderablesFactory!.spawnRenderableObject(tile.t);
        const object3D = renderable.data as THREE.Object3D;

        const scenePosition = this.yxToScenePosition(tile.y,tile.x);
        const cDirection = direction||'S'

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
        // const originTilePosition = {
        //     x: this._width/2+1,
        //     y: this._height/2
        // }

        const _normalizedWidth = this.width/this.tileSize;
        const _normalizedHeight = this.height/this.tileSize

        const position = {
            x: x-_normalizedWidth/2+this.tileSize/2,
            y: (y-_normalizedHeight/2)<0?Math.abs(y-_normalizedHeight/2)-this.tileSize/2:-Math.abs(y-_normalizedHeight/2)-this.tileSize/2,
            z: 0
        }
        // console.log(x,y,position);
        return position;
        
        // 33,31 -> 0,-1,0

    }
    /**
     * Translates actual scene position (x,y) into map tile position (y,x)
     * @param sceneX scene x position
     * @param sceneY scene y position
     * @returns (y,x) tile position (row, column)
     */
    scenePositionToYX(sceneX:number,sceneY:number){  
        
        const _tilesCountY = this.height/this.tileSize
        
        const normSceneX = sceneX+this.width/2;
        const normSceneY = sceneY+this.height/2;

        const tileX = Math.floor(normSceneX);
        const tileY =  Math.floor(_tilesCountY-normSceneY);

        const position = {
            y:tileY,
            x: tileX
        }
        return position;
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
        // const prevPosition = object3D.position;
        switch (direction) {
            case 'N':                
              object3D.rotateZ(THREE.MathUtils.degToRad(180));
            //   object3D.position.setX(prevPosition.x+this.tileSize)
            //   object3D.position.setY(prevPosition.y+this.tileSize)
              break;
            case 'E':
              object3D.rotateZ(THREE.MathUtils.degToRad(90));
              // move back
            //   object3D.position.setX(prevPosition.x+this.tileSize)
              break;
            case 'W':
              object3D.rotateZ(THREE.MathUtils.degToRad(-90));
            //   object3D.position.setY(prevPosition.y+this.tileSize)
              break;
            default:
                // default is S south
                //   object3D.rotateZ(THREE.Math.degToRad(90));
              break;
        }
    }

    _createMapHelpers(){
        const mapIndicator = new AreaMapIndicatorThreeJs(this, this.renderablesFactory!,"MAP_HLPR_HIGHLIGHT");

        this.indicatorForTile = mapIndicator;
        // const renderable = this.renderablesFactory!.spawnRenderableObject("MAP_HLPR_HIGHLIGHT");
        // const object3D = renderable.data as THREE.Object3D;

        // const scenePosition = this.xyToScenePosition(0,0);
        

        //this.mapHolderObject.add(object3D);
        // object3D.position.set( scenePosition.x, scenePosition.y,scenePosition.z)   
        
        // this.HELPERS.Highlighter = object3D;
    }

    
    
}

export class MapHexFlatTopOddRendererThreeJs extends MapQuadRendererThreeJs{
    initialize(): Promise<void> {
        
        // const that = this;
        this.mapHolderObject.add( new THREE.AxesHelper( 40 ) );

            const helper = new PlaneHexFlatTopOddGeometryThreeJsHelper(5,3,1);
            var geometry = helper.getGeometry();
            var material = new THREE.MeshBasicMaterial( { wireframe: true, opacity: 0.5, transparent: true } );
            var grid = new THREE.Mesh( geometry, material );
            grid.position.z=-0.01
            
            this.mapHolderObject.add( grid );
        return this.renderablesFactory!.loadTemplates(["C_","instance", MapQuadRendererThreeJs.HELPERS_HIGHLIGHTER]).then(()=>{
            this._createMapHelpers();
        })            
    }

    yxToScenePosition(y: number, x:number){
        const helper = new HexFlatTopPositionHelper(this.tileSize);
        return helper.yxToScenePosition(y, x);
    }
}

