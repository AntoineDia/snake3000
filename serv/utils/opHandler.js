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
          else resp = {...JSON.parse(data), ok: true}
          resolve(resp)
        }
      )
    )
  },
  getOps(){
    return new Promise(resolve => {
      this.getOpsName()
        .then(ops => {
          const fetch = ops.map(this.getOp)
          const results = Promise.all(fetch)
          results.then(data => {
            resolve(data)
          })
        })
    })
  },
  getOpsName(){
    return new Promise(resolve => getDir()
      .then(files =>
        resolve(files.map(file => file.split('.')[0])||null)
      )
    )
  },
  newOp(params){
    const file = opPath + '/' + params.name.toLowerCase() + '.json'
    const data = JSON.stringify(params)
    return new Promise(resolve => {
      fs.writeFile(file, data, err => {
        if(err) throw err
        resolve(params)
      })
    })
  }
}

module.exports = opHandler