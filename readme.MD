
# Gamengine - browser map game engine

Gamengine is a game engine for games with hex or quad maps.

## Working with HUD View
One of available game playground views is a HUD View. HUD View usually should display map controlls 
and other game information (like details of selected tile or details of selected unit).

Hud View is displayed on top of the game map view and intercepts all user events.

HUD Renderer is responsible renderering HUD View contents. The renderer is using components. Components are displayed in the order as they are registered/added to the HUD View. 

Each Hud Component is an UI interactive element that can display information or handle user interactions.

Following Hud Components are available:
* HudComponentMapNavigationThreeJs - allows rotating and zooming the map

## Working with MapRenderer
Map renderer main task is to render map tiles onto the view. It also provides map indicator helper, that 
allows for selecting map elements within the view.

## Specyfing game map
Map specification is provided in JSON file. Map consists of tiles. Each tile has its id, position and type.

### File structure
```javascript
[
    {
        "id": {string} tile unique id,
        "x": {number} tile x position,
        "y": {number} tile y position,
        "t": {string} tile type (must end with "_TILE" suffix)
    }
]
```

## Specyfying tile assets for rendering 

Following rules must be followed in order to create proper 3D tile assets:
* ```General:``` there can be many tiles in a single file. Each tile must be a Group with name properly set
* ```General:``` each asset's name must start with "ASSET"
* ```General:``` asset's name should match map tile type
* ```Tile Assets:``` each single tile group must have one subgroup which name contains "TILE". Subgroup that contains name "TILE" will be used for tile selection and interactions.
* ```Unit Assets:``` unit asset's name must contain "UNIT"

Sample name & groups structure:
``` 
// here is a forest tile. It's a group that contains two subgroups. One for trees and one for tile.
ASSET_FOREST
-> ASSET_FOREST_TILE
-> ASSET_FOREST_TREES

// here is a building tile. One subgroup is for the tile, second is for the building that is rendered on the tile.
ASSET_BUILDING_1
-> ASSET_TILE
-> ASSET_BUILDING_TOWER


// here is a sample unit. it does not have any subgroups
ASSET_UNIT_WARRIOR_1

```

Following names are restricted and should not be used in groups:
* ```MAP_HLPR_HIGHLIGHT``` - this is a restricted name for a highlight element

