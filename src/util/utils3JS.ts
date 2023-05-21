import {Texture, TextureLoader } from 'three';

export class Utils3JS {    
    static async texture(url:string):Promise<Texture>{
        return new Promise((resolve, reject) => {            
            const loader = new TextureLoader();
            // console.log(this.url)
            loader.load(url, (texture:Texture) => {
                resolve(texture);
            }, undefined, (error) => {
                reject(error);
            });
        })
    }
}