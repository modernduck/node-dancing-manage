Models = require('../models/Schema');

var users = [
	{firstname:"sompop", lastname:"kulapalanont", email:"sompop@picnii.me", password:"1234", nickname:"pop", gender:1, permissions:{teacher:true, admin:true, payment:true}},
	{firstname:"ju", lastname:"kulapalanont", email:"ju@gmail.com", password:"1234", nickname:"juju", gender:0, permissions:{teacher:true}},
	{firstname:"oaty", lastname:"oat", email:"oat@gmail.com", password:"1234", nickname:"Oaty", gender:1, permissions:{teacher:true}},
	{firstname:"sulaiman", lastname:"sawaleh", email:"su@gmail.com", password:"1234", nickname:"Su", gender:1, permissions:{teacher:true, admin:true}},
	{firstname:"pang", lastname:"go", email:"pango@gmail.com", password:"1234", nickname:"Pang", gender:0, permissions:{ admin:true, payment:true}},

]

var counter = 0;
Models.Payment.remove({}, function(){
	Models.Class.remove({}, function(){
Models.Skill.remove({}, function(){
	Models.User.remove({}, function(){
		console.log('reset');
		var skill = Models.Skill({name:"Lindy Hop", code:"LH"});
		skill.save(function(err){
			var skill = Models.Skill({name:"Jazz Step", code:"JA"});
			skill.save(function(err){
				var skill = Models.Skill({name:"Chalreston", code:"CH"});
				skill.save(function(err){
					var skill = Models.Skill({name:"Balboa", code:"BA"});
					skill.save(function(err){
						var skill = Models.Skill({name:"Tap Dance", code:"TA"});
						skill.save(function(err){
							var skill = Models.Skill({name:"Blues", code:"BL"});
							skill.save(function(err){
								console.log('craete Skill set');

								users.forEach(function(user){
									Models.User.register(user, function(u){
										Models.User.findById(u, function(err, _u){
											_u.is_active = true;
											_u.permissions = {admin:true, teacher:true, payment:true}
											_u.save(function(){
												counter++;
												console.log('create users')
												if(counter >= users.length)
												{
													console.log("done--")
													process.exit();
												}
											})
										})
									})
								})
							});
							//process.exit();
							
						});
						
					});
					
				});;
				
			});
			
		});


		//process.exit();
	});
});


})

})
