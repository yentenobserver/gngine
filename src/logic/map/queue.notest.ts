export class Node {
    id: string;
    data:any;
    priority: number;

    constructor(id: string, data:any, priority:number){
        this.data = data;
        this.priority = priority;
        this.id = id;
    }
}

export class PriorityQueue {
    heap:Node[];

    constructor(arr?: Node[]){
        this.heap = [];
        if (arr) for (let i=0; i< arr.length; i++)
            this.push(arr[i]);
    }

    push(node: Node):void{        
        this.bubble(this.heap.push(node) -1);      
    }

    // bubbles node i up the binary tree based on
    // priority until heap conditions are restored
    bubble(i:number):void{        
        while (i > 0) { 
            var parentIndex = i >> 1; // <=> floor(i/2)
            
            // if equal, no bubble (maintains insertion order)
            if (!this.isHigherPriority(i, parentIndex)) break;
            
            this.swap(i, parentIndex);
            i = parentIndex;
        }   
    }

    isHigherPriority(i:number,j:number):boolean {
        return this.heap[i].priority < this.heap[j].priority;
    }

    // swaps the addresses of 2 nodes
    swap(i:number,j:number):void {
        var temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    pop():Node|undefined {
        //var topVal = this.heap[1].data;
        var topNode = this.heap.shift();
        //this.heap[1] = this.heap.pop();
        //this.sink(1); return topVal;
        return topNode;
    }

    isEmpty():boolean{
    	return !this.heap.length;
    }

    has(node:Node):boolean{
        let result = false;
        for(let i=0; i<this.heap.length; i++){
            if(this.heap[i].id == node.id){
                result = true;
                break;
            }                
        }

        return result;
    }


}
