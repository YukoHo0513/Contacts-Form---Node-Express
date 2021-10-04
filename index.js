const express = require('express');
const app = express();
const knex = require('./db/client');


const path= require('path');
const methodOverride = require('method-override');

app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: true}))

const cookieParser = require('cookie-parser')
app.use(cookieParser());

app.use(methodOverride((request, response) => {
    if (request.body && request.body._method) {
        const method = request.body._method;
        return method;
    }
}))

app.use((request, response, next) => {
    const username = request.cookies.username;
    response.locals.username = "";
    if(username){
        response.locals.username = username;
        console.log(`Signed in as ${username}`);
    }
    next();
})

const logger = require('morgan');
app.use(logger('dev'));

app.set('view engine', 'ejs');
app.set('views', 'views');


app.get('/', (request, response) => {
    response.render('contact_form');
})

app.get('/thank_you', (request, response) => {
    response.render('thank_you');
})

app.post('/', (request, response) => {
    knex('contacts')
    .insert({
        name: request.body.name,
        address: request.body.address,
        department: request.body.department,
        message: request.body.message
    })
    .returning('*')
    .then(() => {
        response.redirect('/thank_you');
    })
})

app.get('/contacts', (request, response) => {
    
    knex('contacts')
    .orderBy('createdAt', 'desc')
    .then((data) => {
        const salesData = data.filter(data => data.department === "sales");
        const marketingData = data.filter(data => data.department === "marketing");
        const technicalData = data.filter(data => data.department === "technical");
        response.render('contacts', {
            result: data,
            sales: salesData, 
            marketing: marketingData,
            technical: technicalData
        })
    })
})

app.get('/contacts/:id', (request, response) => {
    const id = request.params.id;
    knex('contacts')
    .where('id', id) 
    .first()
    .then((data) => {
        response.render('each_contact', {list: data});
    })
})

app.delete('/contacts/:id', (request, response) => {
    const id = request.params.id;
    knex('contacts').where('id', id)
    .delete()
    .then(() => {
        response.redirect('/contacts');
    })
})

app.get('/contacts/:id/edit', (request, response) => {
    const id = request.params.id;
    knex('contacts')
    .where('id', id) 
    .first()
    .then((data) => {
        response.render('edit', {contact: data})
    })
})

app.patch('/contacts/:id', (request, response) => {
    const id = request.params.id;
    knex('contacts')
    .where('id', id) 
    .update({
        name: request.body.name,
        address: request.body.address,
        department: request.body.department,
        message: request.body.message        
    })
    .then(() => {
        response.redirect(`/contacts/${request.params.id}`)
    })
})

app.post('/sign_in', (request, response) => {
    const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24;
    const username = request.body.username;
    response.cookie('username', username, {maxAge: COOKIE_MAX_AGE});
    response.redirect('/');
})
app.post('/sign_out', (request, response) => {
    response.clearCookie('username');
    response.redirect('/');
})

const PORT = 3555;
const HOST = "localhost";

app.listen(PORT, HOST, () => {
    console.log(`The server is listening at ${HOST}: ${PORT}`); 
 })
 