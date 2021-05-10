import WinBox from './winbox/js/winbox.js';
import { decodeURI } from './decodeURI.js';
import { loadJSON } from './loadJSON.js'

let demoCount = 1;
let autoRunExample;

const createIcon = (parent, className, alt, onClick) =>
{
    const icon = document.createElement('span');
    
    icon.className = className;
    icon.title = alt;
    icon.onclick = onClick;

    parent.insertBefore(icon, parent.firstChild);

    return icon;
}

const onExampleLink = (win, item) =>
{
    window.location.href = `index.html?f=${item.data.path}`;
}

const onExampleEdit = (win, item) =>
{
    const iframe = `<iframe src="source.html?f=${decodeURI(item.data.view)}"></iframe>`;

    const sourceWindow = new WinBox({ 
        title: item.data.path,
        root: document.body,
        html: iframe
    });

    setTimeout(() => {
        sourceWindow.focus();
    }, 10);
}

const onExampleGit = (win, item) =>
{
    const url = `https://github.com/phaserjs/dev/blob/main/src/${item.data.git}`;

    window.open(url, '_blank');
}

const onExamplePause = (win, iframe, item) =>
{
    console.log('pause', item.data.path);
}

const onExamplePlay = (win, iframe, item) =>
{
    console.log('play', item.data.path);
}

const selectHandler = (item) =>
{
    const iframe = `<iframe id="demo${demoCount}" src="view.html?f=${decodeURI(item.data.path)}"></iframe>`;

    const win = new WinBox({ 
        title: item.data.path,
        root: document.body,
        html: iframe,
        width: 804,
        height: 637,
        x: 100,
        y: 32
    });

    setTimeout(() => {
        win.focus();
    }, 10);

    //  Inject extra icons

    const icons = document.querySelector(`div#${win.dom.id} .wb-icon`);

    createIcon(icons, 'wb-link', 'Link to Example', event => onExampleLink(win, item));
    createIcon(icons, 'wb-edit', 'View Example Code', event => onExampleEdit(win, item));
    createIcon(icons, 'wb-git', 'View Source on GitHub', event => onExampleGit(win, item));

    createIcon(icons, 'wb-pause', 'Pause Example', event => onExamplePause(win, iframe, item));
    createIcon(icons, 'wb-play', 'Play Example', event => onExamplePlay(win, iframe, item));

    demoCount++;
}

const addFolder = (data, treeView, autoRun) => {

    if (data.type === 'directory' && data.hasOwnProperty('children') && data.children.length > 0)
    {
        const folder = (data.name === 'public') ? treeView : new TreeNode(data.name);

        for (let i = 0; i < data.children.length; i++)
        {
            const child = data.children[i];

            if (child.type === 'file' && !child.name.endsWith('.min.js'))
            {
                const name = child.name.replace('.js', '');
                const item = new TreeNode(name);
                const path = child.path.replace('public/', '');
                const src = child.path.replace('public/', '/dev/src/');
                const git = path.replace('.js', '.ts').replace(' ', '%20');
                const view = src.replace('.js', '.ts').replace(' ', '%20');

                item.data = { name, path, git, view };
                item.on('select', item => selectHandler(item));

                if (path === autoRun)
                {
                    autoRunExample = item;
                }

                folder.addChild(item);
            }
            else if (child.type === 'directory')
            {
                addFolder(child, folder, autoRun);
            }
        }

        if (treeView !== folder)
        {
            treeView.addChild(folder);
        }
    }
}

window.onload = () => {

    loadJSON('examples.json', (data) => {

        const params = new URLSearchParams(document.location.search);
    
        const filename = params.get('f');

        const autoRun = (filename) ? decodeURI(filename).split('\\').join('/') : null;
        
        // https://css.gg/app
        TreeConfig.leaf_icon = '<i class="gg-file-document"></i>';
        TreeConfig.parent_icon = '<i class="gg-folder"></i>';
        TreeConfig.open_icon = '<i class="gg-chevron-down"></i>';
        TreeConfig.close_icon = '<i class="gg-chevron-up"></i>';

        const rootNode = new TreeNode('/');

        addFolder(data, rootNode, autoRun);

        const rootTree = new TreeView(rootNode, '#treeView', {
            show_root: false
        });

        const examplesWindow = new WinBox({ 
            title: 'Phaser 4 Examples',
            class: [ 'no-full' ],
            root: document.body,
            x: 16,
            y: 16,
            width: 260,
            // height: '90%',
            mount: rootTree.getContainer()
        });

        if (autoRunExample)
        {
            selectHandler(autoRunExample);
        }
    
    });

};
