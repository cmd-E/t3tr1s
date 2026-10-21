const test = require('node:test');
const assert = require('node:assert/strict');
const { Game, levels } = require('./engine.js');

function running() {
  const game = new Game(() => 0.2);
  game.toggle();
  return game;
}

test('reset owns independent board rows and piece matrices', () => {
  const game = running();
  game.board[0][0] = 1;
  assert.equal(game.board[1][0], 0);
  game.active.shape[0][0] = 0;
  assert.equal(game.next.shape[0][0], 1);
  game.reset();
  assert.equal(game.status, 'ready');
  assert.equal(game.board.flat().reduce((a,b) => a+b), 0);
  assert.equal(game.active.shape[0][0], 1);
});

test('movement and rotation respect boundaries and locked cells', () => {
  const game = running();
  game.active = {x: 0, y: 0, shape: [[1,1],[1,1]]};
  const before = structuredClone(game.active);
  game.move(-1);
  assert.deepEqual(game.active, before);
  game.board[0][2] = 1;
  game.move(1);
  assert.deepEqual(game.active, before);
  game.board[0][2] = 0;
  game.move(1);
  assert.equal(game.active.x, 1);
  for (const piece of [{x: -1,y:0,shape:[[1]]}, {x:10,y:0,shape:[[1]]},
                       {x:0,y:-1,shape:[[1]]}, {x:0,y:20,shape:[[1]]}]) {
    assert.equal(game.collides(piece), true);
  }
  game.active = {x: 9, y: 0, shape: [[1],[1],[1]]};
  game.rotate();
  assert.deepEqual(game.active.shape, [[1],[1],[1]]);
  game.active.x = 3;
  game.rotate();
  assert.deepEqual(game.active.shape, [[1,1,1]]);
});

test('ready, paused and game-over states ignore gameplay controls and time', () => {
  for (const status of ['ready', 'paused', 'game-over']) {
    const game = new Game(() => 0.2);
    game.status = status;
    const before = structuredClone(game.active);
    game.move(1); game.rotate(); game.down(); game.drop(); game.advance(1000);
    assert.deepEqual(game.active, before);
    assert.equal(game.elapsed, 0);
  }
});

test('line clears score one through four rows and preserve board dimensions', () => {
  for (const [count, expected] of [[1,10],[2,30],[3,60],[4,120]]) {
    const game = running();
    for (let row=20-count; row<20; row++) game.board[row].fill(1);
    game.clearLines();
    assert.equal(game.score, expected);
    assert.equal(game.board.length,20);
    assert(game.board.every(row=>row.length===10));
    assert.deepEqual(game.drainEvents(),[{type:'rows-cleared',count}]);
    assert.deepEqual(game.drainEvents(),[]);
  }
});

test('levels use their own points and stop at the last level', () => {
  const game = running();
  for (let level=0; level<levels.length; level++) {
    game.level=level; game.score=level===0 ? 490 : level===1 ? 1485 : level===2 ? 2480 : level===3 ? 3475 : 9999;
    const before=game.score;
    game.board[19].fill(1); game.clearLines();
    assert.equal(game.score,before+levels[level].points);
    assert.equal(game.level, Math.min(level+1,levels.length-1));
  }
});

test('locking and repeated spawn collisions consume exactly three lives', () => {
  const game=running();
  for (let death=1;death<=3;death++) {
    game.board=game.emptyBoard(); game.board[0][4]=1;
    game.active={x:4,y:18,shape:[[1,1],[1,1]]};
    game.next={x:4,y:0,shape:[[1,1],[1,1]]};
    game.elapsed=1200; game.down();
    assert.equal(game.deaths,death);
    assert.equal(game.elapsed,0);
    assert.equal(game.status,death===3?'game-over':'running');
    assert.equal(game.drainEvents().filter(event=>event.type==='life-lost').length,1);
  }
  assert(game.cells().flat().every(cell=>cell===0));
  game.toggle();
  assert.equal(game.status,'running'); assert.equal(game.deaths,0);
});

test('invalid elapsed time is ignored and pause preserves accumulated time', () => {
  const game=running();
  for (const delta of [-1,NaN,Infinity]) game.advance(delta);
  assert.equal(game.elapsed,0);
  game.advance(399); assert.equal(game.active.y,0);
  game.advance(1); assert.equal(game.active.y,1);
  game.toggle(); game.advance(1000); assert.equal(game.elapsed,400);
  game.toggle(); game.advance(1000,100); assert.equal(game.elapsed,1400);
});

test('rendered cells overlay active piece without mutating locked board', () => {
  const game=running();
  const cells=game.cells();
  assert.equal(cells.flat().filter(Boolean).length,4);
  assert.equal(game.board.flat().filter(Boolean).length,0);
  cells[0][0]=9;
  assert.equal(game.board[0][0],0);
  game.active.y=-3;
  assert.doesNotThrow(()=>game.cells());
});
