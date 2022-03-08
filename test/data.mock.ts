export const TerrainMocks = {
    terrain_1: {
        MOUNTAIN: 3,
        HILL: 2,
        PLAIN: 1,
        RIVER: 2,
        IMPASSABLE: Number.MAX_SAFE_INTEGER
    }
}
// map tiles ids are (y,x)
export const MapsMocks = {
    map_6x5: [
        {id: "0,0", y:0, x:0, t:"PLAIN" },
        {id: "0,1", y:0, x:1, t:"PLAIN" },
        {id: "0,2", y:0, x:2, t:"PLAIN" },
        {id: "0,3", y:0, x:3, t:"PLAIN" },
        {id: "0,4", y:0, x:4, t:"PLAIN" },
        
        {id: "1,0", y:1, x:0, t:"PLAIN" },
        {id: "1,1", y:1, x:1, t:"PLAIN" },
        {id: "1,2", y:1, x:2, t:"PLAIN" },
        {id: "1,3", y:1, x:3, t:"PLAIN" },
        {id: "1,4", y:1, x:4, t:"PLAIN" },

        {id: "2,0", y:2, x:0, t:"PLAIN" },
        {id: "2,1", y:2, x:1, t:"PLAIN" },
        {id: "2,2", y:2, x:2, t:"PLAIN" },
        {id: "2,3", y:2, x:3, t:"PLAIN" },
        {id: "2,4", y:2, x:4, t:"PLAIN" },

        {id: "3,0", y:3, x:0, t:"PLAIN" },
        {id: "3,1", y:3, x:1, t:"PLAIN" },
        {id: "3,2", y:3, x:2, t:"PLAIN" },
        {id: "3,3", y:3, x:3, t:"PLAIN" },
        {id: "3,4", y:3, x:4, t:"PLAIN" },

        {id: "4,0", y:4, x:0, t:"PLAIN" },
        {id: "4,1", y:4, x:1, t:"PLAIN" },
        {id: "4,2", y:4, x:2, t:"PLAIN" },
        {id: "4,3", y:4, x:3, t:"PLAIN" },
        {id: "4,4", y:4, x:4, t:"PLAIN" },
        
        {id: "5,0", y:5, x:0, t:"PLAIN" },
        {id: "5,1", y:5, x:1, t:"PLAIN" },
        {id: "5,2", y:5, x:2, t:"PLAIN" },
        {id: "5,3", y:5, x:3, t:"PLAIN" },
        {id: "5,4", y:5, x:4, t:"PLAIN" },
        
    ],
    map_6x5_terrain: [
        {id: "0,0", y:0, x:0, t:"PLAIN" },
        {id: "0,1", y:0, x:1, t:"PLAIN" },
        {id: "0,2", y:0, x:2, t:"PLAIN" },
        {id: "0,3", y:0, x:3, t:"PLAIN" },
        {id: "0,4", y:0, x:4, t:"PLAIN" },
        
        {id: "1,0", y:1, x:0, t:"MOUNTAIN" },
        {id: "1,1", y:1, x:1, t:"MOUNTAIN" },
        {id: "1,2", y:1, x:2, t:"MOUNTAIN" },
        {id: "1,3", y:1, x:3, t:"MOUNTAIN" },
        {id: "1,4", y:1, x:4, t:"PLAIN" },

        {id: "2,0", y:2, x:0, t:"MOUNTAIN" },
        {id: "2,1", y:2, x:1, t:"MOUNTAIN" },
        {id: "2,2", y:2, x:2, t:"MOUNTAIN" },
        {id: "2,3", y:2, x:3, t:"MOUNTAIN" },
        {id: "2,4", y:2, x:4, t:"PLAIN" },

        {id: "3,0", y:3, x:0, t:"MOUNTAIN" },
        {id: "3,1", y:3, x:1, t:"MOUNTAIN" },
        {id: "3,2", y:3, x:2, t:"MOUNTAIN" },
        {id: "3,3", y:3, x:3, t:"MOUNTAIN" },
        {id: "3,4", y:3, x:4, t:"PLAIN" },

        {id: "4,0", y:4, x:0, t:"MOUNTAIN" },
        {id: "4,1", y:4, x:1, t:"MOUNTAIN" },
        {id: "4,2", y:4, x:2, t:"MOUNTAIN" },
        {id: "4,3", y:4, x:3, t:"MOUNTAIN" },
        {id: "4,4", y:4, x:4, t:"PLAIN" },
        
        {id: "5,0", y:5, x:0, t:"MOUNTAIN" },
        {id: "5,1", y:5, x:1, t:"MOUNTAIN" },
        {id: "5,2", y:5, x:2, t:"MOUNTAIN" },
        {id: "5,3", y:5, x:3, t:"MOUNTAIN" },
        {id: "5,4", y:5, x:4, t:"PLAIN" },
        
    ],
    map_6x5_terrain_heavy: [
        {id: "0,0", y:0, x:0, t:"PLAIN" },
        {id: "0,1", y:0, x:1, t:"PLAIN" },
        {id: "0,2", y:0, x:2, t:"PLAIN" },
        {id: "0,3", y:0, x:3, t:"IMPASSABLE" },
        {id: "0,4", y:0, x:4, t:"PLAIN" },
        
        {id: "1,0", y:1, x:0, t:"PLAIN" },
        {id: "1,1", y:1, x:1, t:"PLAIN" },
        {id: "1,2", y:1, x:2, t:"PLAIN" },
        {id: "1,3", y:1, x:3, t:"IMPASSABLE" },
        {id: "1,4", y:1, x:4, t:"PLAIN" },

        {id: "2,0", y:2, x:0, t:"MOUNTAIN" },
        {id: "2,1", y:2, x:1, t:"MOUNTAIN" },
        {id: "2,2", y:2, x:2, t:"IMPASSABLE" },
        {id: "2,3", y:2, x:3, t:"IMPASSABLE" },
        {id: "2,4", y:2, x:4, t:"MOUNTAIN" },

        {id: "3,0", y:3, x:0, t:"MOUNTAIN" },
        {id: "3,1", y:3, x:1, t:"MOUNTAIN" },
        {id: "3,2", y:3, x:2, t:"IMPASSABLE" },
        {id: "3,3", y:3, x:3, t:"MOUNTAIN" },
        {id: "3,4", y:3, x:4, t:"MOUNTAIN" },

        {id: "4,0", y:4, x:0, t:"MOUNTAIN" },
        {id: "4,1", y:4, x:1, t:"IMPASSABLE" },
        {id: "4,2", y:4, x:2, t:"IMPASSABLE" },
        {id: "4,3", y:4, x:3, t:"MOUNTAIN" },
        {id: "4,4", y:4, x:4, t:"MOUNTAIN" },
        
        {id: "5,0", y:5, x:0, t:"PLAIN" },
        {id: "5,1", y:5, x:1, t:"PLAIN" },
        {id: "5,2", y:5, x:2, t:"PLAIN" },
        {id: "5,3", y:5, x:3, t:"PLAIN" },
        {id: "5,4", y:5, x:4, t:"PLAIN" },
        
    ],
    map_6x5_terrain_no_path: [
        {id: "0,0", y:0, x:0, t:"PLAIN" },
        {id: "0,1", y:0, x:1, t:"PLAIN" },
        {id: "0,2", y:0, x:2, t:"PLAIN" },
        {id: "0,3", y:0, x:3, t:"IMPASSABLE" },
        {id: "0,4", y:0, x:4, t:"PLAIN" },
        
        {id: "1,0", y:1, x:0, t:"PLAIN" },
        {id: "1,1", y:1, x:1, t:"PLAIN" },
        {id: "1,2", y:1, x:2, t:"PLAIN" },
        {id: "1,3", y:1, x:3, t:"IMPASSABLE" },
        {id: "1,4", y:1, x:4, t:"PLAIN" },

        {id: "2,0", y:2, x:0, t:"MOUNTAIN" },
        {id: "2,1", y:2, x:1, t:"MOUNTAIN" },
        {id: "2,2", y:2, x:2, t:"IMPASSABLE" },
        {id: "2,3", y:2, x:3, t:"IMPASSABLE" },
        {id: "2,4", y:2, x:4, t:"MOUNTAIN" },

        {id: "3,0", y:3, x:0, t:"MOUNTAIN" },
        {id: "3,1", y:3, x:1, t:"MOUNTAIN" },
        {id: "3,2", y:3, x:2, t:"IMPASSABLE" },
        {id: "3,3", y:3, x:3, t:"MOUNTAIN" },
        {id: "3,4", y:3, x:4, t:"MOUNTAIN" },

        {id: "4,0", y:4, x:0, t:"MOUNTAIN" },
        {id: "4,1", y:4, x:1, t:"IMPASSABLE" },
        {id: "4,2", y:4, x:2, t:"IMPASSABLE" },
        {id: "4,3", y:4, x:3, t:"IMPASSABLE" },
        {id: "4,4", y:4, x:4, t:"IMPASSABLE" },
        
        {id: "5,0", y:5, x:0, t:"PLAIN" },
        {id: "5,1", y:5, x:1, t:"PLAIN" },
        {id: "5,2", y:5, x:2, t:"PLAIN" },
        {id: "5,3", y:5, x:3, t:"IMPASSABLE" },
        {id: "5,4", y:5, x:4, t:"PLAIN" },
        
    ],
    map_5x6: [
        {id: "0,0", y:0, x:0, t:"PLAIN" },
        {id: "0,1", y:0, x:1, t:"PLAIN" },
        {id: "0,2", y:0, x:2, t:"PLAIN" },
        {id: "0,3", y:0, x:3, t:"PLAIN" },
        {id: "0,4", y:0, x:4, t:"PLAIN" },
        {id: "0,5", y:0, x:5, t:"PLAIN" },
        
        {id: "1,0", y:1, x:0, t:"PLAIN" },
        {id: "1,1", y:1, x:1, t:"PLAIN" },
        {id: "1,2", y:1, x:2, t:"PLAIN" },
        {id: "1,3", y:1, x:3, t:"PLAIN" },
        {id: "1,4", y:1, x:4, t:"PLAIN" },
        {id: "1,5", y:1, x:5, t:"PLAIN" },

        {id: "2,0", y:2, x:0, t:"PLAIN" },
        {id: "2,1", y:2, x:1, t:"PLAIN" },
        {id: "2,2", y:2, x:2, t:"PLAIN" },
        {id: "2,3", y:2, x:3, t:"PLAIN" },
        {id: "2,4", y:2, x:4, t:"PLAIN" },
        {id: "2,5", y:2, x:5, t:"PLAIN" },

        {id: "3,0", y:3, x:0, t:"PLAIN" },
        {id: "3,1", y:3, x:1, t:"PLAIN" },
        {id: "3,2", y:3, x:2, t:"PLAIN" },
        {id: "3,3", y:3, x:3, t:"PLAIN" },
        {id: "3,4", y:3, x:4, t:"PLAIN" },
        {id: "3,5", y:3, x:5, t:"PLAIN" },

        {id: "4,0", y:4, x:0, t:"PLAIN" },
        {id: "4,1", y:4, x:1, t:"PLAIN" },
        {id: "4,2", y:4, x:2, t:"PLAIN" },
        {id: "4,3", y:4, x:3, t:"PLAIN" },
        {id: "4,4", y:4, x:4, t:"PLAIN" },
        {id: "4,5", y:4, x:5, t:"PLAIN" },
        
        
    ]  
    
}