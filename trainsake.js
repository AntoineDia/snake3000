var defaultConfig = {
  //id of DIV target
  elId: 'snakeGame',
  debug: true,
  game: {
    cols: 20, rows: 20,
    asset: './assets/snake_sprite.png',
  },
  snake: {
    length: 10,
    direction: 'Up',
    //speed in case per second
    speed: 1,
    accelerationPercent: 10,
    maxSpeed: 5,
  },
  field: {
    color1: 'rgb(142,204,57)',
    color2: 'rgb(167,217,72)',
    // asset: './assets/snakebg.png',
    pattern:{
      w: 8, h: 8
    }
  }
}

var Vector = VectorConstructor()
var directions = {
  Up: new Vector(0, -1),
  Right: new Vector(1, 0),
  Down: new Vector(0, 1),
  Left: new Vector(-1, 0)
}

function Game(config){
  var Snake = SnakeConstructor()
  var Field = FieldConstructor()
  var speed = config.snake.speed
  var running = false
  var debug = config.debug
  var lastTime = 0
  var board, canvas, ctx, caseSize, background, snake, holder, apple
  function setup(){
    board = new Vector(config.game.cols, config.game.rows)

    canvas = document.createElement('canvas')
    canvas.width = 64 * board.x
    canvas.height = 64 * board.y
    canvas.style.zIndex = 2
    canvas.style.width = '100%'
    canvas.style.position = 'absolute'

    ctx = canvas.getContext('2d')

    caseSize = {
      w: canvas.width / board.x,
      h: canvas.height / board.y
    }

    background = canvas.cloneNode()
    background.style.zIndex = 1

    snake = new Snake(config.snake)
    new Field(config.field)

    holder = document.getElementById(config.elId)
    holder.style.position = 'relative'
    holder.style.height = '100%'
    holder.appendChild(canvas)
    holder.appendChild(background)

    document.addEventListener('keydown', function(ev){
      if(debug && ev.code === 'KeyU'){
        speed += speed * config.snake.accelerationPercent /100
        console.log(speed)
      }
      if(snake.buffedDir !== null) return
      var dir = ev.key.split('Arrow')[1] || ev.key
      if(directions.hasOwnProperty(dir)){
        if(!snake.dir.equalTo(directions[dir].inverse()))
          snake.buffedDir = directions[dir]
      }
    })
  }
  function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    snake.draw()
    if(running) {
      snake.update()
      requestAnimationFrame(draw)
    }
  }
  function SnakeConstructor(){
    function Snake(params){
      this.speed = params.speed
      this.dir = directions[params.direction]
      this.buffedDir = null
      this.head = new Vector(4.5,4.5)
      this.body = []
      this.body[0] = this.head.duplicate()
    }

    Snake.prototype.draw = function(){
      // var diff = this.body[0].sub(this.head)
      // console.log(diff)
      // body
      ctx.fillStyle = 'black'
      ctx.fillRect(
        (this.body[0].x - 0.4) * caseSize.w,
        (this.body[0].y - 0.4) * caseSize.h,
        0.8 * caseSize.w,
        0.8 * caseSize.h
        // caseSize.w * 0.8, caseSize.h * 0.8
      )
      //head
      ctx.fillStyle = 'blue'
      ctx.fillRect(
        (this.head.x - 0.4) * caseSize.w,
        (this.head.y - 0.4) * caseSize.h,
        caseSize.w * 0.8, caseSize.h * 0.8
      )
    }
    Snake.prototype.borderCollision = function(vect){
      if(vect.x < 0) vect.x += board.x
      else if(vect.x > board.x) vect.x -= board.x
      else if(vect.y < 0) vect.y += board.y
      else if(vect.y > board.y) vect.y -= board.y
    }
    Snake.prototype.update = function(){
      var timeSince = (new Date() - lastTime) / 1000
      var acceleration = speed * timeSince
      this.head = this.body[0].add(this.dir.scale(acceleration))
      this.borderCollision(this.head)
      if(acceleration > 1){
        var timeDifference = (acceleration - 1) / this.speed * 1000
        lastTime = new Date() - timeDifference
        this.body[0] = this.body[0].add(this.dir)
        if(this.buffedDir !== null){
          this.dir = this.buffedDir
          this.buffedDir = null
        }
        this.borderCollision(this.body[0])
      }
    }
    return Snake
  }
  function FieldConstructor(){
    function Field(params){
      this.color1 = params.color1
      this.color2 = params.color2
      if(params.asset){
        this.asset = new Image()
        this.asset.src = params.asset
        this.asset.onload = this.draw()
      }
      else{
        this.drawColors()
      }
    }
    Field.prototype.draw = function(){
      var ctx = background.getContext('2d')
      ctx.drawImage(this.asset,0,0,canvas.width,canvas.height)
      ctx.fillRect(
        5 * caseSize.w, 5 * caseSize.h,
        caseSize.w, caseSize.h
      )
    }
    Field.prototype.drawColors = function(){
      var ctx = background.getContext('2d')
      for(var x = 0; x < board.x; x++){
        for(var y = 0; y < board.y; y++){
          var color = (x + y) % 2 === 0 ? this.color1 : this.color2
          ctx.fillStyle = color
          ctx.fillRect(
            x * caseSize.w, y * caseSize.h,
            caseSize.w, caseSize.h
          )
        }
      }
    }
    return Field
  }
  function AppleConstructor(){
    function Apple(x, y){
      return new Vector(x, y)
    }
  }
  setup()
  draw()
  return ({
    start: function(){
      lastTime = new Date()
      running = true
      requestAnimationFrame(draw)
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
  Vector.prototype.equalTo = function(vect) {
    return this.x === vect.x && this.y === vect.y
  }
  Vector.prototype.duplicate = function(){
    return new Vector(this.x, this.y)
  }
  return Vector
}