const nodemailer = require('nodemailer')
const mailGun = require('nodemailer-mailgun-transport')


const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    requireLS: true,
    auth:{
        user: 'navigetter@gmail.com',
        pass: '123@Navigetter'
    },
    tls:
    {
      rejectUnauthorized: false
    }

})

const sendMail = (email,name,cb) =>{
    const mailOptions ={
        from: 'navigetter@gmail.com',
        to: email,
        subject: 'Navigetter registration',
        text: 'Hi '+name+', Thanks for registering with Navigetter'
    }
    
    transporter.sendMail(mailOptions, function(err,data){
        if(err){
            cb(err,null)
        }else{
            cb(null,data)
        }
    })
}

module.exports = sendMail