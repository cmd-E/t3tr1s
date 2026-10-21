const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function fixture() {
  class Element {
    constructor() { this.children=[]; this.style={}; this.listeners={}; }
    addEventListener(name, callback) { this.listeners[name]=callback; }
    replaceChildren(...children) { this.children=children; }
  }
  const names=['main','next-tetro','startPause','pause-cover','game-over','score','level',
    'display','go-score','restartBtn','restartBtn2','sound-icon'];
  const elements=Object.fromEntries(names.map(name=>[name,new Element()]));
  const lives=Array.from({length:3},()=>new Element());
  const keyboard={}; const frames=[]; const playback=[];
  const context=vm.createContext({
    document:{
      querySelector:name=>elements[name.slice(1)], getElementById:name=>elements[name],
      querySelectorAll:()=>lives, createElement:()=>new Element(),
      addEventListener:(name, callback)=>keyboard[name]=callback
    }, window:{}, console,
    Audio:function(path) { this.play=()=>{playback.push(path);return Promise.reject(new Error('blocked playback'));}; },
    requestAnimationFrame:callback=>{frames.push(callback);return frames.length;}
  });
  vm.runInContext(fs.readFileSync(__dirname+'/engine.js','utf8'),context,{filename:__dirname+'/engine.js'});
  vm.runInContext(`
    const OriginalGame=window.TetrisEngine.Game;
    window.TetrisEngine.Game=class extends OriginalGame {
      constructor() { super(()=>0.2); globalThis.testGame=this; }
    };
    globalThis.TetrisEngine=window.TetrisEngine;
  `,context);
  vm.runInContext(fs.readFileSync(__dirname+'/script.js','utf8'),context,{filename:__dirname+'/script.js'});
  return {elements,lives,keyboard,frames,playback,game:context.testGame};
}

test('keyboard is inactive before start and unknown keys do not prevent defaults',()=>{
  const {keyboard,elements,game}=fixture();
  let prevented=false;
  keyboard.keydown({key:'ArrowLeft',preventDefault(){prevented=true;}});
  assert.equal(prevented,false);
  elements.startPause.listeners.click();
  const before=game.active.x;
  keyboard.keydown({key:'ArrowLeft',preventDefault(){prevented=true;}});
  assert.equal(prevented,true); assert.equal(game.active.x,before-1);
  keyboard.keydown({key:'ArrowRight',preventDefault(){}});
  assert.equal(game.active.x,before);
  keyboard.keydown({key:'ArrowUp',preventDefault(){}});
  keyboard.keydown({key:'ArrowDown',preventDefault(){}});
  prevented=false;
  keyboard.keydown({key:'Escape',preventDefault(){prevented=true;}});
  assert.equal(prevented,false);
});

test('frame formats elapsed time and retains exactly one scheduled callback',()=>{
  const {frames,elements,game}=fixture();
  game.elapsed=3661000;
  frames.shift()(100);
  assert.equal(elements.display.textContent,'01:01:01');
  frames.shift()(116);
  assert.equal(frames.length,1);
});

test('game over and both restart controls reset the rendered state',()=>{
  for(const id of ['restartBtn','restartBtn2']) {
    const {game,frames,elements,lives}=fixture();
    game.status='game-over'; game.deaths=3; game.score=120;
    frames.shift()(100);
    assert.equal(elements['game-over'].style.display,'block');
    assert(lives.every(life=>life.style.display==='none'));
    elements[id].listeners.click();
    assert.equal(game.status,'ready'); assert.equal(game.score,0);
    assert.equal(elements['game-over'].style.display,'none');
    assert(lives.every(life=>life.style.display==='inline-block'));
  }
});

test('sound toggle suppresses playback and playback rejection is handled',async()=>{
  const {game,elements,frames,playback}=fixture();
  game.events.push({type:'rows-cleared'},{type:'life-lost'},{type:'game-over'});
  frames.shift()(100);
  assert.deepEqual(playback,['./sounds/row-pop.wav','./sounds/game-over.wav']);
  elements['sound-icon'].listeners.click({target:elements['sound-icon']});
  assert.equal(elements['sound-icon'].src,'./images/sound-off.svg');
  game.events.push({type:'rows-cleared'});
  frames.shift()(116);
  assert.equal(playback.length,2);
  assert.equal(game.events.length,0);
  elements['sound-icon'].listeners.click({target:elements['sound-icon']});
  assert.equal(elements['sound-icon'].src,'./images/sound-on.svg');
  await Promise.resolve();
});
