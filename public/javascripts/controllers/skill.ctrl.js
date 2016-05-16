angular.module("skill.ctrl", ["danceWidget", "dataProvider", "dataFilter"])
	.controller("SkillIndexCtrl",  ["$scope", "Class", "$filter", "$routeParams", "$location" , "$timeout", function ($scope, Class, $filter, $routeParams, $location, $timeout){
 		$scope.skills = Class.skills();
}])
	.controller("SkillUpdateCtrl",  ["$scope", "Class", "$filter", "$routeParams", "$location" , "$timeout", function ($scope, Class, $filter, $routeParams, $location, $timeout){
		$scope.skills = Class.skills(function(){
			$scope.skills.forEach(function(item){
				console.log(item)
				console.log($routeParams.id)
				console.log(item._id)
				if(item._id == Number($routeParams.id))
				{
					$scope.skill = item;
					console.log('yo')
				}
			})
		});

		
		$scope.save = function()
		{
			Class.updateSkill($scope.skill, function(){
				$location.path('/skills')
			})
		}

	}])
	