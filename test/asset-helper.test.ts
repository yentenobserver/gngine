import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'


chai.should();
chai.use(chaiAsPromised);

// const assert = chai.assert;

const expect = chai.expect;

// Sinon is a library used for mocking or verifying function calls in JavaScript.
import sinon, { SinonSpy} from 'sinon';



import {RenderablesFactory, RenderablesThreeJSFactory} from "../src/gui/renderer/renderables-factory";
import {ThreeJSHexAssetHelper} from "../src/assets/asset-helper"
import {Asset} from "../src/specification/assets"
import { ASSETS, ASSET_RENDERABLE_JSONS } from './data/assets-test.notest';



describe("Asset Helper",()=>{        
    describe("For Hexagonal Maps",()=>{
        describe("Simple Asset Creation",()=>{
            let helper: ThreeJSHexAssetHelper;
            let factory: RenderablesFactory;

            let s1: SinonSpy;

            beforeEach(()=>{
                helper = new ThreeJSHexAssetHelper();
                factory = new RenderablesThreeJSFactory({});
                s1 = sinon.spy(factory, "setSpecifications");
            })
            afterEach(()=>{
                s1.restore();
            })
            it("creates spawnable asset",async ()=>{
                const asset = await helper.asset("my fancy asset", "my fancy asset description", ASSET_RENDERABLE_JSONS.OBJECT_MY_FANCY_ASSET, "data:image/png;base64,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OmNyZWF0ZQAyMDE4LTAzLTIzVDE4OjI5OjU2KzAxOjAwbWEneAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0wMy0yM1QxODoyOTo1NiswMTowMBw8n8QAAABGdEVYdHNvZnR3YXJlAEltYWdlTWFnaWNrIDYuNy44LTkgMjAxNi0wNi0xNiBRMTYgaHR0cDovL3d3dy5pbWFnZW1hZ2ljay5vcmfmvzS2AAAAGHRFWHRUaHVtYjo6RG9jdW1lbnQ6OlBhZ2VzADGn/7svAAAAGHRFWHRUaHVtYjo6SW1hZ2U6OmhlaWdodAA1MTLA0FBRAAAAF3RFWHRUaHVtYjo6SW1hZ2U6OldpZHRoADUxMhx8A9wAAAAZdEVYdFRodW1iOjpNaW1ldHlwZQBpbWFnZS9wbmc/slZOAAAAF3RFWHRUaHVtYjo6TVRpbWUAMTUyMTgyNjE5NlVLtfUAAAATdEVYdFRodW1iOjpTaXplADcuNjJLQkIy+IigAAAAQnRFWHRUaHVtYjo6VVJJAGZpbGU6Ly8uL3VwbG9hZHMvNTYvVGp0YUdIMC8xMzc4L2ltYWdlbWlzc2luZ185MjgzMi5wbmevo26OAAAAAElFTkSuQmCC")
                expect(asset.specs.kind).eq("HexTile")
                expect(asset.specs.id).is.not.undefined;
                expect(asset.specs.description).is.not.undefined;                
            })
            it("creates spawnable asset even when the renderable json contains other objects",async ()=>{
                const asset = await helper.asset("my fancy asset", "my fancy asset description", ASSET_RENDERABLE_JSONS.SCENE_WITH_MY_FANCY_ASSET, "data:image/png;base64,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OmNyZWF0ZQAyMDE4LTAzLTIzVDE4OjI5OjU2KzAxOjAwbWEneAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0wMy0yM1QxODoyOTo1NiswMTowMBw8n8QAAABGdEVYdHNvZnR3YXJlAEltYWdlTWFnaWNrIDYuNy44LTkgMjAxNi0wNi0xNiBRMTYgaHR0cDovL3d3dy5pbWFnZW1hZ2ljay5vcmfmvzS2AAAAGHRFWHRUaHVtYjo6RG9jdW1lbnQ6OlBhZ2VzADGn/7svAAAAGHRFWHRUaHVtYjo6SW1hZ2U6OmhlaWdodAA1MTLA0FBRAAAAF3RFWHRUaHVtYjo6SW1hZ2U6OldpZHRoADUxMhx8A9wAAAAZdEVYdFRodW1iOjpNaW1ldHlwZQBpbWFnZS9wbmc/slZOAAAAF3RFWHRUaHVtYjo6TVRpbWUAMTUyMTgyNjE5NlVLtfUAAAATdEVYdFRodW1iOjpTaXplADcuNjJLQkIy+IigAAAAQnRFWHRUaHVtYjo6VVJJAGZpbGU6Ly8uL3VwbG9hZHMvNTYvVGp0YUdIMC8xMzc4L2ltYWdlbWlzc2luZ185MjgzMi5wbmevo26OAAAAAElFTkSuQmCC")
                expect(asset.specs.kind).eq("HexTile")
                expect(asset.specs.id).is.not.undefined;
                expect(asset.specs.description).is.not.undefined;                
            })
            it("creates default thumbnail when not provided",async ()=>{
                const asset = await helper.asset("my fancy asset", "my fancy asset description", ASSET_RENDERABLE_JSONS.SCENE_WITH_MY_FANCY_ASSET)
                expect(asset.variant.thumbnail).is.not.undefined;
            });
            it("creates variant fullName by translating name into uppercase with _",async ()=>{
                const asset = await helper.asset("my fancy asset", "my fancy asset description", ASSET_RENDERABLE_JSONS.OBJECT_MY_FANCY_ASSET, "data:image/png;base64,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OmNyZWF0ZQAyMDE4LTAzLTIzVDE4OjI5OjU2KzAxOjAwbWEneAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0wMy0yM1QxODoyOTo1NiswMTowMBw8n8QAAABGdEVYdHNvZnR3YXJlAEltYWdlTWFnaWNrIDYuNy44LTkgMjAxNi0wNi0xNiBRMTYgaHR0cDovL3d3dy5pbWFnZW1hZ2ljay5vcmfmvzS2AAAAGHRFWHRUaHVtYjo6RG9jdW1lbnQ6OlBhZ2VzADGn/7svAAAAGHRFWHRUaHVtYjo6SW1hZ2U6OmhlaWdodAA1MTLA0FBRAAAAF3RFWHRUaHVtYjo6SW1hZ2U6OldpZHRoADUxMhx8A9wAAAAZdEVYdFRodW1iOjpNaW1ldHlwZQBpbWFnZS9wbmc/slZOAAAAF3RFWHRUaHVtYjo6TVRpbWUAMTUyMTgyNjE5NlVLtfUAAAATdEVYdFRodW1iOjpTaXplADcuNjJLQkIy+IigAAAAQnRFWHRUaHVtYjo6VVJJAGZpbGU6Ly8uL3VwbG9hZHMvNTYvVGp0YUdIMC8xMzc4L2ltYWdlbWlzc2luZ185MjgzMi5wbmevo26OAAAAAElFTkSuQmCC")
                expect(asset.variant.fullName).eq("MY_FANCY_ASSET");                
            })

            it("throws error when asset is not spawnable (i.e. asset json does not match asset's variant fullName)",()=>{
                return helper.asset("my duper asset", "my fancy asset description", ASSET_RENDERABLE_JSONS.SCENE_WITH_MY_FANCY_ASSET).should.be.rejectedWith('Can\'t create asset');                                   
            })
            it("uses default pivot and scaling", async ()=>{
                await helper.registerAsset((<Asset>ASSETS.ASSET_1), factory);
                expect(s1.getCall(0).args[0][0].autoPivotCorrection).is.true;
                expect(s1.getCall(0).args[0][0].scaleCorrection.autoFitSize).eq(1);
            })
            it("uses variant full name as object filter", async ()=>{
                await helper.registerAsset((<Asset>ASSETS.ASSET_1), factory);
                expect(s1.getCall(0).args[0][0].filterByNames[0]).eq(ASSETS.ASSET_1.variant.fullName);                
            })
        })        
    })
})