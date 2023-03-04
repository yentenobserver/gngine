class AppDemo {
    constructor(emitter, mapCanvas) {
        this.playground = {};
        this.emitter = emitter
        this.mapCanvas = mapCanvas
        this.assets3DLoader = new THREE.GLTFLoader();
        this.map = new gngine.MapSquare(2,3);
        this.mapRenderer = {};
    }
    static getInstance(emitter, mapCanvas){
        const a = new AppDemo(emitter, mapCanvas)
        a._start();
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
                url: "./assets/models-prod.gltf",
                pivotCorrection: "-0.5,-0.5,0"
            },
            helpers: {
                name: "mapHelpers",
                json: JSON.stringify(gngine.RENDERABLES.MAP.SQUARE.highlight),                    
                pivotCorrection: "0,0,0.12"
            }
        }
        let mapTileFactory = new gngine.RenderablesThreeJSFactory(mapRenderablesSpecification, new THREE.GLTFLoader());

        mapRenderer = new gngine.MapQuadRendererThreeJs(3,2, this.emitter)
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
        const unitRenderer = new gngine.UnitsRendererThreeJS(this.emitter, mapRenderer);
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
        unitRenderer.put(unit, tile,"S");
        unitRenderer.put(unit2, tile2,"E");

        this.mapRenderer = mapRenderer;
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
}

