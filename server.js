// function requireHTTPS(req, res, next) {
//     console.log('1');
//     // The 'x-forwarded-proto' check is for Heroku
//     if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
//         return res.redirect('https://' + req.get('host') + req.url);
//     }
//     next();
// }
// console.log('start');
// const express = require('express');
// console.log('start2');
// const app = express();
// console.log('start3');
// app.use(requireHTTPS);
// console.log('start4');
// app.use(express.static('./dist/contact-generator'));
// console.log('start5');
// app.get('/*', function(req, res) {
//     console.log(res)
//     res.sendFile('index.html', {root: 'dist/contact-generator'});
// });
// console.log('start6');
// app.listen(process.env.PORT || 8000);
// console.log('start7');
const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(__dirname + '/dist/contact-generator'));
app.get('/*', function(req,res) {
res.sendFile(path.join(__dirname+
'/dist/contact-generator/index.html'));});
app.listen(process.env.PORT || 8080);