var fs = require('fs'); // node自带
const jsonfile = require('jsonfile')

/**
 * 
 * @param {要写入的数据} data 
 * @param {文件名} fileName 
 */
function writeJson(data, fileName) {
    // console.log(data,'data')
    fs.access(`../dist/${fileName}`, function (err) {
        if (err) {
            console.log('不存在该文件')
            console.log(fileName)
            fs.writeFileSync(`./dist/${fileName}`,'')
            // fs.writeFile(`./dist/${fileName}`, 'Hello Node.js', (err) => {
            //     console.log(err,'err')
            // });
            jsonfile.writeFile(`./dist/${fileName}`, data, function (err) {
                if (err) throw err;
                console.log('Write to json has finished');
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
            });
          })
     })
    
  
}
  
module.exports = {
    writeJson
}