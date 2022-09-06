const path = require('path')
const express = require('express')
const hbs = require('hbs')
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const sendMail = require('./mail.js')

const app = express()

const publicDirectoryPath = path.join(__dirname,'./public')
const viewsPath = path.join(__dirname,'./views')
app.set('view engine','hbs')
app.set('views',viewsPath)
app.use(express.static(publicDirectoryPath))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('',(req,res) =>{
    res.sendFile(path.join(__dirname,'./views/contact.html'))
})

app.use(express.urlencoded({
    extended: false
}))

app.use(express.json())

app.post('/email',(req,res) =>{
    //send email here
    const { email, name} = req.body
    console.log('Data: ',req.body)

    sendMail(email, name, function(err,data) {
        if(err){
            res.status(500).json({message : 'Internal error'})
        }else{
            res.json('Email sent')
        }
    })
})

//unsure code

app.get('/home',(req,res) =>{
    res.render('index')
})

app.get('/hospital',(req,res) =>{
    res.render('hospital_finder')
})

app.get('/restaurant',(req,res) =>{
    res.render('restaurant_finder')
})

app.get('/mall',(req,res) =>{
    res.render('mall_finder')
})

app.get('/bank',(req,res) =>{
    res.render('bank_finder')
})


//server
app.listen(3000,() =>{
    console.log('Server is up on port 3000')
})