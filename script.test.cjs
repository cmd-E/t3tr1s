const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
class Element {
 constructor(){this.children=[];this.style={};this.listeners={};this.textContent='';}
 addEventListener(name,callback){this.listeners[name]=callback;}
 replaceChildren(...children){this.children=children;}
}
const elements=new Map();
for(const name of ['.main','#next-tetro','#startPause','.pause-cover','#game-over','#score','#level','#display','#go-score','#restartBtn','#restartBtn2','#sound-icon'])elements.set(name,new Element());
const lives=[new Element(),new Element(),new Element()];
const keyboard={};let frames=[];let playback=0;
const document={
 querySelector:name=>elements.get(name), getElementById:name=>elements.get('#'+name),
 querySelectorAll:name=>name==='.heart-box img'?lives:[],
 createElement:()=>new Element(), addEventListener:(name,callback)=>keyboard[name]=callback
};
const context=vm.createContext({document,window:{},Audio:function(){this.play=()=>{playback++;return Promise.resolve();}},
 requestAnimationFrame:callback=>{frames.push(callback);return frames.length;},console,Map,Array,Math});
vm.runInContext(fs.readFileSync(__dirname+'/engine.js','utf8'),context);
context.TetrisEngine=context.window.TetrisEngine;
vm.runInContext(fs.readFileSync(__dirname+'/script.js','utf8'),context);
assert.equal(elements.get('.main').children.length,200);
assert.equal(elements.get('#next-tetro').children.length,16);
assert.equal(frames.length,1);
elements.get('#startPause').listeners.click();assert.equal(elements.get('#startPause').textContent,'Пауза');
let prevented=false;keyboard.keydown({key:'ArrowDown',preventDefault(){prevented=true;}});
assert(prevented);
elements.get('#startPause').listeners.click();assert.equal(elements.get('.pause-cover').style.display,'block');
elements.get('#restartBtn').listeners.click();
assert.equal(elements.get('#score').textContent,0);
assert.equal(elements.get('.pause-cover').style.display,'none');
assert(lives.every(life=>life.style.display==='inline-block'));
const callback=frames.shift();callback(100);assert.equal(frames.length,1,'more than one scheduler');
console.log('Tetris DOM wiring, controls, restart and single-scheduler checks passed');
