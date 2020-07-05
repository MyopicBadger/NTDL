# The Goal

To write a version of the guitube app in node rather than python.

# The reasoning

I'm bored. I don't think it will particularly work better, since the basic component, youtube-dl is written in python and has proper native bindings, but it will be an experiment.

# Current Status

It more or less works, albeit with nothing like feature parity with the python version.

## Features Present:

* Downloads with youtube-dl
* Multiple concurrent downloads (NEW, not present in python version)

## Features Missing

* Imgur downloads
* Video playback
* Download progress information