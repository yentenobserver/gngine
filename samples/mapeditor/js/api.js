/**
 * Map specification
 * @typedef {Object} MapData
 * @property {MapSpecs} specs - map specification
 * @property {TileBase[]} tiles - map tiles
 * @property {AssetReference[]} assets - assets used in map 
 */
/**
 * Assets library specification
 * @typedef {Object} LibraryReference
 * @property {string} id - library id
 * @property {string} name - library name
 * @property {string} version - library version
 * @property {boolean} isPublic - when true then library is public
 * @property {string} kind - one of "Unit" | "HexTile" | "QuadTile"
 */
/**
 * Assets library
 * @typedef {Object} Library
 * @property {LibraryReference} specs - specification of the library
 * @property {AssetSpecs[]} assets - assets in library
 */

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
        let assetsSpecs = []
        try{
            assetsSpecs  = await this.db.collection(`/${userId}/libraries/${libraryId}`).get(); 
        }catch(error){
            console.log(error);
        }         
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
class ApiUserClient3 {
    constructor(){
        this.db = firebase.database();   
        this.userCredential = {}     
    }

    async initialize(){  
        this.userCredential = await firebase.auth().signInAnonymously();
    }

    async assetsConfig(){
      let result = {};
      const ref = `/config/assetConfig`;
      const snap = await this.db.ref(ref).once("value");
      if(snap.exists()&&snap.val()){
        result = snap.val()
      }
      return result;
    }

    async assetsSpecs(libraryId, userId = this.userCredential.user.uid){
        let result = [];
        const ref = `/userlibraries/${userId}/${libraryId}`;
        const snap = await this.db.ref(ref).once("value");
        if(snap.exists()&&snap.val()){
            // if(snap.hasChildren()&&Array.isArray(snap.val())){
            //     snap.val().forEach((item)=>{
            //         result.push(item.val())
            //     });
            // }else{
            //     result.push(snap.val())
            // }
            snap.forEach((item)=>{
                result.push(item.val())
            })
            
        }
        
        return result || [];                
    }



    // async putAssetSpec(assetSpec, userId = this.userCredential.user.uid){
    //     const libraryId = assetSpec.library;
    //     // const assetsSpecs = await this.assetsSpecs(userId, libraryId);
    //     const ref = `/userlibraries/${userId}/${libraryId}/${assetSpec.id}`;
    //     await this.db.ref(ref).set(JSON.parse(JSON.stringify(assetSpec)));        
    // }

    async libraries(userId = this.userCredential.user.uid){
        let libraries = [];
        const ref = `/userlibraries/${userId}/dict`;
        const snap = await this.db.ref(ref).once("value");
        if(snap.exists()&&snap.val()){
            snap.forEach((item)=>{
                libraries.push(item.val());
            })
            // if(snap.hasChildren()&&Array.isArray(snap.val())){
            //     snap.val().forEach((item)=>{
            //         libraries.push(item.val())
            //     })
            // }else{
            //     libraries.push(snap.val())
            // }
            
        }
        
        return libraries||[];        
    }

    /**
     * 
     * @param {MapData} map 
     */
    async putMap(map, userId = this.userCredential.user.uid){
      let ref = `/usermaps/${userId}/dict/${map.specs.id}`;
      await this.db.ref(ref).set(JSON.parse(JSON.stringify(map.specs)));

      ref = `/usermaps/${userId}/${map.specs.id}`;
      await this.db.ref(ref).set(JSON.parse(JSON.stringify(map)));

      if(map.specs.isPublic){
        ref = `/maps/dict/${map.specs.id}`;
        await this.db.ref(ref).set(JSON.parse(JSON.stringify(map.specs)));

        ref = `/maps/${map.specs.id}`;
        await this.db.ref(ref).set(JSON.parse(JSON.stringify(map)));
      }
    }

    async maps(userId = this.userCredential.user.uid){
      let mapIds = [];
      let maps = [];
      let ref = `/usermaps/${userId}/dict`;
      let snap = await this.db.ref(ref).once("value");
      if(snap.exists()&&snap.val()){
          snap.forEach((item)=>{
            mapIds.push(item.val().id);
          })          
      }
      for(let i=0;i<mapIds.length; i++){
        let ref = `/usermaps/${userId}/${mapIds[i]}`;
        let snap = await this.db.ref(ref).once("value");
        if(snap.exists()&&snap.val()){
          maps.push(snap.val())                  
        } 
      }
      
      return maps;        
  }

    /**
     * 
     * @param {Library} library 
     * @param {*} userId 
     */
    async putLibraryWithAssets(library, userId = this.userCredential.user.uid){ 

        // put private specs        
        let ref = `/userlibraries/${userId}/dict/${library.specs.id}`;
        await this.db.ref(ref).set(library.specs);
        // put private assets
        for(let i=0; i<library.assets.length; i++){
            const assetSpec = library.assets[i];
            const libraryId = assetSpec.library;
            ref = `/userlibraries/${userId}/${libraryId}/${assetSpec.id}`;
            await this.db.ref(ref).set(JSON.parse(JSON.stringify(assetSpec)));        
        }
        
        if(library.specs.isPublic){
            // optional put public specs
            ref = `/libraries/dict/${library.specs.id}`;
            await this.db.ref(ref).set(library.specs);                
            
            for(let i=0; i<library.assets.length; i++){
                const assetSpec = library.assets[i];
                const libraryId = assetSpec.library;
                const ref = `/libraries/${libraryId}/${assetSpec.id}`;
                await this.db.ref(ref).set(JSON.parse(JSON.stringify(assetSpec)));        
            }
        }                
    }

    // async putLibrary(library, userId = this.userCredential.user.uid){        
    //     const ref = `/userlibraries/${userId}/dict/${library.id}`;
    //     await this.db.ref(ref).set(library);                
    // }

    // async putPublicLibrary(libraryReference){
    //     const ref = `/libraries/dict/${libraryReference.id}`;
    //     await this.db.ref(ref).set(libraryReference);                
    // }

    // async putPublicAssetSpec(assetSpec){
    //     const libraryId = assetSpec.library;
    //     // const assetsSpecs = await this.assetsSpecs(userId, libraryId);
    //     const ref = `/libraries/${libraryId}/${assetSpec.id}`;
    //     await this.db.ref(ref).set(JSON.parse(JSON.stringify(assetSpec)));        
    // }

    async publicLibraries(){
        let libraries = [];
        const ref = `/libraries/dict`;
        const snap = await this.db.ref(ref).once("value");
        if(snap.exists()&&snap.val()){
            snap.forEach((item)=>{
                libraries.push(item.val());
            })            
        }        
        return libraries||[];        
    }

    async assetsFromLibraryPublic(libraryId){
        let result = [];
        const ref = `/libraries/${libraryId}`;
        const snap = await this.db.ref(ref).once("value");
        if(snap.exists()&&snap.val()){            
            snap.forEach((item)=>{
                result.push(item.val())
            })            
        }        
        return result || [];                
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
        this.User3 = new ApiUserClient3();
    }
    static async getInstance(){
        const api = new Api();
        await api.User.initialize();
        await api.User2.initialize();
        await api.User3.initialize();
        return api;
    }    
}