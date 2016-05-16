var express = require('express');
var router = express.Router();
var Models = require('../models/Schema');
var Mailer = require('../libs/mailer')
var Class = Models.Class
var User = Models.User;
var Skill = Models.Skill;
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

  if(typeof req.query.fields != 'undefined' &&  req.query.fields[0] == 'waiting_list')
  {
  	Class.find().populate('waiting_list.member').exec(function(err, docs){
  		if (err) return handleError(err, res);
	  	res.json(docs);	
  	})
  }else
	  Class.find(function(err, docs){
	  	if (err) return handleError(err, res);
	  	res.json(docs);	
	  })
  
});

router.post('/', function(req, res, next) {
	console.log(req.body)	
	Class.create(req.body, function(err, doc){
		if (err) return handleError(err, res);
		res.json(doc)
	})

});

router.get('/skills', function(req, res, next){
	Skill.find(function(err, doc){

		if (err) return handleError(err, res);
		res.json(doc);
	});
});

router.post('/skills' , function(req, res, next){
	console.log('yo')
	Skill.findByIdAndUpdate(req.body._id, req.body, function(err, doc){
		if (err) return handleError(err, res);
		res.json(doc)		
	})
});

router.get('/:id(\\d+)/', function(req, res, next){
	Class.findById(req.params.id).populate('skill').exec(function(err, doc){
		if (err) return handleError(err, res);
		res.json(doc)	
	});
})


router.get('/:id(\\d+)/members', function(req, res, next){
	Class.findById(req.params.id).populate('members.member').exec( function(err, doc){
		if (err) return handleError(err, res);
		if(doc == null)
		{
			return false;
			res.json({status:"error", message:"not found member"})
		}
		var members = [];
		doc.members.forEach(function(item){
			var _item = {}
			var arr = ["member", "is_lead", "is_paid", "_id", "is_join", "check_in"]
			arr.forEach(function(k){
				_item[k] = item[k]	
			})
			/*for(var k in item)
				_item[k] = item[k]*/
			_item.class_id = req.params.id;
			//members.push({class_id:req.params.id, name:'sompop'})
			members.push(_item)
			//console.log(_item)
		})
		console.log('yo---')
		//console.log(members)
		res.json(members)	
	})
})

router.post('/:id(\\d+)/', function(req, res, next){
	Class.findByIdAndUpdate(req.params.id, req.body, function(err, doc){
		if (err) return handleError(err, res);
		res.json(doc)		
	})
});

router.delete('/:id(\\d+)/', function(req, res, next){
	Class.findByIdAndRemove(req.params.id, function(err){
		if (err) return handleError(err, res);
		res.json({"status":"complete"})
	})

});

router.post("/:id(\\d+)/approve", function(req, res, next){
	Class.findById(req.params.id, function(err, doc){ 
		for(var i =0; i < doc.members.length;i++)
		{
			var result = req.body.members.filter(function(m){
				m_id = m._id
				console.log("- " + m_id)
				return (m_id == doc.members[i].member)
			})
			if(result.length > 0)			
			{
				doc.members[i].is_join = true;
				doc.members[i].is_active = true;
			}
		}
		
		doc.save(function(err){
			if (err) return handleError(err, res);//if not found wrong					
			res.json({status:"success", class:doc})
		});

	});

});

router.post("/:id(\\d+)/unapprove", function(req, res, next){
	Class.findById(req.params.id, function(err, doc){ 

		for(var i =0; i < doc.members.length;i++)
		{
			var result = req.body.members.filter(function(m){
				m_id = m._id
				console.log("- " + m_id)
				return (m_id == doc.members[i].member)
			})
			if(result.length > 0)			
				doc.members.splice(i, 1)
		}

		
		doc.save(function(err){
			if (err) return handleError(err, res);//if not found wrong					
			res.json({status:"success", class:doc})
		});

	});

});



router.post('/upload', function(req, res, next){
	console.log('uploading---')
	
	var storage = multer.diskStorage({
		  destination: function (req, file, cb) {
		  	
		    cb(null, ('hidden/images/slip/' +req.body.classId) )
		  },
		  filename: function (req, file, cb) {
		    cb(null, req.body.email)
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
	/*var new_dir = appRoot + "/../hidden/images/slip/" + req.body.classId
	
	mkdirp(new_dir, function(err) { 
		if (err) return handleError(err, res);
		upload(req,res,function(err) {
	        if(err) {
	            return res.json({"status":"error"});
	        }
	        res.json({"status":"success"});
	    });
	});*/
})

function doCheckin(value, req, res)
{
	var members = req.body.members;
	var d = new Date();
	var key = d.getUTCFullYear() + "-" + twoDigits(1 + d.getUTCMonth()) + "-" + twoDigits(d.getUTCDate());
	Class.findById(req.params.id, function(err, class_item){
		if (err) return handleError(err, res);//if not found wrong
		var test_check_in = class_item.check_in.filter(function(_key){
			if(_key == key)
				return true;
			else
				return false;
		})
		if(test_check_in.length == 0)
		{
			//dont have key in check_in
			class_item.check_in.push(key);
		}
		members.forEach(function(member){
		//for(var index  = 0; index < members.length; index++){
			
			var member_id = member.member._id;//for new fix
			//var member_id = members[index].member._id;//for new fix
			for(var i =0; i < class_item.members.length; i++)
			{
				console.log(class_item.members[i].member + " vs " + member_id)
				if(class_item.members[i].member == member_id)
				{
					console.log('found at '  + i + " = " + member_id + " / value =  " + value)
					if(typeof class_item.members[i].check_in != "object")
						class_item.members[i].check_in = {};

					class_item.members[i].check_in[key] = value;
					
					break;
				}
			}
		//}		
		})

		Class.findByIdAndUpdate(class_item._id, { $set:{ members:class_item.members }}, function(err, result){
			if(err)
				res.json({"status":"error", err:err})
			else
				res.json({"status":"success", class:class_item, "key":key})
		})

		/*class_item.save(function(err, _class_item){
			if(err)
				res.json({"status":"error", err:err})
			else
				res.json({"status":"success", class:_class_item, "key":key})
		})*/
	})
		//save class

	
}


/*function doCheckin(value, req, res)
{
	var d = new Date();
	var key = d.getUTCFullYear() + "-" + twoDigits(1 + d.getUTCMonth()) + "-" + twoDigits(d.getUTCDate())
	console.log('key - ' + key)
	Class.findById(req.params.id, function(err, class_item){ 

		if (err) return handleError(err, res);//if not found wrong
		var members = req.body.members;
		members.forEach(function(member){
			
			
			var index = -1;
			for(var i =0; i < class_item.members.length;i++)
				if(class_item.members[i].member == member._id)
				{
					index = i
					if(typeof class_item.members[index].check_in == 'undefined')
						class_item.members[index].check_in = {}
					class_item.members[index].check_in[key] = value // actual check in vlaue
					class_item.members[index].is_paid = member.is_paid
				}
			console.log('index - ' + index)
			console.log(class_item.members[index].check_in)
			Class.findByIdAndUpdate(req.params.id, {$set:{ members: class_item.members }}, function (err, item){
				console.log('gonna update ' + member._id)	
				console.log(item.members[index].check_in)
			})
			
			
		})
		res.json({"status":"success"})
		//User.findById(req.body._id, )
	});
}*/

router.post('/:id(\\d+)/walkin', function(req, res, next){
	Class.findById(req.params.id, function(err, class_item){
		class_item.add_member_walkin(req.body, function(result){
			res.json(result)

		})	
	})

	
})

router.post('/:id(\\d+)/checkin', function(req, res, next){
		doCheckin(1, req, res)


});

router.post('/:id(\\d+)/uncheckin', function(req, res, next){
		doCheckin(0, req, res)


});

router.post('/:id(\\d+)/cancel_registration', function(req, res, next){
	var member_id = req.body.member_id;
	Class.findById(req.params.id, function(err, _class) {
		User.findById(member_id, function(err, member){
			_class.cancel_registration(member);	
			res.json({status:"success",  message:"cancel"});
		})
		

	});

});

router.post('/:id(\\d+)/approve_waiting', function(req, res, next){
	var member_id = req.body.member_id;
	Class.findById(req.params.id, function(err, _class) {
		User.findById(member_id, function(err, member){
			_class.approve_waiting_list(member, function (result) {
				if(result.status =="success")
				{
					
					Mailer.sendMailByTemplate({
						to : member.email,
						subject : "Payment Details for " + _class.name,
						firstname : member.firstname,
						name : _class.name,
						amount : _class.price,
						link : "http://128.199.231.66:3000/#/members/" + member._id +"/payment"

					},"mail_templates/payment-waiting.html",  function(){
						console.log('done email')
					})
				
				}
					res.json(result)
			})	
		})
		

	});
});



router.post('/:id(\\d+)/remove_waiting', function(req, res, next){
	var member_id = req.body.member_id;
	Class.findById(req.params.id, function(err, _class) {
		User.findById(member_id, function(err, member){
			_class.remove_waiting_list(member, function (result) {
				
					res.json(result)
			})	
		})
		

	});
});

router.post('/:id(\\d+)/approve_payment', function(req, res, next){
	var member_id = req.body.member_id;
	Class.findById(req.params.id, function(err, _class) {
		User.findById(member_id, function(err, member){
			_class.approve_waiting_payment(member, function (result) {
				
					res.json(result)
			})	
		})
		

	});
});

router.post('/:id(\\d+)/remove_payment', function(req, res, next){
	var member_id = req.body.member_id;
	Class.findById(req.params.id, function(err, _class) {
		User.findById(member_id, function(err, member){
			_class.remove_waiting_payment(member, function (result) {
			
					res.json(result)
			})	
		})
		

	});
});


router.get('/:id(\\d+)/waiting_list', function(req, res, next){
	var result = Class.getWaitingList(req.params.id, function(result){
		res.json(result.waiting_list);
	});



});

router.get('/:id(\\d+)/waiting_payment', function(req, res, next){
	var result = Class.getWaitingPayment(req.params.id, function(result){
		res.json(result.waiting_payment);
	});



});

// not done yet
router.post('/:id(\\d+)/signup', function(req, res, next){

	User.findOne({email:req.body.email.toLowerCase()}, function(err, user){
		if (err) return handleError(err, res);//if not found wrong
		if(user == null)
		{
			res.json({"status":"failed", "message":"User not found in the system please sign up"})
			return false;	
		}
		if(!User.verifyPassword(req.body, user))
		{
			res.json({"status":"failed", "message":"Wrong username/password"})
			return false;
		}
		Class.findById(req.params.id, function(err, _class){ 
			_class.register(user, req.body.is_lead, req.body.mark, function (result){
				if(result.status == "success" && result.code == "01")
				{	
					Mailer.sendMailByTemplate({
						to : user.email,
						subject : "Payment Details for " + _class.name,
						firstname : user.firstname,
						name : _class.name,
						amount : _class.price,
						link : "http://128.199.231.66:3000/#/members/" + user._id +"/payment"

					},"mail_templates/payment-waiting.html",  function(){
						console.log('done email')
					})
				}
					res.json(result)
				
			})

		});

	})

	/*console.log(req.files)
	if(req.body.is_signup)
	{
		User.create(req.body, function(err, user){
			if (err) return handleError(err, res);
			Class.findById(req.params.id, function(err, doc){ 

				var data = req.body;
				data.member = user._id
				data.is_paid = false;
				
				console.log(data)
				doc.members.push(data);
				doc.save(function(err){
					if (err) return handleError(err, res);//if not found wrong					
					res.json({status:"success", class:doc})
				});
			});
		})


	}else
		User.findOne({email:req.body.email}, function(err, user){
			if (err) return handleError(err, res);//if not found wrong
			if(user == null)
			{
				res.json({"status":"failed", "message":"User not found in the system please sign up"})
				return false;	
			}
			if(!User.verifyPassword(req.body, user))
			{
				res.json({"status":"failed", "message":"Wrong username/password"})
				return false;
			}
			Class.findById(req.params.id, function(err, doc){ 
				var is_signup = false;
				if (err) return handleError(err, res);
				
				for(var i=0; i < doc.members.length;i++)
					if(doc.members[i].member == user._id)
					{
						
						is_signup = true;
						break;
					}
				if(!is_signup)
				{
					var data = req.body;

					data.member = user._id
					data.is_paid = false;
					if(doc.auto_approve)
						data.is_join = true;
					console.log(data)
					doc.members.push(data);
					doc.save(function(err){
						if (err) return handleError(err, res);//if not found wrong					
						res.json({status:"success", class:doc})
					});
					
				}else
					res.json({"status":"failed", "message":"You are already sign up"})


			});

	})*/


	

	/*Class.findById(req.params.id, function(err, doc){
		if (err) return handleError(err, res);

		//res.json(doc)	
	})*/
});


module.exports = router;
