export interface AssetVariantSpecs {        
    fullName: string // variant name, this is used by renderer when selecting renderable for render
    thumbnail: string // variant thumbnail image in data url format
    created: number // creation timestamp
    renderable: string  // json string representation that can be rendered by renderer    
}

export interface AssetSpecs{
    id: string      // unique id
    name: string    // user readable name of asset
    description: string
    kind: "Unit" | "HexTile" | "QuadTile" // kind of asset
    created: number // creation timestamp
    variants: AssetVariantSpecs[]    // variants of the asset
    tags: string[]  // tags associated with asset
}

export interface Asset {
    specs: AssetSpecs,
    variant: AssetVariantSpecs
}


