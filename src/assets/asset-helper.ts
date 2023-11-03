import { RenderablesFactory, RenderablesThreeJSFactory } from "../gui/renderer/renderables-factory";
import { Asset, AssetVariantSpecs } from "../specification/assets";

export class ThreeJSHexAssetHelper {
    thumbnailBase64 = `data:image/png;base64,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OmNyZWF0ZQAyMDE4LTAzLTIzVDE4OjI5OjU2KzAxOjAwbWEneAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0wMy0yM1QxODoyOTo1NiswMTowMBw8n8QAAABGdEVYdHNvZnR3YXJlAEltYWdlTWFnaWNrIDYuNy44LTkgMjAxNi0wNi0xNiBRMTYgaHR0cDovL3d3dy5pbWFnZW1hZ2ljay5vcmfmvzS2AAAAGHRFWHRUaHVtYjo6RG9jdW1lbnQ6OlBhZ2VzADGn/7svAAAAGHRFWHRUaHVtYjo6SW1hZ2U6OmhlaWdodAA1MTLA0FBRAAAAF3RFWHRUaHVtYjo6SW1hZ2U6OldpZHRoADUxMhx8A9wAAAAZdEVYdFRodW1iOjpNaW1ldHlwZQBpbWFnZS9wbmc/slZOAAAAF3RFWHRUaHVtYjo6TVRpbWUAMTUyMTgyNjE5NlVLtfUAAAATdEVYdFRodW1iOjpTaXplADcuNjJLQkIy+IigAAAAQnRFWHRUaHVtYjo6VVJJAGZpbGU6Ly8uL3VwbG9hZHMvNTYvVGp0YUdIMC8xMzc4L2ltYWdlbWlzc2luZ185MjgzMi5wbmevo26OAAAAAElFTkSuQmCC`

    /**
     * Creates asset from provided data using asset default settings.
     * @param name asset name, will be used 
     * @param description asset description
     * @param object3DJson threejs object json (object not string representation)
     * @param thumbnail data url encoded image of the asset
     * @returns {Asset} ready to be registered in Renderables Factory
     */
    async asset(name: string, description: string, object3DJson: any, thumbnail?: string):Promise<Asset>{
        // we derive full name as the upper case with "_" from the asset name
        const variantCode = this._convertToUpperCase(name);

        const id = `${Math.random().toString(36).substring(2, 10)}`;        
        return this.assetWithIdAndLibrary(id, name, description, variantCode, object3DJson, thumbnail||this.thumbnailBase64)

    }

    async assetWithIdAndLibrary(id: string,  name: string, description: string, variantCode: string, object3DJson: any, thumbnail: string,  libraryId?: string):Promise<Asset>{
        const variant:AssetVariantSpecs = {
            fullName: variantCode,
            created: Date.now(),
            renderableJSON: object3DJson,
            thumbnail: thumbnail
        }
        const asset:Asset = {
            specs: {
                id: id,
                name: name,
                description: description,
                tags: [],
                kind: "HexTile",
                library: libraryId,
                created: Date.now(),
                variants: [variant]
            },
            variant: variant
        }
        // make a check if the object3DJson contains object with name matching variantCode
        const factory = new RenderablesThreeJSFactory({});
        await this.registerAsset(asset, factory);
        
        return asset;
    }

    /**
     * Registers asset with given asset factory. It uses default pivot and scale (fit 1 size) settings. It also retrieves only 
     * the object which name matches the asset variant (in case there are more objects defined in renderable json).
     * @param asset target asset
     * @param assetFactory factory in which asset will be registered
     */
    async registerAsset(asset: Asset, assetFactory:RenderablesFactory){
        const availableSpecificationsNames = assetFactory!.spawnableRenderablesNames();
        /* istanbul ignore next */
        if(!availableSpecificationsNames.join(",").includes(asset.variant.fullName)){
            // load specification as it's missing from the factory
            const specs = {
                name: `${asset.specs.name}_${asset.specs.id}`,
                json: JSON.stringify(asset.variant.renderableJSON),                    
                // pivotCorrection: "0.15,-0.3,0.1",
                autoPivotCorrection: true,
                // scaleCorrection: 0.01
                scaleCorrection: {
                    // byFactor: 1.2
                    autoFitSize: 1                
                },
                filterByNames: [asset.variant.fullName] // in case the renderable json contains more 3d objects we register only the asset
            }
            await assetFactory!.setSpecifications([specs]);
            // now make a check if object is spawnable (in rare cases the renderable json may not contain object which name matches asset's variant fullName)
            const isValid = this.isAssetValid(asset, assetFactory);
            if(!isValid)
                throw new Error(`Can't create asset "${asset.specs.name}" with id "${asset.specs.id}" as object3DJson does not contain object with name ${asset.variant.fullName}`);
        }
    }

    /**
     * Returns true when asset is properly registered in factory and spawnable.
     * @param asset target asset
     * @param assetFactory target factory
     * @returns true when asset is properly registered and ready to be spawned
     */
    isAssetValid(asset: Asset, assetFactory:RenderablesFactory):boolean{
        const availableSpecificationsNames = assetFactory!.spawnableRenderablesNames();
        return availableSpecificationsNames.join(",").includes(asset.variant.fullName);
    }
    
    // _convertToCamelCase(inputString:string) {
    //     // Split the string into an array of words separated by '_'
    //     const words = inputString.split('_');
    
    //     // Capitalize the first letter of each word and convert the rest of the letters to lowercase
    //     const camelCaseWords = words.map((word, index) => {
    //         if (index === 0) {
    //             return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    //         }
    //         return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    //     });
    
    //     // Join the words with a space and return the resulting string
    //     return camelCaseWords.join(' ');
    // }

    _convertToUpperCase(inputString:string) {
        // Split the string into an array of words
        const words = inputString.trim().split(/\s+/);
    
        // Convert each word to uppercase and join them using '_'
        const upperCaseWithUnderscore = words.map((word) => {
            return word.toUpperCase();
        }).join('_');
    
        return upperCaseWithUnderscore;
    }
}