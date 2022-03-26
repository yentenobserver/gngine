export const Events = {
    UNIT: {
        POSITION: "unit:position", // (unit: SpecBase, whereTo: TileBase)  
        CONSUME_AP: "unit:consume:ap", // (unit:SpecsBase, howMuch: number)
        BATTLE: "unit:battle",// ( attacker:SpecsBase, target:SpecsBase, targetTile: TileBase)
        RUNNER_ACTION: "unit:runner:action", // (unit: SpecsBase, action: ActionBase)
    },
    MAP: {
        FOV: "map:fov", //(fovTiles: TileBase[])
    },
    ENGINE: {
        BATTLE_OUTCOME: "battle:outcome", // (result: BattleOutcome)
    }
    
}