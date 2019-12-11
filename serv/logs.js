module.exports = (port) => {
const log = (txt) => console.log(txt)

return {
start()
{ log(`
Server started on port: ${port}

Routes GET
  configuration: http://localhost:${port}/configure
  box:           http://localhost:${port}/box
`)
}
}

}