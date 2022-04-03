import * as THREE from 'three'
import { Material } from 'three';

import { TileBase } from "../../logic/map/common.notest";
import { RenderableThreeJSObject3DFactory } from './ObjectFactory';

export interface ScenePosition {
    x: number,
    y: number,
    z: number
}
export abstract class MapRenderer {
    width: number;
    height: number;
    assets: string;
    // tiles = Map<string,  // "x,y"->{o: object3D, d: direction N|S|E|W, p: scene position origin relative{x: , y: , z:}}
    constructor(width:number, height:number, assets:string){
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

export abstract class MapRendererThreeJs extends MapRenderer{
    tileSize: number;
    scene: THREE.Scene;
    mapHolderObject: THREE.Object3D;
    tileFactory: RenderableThreeJSObject3DFactory;

    constructor(width: number, height: number, assets: string, scene: THREE.Scene){
        super(width, height, assets);
        this.scene = scene;
        this.mapHolderObject = new THREE.Object3D();
        this.mapHolderObject.name = 'THE_MAP',
        this.scene.add(this.mapHolderObject);
        this.tileSize = 1;
        this.tileFactory = new RenderableThreeJSObject3DFactory();
    }    
    
    _dispose(object3D:THREE.Mesh){
        if(object3D.geometry){
            object3D.geometry.dispose();
        }
        if(object3D.material){
            const material =  object3D.material as Material;
            material.dispose()
        }
        // todo texture?
    }
}

// unit changed(unitUpdated, location/path)
// tile changed(tileUpdated)
export class MapQuadRendererThreeJs extends MapRendererThreeJs{    
    initialize(): Promise<void> {
        return this.tileFactory.loadRenderableObjectsTemplate(this.assets);
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
            that._dispose(object3D as THREE.Mesh);
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
        const renderable = this.tileFactory.spawnRenderableObject(tile.t);
        const object3D = renderable.data as THREE.Object3D;

        const scenePosition = this.xyToScenePosition(tile.y,tile.x);
        const cDirection = direction||'S'

        this.mapHolderObject.add(object3D);
        object3D.position.set( scenePosition.x, scenePosition.y,scenePosition.z)
        this._directionRotate(object3D, cDirection)

        if(object3D.userData){
            object3D.userData.tileData = tile
        }
    }
    onTileChanged(tile: TileBase, direction: string): void {
        this.replace(tile, direction);
    }
    xyToScenePosition(y: number, x:number){
        // const originTilePosition = {
        //     x: this._width/2+1,
        //     y: this._height/2
        // }

        const _normalizedWidth = this.width/this.tileSize;
        const _normalizedHeight = this.height/this.tileSize

        const position = {
            x: x-_normalizedWidth/2,
            y: (y-_normalizedHeight/2)<0?Math.abs(y-_normalizedHeight/2)-1:-Math.abs(y-_normalizedHeight/2)-1,
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