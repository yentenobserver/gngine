import * as THREE from 'three'
import { Material } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export interface Renderable{
    name: string,
    data: any
}

export abstract class RenderableFactory{
    abstract spawnRenderableObject(objectName:string):Renderable;
    abstract loadRenderableObjectsTemplate(path:string):Promise<void>;

}

export class RenderableThreeJSObject3DFactory extends RenderableFactory {
    templates:Map<string, THREE.Object3D>;
    constructor(){
        super();
        this.templates = new Map<string, THREE.Object3D>();
    }

    spawnRenderableObject(objectName: string): Renderable {        
        if(this.templates.has(objectName)){
            const cloned:THREE.Object3D|undefined = this.templates.get(objectName)?.clone();
            this._cloneMaterials(cloned as THREE.Mesh);
            cloned!.castShadow = true;
            cloned!.receiveShadow = true;
            return {
                name: objectName,
                data: cloned
            }
        }else{
            throw new Error(`No template found ${objectName}`);
        }        
    }

    loadRenderableObjectsTemplate(path: string): Promise<void> {
        const that = this;
        var loader = new GLTFLoader();

        return new Promise((resolve, reject)=>{
            loader.load( path, function ( gltf ) {
                // console.log(gltf);
                // scene.add( gltf.scene );

                // load component templates
                gltf.scene.children[0].children[0].children.filter((item)=>{return item.type.toUpperCase()=='OBJECT3D' && (item.name.startsWith('C_')||item.name.startsWith('instance'))}).forEach(item=>{
                    that._addTemplate(item.name, item)
                    // console.log('Loaded object', item.type, item.name)
                })
                // console.log(that._templates);                    
                resolve();    

            },()=>{},(error)=>{
                console.error('Error loading model', error);
                reject(error);
            } );
        });
    }

    _cloneMaterials(parent:THREE.Mesh){
        let that = this;
        
        if(parent.material){
            const originalMaterial: Material = parent.material as Material;
            const clonedMaterial = originalMaterial.clone();
            // console.log(`O - ${originalMaterial.id} M2 - ${clonedMaterial.id}`)

            parent.material = clonedMaterial;

            // console.log(`After - M ${parent.material.id}`);
        }
        for(const child of parent.children){                                
            that._cloneMaterials(child as THREE.Mesh);
        }
    }
    


    _addTemplate(name:string, object3D:THREE.Object3D){
        this.templates.set(name, object3D);
    }
}
