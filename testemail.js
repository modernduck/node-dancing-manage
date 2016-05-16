var Mailer = require('./libs/mailer');
Mailer.sendMailByTemplate({
				to : "sompop.kulapalanont@gmail.com",
				subject : "Welcome to The Hop",
				firstname : "sompop",
				link : ("http://128.199.231.66:3000/#/validate/113/")

			},"mail_templates/registration.html",  function(){
				console.log('done email')
			})