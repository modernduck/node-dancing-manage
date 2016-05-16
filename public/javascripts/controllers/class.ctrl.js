angular.module("class.ctrl", ["danceWidget", "dataProvider", "dataFilter", "ngFileUpload", "chart.js", "ui.bootstrap"])
	.controller("ClassViewCtrl",  ["$scope", "Class", "$filter", "$routeParams", "$location" ,"Upload", "$timeout" , "Auth", function ($scope, Class, $filter, $routeParams, $location, Upload, $timeout, Auth){
  $scope.class =  Class.get({id:$routeParams.id}, function(){
  $scope.class.start_date = new Date($scope.class.start_date)
      $scope.class.end_date = new Date($scope.class.end_date)
    }); 

  Auth.check(function(result){
  	if(result.status != "error")
  		$scope.member = result.user
  })


  $scope.signup = function(){
  	var register_as = $filter('isLead')($scope.member.is_lead)
  	if(confirm("Are you sure you going to register as " + register_as))
  	{
  		if(!angular.isUndefined($scope.picFile))
	      {
	        $scope.picFile.upload = Upload.upload({
	          url:"/classes/upload",
	          data:{ email:$scope.member.email, classId:$routeParams.id, file:$scope.picFile}
	        })

	         $scope.picFile.upload.then(function (response) {
	            console.log(response)
	        }, function (response) {
	            console.log(response)
	        }, function (evt) {
	          // Math.min is to fix IE which reports 200% sometimes
	            
	        });
	        

	      }
	      $scope.member.is_signup = $scope.isSignup;
	      $scope.member.classId = $routeParams.id
	      Class.signup($scope.member, function(data){
	        console.log(data)
	        if(data.status =="success")
	        {
	        	if(data.code == "01")
	          		$location.path("/classes/" + $routeParams.id + "/thankyou")
	          	else
	          		$location.path("/classes/" + $routeParams.id + "/thankyou_waiting")
	         }
	        else if(data.status =="failed" || data.status =="error")
	          alert(data.message)


	      })
  	
  		
  	}
      
  }

}])
	.controller("ClassWaitingListCtrl",  ["$scope", "Class", "$filter", "$routeParams", "$location", function ($scope, Class, $filter, $routeParams, $location){
		$scope.items = Class.waitingList({id:$routeParams.id}, function(data){
			console.log('loaded')
			console.log(data)
		});

		Class.get({id:$routeParams.id}, function(data){
			$scope.header ="Waiting List | " + data.name + " : Level " + data.level	
			$scope.skill = data.skill;
		})
		$scope.header ="Waiting List"


		$scope.approve = function(item)
		{
			alert(item.member._id);
			Class.approveWaiting({classId:$routeParams.id, member_id:item.member._id}, function(result){
				if(result.status == "success")
					$scope.items = Class.waitingList({id:$routeParams.id}, function(data){
						console.log('loaded')
						console.log(data)
					});
			})
		}

		$scope.unapprove = function(item)
		{
			alert(item.member._id);
			Class.removeWaiting({classId:$routeParams.id, member_id:item.member._id}, function(result){
				if(result.status == "success")
					$scope.items = Class.waitingList({id:$routeParams.id}, function(data){
						console.log('loaded')
						console.log(data)
					});
			})
		}
	}])
	.controller("ClassWaitingPaymentCtrl",  ["$scope", "Class", "$filter", "$routeParams", "$location", function ($scope, Class, $filter, $routeParams, $location){
		$scope.items = Class.waitingPayment({id:$routeParams.id}, function(data){
			console.log('loaded')
			console.log(data)
		});
		$scope.header ="Waiting Payment"
		$scope.isReadOnly = true;
		

		$scope.approve = function(item)
		{
			alert(item.member._id);
			Class.approvePayment({classId:$routeParams.id, member_id:item.member._id}, function(result){
				if(result.status == "success")
					$scope.items = Class.waitingPayment({id:$routeParams.id}, function(data){
						console.log('loaded')
						console.log(data)
					});
			})
		}
	}])

	.controller("ClassMemberCtrl",  ["$scope", "Class", "$filter", "$routeParams", "$location", function ($scope, Class, $filter, $routeParams, $location){
	  $scope.refresh = function(){
	    Class.members({id:$routeParams.id}, function (_members){
	      $scope.members = $filter('classMembersToMembers')(_members)
	    })  
	  }
	  
	  $scope.refresh();
	  $scope.approveJoin = function()
	  {
	     $scope.members = $filter('filter')($scope.members, {is_selected:true})
	     if($scope.members.length > 0  )
	    {
	      Class.approve({members:$scope.members, classId:$routeParams.id}, function(data){
	        console.log(data)
	        $scope.refresh();
	      })
	    }


	  }

	  $scope.unapproveJoin = function()
	  {
	      $scope.members = $filter('filter')($scope.members, {is_selected:true})
	       if($scope.members.length > 0  )
	      {
	        Class.unapprove({members:$scope.members, classId:$routeParams.id}, function(data){
	          console.log(data)
	          $scope.refresh();
	        })
	      }
	  }

	  }])
	

	.controller("ClassStatCtrl",  ["$scope", "Class", "$filter", "$routeParams", "$location", function ($scope, Class, $filter, $routeParams, $location){
		
	  $scope.refresh = function(){
	    Class.members({id:$routeParams.id}, function (_members){
	      $scope.stat_items =  $filter('classMembersToMembers')(_members)
	      $scope.stat_items =  $filter('membersByCheckin')($scope.stat_items )
	      $scope.leadLabels = ["Lead", "Follow"]
	      $scope.genderLabels = ["Male", "Female"]
	      $scope.maleCount = _members.filter(function(item){ return item.member.gender == 1 }).length
	      $scope.femaleCount = _members.length - $scope.maleCount
	      $scope.leadCount = _members.filter(function(item){ return item.is_lead}).length
	      $scope.followCount = _members.length - $scope.leadCount;
	      $scope.leadData = [$scope.leadCount, $scope.followCount]
	      $scope.genderData = [$scope.maleCount,$scope.femaleCount]
	      $scope.class = Class.get({id:$routeParams.id}, function(_class){
	      	$scope.header = "Class : "  + $scope.class.name + " Lv. " + $scope.class.level;
			$scope.waitingPaymentLeadCount = 0;
			$scope.waitingPaymentFollowCount = 0;
			$scope.class.waiting_payment.forEach(function(item){
				if(item.is_lead)
					$scope.waitingPaymentLeadCount++;
				else
					$scope.waitingPaymentFollowCount++;
			})
			$scope.leadWaitingPaymentData = [$scope.waitingPaymentLeadCount, $scope.waitingPaymentFollowCount]
	      	$scope.attendSeries = ['Attend Studentx'];	
	      	$scope.attendLabels = []
	      	$scope.attendData =[];
	      	$scope.attendData[0] = [];
	      	//------
	      	console.log('---')
	      	console.log(_class)
	      	_class.check_in.forEach(function(check_in_date){
	      		
	      		$scope.attendLabels.push($filter('date')(check_in_date));
	      		var checkCount =  _members.filter(function(item) { return item.check_in[check_in_date] == 1 }).length;
	      		$scope.attendData[0].push( checkCount )
	      	})
	      	$scope.skill = _class.skill;
	      	$scope.skillSeries = []
	      	$scope.skillSeries.push($scope.skill.name);
	      	$scope.skillLabels = [];
	      	$scope.skillData =[];

	      	$scope.skillData[0] = [];
	      	
	      	var level_min = 0;
	      	var level_max = 5;

	      	for(var level = level_min; level <= level_max; level++)
	      	{
	      		$scope.skillLabels.push(("Lv. " + level));
	      		var checkCount = _members.filter(function(item) { 

	      			for(var j=0; j < item.member.levels.length;j++)
	      				if(item.member.levels[j].skill == $scope.skill._id && item.member.levels[j].level == level)
	      					return true;

	      		}).length



	      		$scope.skillData[0].push( checkCount )
	      	}

	      	$scope.skillWaitingData =[];
	      	$scope.skillWaitingData[0] =[];
	      	 Class.waitingPayment({id:$routeParams.id}, function(data){
				console.log('waiting_payment')
				//console.log(data)
				for(var level = level_min; level <= level_max; level++)
		      	{
		      	//	$scope.skillLabels.push(("Lv. " + level));
		      		var checkCount = data.filter(function(item) { 

		      			for(var j=0; j < item.member.levels.length;j++)
		      				if(item.member.levels[j].skill == $scope.skill._id && item.member.levels[j].level == level)
		      					return true;

		      		}).length



		      		$scope.skillWaitingData[0].push( checkCount )
		      	}
				
			});
	      	
	      })
	      
	      //$scope.members = $filter('classMembersToMembers')(_members)
	      //$scope.members = $filter('filter')($scope.members, {is_join:true})
	    })  
	  }
	  $scope.refresh();



	  console.log("stat")
	}])
	.controller("ClassModalCheckInCtrl", ["$scope", "User", "$filter", "$uibModalInstance", "members", "Class", function ($scope, User, $filter, $uibModalInstance, members, Class){
		console.log('test')
		console.log(members)
		$scope.members = members;
		 $scope.confirm = function () {

		 	if(confirm("Confirm for " + $scope.selectedMember.firstname + " : " + $scope.selectedMember.amount))
		 	{
		 		$uibModalInstance.close($scope.selectedMember);	
		 	}
		    //$uibModalInstance.close($scope.selected.item);
		  };

		  $scope.select = function(member)
		  {
		  	console.log('going to checkin ')
		  	console.log(member)
		  	$scope.selectedMember = member;
		  	$scope.isConfirmMode = true;
		  	$scope.selectedMember.is_lead = true;
		  }

		  $scope.cancel = function () {
		    $uibModalInstance.dismiss('cancel');
		  };
	}])
	.controller("ClassCheckInCtrl",  ["$scope", "Class", "$filter", "$routeParams", "$location","User","$uibModal" , function ($scope, Class, $filter, $routeParams, $location, User,  $uibModal){
		$scope.now = new Date();
		$scope.class =Class.get({id:$routeParams.id})
	  $scope.refresh = function(){
	    $scope.members = Class.members({id:$routeParams.id}, function (_members){
	      
	    })  
	  }
	  
	  
	  	


	  $scope.doWalkin = function()
	  {
	  	$scope.all_members = User.query(function(data){
	  		console.log('do walkin')
	  		console.log(data)
	  		var modalInstance = $uibModal.open({
			      animation: true,
			      templateUrl: 'myModalContent.html',
			      controller: 'ClassModalCheckInCtrl',
			      size: 'lg',
			      resolve: {
			        members: function () {
			        	
			          return data;
			        }
			      }
			    });	
	  		 modalInstance.result.then(function (selectedMember) {
			      console.log('selectedMember')
			      var data = {};
			      data.member_id = selectedMember._id;

			      data.is_lead = selectedMember.is_lead;
			      data.amount = selectedMember.amount
			      data.classId = $routeParams.id
			      Class.addWalkin(data, function (_class){
			      	console.log('after walkin')
			      	console.log(_class)
			      	$scope.refresh();
			      })
			  });
	  	});
	  	 

	  }


	  $scope.refresh();

	  $scope.uncheckin = function(member)
	  {
	    var members = []
	      members.push(member)
	      console.log('gonna call uncheckin')
	      Class.uncheckin({members:members, classId:$routeParams.id}, function (data){
	        console.log('yobro')
	        $scope.refresh();
	      })
	  }

	  $scope.checkin = function (member)
	  {
	      var members = []
	      members.push(member)
	      Class.checkin({members:members, classId:$routeParams.id}, function (data){
	        $scope.refresh();
	      })
	  }

	}])
	.controller("ClassEditCtrl",  ["$scope", "Class", "$filter", "$routeParams", "$location", function ($scope, Class, $filter, $routeParams, $location){

	   $scope.skills = Class.skills(function(){
	   		  $scope.class =  Class.get({id:$routeParams.id}, function(item){
			      $scope.class.level = $scope.class.level +""
			      $scope.class.type = $filter("code2type")($scope.class.code)
			      $scope.class.start_date = new Date($scope.class.start_date)
			      $scope.class.end_date = new Date($scope.class.end_date)
			      var index =-1;
			      for(var i =0; i < $scope.skills.length ; i++){
			      	if($scope.skills[i]._id == item.skill)
			      		index = i
			      }
			      console.log(index)
			      $scope.class.skill = $scope.skills[index]

			      //$scope.class.start_time = $scope.class.start_date.getHours() + "." +$scope.class.start_date.getMinutes();
			      //$scope.class.end_time = $scope.class.end_date.getHours() + "." +$scope.class.end_date.getMinutes();
			    });
	   });
	  
	    $scope.save = function(){
	      $scope.class.id = $scope.class._id
	       Class.update($scope.class, function(data){
	          console.log('saved')
	          console.log(data)
	          $location.path("/classes")
	        })
	    }

	}])
	.controller("ClassRemoveCtrl",  ["$scope", "Class", "$filter", "$routeParams", "$location", function ($scope, Class, $filter, $routeParams, $location){
	  if(confirm("Are you sure to delete this?"))
	    Class.delete({id:$routeParams.id}, function(){
	      console.log("removed")
	    })
	  $location.path("/classes")
	}])
	.controller("ClassCreateCtrl", ["$scope", "Class", "$filter", "$location", function ($scope, Class, $filter, $location){
	    $scope.skills = Class.skills();
	  $scope.class = {days:[0,0,0,0,0,0,0]}
	  $scope.save = function(){
	        console.log($scope.class)
	        $scope.class.code = $filter('classCode')($scope.class, $scope.skills);
	        var start_time  = $scope.class.start_time.split(".");
	        var end_time  = $scope.class.end_time.split(".");
	        $scope.class.start_date.setHours(start_time[0])
	        $scope.class.start_date.setMinutes(start_time[1])
	        $scope.class.end_date.setHours(end_time[0])
	        $scope.class.end_date.setMinutes(end_time[1])

	        Class.save($scope.class, function(data){
	          console.log('saved')
	          console.log(data)
	          $location.path("/classes")
	        })
	        
	  
	        /*Class.save($scope.class, function(data){
	          console.log('saved')
	          console.log(data)
	        })*/
	    }
	}])
	.controller("ClassCtrl", ["$scope" ,"Class", function ($scope, Class){
		$scope.classes = Class.query()

	  $scope.q = {}

	  $scope.members = [
	    {"id":"1", firstname:"Sompop", lastname:"Kulapalanont", level:"Intermediate", phone:"+66824523991", email:"sompop.kulapalanont@gmail.com" ,isCheckin:false},
	    {"id":"2", firstname:"Sompop", lastname:"Kulapalanont", level:"Intermediate", phone:"+66824523991", email:"sompop.kulapalanont@gmail.com",isCheckin:false},
	    {"id":"3", firstname:"Sompop", lastname:"Kulapalanont", level:"Intermediate", phone:"+66824523991", email:"sompop.kulapalanont@gmail.com",isCheckin:false},
	    {"id":"4", firstname:"Sompop", lastname:"Kulapalanont", level:"Intermediate", phone:"+66824523991", email:"sompop.kulapalanont@gmail.com",isCheckin:false},
	    {"id":"5", firstname:"Sompop", lastname:"Kulapalanont", level:"Intermediate", phone:"+66824523991", email:"sompop.kulapalanont@gmail.com",isCheckin:false},
	    {"id":"6", firstname:"Sompop", lastname:"Kulapalanont", level:"Intermediate", phone:"+66824523991", email:"sompop.kulapalanont@gmail.com",isCheckin:false},
	    {"id":"7", firstname:"Sompop", lastname:"Kulapalanont", level:"Intermediate", phone:"+66824523991", email:"sompop.kulapalanont@gmail.com",isCheckin:false},
	  ]

	  $scope.checkin = function(member)
	  {
	    alert("check in")
	    console.log(member)
	  }

	}])
	.controller("ClassAllCtrl", ["$scope" ,"Class", "$filter", function ($scope, Class, $filter){
		$scope.classes = Class.query(function(){
			var now = new Date();
			$scope.classes = $filter('filter')($scope.classes, function(item){
				return item.is_active;
				/*var startDate = new Date(item.start_date);
				var endDate = new Date(item.end_date);
				if(now.getTime() >= startDate.getTime() -  (24 * 60 * 60 * 1000) && now.getTime() <= endDate.getTime() + (24 * 60 * 60 * 1000))
					return true;*/
			})
		});

	}]);