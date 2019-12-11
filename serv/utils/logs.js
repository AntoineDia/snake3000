const log = (txt) => console.log(txt)

const logs = {
start(port)
{
log(`
Server started on port: ${port}

Routes GET
  configuration: http://localhost:${port}/configure
  box:           http://localhost:${port}/box
  ops:           http://localhost:${port}/ops
`)
}
}

module.exports = logs