export const TerrainMocks = {
    terrain_1: {
        MOUNTAINS: 3,
        HILLS: 2,
        PLAINS: 1,
        RIVER: 2,
        IMPASSABLE: Number.MAX_SAFE_INTEGER
    }
}
// map tiles ids are (y,x)
export const MapsMocks = {
    map_6x5: [
        {id: "0,0", y:0, x:0, t: { kind: "PLAINS" } },
        {id: "0,1", y:0, x:1, t: { kind: "PLAINS" } },
        {id: "0,2", y:0, x:2, t: { kind: "PLAINS" } },
        {id: "0,3", y:0, x:3, t: { kind: "PLAINS" } },
        {id: "0,4", y:0, x:4, t: { kind: "PLAINS" } },
        
        {id: "1,0", y:1, x:0, t: { kind: "PLAINS" } },
        {id: "1,1", y:1, x:1, t: { kind: "PLAINS" } },
        {id: "1,2", y:1, x:2, t: { kind: "PLAINS" } },
        {id: "1,3", y:1, x:3, t: { kind: "PLAINS" } },
        {id: "1,4", y:1, x:4, t: { kind: "PLAINS" } },

        {id: "2,0", y:2, x:0, t: { kind: "PLAINS" } },
        {id: "2,1", y:2, x:1, t: { kind: "PLAINS" } },
        {id: "2,2", y:2, x:2, t: { kind: "PLAINS" } },
        {id: "2,3", y:2, x:3, t: { kind: "PLAINS" } },
        {id: "2,4", y:2, x:4, t: { kind: "PLAINS" } },

        {id: "3,0", y:3, x:0, t: { kind: "PLAINS" } },
        {id: "3,1", y:3, x:1, t: { kind: "PLAINS" } },
        {id: "3,2", y:3, x:2, t: { kind: "PLAINS" } },
        {id: "3,3", y:3, x:3, t: { kind: "PLAINS" } },
        {id: "3,4", y:3, x:4, t: { kind: "PLAINS" } },

        {id: "4,0", y:4, x:0, t: { kind: "PLAINS" } },
        {id: "4,1", y:4, x:1, t: { kind: "PLAINS" } },
        {id: "4,2", y:4, x:2, t: { kind: "PLAINS" } },
        {id: "4,3", y:4, x:3, t: { kind: "PLAINS" } },
        {id: "4,4", y:4, x:4, t: { kind: "PLAINS" } },
        
        {id: "5,0", y:5, x:0, t: { kind: "PLAINS" } },
        {id: "5,1", y:5, x:1, t: { kind: "PLAINS" } },
        {id: "5,2", y:5, x:2, t: { kind: "PLAINS" } },
        {id: "5,3", y:5, x:3, t: { kind: "PLAINS" } },
        {id: "5,4", y:5, x:4, t: { kind: "PLAINS" } },
        
    ],
    map_6x5_terrain: [
        {id: "0,0", y:0, x:0, t: { kind: "PLAINS" } },
        {id: "0,1", y:0, x:1, t: { kind: "PLAINS" } },
        {id: "0,2", y:0, x:2, t: { kind: "PLAINS" } },
        {id: "0,3", y:0, x:3, t: { kind: "PLAINS" } },
        {id: "0,4", y:0, x:4, t: { kind: "PLAINS" } },
        
        {id: "1,0", y:1, x:0, t: { kind: "MOUNTAINS" } },
        {id: "1,1", y:1, x:1, t: { kind: "MOUNTAINS" } },
        {id: "1,2", y:1, x:2, t: { kind: "MOUNTAINS" } },
        {id: "1,3", y:1, x:3, t: { kind: "MOUNTAINS" } },
        {id: "1,4", y:1, x:4, t: { kind: "PLAINS" } },

        {id: "2,0", y:2, x:0, t: { kind: "MOUNTAINS" } },
        {id: "2,1", y:2, x:1, t: { kind: "MOUNTAINS" } },
        {id: "2,2", y:2, x:2, t: { kind: "MOUNTAINS" } },
        {id: "2,3", y:2, x:3, t: { kind: "MOUNTAINS" } },
        {id: "2,4", y:2, x:4, t: { kind: "PLAINS" } },

        {id: "3,0", y:3, x:0, t: { kind: "MOUNTAINS" } },
        {id: "3,1", y:3, x:1, t: { kind: "MOUNTAINS" } },
        {id: "3,2", y:3, x:2, t: { kind: "MOUNTAINS" } },
        {id: "3,3", y:3, x:3, t: { kind: "MOUNTAINS" } },
        {id: "3,4", y:3, x:4, t: { kind: "PLAINS" } },

        {id: "4,0", y:4, x:0, t: { kind: "MOUNTAINS" } },
        {id: "4,1", y:4, x:1, t: { kind: "MOUNTAINS" } },
        {id: "4,2", y:4, x:2, t: { kind: "MOUNTAINS" } },
        {id: "4,3", y:4, x:3, t: { kind: "MOUNTAINS" } },
        {id: "4,4", y:4, x:4, t: { kind: "PLAINS" } },
        
        {id: "5,0", y:5, x:0, t: { kind: "MOUNTAINS" } },
        {id: "5,1", y:5, x:1, t: { kind: "MOUNTAINS" } },
        {id: "5,2", y:5, x:2, t: { kind: "MOUNTAINS" } },
        {id: "5,3", y:5, x:3, t: { kind: "MOUNTAINS" } },
        {id: "5,4", y:5, x:4, t: { kind: "PLAINS" } },
        
    ],
    map_6x5_terrain_heavy: [
        {id: "0,0", y:0, x:0, t: { kind: "PLAINS" } },
        {id: "0,1", y:0, x:1, t: { kind: "PLAINS" } },
        {id: "0,2", y:0, x:2, t: { kind: "PLAINS" } },
        {id: "0,3", y:0, x:3, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "0,4", y:0, x:4, t: { kind: "PLAINS" } },
        
        {id: "1,0", y:1, x:0, t: { kind: "PLAINS" } },
        {id: "1,1", y:1, x:1, t: { kind: "PLAINS" } },
        {id: "1,2", y:1, x:2, t: { kind: "PLAINS" } },
        {id: "1,3", y:1, x:3, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "1,4", y:1, x:4, t: { kind: "PLAINS" } },

        {id: "2,0", y:2, x:0, t: { kind: "MOUNTAINS" } },
        {id: "2,1", y:2, x:1, t: { kind: "MOUNTAINS" } },
        {id: "2,2", y:2, x:2, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "2,3", y:2, x:3, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "2,4", y:2, x:4, t: { kind: "MOUNTAINS" } },

        {id: "3,0", y:3, x:0, t: { kind: "MOUNTAINS" } },
        {id: "3,1", y:3, x:1, t: { kind: "MOUNTAINS" } },
        {id: "3,2", y:3, x:2, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "3,3", y:3, x:3, t: { kind: "MOUNTAINS" } },
        {id: "3,4", y:3, x:4, t: { kind: "MOUNTAINS" } },

        {id: "4,0", y:4, x:0, t: { kind: "MOUNTAINS" } },
        {id: "4,1", y:4, x:1, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "4,2", y:4, x:2, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "4,3", y:4, x:3, t: { kind: "MOUNTAINS" } },
        {id: "4,4", y:4, x:4, t: { kind: "MOUNTAINS" } },
        
        {id: "5,0", y:5, x:0, t: { kind: "PLAINS" } },
        {id: "5,1", y:5, x:1, t: { kind: "PLAINS" } },
        {id: "5,2", y:5, x:2, t: { kind: "PLAINS" } },
        {id: "5,3", y:5, x:3, t: { kind: "PLAINS" } },
        {id: "5,4", y:5, x:4, t: { kind: "PLAINS" } },
        
    ],
    map_6x5_terrain_no_path: [
        {id: "0,0", y:0, x:0, t: { kind: "PLAINS" } },
        {id: "0,1", y:0, x:1, t: { kind: "PLAINS" } },
        {id: "0,2", y:0, x:2, t: { kind: "PLAINS" } },
        {id: "0,3", y:0, x:3, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "0,4", y:0, x:4, t: { kind: "PLAINS" } },
        
        {id: "1,0", y:1, x:0, t: { kind: "PLAINS" } },
        {id: "1,1", y:1, x:1, t: { kind: "PLAINS" } },
        {id: "1,2", y:1, x:2, t: { kind: "PLAINS" } },
        {id: "1,3", y:1, x:3, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "1,4", y:1, x:4, t: { kind: "PLAINS" } },

        {id: "2,0", y:2, x:0, t: { kind: "MOUNTAINS" } },
        {id: "2,1", y:2, x:1, t: { kind: "MOUNTAINS" } },
        {id: "2,2", y:2, x:2, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "2,3", y:2, x:3, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "2,4", y:2, x:4, t: { kind: "MOUNTAINS" } },

        {id: "3,0", y:3, x:0, t: { kind: "MOUNTAINS" } },
        {id: "3,1", y:3, x:1, t: { kind: "MOUNTAINS" } },
        {id: "3,2", y:3, x:2, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "3,3", y:3, x:3, t: { kind: "MOUNTAINS" } },
        {id: "3,4", y:3, x:4, t: { kind: "MOUNTAINS" } },

        {id: "4,0", y:4, x:0, t: { kind: "MOUNTAINS" } },
        {id: "4,1", y:4, x:1, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "4,2", y:4, x:2, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "4,3", y:4, x:3, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "4,4", y:4, x:4, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        
        {id: "5,0", y:5, x:0, t: { kind: "PLAINS" } },
        {id: "5,1", y:5, x:1, t: { kind: "PLAINS" } },
        {id: "5,2", y:5, x:2, t: { kind: "PLAINS" } },
        {id: "5,3", y:5, x:3, t: { kind: "PLAINS", modifications: ["IMPASSABLE"]} },
        {id: "5,4", y:5, x:4, t: { kind: "PLAINS" } },
        
    ],
    map_5x6: [
        {id: "0,0", y:0, x:0, t: { kind: "PLAINS" } },
        {id: "0,1", y:0, x:1, t: { kind: "PLAINS" } },
        {id: "0,2", y:0, x:2, t: { kind: "PLAINS" } },
        {id: "0,3", y:0, x:3, t: { kind: "PLAINS" } },
        {id: "0,4", y:0, x:4, t: { kind: "PLAINS" } },
        {id: "0,5", y:0, x:5, t: { kind: "PLAINS" } },
        
        {id: "1,0", y:1, x:0, t: { kind: "PLAINS" } },
        {id: "1,1", y:1, x:1, t: { kind: "PLAINS" } },
        {id: "1,2", y:1, x:2, t: { kind: "PLAINS" } },
        {id: "1,3", y:1, x:3, t: { kind: "PLAINS" } },
        {id: "1,4", y:1, x:4, t: { kind: "PLAINS" } },
        {id: "1,5", y:1, x:5, t: { kind: "PLAINS" } },

        {id: "2,0", y:2, x:0, t: { kind: "PLAINS" } },
        {id: "2,1", y:2, x:1, t: { kind: "PLAINS" } },
        {id: "2,2", y:2, x:2, t: { kind: "PLAINS" } },
        {id: "2,3", y:2, x:3, t: { kind: "PLAINS" } },
        {id: "2,4", y:2, x:4, t: { kind: "PLAINS" } },
        {id: "2,5", y:2, x:5, t: { kind: "PLAINS" } },

        {id: "3,0", y:3, x:0, t: { kind: "PLAINS" } },
        {id: "3,1", y:3, x:1, t: { kind: "PLAINS" } },
        {id: "3,2", y:3, x:2, t: { kind: "PLAINS" } },
        {id: "3,3", y:3, x:3, t: { kind: "PLAINS" } },
        {id: "3,4", y:3, x:4, t: { kind: "PLAINS" } },
        {id: "3,5", y:3, x:5, t: { kind: "PLAINS" } },

        {id: "4,0", y:4, x:0, t: { kind: "PLAINS" } },
        {id: "4,1", y:4, x:1, t: { kind: "PLAINS" } },
        {id: "4,2", y:4, x:2, t: { kind: "PLAINS" } },
        {id: "4,3", y:4, x:3, t: { kind: "PLAINS" } },
        {id: "4,4", y:4, x:4, t: { kind: "PLAINS" } },
        {id: "4,5", y:4, x:5, t: { kind: "PLAINS" } },
        
        
    ]  
    
}

export const AppEventsMocks = {
    interaction_tile_1_move: {
        type: "interaction:tile",
        data: {
            hierarchy: [
                {
                    userData: {                                               
                    }
                },
                {
                    userData: {
                        tileData: {
                            "id": "0,2",
                            "x": 2,
                            "y": 0,
                            "d": "S",
                            "t": "C_T_GRASS_1_TILE",
                            "loc": {
                                "n": "Grassland",
                                "g": "43.74650403587078,7.421766928360976"
                            },
                            "ext": {},
                            "nft": {
                                "v": 100,
                                "b": "ETHEREUM",
                                "i": "123",
                                "t": "0x123",
                                "o": "0x0022"
                            }
                        }                        
                    }
                }
            ]
        },
        originalEvent: {
            type: "pointermove"
        }
    },
    interaction_tile_2_click: {
        type: "interaction:tile",
        data: {
            hierarchy: [
                {
                    userData: {
                        tileData: {
                            "id": "0,2",
                            "x": 2,
                            "y": 0,
                            "d": "S",
                            "t": "C_T_GRASS_1_TILE",
                            "loc": {
                                "n": "Grassland",
                                "g": "43.74650403587078,7.421766928360976"
                            },
                            "ext": {},
                            "nft": {
                                "v": 100,
                                "b": "ETHEREUM",
                                "i": "123",
                                "t": "0x123",
                                "o": "0x0022"
                            }
                        }                        
                    }
                }
            ]
        },
        originalEvent: {
            type: "pointerdown"
        }
    },
    interaction_hud_1_click_left: {
        type: "interaction:hud",
        data: {
            hierarchy: [
                {
                    name: "LEFT"
                }
            ]
        },
        originalEvent: {
            type: "pointerdown"
        }
    },
    interaction_hud_2_click_right: {
        type: "interaction:hud",
        data: {
            hierarchy: [
                {
                    name: "RIGHT"
                }
            ]
        },
        originalEvent: {
            type: "pointerdown"
        }
    },
    interaction_hud_3_move: {
        type: "interaction:hud",
        data: {
            hierarchy: [
                {
                    name: "LEFT"
                }
            ]
        },
        originalEvent: {
            type: "pointermove"
        }
    },
    interaction_hud_4_click_up: {
        type: "interaction:hud",
        data: {
            hierarchy: [
                {
                    name: "UP"
                }
            ]
        },
        originalEvent: {
            type: "pointerdown"
        }
    },
    interaction_hud_5_click_down: {
        type: "interaction:hud",
        data: {
            hierarchy: [
                {
                    name: "DOWN"
                }
            ]
        },
        originalEvent: {
            type: "pointerdown"
        }
    },
}

export const MapEventMocks = {
    
    rotate_left: {
        type: "map:rotate",
        direction: "LEFT"
    },
    rotate_right: {
        type: "map:rotate",
        direction: "RIGHT"
    },
    zoom_in: {
        type: "map:zoom",
        direction: "IN"
    },
    zoom_out: {
        type: "map:zoom",
        direction: "OUT"
    }
}

export const ActionsMock = {
    action1: {
        emitter: <any>{},
        code: "ActionMove",
        rangeAndCosts(){return <any>{}},
        perform(_context:any){}
    }
}

export const UnitsMocks = {
    unit1: {
        actionPoints: 10,
        actionRunner: undefined,
        actionsAllowed: [],
        actionsQueue: [],
        attackStrength: (_unit:any)=>{ return 1},
        defendStrength: (_unit:any)=>{ return 1},
        gainBattleExperience: ()=>{},
        hitPoints: 10,
        rangeStrength: 10,
        strength: 10,
        sight: 2,
        uid: "",
        flag: "#ffffff",
        unitSpecification: {
            hitPoints: 10,
            name: "Type",
            tuid: "T_1"
        }
    },
    unit2: {
        actionPoints: 10,
        actionRunner: undefined,
        actionsAllowed: [],
        actionsQueue: [],
        attackStrength: (_unit:any)=>{ return 1},
        defendStrength: (_unit:any)=>{ return 1},
        gainBattleExperience: ()=>{},
        hitPoints: 1,
        rangeStrength: 10,
        strength: 10,
        sight: 2,
        uid: "",
        flag: "#ffffff",
        unitSpecification: {
            hitPoints: 10,
            name: "Type",
            tuid: "T_1"
        }
    },
    unit3: {
        actionPoints: 1,
        actionRunner: ActionsMock.action1,
        actionsAllowed: [],
        actionsQueue: [],
        attackStrength: (_unit:any)=>{ return 1},
        defendStrength: (_unit:any)=>{ return 1},
        gainBattleExperience: ()=>{},
        hitPoints: 1,
        rangeStrength: 10,
        strength: 10,
        sight: 2,
        uid: "",
        flag: "#ffffff",
        unitSpecification: {
            hitPoints: 10,
            name: "Type",
            tuid: "T_1"
        }
    },
    unit4: {
        actionPoints: 1,
        actionRunner: ActionsMock.action1,
        actionsAllowed: [],
        actionsQueue: [],
        attackStrength: (_unit:any)=>{ return 1},
        defendStrength: (_unit:any)=>{ return 1},
        gainBattleExperience: ()=>{},
        hitPoints: 1,
        rangeStrength: 10,
        strength: 10,
        sight: 2,
        uid: "",
        flag: "#ffffff",
        unitSpecification: {
            hitPoints: 10,
            name: "Type",
            tuid: "T34"
        }
    }
}