const http = require('http');
const fs = require('fs');
const path = require('path')
const moment = require('moment');
const express = require('express');
const { spawn } = require('child_process');

const app = express();
const hostname = '127.0.0.1';
const port = 3000;

var subject;

var downloader = {
	options: {},
	init: function (options = {}) {
		options = this.options;
	},
	add: function (url) {

	},
	start: function (url) {
		const download = spawn('youtube-dl', ["https://www.youtube.com/watch?v=tDqjrqu4ZL0"]);
		download.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});
		download.stderr.on('data', (data) => {
			console.error(`stderr: ${data}`);
		});
		download.on('close', (code) => {
			console.log(`child process exited with code ${code}`);
		});
		return download;
	}
}


app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

function checkInit() {
	if (!subject) {
		subject = {};
	}
	if (!subject.queue) {
		subject.queue = [];
	}
	if (!subject.historic) {
		subject.historic = [];
	}
}

function loadFiles() {
	checkInit();
	console.log("Load Files...")
	fs.readFile('save.json', (err, data) => {
		console.log("Load Files Complete")
		if (err) {
			console.log("Unable to load save.json");
			subject = { queue: [] }
		} else {
			subject = JSON.parse(data);
		}
		console.log("Loaded", subject.historic.length, "records");
	});
}

function saveFiles() {
	let data = JSON.stringify(subject, null, '\t');

	fs.writeFile('save.json', data, (err) => {
		if (err) throw err;
		console.log('Data written to file');
	});
}

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, 'dist/vue.html'))
})

app.get('/favicon.ico', function (req, res) {
	res.sendFile(path.join(__dirname, 'dist/favicon.ico'))
})

app.get('/queue.json', function (req, res) {
	checkInit()
	res.type('application/json')
	res.send(JSON.stringify(subject.queue));
	loadFiles();
})

// app.post('/historyByDate.json', function (req, res) {
//   console.log("Got start date:", req.body.startDate)
//   res.type('application/json')
//   res.send(JSON.stringify(subject.historic.filter(function (element) {
//     return moment(element.x).isAfter(req.body.startDate)
//   })));
//   loadFiles();
// })

app.post('/newEntry', function (req, res, next) {
	checkInit();
	console.log(req.body)
	if (req.body.date && req.body.url) {
		subject.queue.push({ queued: req.body.date, url: req.body.url, status: 'Queued' });
		console.log(`Current queue size is ${subject.queue.length}`)
		saveFiles();
		res.json({ status: 'success' })
	} else {
		res.json({
			status: 'error',
			error: 'Insufficient data provided',
			errorDetails: req.body
		})
	}
})

// Make the content directory visible for the server
app.use(express.static('dist'))


var server = app.listen(port, hostname, () => {
	//loadFiles()
	console.log(`Server running at http://${hostname}:${port}/`);
});