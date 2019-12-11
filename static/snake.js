var snake = new Vue({
  el: '#snake',
  data() {
    return {
      c: null,
      ctx: null,
      win: null,
      isPlaying: false,
      gameSize: 480,
      gameBoxes: 16,
      boxSize: 0,
      speed: 400,
      direction: { axis: 'x', sign: '+' },
      apple: {x: 10, y: 3},
      snake:[
        { x: 5, y: 3, closed: true},
        { x: 4, y: 3 },
        { x: 3, y: 3 },
      ],
      assets: {
        other: {
          apple: './static/assets/apple.png'
        },
        head: {
          open: './static/assets/head_open.png',
          closed: './static/assets/head_closed.png',
        },
        body: {
          flat: './static/assets/body_flat.png',
          full: './static/assets/body_full.png'
        }
      }
    }
  },
  mounted() {
    this.c = this.$refs.gameZone
    this.c.width = this.gameSize
    this.c.height = this.gameSize
    this.ctx = this.c.getContext("2d")
    this.prepareAssets()
    this.boxSize = this.gameSize / this.gameBoxes
  },
  methods: {
    prepareAssets(){
      Object.keys(this.assets).forEach(function(assetPart){
        Object.keys(this.assets[assetPart]).forEach(function(part){
          var assetSource = this.assets[assetPart][part]
          this.assets[assetPart][part] = new Image()
          this.assets[assetPart][part].src = assetSource
        }.bind(this))
      }.bind(this))
    },
    startGame(){
      this.isPlaying = true
      this.drawApple()
      this.drawSnake()
    },
    drawApple(){
      var x = this.apple.x * this.boxSize
      var y = this.apple.y * this.boxSize
      this.ctx.drawImage(this.assets.other.apple,
        x, y, this.boxSize, this.boxSize)
    },
    drawSnake(){
      this.snake.forEach( function(part,i){
        this.drawSnakePart(part, i)
      }.bind(this))
      setTimeout(function(){
        this.moveSnake()
      }.bind(this),this.speed)
    },
    drawSnakePart(part,i){
      if(i === 0){
        var assetPart = 'head'
        var param = part.closed ? 'closed' : 'open'
      }
      else {
        var assetPart = 'body'
        var param = part.full ? 'full' : 'flat'
      }
      var x = part.x * this.boxSize
      var y = part.y * this.boxSize
      this.ctx.drawImage(this.assets[assetPart][param],
        x, y, this.boxSize, this.boxSize)
    },
    isApple(x,y){
      if(x === this.apple.x && y === this.apple.y)
        return true
      return false
    },
    moveSnake(){
      var newHeadCoord = {
        x: this.snake[0].x,
        y: this.snake[0].y
      }
      var isMouthClosed = ''
      switch(this.direction.axis){
        case 'x':
          newHeadCoord.x += parseInt(this.direction.sign + '1')
          isMouthClosed = !this.isApple(
            newHeadCoord.x + parseInt(this.direction.sign + '1'),
            newHeadCoord.y
          )
          break;
        case 'y':
          newHeadCoord.y += parseInt(this.direction.sign + '1')
          isMouthClosed = !this.isApple(
            newHeadCoord.x,
            newHeadCoord.y + parseInt(this.direction.sign + '1'),
          )
          break;
      }
      this.snake.unshift({
        x: newHeadCoord.x, y: newHeadCoord.y, closed: isMouthClosed
      })
      this.drawSnake()
    }
  },
})