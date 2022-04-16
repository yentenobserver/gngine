import * as THREE from 'three'
import { Material } from 'three';

export interface Renderable{
    name: string,
    data: any
}

export abstract class RenderablesFactory{
    abstract spawnRenderableObject(objectName:string):Renderable;
    abstract loadRenderablesObjectsTemplate(path:string):Promise<void>;
}

export class RenderablesDefaultFactory extends RenderablesFactory{
    spawnRenderableObject(_objectName: string): Renderable {
        throw new Error('Method not implemented.');
    }
    loadRenderablesObjectsTemplate(_path: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    
}

export interface RenderableThreeJS extends Renderable{
    data: THREE.Object3D
}

export class RenderablesThreeJSFactory extends RenderablesFactory {
    templates:Map<string, THREE.Object3D>;
    loader: any; // threejs objects loader
    constructor(loader:any){
        super();
        this.loader = loader;
        this.templates = new Map<string, THREE.Object3D>();
    }

    /**
     * Creates new instance of 3D object from given template.
     * IMPORTANT - object must have it's origin placed at
     * "lower left" corner of the object when one look's at the object from top.
     * @param objectName 
     * @returns 
     */
    spawnRenderableObject(objectName: string): RenderableThreeJS {        
        if(this.templates.has(objectName)){
            const cloned:THREE.Object3D|undefined = this.templates.get(objectName)?.clone();
            this._cloneMaterials(cloned as THREE.Mesh);
            cloned!.castShadow = true;
            cloned!.receiveShadow = true;
            return {
                name: objectName,
                data: cloned!
            }
        }else{
            throw new Error(`No template found ${objectName}`);
        }        
    }

    loadRenderablesObjectsTemplate(path: string): Promise<void> {
        const that = this;
        

        return new Promise((resolve, reject)=>{
            that.loader.load( path, function ( gltf:any ) {
                // console.log(gltf);
                // scene.add( gltf.scene );

                // load component templates
                gltf.scene.children[0].children[0].children.filter((item:any)=>{return item.type.toUpperCase()=='OBJECT3D' && (item.name.startsWith('C_')||item.name.startsWith('instance'))}).forEach((item:any)=>{
                    that._addTemplate(item.name, item)
                    // console.log('Loaded object', item.type, item.name)
                })
                // console.log(that._templates);                    
                resolve();    

            },()=>{},(error:any)=>{
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
