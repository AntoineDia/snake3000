const express = require('express')

const logs = require('./serv/logs.js')

const port = 3000
const app = express()

app
  .set('view engine', 'ejs')
  .use('/static', express.static('static'))

  .get('/configure', (req, res) => {
    res.render('configure')
  })
  .get('/box', (req, res) => {
    res.render('box')
  })
  .get('/', (req, res) => {
    res.send('Snake 3000 server')
  })

  .listen(port, () => logs(port).start())