import * as THREE from 'three'
import { Object3D, Vector3 } from 'three';

import { Material } from 'three';

import { TileBase } from "../../logic/map/common.notest";
import { Events } from '../../util/eventDictionary.notest';
import { EventEmitter } from '../../util/events.notest';
import { PlaygroundInteractionEvent, PlaygroundView, PlaygroundViewThreeJS } from '../playground/playground';
import { Renderable, RenderablesFactory, RenderablesThreeJSFactory, RenderableThreeJS } from './renderables-factory';

export interface ScenePosition {
    x: number,
    y: number,
    z: number
}

export interface TilePosition {
    
    y: number,    
    x: number,
}

export interface MapPositionProvider{
    xyToScenePosition(y: number, x:number):ScenePosition,
    scenePositionToXY(sceneX:number,sceneY:number):TilePosition,    
}

export interface MapWritable{
    add(object: Renderable):void;
}

export abstract class Renderer {
    view: PlaygroundView|undefined;
    renderablesFactory: RenderablesFactory|undefined;
    emitter: EventEmitter;
    constructor(emitter:EventEmitter){
        this.emitter = emitter;
    }
    /**
     * Renderer renders the game into provided view
     * @param view target view where to draw the game
     */
    abstract setView(view: PlaygroundView):void;

    setRenderablesFactory(factory: RenderablesFactory):void{
        this.renderablesFactory = factory;
    }
}

export abstract class HudRenderer extends Renderer{
    components: HudComponent[];

    constructor(emitter:EventEmitter){
        super(emitter)
        this.components = [];
    }

    abstract addComponent(component:HudComponent):void;
    abstract repositionComponents():void;
} 

export abstract class MapRenderer extends Renderer implements MapPositionProvider, MapWritable{
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
        this.emitter.on(Events.INTERACTIONS.HUD, this._onEvent.bind(this))
 
    }
    abstract add(renderable: Renderable): void;
    abstract initialize():Promise<void>;
    abstract remove(tile: TileBase):void;
    abstract replace(tile: TileBase, direction:string):void;
    abstract put(tile: TileBase, direction:string):void;
    abstract onTileChanged(tile: TileBase, direction: string):void;
    abstract xyToScenePosition(y: number, x:number):ScenePosition;
    abstract scenePositionToXY(sceneX: number, sceneY: number):TilePosition;    
    abstract highlightTiles(tiles: TileBase[]):void;
    abstract rotate(rotation: number):void;
    abstract goToTile(tile: TileBase, object:THREE.Object3D):void;

    /**
     * Zoom levels are from 0 - farthest to 16 - closest
     * @param level 
     */
    abstract zoom(level: number):void;

    _onEvent(event:PlaygroundInteractionEvent):void{
        

        // check if this is a tile related event
        if(event.type == Events.INTERACTIONS.TILE){

            let tileData:TileBase|undefined = undefined;
            let object:THREE.Object3D|undefined = undefined;
            for(let i=event.data.hierarchy.length-1; i>= 0; i--){
                if(event.data.hierarchy[i].userData.tileData){                
                    tileData = event.data.hierarchy[i].userData.tileData
                    object = event.data.hierarchy[i]
                }
            } 
            tileData && event.originalEvent.type=="pointermove" && this.highlightTiles([tileData]);
            tileData && event.originalEvent.type=="pointerdown" && this.goToTile(tileData, object!);
        }
        if(event.type == Events.INTERACTIONS.HUD && event.originalEvent.type=="pointerdown"){
            for(let i=event.data.hierarchy.length-1; i>= 0; i--){
                if([                    
                    HudComponentMapNavigationThreeJs.CONTROLS.LEFT,
                    HudComponentMapNavigationThreeJs.CONTROLS.RIGHT
                    ].includes(event.data.hierarchy[i].name)){
                        event.data.hierarchy[i].name == HudComponentMapNavigationThreeJs.CONTROLS.LEFT?this.rotate(1):this.rotate(-1);
                    }
                if([                    
                    HudComponentMapNavigationThreeJs.CONTROLS.DOWN,
                    HudComponentMapNavigationThreeJs.CONTROLS.UP
                    ].includes(event.data.hierarchy[i].name)){
                        event.data.hierarchy[i].name == HudComponentMapNavigationThreeJs.CONTROLS.DOWN?this.zoom(-1):this.zoom(1);
                    }
                
            }
        }

    }
}

/**
 * Renders components from the lower left corner of the view to the right.
 * Order of components is important.
 */
export class HudRendererThreeJs extends HudRenderer {
    view: PlaygroundViewThreeJS|undefined;
    setView(view: PlaygroundViewThreeJS): void {
        this.view = view;
    }

    /**
     * Adds hud component at the end of the hud components list
     * @param component hud component to be added
     */
     addComponent(component:HudComponentThreeJs){
        
        component.setContainer(this.view!.container);
        this.view!.scene.add(component.object);
        this.components.push(component);
        component.resize();
        this.repositionComponents();
    }
    /**
     * Recalculates components' positions using current cointainer dimensions.
     * It assumes that objects pivot/origin is at the center of the object
     */
    repositionComponents(){
        
        const FIX_CAMERA_HALF_SIZE = 20;
        const MARGIN = FIX_CAMERA_HALF_SIZE/20;
        // let x = -this.view!.container.clientWidth/2;
        let x = -FIX_CAMERA_HALF_SIZE+MARGIN/2;
        
        // console.log(this.view!.container.clientWidth, this.view!.container.clientHeight)
        
        this.components.forEach((item:HudComponent)=>{               
            // component pivot is as its center so we need to position 
            // it center accordingly
            x+=(<HudComponentThreeJs>item).getSize().x!/2;

            // let y = -this.view!.container.clientHeight/2+(<HudComponentThreeJs>item).getSize().y!/2;
            let y = -FIX_CAMERA_HALF_SIZE+(<HudComponentThreeJs>item).getSize().y!/2+MARGIN;
        
            // (<HudComponentThreeJs>item).object!.position.set(x,y,0);
            (<HudComponentThreeJs>item).object!.position.set(x,y,0);
            x += (<HudComponentThreeJs>item).getSize().x!/2+MARGIN/2;
            
        })
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
            const sceneXY = this.xyToScenePosition(tile.y, tile.x);
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
            const pos = this.mapProvider.xyToScenePosition(tiles[i].y, tiles[i].x);
            const renderable = <RenderableThreeJS>renderables[i];            
            if(renderable.data.position.x !=pos.x || renderable.data.position.y !=pos.y){
                // console.log(`Cache size ${this.tiles.length} ${this.renderables.length}`)
                renderable.data.position.set(pos.x, pos.y, renderable.data.position.z);
            }
        }        
    }

}



// unit changed(unitUpdated, location/path)
// tile changed(tileUpdated)
export class MapQuadRendererThreeJs extends MapRendererThreeJs{        
    initialize(): Promise<void> {
        
        // const that = this;
        this.mapHolderObject.add( new THREE.AxesHelper( 40 ) );
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

        const scenePosition = this.xyToScenePosition(tile.y,tile.x);
        const cDirection = direction||'S'

        this.mapHolderObject.add(object3D);
        object3D.position.set( scenePosition.x, scenePosition.y,scenePosition.z)
        this._directionRotate(object3D, cDirection)

        
        object3D.userData.tileData = tile
        
    }
    onTileChanged(tile: TileBase, direction: string): void {
        this.replace(tile, direction);
    }

    /**
     * It is assumed that tile pivot point is at its base (x,y) center
     * @param y 
     * @param x 
     * @returns 
     */
    xyToScenePosition(y: number, x:number){
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
     * @returns (y,x) tile position
     */
    scenePositionToXY(sceneX:number,sceneY:number){  
        
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
     * @param object3D 
     * @param direction 
     */
    _directionRotate(object3D:THREE.Object3D, direction:string){
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



export abstract class SpriteFactory {
    abstract initialize():Promise<void>;
    abstract getInstance(which:number):THREE.Sprite;
}

/* istanbul ignore next */
/**
 * Texture in a form of a line stripe
 * Each sprite is of 1x1x0 size
 */
export class SpriteFactoryx128x128x4xL extends SpriteFactory{
    url:string;
    texture: THREE.Texture|any;
    size: number = 128;
    itemCnt: number = 4;

    constructor(textureUrl: string){
        super();
        this.url = textureUrl;
    }

    initialize(): Promise<void> {
        
        return new Promise((resolve, reject) => {
            
            const loader = new THREE.TextureLoader();
            // console.log(this.url)
            loader.load(this.url, (texture:THREE.Texture) => {
                resolve(texture);
            }, undefined, (error) => {
                reject(error);
            });
        }).then((textureResult:any) => {
            this.texture = textureResult as THREE.Texture;
            if(this.texture.image.width!=this.size*this.itemCnt)
                throw new Error(`Invalid texture width ${this.url}`)
            if(this.texture.image.height!=this.size) 
                throw new Error(`Invalid texture height ${this.url}`)            
        })
    }

    getInstance(idx: number): THREE.Sprite {
        if(idx>this.size-1)
            throw new Error(`Invalid sprite idx ${idx} for ${this.url}`);
        
        const materialMap = this.texture.clone()
        materialMap.repeat.x = 1 / this.itemCnt
        materialMap.offset.x = idx * this.size / (this.size*this.itemCnt)
        materialMap.needsUpdate = true;

        const material = new THREE.SpriteMaterial({ map: materialMap });

        const sprite = new THREE.Sprite(material);
        return sprite;
    }


}

/**
 * Hud component is a 2D object displayed in Hud ortographic view.
 */
export abstract class HudComponent {
    container: any;

    setContainer(container:any){
        this.container = container;
    }

    abstract build():Promise<HudComponent>;

}
/**
 * xxxvvvxxx
 * xxx0.0xxx
 * xxxvvvxxx
 * 
 * Origin is located at the lower left corner of the component
 * 
 * xxxvvvxxx
 * xxxvvvxxx
 * 0.0vvvxxx
 */
export abstract class HudComponentThreeJs extends HudComponent{
    
    sizePercentage: number|undefined;
    width: number|undefined;
    height: number|undefined;
    object: THREE.Object3D|undefined;

    constructor(){   
        super();     
    }

    

    resize(){
        const FIX_CAMERA_HALF_SIZE = 20;
        
        // const newWidth = this.container.clientWidth;
        // const newHeight = this.container.clientHeight;

        const newWidth = 2*FIX_CAMERA_HALF_SIZE;
        const newHeight = 2*FIX_CAMERA_HALF_SIZE;
        // const targetSize = new THREE.Vector3(1,1,1);
        const targetSize = new THREE.Vector3(newWidth*this.sizePercentage!, newHeight*this.sizePercentage!,Math.min(newWidth*this.sizePercentage!, newHeight*this.sizePercentage!));
        
        const box = new THREE.Box3().setFromObject(this.object!);
        const size = new THREE.Vector3();
        box.getSize(size);
        
        
        const scaleVec = targetSize.divide(size);
        
        const scale = Math.min(scaleVec.x, Math.min(scaleVec.y, scaleVec.z));
        
        this.object!.scale.setScalar(scale);

        // now update size property accordingly
        const box2 = new THREE.Box3().setFromObject(this.object!);
        const size2 = new THREE.Vector3();
        box2.getSize(size2);
        this.width = size2.x;
        this.height = size2.y;
    }

    getSize(){
        return {
            x: this.width,
            y: this.height
        }
    }
    
}
/* istanbul ignore next */
export abstract class HudComponentLargeThreeJs extends HudComponentThreeJs{
    constructor(){
        super(); 
        this.sizePercentage = 0.2;       
    }
    abstract build():Promise<HudComponentThreeJs>;
}
/* istanbul ignore next */
export abstract class HudComponentMediumThreeJs extends HudComponentThreeJs{
    constructor(){
        super(); 
        this.sizePercentage = 0.1;       
    }
    abstract build():Promise<HudComponentThreeJs>;
}

/* istanbul ignore next */
export abstract class HudComponentSmallThreeJs extends HudComponentThreeJs{
    constructor(){
        super(); 
        this.sizePercentage = 0.05;       
    }
    abstract build():Promise<HudComponentThreeJs>;
}
/* istanbul ignore next */
export class HudComponentDefaultThreeJs extends HudComponentThreeJs{
    constructor(){
        super();
        this.object = new THREE.Object3D();
        this.width = 40;
        this.height = 40;
    }
    build(): Promise<HudComponentThreeJs> {
        throw new Error('Method not implemented.');
    }
}
export class HudComponentMapNavigationThreeJs extends HudComponentMediumThreeJs{
    static NAME = "COMP_HUD_NAV";
    static CONTROLS = {
        UP: "UP",
        DOWN: "DOWN",
        LEFT: "LEFT",
        RIGHT: "RIGHT"
    }
    buttonsFactory: SpriteFactory;
    constructor(buttonsSpriteUrl: string){
        super();
        this.buttonsFactory = new SpriteFactoryx128x128x4xL(buttonsSpriteUrl);
    }

    /**
     * Generates 3x3 button square with 4 buttons for map navigation
     * ?^?
     * <?>
     * ?v?
     * @returns 
     */
     build(): Promise<HudComponentThreeJs> {
        const that = this;
        let hud = new Object3D();
        hud.name = HudComponentMapNavigationThreeJs.NAME;
        return this.buttonsFactory.initialize().then(()=>{            
            const up = this.buttonsFactory.getInstance(0);            
            hud.add(up);
            up.position.set(0, 1, 0);
            // up.scale.set(this._sizing.items, this._sizing.items, 1);            
            up.name = HudComponentMapNavigationThreeJs.CONTROLS.UP
            

            const left = this.buttonsFactory.getInstance(1);            
            hud.add(left);
            left.position.set(-1, 0, 0);
            // left.scale.set(this._sizing.items, this._sizing.items, 1);
            // rotLeft.position.set( 0, 0, this._size );
            left.name = HudComponentMapNavigationThreeJs.CONTROLS.LEFT;
            

            const right = this.buttonsFactory.getInstance(2);
            hud.add(right);
            right.position.set(1, 0, 0);
            // right.scale.set(this._sizing.items, this._sizing.items, 1);
            right.name = HudComponentMapNavigationThreeJs.CONTROLS.RIGHT;

            const down = this.buttonsFactory.getInstance(3);
            hud.add(down);
            down.position.set(0, -1, 0);
            // down.scale.set(this._sizing.items, this._sizing.items, 1);
            // backward.position.set( this._size-this._size/2, 0, 0 );
            down.name = HudComponentMapNavigationThreeJs.CONTROLS.DOWN;

            // // now normalize hud origin so the origin is in 
            // // lower left corner of the hud element
            // hud.position.set(1.5, 1.5,0);
            // const holder = new Object3D();
            // holder.name = "HANDLE"
            // holder.add(hud);
            
            that.object = hud;
            that.width = 3;
            that.height = 3;
            // return holder;
            return that;
        })
    }
}