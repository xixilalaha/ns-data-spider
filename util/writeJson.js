const { promises } = require('dns');
var fs = require('fs'); // node自带
const jsonfile = require('jsonfile')

/**
 * 
 * @param {要写入的数据} data 
 * @param {文件名} fileName 
 */
function writeJson(data, fileName) {
  return new Promise((resolve, reject) => {
    fs.access(`../dist/${fileName}`, function (err) {
      if (err) {
          console.log('不存在该文件')
          console.log(fileName)
          fs.writeFileSync(`./dist/${fileName}`,'')
          jsonfile.writeFile(`./dist/${fileName}`, data, function (err) {
              if (err) throw err;
              console.log('Write to json has finished');
              resolve()
            });
            return
      }
      fs.unlink(`./dist/${fileName}`, function (err) {
          if (err) {
            console.log('文件删除失败')
            throw err;
          }
          jsonfile.writeFile(`./dist/${fileName}`, data, function (err) {
            if (err) throw err;
            console.log('Write to json has finished');
            resolve()
          });
        })
   })
  })
    
    
  
}
  
module.exports = {
    writeJson
}