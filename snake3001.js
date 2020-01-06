var Snake = function(params){
  var holder
  var scoreDiv = null
  var defaultConfig = {
    canvas: {col: 10, row: 10},
    game: {
      walls: false,
      blocky: true,
      elId: 'snakeGame',
      CasePerSecond: 3, accelerationPercent: 10, CasePerSecondMax: 5.5,
      direction: 'N',
    },
    snake: { length: 3 },
    field:{
      green1: 'rgb(142,204,57)', green2: 'rgb(167,217,72)',
      // Pattern size is Optional
      patternSize: {x: 8, y: 8}
    },
    tuto: true,
    assets:{
      main: './assets/snake.png',
      // main: './assets/snaketrain.png',
      bgAsset: './assets/bg.png',
      tutoTouch: './assets/tuto_mobile.gif',
      tutoKey: './assets/tuto_desktop.gif'
    }
  }
  var fullConf = {}
  var assets = {}
  var canvas = {}
  var configure = {
    prepare: function(){
      if(Object.keys(fullConf).length > 0) return this
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
      fullConf = mergeObj(defaultConfig, params)
      scoreDiv = document.getElementById('score')
      scoreDiv.innerHTML = '0 pomme'
      return this
    },
    canvas: function(){
      if(Object.keys(canvas).length > 0) return this
      holder = document.getElementById(fullConf.game.elId)
      canvas.background = document.createElement('canvas')
      canvas.gameZone = document.createElement('canvas')
      canvas.gameZone.id = 'gameZone'
      var arr = [holder, canvas.background, canvas.gameZone]
      arr.forEach(function(el){
        switch(el.tagName){
          case 'DIV':
           el.style.position = 'relative'
          //  el.style.height = '100%'
           break;
          case 'CANVAS':
            if(el.id === 'gameZone') el.style.zIndex = 2
            else el.style.zIndex = 1
            el.style.width = '100%'
            el.style.position = 'absolute'
            el.style.borderRadius = '10px'
            holder.appendChild(el)
            break;
        }
      })
      return this
    },
    game: function(){
      game.direction = game.cardinal[fullConf.game.direction]
      game.CasePerSecond = fullConf.game.CasePerSecond
      game.col = fullConf.canvas.col
      game.row = fullConf.canvas.row
      game.acceleration = fullConf.game.accelerationPercent
      game.CasePerSecondMax = fullConf.game.CasePerSecondMax
      game.ctx = canvas.gameZone.getContext('2d')
      return this
    },
    snake: function(){
      snake.body = []
      var nextPart = {
        x: Math.ceil((game.col /2)),
        y: Math.ceil((game.row /2))
      }
      for(var i = 0; i < fullConf.snake.length; i++){
        var nextPartHolder = JSON.parse(JSON.stringify(nextPart))
        nextPartHolder[game.direction.axis] += i * -(game.direction.sign)
        if(i === fullConf.snake.length-1) {
          nextPartHolder.deg = game.direction.deg
        }
        snake.body.push(nextPartHolder)
      }
      return this
    },
    assets: function(callback){
      if(Object.keys(assets).length > 0) return callback()
      assets = { main: new Image() }
      assets.main.src = fullConf.assets.main
      assets.main.onload = function() {
        assets.h = assets.main.height
        assets.w = assets.main.width
        canvas.background.width = assets.main.height * fullConf.canvas.col
        canvas.background.height = assets.main.height * fullConf.canvas.row
        canvas.gameZone.width = assets.main.height * fullConf.canvas.col
        canvas.gameZone.height = assets.main.height * fullConf.canvas.row
        canvas.w = assets.main.height * fullConf.canvas.col
        canvas.h = assets.main.height * fullConf.canvas.row
        game.caseSize = {
          w: assets.main.height,
          h: assets.main.height
        }
        assets.head  = 0 * assets.h
        assets.body  = 1 * assets.h
        assets.tail  = 2 * assets.h
        assets.jTurn = 3 * assets.h
        assets.apple = 4 * assets.h
        callback()
      }
    },
  }
  var game = {
    caseInterval: 0,
    timeLastCase: 0,
    buffedDirection: null,
    update: {
      caseInterval: function(){
        var timeSince = new Date() - game.timeLastCase
        game.caseInterval = game.CasePerSecond * (timeSince / 1000)
      },
      timeLastCase: function(){
        var timeDifference = parseInt((
          (game.caseInterval - 1) / game.CasePerSecond
        ) * 1000)
        game.timeLastCase = new Date() - timeDifference
      },
      direction: function(){
        var newDirection = game.buffedDirection
        if(!!!~['Up','Down','Left','Right'].indexOf(newDirection)) return
        var card = null
        switch(newDirection){
          case 'Up':
            game.direction.deg === 270 ? '' : card = 'N'
            break;
          case 'Right':
            game.direction.deg === 360 ? '' : card = 'E'
            break;
          case 'Down':
            game.direction.deg ===  90 ? '' : card = 'S'
            break;
          case 'Left':
            game.direction.deg === 180 ? '' : card = 'W'
            break;
        }
        if(card !== null){
          if(game.cardinal[card].deg !== game.direction.deg){
            game.direction = game.cardinal[card]
            snake.body[0].deg = game.cardinal[card].deg
          }
        }
        game.buffedDirection = null
      }
    },
    cardinal: {
      N: { axis: 'y', sign: -1, deg:  90 },
      E: { axis: 'x', sign: +1, deg: 180 },
      S: { axis: 'y', sign: +1, deg: 270 },
      W: { axis: 'x', sign: -1, deg: 360 }
    },
    touchEvent: function(event){
      game.startTouch = {
        x: event.touches[0].pageX,
        y: event.touches[0].pageY
      }
    },
    touchEnd: function(event){
      if(game.buffedDirection !== null) return
      var end = {
        x: event.changedTouches[0].pageX,
        y: event.changedTouches[0].pageY
      }
      var delta = {
        x: end.x - game.startTouch.x,
        y: end.y - game.startTouch.y
      }
      var sensibility = 0.1
      var dWidth = document.body.clientWidth
      if(
        Math.abs(delta.x) < sensibility * dWidth &&
        Math.abs(delta.y) < sensibility * dWidth
      ) return
      if(Math.abs(delta.x) > Math.abs(delta.y)){
        if(delta.x > 0) game.buffedDirection = 'Right'
        else game.buffedDirection = 'Left'
      }
      else{
        if(delta.y > 0) game.buffedDirection = 'Down'
        else game.buffedDirection = 'Up'
      }
    },
    buffEvent: function(ev){
      if(game.buffedDirection !== null) return
      game.buffedDirection = ev.key.split('Arrow')[1] || ev.key
    },
    start: function(){
      game.update.timeLastCase()
      requestAnimationFrame(newFrame)
    },
    nextCase: function(){
      snake.updateBody()
      snake.canTurn = true
      game.update.timeLastCase()
      game.update.caseInterval()
    },
    over: function(){
      scoreDiv.innerHTML = 'Game Over'
      window.removeEventListener('keydown', game.buffEvent)
    }
  }
  var apple = {
    score: 0,
    new: function(){
      apple.x = Math.floor(Math.random() * game.col)
      apple.y = Math.floor(Math.random() * game.row)
      for(var i = 0; i < snake.body.length; i++){
        if(apple.isOnCase(snake.body[i])) apple.new()
      }
      if(apple.isOnCase(snake.nextPart())) apple.new()
    },
    isOnCase: function(coord){
      return this.x === coord.x && this.y === coord.y
    },
    eaten: function(){
      game.CasePerSecond += game.CasePerSecond * game.acceleration / 100
      if(game.CasePerSecond > game.CasePerSecondMax)
        game.CasePerSecond = game.CasePerSecondMax
      apple.new()
      apple.score ++
      if(apple.score > 1){
        var scoreMessage = apple.score + ' apples'
      }
      else{
        var scoreMessage = apple.score + ' apple'
      }
      scoreDiv.innerHTML = scoreMessage
    }
  }
  var snake = {
    canTurn: true,
    updateBody: function(){
      var newHead = snake.nextPart()
      snake.body.unshift(newHead)
      if(apple.isOnCase(newHead)) apple.eaten()
      else {
        var body = snake.body
        if(body[body.length-2].deg === undefined){
          body[body.length-2].deg = body[body.length-1].deg
        }
        body.pop()
      }
    },
    nextPart: function(){
      var nextPart = { x: snake.body[0].x, y: snake.body[0].y }
      nextPart[game.direction.axis] += game.direction.sign
      if(!fullConf.game.walls){
        if(nextPart[game.direction.axis] < 0){
          if(game.direction.axis === 'x') nextPart.x += game.col
          else nextPart.y += game.row
        }
        else if(nextPart.x > game.col - 1){
          nextPart.x -= game.col
        }
        else if(nextPart.y > game.row - 1){
          nextPart.y -= game.row
        }
      }
      return nextPart
    },
    isAlive: function(){
      /* BORDER */
      if(fullConf.game.walls){
        if(
          snake.body[0].x < 0 || snake.body[0].y < 0 ||
          snake.body[0].x > game.col - 1 ||
          snake.body[0].y > game.row - 0.9
        ) return false
      }
      for(var i = 1; i < snake.body.length; i++){
        if(
          snake.body[0].x === snake.body[i].x &&
          snake.body[0].y === snake.body[i].y
        ) return false
      }
      return true
    }
  }
  var draw = {
    sprite: function(coord, sx){
      game.ctx.drawImage(
        assets.main, sx, 0,
        assets.h, assets.h,
        coord.x * game.caseSize.w,
        coord.y * game.caseSize.w,
        game.caseSize.w, game.caseSize.h
      )
    },
    rotated: function(coord, sx, deg){
      newCoord = {
        x: (coord.x +0.5) * game.caseSize.w,
        y: (coord.y +0.5) * game.caseSize.h
      }
      game.ctx.save()
      game.ctx.translate(newCoord.x, newCoord.y)
      game.ctx.rotate(deg * Math.PI/180)
      game.ctx.translate(-newCoord.x, -newCoord.y)
      draw.sprite(coord, sx)
      game.ctx.restore()
    },
    field: function(){
      var field = fullConf.field
      var backgroundCtx = canvas.background.getContext('2d')
        for(var x = 0; x < game.col; x++){
          for(var y = 0; y < game.row; y++){
            var color = (x + y) % 2 === 0 ? field.green1 : field.green2
            backgroundCtx.fillStyle = color
            backgroundCtx.fillRect(
              Math.round(x * game.caseSize.w),
              Math.round(y * game.caseSize.h),
              Math.round(game.caseSize.w), Math.round(game.caseSize.h)
            )
          }
        }
      if(fullConf.assets.bgAsset){
        var bgImg = new Image()
        bgImg.src = fullConf.assets.bgAsset
        bgImg.onload = function() {
          if(fullConf.field.patternSize){
            var itemSize = {
              x: bgImg.width / fullConf.field.patternSize.x,
              y: bgImg.height / fullConf.field.patternSize.y
            }
            canvas.background.width = itemSize.x * game.col
            canvas.background.height = itemSize.x * game.row
            var pattern = backgroundCtx.createPattern(bgImg, 'repeat')
            backgroundCtx.fillStyle = pattern
            backgroundCtx.fillRect(
              0, 0, canvas.background.width, canvas.background.width
            )
          }
          else backgroundCtx.drawImage(
            bgImg, 0, 0, canvas.w, canvas.h
          )
        }
      }
      return this
    },
    apple: function(){
      draw.sprite(apple, assets.apple)
      return this
    },
    snake: function(){
      var deg = 0
      var body = snake.body
      var turns = []

      function blockySnake(){
        var bgctx = canvas.background.getContext('2d')
        draw.field()
        bgctx.fillStyle = 'aqua'
        body.forEach(part => {
          bgctx.fillRect(
            part.x * game.caseSize.w,
            part.y * game.caseSize.h,
            game.caseSize.w, game.caseSize.h
          )
        })
      }

      function getNewCoord(coord){
        var cardi = Object.keys(game.cardinal).filter(function(card){
          return game.cardinal[card].deg === deg
        })
        var axis = game.cardinal[cardi].axis
        var newCoord = JSON.parse(JSON.stringify(coord))
        newCoord[axis] += game.cardinal[cardi].sign * game.caseInterval
        return(newCoord)
      }
      function drawPart(coord, sx){
        if(fullConf.game.blocky){
          draw.rotated(coord, sx, deg)
        }
        else{
          var newCoord = getNewCoord(coord)
          draw.rotated(newCoord, sx, deg)
        }
      }
      function drawBody(){
        var sx = assets.body
        for(var i = body.length - 1; i > -1; i--){
          if(body[i].deg !== undefined){
            deg = body[i].deg
            turns.push(body[i])
          }
          if(i === 0 || i === body.length - 1) continue
          drawPart(body[i], sx)
        }
        drawTurns()
      }
      function drawTurns(){
        var sx = assets.jTurn
        var currDeg = 0
        var prevDeg = 0
        var angle = 0
        for(var i = 1; i < turns.length; i++){
          currDeg = turns[i].deg
          prevDeg = turns[i-1].deg
          switch(currDeg){
            case game.cardinal.N.deg:
              if(prevDeg === game.cardinal.E.deg)
                angle = 0
              else angle = 90
              break;
            case game.cardinal.E.deg:
              if(prevDeg === game.cardinal.N.deg)
                angle = 180
              else angle = 90
              break;
            case game.cardinal.S.deg:
              if(prevDeg === game.cardinal.E.deg)
                angle = 270
              else angle = 180
              break;
            case game.cardinal.W.deg:
              if(prevDeg === game.cardinal.S.deg)
                angle = 0
              else angle = 270
              break;
          }
            if(i === turns.length-1){
              if(
                turns[i].x === snake.body[0].x &&
                turns[i].y === snake.body[0].y
              ){
              } else{
                game.ctx.clearRect(
                  turns[i].x * game.caseSize.w,
                  turns[i].y * game.caseSize.w,
                  game.caseSize.w, game.caseSize.h
                )
                draw.rotated(turns[i], sx, angle)
              }
            } else {
              game.ctx.clearRect(
                turns[i].x * game.caseSize.w,
                turns[i].y * game.caseSize.w,
                game.caseSize.w, game.caseSize.h
              )
              draw.rotated(turns[i], sx, angle)
            }
        }

        var deg2 = deg

        deg = body[body.length-1].deg
        drawPart(body[body.length-1], assets.tail)

        if(turns[turns.length-1].deg === body[0].deg){
          deg = turns[turns.length-2].deg
        }
        else deg = deg2

        drawPart(body[0], assets.head)
      }

      drawBody()
      // blockySnake()
    }
  }

  function newFrame(){
    game.update.caseInterval()
    if(game.caseInterval >= 1) {
      game.nextCase()
      if(!snake.isAlive()) {
        game.ctx.clearRect(0, 0, canvas.w, canvas.h)
        draw.apple().snake()
        return game.over()
      }
    }
    else if(game.buffedDirection !== null && snake.canTurn){
      game.update.direction()
      snake.canTurn = false
    }
    game.ctx.clearRect(0, 0, canvas.w, canvas.h)
    draw.apple().snake()
    requestAnimationFrame(newFrame)
  }

  configure.prepare().canvas().game().snake().assets(function(){
    apple.new()
    draw.field().apple().snake()
    if(fullConf.tuto){
      var holder = document.getElementById(fullConf.game.elId)
      var tutoHolder = document.createElement('div')
      var tutoImageHolder = document.createElement('div')
      var tutoImg = document.createElement('img')
      var tutoButton = document.createElement('button')
      tutoButton.onclick = startGame.bind(this)
      tutoButton.innerHTML = "Start"
      tutoButton.className = "button"
      if(document.body.clientWidth > document.body.clientHeight){
        tutoImg.src = fullConf.assets.tutoKey
      }
      else {
        tutoImg.src = fullConf.assets.tutoTouch
      }
      tutoImg.style.width = 'auto'
      tutoImg.style.height = 'auto'
      tutoImg.style.maxWidth = '100%'
      tutoImg.style.maxHeight = '100%'

      tutoHolder.style.zIndex = 3
      tutoHolder.style.position = 'absolute'
      tutoHolder.style.width = '100%'
      tutoHolder.style.height = '100%'
      tutoHolder.style.display = 'flex'
      tutoHolder.style.flexDirection = "column"
      tutoHolder.style.justifyContent = 'center'
      tutoHolder.style.alignItems = 'center'
      tutoHolder.style.backgroundColor = 'rgba(255,255,255,0.5)'

      tutoImageHolder.style.width = 'auto'
      tutoImageHolder.style.height = 'auto'
      tutoImageHolder.style.maxWidth = '50%'
      tutoImageHolder.style.maxHeight = '50%'
      tutoImageHolder.style.backgroundColor = 'rgba(255,255,255,0.5)'
      tutoImageHolder.style.borderRadius = '5px'


      tutoImageHolder.appendChild(tutoImg)
      tutoHolder.appendChild(tutoImageHolder)
      tutoHolder.appendChild(tutoButton)

      holder.appendChild(tutoHolder)

      function startGame(){
        holder.removeChild(tutoHolder)
        this.init()
      }
    }
  }.bind(this))

  this.init =  function(){
    document.addEventListener('keydown', game.buffEvent)
    document.addEventListener('touchstart', game.touchEvent)
    document.addEventListener('touchend', game.touchEnd)
    game.start()
  }
  this.toggleFullScreen = function(){
    if (!document.fullscreenElement) {
    holder.requestFullscreen().catch(err => {
      alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });
  } else {
    document.exitFullscreen();
  }
  }
}

var snake = new Snake()
var startGame = function(){
  snake.init()
}
var requestFullScreen = function(){
  snake.toggleFullScreen()
}