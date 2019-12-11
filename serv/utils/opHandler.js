const fs = require('fs')

const opPath = './db/ops'

const getDir = (resolve) => {
  return new Promise(resolve => {
    fs.readdir(opPath, (err, files) => {
      if(err) throw err
      resolve(files)
    })
  })
}

const opHandler = {
  getOp(name){
    return new Promise(resolve =>
      fs.readFile(opPath + '/' + name + '.json', 'utf8',
        (err, data) => {
          let resp = {}
          if(data === undefined) resp.ok = false
          else resp = {...data, ok: true}
          resolve(resp)
        }
      )
    )
  },
  getOps(){
    return new Promise(resolve => getDir()
      .then(files =>
        resolve(files.map(file => file.split('.')[0])||null)
      )
    )
  },
  newOp(params){
    const file = opPath + '/' + params.opName.toLowerCase() + '.json'
    const data = JSON.stringify(params)
    return new Promise(resolve => {
      fs.writeFile(file, data, err => {
        if(err) throw err
        resolve(params.opName)
      })
    })
  }
}

module.exports = opHandler