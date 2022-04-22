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
        let p = new gngine.PlaygroundThreeJs(mapCanvas,emitter);
        p.initialize();
        
        let mainMapView = new gngine.PlaygroundViewMainThreeJsDefault(emitter); 
        p.attach(mainMapView);
        mainMapView._setupScene(); 
        
        p.run();

        let that = this;

        this.playground = p;

        let mapTileFactory = new gngine.RenderablesThreeJSFactory(new THREE.GLTFLoader());

        let mapRenderer = new gngine.MapQuadRendererThreeJs(2,2,"./assets/models-prod.gltf")
        mapRenderer.setRenderablesFactory(mapTileFactory);
        // map renderer will render map tiles into main map view
        mapRenderer.setView(mainMapView);
        
        this.loadAsset("./assets/map.json", "JSON").then(mapjson=>{
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

