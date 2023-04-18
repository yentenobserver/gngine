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

    }
    static async getInstance(canvas, emitter, tileAssetsSpecificationJSON, kind, mapSize){
        const p = new GUIEngine();

        const playgroundAndView = await p._preparePlaygroundAndView(canvas, emitter);
        p._map.mainView = playgroundAndView.view;
        p._playground = playgroundAndView.playground;
        p._map.hudView = playgroundAndView.hudView;

        p._tiles.assetFactory = await p._prepareFactory(tileAssetsSpecificationJSON, kind);     
        p._tiles.renderer = await p._prepareRenderer(mapSize, kind, p._tiles.assetFactory, p._map.mainView, emitter);

        const widthHeight = mapSize.split("x").map((item)=>{return item.trim()});

        for(let c = 0; c<widthHeight[0];c++){
            for(let r = 0; r<widthHeight[1]; r++){
                const tile = {
                    "id": `${c},${r}`,
                    "x": `${c}`,
                    "y": `${r}`,
                    "d": "S",
                    "r": "MAS_PLACEHOLDER_TILE",
                    "t": "PLAIN"                    
                }

                p._tiles.renderer.put(tile, tile.d);
            }
        }                    
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
            specification = {           
                main: {
                    name: "main",
                    json: JSON.stringify(assetJsonObject),                    
                    // pivotCorrection: "0.15,-0.3,0.1",
                    autoPivotCorrection: true
                    // scaleCorrection: 0.01
                }
            }
        }else{
            specification = assetJsonObject
        }
        
        let factory = {};
        if(kind == "Unit"){
            factory = new gngine.UnitRenderablesThreeJSFactory(specification, new THREE.GLTFLoader());
            await factory.loadTemplates(["_UNIT"]);            
        }else if (kind == "HexTile" || kind == "QuadTile"){
            factory = new gngine.RenderablesThreeJSFactory(specification, new THREE.GLTFLoader());            
            await factory.loadTemplates(["MAS"]);            
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

}

class App {
    constructor(emitter, mapCanvas) {
        
        this.emitter = emitter                    
        this.model = {
            game: {
                player: {},
                canvas: {}
            },
            process: {
                step: "ChooseKind" //
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
                filter: ""
            }

        }
        // this.emitter.on("AddAssetModalController:json",this.processAddAsset.bind(this))
        // this.emitter.on("AddTagsModalController:item",this.processAddTags.bind(this))
        
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

                const assetSpecification = await that._findAssetSpecification(that.model.selected.tile.data.r);

                that.model.selected.tile.asset = assetSpecification;
            };                                    
        });
    }

    async _findAssetSpecification(renderableName){
        // const assetsSpecs = []

        const assetsSpecs = await this.loadAsset("./assets/assets.json", "JSON");

        let result = {
            item: {},
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
        //     kind: "Unit" | "HexTile" | "QuadTile" // kind of asset
        //     created: number // creation timestamp
        //     variants: AssetVariantSpecs[]    // variants of the asset
        //     tags: string[]  // tags associated with asset
        // }
        for(let i=0; i<assetsSpecs.length; i++){
            const item = assetsSpecs[i];

            const matching = item.variants.find((subitem)=>{
                return subitem.fullName.trim().toLowerCase() == renderableName.trim().toLowerCase();
            })
            if(matching){
                result.item = item;
                result.variant = matching;
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
                tags: that.model.stepUseWizard.form.tags.value.split(",").map((item)=>{return item.trim()}),
                address: that.model.stepUseWizard.form.address.value.trim(),
                latlon: that.model.stepUseWizard.form.latlon.value.split(",").map((item)=>{return item.trim()})
            });
        }
    }

    async _startMap(mapCharacteristics){
        const that = this;
        // remove previously instantiated map
        if(that.model.game.canvas && that.model.game.canvas.nodeName && that.model.game.canvas.nodeName.toLowerCase() == "canvas"){
            document.getElementById("map-holder").removeChild(that.model.game.canvas);
        }

        var canvas = document.createElement('canvas');
        canvas.className += " map playground";
        document.getElementById("map-holder").appendChild(canvas);
        
        that.model.game.canvas = canvas;

        const mapRenderablesSpecification = {
            placeholder: {
                name: "mapPlaceholder",
                json: mapCharacteristics.kind == "HexTile" ? JSON.stringify(gngine.RENDERABLES.MAP.HEX.placeholder):JSON.stringify(gngine.RENDERABLES.MAP.SQUARE.placeholder),                    
                autoPivotCorrection: true
            },
            helpers: {
                name: "mapHelpers",
                json: JSON.stringify(gngine.RENDERABLES.MAP.SQUARE.highlight),                    
                pivotCorrection: "0,0,0.12"
            }
        }


        const guiEngine = await GUIEngine.getInstance(that.model.game.canvas, that.emitter, mapRenderablesSpecification, mapCharacteristics.kind, mapCharacteristics.size);



    }







    async _handleFilter(e, that){        
        that.model.assets.filtered = that.model.assets.original.filter((item)=>{return item.name.toLowerCase().includes(that.model.assets.filter) || item.tags.join(",").toLowerCase().includes(that.model.assets.filter) })
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



    // async processAddAsset(assetJsonObject){
    //     let that = this;

    //     const specification = {           
    //         main: {
    //             name: "main",
    //             json: JSON.stringify(assetJsonObject),                    
    //             pivotCorrection: "0.15,-0.3,0.1",
    //             // scaleCorrection: 0.01
    //         }
    //     }
    //     // const specification = {           
    //     //     main: {
    //     //         name: "main",
    //     //         url: "../hexmap/assets/units.gltf",
    //     //         pivotCorrection: "0.15,-0.3,0.1"
    //     //     }
    //     // }
    //     const unitFactory = new gngine.UnitRenderablesThreeJSFactory(specification, new THREE.GLTFLoader());
    //     await unitFactory.loadTemplates(["_UNIT"]);
    //     console.log(unitFactory.spawnableRenderablesNames());
        
    //     // canvas for thumbnail generation
    //     var canvas = document.createElement('canvas');
    //     canvas.id = "temporaryCanvas"
    //     canvas.style.display = 'none';
    //     canvas.width = 400;
    //     canvas.height = 400;
        
    //     document.body.appendChild(canvas)
        

    //     const playgroundOptions = {
    //         enableScreenshots: true
    //     }
        
    //     // let p = new gngine.PlaygroundThreeJs(document.getElementById("unitCanvas"),this.emitter, playgroundOptions);
    //     let p = new gngine.PlaygroundThreeJs(canvas,this.emitter, playgroundOptions);
    //     p.initialize();    
    //     let viewOptions = {
    //         cameraParams: {                
    //             fov: 50,
    //             near: 0.1,
    //             far: 1000                             
    //         },
    //         cameraPosition: new THREE.Vector3(0,-1,0.75)
    //     }           
    //     let mainView = new gngine.PlaygroundViewMainThreeJsDefault(this.emitter, viewOptions); 
    //     await p.attach(mainView);        
    //     mainView._setupScene(); 
    //     p.run();
    //     const unitRenderer = new gngine.UnitsRendererThreeJS(this.emitter, new gngine.HexFlatTopPositionProviderThreeJs(1), new gngine.HexFlatTopOrientationProviderThreeJs());
    //     unitRenderer.setRenderablesFactory(unitFactory);
    //     unitRenderer.setView(mainView);
    //     await unitRenderer.initialize();

    //     const tile = {
    //         "id": "0,0",
    //         "x": 0,
    //         "y": 0,
    //         "d": "S",
    //         "t": "C_T_GRASS_1_TILE",
    //         "loc": {
    //           "n": "Grassland",
    //           "g": "43.74650403587078,7.421766928360976"
    //         },
    //         "ext": {},
    //         "nft": {
    //           "v": 100,
    //           "b": "ETHEREUM",
    //           "i": "123",
    //           "t": "0x123",
    //           "o": "0x0022"
    //         }
    //     }

    //     const spawnableNames = unitFactory.spawnableRenderablesNames();                

    //     for(let j=0; j<spawnableNames.length; j++){
    //     // for(let j=0; j<1; j++){
    //         let unit = {
    //             actionPoints: 1,
    //             actionRunner: undefined,
    //             actionsAllowed: [],
    //             actionsQueue: [],
    //             attackStrength: (_unit)=>{ return 1},
    //             defendStrength: (_unit)=>{ return 1},
    //             gainBattleExperience: ()=>{},
    //             hitPoints: 5,
    //             rangeStrength: 10,
    //             strength: 10,
    //             sight: 2,
    //             uid: Math.random().toString(36).substring(2, 8),
    //             unitSpecification: {
    //                 hitPoints: 10,
    //                 name: "Type",
    //                 tuid: spawnableNames[j].split("_")[0]
    //             }
    //         }
            
    //         unitRenderer.put(unit, tile,"SW");            
    //         const waitForScreenshot = new Promise((resolve, reject)=>{
    //             setTimeout(()=>{                                        
    //                 resolve(p.takeScreenShot())
    //             },2000);
    //         })
    //         const screenshotDataUrl = await waitForScreenshot;

    //         // const screenshotDataUrl = p.takeScreenShot();
    //         // const screenshotDataUrl1 = p.takeScreenShot();
    //         // const screenshotDataUrl2 = p.takeScreenShot();
    //         // const screenshotDataUrl3 = p.takeScreenShot();
    //         console.log(j, screenshotDataUrl);
    //         that.model.assetsData.push({
    //             id: unit.uid,
    //             name: unit.unitSpecification.tuid,
    //             fullName: spawnableNames[j],
    //             thumbnail: screenshotDataUrl

    //         });
    //         unitRenderer.remove(unit);
    //     }
       

    //     window.playground = p;

    //     // let j = 0;
    //     // let unit = {
    //     //     actionPoints: 1,
    //     //     actionRunner: undefined,
    //     //     actionsAllowed: [],
    //     //     actionsQueue: [],
    //     //     attackStrength: (_unit)=>{ return 1},
    //     //     defendStrength: (_unit)=>{ return 1},
    //     //     gainBattleExperience: ()=>{},
    //     //     hitPoints: 5,
    //     //     rangeStrength: 10,
    //     //     strength: 10,
    //     //     sight: 2,
    //     //     uid: Math.random().toString(36).substring(2, 8),
    //     //     unitSpecification: {
    //     //         hitPoints: 10,
    //     //         name: "Type",
    //     //         tuid: spawnableNames[j].split("_")[0]
    //     //     }
    //     // }
    //     // unitRenderer.put(unit, tile,"SW");            
    //     // this.emitter.emit("playground:screenshot");

        
    //     // this.emitter.on("playground:screenshot:data",(dataUrl)=>{
    //     //     // console.log("Got screenshot")
    //     //     // console.log(dataUrl)
    //     //     // document.getElementById("preview").src = dataUrl;

    //     //     assetsData.push({
    //     //         name: unit.unitSpecification.tuid,
    //     //         fullName: spawnableNames[j],
    //     //         thumbnail: dataUrl

    //     //     });

    //     //     unitRenderer.remove(unit);

    //     //     if(j<spawnableNames.length-1){
    //     //         j++;
    //     //         unit = {
    //     //             actionPoints: 1,
    //     //             actionRunner: undefined,
    //     //             actionsAllowed: [],
    //     //             actionsQueue: [],
    //     //             attackStrength: (_unit)=>{ return 1},
    //     //             defendStrength: (_unit)=>{ return 1},
    //     //             gainBattleExperience: ()=>{},
    //     //             hitPoints: 5,
    //     //             rangeStrength: 10,
    //     //             strength: 10,
    //     //             sight: 2,
    //     //             uid: Math.random().toString(36).substring(2, 8),
    //     //             unitSpecification: {
    //     //                 hitPoints: 10,
    //     //                 name: "Type",
    //     //                 tuid: spawnableNames[j].split("_")[0]
    //     //             }
    //     //         }
    //     //         unitRenderer.put(unit, tile,"SW");            
    //     //         this.emitter.emit("playground:screenshot", unit.uid);
    //     //     }                
    //     // })

    //     // console.log(assetsData);
        
    // }

    async _handeAddTags(e, that){
        console.log(e);
        
        const asset = that.model.assets.original.find((item)=>{return item.name.toLowerCase() == e.target.dataset.id.toLowerCase()})
        that.emitter.emit("showModal:addTags",asset);

    }

    
    async processAddTags(asset){
        const item = this.model.assets.original.find((item)=>{return item.name == asset.name})
        item.tags = asset.tags;

        this._handleFilter({}, this);
    }

    async processAddAsset(assetsInfo){
        assetsInfo.forEach((item)=>{item.that = this})

        // first remove objects that are in the new assetsInfo array
        // this.model.assetsData = this.model.assetsData.filter((item)=>{return assetsInfo.findIndex((item2)=>{return item2.fullName == item.fullName }) == -1 })
        // this.model.assetsData = this.model.assetsData.concat(assetsInfo);


        this.model.assets.original = this.model.assets.original.filter((item)=>{return assetsInfo.findIndex((item2)=>{return item2.name == item.name && item.kind == item2.kind }) == -1 })
        this.model.assets.original = this.model.assets.original.concat(assetsInfo);

        this.model.assets.filtered = this.model.assets.original 



        // let j = 0;
        // let unit = {
        //     actionPoints: 1,
        //     actionRunner: undefined,
        //     actionsAllowed: [],
        //     actionsQueue: [],
        //     attackStrength: (_unit)=>{ return 1},
        //     defendStrength: (_unit)=>{ return 1},
        //     gainBattleExperience: ()=>{},
        //     hitPoints: 5,
        //     rangeStrength: 10,
        //     strength: 10,
        //     sight: 2,
        //     uid: Math.random().toString(36).substring(2, 8),
        //     unitSpecification: {
        //         hitPoints: 10,
        //         name: "Type",
        //         tuid: spawnableNames[j].split("_")[0]
        //     }
        // }
        // unitRenderer.put(unit, tile,"SW");            
        // this.emitter.emit("playground:screenshot");

        
        // this.emitter.on("playground:screenshot:data",(dataUrl)=>{
        //     // console.log("Got screenshot")
        //     // console.log(dataUrl)
        //     // document.getElementById("preview").src = dataUrl;

        //     assetsData.push({
        //         name: unit.unitSpecification.tuid,
        //         fullName: spawnableNames[j],
        //         thumbnail: dataUrl

        //     });

        //     unitRenderer.remove(unit);

        //     if(j<spawnableNames.length-1){
        //         j++;
        //         unit = {
        //             actionPoints: 1,
        //             actionRunner: undefined,
        //             actionsAllowed: [],
        //             actionsQueue: [],
        //             attackStrength: (_unit)=>{ return 1},
        //             defendStrength: (_unit)=>{ return 1},
        //             gainBattleExperience: ()=>{},
        //             hitPoints: 5,
        //             rangeStrength: 10,
        //             strength: 10,
        //             sight: 2,
        //             uid: Math.random().toString(36).substring(2, 8),
        //             unitSpecification: {
        //                 hitPoints: 10,
        //                 name: "Type",
        //                 tuid: spawnableNames[j].split("_")[0]
        //             }
        //         }
        //         unitRenderer.put(unit, tile,"SW");            
        //         this.emitter.emit("playground:screenshot", unit.uid);
        //     }                
        // })

        // console.log(assetsData);
        
    }
    handleDebugDumpTile(e, that){
        const result = JSON.stringify(that.model.selected.tile.toJSON());
        console.log(result);
    }

    handleDebugDumpUnit(e, that){
        const result = JSON.stringify(that.model.selected.unit.toJSON());
        console.log(result);
    }

    handleAddAsset(e, that){
        that.emitter.emit("showModal:addAsset",{});
    }
}

