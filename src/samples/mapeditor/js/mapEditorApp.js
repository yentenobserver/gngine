class MapEngine {
    constructor(){
        this._engine = {}
    }

    static async getInstance(kind, mapSize, tiles){
        const widthHeight = mapSize.split("x").map((item)=>{return item.trim()});

        const r = new MapEngine();
        r._engine = kind == "HexTile"?new gngine.MapHexOddQ(widthHeight[0],widthHeight[1]):new gngine.MapSquare(widthHeight[0],widthHeight[1]);
        r._engine.fromTiles(tiles);
        return r;
    }        
}
class GUIEngine {

    constructor(){
        this._playground = {};
        this._map = {
            mainView: {},
            hudView: {}
        }
        this._tiles = {
            assetFactory: {},
            renderer: {}
        }

        this.map = {
            changeTile: this._mapChangeTile.bind(this),
            
        }

    }
    static async getInstance(canvas, emitter, tileAssetsSpecificationsJSON, kind, mapSize, tiles){
        const p = new GUIEngine();

        const playgroundAndView = await p._preparePlaygroundAndView(canvas, emitter);
        p._map.mainView = playgroundAndView.view;
        p._playground = playgroundAndView.playground;
        p._map.hudView = playgroundAndView.hudView;

        p._tiles.assetFactory = await p._prepareFactory(tileAssetsSpecificationsJSON, kind);     
        p._tiles.renderer = await p._prepareRenderer(mapSize, kind, p._tiles.assetFactory, p._map.mainView, emitter);

        // const widthHeight = mapSize.split("x").map((item)=>{return item.trim()});
        
        for(let i=0; i<tiles.length; i++){
            const tile = tiles[i];
            p._tiles.renderer.put(tile, tile.d);
        }
        // for(let c = 0; c<widthHeight[0];c++){
        //     for(let r = 0; r<widthHeight[1]; r++){
        //         const tile = tiles[]

        //         p._tiles.renderer.put(tile, tile.d);
        //     }
        // }    
    
        return p;                
    }

    async addTileSpecifications(specifications){
        await this._tiles.assetFactory.setSpecifications(specifications);
    }
    

    async _preparePlaygroundAndView(canvas, emitter){
        const playgroundOptions = {
            enableScreenshots: true
        }
                
        let p = new gngine.PlaygroundThreeJs(canvas,emitter, playgroundOptions);
        p.initialize();    
        // let viewOptions = {
        //     cameraParams: {                
        //         fov: 100,
        //         near: 0.1,
        //         far: 1000,
        //         height: 0.25                             
        //     },
        //     cameraPosition: new THREE.Vector3(0,-1,0.75)
        // }   
        let viewOptions = {
            cameraParams: {                
                fov: 50,
                near: 0.1,
                far: 1000,
                height: 0                             
            },
            cameraPosition: new THREE.Vector3(0,-5,4)
        }        
        let mainView = new gngine.PlaygroundViewMainThreeJsDefault(emitter, viewOptions); 
        await p.attach(mainView);        
        mainView._setupScene(); 
        p.run();

        let hudView = new gngine.PlaygroundViewHudThreeJsDefault(emitter);
        await p.attach(hudView);
        const hudRenderer = new gngine.HudRendererThreeJs(emitter);
        hudRenderer.setView(hudView);

        const navComp = new gngine.HudComponentMapNavigationThreeJs("./assets/map-navigations.png");
        await navComp.build();
        hudRenderer.addComponent(navComp); 


        return {
            playground: p,
            view: mainView,
            hudView: hudView
        }
    }

    async _prepareFactory(assetJsonObject, kind){
        let specification;

        if(assetJsonObject&&assetJsonObject.metadata&&assetJsonObject.metadata.type){
            // Prepare Renderables Factory
            specification = [{           
                
                    name: "main",
                    json: JSON.stringify(assetJsonObject),                    
                    // pivotCorrection: "0.15,-0.3,0.1",
                    autoPivotCorrection: true,
                    // scaleCorrection: 0.01
                    scaleCorrection: {
                        // byFactor: 1.2
                        autoFitSize: 1                
                    },
                    filterByNames: kind == "Unit"?["_UNIT"]:["MAS"]
            }]
        }else{
            specification = assetJsonObject
        }
        
        let factory = {};
        if(kind == "Unit"){
            factory = new gngine.UnitRenderablesThreeJSFactory(new THREE.GLTFLoader());
            await factory.setSpecifications(specification);
        }else if (kind == "HexTile" || kind == "QuadTile"){
            factory = new gngine.RenderablesThreeJSFactory(new THREE.GLTFLoader());            
            await factory.setSpecifications(specification);
        }
        // console.log(factory.spawnableRenderablesNames());

        return factory;
    }

    async _prepareRenderer(size, kind, factory, view, emitter){
        const widthHeight = size.split("x").map((item)=>{return item.trim()});
        // prepare Renderer
        let renderer = {};
        if(kind == "Unit"){            
            renderer = new gngine.UnitsRendererThreeJS(emitter, new gngine.HexFlatTopPositionProviderThreeJs(1), new gngine.HexFlatTopOrientationProviderThreeJs());            
        }else if(kind == "HexTile"){
            renderer = new gngine.MapHexFlatTopOddRendererThreeJs(widthHeight[0],widthHeight[1], emitter)            
        }else if(kind == "QuadTile"){
            renderer = new gngine.MapQuadRendererThreeJs(widthHeight[0],widthHeight[1], emitter)
        }
        
        renderer.setRenderablesFactory(factory);
        renderer.setView(view);
        await renderer.initialize();


        return renderer;        
    }

    async _mapChangeTile(tile, asset){
        const theTile = JSON.parse(JSON.stringify(tile));
        theTile.r = asset.variant.fullName;        

        const availableSpecificationsNames = this._tiles.assetFactory.spawnableRenderablesNames();
        if(!availableSpecificationsNames.join(",").includes(theTile.r)){
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
            await this._tiles.assetFactory.setSpecifications([specs]);
        }
        
        this._tiles.renderer.put(theTile, theTile.d);

    }

}

class App {
    constructor(emitter, mapCanvas) {
        
        this.emitter = emitter                    
        this.model = {
            parent: this,      
            game: {
                player: {},
                canvas: {}
            },
            process: {
                step: "ChooseKind" //
            },
            stepUseJson: {
                form: {
                    contents: {
                        value: "",
                        error: ""
                    },
                }
            },
            stepUseWizard: {
                form:{
                    name: {
                        value: "",
                        error: ""
                    },
                    kind: {
                        value: "HexTile",
                        error: ""
                    },
                    size: {
                        value: "16x10",
                        error: ""
                    },
                    tags: {
                        value: "",
                        error: ""
                    },
                    address: {
                        value: "",
                        error: ""
                    },
                    latlon: {
                        value: "",
                        error: ""
                    }

                }
            },
            selected: {
                tile: {
                    data: {},
                    renderable: {
                        worldPosition: "",
                        item: {}
                    },
                    asset: {}
                },
                unit: {},
                unitData: {},
                unitDataStr: {},
            },
            assetsData: [],
            assets: {
                original: [],
                filtered: [],
                filter: "",
                hidden: true
            },
            handlers: {
                _handleChangeAsset: this._handleChangeAsset.bind(this)
            },
            mapCharacteristics: {
                name: "",
                kind: "",
                size: "",
                tags: [],
                address: "",
                latlon: []
            }

        }   
        this.guiEngine = {}  
        this.mapEngine = {}   
        
        
    }

    static async getInstance(emitter, mapCanvas){
        const a = new App(emitter, mapCanvas)
        await a._start();        
        return a;
    }

    async _start(){     
        const that = this;   
        this.emitter.on("interaction.*",(event)=>{
            if(event.originalEvent.type=="pointerdown") {
                // console.log("Got both", event);
                // that.model.selected = {
                //     unit: {},
                //     unitData: {},
                //     unitDataStr: {},
                //     tile: {},
                //     tileData: {},
                //     tileDataStr: {},
                // }
            }            
        })


    }

    async _handleHideAssetBrowser(e, that){
        that.model.assets.hidden = true;
        that.model.assets.filter = ""
    }

    async _handleShowAssetBrowser(e, that){
        that.model.assets.hidden = false;
        that.model.assets.filter = ""
    }

    async _handleChangeAsset(e, that){          
        console.log(that.item);
        console.log(that.model.selected);
        that.model.parent.guiEngine.map.changeTile(that.model.selected.tile.data, that.item);
        const newTile = JSON.parse(JSON.stringify(that.model.selected.tile.data));
        newTile.r = that.item.variant.fullName;        
        that.model.parent.mapEngine._engine.put(newTile);
    }

    async _loadAssets(kind){
        this.model.assets.original = [];
        this.model.assets.filtered = [];

        const assetsSpecs = await this.loadAsset(`./assets/${kind =="HexTile"?"hex":"quad"}/assets.json`, "JSON");
        for(let i=0; i<assetsSpecs.length; i++){
            const item = assetsSpecs[i];

            const variant = item.variants[0];

            this.model.assets.original.push({
                specs: item,
                variant: variant
            })                                                        
        }        
    }

    async _applyAssetFilter(){
        this.model.assets.filtered = [];

        const searchPhrase = this.model.assets.filter.toLowerCase();

        this.model.assets.filtered = this.model.assets.original.filter((item)=>{
            return item.specs.name.toLowerCase().includes(searchPhrase) 
            || item.variant.fullName.toLowerCase().includes(searchPhrase) 
            || item.specs.id.toLowerCase().includes(searchPhrase) 
            || item.specs.tags.join(",").toLowerCase().includes(searchPhrase)
        })
    }


    async _findAsset(renderableName){
        // const assetsSpecs = []

        // const assetsSpecs = await this.loadAsset(`./assets/${kind =="HexTile"?"hex":"quad"}/assets.json`, "JSON");

        const assetsSpecs = this.model.assets.original;

        let result = {
            specs: {},
            variant: {}
        }

        // export interface AssetVariantSpecs {        
        //     fullName: string // variant name, this is used by renderer when selecting renderable for render
        //     thumbnail: string // variant thumbnail image in data url format
        //     created: number // creation timestamp
        //     renderable: string  // json string representation that can be rendered by renderer    
        // }
        
        // export interface AssetSpecs{
        //     id: string      // unique id
        //     name: string    // user readable name of asset
        //     description: string 
        //     kind: "Unit" | "HexTile" | "QuadTile" // kind of asset
        //     created: number // creation timestamp
        //     variants: AssetVariantSpecs[]    // variants of the asset
        //     tags: string[]  // tags associated with asset
        // }

        // export interface Asset {
        //     specs: AssetSpecs,
        //     variant: AssetVariantSpecs
        // }
        for(let i=0; i<assetsSpecs.length; i++){
            const item = assetsSpecs[i];

            if(item.variant.fullName.trim().toLowerCase() == renderableName.trim().toLowerCase()){
                result = item
                break;
            }

        }
        return result;        
    }

    async _handleStepChooseKind(e, that){
        that.model.process.step =  e.target.dataset.nextStep;
        console.log(that.model.process.step)
    }

    async _handleStepUseWizard(e, that){
        that.model.process.step =  e.target.dataset.nextStep;

        if(that.model.process.step == "ChooseKind"){
            //clear form
            that.model.stepUseWizard.form = {
                name: {
                    value: "",
                    error: ""
                },
                kind: {
                    value: "HexTile",
                    error: ""
                },
                size: {
                    value: "16x10",
                    error: ""
                },
                tags: {
                    value: "",
                    error: ""
                },
                address: {
                    value: "",
                    error: ""
                },
                latlon: {
                    value: "",
                    error: ""
                }

            }
        }
        if(that.model.process.step == "MapEdit"){
            that._startMap({
                name: that.model.stepUseWizard.form.name.value,
                kind: that.model.stepUseWizard.form.kind.value,
                size: that.model.stepUseWizard.form.size.value,
                tags: that.model.stepUseWizard.form.tags.value.split(",").map((item)=>{return item.trim()}).filter((item)=>{return item.length>0}),
                address: that.model.stepUseWizard.form.address.value.trim(),
                latlon: that.model.stepUseWizard.form.latlon.value.split(",").map((item)=>{return item.trim()})
            });
        }
    }

    async _handleStepUseJson(e, that){
        that.model.process.step =  e.target.dataset.nextStep;

        if(that.model.process.step == "ChooseKind"){
            //clear form
            that.model.stepUseJson.form = {
                contents: {
                    value: "",
                    error: ""
                }                
            }
            return
        }

        let map;

        try{
            map = JSON.parse(that.model.stepUseJson.form.contents.value)

            if(!map.specs)
                throw new Error(`Incorrect specification. "specs" element is missing`)
            if(!map.tiles)
                throw new Error(`Incorrect specification. "tiles" array is missing`)
        }catch(error){
            that.model.stepUseJson.form.contents.error = new Error(`Invalid map file contents: ${error.message}`)
            that.model.process.step = "UseJson"
            return;
        }

        if(that.model.process.step == "MapEdit"){
            that._startMap(map.specs, map.tiles)
        }
    }

    async _startMap(mapCharacteristics, tiles){

        const that = this;
        this.model.mapCharacteristics = mapCharacteristics;
        this.emitter.on(gngine.Events.INTERACTIONS.UNIT,(event)=>{
            if(event.originalEvent.type=="pointerdown") {
                

                // console.log('UNIT', event)
                for(let i=event.data.hierarchy.length-1; i>= 0; i--){
                    if(event.data.hierarchy[i].userData.unitData){                
                        const unitData = event.data.hierarchy[i].userData.unitData                                            
                        that.model.selected.unitData = unitData
                        that.model.selected.unitDataStr = JSON.stringify(unitData, null, "\t");
                        that.model.selected.unitDataStr = that.model.selected.unitDataStr.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
                    //     output = JSON.stringify( output, null, '\t' );
			        // output = output
                    }
                }
                that.model.selected.unit = event.interactingObject;
                that.model.selected.unit.worldPosition = event.worldPosition;
                // console.log(that.model.selected.unit);
            }
            
        });

        this.emitter.on(gngine.Events.INTERACTIONS.TILE,async (event)=>{
            if(event.originalEvent.type=="pointerdown") {
                // console.log('TILE', event)
                for(let i=event.data.hierarchy.length-1; i>= 0; i--){
                    if(event.data.hierarchy[i].userData.tileData){                
                        const tileData = event.data.hierarchy[i].userData.tileData                    
                        window.mgr_tiles.push(tileData);
                        

                        // that.model.selected.tileData = tileData
                        // that.model.selected.tileDataStr = JSON.stringify(tileData, null, "\t");
                        // that.model.selected.tileDataStr = that.model.selected.tileDataStr.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );


                        that.model.selected.tile.data = tileData;

                    //     output = JSON.stringify( output, null, '\t' );
			        // output = output
                    }
                }
                // that.model.selected.tile = event.interactingObject
                // that.model.selected.tile.worldPosition = event.worldPosition

                that.model.selected.tile.renderable.item = event.interactingObject;
                that.model.selected.tile.renderable.worldPosition = event.worldPosition;

                console.log('TILE',that.model.selected.tile);

                const assetSpecification = await that._findAsset(that.model.selected.tile.data.r);

                that.model.selected.tile.asset = assetSpecification;
            };                                    
        });

        await this._loadAssets(mapCharacteristics.kind);
        await this._applyAssetFilter();
        // remove previously instantiated map
        if(that.model.game.canvas && that.model.game.canvas.nodeName && that.model.game.canvas.nodeName.toLowerCase() == "canvas"){
            document.getElementById("map-holder").removeChild(that.model.game.canvas);
        }

        var canvas = document.createElement('canvas');
        canvas.className += " map playground";
        document.getElementById("map-holder").appendChild(canvas);
        
        that.model.game.canvas = canvas;

        const mapRenderablesSpecifications = [
            {         
                name: "mapPlaceholder",
                json: mapCharacteristics.kind == "HexTile" ? JSON.stringify(gngine.RENDERABLES.MAP.HEX.placeholder):JSON.stringify(gngine.RENDERABLES.MAP.SQUARE.placeholder),                    
                autoPivotCorrection: true,                                
                scaleCorrection: {
                    // byFactor: 1.2
                    autoFitSize: 1                
                },
                filterByNames: ["MAS_PLACEHOLDER_TILE"]
            },
            {
                name: "mapHelpers",
                json: JSON.stringify(gngine.RENDERABLES.MAP.SQUARE.highlight),                    
                pivotCorrection: "0,0,0.12",
                scaleCorrection: {
                    // byFactor: 1.2
                    autoFitSize: 1                
                },
                filterByNames: ["MAP_HLPR_HIGHLIGHT"]
            }
        ]
        if(!tiles){
            tiles = [];
            const widthHeight = mapCharacteristics.size.split("x").map((item)=>{return item.trim()});

            for(let c = 0; c<widthHeight[0];c++){
                for(let r = 0; r<widthHeight[1]; r++){
                    const tile = {
                        "id": `${c},${r}`,
                        "x": `${c}`,
                        "y": `${r}`,
                        "d": "S",
                        "r": "MAS_PLACEHOLDER_TILE",
                        "t": {"kind": "UNDEFINED"}                 
                    }
                    tiles.push(tile);
                }
            }
        }

        //this.model.assets.original

        // get all unique "r" renderable keys for map items
        let map = new Map();
        tiles.forEach((item)=>{
            map.set(item.r,item);
        })

        const uniqueRs = Array.from(map.keys());

        for(let i=0; i< uniqueRs.length; i++){
            
            const asset = await that._findAsset(uniqueRs[i]);

            const specs = {         
                name: `${asset.specs.name}_${asset.specs.id}`,
                json: JSON.stringify(asset.variant.renderableJSON),                                    
                autoPivotCorrection: true,                
                scaleCorrection: {                    
                    autoFitSize: 1                
                },
                filterByNames: ["MAS_"]
            }
            // add additional specifications required by map
            mapRenderablesSpecifications.push(specs);
        }
                

            
        
                
        const guiEngine = await GUIEngine.getInstance(that.model.game.canvas, that.emitter, mapRenderablesSpecifications, mapCharacteristics.kind, mapCharacteristics.size, tiles);
        const mapEngine = await MapEngine.getInstance(mapCharacteristics.kind, mapCharacteristics.size, tiles)
        that.guiEngine = guiEngine;
        that.mapEngine = mapEngine;

    }

    async _handleExportMap(e, that){
        // export interface TileSpecs {
        //     tile: TileBase,
        //     asset: AssetSpecs
        // }
        // export interface MapSpecs {
        //     name: string,
        //     kind: string,
        //     size: string,
        //     tags: string[],
        //     address: string,
        //     latlon: string[]
        // }
        // export interface Map {
        //     specs: MapSpecs,
        //     tiles: TileSpecs[]
        // }
        const result = {
            specs: {},
            tiles: []
        }
        result.specs = that.model.mapCharacteristics
        result.tiles = Array.from(that.mapEngine._engine.theMap.values());

        navigator.clipboard.writeText(JSON.stringify(result));

        that._downloadJson(result, result.specs.name)

    }


    async _downloadJson(object, name) {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(object));
        if(document && document.body){
            var element = document.createElement('a');
            element.setAttribute("href", dataStr);
            element.setAttribute("download", name + ".json");
            document.body.appendChild(element); // required for firefox
            element.click();
            element.remove();
        }
        
    }



    async _handleFilter(e, that){        
        // that.model.assets.filtered = that.model.assets.original.filter((item)=>{return item.name.toLowerCase().includes(that.model.assets.filter) || item.tags.join(",").toLowerCase().includes(that.model.assets.filter) })
        that._applyAssetFilter();

    }

    loadAsset(url, type){
        return fetch(url).then((response)=>{
            if(type=='JSON')
                return response.json();
            else if(type=='TXT')
                return response.text();
            else return response.blob();
        })
    }

    handleDebugDumpTile(e, that){
        const result = JSON.stringify(that.model.selected.tile.toJSON());
        console.log(result);
    }

    handleDebugDumpUnit(e, that){
        const result = JSON.stringify(that.model.selected.unit.toJSON());
        console.log(result);
    }
}

