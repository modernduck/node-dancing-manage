angular.module("danceWidget", ['dataProvider', 'ui.bootstrap'])
	.directive("classIndex", function(){
		return {
			scope : {
				"classes" : "="
			},
			restrict : "E",
			link : function ($scope, attrs, elm){

			},
			templateUrl:"assets/partials/widgets/class-index.html"
		}
	})
	.directive("memberClass", function(){
		return {
			scope : {
				"members" : "="
			},
			restrict : "E",
			link : function ($scope, attrs, elm){

			},
			templateUrl:"assets/partials/widgets/member-class.html"
		}
	})
	.directive("memberIndex", function(){
		return {
			scope : {
				"members" : "="
			},
			restrict : "E",
			link : function ($scope, attrs, elm){

			},
			templateUrl:"assets/partials/widgets/member-index.html"
		}
	})
	.directive("memberCheckin", function(){
		return {
			scope : {
				"members" : "=",
				"checkin" : "&onCheckin",
				"uncheckin" : "&onUnCheckin",
			},
			restrict : "E",
			link : function ($scope, attrs, elm){
				
			},
			templateUrl:"assets/partials/widgets/member-checkin.html"
		}
	})

	.directive("paymentBank", function(){
		return {
			scope : {
				"banks" : "=",
				
			},
			restrict : "E",
			link : function ($scope, attrs, elm){
				
			},
			templateUrl:"assets/partials/widgets/payment-bank.html"
		}
	})

	.directive("paymentBankSelector", function(){
		return {
			scope : {
				"banks" : "=",
				
			},
			restrict : "E",
			link : function ($scope, attrs, elm){
				
			},
			templateUrl:"assets/partials/widgets/payment-bank-selector.html"
		}
	})
	
	.directive("navMenu",["Auth", "$location", function (Auth, $location){
			return {
				scope : {
					
				},
				restrict : "E",
				link : function ($scope, attrs, elm){
					$scope.member_id = Auth.getId();
					$scope.permissions = Auth.getPermissions();
					console.log($scope.permissions)
					$scope.logout = function()
					{
						Auth.logout(function(){
							$location.path('/')
						})
					}
				},
				templateUrl:"assets/partials/widgets/menu.html"
			}
		}])
	.directive('showToRoles', ["Auth", function (Auth){
		return {
			scope:{
				showToRoles:"=",
				memberId:"="
			},
			restrict :"A",
			link : function ($scope, elm, attr){
				//console.log(attr);
				
				var permissions = Auth.getPermissions();
				var isShow = false;
				var isLogin = false;
				if(Auth.getId() != null)
					isLogin = true;
				
				for(var role in permissions)
				{
					$scope.showToRoles.forEach(function(show){
						if(role == show)
						{
							console.log('found '+ role + 'perms' +permissions[role])
							if(permissions[role])
							{

								isShow = true;
							}
								
						}

					})
					
				}
				if(!isShow)
						elm.css('display', 'none')
					else
					{
						elm.css('display', 'block')
					}
				$scope.$watch("memberId", function(oldValue, newValue){
					console.log($scope.memberId)
					$scope.showToRoles.forEach(function(show){
					 if(show =="@" && isLogin)
						isShow = true;
						else if(show =="owner" && ($scope.memberId+"") == Auth.getId())
						{
							
								
							
							isShow = true;
						}

					});

					if(!isShow)
						elm.css('display', 'none')
					else
					{
						elm.css('display', 'block')
					}
				}, true)
				

				
			}



		}


	}])
	.directive("paymentReport", function(){
		return {
			scope :
			{
				transactions:"="
			},
			restrict:"E",
			templateUrl:"assets/partials/widgets/payment-report.html",
			link: function ($scope, elm, attr){
				$scope.$watch("transactions", function(newValue){
					if(newValue)
					{
						$scope.items = [];
						$scope.transactions.forEach(function(item){
							item.classes.forEach(function(_class){
								var copy_attributes = ['dateTime', 'amount', 'status', 'user']
								var data = {};
								copy_attributes.forEach(function(attr){
									data[attr] = item[attr];
								})
								data.class = _class.class;
								if(typeof data.class == 'undefined')
									data.class = {amount:item.amount}
								else
								data.class.amount = _class.amount
								$scope.items.push(data)

							})
						})
						console.log($scope.transactions)
						console.log($scope.items)
					}
				}, true)
				

			}
		}
	}).directive('checkImage', function($http) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            attrs.$observe('ngSrc', function(ngSrc) {
                $http.get(ngSrc).success(function(){
                    
                }).error(function(){
                    
                    element.attr('src', 'https://cdn2.iconfinder.com/data/icons/circle-icons-1/64/profle-128.png'); // set default image
                });
            });
        }
    };
});

