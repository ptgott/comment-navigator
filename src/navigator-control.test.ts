import { ThreadCount } from "./navigator-control"

describe('ThreadCount', ()=>{
    // So all tests can access a new ThreadCount.
    let threadCount: ThreadCount;

    beforeEach(()=>{
        threadCount = new ThreadCount();
    })

    test('should create a span on render', ()=>{
        const el = threadCount.render();
        expect(el.tagName).toEqual("SPAN");
    })

    test('should show the ratio of filtered threads on refresh', ()=>{
        const el = threadCount.render();

        document.body.innerHTML = `
        <p>
        <p>
        <p>
        <p>
        <p>
        `
        const expectedFiltered = 3;
        let unfiltered = [...document.body.querySelectorAll('p')]
        let filtered = [...document.body.querySelectorAll('p')].slice(0, expectedFiltered);

        threadCount.refresh(unfiltered,filtered);
        expect(el.textContent).toEqual(`${filtered.length}/${unfiltered.length}`);
    })
})
