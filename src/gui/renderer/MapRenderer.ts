// import * as THREE from 'three'

// import { TileBase } from "../../logic/map/common.notest";

// export abstract class MapRenderer {
//     width: number;
//     height: number;
//     tiles = Map<string,  // "x,y"->{o: object3D, d: direction N|S|E|W, p: scene position origin relative{x: , y: , z:}}
//     constructor(width:number, height:number){
//         this.height = height;
//         this.width = width
//     }

//     abstract remove(y: number, x:number):void;
//     abstract replace(y: number, x:number, tile: TileBase, direction:string):void;
//     abstract put(y: number, x:number, tile: TileBase, direction:string):void;
//     abstract onTileChanged(tile: TileBase):void;
// }

// export abstract class MapRendererThreeJs extends MapRenderer{
//     tileSize: number;
//     scene: THREE.Scene;
//     mapHolderObject: THREE.Object3D;

//     constructor(width: number, height: number, scene: THREE.Scene){
//         super(width, height);
//         this.scene = scene;
//         this.mapHolderObject = new THREE.Object3D();
//         this.mapHolderObject.name = 'THE_MAP',
//         this.scene.add(this.mapHolderObject);
//         this.tileSize = 1;
//     }    
// }

// // unit changed(unitUpdated, location/path)
// // tile changed(tileUpdated)
// export class MapQuadRendererThreeJs extends MapRendererThreeJs{
    
//     remove(y: number, x: number): void {
//         throw new Error('Method not implemented.');
//     }
//     replace(y: number, x: number, tile: TileBase, direction: string): void {
//         throw new Error('Method not implemented.');
//     }
//     put(y: number, x: number, tile: TileBase, direction: string): void {
//         const helper = TileCoordinateHelper.getInstance(this._width, this._height, this._tileSize)
//         const scenePosition = helper.xyToScenePosition(x,y);
//         const cDirection = direction||'S'

//         this.tiles[`${x},${y}`]={
//             o: tileObject3D,
//             d: cDirection,
//             p: {
//                 x: scenePosition.x,
//                 y: scenePosition.y,
//                 z: scenePosition.z
//             }
//         }
//         this._mapHolderObject.add(tileObject3D)
        
//         tileObject3D.position.set( scenePosition.x, scenePosition.y,scenePosition.z)
//         this._directionRotate(tileObject3D, cDirection)
        
//         // render according to direction

//         // add tile x, tile y to user data
//         if(tileObject3D.userData){
//             tileObject3D.userData.tileData = {
//                 x: x,
//                 y: y,
//             }
//         } else {

//         }
//     }
//     onTileChanged(tile: TileBase): void {
//         throw new Error('Method not implemented.');
//     }
    
// }