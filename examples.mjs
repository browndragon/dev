import dirTree from 'directory-tree';
import fs from 'fs-extra';

const rootDir = './public/';
const examplesJSON = './public/examples.json';

const filterConfig = {
    extensions: /\.js$/,
    normalizePath: true,
    exclude: [
        /public\\assets/,
        /public\/assets/,
        /public\\_libs/,
        /public\/_libs/
    ]
};

let filteredTree = dirTree(rootDir, filterConfig);

filteredTree = JSON.stringify(filteredTree, null, 2);

fs.writeFileSync(examplesJSON, filteredTree);
        
console.log('examples.json saved');