import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'


chai.should();
chai.use(chaiAsPromised);

// const assert = chai.assert;
const expect = chai.expect;

// Sinon is a library used for mocking or verifying function calls in JavaScript.
// import sinon, { SinonStub } from 'sinon';

import anonymise from '../src/mgr'

describe('Anonymise lib', () => {
    describe('anonymise()', () => {   
        let INPUT = 'hello world';
        let INPUT_MULTI = `
        
        some crazy

        multiline imput
        
        `
        let INPUT_SPECIAL = '\n\n\n\n\n\n\n\t\t\t';
        let SYMBOL = '*';
        let HOW_MANY = 7;
        let EXTERNAL_KEY = 'x909as9ds';         
        beforeEach(() => {             
        });
        afterEach(() => {                  
        });

        it('invalid input and symbol', () => {     
            return expect(()=>{anonymise(INPUT, SYMBOL, INPUT.length+10)}).to.throw('Cant anonymise more chars than the input length');                      
        })
        it('invalid symbol', () => {     
            return expect(()=>{anonymise(INPUT, '', INPUT.length+10)}).to.throw('Symbol must be of length 1');                      
        })
        it('undefined symbol', () => {     
            return expect(()=>{anonymise(INPUT, undefined, INPUT.length+10)}).to.throw('Symbol must be of length 1');                      
        })
        it('by default anonymise half the chars', () => {    
            let record = anonymise(INPUT, SYMBOL);
            let rexp = new RegExp('\\'+SYMBOL,"gim")            
            return expect((record.v.match(rexp) || []).length).eq(Math.ceil(INPUT.length/2))
        })
        it('number of chars for anonymisation is provided', () => {    
            let record = anonymise(INPUT, SYMBOL, HOW_MANY);
            let rexp = new RegExp('\\'+SYMBOL,"gim")            
            return expect((record.v.match(rexp) || []).length).eq(HOW_MANY)
        })
        it('record key is generated when external key is not provided', () => {    
            let record = anonymise(INPUT, SYMBOL, HOW_MANY);            
            return expect(record.k).is.not.undefined;
        })
        it('external key is used when provided', () => {    
            let record = anonymise(INPUT, SYMBOL, HOW_MANY, EXTERNAL_KEY);                        
            return expect(record.k).eq(EXTERNAL_KEY);
        })
        it('multiline input', () => {    
            let record = anonymise(INPUT_MULTI, SYMBOL, HOW_MANY);
            let rexp = new RegExp('\\'+SYMBOL,"gim") 
            return expect((record.v.match(rexp) || []).length).eq(HOW_MANY)
        })
        it('special chars input', () => {    
            let record = anonymise(INPUT_SPECIAL, SYMBOL, HOW_MANY);
            let rexp = new RegExp('\\'+SYMBOL,"gim") 
            return expect((record.v.match(rexp) || []).length).eq(HOW_MANY)
        })
        
    })
  
})