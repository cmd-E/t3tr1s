/* Game rules independent of the DOM, audio and scheduling. */
(function (root) {
  const shapes = {
    O:[[1,1],[1,1]], I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    S:[[0,1,1],[1,1,0],[0,0,0]], Z:[[1,1,0],[0,1,1],[0,0,0]],
    L:[[1,0,0],[1,1,1],[0,0,0]], J:[[0,0,1],[1,1,1],[0,0,0]],
    T:[[1,1,1],[0,1,0],[0,0,0]]
  };
  const levels = [
    {points:10,speed:400,threshold:500},{points:15,speed:300,threshold:1500},
    {points:20,speed:200,threshold:2500},{points:25,speed:100,threshold:3500},
    {points:30,speed:50,threshold:Infinity}
  ];
  class Game {
    constructor(random = Math.random) { this.random = random; this.reset(); }
    reset() {
      this.board = this.emptyBoard(); this.score = 0; this.level = 0; this.deaths = 0;
      this.elapsed = 0; this.gravity = 0; this.status = 'ready'; this.events = [];
      this.active = this.newPiece(); this.next = this.newPiece();
    }
    emptyBoard() { return Array.from({length:20},()=>Array(10).fill(0)); }
    newPiece() {
      const shape=shapes['IOLJTSZ'[Math.min(6,Math.floor(this.random()*7))]].map(row=>row.slice());
      return {x:Math.floor((10-shape[0].length)/2),y:0,shape};
    }
    collides(piece) {
      return piece.shape.some((row,y)=>row.some((cell,x)=>cell &&
        (piece.y+y<0 || piece.y+y>=20 || piece.x+x<0 || piece.x+x>=10 ||
         this.board[piece.y+y][piece.x+x])));
    }
    toggle() {
      if (this.status==='game-over') this.reset();
      this.status=this.status==='running'?'paused':'running';
    }
    move(dx) {
      if(this.status!=='running')return;
      const candidate={...this.active,x:this.active.x+dx};
      if(!this.collides(candidate))this.active=candidate;
    }
    rotate() {
      if(this.status!=='running')return;
      const shape=this.active.shape[0].map((_,i)=>this.active.shape.map(row=>row[i]).reverse());
      const candidate={...this.active,shape};
      if(!this.collides(candidate))this.active=candidate;
    }
    down() {
      if(this.status!=='running')return;
      const candidate={...this.active,y:this.active.y+1};
      if(!this.collides(candidate)){this.active=candidate;return;}
      for(let y=0;y<this.active.shape.length;y++)
        for(let x=0;x<this.active.shape[y].length;x++)
          if(this.active.shape[y][x])this.board[this.active.y+y][this.active.x+x]=1;
      this.clearLines();
      this.active=this.next; this.next=this.newPiece(); this.gravity=0;
      if(this.collides(this.active)) {
        this.deaths++; this.events.push({type:'life-lost'});
        this.board=this.emptyBoard(); this.elapsed=0;
        if(this.deaths>=3){this.status='game-over';this.events.push({type:'game-over'});}
      }
    }
    clearLines() {
      const remaining=this.board.filter(row=>!row.every(Boolean));
      const count=20-remaining.length;
      if(!count)return;
      this.board=Array.from({length:count},()=>Array(10).fill(0)).concat(remaining);
      this.score += levels[this.level].points * [0,1,3,6,12][count];
      while(this.level<levels.length-1 && this.score>=levels[this.level].threshold)this.level++;
      this.events.push({type:'rows-cleared',count});
    }
    drop() {
      if(this.status!=='running')return;
      while(!this.collides({...this.active,y:this.active.y+1}))this.active.y++;
      this.down();
    }
    advance(milliseconds, gravityLimit = milliseconds) {
      if(this.status!=='running'||!Number.isFinite(milliseconds)||milliseconds<0)return;
      this.elapsed+=milliseconds;this.gravity+=Math.min(milliseconds,gravityLimit);
      while(this.status==='running' && this.gravity>=levels[this.level].speed) {
        this.gravity-=levels[this.level].speed;
        this.down();
      }
    }
    drainEvents() { const events=this.events;this.events=[];return events; }
    cells() {
      const cells=this.board.map(row=>row.slice());
      if(this.status!=='game-over')
        this.active.shape.forEach((row,y)=>row.forEach((cell,x)=>{
          if(cell && cells[this.active.y+y]) cells[this.active.y+y][this.active.x+x]=1;
        }));
      return cells;
    }
  }
  if(typeof module!=='undefined')module.exports={Game,levels};
  else root.TetrisEngine={Game,levels};
})(typeof window!=='undefined'?window:globalThis);
