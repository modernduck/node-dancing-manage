var express = require('express');
var router = express.Router();
var path = require('path');
var mailer = require('../libs/mailer')
/* GET home page. */
router.use('/assets', express.static(path.join(__dirname,'../public')));
router.use('/hidden', express.static(path.join(__dirname,'../hidden')));

router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname,'../views/index.html'));
});

router.get('/yo', function(req, res, next){
	var mailOptions = {
		from: "Registration <registration@bangkokswing.com>",
		to: "sompop.kulapalanont@gmail.com",
		subject :"Test smtp",
		text :"yo",
		html :"<b>Zup</b>"
	}
	mailer.sendMail(mailOptions, function(data){
		res.send("sended")
	})


})

module.exports = router;
