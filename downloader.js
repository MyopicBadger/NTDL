const { spawn } = require('child_process');


var downloader = {}

downloader.init = function(url, options={}}) {
  downloader.url = url;
}

downloader.add = function(url) {

}



downloader.start = function() {
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




return downloader;