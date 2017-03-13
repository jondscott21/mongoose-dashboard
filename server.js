// Require the Express Module
const express = require('express');
// Create an Express App
const app = express();
const mongoose = require('mongoose');
// This is how we connect to the mongodb database using mongoose -- "basic_mongoose" is the name of
//   our db in mongodb -- this should match the name of the db you are going to use for your project.
mongoose.connect('mongodb://localhost/dashboard');
let RatSchema = new mongoose.Schema({
    name: {
        type: String,
        required : [true, 'Please give the rat a name']

    },
    age: {
        type: Number,
        min: [1, 'make a rat that is already born'],
        max: [20, 'That rat is already dead from old age'],
        required: [true, 'A rat needs an age'],
    },
    fur: {
        type: String,
        required: [true, 'Please select a color for your rat']
    }
});
mongoose.model('Rat', RatSchema); // We are setting this Schema in our Models as 'Rat'
let Rat = mongoose.model('Rat'); // We are retrieving this Schema from our Models, named 'Rat'
// Require body-parser (to receive post data from clients)
const bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
const path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');
// Routes
// Root Request
mongoose.Promise = global.Promise;
app.get('/', function(req, res) {
    Rat.find({}, function (err, rats) {
        if (!err) {
            console.log('got rats!');
            res.render('index', {rats: rats})

        }
        else {
            console.log("couldn't retrieve rats");
            res.render('index')
        }
    });
});
app.get('/rats/new', function (req, res) {
    console.log('make a rat');
    res.render('make_rat');
});
app.get('/rats/:id', function (req, res) {
    Rat.findOne({_id: req.params.id}, function (err, rats) {
        if (!err){
            console.log('your rat');
            res.render('rats', {rats:rats})
        }
        else {
            console.log('no rats');

            res.render('rats',{rats: false});
        }

    })
});
app.get('/rats/edit/:id', function (req, res) {
    let rats = Rat.findOne({_id: req.params.id}, function (err, rats) {
        if (!err) {
            console.log('update a rat');
            res.render('update_rat', {rats: rats});
        }
        else {
            res.render('update_rat')
        }
    })
});
app.post('/add_rat', function(req, res) {
    console.log("POST DATA", req.body);
    let rat = new Rat({name: req.body.name, age: req.body.age, fur: req.body.fur});
    rat.save(function (err) {
        if (err) {
            console.log('Something went wrong');
            res.render('make_rat', {errors: rat.errors});
        }
        else {
            console.log('Added a rat!');
            res.redirect('/');
        }
    });

});
//***ADD UPDATE QUERY
app.post('/rats/update/:id', function (req, res) {
    Rat.update({}, {name:req.body.name, age:req.body.age, fur:req.body.fur}, {runValidators: true},function (err, rats) {
        if (!err){
            console.log('rat updated');
            res.redirect('/');
        }
        else {
            console.log('rat not updated');
            console.log(Rat.errors);
            res.render('update_rat', {errors: rat.errors, rats: false});
        }
    });
});
app.post('/rats/destroy/:id', function (req, res) {
    console.log('got to delete');
    Rat.remove({_id: req.params.id}, function (err, rats) {
        if (!err){
            console.log('deleted a rat');
            res.redirect('/');
        }
        else {
            console.log('rat stayed alive');
            res.redirect('/')
        }
    });
});
app.listen(8000, function() {
    console.log("listening on port 8000");
});

// GET '/mongooses/edit/:id' Should show a form to edit an existing mongoose.
// POST '/mongooses/:id' Should be the action attribute for the form in the above route (GET '/mongooses/edit/:id').
// POST '/mongooses/destroy/:id' Should delete the mongoose from the database by ID.