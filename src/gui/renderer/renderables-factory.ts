import * as THREE from 'three'
import { Box3, Material, Object3D, Vector3 } from 'three';

export interface Renderable{
    name: string,
    data: any,
    show?: ()=>void;
    hide?: ()=>void;
}
export interface RenderableSpecificationScale{
    byFactor?: number, // scale by this factor, >1 enlarge, <1 make smaller
    autoFitSize?: number // size to fit for largest dimension, will be scalled accordingly
}
export interface RenderableSpecification {
    name: string,
    url?: string,
    json?: string,
    filterByNames?:string[],
    pivotCorrection?: string,
    groundLevel?: number,
    scaleCorrection?: RenderableSpecificationScale,
    autoPivotCorrection?: boolean // important it is assumed that previous pivot point is in the "lower left (x,y)" position. 
}

export interface SpawnSpecification{
    name?: string // the most basic type of specification, by name, which is equall to invoking spawnRenderableObject(objectName:string) directly
}

export abstract class RenderablesFactory{
    specifications: RenderableSpecification[];    

    constructor(){
        this.specifications = [];        
    }

    /**
     * Creates new instance of Renderable that can be 
     * drawn on view
     * @param objectName name of the Renderable to be spawned
     */
    abstract spawnRenderableObject(objectName:string):Renderable;
    // /**
    //  * Populates renderables' templates library from specification so new instances
    //  * of Renderable can be created from template.    
    //  * @param filterNames When provided only specifications that match (include) any of the names provided are returned
    //  */
    // abstract loadTemplates(filterNames: string[]):Promise<void>;

    /**
     * Returns all renderables' names that can be spawned by this factory
     */
    abstract spawnableRenderablesNames():string[];

    /**
     * Populates factory specifications. Factory MUST be ready to spawn new instance of renderables when this method finishes.
     * @param specifications adds/replaces specifications to factory, when empty array is provided then specifications are reset in factory
     */
    abstract setSpecifications(specifications: RenderableSpecification[]):Promise<void>;

    /**
     * Creates new instance of Renderable that can be drawn on view, it uses more
     * "entity" approach where the entity to be instantiated is passed instead of 
     * just plain name
     * @param specification item specification to be instantiated
     */
    abstract spawn(specification: SpawnSpecification):Renderable;
}

/* istanbul ignore next */
export class RenderablesDefaultFactory extends RenderablesFactory{
    
    
    spawnRenderableObject(_objectName: string): Renderable {
        throw new Error('Method not implemented.');
    }
  
    spawnableRenderablesNames():string[]{
        return [];
    }

    setSpecifications(_specifications: RenderableSpecification[]): Promise<void> {
        throw new Error('Method not implemented.');
    }

    spawn(_specification: SpawnSpecification): Renderable {
        throw new Error('Method not implemented.');
    }
}

export interface RenderableThreeJS extends Renderable{
    data: THREE.Object3D
}

export interface RenderableTemplateThreeJS {
    name: string,
    object: THREE.Object3D,
    specification: RenderableSpecification
}

export class RenderablesThreeJSFactory extends RenderablesFactory {
    readonly DEFAULT_SCALE_TARGET_SIZE:number = 1;
    readonly DEFAULT_GROUND_LEVEL:number = 0.1;
    
    // template:Map<string, THREE.Object3D>;
    templates:Map<string, RenderableTemplateThreeJS>;
    loader: any; // threejs objects loader
    
    constructor(loader:any){
        super();
        this.loader = loader;
        this.templates = new Map<string, RenderableTemplateThreeJS>();        
    }

    _scale(objectName: string, object3D:Object3D, scaleSpecs?:RenderableSpecificationScale){
        const bbBox = new Box3();
        const sizeVector = new Vector3();                
        bbBox.setFromObject(object3D).getSize(sizeVector);                
        // console.log(`${objectName}  Auto Scale Correction - initial size ${JSON.stringify(sizeVector)}`)
        // console.log(`Initial scale: ${JSON.stringify(object3D.scale)}`)
        // first preset scale to 1
        object3D.scale.set(1, 1, 1);                          
        // first handle scale
        if(scaleSpecs&&scaleSpecs.byFactor){
            // manual scale correction
            if(scaleSpecs.byFactor<=0)
                throw new Error(`Can't apply scale correction for specification ${objectName}`)                
                object3D.scale.set(scaleSpecs.byFactor, scaleSpecs.byFactor, scaleSpecs.byFactor);                                
        }else{
            // when no auto scale provided then autoscale to 1, otherwise scale as provided
            let targetSize = scaleSpecs&&scaleSpecs.autoFitSize?scaleSpecs.autoFitSize:this.DEFAULT_SCALE_TARGET_SIZE;

            
            bbBox.setFromObject(object3D).getSize(sizeVector);                
            // console.log(`${objectName}  Auto Scale Correction - before size ${JSON.stringify(sizeVector)}`)
            
            // we do only take plane size, we do not take "z" size
            // const maxSize = Math.max(Math.max(sizeVector.x, sizeVector.y),sizeVector.z);
            const maxSize = Math.max(sizeVector.x, sizeVector.y);
            const scale = targetSize/maxSize
            // console.log(`Scale is: ${scale}`);
            object3D.scale.set(scale, scale, scale);                          

            bbBox.setFromObject(object3D).getSize(sizeVector);                      
            // console.log(`${objectName}  Auto Scale Correction - after size ${JSON.stringify(sizeVector)}`)
        } 
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

            // first handle scale
            this._scale(objectName, cloned, specification.scaleCorrection);
        
            // then make pivot correction

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
            }else if(specification.autoPivotCorrection){
                const bbBox = new Box3();
                const sizeVector = new Vector3();                
                bbBox.setFromObject(cloned).getSize(sizeVector);   
                                
                // console.log(`${objectName} Auto Pivot Correction size: ${JSON.stringify(sizeVector)} pos: ${JSON.stringify(cloned.position)}`)

                // const correction:THREE.Vector3 = new THREE.Vector3(vectorXYZ[0], vectorXYZ[1], vectorXYZ[2])                                                      
                cloned.position.set(-sizeVector.x/2,-sizeVector.y/2, cloned.position.z);                    
                // console.log(`${objectName}  Auto Pivot Correction - after pos ${JSON.stringify(cloned.position)}`)

            }

            if(!isNaN(specification.groundLevel!)){
                cloned.position.setZ(specification.groundLevel!)
            }

            
            
            wrap.add(cloned);
            result = wrap;
            const bbBox = new Box3();
            const sizeVector = new Vector3();                
            bbBox.setFromObject(wrap).getSize(sizeVector);   

            // console.log(`${objectName} Final renderable data. Position object: ${JSON.stringify(cloned.position)} Position wrap: ${JSON.stringify(wrap.position)}. Size: ${JSON.stringify(sizeVector)}`)
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

    spawn(specification: SpawnSpecification): Renderable {
        return this.spawnRenderableObject(specification.name!);
    }

    setSpecifications(specifications: RenderableSpecification[]): Promise<void> {
        if(specifications.length==0){
            // reset specifications to empty list
            this.specifications = [];
        }
        
        specifications.forEach((specification:RenderableSpecification)=>{            
            // first we remove previous specification if any exists with the same name
            if(specification.name != ""){            
                this.specifications = this.specifications.filter((item:RenderableSpecification)=>{
                    return item.name != specification.name
                })
            }

            this.specifications.push(specification);                    
        })

        // now repopulate templates using new specifications                 
        return this._loadTemplates()
    }

    _dispose(object3D:THREE.Mesh){
        if(!object3D.geometry)
            return;
        object3D.geometry.dispose();
        
        if(Array.isArray(object3D.material)){
            const materials = object3D.material as Material[];
            materials.forEach((material)=>{
                material.dispose();    
            })
        }else{
            const material =  object3D.material as Material;
            material.dispose()
        }                
        
        // todo texture?
    }

    _freeTemplatesMemory():void{
        // release memory for templates
        this.templates.forEach((value, _key)=>{
            const object3D = value.object;
            object3D.traverse((child)=>{                
                this._dispose(child as THREE.Mesh)
            })
        })
    }

    /**
     * Populates renderables' templates library from specification so new instances
     * of Renderable can be created from template. When specification
     * contains renderable in json format that template is created by parsing the json. Otherwise
     * it is assumed that asset is hosted at place pointed out by the url.     
     * @returns resolves on success
     */
    _loadTemplates():Promise<void>{
        
        // clear previous templates
        this._freeTemplatesMemory();        
        this.templates = new Map<string, RenderableTemplateThreeJS>();

        // load new templates
        const templatesToLoad:Promise<void>[] = [];

        this.specifications.forEach((specification:RenderableSpecification)=>{
            if(specification.json){                
                templatesToLoad.push(this._parseRenderablesObjectsTemplate(specification.json,specification.filterByNames||[], specification));
            }
            if(specification.url){
                templatesToLoad.push(this._loadRenderablesObjectsTemplate(specification.url!,specification.filterByNames||[], specification))
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
    _loadRenderablesObjectsTemplate(path: string, filterNames: string[], specification: RenderableSpecification): Promise<void> {
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
    _parseRenderablesObjectsTemplate(objectsStringRepresentation: string, filterNames: string[], specification: RenderableSpecification): Promise<void> {
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
     * @returns array of objects which name matches filter or type is equal to OBJECT3D
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

            let clonedMaterial;

            if(Array.isArray(parent.material)){
                clonedMaterial = [];
                parent.material.forEach((material)=>{
                    const originalMaterial: Material = material as Material; 
                    clonedMaterial.push(originalMaterial.clone()); 
                })

            }else{
                const originalMaterial: Material = parent.material as Material;
                clonedMaterial = originalMaterial.clone();    
            }
            
            // console.log(`O - ${originalMaterial.id} M2 - ${clonedMaterial.id}`)

            parent.material = clonedMaterial;

            // console.log(`After - M ${parent.material.id}`);
        }
        for(const child of parent.children){                                
            that._cloneMaterials(child as THREE.Mesh);
        }
    }

    _addTemplate(name:string, object3D:THREE.Object3D, specification: RenderableSpecification){
        const template:RenderableTemplateThreeJS = {
            name: name,
            object: object3D,
            specification: specification
        } 
        this.templates.set(name, template);
    }
}
