export interface AssetVariantSpecs {        
    fullName: string // variant name
    thumbnail: string // variant thumbnail image in data url format
    created: number // creation timestamp
    renderableJSON: string  // json representation that can be rendered by renderer    
}

export interface AssetSpecs{
    id: string      // unique id
    name: string    // user readable name of asset
    kind: "Unit" | "HexTile" | "QuadTile" // kind of asset
    created: number // creation timestamp
    variants: AssetVariantSpecs[]    // variants of the asset
    tags: string[]  // tags associated with asset
}


