import * as THREE from 'three'
import { Material, Object3D } from 'three';

export interface Renderable{
    name: string,
    data: any
}

export abstract class RenderablesFactory{
    /**
     * Creates new instance of Renderable that can be 
     * drawn on view
     * @param objectName name of the Renderable to be spawned
     */
    abstract spawnRenderableObject(objectName:string):Renderable;
    /**
     * Populates renderables' templates library so new instances
     * of Renderable can be created from template.
     * @param path Path to the template file with Renderables specifications
     * @param filterNames When provided only specifications that match (include) any of the names provided are returned
     */
    abstract loadRenderablesObjectsTemplate(path:string, filterNames: string[]):Promise<void>;
}

/* istanbul ignore next */
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
    pivotPositionCorrection: THREE.Vector3|undefined;
    constructor(loader:any, pivotPositionCorrection?:THREE.Vector3){
        super();
        this.loader = loader;
        this.templates = new Map<string, THREE.Object3D>();
        this.pivotPositionCorrection = pivotPositionCorrection;
    }

    /**
     * Creates new instance of 3D object from given template (as a clone with materials of the original template object).
     * IMPORTANT - object must have it's origin placed at
     * "lower left" corner of the object when one look's at the object from top.
     * @param objectName 
     * @returns 
     */
    spawnRenderableObject(objectName: string): RenderableThreeJS {   
        
        if(this.templates.has(objectName)){
            const cloned:THREE.Object3D|undefined = this.templates.get(objectName)!.clone();
            this._cloneMaterials(cloned as THREE.Mesh);
            cloned!.castShadow = true;
            cloned!.receiveShadow = true;


            let result:THREE.Object3D|undefined;

            if(this.pivotPositionCorrection){
                // it is assumed that pivot point of spawned objects must be at
                // (center, center, 0)
                // so if the templated object has some other pivot configuration
                // one can translate accordingly so the spawned object has its pivot
                // located at correct place            
                
                // cloned.position.set(-0.5,-0.5,0);
                cloned.position.set(this.pivotPositionCorrection.x, this.pivotPositionCorrection.y, this.pivotPositionCorrection.z);
                const wrap = new THREE.Object3D();
                wrap.add(cloned);
                result = wrap;
            }else{
                result = cloned
            }
            
            return {
                name: objectName,
                data: result
            }     
        }else{
            throw new Error(`No template found ${objectName}`);
        }        
    }

    /**
     * Populates renderables' templates library with 3D template objects from file that is downloaded using provided 3D loader
     * so new instances of Renderable can be created from template.
     * @param path Path to the template file with 3D template objects
     * @param filterNames When provided only specifications that match (include) any of the names provided are returned
     */
    loadRenderablesObjectsTemplate(path: string, filterNames: string[]): Promise<void> {
        const that = this;
        

        return new Promise((resolve, reject)=>{
            that.loader.load( path, function ( gltf:any ) {   
                // load component templates

                // traverse all scene descendants
                const searchRoot:Object3D[] = []

                gltf.scene.traverse((item:THREE.Object3D)=>{
                    searchRoot.push(item);
                    
                })
                
                that._matchingChildren(searchRoot, filterNames)
                .forEach((item:any)=>{
                    
                    that._addTemplate(item.name, item)                    
                })
                resolve();    
            },
            /* istanbul ignore next */
            ()=>{},
            (error:any)=>{
                console.error('Error loading model:', error);
                reject(error);
            } );
        });
    }

    _matchingChildren(children:any[], filterNames: string[]):any[]{
        return children.filter((item:any)=>{
            if(filterNames&&filterNames.length>0){
                return filterNames.some(name => item.name.toUpperCase().includes(name.toUpperCase()))
            }else{
                return item.type.toUpperCase()=='OBJECT3D'
            }
        })
    }

    _cloneMaterials(parent:THREE.Mesh){
        let that = this;
        
        
        if(parent.isMesh){
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
