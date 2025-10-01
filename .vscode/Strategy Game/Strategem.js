(() => {
  // Instead of constants, these become variables
  let ROWS = 7, COLS = 7;
  const COLORS=['red','blue','yellow'];
  const COLOR_LABELS = { red: "Red", blue: "Blue", yellow: "Yellow"};
  const COLOR_EMOJIS = { red: "🟥", blue: "🟦", yellow: "🟨" };
  const BLACK='black', IMMOVABLE='immovable';

  const gridEl=document.getElementById('grid');
  const topEdges=document.getElementById('top-edges');
  const bottomEdges=document.getElementById('bottom-edges');
  const leftEdges=document.getElementById('left-edges');
  const rightEdges=document.getElementById('right-edges');
  const turnLabel=document.getElementById('turnLabel');
  const countsEl=document.getElementById('counts');
  const messageEl=document.getElementById('message');
  const playerColorEl=document.getElementById('playerColor');
  const ai1ColorEl=document.getElementById('ai1Color');
  const ai2ColorEl=document.getElementById('ai2Color');
  const restartBtn=document.getElementById('restart');
  const modePushBtn=document.getElementById('mode-push');
  const modeBlockBtn=document.getElementById('mode-block');
  const modeLabel=document.getElementById('modeLabel');
  const playerColorIndicator=document.getElementById('playerColorIndicator');
  const gameTitle=document.getElementById('gameTitle');

  let board=[], players=[], turnIdx=0, mode='push';
  let immovablePositions={}, blockInventory={}, immovableColors={};
  let colors={};

  function randShuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }

  function initBoard(){
    board=Array.from({length:ROWS},()=>Array(COLS).fill(null));
    board[0][0]=BLACK; board[0][COLS-1]=BLACK; board[ROWS-1][0]=BLACK; board[ROWS-1][COLS-1]=BLACK;
    let pool=[]; COLORS.forEach(c=>{for(let i=0;i<Math.ceil((ROWS*COLS-4)/COLORS.length);i++) pool.push(c);});
    randShuffle(pool); let idx=0;
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(board[r][c]===null) board[r][c]=pool[idx++];
    immovablePositions={}; blockInventory={}; immovableColors={};
    players.forEach(p=>{blockInventory[p]=true; immovablePositions[p]=null; immovableColors[p]=null;});
  }

  function renderGrid(){
    // Update grid style
    gridEl.style.gridTemplateColumns = `repeat(${COLS}, 50px)`;
    gridEl.style.gridTemplateRows = `repeat(${ROWS}, 50px)`;
    gameTitle.textContent = `${COLS}×${ROWS} Push-Colors Game`;
    gridEl.innerHTML='';
    let posToOwner = {};
    Object.keys(immovablePositions).forEach(owner => {
      const pos = immovablePositions[owner];
      if(pos) posToOwner[pos[0]+','+pos[1]] = owner;
    });

    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
      const div=document.createElement('div');
      div.className='cell';
      const val=board[r][c];

      div.classList.add(val);

      if(val === IMMOVABLE) {
        let owner = posToOwner[r+','+c];
        if(owner) {
          const color = immovableColors[owner] || 'black';
          div.classList.add(color);
        }
        div.textContent = '■';
      } else {
        div.textContent = '';
      }
      div.onclick = () => {
        if(currentPlayer() === 'player' && mode === 'block'){
          handleBlockClick(r, c);
        }
      };

      gridEl.appendChild(div);
    }
    updateCounts();
  }

  function setupEdgeButtons(){
    topEdges.innerHTML=''; bottomEdges.innerHTML=''; leftEdges.innerHTML=''; rightEdges.innerHTML='';
    for(let c=0;c<COLS;c++){
      let t=document.createElement('button'); t.textContent='↓'; t.onclick=()=>playerPush('col',c,1); topEdges.appendChild(t);
      let b=document.createElement('button'); b.textContent='↑'; b.onclick=()=>playerPush('col',c,-1); bottomEdges.appendChild(b);
    }
    for(let r=0;r<ROWS;r++){
      let l=document.createElement('button'); l.textContent='→'; l.onclick=()=>playerPush('row',r,1); leftEdges.appendChild(l);
      let rt=document.createElement('button'); rt.textContent='←'; rt.onclick=()=>playerPush('row',r,-1); rightEdges.appendChild(rt);
    }
  }

  function handleBlockClick(r,c){
    const me = 'player';
    const val = board[r][c];
    const pos = immovablePositions[me];

    if(val === BLACK && blockInventory[me]){
      board[r][c] = IMMOVABLE;
      immovablePositions[me] = [r,c];
      blockInventory[me] = false;
      immovableColors[me] = colors[me];
      renderGrid(); endTurn();
      return;
    }

    if(val === IMMOVABLE && pos && pos[0]===r && pos[1]===c){
      board[r][c] = BLACK;
      immovablePositions[me] = null;
      blockInventory[me] = true;
      immovableColors[me] = null;
      renderGrid(); endTurn();
      return;
    }
  }

  function playerPush(type,idx,dir){
    if(currentPlayer() !== 'player' || mode !== 'push') return;
    pushWithAnimation(type,idx,dir,(success)=>{
      if(success) {
        endTurn();
      } else {
        messageEl.textContent = "You can't push there! Try another move.";
      }
    });
  }

  function attemptPush(type,idx,dir){
    let path=[]; if(type==='row') for(let c=0;c<COLS;c++) path.push([idx,c]);
    else for(let r=0;r<ROWS;r++) path.push([r,idx]);
    if(path.some(([r,c])=>board[r][c]===IMMOVABLE)) return false;
    if(type==='row'){ if(dir===1){ for(let c=COLS-1;c>0;c--) board[idx][c]=board[idx][c-1]; board[idx][0]=BLACK; }
      else { for(let c=0;c<COLS-1;c++) board[idx][c]=board[idx][c+1]; board[idx][COLS-1]=BLACK; } }
    else { if(dir===1){ for(let r=ROWS-1;r>0;r--) board[r][idx]=board[r-1][idx]; board[0][idx]=BLACK; }
      else { for(let r=0;r<ROWS-1;r++) board[r][idx]=board[r+1][idx]; board[ROWS-1][idx]=BLACK; } }
    return true;
  }

  function pushWithAnimation(type,idx,dir,callback){
    renderGrid();

    let path=[]; if(type==='row') for(let c=0;c<COLS;c++) path.push([idx,c]);
    else for(let r=0;r<ROWS;r++) path.push([r,idx]);
    if(path.some(([r,c])=>board[r][c]===IMMOVABLE)){
      path.forEach(([r,c])=>{
        const cell=gridEl.children[r*COLS+c];
        if(type==='row') {
          cell.style.transition = "transform 0.32s cubic-bezier(.7,-0.5,.3,1.7)";
          cell.style.transform=`translateX(${dir*10}px)`;
        } else {
          cell.style.transition = "transform 0.32s cubic-bezier(.7,-0.5,.3,1.7)";
          cell.style.transform=`translateY(${dir*10}px)`;
        }
      });
      setTimeout(()=>{ 
        path.forEach(([r,c])=>{
          const cell=gridEl.children[r*COLS+c];
          cell.style.transform="";
        });
        if(callback) callback(false);
      },330);
      return;
    }

    let edgeIdx = type==='row' ? (dir===1?COLS-1:0) : (dir===1?ROWS-1:0);
    let edgeCell;
    if(type==='row') edgeCell = gridEl.children[idx*COLS+edgeIdx];
    else edgeCell = gridEl.children[edgeIdx*COLS+idx];
    edgeCell.style.transition = 'opacity 0.22s cubic-bezier(.42,1.2,.44,1.01)';
    edgeCell.style.opacity = '0';

    path.forEach(([r,c])=>{
      const cell=gridEl.children[r*COLS+c];
      if(type==='row') {
        cell.style.transition = "transform 0.45s cubic-bezier(.42,1.2,.44,1.01)";
        cell.style.transform=`translateX(${dir*55}px)`;
      } else {
        cell.style.transition = "transform 0.45s cubic-bezier(.42,1.2,.44,1.01)";
        cell.style.transform=`translateY(${dir*55}px)`;
      }
    });

    setTimeout(()=>{
      attemptPush(type,idx,dir);
      renderGrid();
      if(callback) callback(true);
    },470);
  }

  function endTurn(){
    updateCounts(); if(checkWin()) return;
    turnIdx=(turnIdx+1)%players.length; updateUI();
    messageEl.textContent = "";
    if(currentPlayer().startsWith('ai')) setTimeout(aiTakeTurn,500);
  }

  function currentPlayer(){ return players[turnIdx]; }

  function updateUI(){
    turnLabel.textContent=currentPlayer();
    modeLabel.textContent = mode === 'push' ? 'Push' : 'Block';

    // Show a big animated badge for the player's color above the board
    renderPlayerColorBadge();

    playerColorEl.textContent = colors.player;
    ai1ColorEl.textContent = colors.ai1;
    ai2ColorEl.textContent = colors.ai2;
    modePushBtn.classList.toggle('active', mode==='push');
    modeBlockBtn.classList.toggle('active', mode==='block');
  }

  function renderPlayerColorBadge(){
    if (!colors.player) { playerColorIndicator.innerHTML = ""; return; }
    const color = colors.player;
    const label = COLOR_LABELS[color] || color;
    const emoji = COLOR_EMOJIS[color] || "";
    playerColorIndicator.innerHTML = `
      <div class="player-badge-outer">
        <div class="player-badge-inner ${color}">${emoji}</div>
      </div>
      <span class="player-color-label">Your color: <span style="color:${color==='yellow'?'#ffd400':color==='red'?'#ff4444':'#4db6ff'}">${label}</span></span>
    `;
  }

  function updateCounts(){
    const counts={red:0,blue:0,yellow:0,black:0,immovable:0};
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
      const val=board[r][c];
      counts[val]=(counts[val]||0)+1;
    }
    countsEl.innerHTML = `
      <div>Red: ${counts.red}</div>
      <div>Blue: ${counts.blue}</div>
      <div>Yellow: ${counts.yellow}</div>
      <div>Black: ${counts.black}</div>
      <div>Player block in inventory: ${blockInventory.player ? 'Yes' : 'No'}</div>
    `;
  }

  function checkWin(){
    const present=new Set();
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(COLORS.includes(board[r][c])) present.add(board[r][c]);
    if(present.size===1){ messageEl.textContent=`${[...present][0]} wins!`; turnIdx=-1; return true; }
    return false;
  }

  function aiTakeTurn(){
    const me=currentPlayer();

    function aiTryMove(){
      if(blockInventory[me] && Math.random()<0.2){
        const blacks=[]; for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(board[r][c]===BLACK) blacks.push([r,c]);
        if(blacks.length){
          const [r,c]=blacks[Math.floor(Math.random()*blacks.length)];
          board[r][c]=IMMOVABLE; immovablePositions[me]=[r,c]; blockInventory[me]=false; immovableColors[me]=colors[me];
          renderGrid(); endTurn(); return;
        }
      }
      let options = [];
      for(let type of ['row','col']){
        for(let idx=0;idx<(type==='row'?ROWS:COLS);idx++){
          for(let dir of [-1,1]){
            let path=[];
            if(type==='row') for(let c=0;c<COLS;c++) path.push([idx,c]);
            else for(let r=0;r<ROWS;r++) path.push([r,idx]);
            if(!path.some(([r,c])=>board[r][c]===IMMOVABLE)) options.push({type,idx,dir});
          }
        }
      }
      if(options.length){
        let pick = options[Math.floor(Math.random()*options.length)];
        pushWithAnimation(pick.type,pick.idx,pick.dir,function(success){
          if(success) endTurn();
          else setTimeout(aiTryMove,100);
        });
      } else {
        endTurn();
      }
    }
    aiTryMove();
  }

  function askColor(){
    const pick=prompt('Choose your color: red, blue, or yellow','red');
    const playerChoice=COLORS.includes(pick)?pick:'red';
    const remaining=COLORS.filter(c=>c!==playerChoice);
    colors={player:playerChoice, ai1:remaining[0], ai2:remaining[1]};
  }

  // Ask for grid size function
  function askGridSize() {
    let size = prompt('Grid size? Enter a number from 4 to 12 (e.g. 7 for 7x7):', '7');
    size = parseInt(size, 10);
    if(isNaN(size) || size < 4 || size > 12) size = 7;
    ROWS = size;
    COLS = size;
  }

  restartBtn.onclick = () => startGame();
  modePushBtn.onclick = () => { mode='push'; updateUI(); };
  modeBlockBtn.onclick = () => { mode='block'; updateUI(); };

  function startGame(){
    askColor();
    askGridSize();
    players=['player','ai1','ai2'];
    turnIdx=0;
    initBoard();
    renderGrid();
    setupEdgeButtons();
    updateUI();
    messageEl.textContent='';
  }

  startGame();
})();