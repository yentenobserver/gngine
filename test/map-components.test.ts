import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'


chai.should();
chai.use(chaiAsPromised);

// const assert = chai.assert;

const expect = chai.expect;

// Sinon is a library used for mocking or verifying function calls in JavaScript.
import sinon, { SinonStub} from 'sinon';


// import * as THREE from 'three'
import {MapHexBaseComponent3JS} from "../src/components/map-component"
import { EventEmitter} from 'eventemitter3';
import { RENDERABLES } from '../src/gui/renderer/assets/threejs3d.notest';
import { MapSpecs } from '../src/specification/map-specs';


// import {AppEventsMocks, MapEventMocks, UnitsMocks} from './data.mock'

describe("High Level Map Components",()=>{
    let canvas = {                
        nodeName: "CANVAS",
        addEventListener(){}
    }
    let emitter = new EventEmitter();

    describe("No Setup Maps",()=>{
        describe("Hexagonal Map",()=>{
            let mapComponent:MapHexBaseComponent3JS;
            let mapComponent2:MapHexBaseComponent3JS;
            let s1: SinonStub;
            let s2: SinonStub;
            let s3: SinonStub;
            let s4: SinonStub;
            let s5: SinonStub;
            let s6: SinonStub;
            
            
            let specs: MapSpecs;

            beforeEach(()=>{
                mapComponent = new MapHexBaseComponent3JS(emitter);
                mapComponent2 = new MapHexBaseComponent3JS(emitter);
                specs = {
                    address: "",
                    id: "1",
                    kind: "HexTile",
                    latlon: ["2","2"],
                    name:"name",
                    size:"2x2",
                    tags:[]
                }
                s1 = sinon.stub(mapComponent,"registerIndicator");
                s2 = sinon.stub(mapComponent, "_mapDefaults");
                s3 = sinon.stub(mapComponent, "_prepare");
                s4 = sinon.stub(mapComponent2, "_prepareFactory");
                s5 = sinon.stub(mapComponent2, "_prepareRenderer");
                s6 = sinon.stub(mapComponent2, "_preparePlaygroundAndView");
                
                
            })
            afterEach(()=>{
                s1.restore();
                s2.restore();
                s3.restore();
                s4.restore();
                s5.restore();

                s6.restore();
                
                
            })
            it("prepares necessary engine components",async ()=>{
                const map = mapComponent2._mapDefaults(specs);

                s4.resolves({});
                s5.resolves({
                    put(){}
                });
                s6.resolves({});

                await mapComponent2._prepare(map, [], canvas, emitter, {});

                expect(s4.callCount).eq(1);
                expect(s5.callCount).eq(1);
                expect(s6.callCount).eq(1);
            })
            it("is populated with transparent tile, with no asset references, using specs provided and with highlighter",async ()=>{
                await mapComponent._internalPrepare(specs, canvas, emitter);
                expect(s2.callCount).eq(1);
                expect(s3.callCount).eq(1);
                expect(s1.callCount).eq(1);
                expect(s2.getCall(0).args[0]).eq(specs);
                
                expect(s3.getCall(0).args[2]).eq(canvas);
                expect(s3.getCall(0).args[3]).eq(emitter);
                expect(s1.getCall(0).args[0]).eq("H3D_Highlighter");
            })
            it("provides transparent tiles by default",async ()=>{
                
                const renderablesSpecification = mapComponent._tileRenderables();

                expect(renderablesSpecification.length).eq(3);
                expect(renderablesSpecification[1].json).eq(JSON.stringify(RENDERABLES.MAP.HEX.transparent));
                expect(renderablesSpecification[2].json).eq(JSON.stringify(RENDERABLES.MAP.HEX.transparent_full));
                expect(JSON.stringify(renderablesSpecification[1].filterByNames)).eq(JSON.stringify(["MAS_TRANSPARENT_TILE"]));
                expect(JSON.stringify(renderablesSpecification[2].filterByNames)).eq(JSON.stringify(["MAS_TRANSPARENT_FULL_TILE"]));

            });
            it("has default H3D_Highlighter set up",async ()=>{                    
                await mapComponent._internalPrepare(specs, canvas, emitter)                            

                expect(s1.callCount).eq(1);
                expect(s1.getCall(0).args[0]).eq("H3D_Highlighter");
            });
            it("autopopulates necessary number of tile elements",()=>{
                const tiles = mapComponent._tiles(specs);
                expect(tiles.length).eq(4);
            })
            it("autopopulates tiles with TRANSPARENT tile with UNDEFINED kind",()=>{
                const tiles = mapComponent._tiles(specs);
                expect(tiles[1].r).eq("MAS_TRANSPARENT_TILE");
                expect(tiles[1].t.kind).eq("UNDEFINED")
            })
            it("autopopulates tiles with provided renderable tile (in options) with UNDEFINED kind",()=>{
                specs.options = {
                    defaultTileRenderable: "MAS_TRANSPARENT_FULL_TILE"
                }
                const tiles = mapComponent._tiles(specs);
                expect(tiles[1].r).eq("MAS_TRANSPARENT_FULL_TILE");
                expect(tiles[1].t.kind).eq("UNDEFINED")
            })
        })
    })
})