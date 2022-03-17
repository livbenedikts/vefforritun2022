//Sample for Assignment 3
const express = require('express');

//Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');

//Use cors to avoid issues with testing on localhost
const cors = require('cors');

const app = express();
const apiPath = '/api/';
const version = 'v1';

//Port environment variable already set up to run on Heroku
let port = process.env.PORT || 3000;

//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());  

//Set Cors-related headers to prevent blocking of local requests
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

function checkAvailability(arr, val) {
    return arr.some(arrVal => val === arrVal);
  }

function checkAvailability2(val) {
    return genres.some(function(el) {
        console.log(val + " "+ el.val)
        return el.val === val;
    }); 
 }

//The following is an example of an array of two tunes.  Compared to assignment 2, I have shortened the content to make it readable
var tunes = [
    { id: '0', name: "Für Elise", genreId: '1', content: [{note: "E5", duration: "8n", timing: 0},{ note: "D#5", duration: "8n", timing: 0.25},{ note: "E5", duration: "8n", timing: 0.5},{ note: "D#5", duration: "8n", timing: 0.75},
    { note: "E5", duration: "8n", timing: 1}, { note: "B4", duration: "8n", timing: 1.25}, { note: "D5", duration: "8n", timing: 1.5}, { note: "C5", duration: "8n", timing: 1.75},
    { note: "A4", duration: "4n", timing: 2}] },

    { id: '3', name: "Seven Nation Army", genreId: '0', 
    content: [{note: "E5", duration: "4n", timing: 0}, {note: "E5", duration: "8n", timing: 0.5}, {note: "G5", duration: "4n", timing: 0.75}, {note: "E5", duration: "8n", timing: 1.25}, {note: "E5", duration: "8n", timing: 1.75}, {note: "G5", duration: "4n", timing: 1.75}, {note: "F#5", duration: "4n", timing: 2.25}] }
];

let genres = [
    { id: '0', genreName: "Rock"},
    { id: '1', genreName: "Classic"}
];

let nextTuneId = 3;
let nextGenreId = 2;


// constants for array contents in tune
const allowed = ['note',  'duration', 'timing'];

//Tunes endpoints

// 1. Read all tunes
app.get(apiPath + version + '/tunes', (req, res) => {
    let tunesArray = [];
    for (let i = 0; i < tunes.length; i++) {
        tunesArray.push({ id: tunes[i].id, name: tunes[i].name, genreId: tunes[i].genreId });
    }

    res.status(200).json(tunesArray);
});

app.get(apiPath + version +"/tunes?filter=<:genreName>", (req, res) => {
    console.log('URL Params:', req.params.genreName);
	console.log('Query Params:', req.query);
    return res.status(200).json({'message': "" });
        // for (let i = 0; i < tunes.length; i++) {
        //     if (tunes[i].genreName == req.params.genreName) {
        //         console.log('URL Params, blaaaaaa:', req.params.genreName);
        //         console.log('URL Params, tuneId:', req.params.tuneId);
        //         return res.status(200).json({'er ég að lokgg': "balll" });
        //     }
        // };
    res.status(404).json({'message': "Not Found" });
});

//  2. Read an individual tune
app.get(apiPath + version +"/genres/:genreId/tunes/:tuneId", (req, res) => {
    if (genres.some(o => o.id == req.params.genreId) == true){
        for (let i = 0; i < tunes.length; i++) {
            if (tunes[i].id == req.params.tuneId && tunes[i].genreId == req.params.genreId) {
                return res.status(200).json(tunes[i]);
            };
        };
    };
    return res.status(404).json({'message': "genre with id "+req.params.genreId + " does not exist"});
 });

//  3. Create a new tune

app.post(apiPath + version +"/genres/:genreId/tunes", (req, res) => {
    const keys = Object.keys(req.body.content)
    if (req.body === undefined || req.body.name.length === 0||req.body.name === undefined ||req.body.content === undefined) {
        return res.status(400).json({ message: 'Name and content is required in the request body.' });
    }
    else if (allowed.every(key => keys.includes(key)) == false) {
        return res.status(400).json({ message: 'All attributes of content are required' });
    }
    else {
        if (req.body.content.length === 0 || req.body.content ==="" ) {
            return res.status(400).json({ message:'Content array attributes must be non empty.' });
        }
    }if (genres.some(o => o.id == req.params.genreId) == false){
        return res.status(400).json({ "message": "No genre with id "+req.params.genreId +" exists."});
    }
    let newTune = {id: nextTuneId, name: req.body.name, genreId: req.params.genreId ,content: req.body.content}
    nextTuneId++;
    tunes.push(newTune);
    return res.status(201).json(newTune);
});

// 4. Partially update a tune
app.patch(apiPath + version +"/genres/:genreId/tunes/:tuneId", (req, res) => {
    if (req.body === undefined || (req.body.name === undefined && req.body.content === undefined && req.body.genreId === undefined)) {
        return res.status(400).json({ 'message': "To update a tune, all attributes are needed (name and description)." });
    }
    // check if tune in url exists
    else if (genres.some(o => o.id == req.params.genreId)== false){
        return res.status(400).json({ "message": "No genre with id "+req.params.genreId +" exists."});
    }
    else if (genres.some(o => o.id == req.body.genreId)== false){
        return res.status(400).json({ "message": "No genre with id "+req.body.genreId +" exists."});
    }
    // check if old tune id is corresponding to the tuneid
    else{
        for (let i = 0; i < tunes.length; i++) {
            if (tunes[i].id == req.params.tuneId && tunes[i].genreId == req.params.genreId) {
                if (req.body.name !== undefined) {
                    tunes[i].name = req.body.name;
                }
                if (req.body.content !== undefined) {
                    tunes[i].content = req.body.content;
                }
                if (req.params.genreId !== undefined) {
                    tunes[i].genreId = req.body.genreId;
                }
                return res.status(200).json(tunes[i]);
            }else {
                res.status(404).json({'message': "Tune with id " + req.params.tuneId + " and genreid " + req.params.genreId + " do not match"});
            }
    }} 
});


//  GENRE ENDPOINTS

// 1. Read all genres
// Returns an array of all genres (with all attributes).
app.get(apiPath + version +'/genres', (req, res) => {
    res.status(200).json(genres);
});

// 2. Create a new genre
app.post(apiPath + version +'/genres', (req, res) => {
    if (req.body === undefined || req.body.genreName === undefined) {
        return res.status(400).json({ 'message': "Genres require a name." });
    }
    else {
        for (let i=0;i<genres.length;i++){
            if (genres[i].genreName.toLowerCase() === req.body.genreName.toLowerCase()){
                res.status(400).json({ 'message': "Genre "+genres[i].genreName+ " already exists." });
                return;
            }}
        let newGenre = {id: nextGenreId, genreName: req.body.genreName};
        genres.push(newGenre);
        nextGenreId++;

        return res.status(200).json(newGenre);
    }

});
// 3. Delete a genre


//Start the server
app.listen(port, () => {
    console.log('Tune app listening on port + ' + port);
});