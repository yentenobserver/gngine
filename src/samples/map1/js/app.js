class AppDemo {
    constructor(emitter, mapCanvas) {
        this.playground = {};
        this.emitter = emitter
        this.mapCanvas = mapCanvas
        this.assets3DLoader = new THREE.GLTFLoader();
        this.map = new gngine.MapSquare(2,3)
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
        let p = new gngine.PlaygroundThreeJs(mapCanvas,this.emitter);
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

