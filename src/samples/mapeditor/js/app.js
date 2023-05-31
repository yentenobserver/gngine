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
            assetsData: [],
            assets: {
                original: [],
                filtered: [],
                filter: ""
            },
            libraries:{
                original: [
                    {name: "lib name", id:"asdasd"}
                ],
                value: "-1"
            }

        }
        this.api = {}
        this.emitter.on("AddAssetModalController:json",this.processAddAsset.bind(this))
        this.emitter.on("AddTagsModalController:item",this.processAddTags.bind(this))
        this.emitter.on("AddLibraryModal:item",this.processAddLibrary.bind(this))
        
        
    }
    static async getInstance(emitter, mapCanvas){
        const a = new AppDemo(emitter, mapCanvas)
        await a._start();
        return a;
    }

    async _start(){
        this.api = Api.getInstance();
        this._loadLibraries();
    }

    async _handleLibrariesChanged(e, that){
        console.log("selected", that.model.libraries.value);
        if(that.model.libraries.value == "_CREATE"){
            that.emitter.emit("showModal:addLibrary", {a:""});
        }
        
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

    async _handeAddTags(e, that){
        console.log(e);
        
        const asset = that.model.assets.original.find((item)=>{return item.id == e.target.dataset.id})
        that.emitter.emit("showModal:addTags",asset);

    }

    async _handeCopy2ClipboardAsset(e, that){
        const asset = that.model.assets.original.find((item)=>{return item.id == e.target.dataset.id})
        console.log(asset);

        const data = {
            id: asset.id,
            created: asset.created,
            kind: asset.kind,
            name: asset.name,
            tags: asset.tags,
            variants: asset.variants,
            description: asset.description,
            library: `${asset.kind}/assets.json`            
        }

        navigator.clipboard.writeText(JSON.stringify(data));
    }

    async _handleCopy2ClipboardLibrary(e, that){
        const assets = that.model.assets.filtered.filter((item)=>{return item.selected});
        const result = [];

        assets.forEach((asset)=>{
            const data = {
                id: asset.id,
                created: asset.created,
                kind: asset.kind,
                name: asset.name,
                tags: asset.tags,
                variants: asset.variants,
                description: asset.description,
                library: `${asset.kind}/assets.json`
            }
            result.push(data);

        })
        navigator.clipboard.writeText(JSON.stringify(result));
    }

    async _loadLibraries(){
        this.model.libraries.original = await Api.getInstance().User.libraries();
        this.model.libraries.original.sort((a,b)=>{return a.name.localeCompare(b.name)})
    }

    
    async processAddLibrary(item){
        
        const library = {
            id: Math.random().toString(36).substring(2, 12),
            name: item.name,
            isPublic: item.isPublic
        }
        await Api.getInstance().User.putLibrary(library);
        this._loadLibraries();
        this.model.libraries.value = library.id
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
        that.emitter.emit("showModal:addAsset",{
            libraries: that.model.libraries.original,
            selected: that.model.libraries.original.find((item)=>{return item.id == that.model.libraries.value})
        });
    }
}

