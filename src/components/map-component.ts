import { RenderableSpecification, RenderablesFactory, RenderablesThreeJSFactory } from "../gui/renderer/renderables-factory";
import { EventEmitter } from "../util/events.notest";
import {Map} from "../specification/map-specs"
import { Playground, PlaygroundThreeJs, PlaygroundView, PlaygroundViewHudThreeJsDefault, PlaygroundViewMainThreeJsDefault } from "../gui/playground/playground";
import { MapHexFlatTopOddRendererThreeJs, MapQuadRendererThreeJs, MapRenderer } from "../gui/renderer/map-renderers";
import { Vector3 } from 'three';
import { HudComponentMapNavigationThreeJs, HudRendererThreeJs } from "../gui/renderer/hud-renderers";
import { TileBase, TileBaseDirected } from "../logic/map/common.notest";
import { Asset } from "../specification/assets";
import { HexAreaMapIndicator3Js, QuadAreaMapIndicator3Js } from "../gui/renderer/map-indicators";

export abstract class Component {
    emitter:EventEmitter;

    constructor(emitter:EventEmitter){
        this.emitter = emitter;        
    }
}


export abstract class MapViewerComponent extends Component {
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

export class MapViewerComponent3JS extends MapViewerComponent {
    _externalLoader: any;

    constructor(emitter:EventEmitter){
        super(emitter);
    }

    /**
     * ThreeJs Map viewer component for given map
     * @param mapSpecification map data
     * @param tileSpecifications threejs renderables' specifications that can be used to render map data (it is assumed that all tile.r are in the tile specifications provided)
     * @param canvasElement target html canvas element where map viewer will be loaded
     * @param emitter receives map events
     * @param externalLoader (optional) required, when tile specification uses other format than threejs json format
     * @returns 
     */
    static async getInstance(map:Map, tileSpecifications:RenderableSpecification[], canvasElement:any, emitter:EventEmitter, externalLoader:any){
        const component = new MapViewerComponent3JS(emitter);
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
            cameraPosition: new Vector3(0,-5,4)
        }        
        let mainView = new PlaygroundViewMainThreeJsDefault(emitter, viewOptions); 
        await p.attach(mainView);        
        mainView._setupScene(); 
        p.run();

        let hudView = new PlaygroundViewHudThreeJsDefault(emitter);
        await p.attach(hudView);
        const hudRenderer = new HudRendererThreeJs(emitter);
        hudRenderer.setView(hudView);

        const navComp = new HudComponentMapNavigationThreeJs("./assets/map-navigations.png");
        await navComp.build();
        hudRenderer.addComponent(navComp); 


        return {
            playground: p,
            mapView: mainView,
            hudView: hudView
        }
    }

    async _prepareFactory(tileSpecifications: RenderableSpecification[]):Promise<RenderablesFactory>{        
        let factory = new RenderablesThreeJSFactory(this._externalLoader);            
        await factory.setSpecifications(tileSpecifications);
        return factory;
    }

    async _prepareRenderer(map: Map, assetFactory: RenderablesFactory, mapView: PlaygroundView, emitter:EventEmitter):Promise<MapRenderer>{
        const widthHeight = map.specs.size.split("x").map((item)=>{return parseInt(item.trim())});
        // prepare Renderer
        let renderer:MapRenderer|undefined = undefined;

        if(map.specs.kind == "HexTile"){
            renderer = new MapHexFlatTopOddRendererThreeJs(widthHeight[0],widthHeight[1], emitter, map.specs.options)            
        }else if(map.specs.kind == "QuadTile"){
            renderer = new MapQuadRendererThreeJs(widthHeight[0],widthHeight[1], emitter, map.specs.options)
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
                filterByNames: ["MAS_"]
            }
            await this._assetFactory!.setSpecifications([specs]);
        }
    }
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