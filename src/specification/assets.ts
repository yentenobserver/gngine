/**
 * AssetVariantSpecs specifies what will be rendered and stores also preview thumbnail for the item,
 * that will be rendered. It also holds the recipe for rendering - the renderable property that
 * store data that can be interpreted by the renderer in order to render the AssetVariantSpecs
 */
export interface AssetVariantSpecs {        
    fullName: string // variant name, this is used by renderer when selecting renderable for render
    thumbnail: string // variant thumbnail image in data url format
    created: number // creation timestamp
    renderableJSON: string  // json object representation that can be rendered by renderer, should contain an 3d object which name equals fullName    
}
/**
 * Asset specification - used when managing assets and exporting assets for rendering.
 * Each asset can have multiple variants representing asset state that can be rendered
 * according to given criteria. The renderer actually renders an AssetVariantSpecs not an asset.
 * Asset is a holder that groups multiple variants of an asset
 */
export interface AssetSpecs{
    id: string      // unique id
    name: string    // user readable name of asset
    description: string
    kind: "Unit" | "HexTile" | "QuadTile" // kind of asset
    created: number // creation timestamp
    variants: AssetVariantSpecs[]    // variants of the asset
    tags: string[]  // tags associated with asset
    library?: string // id of the library that contains this asset
}

export interface Asset {
    specs: AssetSpecs,
    variant: AssetVariantSpecs
}
/**
 * This is a lightweight object that stores (usually as a part of a list) all necessary data to uniquely 
 * identyfi Asset. It is a lightweigh version of the Asset object - it stores only refence/id data instead of the whole asset model 
 * that is stored in Asset object.
 */
export interface AssetReference{
    libId: string // asset's library id
    id: string // asset's id (unique within library)
    vId: string // asset's variant id
}

export interface LibraryReference{
    id: string, // id of the library
    name: string, // name of the library
    version?: string, // version of the library
    isPublic?: boolean // when true than library is available to all users
    kind: "Unit" | "HexTile" | "QuadTile" // kind of library assets
}

export interface Library{
    specs: LibraryReference,
    assets: AssetSpecs[]
}