var express = require('express');
var router = express.Router();
var Models = require('../models/Schema');
var Mailer = require('../libs/mailer')
var Class = Models.Class
var User = Models.User;
var Skill = Models.Skill;
var Payment = Models.Payment;
var multer  =   require('multer');

var upload = multer()
var mkdirp = require('mkdirp');
var path = require('path');



/*var bodyParser = require('body-parser');
router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
*/
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

function handleError(err, res)
{
	console.log(err)
	res.json({"status":"error", "message":"Whoops what ever you did it's wrong"});	
}

router.get('/', function(req, res, next) {
  //console.log(Class.find())
  Payment.find().populate('user').populate('classes.class').exec(function(err, docs){
  	if (err) return handleError(err, res);
  	res.json(docs);	
  })
  
});

router.get('/member', function(req, res, next){
	console.log(req.query.member_id)
	Payment.find({user:req.query.member_id}).populate('classes.class').exec(function (err, payments){
		if(err) {
            return handleError(err, res);
        }

		res.json(payments)
	})
})

router.post('/echo', function(req, res,next){
	res.json(req.body);
})

router.post('/', function(req, res, next){

    var payment =  {};
    payment.amount = req.body.amount;
    payment.classes = [];
    req.body.classes.forEach(function(id){
    	payment.classes.push({class:id});
    })
    console.log(payment.classes)
    payment.filePath = req.body.filePath;
    payment.dateTime = req.body.date;
   payment.create_time = new Date();
   payment.status = 1;
   payment.user = req.body.member_id;
   payment.mark = req.body.mark;
   payment.type = 0;
   Payment.create(payment, function(err, doc){
		if (err) return handleError(err, res);
		res.json({status:"success", payment:doc})
	})
    

	
})

router.post('/upload', function(req, res, next){
	console.log('uploading---')
	var now = new Date();
	var filename =  Math.floor(Math.random() * 100) + "" + now.getTime();
	var folder = 'hidden/images/slip/'
	var storage = multer.diskStorage({
		  destination: function (req, file, cb) {
		  	
		    cb(null, folder)
		  },
		  filename: function (req, file, cb) {
		    cb(null, filename)
		  }
		})
		 
	//var upload = multer({ dest: ('hidden/images/slip/' + req.body.classId) }).single('file')
	var upload = multer({ storage:storage }).single('file')
	console.log(upload)
	upload(req,res,function(err) {
        if(err) {
            return handleError(err, res);
        }
        console.log("done upload---")
        res.json({"status":"success", file:(folder + filename)});
    });
	
})


/*router.post('/update', function(req, res, next){
	Payment.findByIdAndUpdate(req.body.payment_id, {$set:{
		amount: req.body.amount,
		classes : req.body.classes,
		mark:req.body.mark
	}}, function(err){

	})
})*/

router.post('/move', function(req, res, next) {
	Payment.movePayment(req.body.payment_id, function (result){
		res.json(result)
	})
})

router.post('/confirm', function(req, res, next ){
	if(req.body.is_update)
	{
		Payment.findByIdAndUpdate(req.body.payment_id, {$set:{
			amount: req.body.amount,
			classes : req.body.classes,
			mark:req.body.mark
		}}, function(err){
			console.log('do update case')
			Payment.confirmPayment(req.body.payment_id, function(result){
				console.log(result)
				if(result.status == "success")
				{

					Mailer.sendMailByTemplate({
						to : result.user.email,
						subject : "Class registration completed" ,
						firstname : result.user.firstname,
					},"mail_templates/payment-confirm.html",  function(){
						console.log('done email')
					})
				}
				res.json(result);
			})
		})
	}else
		Payment.confirmPayment(req.body.payment_id, function(result){
			res.json(result);
		})



})

router.post('/deny', function(req, res, next ){
	Payment.removePayment(req.body.payment_id, function(result){
		res.json(result);
	})



})

module.exports = router;
