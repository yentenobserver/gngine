import * as THREE from 'three'
import { Material, Object3D } from 'three';

export interface Renderable{
    name: string,
    data: any,
    show?: ()=>void;
    hide?: ()=>void;
}

export interface RenderableSpecificationItem {
    name: string,
    url?: string,
    json?: string,
    pivotCorrection?: string,
    scaleCorrection?: number
}

export interface RenderablesSpecification {
    main: RenderableSpecificationItem    
}

export interface RenderablesSpecificationMap extends RenderablesSpecification {
    helpers: RenderableSpecificationItem
}

export abstract class RenderablesFactory{
    specification: RenderablesSpecification;    

    constructor(specification: RenderablesSpecification){
        this.specification = specification;        
    }

    /**
     * Creates new instance of Renderable that can be 
     * drawn on view
     * @param objectName name of the Renderable to be spawned
     */
    abstract spawnRenderableObject(objectName:string):Renderable;
    /**
     * Populates renderables' templates library from specification so new instances
     * of Renderable can be created from template.    
     * @param filterNames When provided only specifications that match (include) any of the names provided are returned
     */
    abstract loadTemplates(filterNames: string[]):Promise<void>;

    /**
     * Returns all renderables' names that can be spawned by this factory
     */
    abstract spawnableRenderablesNames():string[];
}

/* istanbul ignore next */
export class RenderablesDefaultFactory extends RenderablesFactory{
    spawnRenderableObject(_objectName: string): Renderable {
        throw new Error('Method not implemented.');
    }
    loadTemplates(_filterNames: string[]): Promise<void> {
        throw new Error('Method not implemented.');
    }    
    spawnableRenderablesNames():string[]{
        return [];
    }
}

export interface RenderableThreeJS extends Renderable{
    data: THREE.Object3D
}

export interface RenderableTemplateThreeJS {
    name: string,
    object: THREE.Object3D,
    specification: RenderableSpecificationItem
}

export class RenderablesThreeJSFactory extends RenderablesFactory {
    
    // templates:Map<string, THREE.Object3D>;
    templates:Map<string, RenderableTemplateThreeJS>;
    loader: any; // threejs objects loader
    
    constructor(specification: RenderablesSpecification, loader:any){
        super(specification);
        this.loader = loader;
        this.templates = new Map<string, RenderableTemplateThreeJS>();        
    }

    /**
     * Returns specification item from renderable specifcation that matches name criteria
     * @param objectName target name
     * @returns specification item that matches name, throws error when none is found
     */
    _findSpecificationItem(objectName: string):RenderableSpecificationItem{
        let result:RenderableSpecificationItem|undefined;

        Object.keys(this.specification).forEach((propName:string)=>{
            const specification:RenderableSpecificationItem = <RenderableSpecificationItem>(<any>this.specification)[propName];
            if(specification.name == objectName){                
                result = specification
            }            
        })

        if(!result){
            throw Error(`Can't find renderable specification item for ${objectName}`);
        }
        return result;
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
            const template = this.templates.get(objectName)!;
            const cloned:THREE.Object3D|undefined = template.object.clone();
            this._cloneMaterials(cloned as THREE.Mesh);
            cloned!.castShadow = true;
            cloned!.receiveShadow = true;


            let result:THREE.Object3D|undefined;

            const specification = template.specification;


            const wrap = new THREE.Object3D();
            wrap.castShadow = true;
            wrap.receiveShadow = true;

            if(specification.pivotCorrection){
                // it is assumed that pivot point of spawned objects must be at
                // (center, center, 0)
                // so if the templated object has some other pivot configuration
                // one can translate accordingly so the spawned object has its pivot
                // located at correct place 
                try{
                    const vectorXYZ = specification.pivotCorrection.split(",").map((value:string)=>{
                        const theNumber = Number.parseFloat(value);
                        if(Number.isNaN(theNumber)){
                            throw new Error("Invalid number");
                        }
                        
                        return theNumber;
                    });
                    
                    
                    const correction:THREE.Vector3 = new THREE.Vector3(vectorXYZ[0], vectorXYZ[1], vectorXYZ[2])  
                                    
                    // cloned.position.set(-0.5,-0.5,0);
                    cloned.position.set(correction.x, correction.y, correction.z);                    
                    
                }
                catch(error:any){
                    throw new Error(`Can't apply pivot correction for specification ${objectName}`);
                }                
            }
            // else{
            //     result = cloned
            // }
            if(specification.scaleCorrection){
                cloned.scale.set(specification.scaleCorrection, specification.scaleCorrection,specification.scaleCorrection);
            }

            wrap.add(cloned);
            result = wrap;
            
            return {
                name: objectName,
                data: result,                
                hide: ()=>{
                    result!.visible = false;
                },                
                show: ()=>{
                    result!.visible = true;
                }
            }     
        }else{
            throw new Error(`No template found ${objectName}`);
        }        
    }

    /**
     * Populates renderables' templates library from specification so new instances
     * of Renderable can be created from template. When specification
     * contains renderable in json format that template is created by parsing the json. Otherwise
     * it is assumed that asset is hosted at place pointed out by the url.
     * @param filterNames when provided only 3d objects that match name will be added as template
     * @returns resolves on success
     */
    loadTemplates(filterNames: string[]):Promise<void>{
        const templatesToLoad:Promise<void>[] = [];
        // here we get all specification items from specification object
        Object.keys(this.specification).forEach((propName:string)=>{
            const specification:RenderableSpecificationItem = <RenderableSpecificationItem>(<any>this.specification)[propName];
            if(specification.json){                
                templatesToLoad.push(this._parseRenderablesObjectsTemplate(specification.json,filterNames, specification));
            }
            if(specification.url){
                templatesToLoad.push(this._loadRenderablesObjectsTemplate(specification.url!,filterNames, specification))
            }                        
        })
        return Promise.all(templatesToLoad).then(()=>{});
    }

    /**
     * Populates renderables' templates library with 3D template objects from file that is downloaded using provided 3D loader
     * so new instances of Renderable can be created from template.
     * @param path Path to the template file with 3D template objects
     * @param filterNames When provided only specifications that match (include) any of the names provided are returned
     */
    _loadRenderablesObjectsTemplate(path: string, filterNames: string[], specification: RenderableSpecificationItem): Promise<void> {
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
                    
                    that._addTemplate(item.name, item, specification)                    
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

    /**
     * Populates renderables' templates library with 3D template objects from string represtation that is provided and then loads it using provided 3D loader
     * so new instances of Renderable can be created from template.
     * @param objectsStringRepresentation textual representation (threejs object json export format) of scene/objects
     * @param filterNames When provided only specifications that match (include) any of the names provided are returned
     * @returns resolves on success
     */
    _parseRenderablesObjectsTemplate(objectsStringRepresentation: string, filterNames: string[], specification: RenderableSpecificationItem): Promise<void> {
        const that = this;
        return new Promise((resolve, reject)=>{
            let json:any;
            try{
                json = JSON.parse(objectsStringRepresentation);
            }catch(error:any){
                console.error("Can't parse threejs objects specification",error.message);
                reject(error);
            }

            const metadata = json.metadata;

			if ( metadata === undefined || metadata.type === undefined || metadata.type.toLowerCase() === 'geometry' ) {
                console.error("Invalid threejs objects metadata");
                reject("Invalid threejs objects metadata");
            }

            const loader = new THREE.ObjectLoader();

            loader.parse( json, (object:any)=>{
                // traverse all descendants
                const searchRoot:Object3D[] = []
                searchRoot.push(object);
                
                object.traverse((item:THREE.Object3D)=>{
                    searchRoot.push(item);                    
                })
                that._matchingChildren(searchRoot, filterNames)
                .forEach((item:any)=>{
                    
                    that._addTemplate(item.name, item, specification)                    
                })
                resolve(); 

            }); 
        });
    }
    /**
     * Returns names of all objects that can be spawned
     * @returns array of spawnables' names
     */
    spawnableRenderablesNames():string[]{
        const result:string[] = [];
        this.templates.forEach((_value, key)=>{
            result.push(key);
        })
        return result;
    }

    /**
     * Selects objects which name includes any of the provided filter names (case insensitive).
     * @param children array of objects to be checked
     * @param filterNames optional - when provided only obects which name includes any of names are returned
     * @returns array of objects which name matches filter or is equal to OBJECT3D
     */
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
    


    _addTemplate(name:string, object3D:THREE.Object3D, specification: RenderableSpecificationItem){
        const template:RenderableTemplateThreeJS = {
            name: name,
            object: object3D,
            specification: specification
        } 
        this.templates.set(name, template);
    }
}
