const {requestHKTarget} = require('./HK');
const {requestHKTarget2} = require('./HK2');
const {requestUKTarget} = require('./UK');
const {requestJPTarget} = require('./JP');
const {requestUSATarget} = require('./USA');
const {requestUSATarget2} = require('./USA2');
const {requestUSATarget3} = require('./USA3');
const {requestUSATarget4} = require('./USA4');
const {requestCATarget} = require('./CA');
const {requestLATarget} = require('./LA');
const {requestBRTarget}  = require('./BR');
const {requestCOTarget}  = require('./CO');
const {requestARTarget}  = require('./AR');
const {requestCLTarget} = require('./CL');
const { requestPETarget } = require('./PE');
const {requestKRTarget} = require('./KR');

const express = require('express');

const app = express();

app.listen(3000);

//香港数据请求
app.get('/hk', async (req, res) => {
  const data = await requestHKTarget();
  res.send(data);
});
//香港数据请求
app.get('/hk2', async (req, res) => {
  const data = await requestHKTarget2();
  res.send(data);
});
//日本
app.get('/jp', async (req, res) => {
  const data = await requestJPTarget(undefined,undefined,undefined,'Kingdom Rush - タワーディフェンス');
  console.log(data.length);
  res.send(data.splice(0,100));
});
//美国数据
app.get('/usa', async (req, res) => {
  const data = await requestUSATarget();
  console.log(data.length,'data')
  res.send(data);
});
//美国数据
app.get('/usa2', async (req, res) => {
  const data = await requestUSATarget2();
  console.log(data.length,'data')
  res.send(data);
});
//美国数据
app.get('/usa3', async (req, res) => {
  const data = await requestUSATarget3();
  console.log(data.length,'data')
  res.send(data.splice(0,100));
});
//美国数据
app.get('/usa4', async (req, res) => {
  const data = await requestUSATarget4();
  console.log(data.length,'data')
  res.send(data);
});
//加拿大
app.get('/ca',async (req,res) => {
  const data = await requestCATarget();
  res.send(data);
});
//墨西哥
app.get('/la',async (req,res) => {
  const data = await requestLATarget();
  res.send(data);
});
//巴西
app.get('/br',async (req,res) => {
  const data = await requestBRTarget();
  res.send(data);
});
//哥伦比亚
app.get('/co',async (req,res) => {
  const data = await requestCOTarget();
  res.send(data);
});
//阿根廷
app.get('/ar',async (req,res) => {
  const data = await requestARTarget();
  res.send(data);
});
//智利
app.get('/cl',async (req,res) => {
  const data = await requestCLTarget();
  res.send(data);
});
//秘鲁
app.get('/pe',async (req,res) => {
  const data = await requestPETarget();
  res.send(data);
});
//韩国
app.get('/kr',async (req,res) => {
  const data = await requestKRTarget();
  res.send(data);
});
//英国
app.get('/uk',async (req,res) => {
  const data = await requestUKTarget();
  res.send(data);
});
//汇总
app.get('/total', async (req, res) => {
  let nameArr = ["Zumba® Burn It Up!","Zumba® Burn It Up!","Zumba® Burn It Up!","Zumba® Burn It Up!","Zumba®de Fat Burning！","Zumba Burn It Up!","Zumba® Burn It Up!","Zumba® Burn It Up!"]
  const data = await requestUKTarget();
  res.send(data);
})
