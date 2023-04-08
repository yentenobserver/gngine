export interface TileBase {
    id: string,
    x: number, // for quad tiles this is the column, for hex tiles this is also a column aka q
    y: number, // for quad tiles this is the row, for hex tiles this is also a row aka r
    
    t: string   // type of tile (terrain)
    r?: string // renderable name representing this tile
}

export interface TileBasePlace extends TileBase {
    loc: {
        n: string // place name
        g: string // place location "lat,lon"  location of tile
    }    
}

export interface TileBaseDirected extends TileBase {
    d: string, // direction of tile
}


export interface TileBaseExtended extends TileBase {
    ext: any // extended TileBase data
}

export interface TileBaseNFT extends TileBase {
    nft: {
        v: number, // current value of tile
        b: string, // blockchain on which nft resides
        i: string, // id of the item in blockchain
        t: string, // last transaction id on blockchain
        o: string, // id of the current owner address on blockchain
    }    
}

export interface TileBaseDefault extends TileBasePlace, TileBaseExtended, TileBaseNFT, TileBaseDirected{}