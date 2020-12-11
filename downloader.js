const { spawn } = require('child_process');

var downloader = {
	pool: 0,
	maxPool: 3,
	queue: [],
	defaultDownloadOptions: [],
	shellOptions: { cwd: 'video/' },

	alreadyQueued: function (newItem) {
		return newItem.url && this.queue.some(item => item.url == newItem.url);
	},

	add: function (item) {
		if (!this.alreadyQueued(item)) {
			this.queue.push(item);
		}
		this.beginNext()
	},

	beginNext: function () {
		if (this.pool < this.maxPool) {
			var queuedItems = this.queue.filter(item => item.status == 'Queued');
			console.log(`Looking for new job, currently ${queuedItems.length} of ${this.queue.length}`)
			if (queuedItems.length > 0) {
				var nextQueueItem = queuedItems[0];
				this.start([nextQueueItem.url].concat(this.defaultDownloadOptions), this.queue.indexOf(nextQueueItem));
			}
		}
	},

	remove: function (item) {
		if (this.alreadyQueued(item)) {
			var thisItem = this.queue.findIndex(currentItemByUrl => currentItemByUrl.url == item.url);
			if (this.queue[thisItem].status != "Starting..." && this.queue[thisItem].status != "In Progress...") {
				this.queue = this.queue.filter(currentItemByUrl => currentItemByUrl.url !== this.queue[thisItem].url)
			} else {
				console.log("Tried to remove active download -- no way to do this sensibly yet")
			}
		}
	},

	removeComplete: function () {
		this.queue = this.queue.filter(item => item.status != "Done");
	},


	requeueByUrl: function (url) {
		this.requeue(this.queue.findIndex(item => item.url == url));
	},

	requeue: function (index) {
		this.queue[index].status = 'Queued';
		this.queue[index].summary = '';
		this.queue[index].output = '';
		this.beginNext();
	},

	parseDataLine: function (dataString, index) {
		dataString = dataString.replace("\r", "").replace("\n", "").trim();
		this.queue[index].status = "In Progress...";
		// parse progress message
		if (dataString.includes('[download]') && dataString.includes("\%")) {
			this.queue[index].progressString = dataString.replace("[download] ", "");
			var progressArray = this.queue[index].progressString.trim().split(/\s+/);
			this.queue[index].progressPercent = progressArray[0];
			this.queue[index].fullSize = progressArray[2];
			this.queue[index].progressSpeed = progressArray[4];
			this.queue[index].eta = progressArray[6];
		}
		// parse in-progress filename 
		if (dataString.includes('[download] Destination: ')) {
			this.queue[index].filename = dataString.replace('[download] Destination: ', '');
		}
		// parse final filename
		if (dataString.includes('[ffmpeg] Merging formats into "')) {
			this.queue[index].filename = dataString.replace('[ffmpeg] Merging formats into "', '').replace('"', '');
		}

		// parse the "you've already downloaded this" message
		if (dataString.includes('[download] ') && dataString.includes("has already been downloaded and merged")) {
			this.queue[index].filename = this.queue[index].filename = dataString.replace('[download] ', '').replace('has already been downloaded and merged', '');
		}
		this.queue[index].title = this.queue[index].filename;
	},

	start: function (options, index) {
		var download = spawn('youtube-dl', options, this.shellOptions);
		this.queue[index].status = "Starting..."

		download.stdout.on('data', (data) => {
			var dataLines = data.toString().split(/\r|\n/);
			dataLines.forEach(element => this.parseDataLine(element, index));
		});

		download.stderr.on('data', (data) => {
			//console.error(`stderr: ${data}`);
			this.queue[index].errorMessage = data.toString();
			this.queue[index].status = 'Error'
		});

		download.on('close', (code) => {
			console.log(`child process exited with code ${code}`)
			if (code == 0) {
				this.queue[index].status = "Done"
			} else {
				this.queue[index].status = `Error: ${code}`
			}
			this.pool--;
			this.beginNext();
		});

		this.pool++;
	}
}

exports.module = downloader;