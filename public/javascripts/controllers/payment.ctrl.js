angular.module("payment.ctrl", ["danceWidget", "dataProvider", "dataFilter", "ngFileUpload", "chart.js", "ui.bootstrap"])
	.controller("PaymentInfoCtrl", ["$scope", "$routeParams", "$location", function ($scope, $routeParams, $location) {
		$scope.banks = [
			{"name" : "BANGKOK BANK", "account":"189-4-39299-0", "owner": "THE HOP"}
		]
	}])
	.controller("PaymentWaitingCtrl", ["$scope", "$routeParams", "$location", "User", "Payment", "Upload", "$filter", function ($scope, $routeParams, $location, User, Payment, Upload, $filter) {
		console.log('waitingPayment')
		$scope.classes = User.waitingPayment({id:$routeParams.id})
		$scope.banks = [
			{"name" : "BANGKOK BANK", "account":"189-4-39299-0", "owner": "THE HOP"}
		]
		$scope.member_id = $routeParams.id
		$scope.isLoading = false;
		$scope.percent = 50;
		$scope.submit = function(_file)
		{
			if(angular.isUndefined(_file))
			{
				alert("Please selected file again")
				return false;
			}
			console.log('---submit---')
			console.log($scope.file)
			var selectedClasses = $filter('filter')($scope.classes, {isSelected:true})
			if(selectedClasses.length <= 0)
			{
				alert("You need to select which class(es) to pay")
				return false;
			}
			console.log('new submit')
			console.log(_file)
			$scope.isLoading = true;
			var payment = $filter('transfer2Payment')($scope.transfer, $scope.classes)
			var data ={ member_id:$routeParams.id, payment:payment, file:$scope.file}
			console.log(data)
			 _file.upload = Upload.upload({
	          url:"/payments/upload",
	          data:{ file:$scope.file}
	        })

			  _file.upload.then(function (response) {
		            console.log(response)
		            payment.member_id = $routeParams.id;
		            payment.filePath = response.data.file;
		            Payment.save(payment, function(res){
		            	if(res.status == "success")
		            		$location.path('/members/' + $routeParams.id)
		            })
		        }, function (response) {
		        	alert("Error " + JSON.stringify(response))
		        }, function (evt) {
		          // Math.min is to fix IE which reports 200% sometimes

		            $scope.percent = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
		        });
		        
		}
	}])
	.controller("PaymentListCtrl", ["$scope", "$routeParams", "$location", "Payment", function ($scope, $routeParams, $location, Payment) {
		/*$scope.transactions = [
			{ id:"1", date:"2015-12-12", hours:10, mins:10, noted:"", member_id:40, member:{name:"Sompop Kulapalanont"}, amount:4000},
			{ id:"2", date:"2016-01-01", hours:18, mins:30, noted:"", member_id:1, member:{name:"Sulaiman Manman"}, amount:3000},
		]*/
		$scope.transactions = Payment.query(function(data){
			data.forEach(function(item){
				item.is_update = true;
				item.classes.forEach(function(_class){
					if(data.status == 1)
						_class.amount = item.amount/item.classes.length
				})
			})
		});

		$scope.move = function(item)
		{
			Payment.move({payment_id:item._id}, function(data){
				console.log(data)
				$scope.transactions = Payment.query();
			})	
		}

		$scope.confirm = function (item)
		{
			//console.log({payment_id:item._id})
			var data = {payment_id:item._id};
			if(item.is_update)
			{
				var _classes = [];
				item.classes.forEach(function(_item){
					_classes.push({class:_item.class._id, amount:_item.amount})
				})
				data = {payment_id:item._id, is_update:true, amount:item.amount, classes:_classes}
			}
			Payment.confirm(data, function(data){
				console.log(data)
				$scope.transactions = Payment.query();
			})
		}

		$scope.deny = function(item)
		{

		
			Payment.deny({payment_id:item._id}, function(data){
				console.log(data)
				$scope.transactions = Payment.query();
			})	
		}
	}])
	.controller("PaymentMemberCtrl", ["$scope", "$routeParams", "$location", function ($scope, $routeParams, $location) {
		$scope.transactions = [
			{ id:"1", date:"2015-12-12", hours:10, mins:10, noted:"", member_id:40, member:{name:"Sompop Kulapalanont"} , amount:4000, status:"Waiting"},
		]
		console.log('yo')
		$scope.registerCourses = [
			{ id:"1", name:"Lindyhop Beginner"}
		]
	}])
  