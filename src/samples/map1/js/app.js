class AppDemo {
    constructor(emitter, mapCanvas) {
        this.playground = {};
        this.emitter = emitter
        this.mapCanvas = mapCanvas
        this.assets3DLoader = new THREE.GLTFLoader();
    }
    static getInstance(emitter, mapCanvas){
        const a = new AppDemo(emitter, mapCanvas)
        a._start();
        return a;
    }

    _start(){
        let p = new gngine.PlaygroundThreeJs(mapCanvas,emitter);
        p.initialize();
        
        let v = new gngine.PlaygroundViewMainThreeJsDefault(emitter); 
        p.attach(v);
        v._setupScene(); 
        
        p.run();


        this.playground = p;
        this.loadAsset("./assets/Monte_Carlo_MC-tileMap.json", "JSON");
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

