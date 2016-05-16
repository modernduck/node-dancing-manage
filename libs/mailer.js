var nodemailer = require("nodemailer");
var wellknown = require('nodemailer-wellknown');
var fs = require('fs')
var config = wellknown('Zoho');
config.auth = {
	user :"registration@bangkokswing.com",
	pass :"252/2silom"
}
var smtpTransport = nodemailer.createTransport(config);

var mailOptions = {
	from: "Registration <registration@bangkokswing.com>",
	to: "sompop.kulapalanont@gmail.com",
	subject :"Test smtp",
	text :"yo",
	html :"<b>Zup</b>"
}
module.exports = {
	config : config,
	sendMail : function( options, callback){
		smtpTransport.sendMail(options, callback);
	},
	sendMailByTemplate : function(data, template, callback){

		fs.readFile(template, 'utf8', function(err, file){

			var res = file
			for(var k in data)
			{	
				var regex = new RegExp( "{{" + k + "}}", 'i')
				res = res.replace(regex, data[k]);
			}
			var options = {
				from: "Registration <registration@bangkokswing.com>",
				to: data.to,
				subject :data.subject,
				
				html :res
			}
			//var res = file.replace(/{{firstname}}/i, "Sompop");
			console.log()
			console.log(res)
			smtpTransport.sendMail(options, callback);
		})
		



	}

}
/*smtpTransport.sendMail(mailOptions, function(err, res){
	if(err)
		console.log(err)
	else
		console.log(res.message);
});*/
