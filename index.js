const fetch = require('node-fetch');
const chr = require('cheerio');
const fs = require('fs');

let url = process.argv[2]
let depth = process.argv[3]

const results = []
let links = [url,]
let level = 1;

async function getElements(url) {
    const response = await fetch(url);
    const body = await response.text();

    // write image urls
    let $ = chr.load(body);
    let imageNodes = $('img');
    for (const node of imageNodes) {
        if (node.attribs) {
            results.push({
                imageUrl: node.attribs.src,
                sourceUrl: url,
                depth: level,
            })
        }
    }

    // get array of links
    let hrefNodes = $('a')
    const newLinks = []
    for (const node of hrefNodes) {
        if (node.attribs.href && node.attribs.href.startsWith('https://') ) {
            newLinks.push(node.attribs.href)
        }
    }
    return newLinks;
}

const getLinks = async () => {
    const promises = links.map(async (link) => {
        return getElements(link)
    })
    const nextLevelLinks = (await Promise.all(promises)).flat()
    links = [...nextLevelLinks]
    level++;
}

// write file
(async () => {
    while (level <= depth) {
        await getLinks()
    }
    // console.log(results)
    fs.writeFile('results.json', JSON.stringify(results, null, 2), () => {
    })
})()






