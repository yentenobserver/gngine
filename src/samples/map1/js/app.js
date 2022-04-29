class AppDemo {
    constructor(emitter, mapCanvas) {
        this.playground = {};
        this.emitter = emitter
        this.mapCanvas = mapCanvas
        this.assets3DLoader = new THREE.GLTFLoader();
        this.map = new gngine.MapSquare(2,2)
    }
    static getInstance(emitter, mapCanvas){
        const a = new AppDemo(emitter, mapCanvas)
        a._start();
        return a;
    }

    _start(){

        this.emitter.on(gngine.Events.INTERACTIONS.TILE,(e)=>{console.log('TILE',e.originalEvent.type)});
        this.emitter.on(gngine.Events.INTERACTIONS.UNIT,(e)=>{console.log('UNIT', e)});


        let that = this;
        let p = new gngine.PlaygroundThreeJs(mapCanvas,emitter);
        p.initialize();
        
        let mapRenderer;

        let mainMapView = new gngine.PlaygroundViewMainThreeJsDefault(emitter); 
        p.attach(mainMapView).then(()=>{
            mainMapView._setupScene(); 
            p.run();
            

            this.playground = p;

            let mapTileFactory = new gngine.RenderablesThreeJSFactory(new THREE.GLTFLoader(), new THREE.Vector3(-0.5,-0.5,0));

            mapRenderer = new gngine.MapQuadRendererThreeJs(2,2,"./assets/models-prod.gltf")
            mapRenderer.setRenderablesFactory(mapTileFactory);
            // map renderer will render map tiles into main map view
            mapRenderer.setView(mainMapView);

            const l2 = new THREE.GLTFLoader()
            l2.load("./assets/i1.gltf",(item)=>{                
                console.log(""+JSON.stringify(item.scene.toJSON()));       
            })
        })
        .then(()=>{
            return this.loadAsset("./assets/map.json", "JSON");
        })        
        .then(mapjson=>{
            that.map.fromTiles(2,mapjson);
            that.map.tile("0,1");
        })
        .then(()=>{
            // now let's download 3d assets for renderer
            return mapRenderer.initialize();
        })
        .then(()=>{
            that.map.theMap.forEach((val, _key) => {
                mapRenderer.put(val, val.d);
            });
        })


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

