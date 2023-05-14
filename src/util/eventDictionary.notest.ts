export const Events = {
    UNIT: {
        POSITION: "unit:position", // (unit: SpecBase, whereTo: TileBase)  
        CONSUME_AP: "unit:consume:ap", // (unit:SpecsBase, howMuch: number)
        BATTLE: "unit:battle",// ( attacker:SpecsBase, target:SpecsBase, targetTile: TileBase)
        RUNNER_ACTION: "unit:runner:action", // (unit: SpecsBase, action: ActionBase)
    },
    MAP: {
        FOV: "map:fov", //(fovTiles: TileBase[])
        ROTATE: "map:rotate", //(event: MapRotateEvent)
        ZOOM: "map:zoom", //(event: MapZoomEvent)
    },
    ENGINE: {
        BATTLE_OUTCOME: "battle:outcome", // (result: BattleOutcome)
    },
    INTERACTIONS: {
        UNIT: "interaction:unit", // (event: PlaygroundInteractionEvent)
        TILE: "interaction:tile", // (event: PlaygroundInteractionEvent)
        HUD: "interaction:hud", // (event: PlaygroundInteractionEvent)
        NON_CLASSIFIED: "interaction:noclassified", // ()
        MAP: {
            TILE: "interaction:tile:map", // (event: TileInteractionEvent)
        }
    },
    DEBUG: {
        DUMP_VIEW: "debug:dump:view",        
    },
    PLAYGROUND: {
        SCREENSHOT: "playground:screenshot", // (id: string) - request playground screenshot on next render cycle, when result is returned also id is returned
        SCREENSHOT_RESULT: "playground:screenshot:data", // (id: string, screenshotDataUrl:string) - result (image) taken from playground with its id
    }
    
}