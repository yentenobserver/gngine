import * as THREE from 'three'

/**
 * Represents position in real world (scene) coordinates (x,y,z)
 */
export interface ScenePosition {
    x: number,
    y: number,
    z: number
}
/**
 * Represents position in map tile coordinates (either x,y in quad map or q,r in hex map)
 */
export interface TilePosition {
    
    y: number, // row, r in hex coords
    x: number, // column, q in hex coords
}

export interface CanvasProvider {
    createCanvas(width: number, height: number):any 
}

export class DocumentCanvasContextProvider implements CanvasProvider {
    createCanvas(width: number, height: number):any {
        const canvas = document.createElement( 'canvas' );
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
    static getInstance(){
        const i = new DocumentCanvasContextProvider();
        return i;
    }
    
}

/**
 * Provides translation between scene/world coordinates (pixel on screen/scene) vs map coordinates
 * (either x,y for quad maps or q,r for hex maps)
 */
export interface MapPositionProvider{
    /**
     * Converts TileBase tile position (row, column) into scene coordinates (x,y,z).
     * @see TileBase for more details
     * @param y tile row (aka r for hex tile)
     * @param x tile column (aka q for hex tile)
     */
    yxToScenePosition(y: number, x:number):ScenePosition,
    /**
     * Converts scene coordinates (x,y) into tile position (row, column)
     * @param {number} sceneX scene position.x
     * @param {number} sceneY scene position.y
     */
    scenePositionToYX(sceneX:number,sceneY:number):TilePosition,    
}


export interface OrientationProvider {
    /**
     * It is assumed that object pivot point is at its base center.
     * It is also assumed that by default when loaded/spawned tile is S oriented.
     * Do not use it for rotation - only once when one wants to
     * put tile in proper orientation/direction.
     * @param object 
     * @param direction 
     */
    orientate(object:any, direction:string):void;
}

export enum HexFlatTopDirections {
    N = 'N',
    NE = 'NE',
    NW = 'NW',

    S = 'S',  
    SE = 'SE',
    SW = 'SW'
}

export enum QuadDirections {
    N = "N",
    E = "E",
    W = "W",
    S = "S"
}
/**
 * 
 */
export class HexFlatTopOrientationProviderThreeJs implements OrientationProvider{
    orientate(object:any, direction:string){
        if(![
            HexFlatTopDirections.N.valueOf(),
            HexFlatTopDirections.NE.valueOf(),
            HexFlatTopDirections.NW.valueOf(),
            HexFlatTopDirections.S.valueOf(),
            HexFlatTopDirections.SE.valueOf(),
            HexFlatTopDirections.SW.valueOf(),
        ].includes(direction)){
            throw new Error(`Unsupported direction ${direction} for HexFlatTop orientation.`);
        }
        const object3D = <THREE.Object3D>object;

        // reset rotations
        object3D.quaternion.set(0,0,0,1);

        // objects by default face South (are aligned north->south)
        switch (direction) {
            case HexFlatTopDirections.N:                                                    
                object3D.rotateOnWorldAxis(new THREE.Vector3(0,0,1), THREE.MathUtils.degToRad(-3*60));
              break;
            case HexFlatTopDirections.NE:            
                object3D.rotateOnWorldAxis(new THREE.Vector3(0,0,1), THREE.MathUtils.degToRad(2*60));
              break;
            case HexFlatTopDirections.NW:
            //   object3D.rotateZ(THREE.MathUtils.degToRad(120));            
                object3D.rotateOnWorldAxis(new THREE.Vector3(0,0,1), THREE.MathUtils.degToRad(-2*60));
              break;
            case HexFlatTopDirections.SE:
            //   object3D.rotateZ(THREE.MathUtils.degToRad(60));                            
                object3D.rotateOnWorldAxis(new THREE.Vector3(0,0,1), THREE.MathUtils.degToRad(1*60));
              break;
            case HexFlatTopDirections.SW:
            //   object3D.rotateZ(THREE.MathUtils.degToRad(300));                            
                object3D.rotateOnWorldAxis(new THREE.Vector3(0,0,1), THREE.MathUtils.degToRad(-1*60));
              break;            
            default:
                // default is S south
              break;
        }
    }
}

export class QuadOrientationProviderThreeJs implements OrientationProvider{
    orientate(object:any, direction:string){
        if(![
            QuadDirections.N.valueOf(),
            QuadDirections.E.valueOf(),
            QuadDirections.W.valueOf(),
            QuadDirections.S.valueOf(),
        ].includes(direction)){
            throw new Error(`Unsupported direction ${direction} for Quad orientation.`);
        }
        const object3D = <THREE.Object3D>object;

        // reset rotations
        object3D.quaternion.set(0,0,0,1);

        // objects by default face West (are aligned east->west)
        switch (direction) {
            case QuadDirections.N:                                                       
                object3D.rotateOnWorldAxis(new THREE.Vector3(0,0,1), THREE.MathUtils.degToRad(-4*45));                
              break;
            case QuadDirections.E:            
                object3D.rotateOnWorldAxis(new THREE.Vector3(0,0,1), THREE.MathUtils.degToRad(2*45));
              break;
            case QuadDirections.W:           
                object3D.rotateOnWorldAxis(new THREE.Vector3(0,0,1), THREE.MathUtils.degToRad(-2*45));
              break;            
            default:
                // default is S south
              break;
        }
    }
}

/**
 * Provides set of position convertion between pixel world and map 
 * world (this instance is for hexagonal flat top maps).
 * This provider resuts in odd-q style of map (odd columns are shoved down).
 * Rules:
 * * rows (r) grow along the y axis
 * * cols (q) grow along the x axis
 * * hex(0,0) in map world is centered at (0,0) in pixel world
 */
export class HexFlatTopPositionProviderThreeJs implements MapPositionProvider {
    _width: number;
    _size: number;
    _height: number;

    constructor(hexWidth: number){
        if(!hexWidth)
            throw new Error("hexWidth must be provided for HexFlatTopPositionProviderThreeJs")
        if(hexWidth<=0)
            throw new Error("hexWidth must be positive for HexFlatTopPositionProviderThreeJs")
        this._width = hexWidth;
        this._size = this._width/2;
        this._height = Math.sqrt(3)*this._size;
    }
    yxToScenePosition(_y: number, _x: number): ScenePosition {
        const vector = this._qrToXY(_x,_y);
        return {
            x: vector.x,
            y: vector.y,
            z: 0
        }
    }
    scenePositionToYX(_sceneX: number, _sceneY: number): TilePosition {
        const qr = this._xyToQR(new THREE.Vector2(_sceneX, -_sceneY)); // axial coords , minus as we are against y axis
        const qr_offset = this._axial_to_oddq(qr);
        return {
            y: qr_offset.r,
            x: qr_offset.q
        }
    }



    _xyToQR(point: THREE.Vector2):{q: number, r:number}{
        var q = ( 2./3 * point.x                        ) / this._size
        var r = (-1./3 * point.x  +  Math.sqrt(3)/3 * point.y) / this._size
        // var r = (-1./3 * point.x  -  Math.sqrt(3)/3 * point.y) / this._size

        // console.log(q,r);
        // var r = (1./3 * point.x  -  Math.sqrt(3)/3 * point.y) / this._size
        // return axial_round(Hex(q, r))    
        return {
            q: Math.round(q),
            r: Math.round(r)
        }
    }        

    _qrToXY(q:number, r:number):THREE.Vector2{
        const xCenter = q*this._width*3/4;
        const yCenter = q%2==1?-r*this._height-this._height/2:-r*this._height; // here we go negative in y (map left top hex(0,0) is at 0,0)
        return new THREE.Vector2(xCenter, yCenter);
    }

    // function oddq_offset_to_pixel(hex):
    // var x = size * 3/2 * hex.col
    // var y = size * sqrt(3) * (hex.row + 0.5 * (hex.col&1))
    // return Point(x, y)

    _axial_to_oddq(hex_axial: {q: number, r:number}):{q: number, r:number}{
        var col = hex_axial.q
        var row = hex_axial.r + (hex_axial.q - (hex_axial.q&1)) / 2
        return {
            q: col,
            r: row
        }
    }
    

    _oddq_to_axial(hex: {q: number, r:number}):{q: number, r:number}{
        var q = hex.q
        var r = hex.r - (hex.q - (hex.q&1)) / 2
        return {
            q: q,
            r: r
        }
    }
    
    
}

/**
 * Provides conversion methods for coordinates. Pixel world coordinates and map 
 * coordinates are converted. 
 * 
 * (this instance is for quad maps)
 * * Rules:
 * * rows (y) grow along the y axis
 * * cols (x) grow along the x axis
 * * quad(0,0) in map world is centered at (0,0) in pixel world
 */
export class QuadPositionProviderThreeJs implements MapPositionProvider {
    tileSize: number;
    width: number;
    height: number;

    constructor(width:number, height:number, tileSize:number){
        if(!width)
            throw new Error("width must be provided for QuadPositionProviderThreeJs")
        if(width<=0)
            throw new Error("width must be positive for QuadPositionProviderThreeJs")
        if(height<=0)
            throw new Error("height must be positive for QuadPositionProviderThreeJs")            
        if(!height)
            throw new Error("height must be provided for QuadPositionProviderThreeJs")                        
        if(tileSize<=0)
            throw new Error("tileSize must be positive for QuadPositionProviderThreeJs")                        
        if(!tileSize)
            throw new Error("tileSize must be provided for QuadPositionProviderThreeJs")                        
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
    }
    /**
     * Converts tile coordinates (y - row, x-column) into scene x,y,z position
     * It is assumed that tile pivot point is at its base (x,y) center
     * @param y tile row
     * @param x tile column
     * @returns {x: number, y: number, z: number} position
     */
    yxToScenePosition(y: number, x:number){
        // const originTilePosition = {
        //     x: this._width/2+1,
        //     y: this._height/2
        // }

        // const _normalizedWidth = this.width/this.tileSize;
        // const _normalizedHeight = this.height/this.tileSize

        // const position = {
        //     x: x-_normalizedWidth/2+this.tileSize/2,
        //     y: (y-_normalizedHeight/2)<0?Math.abs(y-_normalizedHeight/2)-this.tileSize/2:-Math.abs(y-_normalizedHeight/2)-this.tileSize/2,
        //     z: 0
        // }
        // // console.log(x,y,position);
        // return position;
        
        // 33,31 -> 0,-1,
        const position = {
            x: this.tileSize*x,
            y: -this.tileSize*y,// here we go negative in y (map left top quad(0,0) is at 0,0)
            z: 0
        }

        return position;

    }
    /**
     * Translates actual scene position (x,y) into map tile position (y,x)
     * @param sceneX scene x position
     * @param sceneY scene y position
     * @returns (y,x) tile position (row, column)
     */
    scenePositionToYX(sceneX:number,sceneY:number){  
        
        // const _tilesCountY = this.height/this.tileSize
        
        // const normSceneX = sceneX+this.width/2;
        // const normSceneY = sceneY+this.height/2;

        // const tileX = Math.floor(normSceneX);
        // const tileY =  Math.floor(_tilesCountY-normSceneY);

        // const position = {
        //     y:tileY,
        //     x: tileX
        // }
        // return position;

        const position = {
            y: -Math.ceil(sceneY/this.tileSize-this.tileSize/2),
            x: Math.ceil(sceneX/this.tileSize-this.tileSize/2)
        }
        return position;
    }
}