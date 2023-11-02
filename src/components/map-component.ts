import { RenderableSpecification, RenderablesFactory, RenderablesThreeJSFactory } from "../gui/renderer/renderables-factory";
import { EventEmitter } from "eventemitter3";
import {Map} from "../specification/map-specs"
import { Playground, PlaygroundThreeJs, PlaygroundView, PlaygroundViewHudThreeJsDefault, PlaygroundViewMainThreeJsDefault } from "../gui/playground/playground";
import { MapHexFlatTopOddRendererThreeJs, MapQuadRendererThreeJs, MapRenderer } from "../gui/renderer/map-renderers";

import * as THREE from 'three'
import { HudComponentMapNavigationThreeJs, HudRendererThreeJs } from "../gui/renderer/hud-renderers";
import { MapSpecs, TileBase, TileBaseDirected } from "gameyngine";
import { Asset } from "../specification/assets";
import { HexAreaMapIndicator3Js, QuadAreaMapIndicator3Js } from "../gui/renderer/map-indicators";
import { RENDERABLES } from "../gui/renderer/assets/threejs3d.notest";

export abstract class Component {
    emitter:EventEmitter;

    constructor(emitter:EventEmitter){
        this.emitter = emitter;        
    }
}


export abstract class MapComponent extends Component {
    _map?: Map;
    _views: {
        map?: PlaygroundView,
        hud?: PlaygroundView
    }
    _playground?: Playground;
    _assetFactory?: RenderablesFactory;
    _renderer?: MapRenderer;

    constructor(emitter:EventEmitter){
        super(emitter);
        this._views = {}
    }

    abstract _preparePlaygroundAndView(canvasElement:any, emitter:EventEmitter):Promise<{playground: Playground, mapView: PlaygroundView, hudView: PlaygroundView}>;
    abstract _prepareFactory(tileSpecifications: RenderableSpecification[]):Promise<RenderablesFactory>;
    abstract _prepareRenderer(map: Map, assetFactory: RenderablesFactory, mapView: PlaygroundView, emitter:EventEmitter):Promise<MapRenderer>;    

    abstract gotoCenter():Promise<void>;
    abstract gotoTile(tile: TileBase):Promise<void>;

    /**
     * Registers asset for rendering as a tile element on map. After successful registration
     * one can chenge tiles using this asset as renderable
     * @param asset target asset
     */
    abstract registerAsset(asset: Asset):Promise<void>;
    
    /**
     * Changes tile to the provided one.
     * @param tile target tile
     * @param asset (optional) when provided then the asset is registered for rendering, this is used when the tile renderable is new, not rendered ever before
     */
    abstract tileChange(tile: TileBaseDirected, asset?: Asset):Promise<void>;

    /**
     * Highlights following tiles with given indicator and given color. Indicator MUST be registered before highlighting.
     * @param tiles tiles to be highlighted
     * @param indicatorName name of the indicator
     * @param color hex color
     */
    abstract tileHighlight(tiles: TileBase[], indicatorName: string, color: string):Promise<void>;
    /**
     * Registers new highlight indicator with given name
     * @param name indicator name
     */
    abstract registerIndicator(name: string):Promise<void>;
    
}

export abstract class MapComponent3JS extends MapComponent {
    _externalLoader: any;

    constructor(emitter:EventEmitter){
        super(emitter);
    }



    async _prepare(map:Map, tileSpecifications:RenderableSpecification[], canvasElement:any, emitter:EventEmitter, externalLoader:any):Promise<MapComponent3JS>{
        let component = this;
        
        component._externalLoader = externalLoader;
        component._map = map;
        const playgroundAndView = await component._preparePlaygroundAndView(canvasElement, emitter);
        component._playground = playgroundAndView.playground;
        component._views.map = playgroundAndView.mapView;
        component._views.hud = playgroundAndView.hudView;

        component._assetFactory = await component._prepareFactory(tileSpecifications);
        component._renderer = await component._prepareRenderer(map, component._assetFactory, component._views.map, emitter);

        // render all tiles
        for(let i=0; i<map.tiles!.length; i++){
            const tile = map.tiles![i];
            component._renderer.put(tile, tile.d);
        }
        return component;
    }
   
    /* istanbul ignore next */
    async _preparePlaygroundAndView(canvasElement:any, emitter:EventEmitter):Promise<{playground: Playground, mapView: PlaygroundView, hudView: PlaygroundView}>{
        const playgroundOptions = {
            enableScreenshots: true
        }
                
        let p = new PlaygroundThreeJs(canvasElement, emitter, playgroundOptions);
        p.initialize();            
        let viewOptions = {
            cameraParams: {                
                fov: 50,
                near: 0.1,
                far: 1000,
                height: 0                             
            },
            cameraPosition: new THREE.Vector3(0,-5,4)
        }        
        let mainView = new PlaygroundViewMainThreeJsDefault(emitter, viewOptions); 
        await p.attach(mainView);        
        mainView._setupScene(); 
        p.run();

        let hudView = new PlaygroundViewHudThreeJsDefault(emitter);
        await p.attach(hudView);
        const hudRenderer = new HudRendererThreeJs(emitter);
        hudRenderer.setView(hudView);

        try{
            const navComp = new HudComponentMapNavigationThreeJs("./assets/map-navigations.png");
            await navComp.build();
            hudRenderer.addComponent(navComp); 
        }catch(error:any){
            console.warn(`Error instantiating map navigations controller, check that navigation texture asset is properly installed as "assets/map-navigations.png"`);
        }
        


        return {
            playground: p,
            mapView: mainView,
            hudView: hudView
        }
    }

    /* istanbul ignore next */
    async _prepareFactory(tileSpecifications: RenderableSpecification[]):Promise<RenderablesFactory>{        
        let factory = new RenderablesThreeJSFactory(this._externalLoader);            
        await factory.setSpecifications(tileSpecifications);
        return factory;
    }

    /* istanbul ignore next */
    async _prepareRenderer(map: Map, assetFactory: RenderablesFactory, mapView: PlaygroundView, emitter:EventEmitter):Promise<MapRenderer>{
        const widthHeight = map.specs.size.split("x").map((item)=>{return parseInt(item.trim())});
        // prepare Renderer
        let renderer:MapRenderer|undefined = undefined;

        if(map.specs.kind == "HexTile"){
            renderer = new MapHexFlatTopOddRendererThreeJs(widthHeight[0],widthHeight[1], emitter, map.specs.options)            
        }else if(map.specs.kind == "QuadTile"){
            renderer = new MapQuadRendererThreeJs(widthHeight[0],widthHeight[1], emitter, map.specs.options)
        }else{
            throw new Error(`Incompatibile map kind, one of HexTile or QuadTile is supported`)
        }
        
        renderer!.setRenderablesFactory(assetFactory);
        renderer!.setView(mapView);
        await renderer!.initialize();        

        return renderer!;        
    }

    async gotoCenter(){
        const centerTile: TileBase = <TileBase>{
            x: Math.round(this._renderer!.width/2),
            y: Math.round(this._renderer!.height/2)
        }
        this._renderer!.goToTile(centerTile);        
    }
    async gotoTile(tile: TileBase){
        this._renderer!.goToTile(tile);        
    }

    /**
     * Makes asset ready for using in tiles and in rendering. 
     * 
     * Make sure that asset's variant renderablesJson
     * contains object which name equals variant fullName.
     * @param {Asset} asset asset  
     */
    async registerAsset(asset: Asset){
        const availableSpecificationsNames = this._assetFactory!.spawnableRenderablesNames();
        if(!availableSpecificationsNames.join(",").includes(asset.variant.fullName)){
            // load specification as it's missing from the factory
            const specs = {
                name: `${asset.specs.name}_${asset.specs.id}`,
                json: JSON.stringify(asset.variant.renderableJSON),                    
                // pivotCorrection: "0.15,-0.3,0.1",
                autoPivotCorrection: true,
                // scaleCorrection: 0.01
                scaleCorrection: {
                    // byFactor: 1.2
                    autoFitSize: 1                
                },
                filterByNames: [asset.variant.fullName] // in case the renderable json contains more 3d objects we register only the asset
            }
            await this._assetFactory!.setSpecifications([specs]);
        }
    }
    /**
     * Changes provided tile visual representation, either by using one of already registered assets or by simultanously registering a new asset 
     * in the engine.
     * @param tile tile to be changed
     * @param asset (optional) when provided asset is registered (if not registered already) and after that the tile is changed
     */
    async tileChange(tile: TileBaseDirected, asset?: Asset){
        if(asset)
            await this.registerAsset(asset);
        this._renderer!.put(tile, tile.d);
    }

    async tileHighlight(tiles: TileBase[], indicatorName: string, color: string){
        this._renderer!.highlightTiles(tiles, indicatorName, color);
    }
    async registerIndicator(name: string){
        const indicator =  this._map?.specs.kind == "HexTile"?await HexAreaMapIndicator3Js.create(this._renderer!):await QuadAreaMapIndicator3Js.create(this._renderer!)
        this._renderer!.registerIndicator(name, indicator);
    }
}

export class MapViewerComponent3JS extends MapComponent3JS {
    constructor(emitter:EventEmitter){
        super(emitter);
    }
    /* istanbul ignore next */
    /**
     * ThreeJs Map viewer component for given map
     * @param mapSpecification map data
     * @param tileSpecifications threejs renderables' specifications that can be used to render map data (it is assumed that all tile.r are in the tile specifications provided)
     * @param canvasElement target html canvas element where map viewer will be loaded
     * @param emitter receives map events
     * @param externalLoader (optional) required, when tile specification uses other format than threejs json format
     * @returns 
     */
    static async getInstance(map:Map, tileSpecifications:RenderableSpecification[], canvasElement:any, emitter:EventEmitter, externalLoader:any):Promise<MapComponent3JS>{
        const component = new MapViewerComponent3JS(emitter);
        return component._prepare(map, tileSpecifications, canvasElement, emitter, externalLoader);
    }
}

export interface MapBaseOptions{
    dimensions: string, // widthxheight map dimensions
    backgroundImgUrl?: string // optional, image to be shown in map background
}

export class MapHexBaseComponent3JS extends MapComponent3JS {
    constructor(emitter:EventEmitter){
        super(emitter);
    }
    /* istanbul ignore next */
    static async getInstance(specs:MapSpecs, canvasElement:any, emitter:EventEmitter):Promise<MapHexBaseComponent3JS>{
        const component = new MapHexBaseComponent3JS(emitter);
        await component._internalPrepare(specs, canvasElement, emitter);
        return component;
    }

    async _internalPrepare(specs:MapSpecs, canvasElement:any, emitter:EventEmitter){
        const mapDefaults = this._mapDefaults(specs);
        await this._prepare(mapDefaults, this._tileRenderables(), canvasElement, emitter, {});
        await this.registerIndicator("H3D_Highlighter");
        return this;
    }

    _mapDefaults(specs:MapSpecs):Map{
        const map:Map = {
            specs: specs,
            assets: [], // asset references left empty 
            tiles: this._tiles(specs)
        }
        return map;        
    }

    _tiles(specs:MapSpecs):TileBaseDirected[]{
        const tiles = [];
        const widthHeight = specs.size.split("x").map((item)=>{return item.trim()}).map(item=>Number.parseInt(item));

        for(let c = 0; c<widthHeight[0];c++){
            for(let r = 0; r<widthHeight[1]; r++){
                const tile:TileBaseDirected = {
                    "id": `${c},${r}`,
                    "x": c,
                    "y": r,
                    "d": "S",
                    "r": "MAS_TRANSPARENT_TILE",
                    "t": {"kind": "UNDEFINED"}                 
                }
                tiles.push(tile);
            }
        }
        return tiles;
    }

    _tileRenderables():RenderableSpecification[]{
        const mapRenderablesSpecifications:RenderableSpecification[] = [            
            {
                name: "mapHelpers",
                json: JSON.stringify(RENDERABLES.MAP.SQUARE.highlight),                    
                pivotCorrection: "0,0,0.12",
                scaleCorrection: {                    
                    // byFactor: 1.2
                    autoFitSize: 1                
                },
                filterByNames: ["MAP_HLPR_HIGHLIGHT"]
            }, // highlight renderable
            {
                name: "mapTiles",
                json: JSON.stringify(RENDERABLES.MAP.HEX.transparent),                    
                autoPivotCorrection: true,
                scaleCorrection: {                    
                    autoFitSize: 1                
                },
                filterByNames: ["MAS_TRANSPARENT_TILE"]
            }// transparent tile renderable
        ]
        return mapRenderablesSpecifications;
    }

}