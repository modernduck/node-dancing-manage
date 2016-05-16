angular.module("dataProvider", ['ngResource'])
  .factory("Class",  ['$resource',
      function($resource){
        return $resource('classes/:id/:action', {}, {
          query: {method:'GET', params:{}, isArray:true},
          update : {method:"POST", params:{id:"@id"}},
          delete : {method:"DELETE", params:{id:"@id"}},
          signup : {method:"POST", params:{action:"signup", id:"@classId"}},
          members : {method:"GET", params:{action:"members", id:"@id"}, isArray:true},
          approve : {method:"POST", params:{action:"approve", id:"@classId"}},
          unapprove : {method:"POST", params:{action:"unapprove", id:"@classId"}},
          checkin : {method:"POST", params:{action:"checkin", id:"@classId"}},
          uncheckin : {method:"POST", params:{action:"uncheckin", id:"@classId"}},
          waitingList : {method:"GET", params:{action:"waiting_list"}, isArray:true},
          waitingPayment : {method:"GET", params:{action:"waiting_payment"}, isArray:true},
          approveWaiting : {method:"POST", params:{action:"approve_waiting", id:"@classId"}},
          removeWaiting : {method:"POST", params:{action:"remove_waiting", id:"@classId"}},
          approvePayment : {method:"POST", params:{action:"approve_payment", id:"@classId"}},
          addWalkin : {method:"POST", params:{action:"walkin", id:"@classId"}},
          cancelSignup : {method:"POST", params:{action:"cancel_registration", id:"@classId"}},
          skills : {method:"GET", params:{action:"skills"}, isArray:true},

          updateSkill : {method:"POST", params:{action:"skills"}}
        });
  }])
  .factory("User",  ['$resource',
      function($resource){
        return  $resource('users/:id/:action', {}, {
          query: {method:'GET', params:{}, isArray:true},
          update : {method:"POST", params:{id:"@id"}},
          delete : {method:"DELETE", params:{id:"@id"}},
          register : {method:"POST", params:{id:"register"}},
          validate : {method:"POST", params:{id:"validate"}},
          waitingPayment: {method:"GET", params:{id:"@id", action:"waiting_payment"}, isArray:true},
          getToken : {method:"GET", params:{id:"@id", action:"token"}},
          auth : {method:"GET", params:{id:"@id", action:"auth"}},
          login : {method:"GET", params:{action:"login"}}
        });
        
  }])
  .factory("Payment", ['$resource',
      function ($resource)
      {
        return $resource('payments/:id/:action', {}, {
            echo : {method :"POST", params:{"action":"echo"}},
            member : {method:"GET", params:{"action":"member"}, isArray:true},
            confirm : {method:"POST", params:{"action":"confirm"}},
            deny : {method:"POST", params:{"action":"deny"}},
            move : {method:"POST", params:{"action":"move"}},
        })
      }

    ])
    .factory("Auth", ["User", function (User){
      var LOCAL_KEY = "thehopauthen";
      var LOCAL_ID = "thehopid";
      var LOCAL_USER = "thehopuser";
      return {
        getPermissions: function()
        {
          if(typeof localStorage[LOCAL_USER] == "undefined")
            return {}
          var user = JSON.parse(localStorage[LOCAL_USER]);
          return user.permissions;
        },
        getId: function()
        {
           if(typeof localStorage[LOCAL_ID] != "undefined")
            return localStorage[LOCAL_ID];
          else
            return null;
        },
        getToken : function(){
          if(typeof localStorage[LOCAL_KEY] != "undefined")
            return localStorage[LOCAL_KEY];
          else
            return null;
        },
        check : function(callback)
        {
          if(typeof localStorage[LOCAL_ID] == "undefined")
          {
            callback({status:"error", message:"Need to login"})
            return false;
          }else
          {
            console.log('yo')
            console.log(localStorage[LOCAL_ID])
            User.auth({id:localStorage[LOCAL_ID], token:this.getToken()}, function(result){
            callback(result)
          })  
          }
          
        },
        login: function(email, password, callback)
        {
          User.login({email:email, password:password}, function (result){
            console.log(result);
            if(result.status == "error")
              callback(result);
            else
            {
              localStorage[LOCAL_KEY] = result.token;
              localStorage[LOCAL_ID] = result.user._id;
               localStorage[LOCAL_USER] = JSON.stringify(result.user);
              callback(result);
            }  
             
            
          })
        },
        logout: function(callback)
        {
          this.reset();
          callback();
        },
        connect : function(id, password, callback)
        {
          User.getToken({id:id, password:password}, function(result){
            localStorage[LOCAL_KEY] = result.token;
            localStorage[LOCAL_ID] = id;
            localStorage[LOCAL_USER] = JSON.stringify(result.user);
            callback(result)
          })
        },
        reset : function()
        {
          delete localStorage[LOCAL_ID];
          delete localStorage[LOCAL_KEY];
          delete localStorage[LOCAL_USER]
        }

      }
  }])





/*
* Not prove yet
*/
angular.module("googleCalendar", [])
  .factory("GoogleCalendar", function(){
      var CLIENT_ID = "711313242975-51clqe9j1tastndv2k9rbiq1hl8cpfd8.apps.googleusercontent.com";
      var SCOPES =  ["https://www.googleapis.com/auth/calendar"];

      return {
          getCalendars : function() {
            return {
              "0": {level:"0", calendarId:"3v4crn59fs6b5qnh0ogvqmm3a8@group.calendar.google.com"},
              "1": {level:"1", calendarId:"3v4crn59fs6b5qnh0ogvqmm3a8@group.calendar.google.com"},
              "2":{level:"2", calendarId:"8pv4f2m9vvec0f9cdifufb7evk@group.calendar.google.com"},
              "3":{level:"3", calendarId:"4r0gdr2dd86sjdletf4notcko0@group.calendar.google.com"},
              "4":{level:"4", calendarId:"kv519anf0o0jis1q9h64g5u2ds@group.calendar.google.com"},
              "5":{level:"5", calendarId:"7u5977lepvl9l3vd7maiqjve70@group.calendar.google.com"},
            }
          },
          handleResult : function (authResult, onComplete){
             if (authResult && !authResult.error) {
              onComplete();

            }else
                gapi.auth.authorize(
                {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
                this.handleAuthResult);
          },
          init : function(handleCallback)
          {
               gapi.auth.authorize(
              {
                'client_id': CLIENT_ID,
                'scope': SCOPES.join(' '),
                'immediate': true
              }, function (authResult){
                this.handleResult(authResult, handleCallback)
              });
          },
          newEvent : function (event, calendarId, onComplete)
          {
            gapi.client.load('calendar', 'v3', function(){
             var request = gapi.client.calendar.events.insert({
              'calendarId': calendarId,
              'resource': event
            });
            request.execute(function(event) {
              //console.log('Event created: ' + event.htmlLink);
              onComplete(event)
              });

           });

          }


      }


  })