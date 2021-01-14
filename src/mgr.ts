const _SAFETY_MAX = 10000
export interface Result{
    k: string,
    o: string,
    v:string
}
export default function anonymise(input:string, symbol?:string, howMany?:number, key?:string):Result{
    
    // console.log(input, symbol, howMany, key, items.length/2, limit);
    if(!symbol||symbol.length!=1)
        throw new Error('Symbol must be of length 1')
    
    if(howMany&&howMany>input.length)
        throw new Error('Cant anonymise more chars than the input length')

    let items = input.split("");
    let limit = howMany?howMany:items.length/2;
  
    let idxArray = [];
    for(let i=0, j=0; i<limit&&j<_SAFETY_MAX; ){
      
      let idx = Math.floor(Math.random()*items.length);
      if(idxArray.indexOf(idx)==-1){
        idxArray.push(idx);
        i++;
      }
      j++;
    }
    
    idxArray.forEach(idx=>{
      items[idx] = symbol;
    })
    
    let result = {
      k: key?key:Math.random().toString(36).substring(2, 18),
      o: input,
      v: items.join("")
    }
    return result;
  }


