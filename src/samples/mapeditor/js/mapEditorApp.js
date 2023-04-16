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
        this.playground = {};
        this.emitter = emitter
        this.mapCanvas = mapCanvas

        this.assets3DLoader = new THREE.GLTFLoader();
        this.map = new gngine.MapSquare(2,3);
        this.mapRenderer = {};
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
                unit: {},
                unitData: {},
                unitDataStr: {},
                tile: {},
                tileData: {},
                tileDataStr: {},
            },
            assetsData: [],
            assets: {
                original: [],
                filtered: [],
                filter: ""
            }

        }
        this.emitter.on("AddAssetModalController:json",this.processAddAsset.bind(this))
        this.emitter.on("AddTagsModalController:item",this.processAddTags.bind(this))
        
    }

    static async getInstance(emitter, mapCanvas){
        const a = new App(emitter, mapCanvas)
        // await a._start();
        return a;
    }

    async _start(){

        // this.emitter.on(gngine.Events.INTERACTIONS.TILE,(e)=>{console.log('TILE',e.originalEvent.type)});
        // this.emitter.on(gngine.Events.INTERACTIONS.UNIT,(e)=>{console.log('UNIT', e)});
        // this.emitter.on(gngine.Events.INTERACTIONS.HUD,(e)=>{console.log('HUD', e)});


        


        let that = this;
        let p = new gngine.PlaygroundThreeJs(this.mapCanvas,this.emitter);
        p.initialize();
        
        let mapRenderer;

        let mainMapView = new gngine.PlaygroundViewMainThreeJsDefault(this.emitter); 

        await p.attach(mainMapView);
        
        mainMapView._setupScene(); 
        p.run();
        

        this.playground = p;
        const mapRenderablesSpecification = {
            main: {
                name: "mapAssets",
                url: "./assets/tiles.gltf",
                pivotCorrection: "-0.5,-0.433012701892219,0"
            },
            helpers: {
                name: "mapHelpers",
                json: JSON.stringify(gngine.RENDERABLES.MAP.SQUARE.highlight),                    
                pivotCorrection: "0,0,0.12"
            }
        }
        let mapTileFactory = new gngine.RenderablesThreeJSFactory(mapRenderablesSpecification, new THREE.GLTFLoader());

        mapRenderer = new gngine.MapHexFlatTopOddRendererThreeJs(3,2, this.emitter)
        mapRenderer.setRenderablesFactory(mapTileFactory);
        // map renderer will render map tiles into main map view
        mapRenderer.setView(mainMapView);

        // const l2 = new THREE.GLTFLoader()
        // l2.load("./assets/i1.gltf",(item)=>{                
        //     // console.log(""+JSON.stringify(item.scene.toJSON()));       
        // })
    
        
        const mapjson = await this.loadAsset("./assets/map.json", "JSON");
        
        that.map.fromTiles(mapjson);
        
            // now let's download 3d assets for renderer
        await mapRenderer.initialize();
        
        that.map.theMap.forEach((val, _key) => {
            mapRenderer.put(val, val.d);
        });
        
        let hudView = new gngine.PlaygroundViewHudThreeJsDefault(this.emitter);
        await p.attach(hudView);

        const hudRenderer = new gngine.HudRendererThreeJs(this.emitter);
        hudRenderer.setView(hudView);

        const navComp = new gngine.HudComponentMapNavigationThreeJs("./assets/map-navigations.png");
        await navComp.build();
        hudRenderer.addComponent(navComp); 

        const unitsRenderablesSpecification = {
            main: {
                name: "unitsAssets",
                url: "./assets/units.gltf",
                pivotCorrection: "-0.3,-0.15,0.1"
            }
            // helpers: {
            //     name: "mapHelpers",
            //     json: JSON.stringify(gngine.RENDERABLES.MAP.SQUARE.highlight),                    
            //     pivotCorrection: "0,0,0.12"
            // }
        }
        const unitFactory = new gngine.UnitRenderablesThreeJSFactory(unitsRenderablesSpecification, new THREE.GLTFLoader());
        const unitRenderer = new gngine.UnitsRendererThreeJS(this.emitter, mapRenderer, new gngine.HexFlatTopOrientationProvider());
        unitRenderer.setRenderablesFactory(unitFactory);
        unitRenderer.setView(mainMapView);
        await unitRenderer.initialize();
        const tile = {
            "id": "0,1",
            "x": 1,
            "y": 0,
            "d": "S",
            "t": "C_T_GRASS_1_TILE",
            "loc": {
              "n": "Grassland",
              "g": "43.74650403587078,7.421766928360976"
            },
            "ext": {},
            "nft": {
              "v": 100,
              "b": "ETHEREUM",
              "i": "123",
              "t": "0x123",
              "o": "0x0022"
            }
        }
        const tile2 = {
            "id": "1,0",
            "x": 0,
            "y": 1,
            "d": "S",
            "t": "C_T_DIRT_1_TILE",
            "loc": {
              "n": "Bushland",
              "g": "43.74650403587078,7.421766928360976"
            },
            "ext": {},
            "nft": {
              "v": 100,
              "b": "ETHEREUM",
              "i": "123",
              "t": "0x123",
              "o": "0x0022"
            }
          }
          const tile3 = {
            "id": "0,2",
            "x": 2,
            "y": 0,
            "d": "S",
            "t": "C_T_DIRT_1_TILE",
            "loc": {
              "n": "Bushland",
              "g": "43.74650403587078,7.421766928360976"
            },
            "ext": {},
            "nft": {
              "v": 100,
              "b": "ETHEREUM",
              "i": "123",
              "t": "0x123",
              "o": "0x0022"
            }
          }
        const unit = {
            actionPoints: 1,
            actionRunner: undefined,
            actionsAllowed: [],
            actionsQueue: [],
            attackStrength: (_unit)=>{ return 1},
            defendStrength: (_unit)=>{ return 1},
            gainBattleExperience: ()=>{},
            hitPoints: 5,
            rangeStrength: 10,
            strength: 10,
            sight: 2,
            uid: "",
            unitSpecification: {
                hitPoints: 10,
                name: "Type",
                tuid: "T34"
            }
        }
        const unit2 = {
            actionPoints: 1,
            actionRunner: undefined,
            actionsAllowed: [],
            actionsQueue: [],
            attackStrength: (_unit)=>{ return 1},
            defendStrength: (_unit)=>{ return 1},
            gainBattleExperience: ()=>{},
            hitPoints: 1,
            rangeStrength: 10,
            strength: 10,
            sight: 2,
            uid: "u2",
            unitSpecification: {
                hitPoints: 10,
                name: "Type",
                tuid: "T34"
            }
        }
        const unit3 = {
            actionPoints: 1,
            actionRunner: undefined,
            actionsAllowed: [],
            actionsQueue: [],
            attackStrength: (_unit)=>{ return 1},
            defendStrength: (_unit)=>{ return 1},
            gainBattleExperience: ()=>{},
            hitPoints: 10,
            rangeStrength: 10,
            strength: 10,
            sight: 2,
            uid: "u3",
            unitSpecification: {
                hitPoints: 10,
                name: "Type",
                tuid: "T34"
            }
        }
        unitRenderer.put(unit, tile,"S");
        unitRenderer.put(unit2, tile2,"NW");
        // unitRenderer.put(unit3, tile3,"E");

        this.mapRenderer = mapRenderer;
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

        this.emitter.on(gngine.Events.INTERACTIONS.TILE,(event)=>{
            if(event.originalEvent.type=="pointerdown") {
                // console.log('TILE', event)
                for(let i=event.data.hierarchy.length-1; i>= 0; i--){
                    if(event.data.hierarchy[i].userData.tileData){                
                        const tileData = event.data.hierarchy[i].userData.tileData                    
                        window.mgr_tiles.push(tileData);
                        that.model.selected.tileData = tileData
                        that.model.selected.tileDataStr = JSON.stringify(tileData, null, "\t");
                        that.model.selected.tileDataStr = that.model.selected.tileDataStr.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
                    //     output = JSON.stringify( output, null, '\t' );
			        // output = output
                    }
                }
                that.model.selected.tile = event.interactingObject
                that.model.selected.tile.worldPosition = event.worldPosition
            };
            
            
            // console.log('TILE',event.originalEvent.type)
        });
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

