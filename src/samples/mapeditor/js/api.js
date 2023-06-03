class ApiUserClient {
    constructor(){}

    async initialize(){}

    async assetsSpecs(libraryId){
        return this._get(`library_${libraryId}_assetsSpecs`)||[];
    }
    async putAssetSpec(assetSpec){
        const libraryId = assetSpec.library;
        this._put(`library_${libraryId}_assetsSpecs`,[assetSpec]);
        
    }

    async libraries(){
        return this._get("libraries")||[];
    }

    async putLibrary(library){
        this._put("libraries", [library]);
    }

    _get(key){
        return JSON.parse(localStorage.getItem(key));
    }

    _put(key, value){
        let item = localStorage.getItem(key);
        if(Array.isArray(value)&&!item){
            item = []
        }else if (!item){
            item = {}
        }else{
            item = JSON.parse(item);
        }
        const merged = this._deepMerge(item, value);
        localStorage.setItem(key, JSON.stringify(merged));
        return merged;
    }

    // _deepMerge(target, source) {
    //     // Check if both target and source are arrays
    //     if (Array.isArray(target) && Array.isArray(source)) {
    //       // Add each element from the source array to the target array if it doesn't already exist
    //       source.forEach(function(element) {
    //         if (!target.some(function(targetElement) {
    //           return this._deepEqual(targetElement, element);
    //         })) {
    //           target.push(element);
    //         }
    //       });
    //     } else {
    //       // Iterate through all properties in the source object
    //       for (var key in source) {
    //         if (target.hasOwnProperty(key) && source.hasOwnProperty(key)) {
    //           if (typeof target[key] === 'object' && typeof source[key] === 'object') {
    //             this._deepMerge(target[key], source[key]);
    //           } else {
    //             target[key] = source[key];
    //           }
    //         } else {
    //           target[key] = source[key];
    //         }
    //       }
    //     }
        
    //     return target;
    //   }
      
    //   // Helper function to compare objects deeply
    //   _deepEqual(a, b) {
    //     if (a === b) return true;
        
    //     if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
        
    //     var keysA = Object.keys(a);
    //     var keysB = Object.keys(b);
        
    //     if (keysA.length !== keysB.length) return false;
        
    //     for (var i = 0; i < keysA.length; i++) {
    //       var currentKey = keysA[i];
          
    //       if (!b.hasOwnProperty(currentKey) || !this._deepEqual(a[currentKey], b[currentKey])) {
    //         return false;
    //       }
    //     }
        
    //     return true;
    //   }

      _deepMerge(target, source) {
        // Check if both target and source are arrays
        if (Array.isArray(target) && Array.isArray(source)) {
          // Add each element from the source array to the target array if it doesn't already exist, or overwrite it
          source.forEach(function(element) {
            var existingElementIndex = target.findIndex(function(targetElement) {
              return targetElement.id === element.id;
            });
            
            if (existingElementIndex !== -1) {
              target[existingElementIndex] = element;
            } else {
              target.push(element);
            }
          });
        } else {
          // Iterate through all properties in the source object
          for (var key in source) {
            if (target.hasOwnProperty(key) && source.hasOwnProperty(key)) {
              if (typeof target[key] === 'object' && typeof source[key] === 'object') {
                this._deepMerge(target[key], source[key]);
              } else {
                target[key] = source[key];
              }
            } else {
              target[key] = source[key];
            }
          }
        }
        
        return target;
      }
      
      
      
      
}
class ApiUserClient2 {
    constructor(){
        this.db = {};        
    }

    async initialize(){
        this.db = new Localbase('gngine2');
    }

    async assetsSpecs(userId, libraryId){
        const assetsSpecs = await this.db.collection(`/${userId}/libraries/${libraryId}`).get(); 
        return assetsSpecs || [];                
    }



    async putAssetSpec(userId, assetSpec){
        const libraryId = assetSpec.library;
        // const assetsSpecs = await this.assetsSpecs(userId, libraryId);
        
        try{
            // try to delete if exists
            await this.db.collection(`/${userId}/libraries/${libraryId}`).doc({id: assetSpec.id}).delete();
        }catch(e){}        
        await this.db.collection(`/${userId}/libraries/${libraryId}`).add(JSON.parse(JSON.stringify(assetSpec)));                                                     

        // const newArray = assetsSpecs.some(item => item.id === assetSpec.id) ? assetsSpecs.map(item => item.id === assetSpec.id ? assetSpec : item) : [...assetsSpecs, assetSpec];

        const assetsSpecs = await this.assetsSpecs(userId, libraryId);
        console.log(assetsSpecs);
        // const newArray = assetsSpecs.map(item => item.id === assetSpec.id ? assetSpec : item);
        
        // for(let i=0; i<newArray.length; i++){
        //     await this.db.collection(`/${userId}/libraries/${libraryId}`).add(newArray.map((item)=>{return JSON.parse(JSON.stringify(item))}))                                                     
        // }
        
    }

    async libraries(userId){
        const libraries = await this.db.collection(`/${userId}/libraries`).get();
        return libraries||[];        
    }

    async putLibrary(userId, library){        
        await this.db.collection(`/${userId}/libraries`).add(library)                
    }

      _deepMerge(target, source) {
        // Check if both target and source are arrays
        if (Array.isArray(target) && Array.isArray(source)) {
          // Add each element from the source array to the target array if it doesn't already exist, or overwrite it
          source.forEach(function(element) {
            var existingElementIndex = target.findIndex(function(targetElement) {
              return targetElement.id === element.id;
            });
            
            if (existingElementIndex !== -1) {
              target[existingElementIndex] = element;
            } else {
              target.push(element);
            }
          });
        } else {
          // Iterate through all properties in the source object
          for (var key in source) {
            if (target.hasOwnProperty(key) && source.hasOwnProperty(key)) {
              if (typeof target[key] === 'object' && typeof source[key] === 'object') {
                this._deepMerge(target[key], source[key]);
              } else {
                target[key] = source[key];
              }
            } else {
              target[key] = source[key];
            }
          }
        }
        
        return target;
      }
      
      
      
      
}
class Api {
    constructor(){
                
        this.User = new ApiUserClient();
        this.User2 = new ApiUserClient2();
    }
    static async getInstance(){
        const api = new Api();
        await api.User.initialize();
        await api.User2.initialize();
        return api;
    }    
}