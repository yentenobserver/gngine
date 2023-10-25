import * as THREE from 'three'


export class Utils3JS {    
    static async texture(url:string):Promise<THREE.Texture>{
        return new Promise((resolve, reject) => {            
            const loader = new THREE.TextureLoader();
            // console.log(this.url)
            loader.load(url, (texture:THREE.Texture) => {
                resolve(texture);
            }, undefined, (error) => {
                reject(error);
            });
        })
    }
}