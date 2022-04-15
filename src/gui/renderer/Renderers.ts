import * as THREE from 'three'
import { Object3D } from 'three';

import { Material } from 'three';

import { TileBase } from "../../logic/map/common.notest";
import { PlaygroundView, PlaygroundViewThreeJS } from '../playground/playground';
import { RenderablesFactory, RenderablesThreeJSFactory } from './renderables-factory';

export interface ScenePosition {
    x: number,
    y: number,
    z: number
}

export abstract class Renderer {
    view: PlaygroundView|undefined;
    renderablesFactory: RenderablesFactory|undefined;
    
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

    constructor(){
        super()
        this.components = [];
    }

    abstract addComponent(component:HudComponent):void;
    abstract repositionComponents():void;
} 

export abstract class MapRenderer extends Renderer{
    width: number;
    height: number;
    assets: string;
    // tiles = Map<string,  // "x,y"->{o: object3D, d: direction N|S|E|W, p: scene position origin relative{x: , y: , z:}}
    constructor(width:number, height:number, assets:string){
        super();
        this.height = height;
        this.width = width
        this.assets = assets;
    }
    abstract initialize():Promise<void>;
    abstract remove(tile: TileBase):void;
    abstract replace(tile: TileBase, direction:string):void;
    abstract put(tile: TileBase, direction:string):void;
    abstract onTileChanged(tile: TileBase, direction: string):void;
    abstract xyToScenePosition(y: number, x:number):ScenePosition;
}

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
        this.repositionComponents();
    }
    /**
     * Recalculates components' positions using current cointainer dimensions.
     */
    repositionComponents(){
        let x = -this.view!.container.clientWidth/2;
        const y = -this.view!.container.clientHeight/2;
        
        this.components.forEach((item:HudComponent)=>{
        
            (<HudComponentThreeJs>item).object!.position.set(x,y,0);
            x += (<HudComponentThreeJs>item).getSize().x!;
        })
    }
}

export abstract class MapRendererThreeJs extends MapRenderer{
    static NAME: string = "THE_MAP";
    tileSize: number;
    
    mapHolderObject: THREE.Object3D;
    renderablesFactory: RenderablesThreeJSFactory|undefined;
    view: PlaygroundViewThreeJS|undefined;

    constructor(width: number, height: number, assets: string){
        super(width, height, assets);
        
        this.mapHolderObject = new THREE.Object3D();
        this.mapHolderObject.name = MapRendererThreeJs.NAME,
        
        this.tileSize = 1;        
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
}

// unit changed(unitUpdated, location/path)
// tile changed(tileUpdated)
export class MapQuadRendererThreeJs extends MapRendererThreeJs{    
    initialize(): Promise<void> {
        return this.renderablesFactory!.loadRenderablesObjectsTemplate(this.assets);
    }

    remove(tile: TileBase): void {
        const that = this;
        // find the object
        let objects3D = that.mapHolderObject.children.filter((item)=>{
            return item.userData&&item.userData.tileData?item.userData.tileData.x == tile.x && item.userData.tileData.y == tile.y:false;
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
     * It is assumed that tile origin that is used for positioning is located at lower left corner
     * of the tile object
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
            x: x-_normalizedWidth/2,
            y: (y-_normalizedHeight/2)<0?Math.abs(y-_normalizedHeight/2)-this.tileSize:-Math.abs(y-_normalizedHeight/2)-this.tileSize,
            z: 0
        }
        // console.log(x,y,position);
        return position;
        
        // 33,31 -> 0,-1,0

    }
    _directionRotate(object3D:THREE.Object3D, direction:string){
        const prevPosition = object3D.position;
        switch (direction) {
            case 'N':                
              object3D.rotateZ(THREE.MathUtils.degToRad(180));
              object3D.position.setX(prevPosition.x+this.tileSize)
              object3D.position.setY(prevPosition.y+this.tileSize)
              break;
            case 'E':
              object3D.rotateZ(THREE.MathUtils.degToRad(90));
              // move back
              object3D.position.setX(prevPosition.x+this.tileSize)
              break;
            case 'W':
              object3D.rotateZ(THREE.MathUtils.degToRad(-90));
              object3D.position.setY(prevPosition.y+this.tileSize)
              break;
            default:
                // default is S south
                //   object3D.rotateZ(THREE.Math.degToRad(90));
              break;
        }
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
            console.log(this.url)
            loader.load(this.url, (texture:THREE.Texture) => {
                resolve(texture);
            }, undefined, (error) => {
                reject(error);
            });
        }).then((textureResult:any) => {
            this.texture = textureResult as THREE.Texture;
            if(this.texture.width!=this.size*this.itemCnt)
                throw new Error(`Invalid texture width ${this.url}`)
            if(this.texture.height!=this.size) 
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
        const newWidth = this.container.clientWidth;
        const newHeight = this.container.clientHeight;
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
        this.sizePercentage = 0.25;       
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
export class HudComponentMapNavigationThreeJs extends HudComponentLargeThreeJs{
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
        const hud = new Object3D();
        hud.name = "HUD"
        return this.buttonsFactory.initialize().then(()=>{
            const up = this.buttonsFactory.getInstance(0);
            hud.add(up);
            up.position.set(0, 1, 0);
            // up.scale.set(this._sizing.items, this._sizing.items, 1);            
            up.name = 'UP'

            const left = this.buttonsFactory.getInstance(1);
            hud.add(left);
            left.position.set(-1, 0, 0);
            // left.scale.set(this._sizing.items, this._sizing.items, 1);
            // rotLeft.position.set( 0, 0, this._size );
            left.name = 'LEFT'

            const right = this.buttonsFactory.getInstance(2);
            hud.add(right);
            right.position.set(1, 0, 0);
            // right.scale.set(this._sizing.items, this._sizing.items, 1);
            right.name = 'RIGHT'

            const down = this.buttonsFactory.getInstance(3);
            hud.add(down);
            down.position.set(0, -1, 0);
            // down.scale.set(this._sizing.items, this._sizing.items, 1);
            // backward.position.set( this._size-this._size/2, 0, 0 );
            down.name = 'DOWN'

            // now normalize hud origin so the origin is in 
            // lower left corner of the hud element
            hud.position.set(1.5, 1.5,0);
            const holder = new Object3D();
            holder.add(hud);
            
            that.object = holder;
            that.width = 3;
            that.height = 3;
            // return holder;
            return that;
        })
    }
}