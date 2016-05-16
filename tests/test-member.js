var assert = require('assert');
const crypto = require('crypto');
Models = require('../models/Schema');

describe('Member', function() {

	//remove all user before start testing
	
	

	describe("Online Registration", function(){
		var new_member = {
				firstname:"Sompop",
				lastname:"K",
				nickname:"Pop",
				profile:"http://placehold.it/100x100",
				email: "sompop@pp.com",
				gender: 1,
				phone: "66824523991",
				password: "pptx"
		}

		var current_member_id;


		it('should be able to add member in members with register() with is_active = false', function (done){
			//check current member's count and compare it when add member
			var default_member_count = 0;
			Models.User.find({}, function(err, members){
				default_member_count = members.length;
				Models.User.register(new_member, function (member){
					current_member_id = member._id;
					Models.User.find({}, function(err, members){

						assert.equal(members.length, default_member_count + 1);
						done();
					});
				})
			})

		})
		it('should be able to get confirmation code after member register()', function (done){
			Models.User.findOne({_id:current_member_id}, function (err, user){

				assert.equal(user.firstname, new_member.firstname);
				assert.equal(user.is_active, false);
				var code = user.getCode();
				const secret = 'thehop';
				const hash = crypto.createHmac('sha256', secret)
				                   .update(user._id + user.email)
				                   .digest('hex');
				assert.equal(code, hash);
				console.log(code);
				done();

			})

		})

		it('should be able change is_active to 1 user user.validateCode(code, callback)', function (done){
			Models.User.findOne({_id:current_member_id}, function (err, user){
				assert.equal(user.firstname, new_member.firstname);
				assert.equal(user.is_active, false);
				var code = user.getCode();
				user.validateCode(code, function (user){
					assert.equal(user.is_active, true);
					Models.User.findOne({_id:current_member_id}, function (err, user2){
						assert.equal(user2.getCode(), null);
						assert.equal(user2.is_active, true);
						done();

					});
				});

			});
		})




	})


});
  