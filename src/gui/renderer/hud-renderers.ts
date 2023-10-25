import * as THREE from 'three'
import { Events } from '../../util/eventDictionary.notest';


import { EventEmitter } from 'eventemitter3';
import { EngineEvent, PlaygroundInteractionEvent, PlaygroundViewThreeJS } from '../playground/playground';
import { Renderer } from './renderers';

export abstract class HudRenderer extends Renderer{
    components: HudComponent[];

    constructor(emitter:EventEmitter){
        super(emitter)
        this.components = [];
        this.emitter.on(Events.INTERACTIONS.HUD, this._onEvent.bind(this))
    }

    addComponent(component:HudComponent):void{
        component.setEmitter(this.emitter);
    };

    abstract repositionComponents():void;

    _onEvent(event:EngineEvent):void{
        for(let i=0; i<this.components.length; i++)
            this.components[i]._onEvent(event);
    }
} 


/**
 * Renders components from the lower left corner of the view to the right.
 * Order of components is important.
 */
export class HudRendererThreeJs extends HudRenderer {
    declare view: PlaygroundViewThreeJS|undefined;
    setView(view: PlaygroundViewThreeJS): void {
        this.view = view;
    }

    /**
     * Adds hud component at the end of the hud components list
     * @param component hud component to be added
     */
     addComponent(component:HudComponentThreeJs){
        super.addComponent(component);
        component.setContainer(this.view!.container);        
        this.view!.scene.add(component.object);
        this.components.push(component);
        component.resize();
        this.repositionComponents();
    }
    /**
     * Recalculates components' positions using current cointainer dimensions.
     * It assumes that objects pivot/origin is at the center of the object
     */
    repositionComponents(){
        
        const FIX_CAMERA_HALF_SIZE = 20;
        const MARGIN = FIX_CAMERA_HALF_SIZE/20;
        // let x = -this.view!.container.clientWidth/2;
        let x = -FIX_CAMERA_HALF_SIZE+MARGIN/2;
        
        // console.log(this.view!.container.clientWidth, this.view!.container.clientHeight)
        
        this.components.forEach((item:HudComponent)=>{               
            // component pivot is as its center so we need to position 
            // it center accordingly
            x+=(<HudComponentThreeJs>item).getSize().x!/2;

            // let y = -this.view!.container.clientHeight/2+(<HudComponentThreeJs>item).getSize().y!/2;
            let y = -FIX_CAMERA_HALF_SIZE+(<HudComponentThreeJs>item).getSize().y!/2+MARGIN;
        
            // (<HudComponentThreeJs>item).object!.position.set(x,y,0);
            (<HudComponentThreeJs>item).object!.position.set(x,y,0);
            x += (<HudComponentThreeJs>item).getSize().x!/2+MARGIN/2;
            
        })
    }
}



export interface Rotations {
    RIGHT: 90,
    LEFT: -90
}






export abstract class SpriteFactory {
    abstract initialize():Promise<void>;
    abstract getInstance(which:number):THREE.Sprite;
}

/* istanbul ignore next */
/**
 * Texture in a form of a line stripe
 * Each sprite is of 1x1x0 size
 */
export class SpriteFactoryx128x128x4xL extends SpriteFactory{
    url:string;
    texture: THREE.Texture|any;
    size: number = 128;
    itemCnt: number = 4;

    constructor(textureUrl: string){
        super();
        this.url = textureUrl;
    }

    initialize(): Promise<void> {
        
        return new Promise((resolve, reject) => {
            
            const loader = new THREE.TextureLoader();
            // console.log(this.url)
            loader.load(this.url, (texture:THREE.Texture) => {
                resolve(texture);
            }, undefined, (error) => {
                reject(error);
            });
        }).then((textureResult:any) => {
            this.texture = textureResult as THREE.Texture;
            if(this.texture.image.width!=this.size*this.itemCnt)
                throw new Error(`Invalid texture width ${this.url}`)
            if(this.texture.image.height!=this.size) 
                throw new Error(`Invalid texture height ${this.url}`)            
        })
    }

    getInstance(idx: number): THREE.Sprite {
        if(idx>this.size-1)
            throw new Error(`Invalid sprite idx ${idx} for ${this.url}`);
        
        const materialMap = this.texture.clone()
        materialMap.repeat.x = 1 / this.itemCnt
        materialMap.offset.x = idx * this.size / (this.size*this.itemCnt)
        materialMap.needsUpdate = true;

        const material = new THREE.SpriteMaterial({ map: materialMap });

        const sprite = new THREE.Sprite(material);
        return sprite;
    }


}

/**
 * Hud component is a 2D object displayed in Hud ortographic view.
 */
export abstract class HudComponent {
    container: any;
    emitter?: EventEmitter;

    setContainer(container:any){
        this.container = container;
    }

    setEmitter(emitter:EventEmitter){
        this.emitter = emitter;
    }

    abstract build():Promise<HudComponent>;    
    abstract _onEvent(event: EngineEvent):void;
}
/**
 * xxxvvvxxx
 * xxx0.0xxx
 * xxxvvvxxx
 * 
 * Origin is located at the lower left corner of the component
 * 
 * xxxvvvxxx
 * xxxvvvxxx
 * 0.0vvvxxx
 */
export abstract class HudComponentThreeJs extends HudComponent{
    
    sizePercentage: number|undefined;
    width: number|undefined;
    height: number|undefined;
    object: THREE.Object3D|undefined;

    constructor(){   
        super();     
    }

    

    resize(){
        const FIX_CAMERA_HALF_SIZE = 20;
        
        // const newWidth = this.container.clientWidth;
        // const newHeight = this.container.clientHeight;

        const newWidth = 2*FIX_CAMERA_HALF_SIZE;
        const newHeight = 2*FIX_CAMERA_HALF_SIZE;
        // const targetSize = new THREE.Vector3(1,1,1);
        const targetSize = new THREE.Vector3(newWidth*this.sizePercentage!, newHeight*this.sizePercentage!,Math.min(newWidth*this.sizePercentage!, newHeight*this.sizePercentage!));
        
        const box = new THREE.Box3().setFromObject(this.object!);
        const size = new THREE.Vector3();
        box.getSize(size);
        
        
        const scaleVec = targetSize.divide(size);
        
        const scale = Math.min(scaleVec.x, Math.min(scaleVec.y, scaleVec.z));
        
        this.object!.scale.setScalar(scale);

        // now update size property accordingly
        const box2 = new THREE.Box3().setFromObject(this.object!);
        const size2 = new THREE.Vector3();
        box2.getSize(size2);
        this.width = size2.x;
        this.height = size2.y;
    }

    getSize(){
        return {
            x: this.width,
            y: this.height
        }
    }
    
}
/* istanbul ignore next */
export abstract class HudComponentLargeThreeJs extends HudComponentThreeJs{
    constructor(){
        super(); 
        this.sizePercentage = 0.2;       
    }
    abstract build():Promise<HudComponentThreeJs>;
}
/* istanbul ignore next */
export abstract class HudComponentMediumThreeJs extends HudComponentThreeJs{
    constructor(){
        super(); 
        this.sizePercentage = 0.1;       
    }
    abstract build():Promise<HudComponentThreeJs>;
}

/* istanbul ignore next */
export abstract class HudComponentSmallThreeJs extends HudComponentThreeJs{
    constructor(){
        super(); 
        this.sizePercentage = 0.05;       
    }
    abstract build():Promise<HudComponentThreeJs>;
}
/* istanbul ignore next */
export class HudComponentDefaultThreeJs extends HudComponentThreeJs{
    constructor(){
        super();
        this.object = new THREE.Object3D();
        this.width = 40;
        this.height = 40;
    }
    build(): Promise<HudComponentThreeJs> {
        throw new Error('Method not implemented.');
    }
    _onEvent(_event: EngineEvent):void{
        throw new Error('Method not implemented.');
    }
}
export class HudComponentMapNavigationThreeJs extends HudComponentMediumThreeJs{
    
    static NAME = "COMP_HUD_NAV";
    static CONTROLS = {
        UP: "UP",
        DOWN: "DOWN",
        LEFT: "LEFT",
        RIGHT: "RIGHT"
    }
    buttonsFactory: SpriteFactory;
    constructor(buttonsSpriteUrl: string){
        super();
        this.buttonsFactory = new SpriteFactoryx128x128x4xL(buttonsSpriteUrl);
    }

    _onEvent(event: EngineEvent|PlaygroundInteractionEvent): void {
        
        if(event.type == Events.INTERACTIONS.HUD && (<PlaygroundInteractionEvent>event).originalEvent.type=="pointerdown"){
            // console.log("Got event", event);
            for(let i=(<PlaygroundInteractionEvent>event).data.hierarchy.length-1; i>= 0; i--){
                if([                    
                    HudComponentMapNavigationThreeJs.CONTROLS.LEFT,
                    HudComponentMapNavigationThreeJs.CONTROLS.RIGHT
                    ].includes((<PlaygroundInteractionEvent>event).data.hierarchy[i].name)){                        
                        (<PlaygroundInteractionEvent>event).data.hierarchy[i].name == HudComponentMapNavigationThreeJs.CONTROLS.LEFT?this.emitter?.emit(Events.MAP.ROTATE,{type: Events.MAP.ROTATE, direction:"LEFT"}):this.emitter?.emit(Events.MAP.ROTATE,{type: Events.MAP.ROTATE, direction:"RIGHT"});
                    }
                if([                    
                    HudComponentMapNavigationThreeJs.CONTROLS.DOWN,
                    HudComponentMapNavigationThreeJs.CONTROLS.UP
                    ].includes((<PlaygroundInteractionEvent>event).data.hierarchy[i].name)){
                        (<PlaygroundInteractionEvent>event).data.hierarchy[i].name == HudComponentMapNavigationThreeJs.CONTROLS.DOWN?this.emitter?.emit(Events.MAP.ZOOM,{type: Events.MAP.ZOOM, direction:"OUT"}):this.emitter?.emit(Events.MAP.ZOOM,{type: Events.MAP.ZOOM, direction:"IN"});
                    }                
            }
        }
    }

    /**
     * Generates 3x3 button square with 4 buttons for map navigation
     * ?^?
     * <?>
     * ?v?
     * @returns 
     */
     build(): Promise<HudComponentThreeJs> {
        const that = this;
        let hud = new THREE.Object3D();
        hud.name = HudComponentMapNavigationThreeJs.NAME;
        return this.buttonsFactory.initialize().then(()=>{            
            const up = this.buttonsFactory.getInstance(0);            
            hud.add(up);
            up.position.set(0, 1, 0);
            // up.scale.set(this._sizing.items, this._sizing.items, 1);            
            up.name = HudComponentMapNavigationThreeJs.CONTROLS.UP
            

            const left = this.buttonsFactory.getInstance(1);            
            hud.add(left);
            left.position.set(-1, 0, 0);
            // left.scale.set(this._sizing.items, this._sizing.items, 1);
            // rotLeft.position.set( 0, 0, this._size );
            left.name = HudComponentMapNavigationThreeJs.CONTROLS.LEFT;
            

            const right = this.buttonsFactory.getInstance(2);
            hud.add(right);
            right.position.set(1, 0, 0);
            // right.scale.set(this._sizing.items, this._sizing.items, 1);
            right.name = HudComponentMapNavigationThreeJs.CONTROLS.RIGHT;

            const down = this.buttonsFactory.getInstance(3);
            hud.add(down);
            down.position.set(0, -1, 0);
            // down.scale.set(this._sizing.items, this._sizing.items, 1);
            // backward.position.set( this._size-this._size/2, 0, 0 );
            down.name = HudComponentMapNavigationThreeJs.CONTROLS.DOWN;

            // // now normalize hud origin so the origin is in 
            // // lower left corner of the hud element
            // hud.position.set(1.5, 1.5,0);
            // const holder = new Object3D();
            // holder.name = "HANDLE"
            // holder.add(hud);
            
            that.object = hud;
            that.width = 3;
            that.height = 3;
            // return holder;
            return that;
        })
    }
}