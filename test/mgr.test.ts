// import chai, { assert } from 'chai'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'


chai.should();
chai.use(chaiAsPromised);

// const assert = chai.assert;

const expect = chai.expect;

// Sinon is a library used for mocking or verifying function calls in JavaScript.
import sinon, { SinonSpy, SinonStub } from 'sinon';


import * as THREE from 'three'
import {TileBase} from '../src/logic/map/common.notest'
import {MapBase, MapHexOddQ, MapSquare, Neighbour, Path, Paths,} from '../src/logic/map/map'
import {MapsMocks, TerrainMocks} from './data.mock'
import {CostCalculator, CostCalculatorConst, CostCalculatorTerrain} from "../src/logic/map/costs"
import {ActionContextUnitAttack, ActionContextUnitMove, ActionUnitAttack, ActionUnitFortify, ActionUnitLandFieldOfView, ActionUnitMove} from "../src/logic/units/actions/action"
import { SpecsBase, SpecsLocation } from '../src/logic/units/unit';
import {MatchingThreeJs, PlaygroundThreeJs, PlaygroundViewDefault, PlaygroundViewHudThreeJsDefault, PlaygroundViewMainThreeJsDefault} from '../src/gui/playground/playground'
import {HudComponentDefaultThreeJs, HudComponentMapNavigationThreeJs, HudComponentThreeJs, HudRendererThreeJs, MapQuadRendererThreeJs} from '../src/gui/renderer/renderers'

import { EventEmitter, messageBus } from '../src/util/events.notest';
import { Events } from '../src/util/eventDictionary.notest';
import { Vector3 } from 'three';
import { RenderablesDefaultFactory, RenderablesFactory, RenderablesThreeJSFactory } from '../src/gui/renderer/renderables-factory';



describe('Gamengine', () => {
    describe('MapSquare', () => {   
        describe('_direction', () => {   
            let mappy:MapSquare;
            const width:number =  10;
            const height:number =  12;

            // let INPUT = 'hello world';
            // let INPUT_MULTI = `
            
            // some crazy

            // multiline imput
            
            // `
            // let INPUT_SPECIAL = '\n\n\n\n\n\n\n\t\t\t';
            // let SYMBOL = '*';
            // let HOW_MANY = 7;
            // let EXTERNAL_KEY = 'x909as9ds';         
            beforeEach(() => {  
                mappy = new MapSquare(width, height);
            });
            afterEach(() => {                  
            });

            it('S', () => {    
                const direction:string = mappy._direction(1,0); 
                return expect(direction).eq("S")
                
            })
            it("SW", () => {    
                const direction:string = mappy._direction(1,-1); 
                return expect(direction).eq("SW")
                
            })
            it("SE", () => {    
                const direction:string = mappy._direction(1,1); 
                return expect(direction).eq("SE")
                
            })
            it('N', () => {    
                const direction:string = mappy._direction(-1,0); 
                return expect(direction).eq("N")
                
            })
            it("NW", () => {    
                const direction:string = mappy._direction(-1,-1); 
                return expect(direction).eq("NW")
                
            })
            it("NE", () => {    
                const direction:string = mappy._direction(-1,1); 
                return expect(direction).eq("NE")
                
            })
            it('W', () => {    
                const direction:string = mappy._direction(0,-1); 
                return expect(direction).eq("W");                
            })
            it("E", () => {    
                const direction:string = mappy._direction(0,1); 
                return expect(direction).eq("E");                
            })
            it('Illegal args #1', () => {    
                return expect(()=>{mappy._direction(-3,9)}).to.throw('Invalid arguments');                                                      
            })
            it('Illegal args #2' , () => {    
                return expect(()=>{mappy._direction(0,0)}).to.throw('Invalid arguments');                                      
            })
            // return expect(()=>{anonymise(INPUT, SYMBOL, INPUT.length+10)}).to.throw('Cant anonymise more chars than the input length');                      
            // it('invalid symbol', () => {     
            //     return expect(()=>{anonymise(INPUT, '', INPUT.length+10)}).to.throw('Symbol must be of length 1');                      
            // })
            // it('undefined symbol', () => {     
            //     return expect(()=>{anonymise(INPUT, undefined, INPUT.length+10)}).to.throw('Symbol must be of length 1');                      
            // })
            // it('by default anonymise half the chars', () => {    
            //     let record = anonymise(INPUT, SYMBOL);
            //     let rexp = new RegExp('\\'+SYMBOL,"gim")            
            //     return expect((record.v.match(rexp) || []).length).eq(Math.ceil(INPUT.length/2))
            // })
            // it('number of chars for anonymisation is provided', () => {    
            //     let record = anonymise(INPUT, SYMBOL, HOW_MANY);
            //     let rexp = new RegExp('\\'+SYMBOL,"gim")            
            //     return expect((record.v.match(rexp) || []).length).eq(HOW_MANY)
            // })
            // it('record key is generated when external key is not provided', () => {    
            //     let record = anonymise(INPUT, SYMBOL, HOW_MANY);            
            //     return expect(record.k).is.not.undefined;
            // })
            // it('external key is used when provided', () => {    
            //     let record = anonymise(INPUT, SYMBOL, HOW_MANY, EXTERNAL_KEY);                        
            //     return expect(record.k).eq(EXTERNAL_KEY);
            // })
            // it('multiline input', () => {    
            //     let record = anonymise(INPUT_MULTI, SYMBOL, HOW_MANY);
            //     let rexp = new RegExp('\\'+SYMBOL,"gim") 
            //     return expect((record.v.match(rexp) || []).length).eq(HOW_MANY)
            // })
            // it('special chars input', () => {    
            //     let record = anonymise(INPUT_SPECIAL, SYMBOL, HOW_MANY);
            //     let rexp = new RegExp('\\'+SYMBOL,"gim") 
            //     return expect((record.v.match(rexp) || []).length).eq(HOW_MANY)
            // })
            
        })
        
        describe('fromTiles', () => {   
            
            
            
            beforeEach(() => {  
                                
            });
            afterEach(() => {                  
            });

            it('map size', () => {    
                let mappy:MapSquare = new MapSquare(6, 5);
                mappy.fromTiles(6, MapsMocks.map_6x5);
                return expect(Array.from(mappy.theMap).length).eq(30);                
            })   
            
            it('size check', () => {    
                let mappy:MapSquare = new MapSquare(6, 5);
                mappy.fromTiles(6, MapsMocks.map_5x6);
                return expect(Array.from(mappy.theMap).length).eq(30);                
            }) 

            it('size check #2', () => {    
                let mappy:MapSquare = new MapSquare(4, 4);
                return expect(()=>{mappy.fromTiles(6, MapsMocks.map_5x6)}).to.throw('Invalid arguments');                              
            }) 
            it('size check #3', () => {    
                let mappy:MapSquare = new MapSquare(4, 4);
                return expect(()=>{mappy.fromTiles(4, MapsMocks.map_5x6)}).to.throw('Invalid arguments');                              
            }) 
        })
        describe('neighbours', () => {   
            let mappy:MapSquare;
            const width:number =  5;
            const height:number =  6;
            
            beforeEach(() => {  
                mappy = new MapSquare(height, width);
                mappy.fromTiles(6, MapsMocks.map_6x5)
            });
            afterEach(() => {                  
            });

            it('upper left', () => {    
                const neighbours: Neighbour[] = mappy.neighbours({id: "0,0", x: 0, y:0, t:"PLAIN"});
                return expect(neighbours).length(3);                
            }) 
            it('upper left #1', () => {    
                const neighbours: Neighbour[] = mappy.neighbours({id: "0,0", x: 0, y:0, t:"PLAIN"});
                const E = neighbours.find((item:Neighbour)=>{
                    return item.direction == "E"
                })
                const S = neighbours.find((item:Neighbour)=>{
                    return item.direction == "S"
                })
                const SE = neighbours.find((item:Neighbour)=>{
                    return item.direction == "SE"
                })
                return expect(E?.direction+S?.direction+SE?.direction).eq("ESSE")
            }) 
            it('upper right', () => {    
                const neighbours: Neighbour[] = mappy.neighbours({id: "0,4", x: 4, y:0, t:"PLAIN"});
                return expect(neighbours).length(3);                
            }) 
            it('upper right #1', () => {    
                const neighbours: Neighbour[] = mappy.neighbours({id: "0,4", x: 4, y:0, t:"PLAIN"});
                const nW = neighbours.find((item:Neighbour)=>{
                    return item.direction == "W"
                })
                const nSW = neighbours.find((item:Neighbour)=>{
                    return item.direction == "SW"
                })
                const nS = neighbours.find((item:Neighbour)=>{
                    return item.direction == "S"
                })                
                return expect(nW?.direction+nSW?.direction+nS?.direction).eq("WSWS")
            })
            it('middle', () => {    
                const neighbours: Neighbour[] = mappy.neighbours({id: "2,4", x: 2, y:2, t:"PLAIN"});
                return expect(neighbours).length(8);                
            })
            it('middle #1', () => {    
                const neighbours: Neighbour[] = mappy.neighbours({id: "2,4", x: 2, y:2, t:"PLAIN"});
                const N = neighbours.find((item:Neighbour)=>{
                    return item.direction == "N"
                })
                const S = neighbours.find((item:Neighbour)=>{
                    return item.direction == "S"
                })
                const E = neighbours.find((item:Neighbour)=>{
                    return item.direction == "E"
                })
                const W = neighbours.find((item:Neighbour)=>{
                    return item.direction == "W"
                })
                const NE = neighbours.find((item:Neighbour)=>{
                    return item.direction == "NE"
                })
                const NW = neighbours.find((item:Neighbour)=>{
                    return item.direction == "NW"
                })
                const SW = neighbours.find((item:Neighbour)=>{
                    return item.direction == "SW"
                })
                const SE = neighbours.find((item:Neighbour)=>{
                    return item.direction == "SE"
                })

                return expect(N?.direction+S?.direction+E?.direction+W?.direction+NE?.direction+NW?.direction+SW?.direction+SE?.direction).eq("NSEWNENWSWSE")

            })
            
        })

        describe('paths',()=>{
            let mappy:MapSquare;
            let mappyTerrain:MapSquare;
            let mappyTerrainHeavy:MapSquare;
            const height:number =  6;
            const width:number =  5;
            let calculator:CostCalculator;
            let calculatorTerrain:CostCalculator;
            
            const CONST_COST = 1;

            beforeEach(() => {  
                mappy = new MapSquare(height, width);
                mappy.fromTiles(6, MapsMocks.map_6x5)
                calculator = new CostCalculatorConst(CONST_COST);

                mappyTerrain = new MapSquare(height, width);                
                mappyTerrain.fromTiles(6, MapsMocks.map_6x5_terrain);
                calculatorTerrain = new CostCalculatorTerrain(TerrainMocks.terrain_1);

                mappyTerrainHeavy = new MapSquare(height, width);                
                mappyTerrainHeavy.fromTiles(6, MapsMocks.map_6x5_terrain_heavy);
                calculatorTerrain = new CostCalculatorTerrain(TerrainMocks.terrain_1);

            });
            afterEach(() => {                  
            });

            it('origin check', () => {    
                const from:TileBase = MapsMocks.map_6x5.find((item)=>{
                    return item.id == '0,0'
                })!;
                const to:TileBase = MapsMocks.map_6x5.find((item)=>{
                    return item.id == '5,4'
                })!;
                const paths = mappy.paths(calculator, from, to); 
                return expect(paths.origin).eq(from);             
            })
            it('origin check in path to to', () => {    
                const from:TileBase = MapsMocks.map_6x5.find((item)=>{
                    return item.id == '0,0'
                })!;
                const to:TileBase = MapsMocks.map_6x5.find((item)=>{
                    return item.id == '5,4'
                })!;
                const paths = mappy.paths(calculator, from, to); 
                return expect(paths.paths.get(to)!.origin).eq(from);             
            }) 
            it('target check in path to to', () => {    
                const from:TileBase = MapsMocks.map_6x5.find((item)=>{
                    return item.id == '0,0'
                })!;
                const to:TileBase = MapsMocks.map_6x5.find((item)=>{
                    return item.id == '5,4'
                })!;
                const paths = mappy.paths(calculator, from, to); 
                const path = paths.paths.get(to);
                
                return expect(path!.target).eq(to);             
            }) 
            it('path length check', () => {    
                const from:TileBase = MapsMocks.map_6x5.find((item)=>{
                    return item.id == '0,0'
                })!;
                const to:TileBase = MapsMocks.map_6x5.find((item)=>{
                    return item.id == '5,4'
                })!;
                const paths = mappy.paths(calculator, from, to); 
                const path = paths.paths.get(to);
                
                return expect(path!.cost).eq(5);             
            }) 
            it('path steps length check', () => {    
                const from:TileBase = MapsMocks.map_6x5.find((item)=>{
                    return item.id == '0,0'
                })!;
                const to:TileBase = MapsMocks.map_6x5.find((item)=>{
                    return item.id == '5,4'
                })!;
                const paths = mappy.paths(calculator, from, to); 
                const path = paths.paths.get(to);                
                return expect(path!.steps.length).eq(6);             
            }) 

            it('terrain - path steps length check', () => {    
                const from:TileBase = MapsMocks.map_6x5_terrain.find((item)=>{
                    return item.id == '0,0'
                })!;
                const to:TileBase = MapsMocks.map_6x5_terrain.find((item)=>{
                    return item.id == '5,4'
                })!;
                const paths = mappyTerrain.paths(calculatorTerrain, from, to); 
                const path = paths.paths.get(to);                           
                return expect(path!.steps.length).eq(9);             
            }) 
            it('heavy terrain - path steps length check', () => {    
                const from:TileBase = MapsMocks.map_6x5_terrain_heavy.find((item)=>{
                    return item.id == '0,0'
                })!;
                const to:TileBase = MapsMocks.map_6x5_terrain_heavy.find((item)=>{
                    return item.id == '5,4'
                })!;
                const paths = mappyTerrainHeavy.paths(calculatorTerrain, from, to); 
                const path = paths.paths.get(to);                               
                return expect(path!.steps.length).eq(9);             
            }) 
            it('heavy terrain - cost check', () => {    
                const from:TileBase = MapsMocks.map_6x5_terrain_heavy.find((item)=>{
                    return item.id == '0,0'
                })!;
                const to:TileBase = MapsMocks.map_6x5_terrain_heavy.find((item)=>{
                    return item.id == '5,4'
                })!;
                const paths = mappyTerrainHeavy.paths(calculatorTerrain, from, to); 
                const path = paths.paths.get(to);      
                // console.log(path);          
                return expect(path!.cost).eq(14);             
            }) 

            it('heavy terrain - steps check', () => {    
                const from:TileBase = MapsMocks.map_6x5_terrain_heavy.find((item)=>{
                    return item.id == '0,0'
                })!;
                const to:TileBase = MapsMocks.map_6x5_terrain_heavy.find((item)=>{
                    return item.id == '5,4'
                })!;
                const paths = mappyTerrainHeavy.paths(calculatorTerrain, from, to); 
                const path = paths.paths.get(to);      
                const expectedPath = [
                    { id: '0,0', y: 0, x: 0, t: 'PLAIN' },
                    { id: '1,0', y: 1, x: 0, t: 'PLAIN' },
                    { id: '2,0', y: 2, x: 0, t: 'MOUNTAIN' },
                    { id: '3,0', y: 3, x: 0, t: 'MOUNTAIN' },
                    { id: '4,0', y: 4, x: 0, t: 'MOUNTAIN' },
                    { id: '5,1', y: 5, x: 1, t: 'PLAIN' },
                    { id: '5,2', y: 5, x: 2, t: 'PLAIN' },
                    { id: '5,3', y: 5, x: 3, t: 'PLAIN' },
                    { id: '5,4', y: 5, x: 4, t: 'PLAIN' }
                  ]                
                return expect(JSON.stringify(path!.steps)).eq(JSON.stringify(expectedPath));             
            })

            
        })

        describe('range', () => {   
            
            let mappyTerrainHeavy: MapBase;
            let calculatorTerrain:CostCalculator;
            const height:number =  6;
            const width:number =  5;

            beforeEach(() => {  
                mappyTerrainHeavy = new MapSquare(height, width);                
                mappyTerrainHeavy.fromTiles(6, MapsMocks.map_6x5_terrain_heavy);
                calculatorTerrain = new CostCalculatorTerrain(TerrainMocks.terrain_1);    
            });
            afterEach(() => {                  
            });

            it('range 1', () => { 
                const RANGE = 1;   
                const range:Paths = mappyTerrainHeavy.range(calculatorTerrain, mappyTerrainHeavy.theMap.get("0,0")!, RANGE);  
                let maxCost = 0;
                range.paths.forEach((path: Path)=>{
                    maxCost = Math.max(path.cost, maxCost);
                })                             
                return expect(maxCost).lte(RANGE)
            })   
            it('range 3', () => { 
                const RANGE = 3;   
                const range:Paths = mappyTerrainHeavy.range(calculatorTerrain, mappyTerrainHeavy.theMap.get("0,0")!, RANGE);  
                let maxCost = 0;
                range.paths.forEach((path: Path)=>{
                    maxCost = Math.max(path.cost, maxCost);
                })                             
                return expect(maxCost).lte(RANGE)
            })   
            it('range 5', () => { 
                const RANGE = 5;   
                const range:Paths = mappyTerrainHeavy.range(calculatorTerrain, mappyTerrainHeavy.theMap.get("0,0")!, RANGE);  
                let maxCost = 0;
                range.paths.forEach((path: Path)=>{
                    maxCost = Math.max(path.cost, maxCost);
                })                             
                return expect(maxCost).lte(RANGE)
            }) 

        })
        describe('distance', () => {   
            
            let mappyTerrainNoPath: MapBase;
            let calculatorTerrain:CostCalculator;
            const height:number =  6;
            const width:number =  5;

            beforeEach(() => {  
                mappyTerrainNoPath = new MapSquare(height, width);                
                mappyTerrainNoPath.fromTiles(6, MapsMocks.map_6x5_terrain_no_path);
                calculatorTerrain = new CostCalculatorTerrain(TerrainMocks.terrain_1);    
            });
            afterEach(() => {                  
            });

            it('distance 2', () => { 
                
                const distance:number = mappyTerrainNoPath.distance(mappyTerrainNoPath.theMap.get("0,0")!, mappyTerrainNoPath.theMap.get("1,2")!,calculatorTerrain);                
                return expect(distance).eq(2)
            })
            it('distance 11', () => { 
                
                const distance:number = mappyTerrainNoPath.distance(mappyTerrainNoPath.theMap.get("0,0")!, mappyTerrainNoPath.theMap.get("5,1")!,calculatorTerrain);                
                return expect(distance).eq(11)
            })   

            it('distance path not found', () => {                 
                return expect(()=>{mappyTerrainNoPath.distance(mappyTerrainNoPath.theMap.get("0,0")!, mappyTerrainNoPath.theMap.get("5,4")!,calculatorTerrain)}).to.throw('Path not found');                                                                      
            })   


        })
        describe('tile', () => {   
            
            let mappyTerrainNoPath: MapBase;
            const height:number =  6;
            const width:number =  5;

            beforeEach(() => {  
                mappyTerrainNoPath = new MapSquare(height, width);                
                mappyTerrainNoPath.fromTiles(6, MapsMocks.map_6x5_terrain_no_path);
            });
            afterEach(() => {                  
            });

            it('return tile', () => { 
                
                const tile = mappyTerrainNoPath.tile("0,0");
                const idfromxy = tile.y+","+tile.x;
                return expect(tile.id).eq(idfromxy)
            })   

            it('tile not found', () => {                 
                return expect(()=>{mappyTerrainNoPath.tile("some non existing id")}).to.throw('Tile not found');                                                                      
            })   


        })
        
    })

    describe('MapHeqOddQ', () => {   
        describe('_direction', () => {   
            describe('even', () => {
                let mappy:MapHexOddQ;
                const width:number =  10;
                const height:number =  12;
                        
                beforeEach(() => {  
                    mappy = new MapHexOddQ(height, width);
                });
                afterEach(() => {                  
                });

                it('N', () => {    
                    const direction:string = mappy._direction({id: "2,2", t: "PLAIN", y:2, x: 2},0,1); 
                    return expect(direction).eq("N")
                    
                })
                it('S', () => {    
                    const direction:string = mappy._direction({id: "2,2", t: "PLAIN", y:2, x: 2},0,-1); 
                    return expect(direction).eq("S")
                    
                })
                it('NE', () => {    
                    const direction:string = mappy._direction({id: "2,2", t: "PLAIN", y:2, x: 2},-1,1); 
                    return expect(direction).eq("NE")
                    
                })
                it('SE', () => {    
                    const direction:string = mappy._direction({id: "2,2", t: "PLAIN", y:2, x: 2},-1,0); 
                    return expect(direction).eq("SE")
                    
                })
                it('SW', () => {    
                    const direction:string = mappy._direction({id: "2,2", t: "PLAIN", y:2, x: 2},1,0); 
                    return expect(direction).eq("SW")
                    
                })
                it('NW', () => {    
                    const direction:string = mappy._direction({id: "2,2", t: "PLAIN", y:2, x: 2},1,1); 
                    return expect(direction).eq("NW")
                    
                })
                it('Illegal args #1', () => {    
                    return expect(()=>{mappy._direction({id: "2,2", t: "PLAIN", y:2, x: 2},3,-9)}).to.throw('Invalid arguments');                                                      
                })
                it('Illegal args #2' , () => {    
                    return expect(()=>{mappy._direction({id: "2,2", t: "PLAIN", y:2, x: 2},0,0)}).to.throw('Invalid arguments');                                      
                })
            })
            describe('odd', () => {
                let mappy:MapHexOddQ;
                const width:number =  10;
                const height:number =  12;
                        
                beforeEach(() => {  
                    mappy = new MapHexOddQ(height, width);
                });
                afterEach(() => {                  
                });

                it('N', () => {    
                    const direction:string = mappy._direction({id: "3,2", t: "PLAIN", y:3, x: 2},0,1); 
                    return expect(direction).eq("N")
                    
                })
                it('S', () => {    
                    const direction:string = mappy._direction({id: "3,2", t: "PLAIN", y:3, x: 2},0,-1); 
                    return expect(direction).eq("S")
                    
                })
                it('NE', () => {    
                    const direction:string = mappy._direction({id: "3,2", t: "PLAIN", y:3, x: 2},-1,0); 
                    return expect(direction).eq("NE")
                    
                })
                it('SE', () => {    
                    const direction:string = mappy._direction({id: "3,2", t: "PLAIN", y:3, x: 2},-1,-1); 
                    return expect(direction).eq("SE")
                    
                })
                it('SW', () => {    
                    const direction:string = mappy._direction({id: "3,2", t: "PLAIN", y:3, x: 2},1,-1); 
                    return expect(direction).eq("SW")
                    
                })
                it('NW', () => {    
                    const direction:string = mappy._direction({id: "3,2", t: "PLAIN", y:3, x: 2},1,0); 
                    return expect(direction).eq("NW")
                    
                })
                it('Illegal args #1', () => {    
                    return expect(()=>{mappy._direction({id: "3,2", t: "PLAIN", y:3, x: 2},1,1)}).to.throw('Invalid arguments');                                                      
                })
                it('Illegal args #2' , () => {    
                    return expect(()=>{mappy._direction({id: "3,2", t: "PLAIN", y:3, x: 2},0,0)}).to.throw('Invalid arguments');                                      
                })
            })
            
        })
        
        
        describe('neighbours', () => {   
            let mappy:MapHexOddQ;
            const width:number =  5;
            const height:number =  6;
            
            beforeEach(() => {  
                mappy = new MapHexOddQ(height, width);
                mappy.fromTiles(6, MapsMocks.map_6x5)
            });
            afterEach(() => {                  
            });

            it('upper left', () => {    
                const neighbours: Neighbour[] = mappy.neighbours({id: "0,0", x: 0, y:0, t:"PLAIN"});                
                return expect(neighbours).length(2);                
            }) 
            it('upper left #1', () => {    
                const neighbours: Neighbour[] = mappy.neighbours({id: "0,0", x: 0, y:0, t:"PLAIN"});
                const S = neighbours.find((item:Neighbour)=>{
                    return item.direction == "S"
                })
                const SE = neighbours.find((item:Neighbour)=>{
                    return item.direction == "SE"
                })
                return expect(S?.direction+SE?.direction).eq("SSE")
            }) 
            it('upper right', () => {    
                const neighbours: Neighbour[] = mappy.neighbours({id: "5,0", x: 0, y:5, t:"PLAIN"});                
                return expect(neighbours).length(3);                
            }) 
            it('upper right #1', () => {    
                const neighbours: Neighbour[] = mappy.neighbours({id: "5,0", x: 0, y:5, t:"PLAIN"});
                const nNW = neighbours.find((item:Neighbour)=>{
                    return item.direction == "NW"
                })
                const nSW = neighbours.find((item:Neighbour)=>{
                    return item.direction == "SW"
                })
                const nS = neighbours.find((item:Neighbour)=>{
                    return item.direction == "S"
                })                
                return expect(nNW?.direction+nSW?.direction+nS?.direction).eq("NWSWS")
            })
            it('middle even', () => {    
                const neighbours: Neighbour[] = mappy.neighbours({id: "2,2", x: 2, y:2, t:"PLAIN"});
                console.log(neighbours);
                return expect(neighbours).length(6);                
            })

            it('middle odd', () => {    
                const neighbours: Neighbour[] = mappy.neighbours({id: "3,2", x: 2, y:3, t:"PLAIN"});
                console.log(neighbours);
                return expect(neighbours).length(6);                
            })
            // it('middle #1', () => {    
            //     const neighbours: Neighbour[] = mappy.neighbours({id: "2,4", x: 2, y:2, t:"PLAIN"});
            //     const N = neighbours.find((item:Neighbour)=>{
            //         return item.direction == "N"
            //     })
            //     const S = neighbours.find((item:Neighbour)=>{
            //         return item.direction == "S"
            //     })
            //     const E = neighbours.find((item:Neighbour)=>{
            //         return item.direction == "E"
            //     })
            //     const W = neighbours.find((item:Neighbour)=>{
            //         return item.direction == "W"
            //     })
            //     const NE = neighbours.find((item:Neighbour)=>{
            //         return item.direction == "NE"
            //     })
            //     const NW = neighbours.find((item:Neighbour)=>{
            //         return item.direction == "NW"
            //     })
            //     const SW = neighbours.find((item:Neighbour)=>{
            //         return item.direction == "SW"
            //     })
            //     const SE = neighbours.find((item:Neighbour)=>{
            //         return item.direction == "SE"
            //     })

            //     return expect(N?.direction+S?.direction+E?.direction+W?.direction+NE?.direction+NW?.direction+SW?.direction+SE?.direction).eq("NSEWNENWSWSE")

            // })
            
        })        
    })

    describe('CostCalculatorConst',()=>{
        describe('cost', () => {   
           
            const CONST_COST = 1
      
            beforeEach(() => {  
                
            });
            afterEach(() => {                  
            });

            it('const cost', () => {  
                const calculator = new CostCalculatorConst(CONST_COST);
                  
                const cost = calculator.cost({id: "0,0", x: 0, y:0, t:"PLAIN"}, {id: "1,1", x: 1, y:1, t:"PLAIN"});
                return expect(cost).eq(CONST_COST);
                
            })

            
        })
    })
    describe('CostCalculatorTerrain',()=>{
        describe('cost', () => {   
                             
            beforeEach(() => {  
                
            });
            afterEach(() => {                  
            });

            it('plain cost', () => {  
                const terrainCost = TerrainMocks.terrain_1;
                const calculator = new CostCalculatorTerrain(terrainCost);
                  
                const cost = calculator.cost({id: "0,0", x: 0, y:0, t:"PLAIN"}, {id: "1,1", x: 1, y:1, t:"PLAIN"});
                return expect(cost).eq(terrainCost.PLAIN);
                
            })
            it('mountain cost', () => {  
                const terrainCost = TerrainMocks.terrain_1;
                const calculator = new CostCalculatorTerrain(terrainCost);
                  
                const cost = calculator.cost({id: "0,0", x: 0, y:0, t:"PLAIN"}, {id: "1,1", x: 1, y:1, t:"MOUNTAIN"});
                return expect(cost).eq(terrainCost.MOUNTAIN);
                
            })

            it('undefined cost', () => {  
                const terrainCost = TerrainMocks.terrain_1;
                const calculator = new CostCalculatorTerrain(terrainCost);                
                return expect(()=>{calculator.cost({id: "0,0", x: 0, y:0, t:"PLAIN"}, {id: "1,1", x: 1, y:1, t:"SOME UNDEFINED"})}).to.throw('Invalid arguments');                 
            })

            
        })
    })

    describe('Actions',()=>{
        describe('ActionUnitLandFieldOfView',()=>{
            
            
            
            let s1:SinonStub;
            let s2:SinonStub;
            let map:MapBase = new MapSquare(6, 6);
            let messageBusMocked = new EventEmitter();
            const terrainCost = TerrainMocks.terrain_1;
                
            const tile: TileBase = {
                id: "t_1",
                t:"type",
                x: 0,
                y: 0
            }

            const tile2: TileBase = {
                id: "t_2",
                t:"type",
                x: 2,
                y: 2
            }
            const unit:SpecsBase&SpecsLocation = {
                uid: "u",
                actionPoints: 1,
                hitPoints: 1,
                rangeStrength: 1,
                sight:9,
                strength:1,
                tile: tile 

            }

            const pathsMap = new Map<TileBase, Path>();

            let paths: Paths;

            beforeEach(() => {  
                pathsMap.set(tile2, {
                    origin: tile,
                    target: tile2,
                    cost:1,
                    steps: []
                });

                paths = {
                    origin: tile,
                    paths: pathsMap
                }

                s1 = sinon.stub(map,'paths');
                s1.returns(paths);
                s2 = sinon.stub(messageBusMocked,'emit');
                s2.returns(undefined);

                
            });
            afterEach(() => {  
                s1.restore();                
                s2.restore();                
            });

            it('fov is limited by sight', () => {                                 
                
                const a = new ActionUnitLandFieldOfView(unit,unit,terrainCost, map, messageBus); 
                a.rangeAndCosts();
                const call = s1.getCall(0);
                return expect(call.args[1]).eq(tile)
                
            })
            it('fov is limited by sight', () => {  
                
                
                const a = new ActionUnitLandFieldOfView(unit,unit,terrainCost, map, messageBus); 
                a.rangeAndCosts();
                const call = s1.getCall(0);
                return expect(call.args[2]).is.undefined;
                
            })
            it('fov is limited by sight', () => {  
                
                
                const a = new ActionUnitLandFieldOfView(unit,unit,terrainCost, map, messageBus); 
                a.rangeAndCosts();
                const call = s1.getCall(0);
                return expect(call.args[3]).eq(unit.sight)                
            })
            it('fov event is generated', () => {  
                
                
                const a = new ActionUnitLandFieldOfView(unit,unit,terrainCost, map, messageBusMocked); 
                a.perform({});
                const call = s2.getCall(0);
                return expect(call.args[0]).eq(Events.MAP.FOV);                
            })
            it('there are fov tiles', () => {  
                
                
                const a = new ActionUnitLandFieldOfView(unit,unit,terrainCost, map, messageBusMocked); 
                a.perform({});
                const call = s2.getCall(0);
                return expect(call.args[1][0]).eq(tile2);                
            })
            it('unit origin is also returned as fov', () => {  
                
                
                const a = new ActionUnitLandFieldOfView(unit,unit,terrainCost, map, messageBusMocked); 
                a.perform({});
                const call = s2.getCall(0);
                return expect(call.args[1][1]).eq(tile);                
            })

                
            
        })
        describe('ActionUnitFortify',()=>{
            
            
            
            // let s1:SinonStub;
            let s2:SinonStub;
            
            let messageBusMocked = new EventEmitter();
            
                
            const tile: TileBase = {
                id: "t_1",
                t:"type",
                x: 0,
                y: 0
            }
            const unit:SpecsBase&SpecsLocation = {
                uid: "u",
                actionPoints: 4,
                hitPoints: 1,
                rangeStrength: 1,
                sight:9,
                strength:1,
                tile: tile 

            }

            const unit2:SpecsBase&SpecsLocation = {
                uid: "u",
                actionPoints: 0,
                hitPoints: 1,
                rangeStrength: 1,
                sight:9,
                strength:1,
                tile: tile 

            }
            

            beforeEach(() => {  
                

                s2 = sinon.stub(messageBusMocked,'emit');
                s2.returns(undefined);

                
            });
            afterEach(() => {  
                              
                s2.restore();                
            });

            it('fortification is built on the unit origin tile', () => {                                 
                
                const a = new ActionUnitFortify(unit,unit,messageBus); 
                const paths = a.rangeAndCosts();                 
                return expect(paths.origin).eq(tile)                
            })
            
            it('fortification is built on the unit origin tile', () => {                                 
                
                const a = new ActionUnitFortify(unit,unit,messageBus); 
                const paths = a.rangeAndCosts();                 
                
                return expect(paths.paths.get(tile)!.origin).eq(tile)                
            })
            it('fortification is built on the unit origin tile', () => {                                 
                
                const a = new ActionUnitFortify(unit,unit,messageBus); 
                const paths = a.rangeAndCosts();                 
                
                return expect(paths.paths.get(tile)!.target).eq(tile)                
            })
            it('fortification consumes all action points', () => {                                 
                
                const a = new ActionUnitFortify(unit,unit,messageBus); 
                const paths = a.rangeAndCosts();                 
                
                return expect(paths.paths.get(tile)!.cost).eq(unit.actionPoints)                
            })
            it('fortification consumes all action points', () => {                                 
                
                const a = new ActionUnitFortify(unit2,unit2,messageBus); 
                const paths = a.rangeAndCosts();                 
                
                return expect(paths.paths.get(tile)!.cost).eq(1)                
            })

            it('fortification consumes all action points', () => {                                 
                
                const a = new ActionUnitFortify(unit2,unit2,messageBus); 
                const cost = a._actionCost();                 
                
                return expect(cost).eq(1)                
            })

            it('fortification consumes all action points', () => {                                 
                
                const a = new ActionUnitFortify(unit,unit,messageBus); 
                const cost = a._actionCost();                 
                
                return expect(cost).eq(unit.actionPoints)                
            })

            it('fortification consumes all action points', () => {                                 
                
                const a = new ActionUnitFortify(unit2,unit2,messageBusMocked); 
                a.perform();                 
                const call = s2.getCall(0);

                return expect(call.args[0]).eq(Events.UNIT.RUNNER_ACTION)                
            })

            it('fortification consumes all action points', () => {                                 
                
                const a = new ActionUnitFortify(unit2,unit2,messageBusMocked); 
                a.perform();                 
                const call = s2.getCall(1);

                return expect(call.args[0]).eq(Events.UNIT.CONSUME_AP)                
            })
                
            
        })
        describe('ActionUnitAttack',()=>{
            
            
            
            // let s1:SinonStub;
            let s2:SinonStub;
            
            let s1:SinonStub;

            let s3:SinonStub;
            
            let map:MapBase = new MapSquare(6, 6);
            let mapNoPath:MapBase = new MapSquare(6, 6);
            
            const terrainCost = TerrainMocks.terrain_1;
            let messageBusMocked = new EventEmitter();
            
                
            const tile: TileBase = {
                id: "t_1",
                t:"type",
                x: 0,
                y: 0
            }
            const tile2: TileBase = {
                id: "t_2",
                t:"type",
                x: 2,
                y: 2
            }
            const tile3: TileBase = {
                id: "t_3",
                t:"type",
                x: 1,
                y: 1
            }
            const unit:SpecsBase&SpecsLocation = {
                uid: "u",
                actionPoints: 4,
                hitPoints: 1,
                rangeStrength: 1,
                sight:9,
                strength:1,
                tile: tile 

            }

            const unit2:SpecsBase&SpecsLocation = {
                uid: "u",
                actionPoints: 0,
                hitPoints: 1,
                rangeStrength: 1,
                sight:9,
                strength:1,
                tile: tile2

            }

            const pathsMap = new Map<TileBase, Path>();
            const pathsMapNoPath = new Map<TileBase, Path>();
            let paths: Paths;

            let pathsNoPath: Paths;

            let actionContext1:ActionContextUnitAttack;

            beforeEach(() => {  

                actionContext1 = {
                    target: unit2,
                    targetTile: tile2
                }

                pathsMap.set(tile2, {
                    origin: tile,
                    target: tile2,
                    cost:1,
                    steps: [tile3, tile2]
                });
    
                paths = {
                    origin: tile,
                    paths: pathsMap
                }

                pathsMapNoPath.set(tile3, {
                    origin: tile,
                    target: tile3,
                    cost:1,
                    steps: [tile3]
                });

                pathsNoPath = {
                    origin: tile,
                    paths: pathsMapNoPath
                }
    
                s1 = sinon.stub(map,'paths');
                s1.returns(paths);
                s2 = sinon.stub(messageBusMocked,'emit');
                s2.returns(undefined);
                s3 = sinon.stub(mapNoPath,'paths');
                s3.returns(pathsNoPath);

                
            });
            afterEach(() => {  
                s1.restore();           
                s2.restore();   
                s3.restore();             
            });

            it('attack range is calculated', () => {                                 
                
                const a = new ActionUnitAttack(unit,unit,terrainCost, map, messageBusMocked); 
                a.rangeAndCosts();
                const call = s1.getCall(0);
                return expect(call.args[1]).eq(tile)
                
            })
            it('attack range is calculated', () => {                                 
                
                const a = new ActionUnitAttack(unit,unit,terrainCost, map, messageBusMocked); 
                a.rangeAndCosts();
                const call = s1.getCall(0);
                return expect(call.args[3]).eq(unit.actionPoints)
                
            })
            it('moves attacker near target', () => {                                 
                
                const a = new ActionUnitAttack(unit,unit,terrainCost, map, messageBusMocked); 
                a.perform(actionContext1);
                const call = s2.getCall(0);
                return expect(call.args[2]).eq(tile3)
                
            })
            it('moves attacker near target', () => {                                 
                
                const a = new ActionUnitAttack(unit,unit,terrainCost, map, messageBusMocked); 
                a.perform(actionContext1);
                const call = s2.getCall(0);
                return expect(call.args[0]).eq(Events.UNIT.POSITION)
                
            })
            it('moves attacker near target', () => {                                 
                
                const a = new ActionUnitAttack(unit,unit,terrainCost, map, messageBusMocked); 
                a.perform(actionContext1);
                const call = s2.getCall(0);
                return expect(call.args[1]).eq(unit)
                
            })
            it('throws exception when no path found', () => {                                 
                
                const a = new ActionUnitAttack(unit,unit,terrainCost, mapNoPath, messageBusMocked); 
                

                return expect(()=>{a.perform(actionContext1)}).to.throw('Path not found');                                      
                
                
            })

           
                
            
        })
        describe('ActionUnitMove',()=>{
            
            
            
            // let s1:SinonStub;
            let s2:SinonStub;
            
            let s1:SinonStub;

            let s3:SinonStub;
            
            let map:MapBase = new MapSquare(6, 6);
            let mapNoPath:MapBase = new MapSquare(6, 6);
            
            const terrainCost = TerrainMocks.terrain_1;
            let messageBusMocked = new EventEmitter();
            
                
            const tile: TileBase = {
                id: "t_1",
                t:"type",
                x: 0,
                y: 0
            }
            const tile2: TileBase = {
                id: "t_2",
                t:"type",
                x: 2,
                y: 2
            }
            const tile3: TileBase = {
                id: "t_3",
                t:"type",
                x: 1,
                y: 1
            }
            const unit:SpecsBase&SpecsLocation = {
                uid: "u",
                actionPoints: 4,
                hitPoints: 1,
                rangeStrength: 1,
                sight:9,
                strength:1,
                tile: tile 

            }



            const pathsMap = new Map<TileBase, Path>();
            const pathsMapNoPath = new Map<TileBase, Path>();
            let paths: Paths;

            let pathsNoPath: Paths;

            let actionContext1:ActionContextUnitMove;

            beforeEach(() => {  

                actionContext1 = {                    
                    to: tile2
                }

                pathsMap.set(tile2, {
                    origin: tile,
                    target: tile2,
                    cost:1,
                    steps: [tile3, tile2]
                });
    
                paths = {
                    origin: tile,
                    paths: pathsMap
                }

                pathsMapNoPath.set(tile3, {
                    origin: tile,
                    target: tile3,
                    cost:1,
                    steps: [tile3]
                });

                pathsNoPath = {
                    origin: tile,
                    paths: pathsMapNoPath
                }
    
                s1 = sinon.stub(map,'paths');
                s1.returns(paths);
                s2 = sinon.stub(messageBusMocked,'emit');
                s2.returns(undefined);
                s3 = sinon.stub(mapNoPath,'paths');
                s3.returns(pathsNoPath);

                
            });
            afterEach(() => {  
                s1.restore();           
                s2.restore();   
                s3.restore();             
            });

            it('move range is calculated', () => {                                 
                
                const a = new ActionUnitMove(unit,unit,terrainCost, map, messageBusMocked); 
                a.rangeAndCosts();
                const call = s1.getCall(0);
                return expect(call.args[1]).eq(tile)
                
            })
            it('move range is calculated', () => {                                 
                
                const a = new ActionUnitMove(unit,unit,terrainCost, map, messageBusMocked); 
                a.rangeAndCosts();
                const call = s1.getCall(0);
                return expect(call.args[3]).eq(unit.actionPoints)
                
            })
            it('moves to destination tile', () => {                                 
                
                const a = new ActionUnitMove(unit,unit,terrainCost, map, messageBusMocked); 
                a.perform(actionContext1);
                const call = s2.getCall(0);
                return expect(call.args[2]).eq(tile2)
                
            })
            it('moves to destination tile', () => {                                 
                
                const a = new ActionUnitMove(unit,unit,terrainCost, map, messageBusMocked); 
                a.perform(actionContext1);
                const call = s2.getCall(0);
                return expect(call.args[0]).eq(Events.UNIT.POSITION)
                
            })
            it('moves to destination tile', () => {                                 
                
                const a = new ActionUnitMove(unit,unit,terrainCost, map, messageBusMocked); 
                a.perform(actionContext1);
                const call = s2.getCall(0);
                return expect(call.args[1]).eq(unit)
                
            })
            it('throws exception when no path found', () => {                                 
                
                const a = new ActionUnitMove(unit,unit,terrainCost, mapNoPath, messageBusMocked); 
                

                return expect(()=>{a.perform(actionContext1)}).to.throw('Path not found');                                      
                
                
            })

            it('consumes action points accordingly', () => {                                 
                
                const a = new ActionUnitMove(unit,unit,terrainCost, map, messageBusMocked); 
                a.perform(actionContext1);
                const call = s2.getCall(1);
                return expect(call.args[1]).eq(unit)
                
            })
            it('consumes action points accordingly', () => {                                 
                
                const a = new ActionUnitMove(unit,unit,terrainCost, map, messageBusMocked); 
                a.perform(actionContext1);
                const call = s2.getCall(1);
                return expect(call.args[0]).eq(Events.UNIT.CONSUME_AP)
                
            })
            it('consumes action points accordingly', () => {                                 
                
                const a = new ActionUnitMove(unit,unit,terrainCost, map, messageBusMocked); 
                const paths = a.rangeAndCosts();
                const path = paths.paths.get(actionContext1.to);
                a.perform(actionContext1);
                const call = s2.getCall(1);
                return expect(call.args[2]).eq(path!.cost)
                
            })

           
                
            
        })
        
    })
})

describe('Playground', () => {
    let messageBusMocked = new EventEmitter();
    describe('PlaygroundThreeJs', () => {
        describe('attach', () => {
            let s1: SinonStub;
            // let s2: SinonStub;
            let view1: PlaygroundViewDefault;
            let view2: PlaygroundViewDefault;
            const container = {                
                nodeName: "CANVAS"
            }
            let playground: PlaygroundThreeJs;
            beforeEach(() => {
                view1 = new PlaygroundViewDefault("name1",messageBusMocked);
                view1.isViewHud = true;
                view2 = new PlaygroundViewDefault("name2",messageBusMocked);
                view2.isViewMain = true;
                s1 = sinon.stub(view1,"_preAttach").resolves();                

                playground = new PlaygroundThreeJs(container,messageBusMocked);                
                // s2 = sinon.stub(playground,"_attachInteractionListeners").returns();
                playground.views = []
                playground.views.push(view2);
            });
            afterEach(() => {    
                s1.restore();   
                // s2.restore();                         
            });

            it('calls preAttach for view', () => {
                
                

                return playground.attach(view1).then(()=>{
                    return expect(s1.callCount).eq(1);
                })
            })
            it('adds view', () => {                                
                return playground.attach(view1).then(()=>{
                    return expect(playground.views[1]).eq(view1);
                })
            })
            it('replaces view', () => {  
                playground.views.unshift(view1);                              
                return playground.attach(view1).then(()=>{
                    return expect(playground.views[1]).eq(view1);
                })
            })
            it('unsets autoclear for hud view', () => {  
                playground._renderer = {
                    autoClear: true
                }                              
                return playground.attach(view1).then(()=>{
                    return expect(playground._renderer.autoClear).eq(false);
                })
            })
        })
        describe("_attachInteractionListeners",()=>{
            const container = {                
                nodeName: "CANVAS",
                addEventListener(){}
            }
            let s1: SinonStub;
            let playground: PlaygroundThreeJs;


            beforeEach(() => {
                s1 = sinon.stub(container,"addEventListener");
                playground = new PlaygroundThreeJs(container,messageBusMocked);
            })
            afterEach(() => {    
                s1.restore();
            })
            it("listens for pointermove events",()=>{
                playground._attachInteractionListeners();
                return expect(s1.getCall(0).args[0]).eq("pointermove");
            })
            it("listens for pointerdown events",()=>{
                playground._attachInteractionListeners();
                return expect(s1.getCall(1).args[0]).eq("pointerdown");
            })

        })
        describe("initialize",()=>{
            let playground: PlaygroundThreeJs;
            const container = {                
                nodeName: "CANVAS"
            }
            let s1: SinonStub;
            let s2: SinonStub;

            beforeEach(()=>{
                playground = new PlaygroundThreeJs(container,messageBusMocked);
                s1 = sinon.stub(playground,"_attachInteractionListeners");
                s2 = sinon.stub(playground, "_setupRenderer");
            })
            afterEach(()=>{
                s1.restore();
            })
            it("calls super initialize",()=>{
                playground.initialize();
                return expect(s1.callCount).eq(1);
            })
            it("sets up renderer",()=>{
                playground.initialize();
                return expect(s2.callCount).eq(1);
            })
            it("sets up renderer using container",()=>{
                playground.initialize();
                return expect(s2.getCall(0).args[0]).eq(playground.container);
            })
        })
        describe("_resizeRendererToDisplaySize",()=>{
            let playground: PlaygroundThreeJs;
            const container = {                
                nodeName: "CANVAS"
            }
            let s1: SinonStub;
            let s2: SinonStub;
            let renderer1: any;
            let renderer2: any;

            beforeEach(()=>{
                playground = new PlaygroundThreeJs(container,messageBusMocked);  
                playground._renderer = undefined;

                renderer1 = {
                    autoClear: true,
                    domElement: {
                        clientWidth: 200,
                        clientHeight: 100,
                        width: 50,
                        height: 25
                    },
                    setSize(){}
                }
                renderer2 = {
                    autoClear: true,
                    domElement: {
                        clientWidth: 200,
                        clientHeight: 100,
                        width: 200,
                        height: 100
                    },
                    setSize(){}
                }

                s1 = sinon.stub(renderer1,"setSize")
                s2 = sinon.stub(renderer2,"setSize")
            })
            afterEach(()=>{
                s1.restore();
                s2.restore();
            })

            it("resizes renderer when needed",()=>{
                playground._renderer = renderer1;
                playground._resizeRendererToDisplaySize();
                return expect(s1.callCount).eq(1)
            })
            it("resizes renderer only when needed",()=>{
                playground._renderer = renderer2;
                playground._resizeRendererToDisplaySize();
                return expect(s2.callCount).eq(0)
            })
        })
        describe("_onInteraction",()=>{
            let view1: PlaygroundViewDefault;
            let view2: PlaygroundViewDefault;
            let view3: PlaygroundViewDefault;
            let s1: SinonStub;
            let s2: SinonStub;
            let s3: SinonStub;
            let playground: PlaygroundThreeJs;
            const container = {                
                nodeName: "CANVAS"
            }

            beforeEach(()=>{
                playground = new PlaygroundThreeJs(container,messageBusMocked);  
                view1 = new PlaygroundViewDefault("name1",messageBusMocked);
                view1.isViewHud = true;
                view2 = new PlaygroundViewDefault("name2",messageBusMocked);
                view2.isViewMain = true;
                view3 = new PlaygroundViewDefault("name3",messageBusMocked);
                view3.isViewMain = true;

                s1 = sinon.stub(view1,"_onInteraction").returns(undefined);
                s2 = sinon.stub(view2,"_onInteraction").returns({});
                s3 = sinon.stub(view3,"_onInteraction").returns({});

                playground.views = []
                playground.views.push(view1);
                playground.views.push(view2);
                playground.views.push(view3);
            })
            afterEach(()=>{
                s1.restore();
                s2.restore();
                s3.restore();
            })
            it("tries all views for interaction unless first interaction is found",()=>{
                playground._onInteraction("john", "doe");
                return expect(s3.callCount).eq(0);
            })
            it("tries all views for interaction unless first interaction is found",()=>{
                playground._onInteraction("john", "doe");
                return expect(s1.callCount).eq(1);
            })
            it("tries all views for interaction unless first interaction is found",()=>{
                playground._onInteraction("john", "doe");
                return expect(s2.callCount).eq(1);
            })
        })
        describe('run', () => {
            let s1: SinonStub;
            let s2: SinonStub;
            let s3: SinonStub;
            let s4: SinonStub;
            let s5: SinonStub;
            let s6: SinonStub;
            let s7: SinonStub;
            
            let view1: PlaygroundViewDefault;
            let view2: PlaygroundViewDefault;
            const container = {                
                nodeName: "CANVAS"
            }
            let playground: PlaygroundThreeJs;
            beforeEach(() => {
                
                view1 = new PlaygroundViewDefault("name1",messageBusMocked);
                view1.isViewHud = true;
                view1.camera = {
                    aspect: 1,
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    updateProjectionMatrix(){}
                }
                view2 = new PlaygroundViewDefault("name2",messageBusMocked);
                view2.isViewMain = true;
                view2.camera = {
                    aspect: 1,
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    updateProjectionMatrix(){}
                }
                
                
                // console.log(global);
                playground = new PlaygroundThreeJs(container,messageBusMocked);  
                global.requestAnimationFrame = (_callback: FrameRequestCallback) => {
                    return 1
                }             
                s2 = sinon.stub(global,"requestAnimationFrame").returns(1);

                playground.views = []
                playground.views.push(view1);
                playground.views.push(view2);
                

                s1 = sinon.stub(playground,"_resizeRendererToDisplaySize").returns(true);                

                playground._renderer = {
                    autoClear: true,
                    domElement: {
                        clientWidth: 200,
                        clientHeight: 100
                    },
                    clear(){},
                    clearDepth(){},
                    render(){}
                }

                s3 = sinon.stub(view1.camera,"updateProjectionMatrix");
                s4 = sinon.stub(view2.camera,"updateProjectionMatrix");
                s5 = sinon.stub(playground._renderer,"clear");
                s6 = sinon.stub(playground._renderer,"clearDepth");
                s7 = sinon.stub(playground._renderer,"render");

            });
            afterEach(() => {    
                s1.restore();   
                s2.restore();
                s3.restore();   
                s4.restore();
                s5.restore();   
                s6.restore();
                s7.restore();                          
            });

            it('plugs into browser animation engine', () => {                                
                playground.run();
                return expect(s2.callCount).eq(1);                
            })
            it('sets main view camera correctly', () => {                                
                playground.run();
                return expect(view2.camera.aspect).eq(2);                
            })
            it('sets main view camera matrix correctly', () => {                                
                playground.run();
                return expect(s4.callCount).eq(1);                
            })
            it('sets hud view camera correctly', () => {                                
                playground.run();
                return expect(view1.camera.left).eq(-100);                
            })
            it('sets hud view camera correctly', () => {                                
                playground.run();
                return expect(view1.camera.right).eq(100);                
            })
            it('sets hud view camera correctly', () => {                                
                playground.run();
                return expect(view1.camera.top).eq(50);                
            })
            it('sets hud view camera correctly', () => {                                
                playground.run();
                return expect(view1.camera.bottom).eq(-50);                
            })

            it('sets hud view camera matrix correctly', () => {                                
                playground.run();
                return expect(s3.callCount).eq(1);                
            })

            it('clears renderer when hud view is present', () => {                                
                playground.run();
                return expect(s5.callCount).eq(1);                
            })

            it('renders main view', () => {                                
                playground.run();                
                return expect(s7.getCall(0).args[1]).eq(view2.camera);                
            })
            it('renders hud view', () => {                                
                playground.run();                
                return expect(s7.getCall(1).args[1]).eq(view1.camera);                
            })

            it('clears depth when hud view is present', () => {                                
                playground.run();                
                return expect(s6.callCount).eq(1);                
            })
            
        })
    })
    describe("PlaygroundViewThreeJS",()=>{
        let playgroundView1: PlaygroundViewMainThreeJsDefault;
        let playground: PlaygroundThreeJs;
        const container = {                
            nodeName: "CANVAS",
            width: 300,
            height: 300,
            getBoundingClientRect(){}
        }
        let pointerEvent = {
            clientX: 10,
            clientY: 10,
            preventDefault(){}
        }
        describe("_pickScenePosition",()=>{
            let s1: SinonStub;
            beforeEach(()=>{
                playground = new PlaygroundThreeJs(container,messageBusMocked);
                playgroundView1 = new PlaygroundViewMainThreeJsDefault(messageBusMocked);
                s1 = sinon.stub(playgroundView1, "_getCanvasRelativePosition");
                s1.returns({
                    x: 100,
                    y:100
                })
                playgroundView1._preAttach(playground)
            })
            afterEach(()=>{
                s1.restore();
            })
            it("recalculates scene position",()=>{
                const pos = playgroundView1._pickScenePosition(pointerEvent);
                return expect(pos.x).eq(2/3-1)
            })
            it("recalculates scene position",()=>{
                const pos = playgroundView1._pickScenePosition(pointerEvent);
                return expect(pos.y).eq(-2/3+1)
            })
            it("uses canvas proportions",()=>{
                playgroundView1._pickScenePosition(pointerEvent);
                return expect(s1.callCount).eq(1);
            })
        })
        describe("_getCanvasRelativePosition",()=>{
            let s1: SinonStub;
            beforeEach(()=>{
                playground = new PlaygroundThreeJs(container,messageBusMocked);
                playgroundView1 = new PlaygroundViewMainThreeJsDefault(messageBusMocked);
                s1 = sinon.stub(container, "getBoundingClientRect");
                s1.returns({
                    left: 0,
                    top:0,
                    width: 200,
                    height: 50
                })
                playgroundView1._preAttach(playground)
            })
            afterEach(()=>{
                s1.restore();
            })
            it("calculates position",()=>{
                const pos = playgroundView1._getCanvasRelativePosition(pointerEvent);
                return expect(pos.x).eq(15);
            })
            it("calculates position",()=>{
                const pos = playgroundView1._getCanvasRelativePosition(pointerEvent);
                return expect(pos.y).eq(60);
            })
        })
        describe("pickObjectOfNames",()=>{
            let s1:SinonStub;
            let s2: SinonStub;
            let s3: SinonStub;
            let s4: SinonStub;
            let s5: SinonStub;
            let s6: SinonStub;
            const filter1:string[] = []
            const filter2:string[] = ["some"]

            beforeEach(()=>{
                playgroundView1 = new PlaygroundViewMainThreeJsDefault(messageBusMocked);
                playgroundView1._raycaster = {
                    setFromCamera(){},
                    intersectObjects(){}
                }
                playgroundView1.scene = new THREE.Scene();
                s1 = sinon.stub(pointerEvent,"preventDefault");
                s2 = sinon.stub(playgroundView1,"_pickScenePosition");
                s3 = sinon.stub(playgroundView1._raycaster,"setFromCamera");
                s4 = sinon.stub(playgroundView1._raycaster,"intersectObjects");
                s5 = sinon.stub(playgroundView1,"_findClosestObjectMatching");
                s5.withArgs(sinon.match.any,filter1);
                const matchingResult: MatchingThreeJs = {
                    distance: 0,
                    face: {},
                    faceIndex:1,
                    point: {},
                    object: new THREE.Object3D()

                }
                s5.withArgs(sinon.match.any,filter2).returns(matchingResult);
                s6 = sinon.stub(playgroundView1, "_getHierarchyObjects");
                
            })
            afterEach(()=>{
                s1.restore();
                s2.restore();
                s3.restore();
                s4.restore();
                s5.restore();
                s6.restore();
            })
            it("translates to scene position",()=>{
                playgroundView1.pickObjectOfNames(pointerEvent,filter1);
                return expect(s2.callCount).eq(1)
            })
            it("gets closest object that is hit",()=>{
                playgroundView1.pickObjectOfNames(pointerEvent,filter1);
                return expect(s5.callCount).eq(1)
            })
            it("captures ancestors for the hit object",()=>{
                playgroundView1.pickObjectOfNames(pointerEvent,filter2);
                return expect(s6.callCount).eq(1)
            })
            it("prevents further event processing",()=>{
                playgroundView1.pickObjectOfNames(pointerEvent,filter1);
                return expect(s1.callCount).eq(1)
            })
        })
        describe("_getHierarchyObjects",()=>{
            beforeEach(()=>{
                playgroundView1 = new PlaygroundViewMainThreeJsDefault(messageBusMocked);
            })
            it("returns all ancestors with the main ancestor first",()=>{
                const grandchild = new THREE.Object3D();
                const child = new THREE.Object3D();
                child.add(grandchild);
                const me = new THREE.Object3D();
                me.add(child)
                const parent = new THREE.Object3D();
                parent.add(me);
                const grandparent = new THREE.Object3D();
                grandparent.add(parent);

                const ancestors = playgroundView1._getHierarchyObjects(grandchild);
                return expect(ancestors[0]).eq(grandparent);
            })
            it("returns all ancestors with the queried object last",()=>{
                const grandchild = new THREE.Object3D();
                const child = new THREE.Object3D();
                child.add(grandchild);
                const me = new THREE.Object3D();
                me.add(child)
                const parent = new THREE.Object3D();
                parent.add(me);
                const grandparent = new THREE.Object3D();
                grandparent.add(parent);

                const ancestors = playgroundView1._getHierarchyObjects(grandchild);
                return expect(ancestors[ancestors.length-1]).eq(grandchild);
            })
        })
        describe("_findClosestObjectMatching",()=>{
            it("returns closest match - the first one",()=>{
                const intersections =  [ 
                    { object: {name: "the_name"}, distance: 3 },
                    { object: {name: "other"}, distance: 5 },
                    { object: {name: "name_another"}, distance: 12 }
                ]
                const filters = ["name","nonmatching"]
                playgroundView1 = new PlaygroundViewMainThreeJsDefault(messageBusMocked);
                const matching = playgroundView1._findClosestObjectMatching(intersections,filters);
                
                return expect(matching).eq(intersections[0])
            })
            it("uses cases insensitive filtering",()=>{
                const intersections =  [ 
                    { object: {name: "the_name"}, distance: 3 },
                    { object: {name: "OTHER"}, distance: 5 },
                    { object: {name: "name_another"}, distance: 12 }
                ]
                const filters = ["nonmatching","other"]
                playgroundView1 = new PlaygroundViewMainThreeJsDefault(messageBusMocked);
                const matching = playgroundView1._findClosestObjectMatching(intersections,filters);
                
                return expect(matching).eq(intersections[1])
            })
            it("returns first when no filter is provided",()=>{
                const intersections =  [ 
                    { object: {name: "the_name"}, distance: 3 },
                    { object: {name: "other"}, distance: 5 },
                    { object: {name: "name_another"}, distance: 12 }
                ]
                const filters:any[] = []
                playgroundView1 = new PlaygroundViewMainThreeJsDefault(messageBusMocked);
                const matching = playgroundView1._findClosestObjectMatching(intersections,filters);
                
                return expect(matching).eq(intersections[0])
            })
        })
    })
    describe("PlaygroundViewMainThreeJsDefault",()=>{
        describe("_onInteraction",()=>{
            let playgroundView1: PlaygroundViewMainThreeJsDefault;
            let playgroundView2: PlaygroundViewMainThreeJsDefault;
            let s1: SinonStub;
            let s2: SinonStub;
            let s3: SinonStub;        
            let playground: PlaygroundThreeJs;
            const container = {                
                nodeName: "CANVAS"
            }
            let pointerEvent = {

            }
            
            beforeEach(()=>{
                playground = new PlaygroundThreeJs(container, messageBusMocked);
                playgroundView1 = new PlaygroundViewMainThreeJsDefault(messageBusMocked);
                playgroundView1._preAttach(playground);
                playgroundView2 = new PlaygroundViewMainThreeJsDefault(messageBusMocked);
                playgroundView2._preAttach(playground);
                s1 = sinon.stub(playgroundView1,"pickObjectOfNames");
                s1.onCall(0).returns({
                    object: {a:1}
                })
                s1.onCall(1).returns(undefined);

                s2 = sinon.stub(playgroundView2,"pickObjectOfNames");
                s2.onCall(1).returns({
                    object: {a:1}
                })
                s2.onCall(0).returns(undefined);

                s3 = sinon.stub(messageBusMocked,"emit");

            })
            afterEach(()=>{
                s1.restore();
                s2.restore();
                s3.restore();
            })
            it("triggers unit event when unit was picked",()=>{
                playgroundView2._onInteraction(pointerEvent);
                return expect(s3.getCall(0).args[0]).eq(Events.INTERACTIONS.UNIT);
            })
            it("triggers tile event when tile was picked",()=>{
                playgroundView1._onInteraction(pointerEvent);
                return expect(s3.getCall(0).args[0]).eq(Events.INTERACTIONS.TILE);
            })
        })
        describe("_setupScene",()=>{
            let playgroundView: PlaygroundViewMainThreeJsDefault;
            let playground: PlaygroundThreeJs;
            const container = {                
                nodeName: "CANVAS"
            }
            beforeEach(()=>{
                playground = new PlaygroundThreeJs(container, messageBusMocked);
                playgroundView = new PlaygroundViewMainThreeJsDefault(messageBusMocked);
                playgroundView._preAttach(playground);
            })
            it("sets proper camera position",()=>{
                playgroundView._setupScene();
                return expect(playgroundView.camera!.position.x).eq(0)
            })
            it("sets proper camera position",()=>{
                playgroundView._setupScene();
                return expect(playgroundView.camera!.position.y).eq(-50)
            })
            it("sets proper camera position",()=>{
                playgroundView._setupScene();
                return expect(playgroundView.camera!.position.z).eq(20)
            })
            it("sets proper camera name",()=>{
                playgroundView._setupScene();
                return expect(playgroundView.camera!.name).eq(PlaygroundViewMainThreeJsDefault.CAMERA_NAME)
            })
            it("sets proper camera up vector",()=>{
                playgroundView._setupScene();
                return expect(playgroundView.camera!.up.x).eq(0);
            })
            it("sets proper camera up vector",()=>{
                playgroundView._setupScene();
                return expect(playgroundView.camera!.up.y).eq(0);
            })
            it("sets proper camera up vector",()=>{
                playgroundView._setupScene();
                return expect(playgroundView.camera!.up.z).eq(1);
            })

            it("sets proper scene name",()=>{
                playgroundView._setupScene();
                return expect(playgroundView.scene!.name).eq(PlaygroundViewMainThreeJsDefault.SCENE_NAME);
            })

            it("has at least one light",()=>{
                playgroundView._setupScene();
                let lightsCount = 0;
                playgroundView.scene.traverse((item:THREE.Light)=>{
                    if(item.isLight) lightsCount++;
                })
                return expect(lightsCount).gt(0);
            })

        })
    })
    
    describe("PlaygroundViewHudThreeJsDefault",()=>{
        describe("_onInteraction",()=>{
            let p1:PlaygroundViewHudThreeJsDefault;
            let s1: SinonStub;
            let p2:PlaygroundViewHudThreeJsDefault;
            let s2: SinonStub;
            let s3: SinonStub; 
            beforeEach(()=>{
                p1 = new PlaygroundViewHudThreeJsDefault(messageBusMocked);
                p2 = new PlaygroundViewHudThreeJsDefault(messageBusMocked);

                s1 = sinon.stub(p1,"pickObjectOfNames").returns({
                    object: new THREE.Object3D(),
                    hierarchy: []
                });
                s2 = sinon.stub(p2,"pickObjectOfNames");
                s3 = sinon.stub(messageBusMocked,"emit");
            })
            afterEach(()=>{
                s1.restore();
                s2.restore();
                s3.restore();
            })
            it("sends interaction event when something is selected",()=>{
                p1._onInteraction("john", "doe");
                return expect(s3.callCount).eq(1);
            })
            it("sends interaction HUD event when something is selected",()=>{
                p1._onInteraction("john", "doe");
                return expect(s3.getCall(0).args[0]).eq(Events.INTERACTIONS.HUD);
            })
            it("do nothing when none is selected",()=>{
                p2._onInteraction("john", "doe");
                return expect(s3.callCount).eq(0);
            })
        })
    })

   
    
})

describe("Renderers",()=>{
    let messageBusMocked = new EventEmitter();
    
    describe("HudRendererThreeJs",()=>{
        
        let s1:SinonStub;
        let s2:SinonStub;
        let view:PlaygroundViewHudThreeJsDefault;
        let renderer: HudRendererThreeJs;
        let c: HudComponentDefaultThreeJs;
        let c2: HudComponentDefaultThreeJs;
        describe("addComponent",()=>{
            
            beforeEach(()=>{
                view = new PlaygroundViewHudThreeJsDefault(messageBusMocked); 
                view.container = {
                    clientWidth: 100
                }      
                renderer = new HudRendererThreeJs();       
                renderer.setView(view);

                s1 = sinon.stub(renderer,"repositionComponents");
                c = new HudComponentDefaultThreeJs();
                s2 = sinon.stub(view.scene,"add");
            })
            afterEach(()=>{
                s1.restore();
                s2.restore();
            })
            it("adds component to scene",()=>{
                renderer.addComponent(c);
                return expect(s2.callCount).eq(1);

            });
            it("adds component to components list",()=>{
                renderer.addComponent(c);
                return expect(renderer.components[0]).eq(c);
            });

            it("repositions components",()=>{
                renderer.addComponent(c);
                return expect(s1.callCount).eq(1);
            });
            it("shares view cointainer with component",()=>{
                renderer.addComponent(c);
                return expect(c.container).eq(view.container);
            });
        })

        describe("repositionComponents",()=>{

            beforeEach(()=>{
                view = new PlaygroundViewHudThreeJsDefault(messageBusMocked); 
                view.container = {
                    clientWidth: 200,
                    clientHeight: 100
                }               

                renderer = new HudRendererThreeJs();       
                renderer.setView(view);

                c = new HudComponentDefaultThreeJs();
                s1 = sinon.stub(c,"getSize").returns({
                    x: 40,
                    y:40
                })
                c2 = new HudComponentDefaultThreeJs();
                s2 = sinon.stub(c2,"getSize").returns({
                    x: 40,
                    y:40
                })
            })
            afterEach(()=>{
                s1.restore();
                s2.restore();
            })
            it("sets position of all components",()=>{
                renderer.components = [c,c2];                
                renderer.repositionComponents();
                const position = -view.container.clientWidth/2 + (<HudComponentThreeJs>renderer.components[0]).getSize().x!/2;
                
                return expect((<HudComponentThreeJs>renderer.components[0]).object!.position.x).eq(position)

            })
            it("sets position of all components",()=>{
                renderer.components = [c,c2];                
                renderer.repositionComponents();
                const position = -view.container.clientWidth/2 + c.getSize().x! + c2.getSize().x!/2 ;
                return expect((<HudComponentThreeJs>renderer.components[1]).object!.position.x).eq(position)

            })
            it("moves components along x axis according to the component position on the list",()=>{
                renderer.components = [c,c2];                
                renderer.repositionComponents();
                const position = -view.container.clientWidth/2 + c.getSize().x! + c2.getSize().x!/2 ;
                return expect((<HudComponentThreeJs>renderer.components[1]).object!.position.x).eq(position)
            })
            it("starts placing components in the lower, left corner of the view",()=>{
                renderer.components = [c,c2];                
                renderer.repositionComponents();
                
                return expect((<HudComponentThreeJs>renderer.components[0]).object!.position.x).eq(-view.container.clientWidth/2+c.getSize().x!/2)
            })
            it("starts placing components in the lower, left corner of the view",()=>{
                renderer.components = [c,c2];                
                renderer.repositionComponents();
                
                return expect((<HudComponentThreeJs>renderer.components[0]).object!.position.y).eq(-view.container.clientHeight/2+c.getSize().y!/2)
            })
        })
            
        
    })
    describe("HudComponents",()=>{
        describe("HudComponentThreeJs",()=>{
            let c1: HudComponentDefaultThreeJs;
            let c2: HudComponentDefaultThreeJs;
            let ct1: any;
            let o1: THREE.Object3D;
            let o2: THREE.Object3D;
            let perc: number;
    
            describe("resize",()=>{            
                beforeEach(()=>{                
                    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
                    const geometry2 = new THREE.BoxGeometry( 10000, 10000, 10000 );
                    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
                    const cube = new THREE.Mesh( geometry, material );
                    const cube2 = new THREE.Mesh( geometry2, material );
                    o1 = cube;
                    o2 = cube2;
                    c1 = new HudComponentDefaultThreeJs();
                    c2 = new HudComponentDefaultThreeJs();
                    ct1 = {
                        clientWidth: 1000,
                        clientHeight: 500
                    }
                    c1.container = ct1;
                    c2.container = ct1;
                    c1.object = o1;
                    c2.object = o2;
                    perc = 0.1;
                    c1.sizePercentage = perc;
                    c2.sizePercentage = perc;
                })
                it("resizes object accordingly to size percentage - making larger",()=>{
                    c1.resize();                
                    const updatedBBox = new THREE.Box3().setFromObject(c1.object!);
                    const size = new THREE.Vector3();
                    updatedBBox.getSize(size);
                    return expect(JSON.stringify(size)).eq(JSON.stringify(new Vector3(50,50,50)));
                })
                it("resizes object accordingly to size percentage - size is updated",()=>{
                    c1.resize();                
                    const updatedBBox = new THREE.Box3().setFromObject(c1.object!);
                    const size = new THREE.Vector3();
                    updatedBBox.getSize(size);
                    return expect(c1.getSize().x).eq(50);
                })
                it("resizes object accordingly to size percentage - size is updated",()=>{
                    c1.resize();                
                    const updatedBBox = new THREE.Box3().setFromObject(c1.object!);
                    const size = new THREE.Vector3();
                    updatedBBox.getSize(size);
                    return expect(c1.getSize().y).eq(50);
                })
                it("resizes object accordingly to size percentage - making smaller",()=>{
                    c2.resize();                
                    const updatedBBox = new THREE.Box3().setFromObject(c2.object!);
                    const size = new THREE.Vector3();
                    updatedBBox.getSize(size);
                    return expect(JSON.stringify(size)).eq(JSON.stringify(new Vector3(50,50,50)));
                })
            })
        })

    })
    describe("MapQuadRendererThreeJs",()=>{
        let s1: SinonStub;
        let s2: SinonStub;
        let s3: SinonStub;
        let s4: SinonStub;

        let s10: SinonSpy;
        let map: MapQuadRendererThreeJs;
        let view: PlaygroundViewDefault;
        let rf: RenderablesDefaultFactory;
        const width = 40;
        const height = 20; 
        const assets = "https://some.assets.url"
        describe("MapRendererThreeJs", ()=>{
            beforeEach(()=>{
                map = new MapQuadRendererThreeJs(width, height, assets);

            })

            it("sets holder object name",()=>{
                return expect(map.mapHolderObject.name).eq(MapQuadRendererThreeJs.NAME);
            })
        })
        describe("setView",()=>{
            beforeEach(()=>{
                map = new MapQuadRendererThreeJs(width, height, assets);
                view = new PlaygroundViewDefault("name", messageBusMocked);
                view.scene = {
                    add: function(){}
                }
                s1 = sinon.stub(view.scene,"add");
            })
            afterEach(()=>{
                s1.restore();
            })
            it("adds map 3d objects to view for display",()=>{
                map.setView(view);
                return expect(s1.getCall(0).args[0]).eq(map.mapHolderObject)
            })            
        })
        describe("_dispose",()=>{
            let m1: THREE.Mesh;
            // let m2: THREE.Mesh;
            let s1: SinonStub;
            let s2: SinonStub;

            beforeEach(()=>{
                map = new MapQuadRendererThreeJs(width, height, assets);
                m1 = new THREE.Mesh(new THREE.BoxGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0xffff00 } ))
                s1 = sinon.stub(m1.geometry,"dispose");
                s2 = sinon.stub(<THREE.Material>m1.material,"dispose");
            })
            afterEach(()=>{
                s1.restore();
                s2.restore();
            })
            it("release memory for geometry",()=>{
                map._dispose(m1);
                return expect(s1.callCount).eq(1);
            })
            it("release memory for material",()=>{
                map._dispose(m1);
                return expect(s2.callCount).eq(1);
            })            
        })
        describe("initialize",()=>{
            beforeEach(()=>{
                map = new MapQuadRendererThreeJs(width, height, assets);
                rf = new RenderablesDefaultFactory();
                map.setRenderablesFactory(rf);
                s1 = sinon.stub(rf,"loadRenderablesObjectsTemplate").resolves();
            })
            afterEach(()=>{
                s1.restore();
            })
            it("loads templates",()=>{
                return map.initialize().then(()=>{
                    return expect(s1.callCount).eq(1);
                })
                
            })  
            it("loads 'C_' or 'instance' named templates",()=>{
                return map.initialize().then(()=>{
                    return expect(JSON.stringify(s1.getCall(0).args[1])).eq(JSON.stringify(["C_","instance"]));
                })
            })          
        })
        describe("onTileChanged",()=>{
            beforeEach(()=>{
                map = new MapQuadRendererThreeJs(width, height, assets);
                rf = new RenderablesDefaultFactory();
                map.setRenderablesFactory(rf);
                s1 = sinon.stub(map,"replace");
            })
            afterEach(()=>{
                s1.restore();
            })
            it("replaces tile",()=>{
                
                map.onTileChanged({id: "id", t: "t", x:1, y: 1},"W");
                return expect(s1.callCount).eq(1);
            })
        })
        describe("replace",()=>{
            beforeEach(()=>{
                map = new MapQuadRendererThreeJs(width, height, assets);
                s1 = sinon.stub(map,"remove");
                s2 = sinon.stub(map,"put");
            })
            afterEach(()=>{
                s1.restore();
                s2.restore();
            })
            it("removes",()=>{
                map.replace({id: "id", t: "t", x:1, y: 1},"W");
                return expect(s1.callCount).eq(1);
            })
            it("adds",()=>{
                map.replace({id: "id", t: "t", x:1, y: 1},"W");
                return expect(s2.callCount).eq(1);
            })
        })
        describe("remove",()=>{
            const holder = new THREE.Object3D();
            beforeEach(()=>{     
                map = new MapQuadRendererThreeJs(width, height, assets);           
                const item1 = new THREE.Object3D();
                item1.userData = {
                    tileData: {
                        x: 1,
                        y: 1
                    }
                };
                
                const item2 = new THREE.Object3D();
                item2.userData = {
                    tileData: {
                        x: 2,
                        y: 2
                    }
                };
                const item3 = new THREE.Object3D();
                item3.userData = {
                    tileData: {
                        x: 3,
                        y: 3
                    }
                };
                item1.add(item3);
                

                holder.add(item1);
                holder.add(item2);

                map.mapHolderObject = holder;

                s1 = sinon.stub(holder,"remove");
                s2 = sinon.stub(map,"_dispose");
            })
            afterEach(()=>{
                s1.restore();
                s2.restore();
            })
            it("removes when object exists",()=>{
                map.remove({id: "id", t: "t", x:1, y: 1});
                return expect(s1.callCount).eq(1);
            })
            it("disposes memory for object and it's children",()=>{
                map.remove({id: "id", t: "t", x:1, y: 1});
                return expect(s2.callCount).eq(2);
            })
            it("does nothing when object does not exist",()=>{
                map.remove({id: "id", t: "t", x:4, y: 4});
                return expect(s1.callCount).eq(0);
            })
        })
        describe("put",()=>{
            beforeEach(()=>{
                map = new MapQuadRendererThreeJs(width, height, assets);           
                rf = new RenderablesDefaultFactory();
                map.setRenderablesFactory(rf);

                s1 = sinon.stub(map,"xyToScenePosition").returns({
                    x: 100, y: 100, z: 100
                })
                s10 = sinon.spy(map.mapHolderObject,"add");
                s3 = sinon.stub(map,"_directionRotate");
                s4 = sinon.stub(rf,"spawnRenderableObject").returns({
                    data: new THREE.Object3D(),
                    name:"name"
                });
            })
            afterEach(()=>{
                s1.restore();
                s2.restore();
                s3.restore();
                s4.restore();
            })
            it("spawns proper tile 3d object",()=>{
                map.put({id: "id", t: "t", x:4, y: 4},"W");
                return expect(s4.callCount).eq(1);
            })
            it("calculates 3d object position on scene accordingly to its tile x,y",()=>{
                map.put({id: "id", t: "t", x:4, y: 4},"W");
                return expect(s1.callCount).eq(1);
            })
            it("add tile to map holder",()=>{
                map.put({id: "id", t: "t", x:4, y: 4},"W");
                return expect(s10.callCount).eq(1);
            })
            it("positions the object on scene",()=>{
                map.put({id: "id", t: "t", x:4, y: 4},"W");                
                return expect(map.mapHolderObject.children[0].position.x).eq(100);
            })
            it("rotates object on scene",()=>{
                map.put({id: "id", t: "t", x:4, y: 4},"W");
                return expect(s3.callCount).eq(1);
            })
            it("annotates object with tile data",()=>{
                map.put({id: "id", t: "t", x:4, y: 4},"W");                
                return expect(map.mapHolderObject.children[0].userData.tileData.id).eq("id");
            })
            it("defaults to S-south when none provided",()=>{
                map.put({id: "id", t: "t", x:4, y: 4});                
                return expect(s3.getCall(0).args[1]).eq("S");
            })
        })
        describe("xyToScenePosition",()=>{
            beforeEach(()=>{
                map = new MapQuadRendererThreeJs(width, height, assets); 
            })
            it("positions upper left tile",()=>{
                const r = map.xyToScenePosition(0,0);                
                return expect(JSON.stringify(r)).eq(JSON.stringify({
                    x: -map.width/2+map.tileSize/2, y: map.height/2-map.tileSize/2, z: 0
                }))
            })
            it("positions upper right tile",()=>{
                const r = map.xyToScenePosition(0,39);
                return expect(JSON.stringify(r)).eq(JSON.stringify({
                    x: map.width/2-map.tileSize/2, y: map.height/2-map.tileSize/2, z: 0
                }))
            })
            it("positions lower left tile",()=>{
                const r = map.xyToScenePosition(19,0);
                return expect(JSON.stringify(r)).eq(JSON.stringify({
                    x: -map.width/2+map.tileSize/2, y: -map.height/2+map.tileSize/2, z: 0
                }))
            })
            it("positions lower right tile",()=>{
                const r = map.xyToScenePosition(19,39);
                return expect(JSON.stringify(r)).eq(JSON.stringify({
                    x: map.width/2-map.tileSize/2, y: -map.height/2+map.tileSize/2, z: 0
                }))
            })
            it("positions center tile",()=>{
                const r = map.xyToScenePosition(9,19);
                return expect(JSON.stringify(r)).eq(JSON.stringify({
                    x: -map.tileSize/2, y: map.tileSize/2, z: 0
                }))
            })
        })
        describe("_directionRotate",()=>{
            const o = new THREE.Object3D();
            beforeEach(()=>{
                s1 = sinon.stub(o,"rotateZ");
            })
            afterEach(()=>{
                s1.restore();
            })
            it("rotates 180 degree along z-axis for N-north",()=>{                
                map._directionRotate(o,"N");
                return expect(s1.getCall(0).args[0]).eq(THREE.MathUtils.degToRad(180));
            })
            it("rotates -90 degree along z-axis for W-west",()=>{                
                map._directionRotate(o,"W");
                return expect(s1.getCall(0).args[0]).eq(THREE.MathUtils.degToRad(-90));
            })
            it("rotates 90 degree along z-axis for E-east",()=>{                
                map._directionRotate(o,"E");
                return expect(s1.getCall(0).args[0]).eq(THREE.MathUtils.degToRad(90));
            })
            it("does nothing for S-south as this is default orientation for tile",()=>{                
                map._directionRotate(o,"S");
                return expect(s1.callCount).eq(0);
            })
        })
    })
    describe("HudComponentMapNavigationThreeJs",()=>{
        let s1: SinonStub;
        let s2: SinonStub;
        // let s3: SinonStub;
        // let s4: SinonStub;

        // let s10: SinonSpy;
        let c: HudComponentMapNavigationThreeJs;

        describe("build",()=>{
            beforeEach(()=>{
                c = new HudComponentMapNavigationThreeJs("https://some.url");
                s1 = sinon.stub(c.buttonsFactory,"initialize").resolves();
                s2 = sinon.stub(c.buttonsFactory,"getInstance");
                s2.onCall(0).returns(new THREE.Sprite());
                s2.onCall(1).returns(new THREE.Sprite());
                s2.onCall(2).returns(new THREE.Sprite());
                s2.onCall(3).returns(new THREE.Sprite());
            })
            afterEach(()=>{
                s1.restore();
                s2.restore();
            })
            it("makes nav component height 3",()=>{
                return c.build().then(()=>{
                    return expect(c.getSize().y).eq(3);
                })
            })
            it("makes nav component width 3",()=>{
                return c.build().then(()=>{
                    return expect(c.getSize().x).eq(3);
                })
            })
            it("adds four buttons/sprites",()=>{
                return c.build().then(()=>{
                    return expect(c.object!.children.length).eq(4);
                })
            })
            it("up button position is set accordingly",()=>{
                return c.build().then(()=>{
                    return expect(JSON.stringify(c.object!.children[0].position)).eq(JSON.stringify({x: 0, y: 1, z:0}));
                })
            })
            it("down button position is set accordingly",()=>{
                return c.build().then(()=>{
                    return expect(JSON.stringify(c.object!.children[3].position)).eq(JSON.stringify({x: 0, y: -1, z:0}));
                })
            })
            it("left button position is set accordingly",()=>{
                return c.build().then(()=>{
                    return expect(JSON.stringify(c.object!.children[1].position)).eq(JSON.stringify({x: -1, y: 0, z:0}));
                })
            })
            it("right button position is set accordingly",()=>{
                return c.build().then(()=>{
                    return expect(JSON.stringify(c.object!.children[2].position)).eq(JSON.stringify({x: 1, y: 0, z:0}));
                })
            })
            it("populates hud object with newly created controls",()=>{
                return c.build().then(()=>{
                    return expect(c.object!.children.length).eq(4);
                })
            })
            it("uses 'COMP_HUD_NAV' as name for this component", ()=>{
                return c.build().then(()=>{
                    return expect(c.object!.name).eq("COMP_HUD_NAV");
                })
            })
        })
    })
    describe("RenderablesThreeJSFactory",()=>{
        let s1:SinonStub;
        let s2:SinonStub;

        let s10:SinonSpy;

        let rf: RenderablesFactory;
        let rf2: RenderablesFactory;
        let l: any;
        let l2: any;
        let s: THREE.Scene;
        const T1:string = "TEMPLATE_1";
        const T2:string = "TEMPLATE_2";
        let o1: THREE.Object3D;
        let o2: THREE.Object3D;
        let o3: THREE.Object3D;
        describe("spawnRenderableObject",()=>{
            beforeEach(()=>{
                l = {
                    load(){}
                }
                o1 = new THREE.Object3D();
                o2 = new THREE.Object3D();

                rf = new RenderablesThreeJSFactory(l);
                (<RenderablesThreeJSFactory>rf).templates.set(T1,o1);
                (<RenderablesThreeJSFactory>rf).templates.set(T2,o2);
                s1 = sinon.stub(o1,"clone").returns(o1);  
                s2 = sinon.stub((<RenderablesThreeJSFactory>rf),"_cloneMaterials");      
            })
            afterEach(()=>{
                s1.restore();
                s2.restore();
            })
            it("throws error on nonexisting template",()=>{                
                return expect(()=>{rf.spawnRenderableObject.bind(rf)("T3")}).to.throw("No template found");                                      
            })
            it("clones object from template",()=>{
                rf.spawnRenderableObject(T1);
                return expect(s1.callCount).eq(1);
            })
            it("clones object materials from template",()=>{
                rf.spawnRenderableObject(T1);
                return expect(s2.callCount).eq(1);
            })
            it("enables shadows",()=>{
                const spawned = rf.spawnRenderableObject(T1);
                const shadows = (<THREE.Object3D>spawned.data).castShadow && (<THREE.Object3D>spawned.data).receiveShadow;
                return expect(shadows).is.true;
            })
        })
        describe("loadRenderablesObjectsTemplate",()=>{
            beforeEach(()=>{
                s = new THREE.Scene();
                o1 = new THREE.Object3D();
                o1.name = "SomeName"
                o2 = new THREE.Object3D();
                o2.name = "HitMe"
                s.add(o1);
                // nested, descendant object
                o1.add(o2);
                l = {
                    load(_a1:any,a2:any,_a3:any,_a4:any){
                        a2({scene:s})
                    }
                }
                rf = new RenderablesThreeJSFactory(l);
                s1 = sinon.stub((<RenderablesThreeJSFactory>rf),"_matchingChildren").returns([o1]);
                s2 = sinon.stub((<RenderablesThreeJSFactory>rf),"_addTemplate")

                l2 = {
                    load(_a1:any,_a2:any,_a3:any,a4:any){
                        a4("Some error occured")
                    }
                }
                rf2 = new RenderablesThreeJSFactory(l2);

            })
            afterEach(()=>{
                s1.restore();
                s2.restore();
            })
            it("applies name test on objects",()=>{
                return rf.loadRenderablesObjectsTemplate("",["SomeName"]).then(()=>{
                    return expect(s1.callCount).eq(1);
                })

            })
            it("applies name test on scene and all scene descendant objects",()=>{
                return rf.loadRenderablesObjectsTemplate("",["SomeName"]).then(()=>{
                    return expect(s1.getCall(0).args[0].length).eq(3);
                })

            })
            it("adds template from matching objects",()=>{
                return rf.loadRenderablesObjectsTemplate("",["SomeName"]).then(()=>{
                    return expect(s2.getCall(0).args[1]).eq(o1);
                })
            })
            it("rejects on error",()=>{
                return rf2.loadRenderablesObjectsTemplate("",["SomeName"]).should.be.rejectedWith("Some error")
            })
        })
        describe("_matchingChildren",()=>{
            beforeEach(()=>{
                l = {
                    load(){}
                }
                o1 = new THREE.Object3D();
                o1.type = "OBJECT3D"
                o1.name = "My fancy name"
                o2 = new THREE.Object3D();
                o2.type = "Scene"
                o2.name = "Scene"
                o3 = new THREE.Object3D();
                o3.type = "Object3D"
                o3.name = "My other name is"

                rf = new RenderablesThreeJSFactory(l);
            })
            it("returns items of type Object3D when no names provided",()=>{
                const result = (<RenderablesThreeJSFactory>rf)._matchingChildren([o1,o2,o3],[]);
                return expect(result.length).eq(2);
            })

            it("returns items whose name contains any of the names provided",()=>{
                const result = (<RenderablesThreeJSFactory>rf)._matchingChildren([o1,o2,o3],["Fancy"]);
                return expect(result[0]).eq(o1);
            })
        })
        describe("_cloneMaterials",()=>{
            let material:THREE.MeshBasicMaterial;
            let material2:THREE.MeshBasicMaterial;

            beforeEach(()=>{
                l = {
                    load(){}
                }
                rf = new RenderablesThreeJSFactory(l);

                const geometry = new THREE.BoxGeometry( 1, 1, 1 );
                material  = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
                o1 = new THREE.Mesh( geometry, material );
                const geometry2 = new THREE.BoxGeometry( 1, 1, 1 );
                material2 = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
                o2 = new THREE.Mesh( geometry2, material2 );

                o1.add(o2);

                o3 = new THREE.Object3D();

                s10 = sinon.spy(<RenderablesThreeJSFactory>rf,"_cloneMaterials");
            })
            afterEach(()=>{
                s10.restore();                
            })
            it("clones the material",()=>{
                (<RenderablesThreeJSFactory>rf)._cloneMaterials(<THREE.Mesh>o2);
                return expect(material2).not.eq((<THREE.Mesh>o2).material);                
            })
            it("makes sure that all descendants also have their materials cloned",()=>{
                (<RenderablesThreeJSFactory>rf)._cloneMaterials(<THREE.Mesh>o1);
                return expect(material2).not.eq((<THREE.Mesh>o2).material);                
            })
            it("skips non mesh objects",()=>{
                (<RenderablesThreeJSFactory>rf)._cloneMaterials(<THREE.Mesh>o3);
                return expect(s10.callCount).eq(1);
            })
        })
        describe("_addTemplate",()=>{
            beforeEach(()=>{
                l = {
                    load(){}
                }
                rf = new RenderablesThreeJSFactory(l);
                o1 = new THREE.Object3D();
            })
            it("adds template",()=>{
                (<RenderablesThreeJSFactory>rf)._addTemplate("somename",o1);

                return expect( (<RenderablesThreeJSFactory>rf).templates.get("somename")).eq(o1);
            })
        })
    })
})


