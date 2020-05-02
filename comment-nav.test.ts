import { ThreadCollection } from "./thread-collection"
import * as fs from 'fs'

// This a test file for use with Jest

const testHTMLPath = "./test.html"

describe('filtering comment threads', ()=>{

    // There shouldn't be any DOM manipulation here since all tests share
    // the same HTML
    beforeAll(()=>{
        document.body.innerHTML = fs.readFileSync(testHTMLPath).toString('utf8');
    });

    test('collects all comment threads in a ThreadCollection', ()=>{    
        const elCount = 4;
        const coll = new ThreadCollection(document.getElementsByTagName('body')[0]);
        expect(coll.elements.length).toEqual(elCount);
    });
    
    test('filters threads by the author of the final comment', ()=>{
        interface authorCase {
            name: string,
            instances: number
        }

        const authorCases: Array<authorCase> = [
            {
                name: "Paul Gottschling",
                instances: 2
            },
            {
                name: "Foo Bar",
                instances: 2
            },
            {
                name: "Blargh Blargh",
                instances: 0
            }
        ]

        authorCases.forEach(ac=>{
            const tc = new ThreadCollection(document.getElementsByTagName('body')[0])
            expect(tc.filterByAuthor(ac.name).length).toEqual(ac.instances);
        })
    });

    test('filters threads by regular expression', ()=>{
        interface regexpCase{
            input: string,
            instances: number
        }

        const regexpCases: Array<regexpCase> = [
            {
                input: "&&&&&", // An invalid case
                instances: 0
            },
            {
                input: "/.*reply/",
                instances: 2
            }
        ]

        regexpCases.forEach(rc=>{
            const tc = new ThreadCollection(document.getElementsByTagName('body')[0])
            expect(tc.filterByRegExp(rc.input).length).toEqual(rc.instances);
        })
    })
})
