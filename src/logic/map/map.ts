import { TileBase } from "./common.notest";
import { CostCalculator } from "./costs";
import { PriorityQueue } from "./queue.notest";
import { Node } from "./queue.notest"









interface PathResult {
    origin: TileBase,   // tile from which we calculate paths, origin or start tile
    steps: Map<TileBase, TileBase|undefined>, //  <next , predecesor> key is next, value is a predecessor
    costs: Map<TileBase, number>    // lowest cost of reaching given tile
}

export interface Path {
    origin: TileBase,
    target: TileBase,
    cost: number,
    steps: TileBase[] // origin as 0, target as n
}

export interface Paths {
    origin: TileBase,
    paths: Map<TileBase, Path>;   // <target, path to target> paths from origin to given target
}

/**
 * Direct neighbours i.e. map tiles that are in direct vicinity of the origin tile.
 */
export interface Neighbour {
    origin: TileBase,
    direction: any,
    target: TileBase

}

export abstract class MapBase {
    CONST_COST = 1;
    CONST_PATH_NOT_FOUND_COST = Number.MAX_SAFE_INTEGER;

    theMap:Map<string, TileBase>;
    width: number;
    height: number;
 

    constructor(height: number, width: number){
        this.theMap = new Map<string, TileBase>();
        this.width = width;
        this.height = height
    }

    tile(id:string):TileBase{
        const tile =  this.theMap.get(id);
        if(!tile)
            throw new Error("Tile not found");

        return tile;
    }

    fromTiles(tiles:TileBase[]):void{
        

        if(this.height*this.width != tiles.length)
            throw new Error("Invalid arguments");  

        tiles.forEach((item:TileBase)=>{
            this.theMap.set(item.id, item);
        })
        
    }

    put(tile: TileBase):void{
        
        if(!this.theMap.has(tile.id)){
            if(this.theMap.values.length == this.height*this.width)
                throw new Error(`Can't add tile ${tile.id} as size exceeded.`)
        }else{
            // when key exists simply replace
            this.theMap.set(tile.id, tile);
        }    
    }

    abstract neighbours(origin: TileBase):Neighbour[];

    pathFind(calculator: CostCalculator, from:TileBase, to?: TileBase,  costLimit?: number):PathResult{
        
        const SAFETYMAXITERATIONS = 999999;
        const MAXCOST = this.CONST_PATH_NOT_FOUND_COST;

        let frontier = new PriorityQueue();
		frontier.push(new Node(from.id, from,0));

        let cameFrom:Map<TileBase, TileBase|undefined> = new Map<TileBase, TileBase|undefined>();
		let costSoFar:Map<TileBase, number> = new Map<TileBase, number>();

        if(costLimit!=0 && !costLimit){
			costLimit = MAXCOST;
		}

        cameFrom.set(from, undefined);        
		costSoFar.set(from, 0);

		var iterationCounter = 0;


        
        while(!frontier.isEmpty()){
			iterationCounter++;
            /* istanbul ignore next */
			if(iterationCounter>SAFETYMAXITERATIONS){
				console.log("[_algorithmDijikstra] ERROR - max iterations found. Stopping algorithm.");
				break;

			}
            
			// let currentNode:Node|undefined currentHexId = frontier.pop();
            let workingNode:Node = frontier.pop()!;

			var workingTile:TileBase = workingNode.data;

            // we reached destination
			if(to && (workingTile.id == to.id)){
				break;
			}

            let neighbours: Neighbour[] = this.neighbours(workingTile);
			// var neighbours = this.getHexNeighbours(currentHex); //{direction, hexData}

            for (let i=0; i<neighbours.length; i++){
                let neighbour:Neighbour = neighbours[i];
                let costFromFunction = calculator.cost(neighbour.origin, neighbour.target);                
				let newCost = costSoFar.get(workingTile)! + costFromFunction;
                
                if(newCost>costLimit){
					continue;
				}

                if((!(costSoFar.has(neighbour.target))) || newCost < costSoFar.get(neighbour.target)!){
                    costSoFar.set(neighbour.target, newCost);
                    frontier.push(new Node(neighbour.target.id,neighbour.target,newCost));
                    cameFrom.set(neighbour.target, neighbour.origin)
                }                
            }
		}

        let pathResult: PathResult = {
            origin: from,
            steps: cameFrom,
            costs: costSoFar
        }
        
        return pathResult;
    }

    range(calculator: CostCalculator, from:TileBase, range: number):Paths{
        return this.paths(calculator, from, undefined, range);        
    }

    paths(calculator: CostCalculator, from:TileBase, to?: TileBase,  costLimit?: number):Paths{
        let pathResult: PathResult = this.pathFind(calculator, from, to, costLimit);        
        return this._traversePaths(pathResult);
    }

    path(calculator: CostCalculator, from:TileBase, to: TileBase,  costLimit?: number):Path{
        const paths:Paths = this.paths(calculator,from, to, costLimit);  
        if(!paths.paths.get(to))
            throw new Error("Path not found");
            
        return paths.paths.get(to)!;
        
    }
    
    distance(from:TileBase, to:TileBase, costCalculator: CostCalculator):number{
        const path:Path = this.path(costCalculator,from, to);          
        return path.cost
    }

    _traversePaths(pathResult: PathResult):Paths{
        let paths:Paths = {
            origin: pathResult.origin,
            paths: new Map<TileBase, Path>()
        }

        let targets:TileBase[] = [];
        // first get all targets reachable from origin        
        pathResult.steps.forEach((_hopFrom: TileBase|undefined, hopTo: TileBase)=>{
            // get eventual targets of movement     
            // but make sure that we do not add origin
            if(hopTo!=pathResult.origin)       
                targets.push(hopTo);
        })
        // get only unique targets
        targets = [...new Set(targets)];

        

        targets.forEach((item:TileBase)=>{
            let path:Path = {
                cost: 0,
                origin: pathResult.origin,
                steps: [item],
                target: item
            }

            
            // for each target build path from origin to target
            // key is next, value is a predecessor
            let workingItem:TileBase|undefined = item;
            let predecessor:TileBase|undefined = undefined;
            // let cnt = 0;
            while(predecessor!=pathResult.origin){
                predecessor = pathResult.steps.get(workingItem!);            
                path.steps.unshift(predecessor!);
                workingItem = predecessor;
                // cnt++;
                // if(cnt>20) break;
            }

            path.cost = pathResult.costs.get(item)!;
            paths.paths.set(item, path);            
        })

        return paths;
    }
}

export class MapSquare extends MapBase {
    CONST_DIRECTION_N = 'N';
    CONST_DIRECTION_S = 'S';
    CONST_DIRECTION_E = 'E';
    CONST_DIRECTION_W = 'W';
    CONST_DIRECTION_NE = 'NE';
    CONST_DIRECTION_NW = 'NW';
    CONST_DIRECTION_SE = 'SE';
    CONST_DIRECTION_SW = 'SW';
    CONST_DIRECTION_UN = 'UN';
    
    constructor(height: number, width: number){
        super(height, width);
    }

    /**
     * 
     * @param origin 
     * @returns Array of TileBase of neighbours (excluding origin)
     */
    neighbours(origin: TileBase): Neighbour[] {
        const neighbours:Neighbour[] = [];
        const originTile: TileBase = <TileBase>origin;        
        this.theMap.forEach((item:TileBase)=>{
            const tile:TileBase = <TileBase> item;
            //distance on each x,y <=1
            const dx = tile.x-originTile.x;
            const dy = tile.y-originTile.y;            
            // == exclude origin, <= include origin
            if(Math.abs(dx)<=1&&Math.abs(dy)<=1){                
                // exclude origin
                if(dx!=0||dy!=0){                    
                    neighbours.push({
                        origin: origin,
                        target: item,
                        direction: this._direction(dy, dx)
                    })
                }
                
            }
        })
        
        return neighbours;
    } 

    _direction(dy:number, dx: number):string{
        if(dy==dx && dy==0)
            throw new Error('Invalid arguments');

        let result = "";
        if(dy==1){
            result+="S"
            switch(Math.sign(dx)){
                case 1: result+="E"
                    break;
                case -1: result+="W"
                    break;
            }
        }
        if(dy==-1){
            result+="N"
            switch(Math.sign(dx)){
                case 1: result+="E"
                    break;
                case -1: result+="W"
                    break;
            }
        }
        if(dy==0){
            switch(Math.sign(dx)){
                case 1: result+="E"
                    break;
                case -1: result+="W"
                    break;
            }
        }
        if(!result)
            throw new Error('Invalid arguments');
        return result;
    }
}

/**
 * In hex map coordinate system x stands for q-columns and y stand for r-rows
 * 
 * (q,r) -> (y,x) :: (cols, rows)
 */
export class MapHexOddQ extends MapBase {
    CONST_DIRECTION_N = 'N';
    CONST_DIRECTION_NE = 'NE';
    CONST_DIRECTION_NW = 'NW';

    CONST_DIRECTION_S = 'S';    
    CONST_DIRECTION_SE = 'SE';
    CONST_DIRECTION_SW = 'SW';

    CONST_DIRECTION_UN = 'UN';
    
    constructor(height: number, width: number){
        super(height, width);
    }

    /**
     * 
     * @param origin 
     * @returns Array of TileBase of neighbours (excluding origin)
     */
    neighbours(origin: TileBase): Neighbour[] {
        const neighbours:Neighbour[] = [];
        const originTile: TileBase = <TileBase>origin;        
        this.theMap.forEach((item:TileBase)=>{
            const tile:TileBase = <TileBase> item;
            //distance on each x,y <=1
            const dx = originTile.x-tile.x;
            const dy = originTile.y-tile.y;                                    

            let neighbour;
            switch(origin.y%2==0){
                case true:
                    // even
                    const coordsDeltaEven = [{dy:0 , dx:1},{dy:-1 , dx:1}, {dy:-1 , dx:0},{dy:0 , dx:-1}, {dy:1 , dx:0}, {dy:1 , dx:1}]
                    neighbour = coordsDeltaEven.find((item:any)=>{
                        return item.dx == dx && item.dy == dy
                    })                    
                    break;
                case false:
                    // odd
                    const coordsDeltaOdd = [{dy:0 , dx:1},{dy:-1 , dx:0}, {dy:-1 , dx:-1},{dy:0 , dx:-1}, {dy:1 , dx:-1}, {dy:1 , dx:0}]
                    neighbour = coordsDeltaOdd.find((item:any)=>{
                        return item.dx == dx && item.dy == dy
                    })  
                    break;
            }

            if(neighbour){
                neighbours.push({
                    origin: origin,
                    target: item,
                    direction: this._direction(origin, dy, dx)
                })
            }                        
        })
        
        return neighbours;    		
    } 
    /**
     * Odd-q hex grid direction calculation
     * (q,r) -> (y,x) :: (cols, rows)
     *  // ODD-Q
		
		// dq == 0  dr<0 S
		// dq == 0  dr>0 N

        odd-q

		// dq > 0 dr>0 NW
		// dq > 0 dr==0 SW

		// dq < 0 dr>0 NE
		// dq < 0 dr==0 SE

        even-q

		// dq > 0 dr<0 SW
		// dq > 0 dr==0 NW

		// dq < 0 dr<0 SE
		// dq < 0 dr==0 NE
     * @param dy 
     * @param dx 
     * @returns 
     */
    _direction(tile: TileBase, dy:number, dx: number):string{
        if(dy==dx && dy==0)
            throw new Error(`Invalid arguments ${tile.id} ${dy}, ${dx}`);

       


        let result = "";

        if(dy==0){
            switch(Math.sign(dx)){
                case 1: result+="N"
                    break;
                case -1: result+="S"
                    break;
            }
        }
        
        // even tile
        if(tile.y%2==0){
            
            if(Math.sign(dy)==1){            
                if(dx>0)
                    result+="NW"
                if(dx==0)
                    result+="SW"
            }
    
            if(Math.sign(dy)==-1){            
                if(dx>0)
                    result+="NE"
                if(dx==0)
                    result+="SE"
            }
        }else{
            // odd tile
            if(Math.sign(dy)==1){            
                if(dx<0)
                    result+="SW"
                if(dx==0)
                    result+="NW"
            }
            if(Math.sign(dy)==-1){            
                if(dx<0)
                    result+="SE"
                if(dx==0)
                    result+="NE"
            }
        }

        

        if(!result)
            throw new Error(`Invalid arguments ${tile.id} ${dy}, ${dx}`);
        return result;
    }
}
