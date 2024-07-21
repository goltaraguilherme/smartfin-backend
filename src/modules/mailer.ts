const path = require('path')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
require('dotenv').config()

const user = process.env.EMAIL
const pass = process.env.EMAIL_PWD
//const host = process.env.HOST
//const port = process.env.PORTMAIL

const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user,
        pass, 
    },
    tls: {
        rejectUnauthorized: false
    }
})

transport.use('compile', hbs({
    viewEngine: {
        defaultLayout: undefined,
        partialsDir: path.resolve('./src/resources/mail/')
    },
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html'
}))

export default transport;