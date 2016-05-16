var assert = require('assert');

Models = require('../models/Schema');

describe('Class', function() {
  describe('CRUD with hard code', function () {
  	//assume that db is empty
  	var price_check = 5673;
  	var price_check_2 = 7362;
    it('should be able to create with save() and find it in find()', function (done) {   	
    	var test = new Models.Class(
		{
			name :"Beginner Noob",
			start_date : (new Date()),
			end_date : (new Date()),
			level : 1,
			price : price_check,
			description :"This is awesome",
			members:[],
			create_time : (new Date())
		});
		test.save(function (err, item) {
		  if (err) return handleError(err);
		  	Models.Class.findById({_id:item._id},function (err, _item) {
			  if (err) return console.error(err);
			   assert.equal(price_check,_item.price);

			  done();
			})
	  	
		})
    });
    it('should be able to find and update content', function(done){
    	Models.Class.find({price:price_check}, function(err, classes){
    		assert.equal(classes.length, 1);
    		classes[0].price = price_check_2;
    		classes[0].save(function (err, item){
    			  if (err) return handleError(err);
				  	Models.Class.findById({_id:item._id},function (err, _item) {
					  if (err) return console.error(err);
					   assert.equal(price_check_2, _item.price);
					  done();
					})
    		})
    	})

    })
     it('should be able to find and remove content', function(done){
     	Models.Class.find({price:price_check_2}, function(err, classes){
     		assert.equal(classes.length, 1);
     		Models.Class.remove({price:price_check_2}, function (err) {
			  if (err) return handleError(err);
			  
			  // removed!
			  Models.Class.find({price:price_check_2}, function(err, _classes){
			  	if (err) return handleError(err);
			  	assert.equal(_classes.length, 0);
			  	done();
			  });
			})
     	});
     });


  });


	

});
describe('Skill', function() {
	var skill_name = "Lindy Hop"
	var new_skill_name = "Chalreston"
	var update_skill_name ="Lindy Lind Hop";
	it('should be able to create new skill', function (done){
		
		var skill = new Models.Skill({
			name : skill_name
		});
		skill.save(function(err, item){
			if(err) {
				console.log(err);
				return false;	
			} 
			assert.equal(item.name, skill_name);
			done();
		})
	})

	it('should be able to find All skill', function (done){
		Models.Skill.find({}, function(err, skills) {

			if(err) {
				console.log(err);
				return false;	
			} 
			skills.forEach(function(f){
				console.log(f._id);
			})
			
			assert(skills.length, 1);
			var new_skill = new Models.Skill({
				name : new_skill_name
			})
			new_skill.save(function(err, item){
				if(err) { console.log(err);return false;}
				Models.Skill.find({}, function(err, skills_after) {
					assert.equal(skills_after.length, 2);
					done();
				});
			})
		})
	})

	it('should be able to find and update skill name', function (done){
		Models.Skill.find({name:skill_name}, function(err, skills){
			assert.equal(skills[0].name , skill_name);
			skills[0].name = update_skill_name
			skills[0].save(function(err, item){
				assert.equal(item.name, update_skill_name);
				done();
			})
		})
	})

	it('should be able to remove skill', function (done){
		Models.Skill.remove({name:update_skill_name}, function(err){
			//should be remove
			Models.Skill.find({}, function(err, items){
				assert.equal(items.length, 1);
				Models.Skill.remove({name:new_skill_name}, function(err){
					Models.Skill.find({}, function(err, items){
						assert.equal(items.length, 0);
						done();
					});
				});
			})
		})
	})


});



































