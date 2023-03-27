class AppDemo {
    constructor(emitter, mapCanvas) {
        this.playground = {};
        this.emitter = emitter
        this.mapCanvas = mapCanvas
        this.assets3DLoader = new THREE.GLTFLoader();
        this.map = new gngine.MapSquare(2,3);
        this.mapRenderer = {};
        this.model = {
            selected: {
                unit: {},
                unitData: {},
                unitDataStr: {},
                tile: {},
                tileData: {},
                tileDataStr: {},
            },
            assetsData: []

        }
        this.emitter.on("AddAssetModalController:json",this.processAddAsset.bind(this))
    }
    static async getInstance(emitter, mapCanvas){
        const a = new AppDemo(emitter, mapCanvas)
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

    loadAsset(url, type){
        return fetch(url).then((response)=>{
            if(type=='JSON')
                return response.json();
            else if(type=='TXT')
                return response.text();
            else return response.blob();
        })
    }

    async _previewUnit3D(parentElement, width, height){
        const specification = {           
            main: {
                name: "main",
                json: JSON.stringify(assetJsonObject),                    
                // pivotCorrection: "0.15,-0.3,0.1",
                // scaleCorrection: 0.01
            }
        }
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
    async processAddAsset(assetsInfo){
        

        // first remove objects that are in the new assetsInfo array
        this.model.assetsData = this.model.assetsData.filter((item)=>{return assetsInfo.findIndex((item2)=>{return item2.fullName == item.fullName }) == -1 })
        this.model.assetsData = this.model.assetsData.concat(assetsInfo);


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
