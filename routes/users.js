var express = require('express');
var router = express.Router();
var Models = require('../models/Schema');
var User = Models.User
var Mailer = require('../libs/mailer')
var multer  =   require('multer');

function handleError(err)
{
	console.log(err)

}

router.get('/:id(\\d+)/token', function(req,res, next){
	User.getToken(req.params.id, req.query.password, function(result){

		res.json(result);
	})
})

router.get('/:id(\\d+)/auth', function(req,res,next){
	User.checkToken(req.params.id, req.query.token, function(result){
		res.json(result);
	})
})

router.get('/login', function(req,res,next){
	var email = req.query.email.toLowerCase();
	User.find({email:email}, function(err, users){
		if(err || users[0] == null || users[0].is_active == false)
		{
			res.json({"status":"error", message:"Please check you email or password"})
		}else 
		{
			
			User.getToken(users[0]._id, req.query.password, function(result){
				var _result = result;
				_result.user  = users[0];
				res.json(_result);
			})
		}
	})
	
})

router.get('/', function(req, res, next) {
  //console.log(User.find())
  User.find(function(err, docs){
  	if (err) return handleError(err);

  	res.json(docs);	
  })
  
});

router.post('/', function(req, res, next) {
	console.log(req.body)	
	var items = req.body;
	items.email = items.email.toLowerCase();
	User.create(items, function(err, doc){
		if (err) return handleError(err);
		res.json(doc)
	})

});

router.get('/:id(\\d+)/', function(req, res, next){


	if(typeof req.query.fields == "string" && req.query.fields == "attendClasses") 
	{
		User.findById(req.params.id).populate('levels.skill').populate('attendClasses.class').exec(function(err, doc){
			if (err) return handleError(err);
			

			res.json(doc)	
		})
	}else
		User.findById(req.params.id).populate('levels.skill').exec(function(err, doc){
			if (err) return handleError(err);
			

			res.json(doc)	
		})
})

router.post('/:id(\\d+)/', function(req, res, next){
	User.findByIdAndUpdate(req.params.id, req.body, function(err, doc){
		if (err) return handleError(err);
		res.json(doc)		
	})
});

router.delete('/:id(\\d+)/', function(req, res, next){
	User.findByIdAndRemove(req.params.id, function(err){
		if (err) return handleError(err);
		res.json({"status":"complete"})
	})

});

router.post('/upload', function(req,res, next){
	console.log('uploading---')
	
	var storage = multer.diskStorage({
		  destination: function (req, file, cb) {
		  	
		    cb(null, ('hidden/images/profile/') )
		  },
		  filename: function (req, file, cb) {
		    cb(null, req.body.userId)
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
        res.json({"status":"success"});
    });
})

router.post('/register', function(req, res, next) {
		Models.User.register(req.body, function (member){
			if(typeof(member) == 'undefined')
			{	
				res.json({status:"error", "message":"Something wrong email is used? maybe?"})	
				return false;	
			}
			var code = member.getCode();
			Mailer.sendMailByTemplate({
				to : member.email,
				subject : "Welcome to The Hop",
				firstname : member.firstname,
				link : ("http://128.199.231.66:3000/#/validate/" + member._id + "/" + code + "/"),
				code : code


			},"mail_templates/registration.html",  function(){
				console.log('done email')
			})
			res.json({member:member, code:member.getCode()})		
		})
			
})

router.post('/validate', function(req, res, next) {
	User.findById(req.body.id, function(err, user){
		if (err) return handleError(err);
		if(user == null)
		{
			res.json({status:"error", message:"Cant find user"})
		}else
			user.validateCode(req.body.code, function (user){
				if(user!=null)
				{
					Mailer.sendMailByTemplate({
						to : user.email,
						subject : "Your Account Details",
						firstname : user.firstname,
						email : user.email,
						password : user.password,
						


					},"mail_templates/registration-complete.html",  function(){
						console.log('done email')
					})
				}
				res.json(user)

			})
	})
})


router.get('/:id(\\d+)/code/', function(req, res, next) {
	User.findById(req.params.id, function(err, user){
		if (err) return handleError(err);
		res.json({user:user, code:user.getCode()})
	})
})

router.get('/:id(\\d+)/waiting_payment/', function(req, res, next) {
	User.getPaymentList(req.params.id, function(list){
		res.json(list);
	})
})

module.exports = router;
