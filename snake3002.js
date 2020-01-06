var defaultConfig = {
  //id of DIV target
  elId: 'snakeGame',
  canvas: {
    w: 690, h: 390,
  },
  game: {
    cols: 23, rows: 13,
    //speed in case per second
    speed: 3,
    acceleration: 0.1,
    maxSpeed: 5,
    asset: './assets/snake_sprite.png',
  },
  snake: {
    length: 10,
    direction: 'W'
  },
  field: {
    color1: 'rgb(142,204,57)',
    color2: 'rgb(167,217,72)',
    asset: undefined,
  }
}

function Vector(x, y){
  this.x = x
  this.y = y
}
Vector.prototype.add = function(vect){
  return new Vector(this.x + vect.x, this.y + vect.y)
}
Vector.prototype.subtract = function(vect) {
  return new Vector(this.x - vect.x, this.y - vect.y)
}
Vector.prototype.equalTo = function(vect) {
  return this.x === vect.x && this.y === vect.y
}

function Segment(start, end) {
  this.start = start
  this.end = end
}
Segment.prototype.getVector = function() {
  return this.end.subtract(this.start)
}
Segment.prototype.isPointInside = function(point) {
    var first = new Segment(this.start, point)
    var second = new Segment(point, this.end)
    return areEqual(this.length(), first.length() + second.length())
}

var direction = {
  N: new Vector(0, -1),
  E: new Vector(1, 0),
  S: new Vector(0, 1),
  W: new Vector(-1, 0)
}

function Snake2 (params) {
  this.elId = params.elId
  this.canvas = params.canvas
  this.game = params.game
  this.snake = params.snake
  this.field = params.field
}

Snake2.prototype.init = function(){
  var holder = document.getElementById(this.elId)
  holder.style.position = 'relative'

  var game = document.createElement('canvas')
  game.width = this.canvas.w
  game.height = this.canvas.h
  game.style.zIndex = 2
  game.style.position = 'absolute'
  game.style.transform = 'translateX(-50%)'

  var animations = document.createElement('canvas')

  var background = document.createElement('canvas')
  background.width = this.canvas.w
  background.height = this.canvas.h
  background.style.zIndex = 2
  background.style.position = 'absolute'
  background.style.transform = 'translateX(-50%)'

  holder.appendChild(game)
  holder.appendChild(animations)
  holder.appendChild(background)

  this.canvas.ctx = game.getContext('2d')
  this.canvas.caseWidth = this.canvas.w / this.game.cols
  this.canvas.caseHeight = this.canvas.h / this.game.rows
  this.canvas.game = game
  this.canvas.animations = animations
  this.canvas.background = background

  this.snake.body = [
    new Vector(5,5),
    new Vector(5,7)
  ]

}


var game = new Snake2(defaultConfig)
game.init()
console.log(game)