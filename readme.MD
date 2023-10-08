# hexmap3d Map Component

hexmap3d is a to-be tile game engine. As of today here are ready to use components that can be used for building tile games:

  - MapViewerComponent3JS - ThreeJs powered map view component. Allows for map rendering, navigation and interaction.

## Installation
- Add ThreeJs to the page
- (optional) add ThreeJs GLTF loader (if you plan to handle GLTF assets instead of ThreeJs Json assets)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r124/three.min.js"
        integrity="sha512-jeYvJdyAYkpQCY/omvCYQo89qA5YxDW4JBT7COPsHT2sOAanwxkZRFeP9gc69b5reSDpZIoyCqZQZcWZkbB5Gw=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.124.0/examples/js/loaders/GLTFLoader.js"></script>
<!-- this part MUST be after all global libs like THREE.js-->
<script src="https://cdn.jsdelivr.net/npm/hexmap3d"></script>
```

Then in Javascript initialize MapViewerComponent3JS within given HTMLCanvas element.

```javascript
const mapViewer = await hexmap3d.MapViewerComponent3JS.getInstance(map, mapRenderablesSpecifications, htmlCanvasElement, eventHandler, new THREE.GLTFLoader());
```

Below is more information about preparing all necessary objects like map and renderables specification for map viewer.

## The Map
Ok, let's start with map data. In GNGine map information is separated from 3D assets that are rendered as map tile.


Map data contains 3 key elements:
```typescript
export interface Map {
    specs: MapSpecs,
    tiles?: TileBaseDirected[],
    assets?: AssetReference[]    // all asset references for the assets necessary to render this map
}
```

| Item | Description |
| ------ | ------ |
| `specs` | Stores so called map specification. Map specification defines map size and map kind. Currently two types of maps are supported: HexMaps and QuadMaps |
| `tiles` | Stores all tiles information for map. Each tile has it's x,y location (q,r in hex maps) and also stores information about type of the tile and also stores a link to a 3D renderable asset that will be rendered as map representation of the tile. Also each tile has an unique ```id``` property which is built from it's ```x,y``` properties |
| `assets` | Here it get's tricky. This array contains all ids that allows for unique identification of 3D assets that are necessary for proper rendering of the map. |

Binding between the model representation of tile and it's 3D asset representation (which is called Renderable) is stored in ```tile.r``` property ("r" as renderable). This is a "glue" that controlls how map engine renders given map tile.

In case map requires an asset/renderable and that renderable is not provided to the engine error will be thrown as the map can't render tile correctly without required 3D asset/renderable.

### Map and it's interactions
When correctly initialized and rendered map provides following user interactions:
- showing selection indicator while hovering over mouse. The indicator "snaps" to each of the tiles that are below the cursor.
- rotating and zooming map (with provided rotation controlls) 

<img alt="drawing" width="200" src="https://github.com/yentenobserver/gngine/raw/master/docs/images/docs1.png"/>

- selecting tile (or multiselecting with SHIFT). Each tile or tiles clicked are highlighted with default highlight color.

<img alt="drawing" width="200" src="https://github.com/yentenobserver/gngine/raw/master/docs/images/docs2.png"/>

- navigating (moving) along map by clicking tiles. After each click map pans toward the tile that was clicked and puts it in the center of the view.

- emmiting selection event. Each time user clicks a tile an "interaction:tile:map" is emitted. See events section for more details.

### Map Events

#### `interaction:tile:map`
Here is a sample event object structure when user clicks a tile:
| Item | Description |
| ------ | ------ |
| `type` | Specifies kind of event. For map tile related events value `interaction:tile:map` is used. |
| `click` | Holds tile data of the tile that was clicked (last clicked in case of adding/selecting multiple tiles).|
| `selected` | Array contains all tiles that are multiselected.|
| `data` | Holds threejs objects including the hierarchy of objects from the one hit by click to his parents.|
| `interactingObject` | Holds threejs object that was "selected" with click. Usually this is a renderable representation of the tile that is selected (at least part of it).|
| `operation` | One of `GROUP_ADD` or `ADD`. When the first, single tile is selected then operation is `ADD`, when additional tiles are added (by using multiselect with SHIFT) then operation is `GROUP_ADD` |
| `worldPosition` | Coordinates of the tile position within map's world |

### Map (Specification, tiles and asset references)
Now lets look into more details of how `Map` object is defined.

```typescript
/**
 * Describes ready to render map with all necessary assets' data.
 */
export interface Map {
    specs: MapSpecs, // map basic data
    tiles?: TileBaseDirected[], // tiles specifications
    assets?: AssetReference[]    // all asset references for the assets necessary to render this map
}
```
And here is a sample 2x2 map specification JSON:

```javascript
{
  "specs": {
    "id": "lpj8rhjo0cd",
    "name": "Grunwald battle map",
    "kind": "HexTile",
    "size": "2x2",
    "tags": [
      "historic",
      "medieval",
      "real place",
      "2x2",
      "HexTile"
    ],
    "address": "14-107 Grunwald, Poland",
    "latlon": [
      "53.48669207750804",
      "20.120244784701296"
    ],
    "options": {
      "backgroundImgUrl": "assets/europeelevation.eps.zoom-gr.png"
    }
  },
  "tiles": [
    {
      "id": "0,0",
      "x": "0",
      "y": "0",
      "d": "S",
      "r": "MAS_GRASSLAND_HILLS_TILE",
      "t": {
        "kind": "HILLS"
      }
    },
    {
      "id": "0,1",
      "x": "0",
      "y": "1",
      "d": "S",
      "r": "MAS_GRASSLAND_TILE",
      "t": {
        "kind": "GRASSLANDS"
      }
    },
    {
      "id": "1,0",
      "x": "1",
      "y": "0",
      "d": "S",
      "r": "MAS_FORREST",
      "t": {
        "kind": "PLAINS",
        "modifications": [
          "FORREST"
        ]
      }
    },
    {
      "id": "1,1",
      "x": "1",
      "y": "1",
      "d": "S",
      "r": "MAS_GRASSLAND_TILE",
      "t": {
        "kind": "GRASSLANDS"
      }
    }
  ],
  "assets": [
    {
      "libId": "nof399vbt7",
      "id": "r7mhbbmlfd",
      "vId": "MAS_GRASSLAND_HILLS_TILE"
    },
    {
      "libId": "nof399vbt7",
      "id": "48sqrh3c0zk",
      "vId": "MAS_GRASSLAND_TILE"
    },
    {
      "libId": "nof399vbt7",
      "id": "v7rkecu2gy",
      "vId": "MAS_FORREST"
    }
  ]
}
```

Let's walk through some elements of this file. 

We start with a tile specification. 

```typescript
export interface TileBase {
    id: string, // (col, row) or (q,r) or (x,y)
    x: number, // for quad tiles this is the column, for hex tiles this is also a column aka q
    y: number, // for quad tiles this is the row, for hex tiles this is also a row aka r
    
    t: TileTerrain   // type of tile (terrain)
    r?: string // renderable name representing this tile
}
```

It contain's tile location data in `x,y` coordinates (not real world location). `0,0` is the `upper/north` `left/west` corner. `1,1` is the `lower/south` `right/east` corner.

<img alt="drawing" width="200" src="https://github.com/yentenobserver/gngine/raw/master/docs/images/docs3.png"/>

And here is the json data for tile `(1,0)`:
```typescript
{
  "id": "1,0",
  "x": "1",
  "y": "0",
  "d": "S",
  "r": "MAS_FORREST",
  "t": {
    "kind": "PLAINS",
    "modifications": [
      "FORREST"
    ]
  }
}
```
As one can see it holds tile location (`x=1` `y=0`) and id (`"id": "1,0"`). Also it has terrain information associated with itself:
`"t": {
    "kind": "PLAINS",
    "modifications": [
      "FORREST"
    ]
  }`. So we can see that kind of terrain is `PLAINS` and it has a modification of a `FORREST`.

One can also notice that this tile has rendering information associated also. Key of the renderable object, that will be used to display/render this tile is stored in following property: `"r": "MAS_FORREST"`. 

Map renderer will browse all it's 3D assets in search of a matching asset that is capable of rendering `MAS_FORREST` key.

In this instance the asset that represents `MAS_FORREST` was designed in 3D design program as:

<img width="200" src="https://github.com/yentenobserver/gngine/raw/master/docs/images/docs4.png"/>

And it is rendered on map accordingly:

<img width="200" src="https://github.com/yentenobserver/gngine/raw/master/docs/images/docs5.png"/>

Next we have assets specification:

```javascript
[
    {
      "libId": "nof399vbt7",
      "id": "r7mhbbmlfd",
      "vId": "MAS_GRASSLAND_HILLS_TILE"
    },
    {
      "libId": "nof399vbt7",
      "id": "48sqrh3c0zk",
      "vId": "MAS_GRASSLAND_TILE"
    },
    {
      "libId": "nof399vbt7",
      "id": "v7rkecu2gy",
      "vId": "MAS_FORREST"
    }
  ]
```

As one can notice, there are all keys of tiles used in map with library references of assets (`MAS_GRASSLAND_HILLS_TILE`, `MAS_GRASSLAND_TILE`, `MAS_FORREST`) that should be provided to the MapViewer component as RenderablesSpecification.

## 3D Assets and Renderables

Let's have a look how to prepare 3D assets so the map viewer can render map accordingly.

The key concept is the `RenderableSpecification`. This is a object that holds one or more ThreeJS objects that can be matched to tile data and rendered accordingly. In general the structure of the `RenderableSpecification` has two elements:
- the ThreeJS object or objects in format readable by the provided loader. At the moment ThreeJS Json format and GLTF was tested and works fine, not sure how other formats/loader will behave. Object/objects are stored either in `url` or `json` property.
- hints and tweaks to properly process and "prepare" object/objects. Usually it is necessary to correct scale (by default tile object should fit 1 in size) and to correct pivot point aka center of the object (so usually if object is of 3 width it must be translated -1,5 so the center of the object is at `0,0` of the object). Sometimes it is neccessary to correct ground level or the object files contains more objects than necessary and only objects with certain name should be loaded.

Here is `RenderableSpecification` definition:

```javascript
export interface RenderableSpecification {
    name: string, // just a name
    url?: string, // either url or json should be provided. when url is provided then renderable data will be retrieved from this URL using the loader that was provided
    json?: string, // either url or json should be provided. when json is provided then renderable data is created by parsing JSON specification
    filterByNames?:string[], // array that filters objects either from json or url. only objects matching any of strings in this array will be loaded 
    pivotCorrection?: string, // comma separated x,y,z pivot correction (translates object to this location)
    groundLevel?: number, // in case some different ground level is required
    scaleCorrection?: RenderableSpecificationScale, // usually autoscale to fit 1
    autoPivotCorrection?: boolean // important it is assumed that previous pivot point is in the "lower left (x,y)" position. 
}
```

And here is a real life array of `RenderableSpecification`'s that were used to render our 2x2 map (with removed threejs json representation of 3D objects in each specification):

```javascript
[
  {
    "name": "mapHelpers",
    "json": "threejs json of object, cut out for brevity....",
    "pivotCorrection": "0,0,0.12",
    "scaleCorrection": {
      "autoFitSize": 1
    },
    "filterByNames": [
      "MAP_HLPR_HIGHLIGHT"
    ]
  },
  {
    "name": "_r7mhbbmlfd",
    "json": "threejs json of object, cut out for brevity....",
    "autoPivotCorrection": true,
    "scaleCorrection": {
      "autoFitSize": 1
    },
    "filterByNames": [
      "MAS_"
    ]
  },
  {
    "name": "_48sqrh3c0zk",
    "json": "threejs json of object, cut out for brevity....",
    "autoPivotCorrection": true,
    "scaleCorrection": {
      "autoFitSize": 1
    },
    "filterByNames": [
      "MAS_"
    ]
  },
  {
    "name": "_v7rkecu2gy",
    "json": "threejs json of object, cut out for brevity....",
    "autoPivotCorrection": true,
    "scaleCorrection": {
      "autoFitSize": 1
    },
    "filterByNames": [
      "MAS_"
    ]
  }
]
```

So each asset in json format will be filtered by objects that meet the "MAS_" name criteria and all objects loaded will be corrected in terms of size (making sure that no dimension exceeds 1 and exacly one dimension equals 1 and making pivot autocorrection to position the tile properly in map's 3D world)

### Making 3D assets in 3D editor program

Any program capable of producing 3D files/formats that can be consumed by ThreeJs can be used for asset creation. There are only few rules to follow:

- keep models low poly and small as possible. The map viewer is not optimized for performance yet, so it may be sluggish when larger maps (32x32 or larger) are used. Each tile is an instance of a 3D object so it consumes a lot of memory and processing power.
- make sure, that the tile object consists of a grouping object that holds at least two objects/groups within.
- make sure that there is a separate group/entity that is named `_TILE` and represents the "flat" part of the tile. For instance when I make a `Mountains` tile then i make a hex flat part that is the `_TILE` part and the second group that holds the 3D mountains. The map engine tracks user mouse moves and selection and filters objects in the 3D scene and checks only for collision with objects whose name is `_TILE`. This prevents "hitting" the tile by clicking or hovering over the "high" parts of the tile (this is important for mountains or buildings)
- i have a pattern that assets that i want to load/use in the map have the `MAS_` prefix (as you probably noticed in example json above). Therefore i can store my tiles and some supporting 3D objects in the same file. As a result of name filtering only necessary objects from the file will be used.
- make sure that assets name matches `tile.r` names used in your map. Matching three js object's name into `tile.r` property is a way for finding 3D object that will be rendered for a given tile in the map. So when map specification for a certain tile says that `tile.r: 'MAS_MOUNTAINS'` then we make sure that we provided 3D asset/object in `RenderablesSpecification` that is named `MAS_MOUNTAINS`.

Here is a sample walkthrough of the `MAS_MOUNTAIN` ThreeJS object in Google Sketchup 3D Editor:

The whole tile object name is `MAS_MOUNTAIN` and it's a group that contains two groups:

<img width="400" src="https://github.com/yentenobserver/gngine/raw/master/docs/images/docs6.png"/>

The tile part is a separated child group named `_TILE`:

<img width="400" src="https://github.com/yentenobserver/gngine/raw/master/docs/images/docs7.png"/>

And the child group, that stores "upper" part of the tile and holds actual mountains is named `ITEM`:

<img width="400" src="https://github.com/yentenobserver/gngine/raw/master/docs/images/docs8.png"/>


So this is a generic ThreeJs object structure that i keep in all tile assets:

```javascript
  `MAS_*`
    |--> `ITEM`
    |--> `_TILE`
```

## Troubleshooting

Well ... many can go wrong, here are some most common problems and how to handle them:

- map does not show. check console logs and make sure that all tiles have accompanying assets defined in `RenderableSpecification` passed to the viewer component
- map shows but the asset does not show. This is usually caused either by scale problem (object to large or to small) pivot point problem (ie. somehow center of the object is somewhere far so the object is not placed correctly where it supposed to be placed). In such case please make sure that in `RenderableSpecification` proper corrections are passed - if possible use autosettings i.e. setting `autoPivotCorrection = true` and `scaleCorrection.autoFitSize=1`
- map shows but the asset is somehow misaligned or misplaced. You need to check in your graphics program where is pivot point located (in autopivot correction it is assumed that the pivot point is at local 0,0 of object which is usually bottom lower left point of object) and make sure that the tile 3D object is a valid square (in case of a quad map) oraz a valid hex shape. Make necessary corrections.


## Version History
* 0.2.9 - cleaned dependencies & docs update
* 0.2.7 - initial

