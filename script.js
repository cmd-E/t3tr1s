const game = new TetrisEngine.Game();
const main = document.querySelector('.main');
const next = document.getElementById('next-tetro');
const startButton = document.getElementById('startPause');
const pauseCover = document.querySelector('.pause-cover');
const gameOver = document.getElementById('game-over');
const lives = Array.from(document.querySelectorAll('.heart-box img'));
const rowAudio = new Audio('./sounds/row-pop.wav');
const overAudio = new Audio('./sounds/game-over.wav');
let sound = true;
function grid(element, count) {
  element.replaceChildren(...Array.from({length:count},()=> {
    const cell=document.createElement('div');cell.className='cell';return cell;
  }));
  return Array.from(element.children);
}
const boardCells=grid(main,200),nextCells=grid(next,16);
function render() {
  game.cells().flat().forEach((cell,i)=>boardCells[i].style.opacity=cell?'1':'0.25');
  nextCells.forEach(cell=>cell.style.opacity='0.25');
  game.next.shape.forEach((row,y)=>row.forEach((value,x)=>{
    if(value)nextCells[y*4+x].style.opacity='1';
  }));
  document.getElementById('score').textContent=game.score;
  document.getElementById('level').textContent=game.level+1;
  const seconds=Math.floor(game.elapsed/1000);
  document.getElementById('display').textContent=[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(x=>String(x).padStart(2,'0')).join(':');
  lives.forEach((life,i)=>life.style.display=i<3-game.deaths?'inline-block':'none');
  pauseCover.style.display=game.status==='paused'?'block':'none';
  gameOver.style.display=game.status==='game-over'?'block':'none';
  document.getElementById('go-score').textContent=game.score;
  startButton.textContent=game.status==='running'?'Пауза':'Старт';
  for(const event of game.drainEvents()) {
    if(!sound)continue;
    const audio=event.type==='rows-cleared'?rowAudio:event.type==='life-lost'?overAudio:null;
    if(audio){audio.currentTime=0;const playback=audio.play();if(playback)playback.catch(()=>{});}
  }
}
startButton.addEventListener('click',()=>{game.toggle();render();});
for(const id of ['restartBtn','restartBtn2'])document.getElementById(id).addEventListener('click',()=>{game.reset();render();});
document.getElementById('sound-icon').addEventListener('click',event=>{
  sound=!sound;event.target.src='./images/sound-'+(sound?'on':'off')+'.svg';
});
document.addEventListener('keydown',event=>{
  if(game.status!=='running')return;
  const actions={ArrowLeft:()=>game.move(-1),ArrowRight:()=>game.move(1),ArrowUp:()=>game.rotate(),ArrowDown:()=>game.drop()};
  if(actions[event.key]){event.preventDefault();actions[event.key]();render();}
});
let previous;
function frame(now) {
  if(previous!==undefined)game.advance(now-previous,100);
  previous=now;render();requestAnimationFrame(frame);
}
render();requestAnimationFrame(frame);
