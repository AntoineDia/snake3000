var defaultConfig = {
  //id of DIV target
  elId: 'snakeGame',
  debug: true,
  game: {
    cols: 12, rows: 12,
    asset: './assets/snake.png',
  },
  snake: {
    length: 2,
    direction: 'Left',
    //speed in case per second
    speed: 1,
    accelerationPercent: 10,
    maxSpeed: 10000,
  },
  background: {
    color1: 'rgb(142,204,57)',
    color2: 'rgb(167,217,72)',
    asset: './assets/bg.png',
    pattern: { x: 8, y: 8 },
    // asset: undefined,
  }
}

var Vector = VectorConstructor()
var DIRS = {
  Up: new Vector(0, -1),
  Right: new Vector(1, 0),
  Down: new Vector(0, 1),
  Left: new Vector(-1, 0)
}

function Game(config){
  var SNAKE
  var DOM = {}
  var CNV = {}
  var GAME = {}

  GAME.lastTime = new Date()
  GAME.running = false
  GAME.board = new Vector(config.game.cols, config.game.rows)
  GAME.buffedDir = null

  function setup(){
    DOM.style = document.createElement('style')
    DOM.style.innerHTML = [
      '#' + config.elId + '{ height: 100%; position: relative }',
      '#'+ config.elId + '> canvas',
        '{ width: 100%; position: absolute; }',
      '#SnGame { z-index: 2 }',
      '#SnBg   { z-index: 1 }',
    ].join('')

    DOM.SnGame = document.createElement('canvas')
    DOM.SnGame.id = 'SnGame'
    DOM.SnGame.width = 64 * GAME.board.x
    DOM.SnGame.height = 64 * GAME.board.y

    DOM.SnBg = DOM.SnGame.cloneNode()
    DOM.SnBg.id = 'SnBg'

    DOM.holder = document.getElementById(config.elId)
    DOM.holder.appendChild(DOM.SnGame)
    DOM.holder.appendChild(DOM.SnBg)
    DOM.holder.appendChild(DOM.style)

    CNV.ctx = DOM.SnGame.getContext('2d')
    CNV.bgCtx = DOM.SnBg.getContext('2d')
    CNV.caseSize = DOM.SnGame.width / GAME.board.x
    CNV.mainAsset = new Image()
    CNV.mainAsset.src = config.game.asset
    CNV.mainAsset.onload = function(){
      CNV.tileSize = GCD(CNV.mainAsset.width, CNV.mainAsset.height)
      SNAKE = new (SnakeConstructor())()
      draw()
    }
    drawBackground()

    document.addEventListener('keydown', function(ev){
      if(config.debug && ev.key === '+') SNAKE.speedUp()
      if(GAME.buffedDir !== null) return
      var dir = ev.key.split('Arrow')[1] || ev.key
      if(DIRS.hasOwnProperty(dir)){
        if(!SNAKE.dir.equalTo(DIRS[dir].inverse()))
          GAME.buffedDir = DIRS[dir]
      }
    })
  }
  function draw(){
    CNV.ctx.clearRect(0, 0, DOM.SnGame.width, DOM.SnGame.height)
    SNAKE.update()
    SNAKE.draw()
    if(GAME.running) requestAnimationFrame(draw)
  }
  function drawBackground(){
    for(var x = 0; x < GAME.board.x; x++){
      for(var y = 0; y < GAME.board.y; y++){
        if((x + y) % 2 === 0) CNV.bgCtx.fillStyle = config.background.color1
        else CNV.bgCtx.fillStyle = config.background.color2
        CNV.bgCtx.fillRect(
          x * CNV.caseSize, y * CNV.caseSize, CNV.caseSize, CNV.caseSize
        )
      }
    }
    if(config.background.asset){
      var img = new Image()
      img.src = config.background.asset
      img.onload = function(){
        if(config.background.pattern){
          var imgSize = new Vector(
            img.width / config.background.pattern.x,
            img.height / config.background.pattern.y
          )
          DOM.SnBg.width = imgSize.x * GAME.board.x
          DOM.SnBg.height = imgSize.x * GAME.board.y
          CNV.bgCtx.fillStyle = CNV.bgCtx.createPattern(img, 'repeat')
          CNV.bgCtx.fillRect(0, 0, DOM.SnBg.width, DOM.SnBg.height)
        }
        else CNV.bgCtx.drawImage(img, 0, 0, DOM.SnBg.width, DOM.SnBg.height)
      }
    }
  }
  function SnakeConstructor(){
    function Snake(){
      this.speed = config.snake.speed
      this.dir = DIRS[config.snake.direction]
      this.head = new Vector(5.5,5.5)
      this.tail = this.head.sub(this.dir.scale(config.snake.length))
      this.body = [this.head.duplicate(), this.tail.duplicate()]
      this.acceleration = config.snake.accelerationPercent / 100

      var canvasBody = document.createElement('canvas')
      canvasBody.width = CNV.caseSize
      canvasBody.height = CNV.caseSize
      canvasBodyCtx = canvasBody.getContext('2d')
      canvasBodyCtx.drawImage(
        CNV.mainAsset,
        CNV.tileSize, 0, CNV.tileSize, CNV.tileSize,
        0, 0, CNV.caseSize, CNV.caseSize
      )
      this.bodyPattern = CNV.ctx.createPattern(canvasBody, 'repeat-x')
    }

    Snake.prototype.draw = function(){
      var diffVect = this.head.sub(this.tail)
      var diff = diffVect.magnitude()
      var angle = Math.atan2(diffVect.y, diffVect.x) * 180 / Math.PI + 180

      var normi = diffVect.normalize()
      console.log(normi)

      CNV.ctx.save()

      CNV.ctx.translate(
        (this.head.x - 0.5) * CNV.caseSize,
        (this.head.y - 0.5) * CNV.caseSize
      )

      CNV.ctx.rotate(angle /180 * Math.PI)
      CNV.ctx.fillStyle = 'red'
      CNV.ctx.fillRect(0, 0, CNV.caseSize, CNV.caseSize)
      CNV.ctx.fillStyle = this.bodyPattern
      CNV.ctx.fillRect(0, 0, diff * CNV.caseSize, CNV.caseSize)
      CNV.ctx.restore()
    }
    Snake.prototype.borderCollision = function(vect){
      if(vect.x < 0) vect.x += GAME.board.x
      else if(vect.x > GAME.board.x) vect.x -= GAME.board.x
      else if(vect.y < 0) vect.y += GAME.board.y
      else if(vect.y > GAME.board.y) vect.y -= GAME.board.y
    }
    Snake.prototype.update = function(){
      var timeSince = (new Date() - GAME.lastTime) / 1000
      var acceleration = this.speed * timeSince
      if(!GAME.running) acceleration = 0
      this.head = this.body[0].add(this.dir.scale(acceleration))
      this.tail = this.body[1].add(this.dir.scale(acceleration))
      this.borderCollision(this.head)
      this.borderCollision(this.tail)
      if(acceleration > 1){
        var timeDifference = (acceleration - 1) / this.speed * 1000
        GAME.lastTime = new Date() - timeDifference
        this.body[0] = this.body[0].add(this.dir)
        this.body[1] = this.body[1].add(this.dir)
        if(GAME.buffedDir !== null){
          this.dir = GAME.buffedDir
          GAME.buffedDir = null
        }
        this.borderCollision(this.body[0])
        this.borderCollision(this.body[1])
      }
    }
    Snake.prototype.speedUp = function(){
      this.speed += this.speed * this.acceleration
      if(this.speed > config.snake.maxSpeed)
        this.speed = config.snake.maxSpeed
      console.log(this.speed)
    }
    return Snake
  }

  setup()
  return ({
    start: function(){
      GAME.lastTime = new Date()
      GAME.running = true
      requestAnimationFrame(draw)
    },
    getConfig: function(){
      return config
    }
  })
}

var game = new Game(defaultConfig)
function startGame(){
  game.start()
}

function VectorConstructor(){
  function Vector(x, y){
    this.x = x
    this.y = y
  }

  Vector.prototype.add = function(vect){
    return new Vector(this.x + vect.x, this.y + vect.y)
  }
  Vector.prototype.sub = function(vect){
    return new Vector(this.x - vect.x, this.y - vect.y)
  }
  Vector.prototype.scale = function(n){
    return new Vector(this.x * n, this.y * n)
  }
  Vector.prototype.inverse = function(){
    return new Vector(this.x * -1, this.y * -1)
  }
  Vector.prototype.positive = function(){
    return new Vector(Math.abs(this.x),Math.abs(this.y))
  }
  Vector.prototype.equalTo = function(vect) {
    return this.x === vect.x && this.y === vect.y
  }
  Vector.prototype.duplicate = function(){
    return new Vector(this.x, this.y)
  }
  Vector.prototype.magnitude = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }
  Vector.prototype.normalize = function(){
    return this.scale(1/this.magnitude())
  }
  return Vector
}

// Greatest Common Divisor
function GCD(n1, n2){
  if(!n2) return n1
  return GCD(n2, n1 % n2)
}