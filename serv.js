const express = require('express')
const bodyParser = require('body-parser');

const logs = require('./serv/utils/logs.js')
const opHandler = require('./serv/utils/opHandler.js')

const port = 3000
const app = express()

app
  .set('view engine', 'ejs')
  .use('/static', express.static('static'))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())

  .get('/configure/:name', (req, res) => {
    res.render('pages/configure')
  })
  .get('/box', (req, res) => {
    res.render('pages/box')
  })
  .get('/ops', (req, res) => {
    opHandler.getOps()
      .then(ops => {
        res.render('pages/ops', {ops})
      })
  })
  .get('/checkDuplicate/:name', (req, res) => {
    const { name } = req.params
    opHandler.getOp(name)
      .then(op => res.json({freeName: !op.ok}))
  })
  .get('/', (req, res) => {
    res.send('Snake 3000 server')
  })
  .post('/newOp', (req, res) => {
    const params = req.body
    opHandler.newOp(params)
      .then((op) => {
        res.json(op)
      })
  })


  .listen(port, () => logs.start(port))