var assert = require('assert');
const crypto = require('crypto');
Models = require('../models/Schema');

describe('Class', function() {


	/*describe("Skill Add/Remove Process", function(){
		var skill_names = ["Lindy Hop", "Chalereston", "Boogie woogie"];
		var members = [
			{
				firstname:"Sompop",
				lastname:"K",
				nickname:"Pop",
				profile:"http://placehold.it/100x100",
				email: "sompop@pp.com",
				gender: 1,
				phone: "66824523991",
				password: "pptx"
			},
			{
				firstname:"Oat",
				lastname:"K",
				nickname:"Oat",
				profile:"http://placehold.it/100x100",
				email: "oat@pp.com",
				gender: 1,
				phone: "66824523991",
				password: "pptx"
			},
			{
				firstname:"Ju",
				lastname:"K",
				nickname:"Pop",
				profile:"http://placehold.it/100x100",
				email: "ju@pp.com",
				gender: 1,
				phone: "66824523991",
				password: "pptx"
			},

		];

		beforeEach( function (done){
			Models.User.remove({}, function(){
				//remove all users
				Models.User.find({}, function(err, users) {
					console.log('count---')
					console.log(users.length)
					assert.equal(users.length, 0);
					
					var counter = 0;
					//then register as define
					members.forEach(function(member){
						
						
						Models.User.register (member,function(member){
							//register and add code
							
							member.validateCode(member.getCode(), function (user) {
								console.log('register - ' + counter)
								counter++;
								if(counter == members.length)
									done();	
							});

							
						})
					});
				})
				
			});
				
		});

		it('should be able to add skill to all of member when add skills', function (done){
			Models.Skill.find({}, function(err, skills){
				assert.equal(skills.length, 0);
				var counter = 0;
				var doAfterCreateSkill = function(_skills)
				{
					Models.User.find({}, function (err, users){
						users.forEach(function (user){

							_skills.forEach(function (_skill){
								console.log('---check---')
								console.log(user)
								console.log(user.levels[0])
								console.log({skill:_skill._id, level:0})
								assert.include(user.levels, {skill:_skill._id, level:0}, "contain level")	;
							})

						})
					})

				}
				skill_names.forEach(function(name){
					var skill = new Models.Skill({name:name})
					skill.save(function(err, doc){
						counter++;
						if(counter == skill_names.length)
						{
							Models.Skill.find({}, function(err, _skill){
								doAfterCreateSkill(_skill);	
							})
							
						}
							
					})
				})
			})
			
		})


	})*/

	describe("Class Registration Process(Beginner Lv)", function(){
		var start_date = new Date();
		var end_date = new Date("2016-12-12");
		var test_class = { name:"Test Lindy", level:1, pre_approve:false, start_time:"10.00", end_time:"11.00", start_date:start_date, end_date:end_date};
		var skill;

		it('should be able to create a class with beginner level', function (done){
			Models.Skill.find({}, function(err, skills){
				skill = skills[0]
				test_class.skill = skill._id;
				var new_class = Models.Class.create(test_class, function(err2, saved_class){
					if(err2)
						assert.equal(1,0);

					done();
				})



				
			})

			
		})

		it('should be to add member to waitinglist if his level not match', function(done){




			done();
		})

	})

});