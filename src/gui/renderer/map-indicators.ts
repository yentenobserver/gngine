import { Object3D, Mesh, Material } from "three";
import { TileBase } from "../../logic/map/common.notest";
import { MapWritable } from "./map-renderers";
import { MapPositionProvider } from "./providers";
import { RenderablesFactory, Renderable, RenderableThreeJS, RenderablesThreeJSFactory, RenderableSpecification } from "./renderables-factory";
import { RENDERABLES } from "./assets/threejs3d.notest";

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

    abstract forTile(tile: TileBase, hexColor?:string):void;
    abstract forTiles(tiles: TileBase[], hexColor?:string):void;    
    abstract hide():void;
    abstract show():void;
    abstract render(renderables: Renderable[], tiles: TileBase[]):void;
}


export interface ColorableIndicator{
    /**
     * Implementations should provide recipe for changing renderable color to value provided.
     * @param renderable 
     * @param hexColor 
     * @returns 
     */
    _changeColor: (renderable:Renderable, hexColor:string)=>void
}

export abstract class AreaMapIndicator extends MapIndicator implements ColorableIndicator{
    // renderables used for indicators
    renderables: Renderable[];
    tiles: TileBase[];
    renderableKey: string;
    

    constructor(mapProvider: MapPositionProvider&MapWritable, renderablesFactory: RenderablesFactory, renderableKey: string){
        super(mapProvider, renderablesFactory); 
        this.renderables = [];   
        this.tiles = [];   
        this.renderableKey = renderableKey;
        
    }
    forTile(tile: TileBase, hexColor?:string): void {
        this.hide();        
        if(this.renderables.length<=0){
            const renderable = this.renderablesFactory.spawnRenderableObject(this.renderableKey);
            this.renderables.push(renderable);
            this.mapProvider.add(renderable);
        }        
        // when color provided do try to change renderables color
        if(hexColor){
            this.renderables.map((renderable:Renderable)=>{
                this._changeColor(renderable, hexColor);        
            })                   
        }
        this.tiles = [tile];
        this.render(this.renderables.slice(0,1),[tile]);        
        this.show();
    }
    forTiles(tiles: TileBase[], hexColor?:string): void {
        this.hide();
        if(tiles.length==0)
            return;
        if(this.renderables.length<tiles.length){
            const delta = tiles.length-this.renderables.length;
            for(let i=0; i<delta;i++){
                const renderable = this.renderablesFactory.spawnRenderableObject(this.renderableKey);                     
                this.renderables.push(renderable);
                this.mapProvider.add(renderable);
            }
        }
        // when color provided do try to change renderables color
        if(hexColor){
            this.renderables.map((renderable:Renderable)=>{
                this._changeColor(renderable, hexColor);        
            })                   
        }
            
        this.tiles = tiles;
        this.render(this.renderables.slice(0,tiles.length),tiles);        
        this.show();
        
    }
    
    abstract _changeColor(renderable:Renderable, hexColor:string):void;  

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

export abstract class AreaMapIndicatorThreeJs extends AreaMapIndicator{    
    render(renderables: Renderable[], tiles: TileBase[]): void {        
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

export class QuadAreaMapIndicator3Js extends AreaMapIndicatorThreeJs{
    static async create(mapProvider: MapPositionProvider&MapWritable){
        const specification = [{
            name: "mapHelpers",
            json: JSON.stringify(RENDERABLES.MAP.SQUARE.highlight),                    
            pivotCorrection: "0,0,0.12",
            scaleCorrection: {
                // byFactor: 1.2
                autoFitSize: 1                
            },
            filterByNames: ["MAP_HLPR_HIGHLIGHT"]
        }]
        const factory = new RenderablesThreeJSFactory({});            
        await factory.setSpecifications(specification);
        
        const r = new QuadAreaMapIndicator3Js(mapProvider, factory, "MAP_HLPR_HIGHLIGHT");
        return r;        
    }
    
    _changeColor(renderable: Renderable, hexColor: string): void {
        renderable.data.travers((object3D: Object3D)=>{
            if(object3D.type == "Mesh"){
                if(Array.isArray((<Mesh>object3D).material)){
                    (<Material[]>(<Mesh>object3D).material).forEach((material:Material)=>{
                        (<any>material).color.set(hexColor)    
                    })
                }else{
                    (<any>(<Mesh>object3D).material).color.set(hexColor)
                }                
            }
        })        
    }
}
export class HexAreaMapIndicator3Js extends AreaMapIndicatorThreeJs{
    static async create(mapProvider: MapPositionProvider&MapWritable){
        const specification:RenderableSpecification[] = [{
            name: "mapHelpers",
            json: JSON.stringify(RENDERABLES.MAP.HEX.highlight),                    
            // pivotCorrection: "0,0,0.12",
            autoPivotCorrection: true,
            scaleCorrection: {
                // byFactor: 1.2
                autoFitSize: 1                
            },
            groundLevel:0.101,
            filterByNames: ["MAP_HLPR_HIGHLIGHT"],
            
        }]
        const factory = new RenderablesThreeJSFactory({});            
        await factory.setSpecifications(specification);
        
        const r = new HexAreaMapIndicator3Js(mapProvider, factory, "MAP_HLPR_HIGHLIGHT");
        return r;        
    }
    
    _changeColor(renderable: Renderable, hexColor: string): void {
        renderable.data.travers((object3D: Object3D)=>{
            if(object3D.type == "Mesh"){
                if(Array.isArray((<Mesh>object3D).material)){
                    (<Material[]>(<Mesh>object3D).material).forEach((material:Material)=>{
                        (<any>material).color.set(hexColor)    
                    })
                }else{
                    (<any>(<Mesh>object3D).material).color.set(hexColor)
                }                
            }
        })        
    }
}