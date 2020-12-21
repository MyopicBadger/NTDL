# The Goal

To write a version of the guitube app in node rather than python.

# The reasoning

I'm bored. I don't think it will particularly work better, since the basic component, youtube-dl is written in python and has proper native bindings, but it will be an experiment.

# Current Status

It more or less works, albeit with partial feature parity with the python version.

It's currently not quite as easy to configure, but it has most of the important features. I don't use the built in video player much, it turns out. Once I've done some UI work on the front end, I'll probably switch over to use this rather than the python version, as the ability to have multiple simultaneous downloads is useful and adding it to the python version would need more of a refactor than I fancy doing.

## Features Present:

* Downloads with youtube-dl
* Multiple concurrent downloads (NEW, not present in python version)
* Imgur image gallery downloads

## Features Missing

* Video playback