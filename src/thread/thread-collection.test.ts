import { ThreadCollection, ParseBodyForThreads } from "./thread-collection"
import * as fs from 'fs'

// This a test file for use with Jest

const testHTMLPath = "./test.html"

describe('ThreadCollection', ()=>{

    interface testCase {
        input: any,
        results: number
    }

    // There shouldn't be any DOM manipulation here since all tests share
    // the same HTML
    beforeAll(()=>{
        document.body.innerHTML = fs.readFileSync(testHTMLPath).toString('utf8');
    });

    test('collects all comment threads in a ThreadCollection', ()=>{    
        const elCount = 4;
        const coll = ParseBodyForThreads(document.getElementsByTagName('body')[0]);
        expect(coll.elements.length).toEqual(elCount);
    });

    test('returns names of authors for the final comments within comment threads', ()=>{
        const expected: Array<string> = ["Paul Gottschling", "Foo Bar"];
        const coll = ParseBodyForThreads(document.getElementsByTagName('body')[0]);
        const actual: Array<string> = coll.finalCommentAuthorNames();
        expect(actual).toEqual(expect.arrayContaining(expected));
        expect(actual.length).toEqual(expected.length);
    })

})
