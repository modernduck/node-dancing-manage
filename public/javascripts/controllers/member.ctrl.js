angular.module("member.ctrl", ["danceWidget", "dataProvider", "dataFilter", "ngFileUpload", "chart.js", "ngImgCrop"])
  .controller("MemberCtrl", ["$scope", "User", function ($scope, User){
    $scope.q = {}
    $scope.members = User.query();
  }])
  .controller("MemberValidateCtrl", ["$scope", "User", "$routeParams", "$location", "Class", function ($scope, User, $routeParams, $location, Class){
    $scope.member_id = $routeParams.id;
    $scope.code = $routeParams.code;
    $scope.validate = function()
    {
      User.validate({code:$scope.code, id:$scope.member_id}, function(data){
        if(data.result =="success")
          alert("Success please login ")
        $location.path('/')
      })
    }

  }])
  .controller("MemberRegisterCtrl", ["$scope", "User", "$routeParams", "$location", "Class", "Upload", function ($scope, User, $routeParams, $location, Class, Upload){
      $scope.skills = Class.skills();
      $scope.member = {};
      $scope.member.levels = [];
      $scope.isRegisterMode = true;
      $scope.save = function()
      {

        


        if($scope.member.new_password.length > 0)
        {
          if($scope.member.new_password == $scope.member.renew_password)
          {
            console.log('change password')
            $scope.member.password = $scope.member.new_password
          }else
          {
            alert("Password miss Match")
            return false;
          }
        }

        User.register($scope.member, function(data){
          console.log(data)
          if(typeof(data.status) != "undefined" && data.status == "error")
          {
            alert(data.message);
            return false;
          }

          var file = Upload.dataUrltoBlob($scope.croppedDataUrl, data.member_id);
          if(!angular.isUndefined(file)&& file.size > 1400)
             $scope.picFile = Upload.upload({
                url:"/users/upload",
                data: {
                  userId: data.member._id,
                    file: file
                    
                },
            }).then(function (response) {
                $location.path("/validate/" + data.member._id)
            }, function (response) {
                
            }, function (evt) {
                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
            });
          else
            $location.path("/validate/" + data.member._id)
        })

      }

  }])
  .controller("MemberCreateCtrl", ["$scope", "User", "$routeParams", "$location", "Class", function ($scope, User, $routeParams, $location, Class){
    $scope.skills = Class.skills();
    $scope.member = {};
    $scope.member.levels = [];
    $scope.save = function()
    {
      if($scope.member.new_password.length > 0)
      {
        if($scope.member.new_password == $scope.member.renew_password)
        {
          console.log('change password')
          $scope.member.password = $scope.member.new_password
        }else
        {
          alert("Password miss Match")
          return false;
        }
      }

      User.save($scope.member, function(data){
        console.log(data)
        $location.path("/members")
      })

    }


  }])

 .controller("MemberViewCtrl", ["$scope", "User", "$routeParams", "$location", "Class", "Payment", "Class", function ($scope, User, $routeParams, $location, Class, Payment, Class){
   $scope.refresh = function()
   {


     $scope.member = User.get({id:$routeParams.id, fields:['attendClasses']}, function(){
            $scope.labels =[];  
            $scope.levels = [];
            $scope.real_data = [];
            $scope.max_data = [];
          $scope.member.levels.forEach(function(item){
            $scope.labels.push(item.skill.name)
            $scope.levels.push(item.level);
            $scope.real_data.push(item.level);
            $scope.max_data.push(5)
          })
          $scope.data = [
            $scope.real_data,
            $scope.max_data,
          ];
          $scope.classes =  $scope.member.attendClasses;
          $scope.payment_classes = User.waitingPayment({id:$routeParams.id}, function(){
            for(var i =0; i < $scope.payment_classes.length; i++) 
            {

              $scope.payment_classes[i].status = 0;
              var isDuplicate = false;
              $scope.classes.forEach(function(c_item){
                if(c_item.class._id == $scope.payment_classes[i].class._id)
                  isDuplicate = true;
              })

              if(!isDuplicate)
                $scope.classes.push($scope.payment_classes[i]);
            }         
            console.log('---pending---')
            console.log($scope.payment_classes)
            

          })
      })
    }
  $scope.refresh();
   $scope.cancel = function(item)
   {
      Class.cancelSignup({classId:item.class._id, member_id:$routeParams.id}, function(){
          $scope.refresh();
      })
   }
   $scope.payments = Payment.member({member_id:$routeParams.id});
    
   
        
      //for worskhop use WS
      /*$scope.levels = [3,2,1,0, 2, 0];
      $scope.data = [
        [70, 50, 30, 0, 50, 0],
        [100, 100, 100, 100, 100, 100],
      ];*/
      
}])

  .controller("MemberEditCtrl", ["$scope", "User", "$routeParams", "$location", "Class", "Auth" , "Upload", function ($scope, User, $routeParams, $location, Class, Auth, Upload){
    $scope.skills = Class.skills();
    $scope.member = {};
    $scope.member.levels = [];
    //{"_id":108,"firstname":"SOmpop","lastname":"jizz","gender":1,"phone":"66824523991","email":"sompop.kulapalanont@gmail.com","is_active":true,"password":"1234","__v":0,"waiting_payment":[],"attendClasses":[],"levels":[{"skill":27,"level":0,"_id":"571b3fc3f69e63a955861f95"},{"skill":28,"level":0,"_id":"571b3fc3f69e63a955861f94"},{"skill":29,"level":0,"_id":"571b3fc3f69e63a955861f93"},{"skill":30,"level":0,"_id":"571b3fc3f69e63a955861f92"},{"skill":31,"level":1,"_id":"571b3fc3f69e63a955861f91"}],"attrs":[]}
   

    $scope.q = {}
    $scope.member = User.get({id:$routeParams.id}, function(){
      //"levels":[{"skill":27,"level":0,"_id":"571b3fc3f69e63a955861f95"},{"skill":28,"level":0,"_id":"571b3fc3f69e63a955861f94"},{"skill":29,"level":0,"_id":"571b3fc3f69e63a955861f93"},{"skill":30,"level":0,"_id":"571b3fc3f69e63a955861f92"},{"skill":31,"level":1,"_id":"571b3fc3f69e63a955861f91"}],"attrs":[]}
        $scope.member.levels.forEach(function(item){
          item.level =  item.level+"";
        })
      /*  $scope.isAdmin = $scope.member.permissions.admin;
        $scope.isTeacher = $scope.member.permissions.teacher;
        $scope.isAccountance = $scope.member.permissions.payment;*/
    })

    $scope.remove = function()
    {
      if(confirm("Are you sure do delete this? This process cant be revert"))
      User.delete({id:$scope.member._id}, function(){
        $location.path("/members");
      })
    }

    $scope.afterSave = function()
    {
       Auth.check(function(result){
          if(result.status == "error")
          {
            $location.path("/")
          }
          else
          {
            if(angular.isUndefined(result.user.permissions))
            {
              $location.path("/members/" + result.user._id);

            }else if(result.user.permissions.admin || result.user.permissions.teacher)
              $location.path("/members")
            else
              $location.path("/members/" + result.user._id);


          }
      })
    }

    $scope.save = function()
    {
      $scope.member.id = $scope.member._id;
      if(!angular.isUndefined($scope.member.new_password) &&  $scope.member.new_password.length > 0)
      {
        if($scope.member.new_password == $scope.member.renew_password)
        {
          console.log('change password')
          $scope.member.password = $scope.member.new_password
        }else
        {
          alert("Password miss Match")
          return false;
        }
      }

      User.update($scope.member, function(data){
        console.log('saved')
        var file = Upload.dataUrltoBlob($scope.croppedDataUrl, $scope.member._id);
        console.log(file)
        if(!angular.isUndefined(file) && file.size > 1400)
           $scope.picFile = Upload.upload({
              url:"/users/upload",
              data: {
                userId: $scope.member._id,
                  file: file
                  
              },
          }).then(function (response) {
              $scope.afterSave();
          }, function (response) {
              
          }, function (evt) {
              //$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
          });
        else
          $scope.afterSave();





           

        
      })
    }
  }])