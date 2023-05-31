class ApiUserClient {
    constructor(){}

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
class Api {
    constructor(){
        this.User = new ApiUserClient();
    }
    static getInstance(){
        return new Api();
    }    
}