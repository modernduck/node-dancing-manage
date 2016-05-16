angular.module("danceRouter", ["ngRoute"])
.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/login', {
        templateUrl: 'assets/partials/login.html',
        controller: 'LoginCtrl'
      }).
      when('/classes', {
        templateUrl: 'assets/partials/classes/index.html',
        controller: 'ClassCtrl'
      }).
      when('/register', {
        templateUrl: 'assets/partials/members/form.html',
        controller: 'MemberRegisterCtrl'
      }).
      when('/validate/:id', {
        templateUrl: 'assets/partials/members/validate.html',
        controller: 'MemberValidateCtrl'
      })
      .
      when('/validate/:id/:code', {
        templateUrl: 'assets/partials/members/validate.html',
        controller: 'MemberValidateCtrl'
      })
      .
      when('/classes/create', {
        templateUrl: 'assets/partials/classes/form.html',
        controller: 'ClassCreateCtrl'
      }).
      when('/classes/:id/edit', {
        templateUrl: 'assets/partials/classes/form.html',
        controller: 'ClassEditCtrl'
      }).
      when('/classes/:id/remove', {
        templateUrl: 'assets/partials/classes/form.html',
        controller: 'ClassRemoveCtrl'
      })
      .
      when('/classes/:id', {
        templateUrl: 'assets/partials/classes/signup.html',
        controller: 'ClassViewCtrl'
      }).
       when('/classes/:id/thankyou', {
        templateUrl: 'assets/partials/classes/signup-done.html',
        controller: 'ClassCtrl'
      })
       .
       when('/classes/:id/thankyou_waiting', {
        templateUrl: 'assets/partials/classes/signup-done-waiting.html',
        controller: 'ClassCtrl'
      })
       .
       when('/classes/:id/waiting_list', {
        templateUrl: 'assets/partials/classes/waiting.html',
        controller: 'ClassWaitingListCtrl'
      }).
       when('/classes/:id/waiting_payment', {
        templateUrl: 'assets/partials/classes/waiting.html',
        controller: 'ClassWaitingPaymentCtrl'
      })

       .
      when('/classes/:id/members', {
        templateUrl: 'assets/partials/classes/members.html',
        controller: 'ClassMemberCtrl'
      }).
      when('/classes/:id/checkin', {
        templateUrl: 'assets/partials/classes/checkin.html',
        controller: 'ClassCheckInCtrl'
      }).
       when('/classes/:id/stat', {
        templateUrl: 'assets/partials/classes/stat.html',
        controller: 'ClassStatCtrl'
      }).
       when('/members', {
        templateUrl: 'assets/partials/members/index.html',
        controller: 'MemberCtrl'
      }).
         
       when('/members/create', {
        templateUrl: 'assets/partials/members/form.html',
        controller: 'MemberCreateCtrl'
      })
       .
       when('/members/payment', {
        templateUrl: 'assets/partials/members/form.html',
        controller: 'MemberPaymentCtrl'
      })
       .
       when('/members/:id', {
        templateUrl: 'assets/partials/members/profile.html',
        controller: 'MemberViewCtrl'
      })
       .
       when('/members/:id/update', {
        templateUrl: 'assets/partials/members/form.html',
        controller: 'MemberEditCtrl'
      })
        .
       when('/members/:id/payment', {
        templateUrl: 'assets/partials/payment/waiting.html',
        controller: 'PaymentWaitingCtrl'
      })
      .
       when('/payment/info', {
        templateUrl: 'assets/partials/payment/info.html',
        controller: 'PaymentInfoCtrl'
      })
       .
       when('/payment/waiting', {
        templateUrl: 'assets/partials/payment/waiting.html',
        controller: 'PaymentWaitingCtrl'
      })
        .
       when('/payment/list', {
        templateUrl: 'assets/partials/payment/list.html',
        controller: 'PaymentListCtrl'
      })
        .
       when('/payment/waiting/:id', {
        templateUrl: 'assets/partials/payment/member.html',
        controller: 'PaymentMemberCtrl'
      })
       .when('/skills', {
          templateUrl : 'assets/partials/skills/index.html',
          controller : 'SkillIndexCtrl'
       })
       .when('/skills/:id', {
          templateUrl : 'assets/partials/skills/form.html',
          controller : 'SkillUpdateCtrl'
       })
       .when('/checkin', {
          templateUrl : 'assets/partials/checkin/list.html',
          controller : 'CheckinCtrl'
       })
       .when('/allclass', {
          templateUrl : 'assets/partials/classes/all.html',
          controller : 'ClassAllCtrl'
       })
       .when('/allclass/widget', {
          templateUrl : 'assets/partials/classes/all-widget.html',
          controller : 'ClassAllCtrl'
       })
       .when('/dashboard', {
          templateUrl : 'assets/partials/dashboard.html',
          controller : 'DashboardCtrl'
       })
       .
      otherwise({
        redirectTo: '/login'
      });
  }]);





angular.module("danceApp", ["danceRouter", "class.ctrl", "member.ctrl", "payment.ctrl", "skill.ctrl"])
.controller("LoginCtrl", ["$scope" , "$location", "Auth", function ($scope, $location, Auth){
  Auth.check(function(result){
    if(result.status == "error")
      Auth.reset();
    else
    {

      if(!result.user.is_active)
      {
        $location.path('/validate/' + result.user._id)
      }else if(angular.isUndefined(result.user.permissions))
        {

          $location.path('/members/' + result.user._id )
        }else if(result.user.permissions.teacher)
        {
        $location.path("/classes")
      }else if(result.user.permissions.payment)
      {
        $location.path("/payment/list")
      }
        $location.path('/members/' + result.user._id )
    }
    console.log('authe result')
    console.log(result)
  })
  $scope.message = "Hi Jack";
  $scope.login = function()
  {
    Auth.login($scope.email, $scope.password, function(result){
      
      if(result.status =="error")
      {
        alert("Error something wrong please check your email/password")
      }
      else
      {
        if(angular.isUndefined(result.user.permissions))
        {
          $location.path('/allclass/' )
          //$location.path('/members/' + result.user._id )
        }else if(result.user.permissions.teacher)
        {
          $location.path("/classes")
        }else if(result.user.permissions.payment)
        {
          $location.path("/payment/list")
        }else
          $location.path('/allclass/' )
      }
       
    })
    //$location.path("/classes")
  }
}])
.controller("CheckinCtrl", ["Class", "$scope", "$filter", function (Class, $scope, $filter) {
  $scope.def_classes =[]
  $scope.classes = Class.query(function(data){
    $scope.def_classes = data;
    $scope.toggleAvailableClass();
  });
  $scope.isShow = false;
  $scope.toggleAvailableClass = function()
  {
    $scope.isShow = !$scope.isShow
    if($scope.isShow)
      $scope.classes = $filter('filter')($scope.classes, function(item){
          var now = new Date();
          
          
          var start = new Date(item.start_date);
          var end = new Date(item.end_date);
          if(now.getTime() <= end.getTime() + (24 * 60 * 60 * 1000) && now.getTime() >= (start.getTime() -  (24 * 60 * 60 * 1000)))
            return true;


      })
    else
      $scope.classes = $scope.def_classes

  }

}])
.controller("MemberPaymentCtrl", ["$scope", "Auth", "$location", function ($scope, Auth, $location){
  Auth.check(function(result){
   if(result.status == "error")
      Auth.reset();
    else
    {
      $location.path('/members/' + result.user._id + "/payment" )

    }
  })
}])
.controller("DashboardCtrl", ["$scope", "Auth", "$location", "User", "Class", function ($scope, Auth, $location, User, Class){
  $scope.refresh = function()
  {
    $scope.classes = Class.query({fields:['waiting_list', 'test']})
    $scope.leadCount = 10;
    $scope.followCount = 10;
    $scope.maleCount = 10;
    $scope.femaleCount = 10;
  }
    $scope.refresh();

    $scope.approve = function(item, class_item)
    {
      alert(item.member._id);
      Class.approveWaiting({classId:class_item._id, member_id:item.member._id}, function(result){
        if(result.status == "success")
          $scope.refresh();
      })
    }

    $scope.unapprove = function(item, class_item)
    {
      alert(item.member._id);
      Class.removeWaiting({classId:class_item._id, member_id:item.member._id}, function(result){
        if(result.status == "success")
          $scope.refresh();
      })
    }


  }]);



