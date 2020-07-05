const { spawn } = require('child_process');

var downloader = {
	pool: 0,
	maxPool: 3,
	queue: [],
	defaultDownloadOptions: ['--print-json'],
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

	start: function (options, index) {
		var download = spawn('youtube-dl', options, this.shellOptions);
		this.queue[index].status = "Starting..."

		download.stdout.on('data', (data) => {
			//console.log(`stdout: ${data}`);
			this.queue[index].status = "In Progress..."
			this.queue[index].output = JSON.parse(data.toString());
			if (this.queue[index].output._filename && this.queue[index].filename == this.queue[index].url) {
				this.queue[index].filename = this.queue[index].output._filename
			}
			this.queue[index].title = this.queue[index].output.title || this.queue[index].output.fulltitle;

		});

		download.stderr.on('data', (data) => {
			//console.error(`stderr: ${data}`);
			this.queue[index].errorMessage = data.toString();
			this.queue[index].status = 'Error'
		});

		download.on('close', (code) => {
			console.log(`child process exited with code ${code}`)
			if(code == 0) {
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