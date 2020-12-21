const downloaderMod = require('./downloader');
const http = require('http');
const fs = require('fs');
const path = require('path')
const moment = require('moment');
const express = require('express');
const { spawn } = require('child_process');

const app = express();
const hostname = '127.0.0.1';
const port = 3000;

const defaultConfig = {
	loaded: true,
	pythonCommand: 'python',
	youtubeCommand: 'youtube-dl',
	imgurCommand: '../imgur_downloader.py',
	downloadDirectory: 'video',
	stateFile: 'save.json',
	maxWorkerProcesses: 3
}
var downloader = downloaderMod.module;
var saveChangedSinceLastRead = true
var config = { loaded: false};



app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


function loadConfig() {
	if (!config.loaded) {
		try {
			let data = fs.readFileSync('config.json', 'utf8')
			config = JSON.parse(data);
			console.log(data)
		} catch (err) {
			config = defaultConfig;
			let data = JSON.stringify(config, null, '\t');

			fs.writeFile('config.json', data, (err) => {
				if (err) throw err;
				console.log('Config written to file');
			});
		}
		downloader.configure(config);
	}
}
loadConfig();

function checkInit() {
	if (saveChangedSinceLastRead) {
		loadFiles();
	}
}

function loadFiles() {
	console.log("Load Files...")
	fs.readFile(config.stateFile, (err, data) => {
		console.log("Load Files Complete");
		if (err) {
			console.log("Unable to load "+ config.stateFile);
		} else {
			var rawData = JSON.parse(data);
			//console.log(rawData)
			downloader.queue = rawData.queue;
		}
		console.log("Loaded", downloader.queue.length, "records");
		saveChangedSinceLastRead = false;
	});
}

function saveFiles() {
	let data = JSON.stringify(downloader, null, '\t');

	fs.writeFile(config.stateFile, data, (err) => {
		if (err) throw err;
		console.log('State written to '+ config.stateFile);
		saveChangedSinceLastRead = true
	});
}

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, 'dist/vue.html'))
})

app.get('/favicon.ico', function (req, res) {
	res.sendFile(path.join(__dirname, 'dist/favicon.ico'))
})

app.get('/queue.json', function (req, res) {
	if (saveChangedSinceLastRead) {
		loadFiles();
	}
	res.type('application/json')
	var fileQueue = downloader.queue.map(function (queueItem) {
		queueItem.output = ''
		return queueItem;
	});
	res.send(JSON.stringify(fileQueue));

})

app.post('/newEntry', function (req, res, next) {
	checkInit();
	console.log(req.body)
	if (req.body.date && req.body.url) {
		downloader.add({ queued: req.body.date, url: req.body.url, filename: req.body.url, status: 'Queued', summary: "" });
		console.log(`Current queue size is ${downloader.queue.length}`)
		saveFiles();
		res.json({ status: 'success', queue: downloader.queue })
	} else {
		res.json({
			status: 'error',
			error: 'Insufficient data provided',
			errorDetails: req.body
		})
	}
})

app.post('/remEntry', function (req, res, next) {
	checkInit();
	console.log(req.body)
	if (req.body.url) {
		downloader.remove(req.body)
		console.log(`Current queue size is ${downloader.queue.length}`)
		saveFiles();
		res.json({ status: 'success', queue: downloader.queue })
	} else {
		res.json({
			status: 'error',
			error: 'Insufficient data provided',
			errorDetails: req.body
		})
	}
})

app.post('/remAll', function (req, res, next) {
	checkInit();
	downloader.removeComplete()
	console.log(`Current queue size is ${downloader.queue.length}`)
	saveFiles();
	res.json({ status: 'success', queue: downloader.queue })
})

app.post('/retryEntry', function (req, res, next) {
	checkInit();
	console.log(req.body)
	if (req.body.url) {
		downloader.requeueByUrl(req.body.url)
		console.log(`Current queue size is ${downloader.queue.length}`)
		saveFiles();
		res.json({ status: 'success', queue: downloader.queue })
	} else {
		res.json({
			status: 'error',
			error: 'Insufficient data provided',
			errorDetails: req.body
		})
	}
})

app.post('/shutdown', function (req, res, next) {
	checkInit();
	console.log("Received Shutdown command");
	let data = JSON.stringify(downloader, null, '\t');

	fs.writeFile('save.json', data, (err) => {
		if (err) throw err;
		console.log('Data written to file');
		saveChangedSinceLastRead = true
		process.kill(process.pid, 'SIGTERM')
	});

})

// Make the content directory visible for the server
app.use(express.static('dist'))


var server = app.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});

process.on('SIGTERM', () => {
	server.close(() => {
		console.log('Process terminated')
	})
})