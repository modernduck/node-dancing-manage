angular.module("dataFilter", [])
  .filter("level", function(){
    return function (level)
    {
      /*if(level == 0)
        return "All level"
      var level = Number(level);
      var index = level -1;
      var levels = ["Beginner", "Beginner Intermediate", "Intermediate", "Intermediate Advanced", "Advanced"]

      return levels[index]*/
      return level;
    }
  })
  .filter("ISODateString", function(){
    return function (d){
         function pad(n){return n<10 ? '0'+n : n}
         return d.getUTCFullYear()+'-'
              + pad(d.getUTCMonth()+1)+'-'
              + pad(d.getUTCDate())+'T'
              + pad(d.getUTCHours())+':'
              + pad(d.getUTCMinutes())+':'
              + pad(d.getUTCSeconds())+'Z'
    }
  })
  .filter("RFC5545", function(){
    //20110701T170000Z
    function pad(n){return n<10 ? '0'+n : n}
    return function (d)
    {
      return d.getUTCFullYear()+pad(d.getUTCMonth()) + pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+pad(d.getUTCMinutes())+pad(d.getUTCSeconds())+"Z";
    }
  })
  .filter("isMemberActive", function(){
    return function(isActive)
    {
        if(isActive)
          return "Active"
        else
          return "InActive"
    }
  })
  .filter("gender", function(){
    return function(gender)
    {
      if(gender ==0)
          return "female"
      else if(gender == 1)
          return "male"
      else
          return "unknow"
    }
  })
  .filter("isLead" ,function(){
    return function (isLead)
    {
      if(angular.isObject(isLead) && !angular.isUndefined(isLead))
      {
        if(isLead.is_lead)
          return "Lead";
        else
          return "Follow";

      }else if(isLead)
        return "Lead"
      else
        return "Follow"
    }
  })

  .filter("membersByCheckin", function(){
    //use after classMembersToMembers
    return function (members)
    {
      var check_in = {};
      members.forEach(function (member){
        if(!angular.isUndefined(member.check_in))
        {
          for(var k in member.check_in)
          {
            if(angular.isUndefined(check_in[k]))
              check_in[k] = []
            if(member.check_in[k])
              check_in[k].push(member)
          }
        }
      })

      var result = [];
      for(var k in check_in)
      {
        var obj = {date:(new Date(k)), members:check_in[k]}
        result.push(obj)
      }

      return result;
    }

  })

  .filter("classMembersToMembers", function(){
    //[{"is_lead":true,"member":{"_id":16,"firstname":"Sompop","lastname":"Kulapalanont","email":"sompop.kulapalanont@gmail.com","phone":"+66824523991","password":"123456","__v":0,"mark":"Cool Man","level":3,"is_active":true,"attendClasses":[],"attrs":[]},"is_paid":false,"_id":"56d5763f7956ff446f3b574c"}]
    return function (_members)
    {
      var members = [];
      if(angular.isUndefined(_members))
        return [];
      _members.forEach( function(item){
        var obj = item.member;
        if(obj!=null && !angular.isUndefined(obj))
        {
            for(k in item)
              if(k != "member" && k!= "_id")
                obj[k] = item[k]
          members.push(obj)
        }
      })
      return members
    }

  })
  .filter("isJoin", function(){
    return function(isJoin)
    {
      if(isJoin)
        return "Join"
      else
        return "Pending"
    }
  })
  .filter("twoDigits", function(){
    return function(d)
    {
      if(0 <= d && d < 10) return "0" + d.toString();
          if(-10 < d && d < 0) return "-0" + (-1*d).toString();
          return d.toString();

    }
  })
  .filter("isCheckin", function(){
    return function (check_in)
    {
      function twoDigits(d) {
          if(0 <= d && d < 10) return "0" + d.toString();
          if(-10 < d && d < 0) return "-0" + (-1*d).toString();
          return d.toString();
      }
      var d = new Date();
       var key = d.getUTCFullYear() + "-" + twoDigits(1 + d.getUTCMonth()) + "-" + twoDigits(d.getUTCDate())
       console.log('key - ' + key)
       if(!angular.isUndefined(check_in) && !angular.isUndefined(check_in[key]) && check_in[key])
       {
          return true;
       }else
          return false;
    }
  })
  .filter("transfer2Payment", function ($filter){
    return function (transfer, classes)
    {
      var payment = {};
      var selected_classes = $filter('filter')(classes, {isSelected:true});
      payment.amount = transfer.amount;
      payment.classes = [];
      selected_classes.forEach(function(item){
        payment.classes.push(item.class._id);
      })
      payment.date = new Date(transfer.date)
      payment.date.setHours(transfer.time.getHours())
      payment.date.setMinutes(transfer.time.getMinutes())
      //payment.date.setHours(transfer.hour)
      //payment.date.setMinutes(transfer.minute);
      payment.mark = transfer.mark
      return payment;
    }
  }).filter("paymentStatus", function(){
    return function(status)
    {
      switch(status)
      {
        case 1 : return "Pending";
        case 2 : return "Confirm";
        case 3 : return "Denial"
      }
    }
  })
  .filter("learningStatus", function(){
    return function(status)
    {
      switch(status)
      {
        case 0 : return "PENDING CONFIRMATION";
        case 1 : return "ENROLLED";
        case 2 : return "COMPLETED";
        case 3 : return "INCOMPLETE"
      }
    }
  })
  .filter("filterByMemberId", function(){
    return function (members, member_id)
    {
      
      var return_item = null
      members.forEach(function(item){
        if(item.member == member_id)
        {
          return_item =  item;
        }
      })
      return return_item;
    } 
  })
  .filter("isWorkshop", function(){
    return function (isWorkshop)
    {
      if(isWorkshop)
        return "Workshop";
      else
        return "Course";
    }
  })
  .filter("classCode", function ($filter){
    return function (class_item, skills)
    {
      var code = "";
      if(angular.isUndefined(class_item))
        return "";
      code = "L" + class_item.level
      if(class_item.type == 'workshop')
        code = code + "WS"
      else
      {
        var skill_code = skills.filter(function(skill){
          if(skill._id == class_item.skill)
            return true;
        })
        console.log(skill_code)
        if(skill_code.length > 0)
          code = code + skill_code[0].code;
      }
      console.log(class_item.start_date)
      if(!angular.isUndefined(class_item.start_date))
      {
        var fullyear = class_item.start_date.getUTCFullYear()  + "";
        if(class_item.type == "workshop")
        {
          code = code + class_item.name.toUpperCase().substr(0,6)
        }else
          code = code  + $filter('twoDigits')(class_item.start_date.getUTCMonth() + 1 ) + fullyear;
      }


      return code;
    }

  })
  .filter("code2type", function (){
    return function ( code)
    {
      if(code.substr(2,2) == "WS")
        return "workshop";
      else
        return "course"
    }
  })
  .filter("activeClass", function(){
    return function (is_active)
    {
      if(is_active)
        return "#3C763D"
      else
        return "red"
    }
  })
  .filter("days2Text", function(){
    return function (days)
    {
      var text = "";
      var _days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
      for(var i = 0 ; i < days.length; i++){
        
        if(days[i])
          text += _days[i] +  " "
      }
      return text;
    }
  })
  ;