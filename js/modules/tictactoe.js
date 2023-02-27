// TODO
// Two player mode
// main menu
// settings
// multiple board sizes

function generate_attribute_template(that, attrName, defaultValue){
  if(!that.hasAttribute(attrName)){
    that.setAttribute(attrName, defaultValue)
  }
  return that.getAttribute(attrName)
}

const Score = {
  "playing": {},
  "stalemate": {
    "message": "It's a draw!"
  },
  "win": {
    "message": "You won!"
  },
  "lost":{
    "message": "You lose!"
  }
}

class Board extends HTMLElement{
  constructor(){
    super();
  }
 
  get game(){
    let elem = this
    while(elem.parentNode && elem.parentNode.nodeName.toLowerCase() != 'body') {
      elem = elem.parentNode;
      if(elem.tagName.toLowerCase() == "tic-tac-toe"){
        return elem;
      }
    }
  }

  get firstMove(){
    return generate_attribute_template(this, "firstMove", "true")
  }

  set firstMove(val){
    this.setAttribute("firstMove", val)
  }

  get emptySquares(){
    return this.querySelectorAll("[state='empty']")
  }

  get circleTiles(){
    return this.querySelectorAll("[type='circle']")
  }

  get crossTiles(){
    return this.querySelectorAll("[type='cross']")
  }

  get tiles(){
    return this.querySelectorAll('ttc-tile')
  }

  get full(){
    return true ? this.querySelector("[state='empty']") == undefined : false
  }

  tileByIndex(index){
    return this.tiles[Math.min(Math.max(index, 0),8)]
  }

  calculateScore(){
    // now it's better
    let players = ["circle", "cross"]
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ]; // Make a function to generate those winning combinations based on board size

    for(let playerIndex =  0; playerIndex < players.length; playerIndex++){
      let thisPlayer = players[playerIndex];
      for(let combinationsIndex = 0; combinationsIndex < winningCombinations.length; combinationsIndex++){
        let thisCombination = winningCombinations[combinationsIndex];
        let score = 0;
        for(let tileIndex = 0; tileIndex < thisCombination.length; tileIndex++){
          let thisTile = this.tileByIndex(thisCombination[tileIndex]);
          if(thisTile.type == thisPlayer && thisTile.state == "solid"){
            score ++;
          }
          else{
            break;
          }
        }
        if(score == 3){
          return (thisPlayer == this.game.humanPlayer) ? Score.win : Score.lost
        }
      }
    }

    if(this.emptySquares.length == 0){
      return Score.stalemate;
    }
    return Score.playing
     // OLD CODE (i'm keeping it because i think it will work better with non-standard board sizes but idk)
    let types = ["horizontal","vertical", "diagonal", "inverse_diagonal"]
    for(let p = 0; p < players.length; p++){
      for(let t = 0; t < types.length; t++){
        let thisPlayer = players[p]
        let type = types[t]
        let score = 0;
        for(let c = 0; c < 3; c++){
          score = 0;
          for(let r = 0; r < 3; r++){
            let index ;
            if(type == "horizontal"){
              index = r+c*3;
            }
            else if(type == "vertical"){
              index = c+r*3
            }
            else{
              break;
            }
            if(this.tileByIndex(index).type != thisPlayer || this.tileByIndex(index).state != "solid"){
              break;
            }else{
              score++;
            }
          }

          if(score==3){
            return (thisPlayer == "circle") ? Score.win : Score.lost
          }
        }
      }
    }
    for(let p = 0; p < players.length; p++){
      for(let t = 0; t < types.length; t++){
        let thisPlayer = players[p]
        let type = types[t]
        let score = 0;
        for(let i = 0; i < 3; i++){
          let index =0;
          if(type == "diagonal"){
            index = i*4;
          }
          else if(type == "inverse_diagonal"){
            index = (i+1)*2;
          }
          else{
            break;
          }
          if(this.tileByIndex(index).type != thisPlayer || this.tileByIndex(index).state !="solid"){
            break;
          }else{
            score++;
          }
        }
        if(score==3){
          return (thisPlayer == "circle") ? Score.win : Score.lost
        }  
      }
    }

  }

  finishedMove(){
    this.game.currentPlayer = (this.game.currentPlayer == "circle") ? "cross" : "circle"

    let calculatedScore = this.calculateScore();
    if(calculatedScore != Score.playing){
      this.game.finish(calculatedScore);
      return false;
    }
    if(this.game.currentPlayer != this.game.humanPlayer){
      AIPlayer.calculateMove(this)
    }
  }

  connectedCallback(){
    this.style.gridTemplateColumns = `repeat(${this.columns}, 1fr)`;
    this.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
    
    for(let c = 0; c<this.columns; c++){
      for(let r = 0; r<this.rows; r++){
        let tile = document.createElement("ttc-tile")
        this.appendChild(tile)
        tile.index
        tile.index = r+c*this.columns

      }
    }
  }

  get columns(){
    return generate_attribute_template(this, "columns", 3)
  }

  get rows(){
    return generate_attribute_template(this, "rows", 3)
  }
}

class AIPlayer{
 
  static evaluate(board){
    // replace this with my function not stolen one
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    for (let i = 0; i < winningCombinations.length; i++) {
      const [a, b, c] = winningCombinations[i];
      if (board.tileByIndex(a).type && board.tileByIndex(a).type === board.tileByIndex(b).type && board.tileByIndex(b).type === board.tileByIndex(c).type) {
        if (board.tileByIndex(a).type === 'circle') {
          return -10;
        } else if (board.tileByIndex(a).type === 'cross') {
          return 10;
        }
      }
    }
    return 0;
  }
  

  static minmax(board, depth, humanMove, firstMove){
    const score = this.evaluate(board);
   
    if(depth === 5 && firstMove){
      return score-depth // Band aid not so working solution to a problem where the first move is laggy
    }

    if(score === 10 || score === -10 || board.full === true){
      return score-depth;
    }

    if(humanMove){
      let bestScore = -Infinity;

      board.emptySquares.forEach((potentialMove)=>{      
        potentialMove.tryMark(board.game.aiPlayer);
        bestScore = Math.max(bestScore, this.minmax(board, depth+1, false, firstMove));
        potentialMove.reverseMark();
      })

      return bestScore
    }
    else{
      let bestScore = Infinity;


      board.emptySquares.forEach((potentialMove)=>{
        potentialMove.tryMark(board.game.humanPlayer);
        bestScore = Math.min(bestScore, this.minmax(board, depth+1, true, firstMove))
        potentialMove.reverseMark();
      })

      return bestScore
    }
  }

  static calculateMove(board){
    let bestScore = -Infinity;
    let bestMove;

    board.emptySquares.forEach((potentialMove)=>{
      potentialMove.tryMark(board.game.aiPlayer) 
      let score = this.minmax(board, 0, false, board.firstMove);
      potentialMove.reverseMark()

      if(score > bestScore){
        bestScore = score;
        bestMove = potentialMove;
      }
    })


    bestMove.mark(board.game.aiPlayer);
  }
}

class TicTacToe extends HTMLElement{
  constructor(){
    super();
  }

  static get observedAttributes(){
    return ['current_player', 'finished']
  }

  finish(calculatedScore){
    this.finished = true;
    let message = calculatedScore.message;
    let elem = document.createElement('div');
    elem.classList.add("post-game-menu")
    elem.innerHTML = `<p class='title'>${message}</p><p class='post-game-option rematch'>Rematch</p>`
    this.appendChild(elem)
    let rematch = this.querySelector('.rematch')
    rematch.addEventListener('click', ()=>{
      this.rematch()
    })
  }

  get finished(){
    return generate_attribute_template(this, 'finished', 'false')
  }

  set finished(val){
    this.setAttribute("finished", val)
  }

  get currentPlayer(){
    return generate_attribute_template(this, 'current_player', 'circle')
  }

  set currentPlayer(val){
    this.setAttribute("current_player", val);
  }

  get humanPlayer(){
    return generate_attribute_template(this, 'human_player', "circle")
  }

  get aiPlayer(){
    return (this.humanPlayer == "circle") ? "cross" : "circle"
  }

  rematch(){
    this.finished = false;
    this.currentPlayer = "circle";
    this.connectedCallback();


  }

  attributeChangedCallback(attrName, oldVal, newVal){
    if(attrName == "current_player"){
      let elem = this.querySelector(`.${attrName}`)
      if(elem){
        elem.innerText = newVal
      }
    }

  }

  connectedCallback(){
    this.innerHTML = `<div class='game-information'><p class='title'>tic-tac-toe</p></div><ttc-board></ttc-board>`
  }
}

class Tile extends HTMLElement{
  constructor(){
    super();
  }

  set index(val){
    this.setAttribute('index', val)
  }

  get index(){
    return generate_attribute_template(this, 'index', 1)
  }

  get game(){
    let elem = this
    while(elem.parentNode && elem.parentNode.nodeName.toLowerCase() != 'body') {
      elem = elem.parentNode;
      if(elem.tagName.toLowerCase() == "tic-tac-toe"){
        return elem;
      }
    }
  }
  get board(){
    let elem = this
    while(elem.parentNode && elem.parentNode.nodeName.toLowerCase() != 'body') {
      elem = elem.parentNode;
      if(elem.tagName.toLowerCase() == "ttc-board"){
        return elem;
      }
    }
  }
  get state(){
    return generate_attribute_template(this, "state", 'empty')
  }

  set state(val){
    this.setAttribute("state", val)
  }

  get type(){
    return generate_attribute_template(this, "type", 'blank')
  }

  set type(val){
    this.setAttribute("type", val)
  }

  tryMark(type){
    this.state = "solid";
    this.type = type;
  }

  reverseMark(){
    this.type= "blank";
    this.state = "empty";
  }

  mark(type){
    if(this.state == "solid"){
      return false;
    }
    let keyframes = [{color:"white"},{color:"black"}]
    let options = {duration: 200, fill: 'forwards'}

    if(this.type == "blank" && this.state != "solid"){
      this.type= this.game.currentPlayer;
      this.animate(keyframes, options)
    }
    this.state = "solid";
    this.type = type;
    this.board.firstMove = false;
    this.board.finishedMove();
  }

  connectedCallback(){
    this.state;

    this.addEventListener("mouseenter", (e)=>{
      let keyframes = [{color:"white"},{color:"black"}]
      let options = {duration: 200, fill: 'forwards'}
      if(this.state == "solid" || this.game.currentPlayer != this.game.humanPlayer){
        return false;
      }
      if(this.type == "blank"){
        this.type= this.game.currentPlayer;
        this.animate(keyframes, options)
      }
    })

    this.addEventListener("click", (e)=>{
      if(this.state == "solid" || this.game.currentPlayer != this.game.humanPlayer){
        return false;
      }
      this.mark(this.game.humanPlayer)
   
    })

    this.addEventListener("mouseleave", (e)=>{
      let keyframes = [{color:"black"},{color:"white"}]
      let options = {duration: 200, fill: 'forwards'}
      if(this.state == "solid" || this.game.currentPlayer != this.game.humanPlayer){
        return false;
      }
      if(this.type == this.game.currentPlayer){
        this.animate(keyframes, options)
        setTimeout(()=>{this.type="blank";}, 200)
      }
    })
  }
}

window.customElements.define('tic-tac-toe', TicTacToe);
window.customElements.define('ttc-tile', Tile);
window.customElements.define('ttc-board', Board);
