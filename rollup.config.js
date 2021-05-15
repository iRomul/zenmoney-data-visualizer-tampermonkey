import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/plugin.tsx',
    output: {
        file: 'out/bundle.js',
        format: 'iife',
        name: 'ZmDataViewPlugin',
        preferConst: true,
        banner: userScriptBanner()
    },
    plugins: [typescript()]
};

function userScriptBanner() {
    return `// ==UserScript==
// @name         ZenMoney Transactions Viewer
// @version      1.0.0
// @description  ZenMoney Transaction Table View Plugin
// @author       Roman.Komarevtsev
// @match        https://zenmoney.ru/a/*
// @grant        GM_addStyle
// ==/UserScript==`
}