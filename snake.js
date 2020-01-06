var Snake = function(params){
  var ctx, conf, tileSize, padding,
  canvas = {},
  defaultConfig = {
    canvas: { w: 550, h: 600 },
    game: {
      width: 90,
      elId: 'snakeGame',
      x: 8, y: 8,
      CasePerSecond: 1,
      acceleration: 0, maxSpeed: 5,
      snake: { length: 3 },
    },
    defaultColors: {
      field:{
        green1: 'rgb(142,204,57)', green2: 'rgb(167,217,72)',
      },
      apple: 'red',
      snake:{
        head: 'rgb(73, 255, 246)',
        body: 'rgb(47, 161, 255)',
      }
    },
    assetSource: './assets/snake_sprite.png'
  }
  var direction = {
    N: { axis: 'y', sign: '-', deg:  90 },
    E: { axis: 'x', sign: '+', deg: 180 },
    S: { axis: 'y', sign: '+', deg: 270 },
    W: { axis: 'x', sign: '-', deg:   0 }
  }
  var mergeObj = function(defaultObj, configObj){
    if(configObj === undefined) return defaultObj
    var obj = {}
    Object.keys(defaultObj).forEach(function(key){
      if(!!~[Array, Object].indexOf(defaultObj[key].constructor))
        if(configObj[key] !== undefined)
          return obj[key] = mergeObj(defaultObj[key], configObj[key])
        return obj[key] = configObj[key] || defaultObj[key]
    })
    return obj
  }
  var prepare = {
    conf: function(){
      if(conf !== undefined) return this
      conf = mergeObj(defaultConfig, params)
      return this
    },
    canvas: function(){
      if(ctx !== undefined) return this
      var holder = document.getElementById(conf.game.elId)
      holder.style.position = 'relative'

      canvas.background = document.createElement('canvas')
      canvas.background.width = conf.canvas.w
      canvas.background.height = conf.canvas.h
      canvas.background.style.position = 'absolute'
      canvas.background.style.zIndex = 1
      canvas.background.style.transform = 'translateX(-50%)'

      canvas.gameZone = document.createElement('canvas')
      canvas.gameZone.width = conf.canvas.w
      canvas.gameZone.height = conf.canvas.h
      canvas.gameZone.style.position = 'absolute'
      canvas.gameZone.style.zIndex = 2
      canvas.gameZone.style.transform = 'translateX(-50%)'
      holder.appendChild(canvas.gameZone)
      holder.appendChild(canvas.background)
      ctx = canvas.gameZone.getContext('2d')
      var gameSize =  conf.canvas.w / 100 * conf.game.width
      padding = (conf.canvas.w - gameSize) / 2
      tileSize = {x: gameSize / conf.game.x, y: gameSize / conf.game.y}
      draw.field(canvas.background.getContext('2d'))
      return this
    },
    snake: function(){
      snake.body = new Array()
      snake.direction = 'W'
      var snakeShift = {
        x: Math.floor((conf.game.x /2) - conf.game.snake.length /2) +2,
        y: conf.game.y - 2
      }
      for(var i = 0; i < conf.game.snake.length; i++){
        snake.body.push({
          x: snakeShift.x + i,
          y: snakeShift.y,
          direction: 'W', isAngle: false
        })
      }
      return this
    },
    apple: function(){
      apple.new()
      return this
    },
    assets: function(callback){
      if(conf.assets !== undefined) return callback()
      conf.assets = { main: new Image() }
      conf.assets.main.src = conf.assetSource
      conf.assets.main.onload  = function() {
        conf.assets.height = conf.assets.main.height
        conf.assets.width = conf.assets.height
        conf.assets.snake = {}
        conf.assets.snake.head  = 0 * conf.assets.height
        conf.assets.snake.body  = 1 * conf.assets.height
        conf.assets.snake.tail  = 2 * conf.assets.height
        conf.assets.snake.jTurn = 3 * conf.assets.height
        conf.assets.apple       = 4 * conf.assets.height
        callback()
      }
    }
  }
  var game = {
    caseInterval: 0,
    timeLastCase: 0,
    buffedEvent: null,
    getAxis: function(part){
      return direction[part.direction].axis
    },
    updateTimeLastCase: function(){
      var timeDifference = parseInt((
        (game.caseInterval - 1) / conf.game.CasePerSecond
      ) * 1000)
      game.timeLastCase = new Date() - timeDifference
    },
    updateCaseInterval: function(){
      var timeSinceLastDraw = new Date() - game.timeLastCase
      game.caseInterval = (conf.game.CasePerSecond * (timeSinceLastDraw / 1000))
    },
    buffEvent: function(ev){
      if(!snake.canTurn) return
      game.buffedEvent = ev.key.split('Arrow')[1] || ev.key
      snake.canTurn = false
    },
    isPlaying: function(){
      if(
        snake.body[0].x < 0 || snake.body[0].y < 0 ||
        snake.body[0].x > conf.game.x - 1 ||
        snake.body[0].y > conf.game.y - 0.9
      ) return false
      for(var i = 1; i < snake.body.length; i++){
        if(
          snake.body[0].x === snake.body[i].x &&
          snake.body[0].y === snake.body[i].y
        ) return false
      }
      return true
    },
    over: function(){
      window.removeEventListener('keydown', game.buffEvent)
      var score =
          snake.body.length
          / ((conf.game.x * conf.game.y) - 2) *100
      console.log('Game Over', parseInt(score) + '%')
    }
  }
  var draw = {
    rotateImage: function(asset, xy, deg){
      ctx.save()
      ctx.translate(
        padding + (xy.x + 0.5) * tileSize.x,
        padding + (xy.y + 0.5) * tileSize.y
      )
      ctx.rotate(deg * Math.PI/180)
      ctx.translate(
        -(padding + (xy.x + 0.5) * tileSize.x),
        -(padding + (xy.y + 0.5) * tileSize.y)
      )
      draw.image(asset, xy)
      ctx.restore()
    },
    image: function(sx, xy){
      ctx.drawImage(
        conf.assets.main,
        sx, 0, conf.assets.width, conf.assets.height,
        padding + xy.x * tileSize.x,
        padding + xy.y * tileSize.y,
        tileSize.x, tileSize.y
      )
    },
    field: function(backgroundCtx){
      var field = conf.defaultColors.field
      for(var x = 0; x < conf.game.x; x++){
        for(var y = 0; y < conf.game.y; y++){
          var color = (x+y) % 2 === 0 ? field.green1 : field.green2
          backgroundCtx.fillStyle = color
          backgroundCtx.fillRect(
            padding + x * tileSize.x,
            padding + y * tileSize.y,
            tileSize.x, tileSize.y
          )
        }
      }
      return this
    },
    apple: function(){
      draw.image(conf.assets.apple, apple)
      return this
    },
    tail: function(tail, axis){
      var asset = conf.assets.snake.tail
      tail[axis] += parseFloat(direction[tail.direction].sign + game.caseInterval)
      draw.rotateImage(asset, tail, direction[tail.direction].deg)
    },
    head: function(head, axis){
      var asset = conf.assets.snake.head
      head[axis] += parseFloat(direction[head.direction].sign + game.caseInterval)
      draw.rotateImage(asset, head, direction[head.direction].deg)
    },
    snakeNeck: function(){
      var neck = Object.create(snake.body[0])
      var sx = neck.isAngle ?
        conf.assets.snake.jTurn : conf.assets.snake.body
      var deg = neck.deg
      var imagePart = conf.assets.width * snake.offsetFromCase
      var neckTileSize = {
        x: tileSize.x,
        y: tileSize.y
      }
      neck.deg === 0 || 180 ?
          neckTileSize.x = neckTileSize.x * snake.offsetFromCase :
          neckTileSize.y = neckTileSize.x * snake.offsetFromCase
      // if(neck.isAngle){}
      // else{}
      ctx.save()
      ctx.translate(
        padding + (neck.x + 0.5) * tileSize.x,
        padding + (neck.y + 0.5) * tileSize.y
      )
      ctx.rotate(deg * Math.PI/180)
      ctx.translate(
        -(padding + (neck.x + 0.5) * tileSize.x),
        -(padding + (neck.y + 0.5) * tileSize.y)
      )
      neck.x -= snake.offsetFromCase - 1
      ctx.drawImage(
        conf.assets.main,
        sx + conf.assets.width - imagePart, 0,

        imagePart ,
        conf.assets.height,

        padding + neck.x * tileSize.x,
        padding + neck.y * tileSize.y,
        neckTileSize.x, neckTileSize.y
      )
      ctx.restore()

    },
    turn: function(t){
      var destination = t.index === 0 ?
        snake.nextBodyPart() : snake.body[t.index-1]


      var angDest = Object.keys(direction).indexOf(destination.direction)
      var angTurn = Object.keys(direction).indexOf(t.direction)

      if(angDest === angTurn + 1 || (angDest === 0 && angTurn === 3) ){
        console.log('tourne à droite')
      }
      else console.log('tourne à gauche')

      var asset = conf.assets.snake.jTurn
    },
    snake: function(){
      var turns = snake.body.reduce(function(acc, part, i){
        if(part.isAngle){
          var duplicate = JSON.parse(JSON.stringify(part))
          duplicate.index = i
          acc.push(duplicate)
        }
        return acc
      }, [])
      var turnsIndex = turns.length
      while(turnsIndex !== 0){
        turnsIndex--
        draw.turn(turns[turnsIndex])
      }

      var i = snake.body.length
      var asset
      while(i !== 0){
        i--
        var part = Object.create(snake.body[i])
        var axis = game.getAxis(part)
        switch(i){
          case 0:
            draw.head(part, axis)
            continue;
          case snake.body.length - 1:
            draw.tail(part, axis)
            continue;
          default:
            asset = conf.assets.snake.body
            break;
        }
        if(part.isAngle) {
        }
        else {
          part[axis] += parseFloat(direction[part.direction].sign + game.caseInterval)
          draw.rotateImage(asset, part, direction[part.direction].deg)
        }
      }
    }
  }
  var apple = {
    x: 0, y: 0,
    new: function(){
      //check win
      if(snake.body.length === conf.game.x * conf.game.y){
        return confirm("You win! \n Replay?") ? this.start() : ''
      }
      //apple creation
      this.x = Math.floor(Math.random() * conf.game.x)
      this.y = Math.floor(Math.random() * conf.game.y)
      for(var i = 0; i < snake.body.length; i++){
        if(apple.isOnCase(snake.body[i])) apple.new()
      }
      if(apple.isOnCase(snake.nextBodyPart())) apple.new()
    },
    isOnCase: function(xy){
      return this.x === xy.x && this.y === xy.y
    },
    eatenHandler: function(){
      conf.game.CasePerSecond < conf.game.maxSpeed ?
        conf.game.CasePerSecond += conf.game.acceleration : ''
      apple.new()
    }
  }
  var snake = {
    direction: 'W',
    body: [],
    canTurn: true,
    changeDirection: function(){
      if(!snake.canTurn) return
      var direction = game.buffedEvent
      if(!!!~['Up','Down','Left','Right'].indexOf(direction)) return
      var temp = null
      switch(direction){
        case 'Up':
          snake.direction === 'S' ? '' : temp = 'N'
          break;
        case 'Right':
          snake.direction === 'W' ? '' : temp = 'E'
          break;
        case 'Down':
          snake.direction === 'N' ? '' : temp = 'S'
          break;
        case 'Left':
          snake.direction === 'E' ? '' : temp = 'W'
          break;
      }
      game.buffedEvent = null
      if(temp === snake.direction) return
      snake.direction = temp
      snake.turnHead()
    },
    turnHead: function(){
      var angleDeg, angle = [
        {x: snake.nextBodyPart().x, y: snake.nextBodyPart().y},
        {x: snake.body[0].x, y: snake.body[0].y},
        {x: snake.body[1].x, y: snake.body[1].y},
      ]
      if(
        angle[0].x < angle[1].x && angle[2].y < angle[1].y ||
        angle[2].x < angle[1].x && angle[0].y < angle[1].y
      ){
        angleDeg = 0
      }
      else if(
        angle[0].y < angle[1].y && angle[2].x > angle[1].x ||
        angle[2].y < angle[1].y && angle[0].x > angle[1].x
      ) {
        angleDeg = 90
      }
      else if(
        angle[0].x < angle[1].x && angle[2].y > angle[1].y ||
        angle[2].x < angle[1].x && angle[0].y > angle[1].y
      ) angleDeg = 270
      else angleDeg = 180
      snake.body[0].isAngle = true
      snake.body[0].deg = angleDeg
    },
    updateBody: function(){
      snake.canTurn = true
      var newHead = snake.nextBodyPart()
      snake.body.unshift(newHead)
      if(apple.isOnCase(newHead)) apple.eatenHandler()
      else snake.body.pop()
    },
    nextBodyPart: function(){
      var nextPart = JSON.parse(JSON.stringify(snake.body[0]))
      nextPart.isAngle = false
      nextPart.direction = snake.direction
      var axis = game.getAxis(nextPart)
      nextPart[axis] += parseInt(direction[nextPart.direction].sign + 1)
      return nextPart
    },
  }

  var newFrame = function(){
    game.updateCaseInterval()
    ctx.clearRect(0, 0, conf.canvas.w, conf.canvas.h)
    draw.apple().snake()
    if(game.caseInterval < 1 ) {
      if(!game.isPlaying()) return game.over()
      if(game.buffedEvent !== null)
        snake.changeDirection()
    }
    if(game.caseInterval >= 1){
      game.updateTimeLastCase()
      snake.updateBody()
    }
    window.requestAnimationFrame(newFrame)
  }

  return ({
    start: function(){
      prepare.conf().canvas().snake().apple().assets(
        function(){
          window.addEventListener('keydown', game.buffEvent)
          game.timeLastCase = new Date()
          window.requestAnimationFrame(newFrame)
        }
      )
    },
    getConfig: function(){ return conf }
  })
}

var newSnake = new Snake({
  canvas: { w: 750, h: 750 },
  game:{
    width: 100,
    x: 8, y: 8,
    CasePerSecond: 2,
    acceleration: 0.2,
    maxSpeed: 6,
    snake: { length: 3 }
  }
})

var startGame = function(){
  newSnake.start()
}