import { ThreadCollection } from "./thread-collection"
import * as fs from 'fs'

// This a test file for use with Jest

const testHTMLPath = "./test.html"

test('collects all comment threads in a ThreadCollection', ()=>{

    const elCount = 4;

    document.body.innerHTML = fs.readFileSync(testHTMLPath).toString('utf8');

    const coll = new ThreadCollection(document.getElementsByTagName('body')[0]);

    expect(coll.elements.length).toEqual(elCount);

})

test('filters threads by the author of the final comment', ()=>{

    // TODO: Change author names within the test HTML file so it's
    // possible to identify different authors.
})