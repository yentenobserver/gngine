
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