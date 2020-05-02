import { ThreadCollection } from "./thread-collection"
import * as fs from 'fs'

// This a test file for use with Jest

const testHTMLPath = "./test.html"

describe('filtering comment threads', ()=>{

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
        const coll = new ThreadCollection(document.getElementsByTagName('body')[0]);
        expect(coll.elements.length).toEqual(elCount);
    });
    
    test('filters threads by the author of the final comment', ()=>{
        const authorCases: Array<testCase> = [
            {
                input: "Paul Gottschling",
                results: 2
            },
            {
                input: "Foo Bar",
                results: 2
            },
            {
                input: "Blargh Blargh",
                results: 0
            }
        ]

        authorCases.forEach(ac=>{
            const tc = new ThreadCollection(document.getElementsByTagName('body')[0])
            expect(tc.filterByAuthor(ac.input).length).toEqual(ac.results);
        })
    });

    test('filters threads by regular expression', ()=>{
        const regexpCases: Array<testCase> = [
            {
                input: "[][", // An invalid case
                results: 0
            },
            {
                input: "/.*reply/",
                results: 2
            },
            {
                input: ".*reply", // It shouldn't matter of there's a solidus
                results: 2
            },
            {
                input: "", // Matches everything
                results: 4
            },
            
        ]

        regexpCases.forEach(rc=>{
            const tc = new ThreadCollection(document.getElementsByTagName('body')[0])
            expect(tc.filterByRegExp(rc.input).length).toEqual(rc.results);
        })
    })

    test('filters threads to show only suggestion threads', ()=>{
        const sugCount = 2;
        const col = new ThreadCollection(document.getElementsByTagName('body')[0]);

        expect(col.filterToSuggestions().length).toEqual(sugCount);
    })

    test('filters threads to show only comment threads', ()=>{
        const commentCount = 2;
        const col = new ThreadCollection(document.getElementsByTagName('body')[0]);

        expect(col.filterToComments().length).toEqual(commentCount);
    })

    test('chains filters together', ()=>{
        const col = new ThreadCollection(document.getElementsByTagName('body')[0]);
        const cases: Array<testCase> = [
            {
                input: [
                    [col.filterByAuthor, "Paul Gottschling"],
                    [col.filterToSuggestions, null]
                ],
                results: 1
            },
            {
                input: [
                    [col.filterByAuthor, "Foo Bar"],
                    [col.filterByRegExp, "resp.*"]
                ],
                results: 1
            }
        ]

        cases.forEach(c=>{
            expect(col.chain(c.input).length).toEqual(c.results);
        })

    })
})
