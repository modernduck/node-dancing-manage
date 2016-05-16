var mongoose = require('mongoose');
autoIncrement = require('mongoose-auto-increment');
const db_name = 'mongodb://localhost/swingdevdb';
console.log('going to connect' + db_name);
connection = mongoose.connect(db_name);
//connection = mongoose.connect('mongodb://localhost/swingdb');
//connection = mongoose.connect('mongodb://localhost/swingdevdb');

const session_limit = 86400000;//24x60x60x1000
//const session_limit = 600000;
const crypto = require("crypto");
const secret =  "thehop";

var db = mongoose.connection;
autoIncrement.initialize(connection);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('connected')
});


function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

var skillSchema = mongoose.Schema({
	name: {
		index: { unique: true },
		type: String
	},
	code :String,
	
});
//paymentSttus 1 = user upload for notify, 2 = Confirm, 3 = Wrong
var paymentSchema = mongoose.Schema({
	user : {type:Number, ref:"User"},
	amount : Number,
	dateTime : Date,
	create_time: Date,
	filePath : String, 
	classes : [{class:{type:Number, ref:"Class"}, amount:Number }],
	mark:String,
	status : Number,
})

var userScehema = mongoose.Schema({
	
	firstname: String,
	lastname: String,
	nickname:String,
	permissions:{
		payment:Boolean,
		teacher:Boolean,
		admin:Boolean,
	},
	profile:String,
	email: {
		index: { unique: true },
		type: String
	},
	gender:Number,
	phone: String,
	password: String,
	attrs:[{ key:String, value:String}],
	levels: [{ skill:{ type:Number, ref:"Skill"}, level:Number }],	
	attendClasses:[{class:{ type:Number, ref:"Class" }, status:Number}],
	waiting_payment : [{class:{type:Number, ref:"Class"}}],
	mark:String,
	create_time : Date,
	is_active:Boolean
})



var classSchema = mongoose.Schema({
	
	name:String,
	start_date:Date,
	end_date:Date,
	code:String,
	level:Number,
	price:Number,
	instructor:String,
	days:[],
	skill:{type:Number, ref:"Skill"},	
	start_time:String,
	end_time:String,
	description:String,
	pre_approve:Boolean,
	accept_only_lead:Boolean,
	accept_only_follow:Boolean,
	check_in:[],
	is_active:Boolean,
	waiting_list:[{ member:{type:Number, ref:"User"} , is_lead:Boolean, mark:String}],
	waiting_payment:[{member:{type:Number, ref:"User"}, status:Number, is_lead:Boolean, mark:String }],
	members:[{member:{ type:Number, ref:"User" }, is_lead:Boolean, mark:String, check_in:{}}],
	helpers:[{member:{ type:Number, ref:"User" }, is_lead:Boolean, mark:String, is_join:Boolean, check_in:{}}],
	create_time : Date
})




userScehema.methods.getAttendClasses = function()
{
	var users = [];
	var Class = mongoose.model('Class', classSchema);
	return Class.find({member_id:this._id});
	
}

userScehema.methods.getCode = function()
{
	if(this.is_active)
		return null;

	return crypto.createHmac('sha256', secret)
       .update(this._id + this.email)
       .digest('hex');
}

userScehema.methods.encryptToken = function(_secret)
{
	var token = crypto.createHmac('sha256', _secret).update(this._id + this.email + this.password).digest('hex');
	return token;
}

userScehema.methods.getToken = function()
{
	var d = new Date();
	var token = this.encryptToken((d.getDate()+":"+d.getHours()+d.getSeconds()))
	return	token + ":" + d.getTime();
}



userScehema.methods.decryptToken = function(token)
{
	var arr = token.split(":");
	var _token = arr[0];
	var _time = arr[1];
	var d = new Date(Number(_time));
	console.log('-----time-----')
	console.log(d)

	return {
		token:_token,
		time:_time,
		secret:(d.getDate()+":"+d.getHours()+d.getSeconds())
	}
}

userScehema.methods.validateCode = function(code, callback)
{
	if(code === this.getCode())
	{
		this.is_active =true;
		this.save(function(err, user){
			callback(user);
			return true;
		})
	}else
	{
		callback(null);
		return false;
	}
}

classSchema.methods.updateMember = function(member)
{
	//include isLead, isPaid, mark for that classSchema

}

classSchema.methods.getCode = function()
{

}

classSchema.methods.getMembers = function()
{

	;
}

classSchema.methods.getWaitingList = function()
{

}



//waiting for test
classSchema.methods.register = function(member, is_lead, mark, callback)
{
	if(!member.is_active)
	{
		callback({status:"error", message:"member is not active"});
		return false;
	}
	//check if member is signup
	var is_signup = false;
	for(var i=0; i < this.members.length;i++)
		if(this.members[i].member == member._id)
		{
			
			is_signup = true;
			callback({status:"error", message:"member already sign up"});
			return false;
			break;
		}

	if(this.accept_only_lead && !is_lead)
	{
		callback({status:"error", message:"member must be lead to register"});
		return false;
	}else if(this.accept_only_follow && is_lead)
	{
		callback({status:"error", message:"member must be follow to register"});
		return false;
	}

	if ( this.pre_approve )
	{
		//waiting_list
		//check if they alrady in waiting list or not
		for(var i=0; i < this.waiting_list.length;i++)
			if(this.waiting_list[i].member == member._id)
			{
				callback({status:"error", message:"member already in waiting list up"});
				return false;	
			} 
		this.waiting_list.push({member:member._id, is_lead:is_lead, mark:mark});
		this.save( function (err) {
			if(err)
				callback( {status:"error", error:err});
			callback(  {status:"success", code:"02", message:"sign member in waiting_list"}); 
			return true;
		})

		
	}else
	{
		//waiting_payment
		for(var i=0; i < this.waiting_payment.length;i++)
			if(this.waiting_payment[i].member == member._id)
			{
				callback({status:"error", message:"member already in waiting payment"});
				return false;
			}  
		//check skill if equal
		var class_skill = this.skill
		console.log(member.levels)
		var member_skill = member.levels.filter(function(level){
			console.log('level ' + level.skill + ' vs this ' + class_skill)
			if(level.skill == class_skill)
				return true;
		})[0]
		
		console.log(member_skill)
		if(this.level - 1 > member_skill.level)
		{
			console.log('this course level is '  + this.level + " and member level is " + member_skill.level)
			for(var i=0; i < this.waiting_list.length;i++)
				if(this.waiting_list[i].member == member._id)
					return  {status:"error", message:"member already in waiting list up"}; 
			this.waiting_list.push({member:member._id, is_lead:is_lead, mark:mark});
			this.save( function (err) {
				if(err)
					callback( {status:"error", error:err});
				callback(  {status:"success", code:"02", message:"sign member in waiting_list"}); 
				return true;
			})
		}else
		{
			this.waiting_payment.push( {member:member._id, is_lead:is_lead, mark:mark})
			member.waiting_payment.push( {class:this._id});
			this.save( function (err) {
				if(err)
					callback( {status:"error", error:err});
				member.save(function (err){
					if(err)
						callback( {status:"error", error:err});
					callback(  {status:"success", code:"01", message:"sign member in waiting payment"} ); 	
					return true;
				})
				
			})

		}


		
	}
}

classSchema.methods.cancel_registration = function(member)
{
	for(var i=0; i < this.waiting_list.length;i++)
			if(this.waiting_list[i].member == member._id)
			{
				this.waiting_list(i, 1)
				this.save( function (err) {

				});
			}
	for(var i=0; i < this.waiting_payment.length;i++)
			if(this.waiting_payment[i].member == member._id)
			{
				this.waiting_payment(i, 1)
				this.save( function (err) {

				});
			}

}

classSchema.methods.approve_waiting_list = function(member,  callback)
{
	//move member from waiting list to waiting payment
	var isFound = false
	for(var i=0; i < this.waiting_list.length;i++)
			if(this.waiting_list[i].member == member._id)
			{
				isFound = true;
				//found it move to waiting payment
				var info = this.waiting_list[i];
				var data = this.waiting_list.splice(i,1)
				this.waiting_payment.push({member:member._id, status:0, is_lead:info.is_lead, info:data.mark})
				member.waiting_payment.push( {class:this._id});
				this.save( function (err) {
					if(err)
					{
						callback( {status:"error", error:err} );
						return false;
					}
					member.save(function (err){
						if(err)
							callback( {status:"error", error:err} );
						callback(  {status:"success", message:"remove member in waiting_list and move to waiting payment"} ); 
						return true;
					})
					
				})
			}
	if(!isFound)
	{
		callback( {status:"error", message:"user not found", member:member});
		return false;
	}
}




classSchema.methods.remove_waiting_list = function(member, callback)
{
	var isFound = false
	//move member out from waiting list
	for(var i=0; i < this.waiting_list.length;i++)
			if(this.waiting_list[i].member == member._id)
			{
				isFound = true;
				//found it move to waiting payment
				this.waiting_list.splice(i,1)
				this.save( function (err) {
				if(err)
					callback( {status:"error", error:err} );
				callback(  {status:"success", message:"remove member in waiting_list"} ); 
				return true;
			})
			}

	if(!isFound)
	{
		callback( {status:"error", message:"user not found", member:member});
		return false;
	}
}

classSchema.methods.approve_waiting_payment = function(member, callback)
{
	var isFound = false;
	//move member out from waiting payment to membmer
	for(var i=0; i < this.waiting_payment.length;i++)
			if(this.waiting_payment[i].member == member._id)
			{
				isFound = true;
				var info = this.waiting_payment[i];
				var data = this.waiting_payment.splice(i,1);
				console.log(this.waiting_payment)
				for(var j =0; j < member.waiting_payment.length; j++)
				{
					if(member.waiting_payment[j].class == this._id)
					{
						member.waiting_payment.splice(j,1);
						break;
					}
				}
				this.members.push({member:member._id, is_lead:info.is_lead, mark:info.mark})
				this.save(function (err, _c) {
					if(err)
					{
							callback( {status:"error", error:err});
							return false;
					}

					member.save(function (err){
						callback(  {status:"success", message:"remove member in payment "} ); 
						return true;
					})
					return true;
				})
			}
	if(!isFound)
	{
		callback( {status:"error", message:"user not found", member:member});
		return false;
	}
}

classSchema.methods.remove_waiting_payment = function(member, callback)
{
	var isFound = false;
	//move member out from waiting payment to membmer
	for(var i=0; i < this.waiting_payment.length;i++)
			if(this.waiting_payment[i].member == member._id)
			{
				isFound = true;
				var data = this.waiting_payment.splice(i,1);
				for(var j =0; j < member.waiting_payment.length; j++)
				{
					if(member.waiting_payment[j].class == this._id)
					{
						member.waiting_payment.splice(j,1);
						break;
					}
				}
				
				this.save(function (err) {
					if(err)
							callback( {status:"error", error:err});
					member.save(function (err){
						callback(  {status:"success", message:"remove member in payment  "} ); 
						return true;
					})
					return true;
				})
			}
	if(!isFound)
	{
		callback( {status:"error", message:"user not found", member:member});
		return false;
	}
}

classSchema.methods.add_member_walkin = function(data, callback)
{
	var member_id = data.member_id;
	var amount = data.amount;
	var is_lead = data.is_lead;
	var d = new Date();
	var check_in_key = d.getUTCFullYear() + "-" + twoDigits(1 + d.getUTCMonth()) + "-" + twoDigits(d.getUTCDate());
	var Payment = mongoose.model("Payment", paymentSchema)
	var self = this;
	mongoose.model('User', userScehema).findByIdAndUpdate(member_id , {$set:{ is_active: true }}, function(err, _member){
		if(err)
		{
			callback({status:"error", err:err})
			return false;
		}
		
		var payment = new Payment;
		//create a new payment
		payment.user = member_id;
		payment.amount = amount;
		payment.dateTime = new Date();
		payment.create_time = new Date();
		payment.filePath = "";
		payment.classes.push({class:self._id, amount:amount});
		payment.mark = "";
		payment.status = 2;

		payment.save(function(err, _payment){
			if(err)
			{
				callback({status:"error", err:err})
				return false;
			}
			//{member:{ type:Number, ref:"User" }, is_lead:Boolean, mark:String, check_in:{}}
			var check_ins = {};
			check_ins[check_in_key] = 1;
			console.log('check in data')
			console.log({member:member_id, is_lead:is_lead, mark:"", check_in:check_ins})
			self.members.push({member:member_id, is_lead:is_lead, mark:"", check_in:check_ins})
			self.check_in[check_in_key] = 1;
			self.save(function(err, _classs){
				if(err)
				{
					callback({status:"error", err:err})
					return false;
				}else
					callback({status:"success", class:_classs})
			})

		})

	})
	



}


classSchema.plugin(autoIncrement.plugin, 'Class');
userScehema.plugin(autoIncrement.plugin, 'User');
skillSchema.plugin(autoIncrement.plugin, 'Skill');
var Skill = mongoose.model('Skill', skillSchema);
var User = mongoose.model('User', userScehema);

User.register = function(member, callback)
{
	
	 var fields = ["firstname", "lastname", "email", "password", "gender", "profile", "nickname", "phone"];
	 var add_member = {};
	 fields.forEach(function (item){
	 	add_member[item] = member[item];
	 })
	 add_member.create_time = new Date();
	 add_member.is_active = false;
	 add_member.levels = [];
	 
	 Skill.find({}, function (err, skills){
	 	if(err)
	 	{
	 		console.log('err')
	 		console.log(err)
	 	}
	 	
	 	skills.forEach(function(skill){
	 		add_member.levels.push({skill:skill._id, level:0});	
	 	})
	 	

	 	var user = new User(add_member);
	 	user.save(function (err, user){
	 		console.log(user)
	 		if(err)
		 	{
		 		console.log('err use')
		 		console.log(err)
		 	}
		 	console.log(callback)
	 		callback(user);
	 	})
	 })
	 
}

User.verifyPassword = function(member, user)
{
	if(member.password == user.password)
		return true;
	else
		return false;
}
User.encryptPassword = function(password)
{
	return crypto.createHmac('sha256', secret)
                   .update(password)
                   .digest('hex');
}

User.getToken = function(id, password, callback)
{
	console.log('get token')
	console.log(id)
	User.findById(id, function(err, user){
		if(err || user==null)
		{
			callback({status:"error", message:"Cant find user by id", info:{id:id, password:password}})
		}else
		{

			if(user!=null && user.password == password)
			{
				callback({status:"success", token:user.getToken()})
			}else
			{
				callback({status:"error", message:"Wrong authentication"})
			}
		}
	})
}

User.checkToken = function(id, token, callback)
{
	console.log(id)
	User.findById(id, function(err, user){
		if(err || user==null)
		{
			callback({status:"error", message:"Cant find user by id", err:err})
		}else
		{

			var info = user.decryptToken(token);

			if(info.token == user.encryptToken(info.secret))
			{
				console.log('check Time')
				var now = new Date();
				var time = new Date(Number(info.time));
				var diff = now.getTime() - time.getTime();
				if(diff <= session_limit)
					callback({status:"success", message:"Correct Authentication", time:diff, user:user})
				else
					callback({status:"error", message:"Time Out Please get token again"})
			}else
				callback({status:"error", message:"Wrong token bro"})
		}
	})
}

User.getPaymentList = function(id, callback)
{
	User.findById(id).populate('waiting_payment.class').populate('waiting_payment.class').exec(function(err, user){
		if(err)
		{
			callback(err)
		}else if(user!=null)
			callback(user.waiting_payment);
	})
}

var Class = mongoose.model('Class', classSchema);

Class.getWaitingList = function (id, callback)
{
	console.log(id);
	//.populate('waiting_list.member')
	Class.findById(id).populate('waiting_list.member').exec(function(err, _class){
		if (err) 
		{
			console.log('error')
			callback(err);
		}
		console.log('found')
		console.log(_class)
		callback(_class);
	})
}

Class.getWaitingPayment  = function (id, callback)
{
	console.log(id);
	//.populate('waiting_list.member')
	Class.findById(id).populate('waiting_payment.member').exec(function(err, _class){
		if (err) 
		{
			console.log('error')
			callback(err);
		}
		console.log('found')
		console.log(_class)
		callback(_class);
	})
}



var Skill = mongoose.model('Skill', skillSchema);
var Payment = mongoose.model("Payment", paymentSchema)

Payment.removePayment = function(payment_id, callback)
{
	Payment.findById(payment_id, function(err, payment){
		User.findById(payment.user, function(err, user){
			//remove waiting payment in payment.classes
			//user.waiting_payment = [1,2,3,4,5]
			//payment.classes = [1,2,5]

			var waiting_payment = user.waiting_payment.filter(function(obj){
				//aow payment t pay in payment.classes out
				//obj.class = any in payment.classes is not include (return false)
				//obj = each of class in waiting_payment
				test = payment.classes.filter(function(item){
					if(item.class != obj.class)
						return false;
					//copy from waiting_payment to member of class
					Class.findById(obj.class, function(err, foundClass){
						var info;
						for(var i=0; i <foundClass.waiting_payment.length;i++)
						{
							if(foundClass.waiting_payment[i].member == user._id)
							{
								info = foundClass.waiting_payment[i]
								foundClass.waiting_payment.splice(i,1)
								break;
							}
						}
						
						foundClass.save(function(err, savedClass){
							if(err)
							{
								console.log('error ' +  savedClass._id)
							}
							console.log('savedClass ' + savedClass._id);
						})
					})	



					return true;
				})	
				if(test.length > 0)
					return false;
				else
					return true;
			})
			user.waiting_payment = waiting_payment;
			user.save(function(err, newUser){

				


				payment.status = 3;
				payment.save(function(err, newPayment){
					callback({"status":"success", message:"remove from user waiting payment and update payment status to 3 and add student to class"})
				})
			})
		})
	});
}

Payment.movePayment = function(payment_id, callback)
{
	Payment.findByIdAndUpdate(payment_id, {$set:{status:1}} , function(err, payment){



		payment.classes.forEach(function(item){
					User.findById(payment.user, function(err, user){
							if(err || user == null)
							{
								console.log('error cause of cant update user.waiting_payment')
							}else
							{
								for(var i =0; i < user.attendClasses.length;i++)
								{
									if(user.attendClasses[i].class == item.class)
									{
										user.attendClasses.splice(i,1);
										break;
									}
									//user.attendClasses.push({class:obj.class, status:1})
								}
								user.waiting_payment.push({class:item.class})
								user.save(function(err, _user){
									console.log('add user.waiting_payment')
								})
							}
						})
					//copy from waiting_payment to member of class
					Class.findById(item.class, function(err, foundClass){
						var info;
						
						for(var i=0; i <foundClass.members.length;i++)
						{
							console.log(foundClass.members[i].member + " vs " + payment.user)
							if(foundClass.members[i].member == payment.user)
							{
								info = foundClass.members[i]
								foundClass.members.splice(i,1)
								break;
							}
						}
						console.log('move back----')
						console.log(info)
					

						foundClass.waiting_payment.push({member:info.member, is_lead:info.is_lead, mark:info.mark});
						foundClass.save(function(err, savedClass){
							if(err)
							{
								console.log('error ' +  savedClass._id)
							}
							console.log('savedClass ' + savedClass._id);
						})
					})
		});	


			if(err)
				callback({"status":"error", message:"shit happen"});
			else
				callback({"status":"success", payment:payment});
		

	});	
}

Payment.confirmPayment =  function(payment_id, callback)
{
	console.log('do confirmPayment')
	Payment.findById(payment_id, function(err, payment){
		User.findById(payment.user, function(err, user){
			//remove waiting payment in payment.classes
			//user.waiting_payment = [1,2,3,4,5]
			//payment.classes = [1,2,5]
			console.log('found user')
			var waiting_payment = user.waiting_payment.filter(function(obj){
				//aow payment t pay in payment.classes out
				//obj.class = any in payment.classes is not include (return false)
				//obj = each of class in waiting_payment
				test = payment.classes.filter(function(item){
					console.log('compoare ' + item.class  + " / " + obj.class)
					if(item.class != obj.class)
						return false;
					user.attendClasses.push({class:obj.class, status:1})
					//copy from waiting_payment to member of class
					Class.findById(obj.class, function(err, foundClass){
						var info;
						for(var i=0; i <foundClass.waiting_payment.length;i++)
						{
							if(foundClass.waiting_payment[i].member == user._id)
							{
								info = foundClass.waiting_payment[i]
								foundClass.waiting_payment.splice(i,1)
								break;
							}
						}
						foundClass.members.push({member:payment.user, is_lead:info.is_lead, mark:info.mark});
						console.log('change type')
						/*Class.findByIdAndUpdate(foundClass._id, {$set:{members:member, waiting_payment:waiting_payment}}, function(err, savedClass){
							if(err)
							{
								console.log('error ');
							}
							console.log('savedClass ' + savedClass._id);
						})*/
						foundClass.save(function(err, savedClass){
							if(err)
							{
								console.log('error ');
							}
							console.log('savedClass ' + savedClass._id);
						})
					})

					return true;
				})	
				if(test.length > 0)
					return false;
				else
					return true;
			})
			user.waiting_payment = waiting_payment;

			

			user.save(function(err, newUser){

				if(err)
				{
					callback({"status":"error", message:"Error something wrong"})
					return false;
				}


				payment.status = 2;
				payment.save(function(err, newPayment){
					callback({"status":"success", user:user, message:"remove from user waiting payment and update payment status to 2 and add student to class"})
				})
			})
		})
	});
}

//---------------------------


module.exports = {
	"User" : User,
	"Class" : Class,
	"Skill" :Skill,
	"Payment" : Payment
}
