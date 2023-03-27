class Utils {
    static deepMerge(a:any, b:any, fn:(key: string, a:any, b:any)=>void){
        return [...new Set([...Object.keys(a), ...Object.keys(b)])]
        .reduce(
            (acc, key) => ({ ...acc, [key]: fn(key, a[key], b[key]) }),
            {}
          );
    }    
}