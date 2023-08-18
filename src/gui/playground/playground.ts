import * as THREE from 'three'
import { Object3D, Vector3 } from 'three';
import { Events } from '../../util/eventDictionary.notest';
import { EventEmitter } from '../../util/events.notest';

export interface PlaygroundOptions {
    enableScreenshots: boolean
}

/**
 * Playground is a separated display context
 * that can be embedded in external container (like a part of a web page).
 * Playground holds and draws views that are attached to it. 
 * It is also an interation interface between actions in playground and external container.
 */
export abstract class Playground{
    container: any;
    interactions: PlaygroundInteractions;
    views: PlaygroundView[];
    emitter: EventEmitter;
    options: PlaygroundOptions;

    constructor(container: any, emitter: EventEmitter, options?:PlaygroundOptions){
        this.container = container;
        this.interactions = new PlaygroundInteractions();
        this.views = [];
        this.emitter = emitter
        this.options = options || {
            enableScreenshots: false
        }
        
    }   
    initialize():void{
        this._attachInteractionListeners();
    };
    abstract attach(view:PlaygroundView):Promise<void>;
    abstract run():void;

    /**
     * Returns screenshot of the current playground look.
     * @returns {string} image from playground in data url format
     */
    abstract takeScreenShot():string;

    abstract _attachInteractionListeners():void;
    abstract _onInteraction(...event:any[]):void;
    abstract _onEvent(...event:any[]):void;

    
}
/**
 * Playground implementation using ThreeJS 3D javascript library.
 * It uses WebGLRenderer for drawing elements that were put into the view by renderers.
 */
export class PlaygroundThreeJs extends Playground{
    
    
    _renderer: THREE.WebGLRenderer|any;
    _resizeInfo: any = {
        prevWidth: 0,
        prevHeight: 0
    };    

    constructor(canvasHTMLElement:any, emitter: EventEmitter, options?:PlaygroundOptions){
        super(canvasHTMLElement, emitter, options);        
        
    }
    initialize(): void {
        super.initialize();
        this._setupRenderer(this.container);
    }
    attach(view: PlaygroundView): Promise<void> {
        
        view._preAttach(this);
        
        const potentialHudView = (view as any) as PlaygroundViewHud;

        // important for multiple scenes/cameras handling
        if(potentialHudView.isViewHud && this._renderer){
            this._renderer!.autoClear = false;
        }
        
        // remove previous if was added already
        this.views = this.views.filter((item:PlaygroundView)=>{
            return item.name != view.name
        })
        
        if(potentialHudView.isViewHud){
            // make sure hud view is always the first view (for handling hud controls as priority against map elements)
            this.views.unshift(view);
        }else{
            this.views.push(view);
        }
        
        
        return Promise.resolve();
    }

    run(): void {

        requestAnimationFrame(this.run.bind(this));
        const mainView = this.views.find((item:PlaygroundView)=>{
            const potentialHudView = (item as any) as PlaygroundViewHud;
            return !potentialHudView.isViewHud
        }) as PlaygroundViewMainThreeJs;

        const hudView = this.views.find((item:PlaygroundView)=>{
            const potentialHudView = (item as any) as PlaygroundViewHud;
            return potentialHudView.isViewHud
        }) as PlaygroundViewHudThreeJs;

        
        
    
        if (this._resizeRendererToDisplaySize()) {
            const canvas = this._renderer!.domElement;
            mainView.camera!.aspect = canvas.clientWidth / canvas.clientHeight;
            mainView.camera!.updateProjectionMatrix();
            if(hudView){
                hudView.camera!.left = - canvas.clientWidth / 2;
				hudView.camera!.right = canvas.clientWidth / 2;
				hudView.camera!.top = canvas.clientHeight / 2;
				hudView.camera!.bottom = - canvas.clientHeight / 2;
				hudView.camera!.updateProjectionMatrix();
            }
            
        }
                
        // render scene
        if(hudView){
            this._renderer!.clear();
            // renderer.render(hudSceneHolder.scene, hudSceneHolder.camera);                
        }

            
        this._renderer!.render(mainView.scene!, mainView.camera!);                

        // if HUD is available
        if(hudView){
            this._renderer!.clearDepth()
            this._renderer!.render(hudView.scene!, hudView.camera!);                
        }
        
    }

    takeScreenShot(): string {
        if(!this.options.enableScreenshots)
            throw new Error(`Playground "enableScreenshots" option must be set for screenshots to be operational`);
        if(this._renderer&&this._renderer.domElement)
            return this._renderer.domElement.toDataURL();
        else{
            throw new Error("Can't take screenshot as renderer is not properly bound to dom element");
        }
    }

    _attachInteractionListeners(): void {        
        this.container.addEventListener( 'pointermove', this._onInteraction.bind(this) );
        this.container.addEventListener( 'pointerdown', this._onInteraction.bind(this) );
        this.emitter.on(Events.DEBUG.DUMP_VIEW, (data:any)=>{this._onEvent(Events.DEBUG.DUMP_VIEW, data)} );
    }
    _onInteraction(...event:any[]): void {        
        for (let index = 0; this.views&&index < this.views.length; index++) {
            const view = this.views[index];
            const interactionResult = view._onInteraction(...event);
            if(interactionResult)
                break;
        }
        
    }
    _onEvent(...event:any[]): void {        
        for (let index = 0; this.views&&index < this.views.length; index++) {
            const view = this.views[index];
            view._onEvent(...event);            
        }
        
    }

    /* istanbul ignore next */
    _setupRenderer(canvasElement:any):void{
        if(canvasElement.nodeName!="CANVAS")
            throw new Error(`Invalid canvas html element`);

        let rendererOptions = {
            canvas: canvasElement,
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: this.options.enableScreenshots // required for takeScreenShot method, be carefull, when enabled may have performance impact
        }
        
        // initialize renderer
        var renderer = new THREE.WebGLRenderer(rendererOptions);
        // renderer.setClearColor(0x000000);
        renderer.setClearColor( 0xeeeeee, 0.01 );
        renderer.setPixelRatio(window.devicePixelRatio);

        // https://discourse.threejs.org/t/gltfexported-model-is-way-darker/6686
        // renderer.gammaOutput = true;
        // // renderer.gammaFactor = 2.2;
        // renderer.gammaFactor =2.2;
            
        this._renderer = renderer;
    }

    _resizeRendererToDisplaySize():boolean {

        const canvas = this._renderer!.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = (canvas.width !== width || canvas.height !== height) && (width != this._resizeInfo.prevWidth || height != this._resizeInfo.prevHeight);
        
        if (needResize) {
            this._renderer!.setSize(width, height, false);
            this._resizeInfo = {
                prevWidth: width,
                prevHeight: height
            }
        }
        return needResize;
      }
    
}
/**
 * Playground view is responsible for storing objects that will be rendered onto the view.
 * It also translates user interactions into the space of the objects that are within the view.
 */
export abstract class PlaygroundView{
    name:string;
    emitter: EventEmitter;
    constructor(name:string, emitter: EventEmitter){
        this.name = name;
        this.emitter = emitter
    }    

    abstract _preAttach(parentPlayground: Playground):void;
    abstract _onInteraction(...event:any[]):any; // should return interaction result or undefined
    abstract _onEvent(...event:any[]):any; // handles other than interaction event
}

export class PlaygroundViewDefault extends PlaygroundView implements PlaygroundViewHud, PlaygroundViewMain, PlaygroundView3D{
    isViewHud: boolean = false;
    isViewMain: boolean = false;
    camera: THREE.Camera|any;
    scene: THREE.Scene|any;
    /* istanbul ignore next */
    _preAttach(_parentPlayground: Playground): void {
        return;
    }
    /* istanbul ignore next */
    _onInteraction(..._event: any[]):any {
        return;
    }
    /* istanbul ignore next */
    _onEvent(..._event: any[]):any {
        return;
    }
}

export interface PlaygroundViewMain {
    isViewMain: boolean;
}
export interface PlaygroundViewHud {
    isViewHud: boolean;
}

export interface PlaygroundView3D {
    camera: THREE.Camera|any;
    scene: THREE.Scene|any;
}

interface PickResultThreeJs {
    object: THREE.Object3D,
    hierarchy: THREE.Object3D[], // [n-1] object itself, [0] - parent of all parents
    scenePos: Vector3
}

export interface MatchingThreeJs {
    distance: number,
    point: any,
    face: THREE.Face|any,
    faceIndex: number,
    object: THREE.Object3D
}

export abstract class PlaygroundViewThreeJS extends PlaygroundView implements PlaygroundView3D{
    container: any // canvas html element
    canvas: any;
    camera: THREE.Camera|any;
    scene: THREE.Scene|any;

    _raycaster: THREE.Raycaster|any = new THREE.Raycaster();

    abstract _setupScene():void

    _preAttach(parentPlayground: Playground): void {
        this.container = parentPlayground.container;
        this.canvas = parentPlayground.container;        
    }

    _pickScenePosition(pointerEvent: any) {
        const canvas = this.canvas;
        const pickPosition = {x: 0, y: 0};
        const pos = this._getCanvasRelativePosition(pointerEvent);
        pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
        pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
        return pickPosition;
    }

    _getCanvasRelativePosition(pointerEvent: any) {
        const canvas = this.canvas;
        const rect = canvas.getBoundingClientRect();
        
        return {
            x: (pointerEvent.clientX - rect.left) * canvas.width  / rect.width,
            y: (pointerEvent.clientY - rect.top ) * canvas.height / rect.height,
        };
        
    }


    /**
     * Filters intersected objects using name filter and returns the closes one. When empty name filter array
     * is used then the closest intersected object is returned.
     * @param intersectArray array of objects intersected, ordered by distance
     * @param filterNames when provided only objects that match name will be taken into consideration
     * @returns closest intersected object matching name criteria
     */
    _findClosestObjectMatching(intersectArray:any[], filterNames: string[]):MatchingThreeJs|undefined{        
        // [ { distance, point, face, faceIndex, object }, ... ]   
        let matching:MatchingThreeJs|undefined;
        
        if(filterNames&&filterNames.length>0){
            const candidates:MatchingThreeJs[] = [];

            intersectArray.forEach((item)=>{
                candidates.push(item);
                // now also check ancestors
                item.object.traverseAncestors((ancestor:THREE.Object3D)=>{
                    candidates.push({
                        distance: item.distance,
                        face: item.face,
                        faceIndex: item.faceIndex,
                        object: ancestor,
                        point: item.point
                    })
                })

            })
            
            // filter objects by name
            matching = candidates.find((item:any)=>{                  
                return filterNames.some(name => item.object.name.toUpperCase().includes(name.toUpperCase()))
                // return item.object.name.toUpperCase().includes()
            })    
            
            // // filter objects by name
            // matching = intersectArray.find((item:any)=>{                  
            //     return filterNames.some(name => item.object.name.toUpperCase().includes(name.toUpperCase()))
            //     // return item.object.name.toUpperCase().includes()
            // })    
        }else{
            matching = intersectArray[0];
        }        
        return matching;
    }

    _getHierarchyObjects(item:THREE.Object3D, ):THREE.Object3D[]{
        let ancestors:THREE.Object3D[] = []
        ancestors.unshift(item);
        // parent object is the object whose parent is a Scene type of object
        // find object 
        // if(item.type.toUpperCase()=='OBJECT3D'&&item.parent&&item.parent.name&&item.parent.name.toUpperCase()=='THE_MAP')
        //     return item;
        
        item.traverseAncestors((parent:Object3D)=>{
            ancestors.unshift(parent);
        })

        // if(item.parent){
        //     return this._getHierarchyObjects(item.parent, parentArray)
        // }
        return ancestors;
    }

    /**
     * Finds closest object, filtered by name, that is pointed by the event.      
     * @param pointerEvent ui pointer event
     * @param filterNames optional array of names that should be used to filter candidates
     * @returns closest object pointed by the event and matching name criteria
     */
    pickObjectOfNames(pointerEvent: any,  filterNames: string[]):PickResultThreeJs|undefined{
        pointerEvent.preventDefault();         
                
        const sceneXY = this._pickScenePosition(pointerEvent)
        // console.log('PTR',pointer, this._ndcToScreen2D(new THREE.Vector3( pointer.x, pointer.y, 0 )), event);
        this._raycaster.setFromCamera( sceneXY, this.camera! );
        // See if the ray from the camera into the world hits one of our meshes
        const intersects = this._raycaster.intersectObjects( this.scene!.children!, true );

        // first try to find 
        const matching = this._findClosestObjectMatching(intersects, filterNames);

        

        if ( matching ) {

            // const o = matching.object;
            const o = matching.object;
            const hierarchy:THREE.Object3D[] = this._getHierarchyObjects(o);
            
            
            const pickResult: PickResultThreeJs = {
                hierarchy: hierarchy,
                object: o,
                scenePos: matching.point
            }

            return pickResult
            // const p = 

            // const hit = {
            //     obj: o,
            //     obj3D: p,
            //     hex: o.material.emissive?o.material.emissive.getHex():0x000000
            // }

            // if(eventType==GUIInteractions.EVENT_TOUCH){
            //     that._pickHolder.onClick = hit
            // }else{
            //     that._pickHolder.onMove = hit
            // }
            

            // // highlight object
            // if(that.materialEmissive&&o.material.emissive)
            //     o.material.emissive.setHex( that.materialEmissive );
            
            
            // if(that.listener){
            //     that.listener(eventType,o, p );
            // }

            // return hit
        }
        return;
    }    
}

export abstract class PlaygroundViewHudThreeJs extends PlaygroundViewThreeJS implements PlaygroundViewHud{
    declare camera: THREE.OrthographicCamera|undefined;
    isViewHud: boolean;
    static VIEW_NAME: string = "HUD_VIEW";
    // components: HudComponentThreeJs[];
    /* istanbul ignore next */
    constructor(emitter: EventEmitter){
        super(PlaygroundViewHudThreeJs.VIEW_NAME, emitter);
        this.isViewHud = true;
        // this.components = [];
    }  

    // /**
    //  * Adds hud component at the end of the hud components list
    //  * @param component hud component to be added
    //  */
    // addComponent(component:HudComponentThreeJs){
    //     component.setContainer(this.container);
    //     this.scene.add(component.object);
    //     this.components.push(component);
    //     this.repositionComponents();
    // }
    // /**
    //  * Recalculates components' positions using current cointainer dimensions.
    //  */
    // repositionComponents(){
    //     let x = -this.container.clientWidth/2;
    //     const y = -this.container.clientHeight/2;
        
    //     this.components.forEach((item:HudComponentThreeJs)=>{
        
    //         item.object!.position.set(x,y,0);
    //         x += item.getSize().x!;
    //     })
    // }
     
    
      

}
export interface OptionsPlaygroundViewThreeJS {
    cameraPosition: Vector3,    
    cameraParams: {        
        fov?: number, // for perspective
        near: number, // for perspective and ortographic
        far: number, // for perspective and ortographic    
        sizing?: number, // for ortographic
        height?: number // how high camera aims
    }
}

export abstract class PlaygroundViewMainThreeJs extends PlaygroundViewThreeJS implements PlaygroundViewMain{     
    declare camera: THREE.PerspectiveCamera|undefined;
    options: OptionsPlaygroundViewThreeJS;
    
    isViewMain: boolean;
    static VIEW_NAME: string = "MAIN_VIEW";

    constructor(emitter: EventEmitter, options?:OptionsPlaygroundViewThreeJS){
        super(PlaygroundViewMainThreeJs.VIEW_NAME, emitter);
        this.isViewMain = true;
        this.options = options || {
            cameraParams: {                
                fov: 50,
                near: 0.1,
                far: 1000,
                height: 0                             
            },
            cameraPosition: new Vector3(0,-5,4)
        }
    }             
}





export interface SizingHudThreeJs {
    camera: number
}
export class PlaygroundViewHudThreeJsDefault extends PlaygroundViewHudThreeJs{
    static CAMERA_NAME:string = "PLAYGROUND_HUD_CAM"
    static SCENE_NAME:string = "PLAYGROUND_HUD_SCENE"
    
    options: OptionsPlaygroundViewThreeJS;

    constructor(emitter:EventEmitter, options?:OptionsPlaygroundViewThreeJS){
        super(emitter)
        this.options = options || {
            cameraParams: {                
                
                near: 0.1,
                far: 1000,
                sizing: 20
            },
            cameraPosition: new Vector3(0,0,1)
        }                
        this._setupScene();
    }
    

    _setupScene(){
        // this._camera = new THREE.OrthographicCamera( - this._width / 2, this._width / 2, this._height / 2, - this._height / 2, 10, 100 );
        this.camera = new THREE.OrthographicCamera(- this.options.cameraParams.sizing!, this.options.cameraParams.sizing!, this.options.cameraParams.sizing!, - this.options.cameraParams.sizing!, this.options.cameraParams.near, this.options.cameraParams.far);
        // this._camera.position.z = this._cameraSettings.z;
        // this.camera.position.set(0, 0, 1);
        this.camera.position.set(this.options.cameraPosition.x, this.options.cameraPosition.y, this.options.cameraPosition.z)
        // this._camera.up.set( 0, 0, 1 );
        // this._camera.lookAt(0,0,0);
        this.camera.name = PlaygroundViewHudThreeJsDefault.CAMERA_NAME

        this.scene = new THREE.Scene();
        this.scene.name = PlaygroundViewHudThreeJsDefault.SCENE_NAME
    }
    _onInteraction(...event: any[]) {
        const pointerEvent:any =  event[0] as any;
        // const eventType:string = pointerEvent.type;
        
        // check if any hud element is hit
        const hudPickResult = this.pickObjectOfNames(pointerEvent,[]);

        
        if(hudPickResult?.object){
            const worldPosition = new THREE.Vector3();
            hudPickResult.object.getWorldPosition(worldPosition);

            const interactionEvent: PlaygroundInteractionEvent = {
                type: Events.INTERACTIONS.HUD,
                viewName: this.name,
                interactingObject: hudPickResult.object,
                originalEvent: pointerEvent,
                data: hudPickResult,
                worldPosition: worldPosition,
                scenePosition: hudPickResult.scenePos
            }
            this.emitter.emit(Events.INTERACTIONS.HUD,interactionEvent)
            return interactionEvent;
        }
        return;
    }
    _onEvent(..._event: any[]) {}
    
}

export class PlaygroundViewMainThreeJsDefault extends PlaygroundViewMainThreeJs{
    static CAMERA_NAME:string = "PLAYGROUND_MAIN_CAM"
    static SCENE_NAME:string = "PLAYGROUND_MAIN_SCENE"
    constructor(emitter: EventEmitter, options?:OptionsPlaygroundViewThreeJS){
        super(emitter, options)
    }

    _setupScene(){
        let camera = new THREE.PerspectiveCamera(this.options.cameraParams.fov!,this.container.clientWidth / this.container.clientHeight, this.options.cameraParams.near, this.options.cameraParams.far);
        // let camera = new THREE.PerspectiveCamera(50,this.container.clientWidth / this.container.clientHeight, .1, 1000);
        // camera.position.set(0, -50, 20);
        // camera.position.set(0.2, -5, 4);
        // camera.position.set(0, -5, 4);
        camera.position.set(this.options.cameraPosition.x, this.options.cameraPosition.y, this.options.cameraPosition.z);
        // camera.position.set(0, -25, 4);
        camera.lookAt(0,0,this.options.cameraParams.height);
        camera.name = PlaygroundViewMainThreeJsDefault.CAMERA_NAME;
        // for zoom in/zoom out this is important
        camera.up.set( 0, 0, 1 );
    
        // initialize scene
        let scene = new THREE.Scene();
        scene.name = PlaygroundViewMainThreeJsDefault.SCENE_NAME;
    
        
    
        // var hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444,1 );
        // var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff,0.8 );
        // hemiLight.position.set( 0, 0, 60 );
        // // hemiLight.up.set(0, 0, 1)
        // scene.add( hemiLight );


        // var hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444,0.6 );
        // hemiLight.position.set( 0, 0, 1600 );
        // scene.add( hemiLight );
        
        const light = new THREE.AmbientLight( 0x404040 ,0.3); // soft white light
        scene.add(light);

        var dirLight = new THREE.DirectionalLight( 0xffffff,1.2);
        dirLight.position.set( 45, -45, 130 );
        scene.add( dirLight );

        var dirLight2 = new THREE.DirectionalLight( 0xffffff,0.3 );
        dirLight2.position.set( -45, 45, 5 );
        scene.add( dirLight2 );

        // const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
		// 		scene.add( dirLightHelper );
        
        // const dirLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
		// 		dirLight.color.setHSL( 0.1, 1, 0.95 );
		// 		dirLight.position.set( - 1, 1.75, 1 );
		// 		dirLight.position.multiplyScalar( 10 );
		// 		scene.add( dirLight );

		// 		dirLight.castShadow = true;

		// 		dirLight.shadow.mapSize.width = 2048;
		// 		dirLight.shadow.mapSize.height = 2048;

		// 		const d = 50;

		// 		dirLight.shadow.camera.left = - d;
		// 		dirLight.shadow.camera.right = d;
		// 		dirLight.shadow.camera.top = d;
		// 		dirLight.shadow.camera.bottom = - d;

		// 		dirLight.shadow.camera.far = 3500;
		// 		dirLight.shadow.bias = - 0.0001;
    
        //         const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
		// 		scene.add( dirLightHelper );
        // initialize controls
        
        // Handling map operations
        // let controls = GUIMapControls.getInstance(camera, this.container, this.emitter);
        
    
        this.camera = camera;
        this.scene = scene;
    }
    _onInteraction(...event: any[]) {
        const pointerEvent:any =  event[0] as any;
        // const eventType:string = pointerEvent.type;
        let result = undefined;

        // first see what tile did we hit
        const tilePickResult = this.pickObjectOfNames(pointerEvent,["TILE"])
        if(tilePickResult?.object){
            const worldPosition = new THREE.Vector3();
            tilePickResult.object.getWorldPosition(worldPosition);

            const interactionEvent: PlaygroundInteractionEvent = {
                type: Events.INTERACTIONS.TILE,
                viewName: this.name,
                interactingObject: tilePickResult.object,
                originalEvent: pointerEvent,
                data: tilePickResult,
                worldPosition: worldPosition,
                scenePosition: tilePickResult.scenePos
            }
            this.emitter.emit(Events.INTERACTIONS.TILE,interactionEvent)
            result = interactionEvent;
            
        }
        // then also check what unit did we hit
        const unitPickResult = this.pickObjectOfNames(pointerEvent,["UNIT"])
        if(unitPickResult?.object){
            const worldPosition = new THREE.Vector3();
            unitPickResult.object.getWorldPosition(worldPosition);

            const interactionEvent: PlaygroundInteractionEvent = {
                type: Events.INTERACTIONS.UNIT,
                viewName: this.name,
                interactingObject: unitPickResult.object,
                originalEvent: pointerEvent,
                data: unitPickResult,
                worldPosition: worldPosition,
                scenePosition: unitPickResult.scenePos
            }
            this.emitter.emit(Events.INTERACTIONS.UNIT,interactionEvent)
            result = interactionEvent;
        }       
        
        if(!result){
            const interactionEvent: PlaygroundInteractionEvent = {
                type: Events.INTERACTIONS.NON_CLASSIFIED,
                viewName: this.name,
                interactingObject: undefined,
                originalEvent: pointerEvent,
                data: undefined,
                worldPosition: undefined,
                scenePosition: undefined
            }
            this.emitter.emit(Events.INTERACTIONS.NON_CLASSIFIED, interactionEvent)
        }
            
        
        return result;
    }
    _onEvent(name:string, _data:any) {
        // handle debug events
        if(name.toUpperCase() == Events.DEBUG.DUMP_VIEW.toUpperCase()){
            const sceneJson = this.scene.toJSON();
            const objectJsonString = JSON.stringify(sceneJson);
            console.log(sceneJson)
            console.log(objectJsonString)
        }
    }
}

export class PlaygroundInteractions{}

export interface EngineEvent {
    type: string, // event type, see events.notest.ts
}

export interface PlaygroundInteractionEvent extends EngineEvent{
    viewName: string, // name of the view that took part in the interaction
    originalEvent: any, // original event from UI that triggered the interaction
    interactingObject: any, // the object that took part in the interaction
    data: any // additional interaction data
    worldPosition: any // interacting object world position,
    scenePosition: any // scene position when interaction took place
}

export enum TileInteractionOperation {
    ADD = "ADD",
    GROUP_ADD = "GROUP_ADD",
    GROUP_REMOVE = "GROUP_REMOVE"
}

export interface TileInteractionEvent extends PlaygroundInteractionEvent{
    click: any, // clicked tile
    selected: any[], // tile selected or multiple tiles selected (with shift)
    hoover: any // tile over which user mouse hoovers
    operation: TileInteractionOperation
}
// export interface MapInteractionEvent extends EngineEvent{
//     tiles: {
//         selected: any[], // tile selected or multiple tiles selected (with shift)
//         hoover: any // tile over which user mouse hoovers
//     }
//     zoom: string, // IN or OUT
//     rotate: {
//         direction: string // LEFT or RIGHT
//     }

// }
