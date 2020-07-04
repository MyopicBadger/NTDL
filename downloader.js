const { spawn } = require('child_process');


var downloader = {
	pool: 0,
	maxPool: 3,
	queue: [],
	defaultDownloadOptions: ['--print-json'],
	shellOptions: {cwd: 'video/'},

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
			//downloader.start(["https://www.youtube.com/watch?v=tDqjrqu4ZL0"])
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
			var thisItem = this.queue.findIndex(currentItemByUrl => currentItemByUrl.url == url)
			if (thisItem.status != "Starting..." && thisItem.status != "In Progress...") {
				this.queue = this.queue.filter(currentItemByUrl => currentItemByUrl.url !== thisItem.url)
				//} if (thisItem.status != "Starting...") { this.pool.some(poolWorker => poolWorker.spawnargs.some(args => args == item.url));
			} else {
				console.log("Tried to remove active download -- no way to do this sensibly yet")
			}
		}
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
		console.log(this.queue)
		console.log(this.index)
		this.queue[index].status = "Starting..."

		download.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
			this.queue[index].status = "In Progress..."
			this.queue[index].output = JSON.parse(data.toString());
			this.queue[index].filename = this.queue[index].output._filename
			this.queue[index].title = this.queue[index].output.title || this.queue[index].output.fulltitle;

		});

		download.stderr.on('data', (data) => {
			console.error(`stderr: ${data}`);
			this.queue[index].summary = data.toString();
			this.queue[index].status = 'Error'
		});

		download.on('close', (code) => {
			console.log(`child process exited with code ${code}`)
			this.queue[index].status = "Done"
			//this.pool = this.pool.filter(item => item != download);
			this.pool--;
			this.beginNext();
		});

		this.pool++;
	}
}

exports.module = downloader;
//return downloader;