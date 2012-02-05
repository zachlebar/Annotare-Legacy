# ANNOTARE #
- - -
A personal, digital notebook.
- - -

## Why Annotare Exists ##
Hi, my name is Zach LeBar. And I am a nerd. Not simply a geek, but a full on, hardcore nerd. This file, it's written in a markup language designed by a guy named [John Gruber][gruber]. It's called [Markdown][md], and I write just about everything in its syntax. I think that qualifies me as a nerd. This file was created through the command line, and edited using [vim][vim]. I'm pretty sure that qualifies me as a nerd. I have an insatiable desire to be eagerly working on a "project" at all time. Go read [this][rands] article by Michael Lopp. He explains this phenomenon extremely well.

All of those are contributing factors to Annotare's creation. Annotare exists because I need a project. It's goals and purpose are tied up in my intense nerdiness. Annotare, at its heart, is simply a digital notebook. The concept is nothing new. It's been around since digital things were first created. But I've never been satisfied with any of the iterations out there of this idea, a "digital notebook". Because I'm a nerd, I've chosen to build my own version of the digital notebook. And I'm calling it Annotare.

## Getting Started
Annotare is designed to be run locally, for a single user. Because of that, authentication, users, and permissions don't actually exist.  Currently, in place of a more robust db, documents are **ONLY IN BROWSER LOCALSTORAGE.** This is currently being fixed so the notes are stored as flat files by syncing to the server, but until then don't be sure you'll ever see any of your notes again.

#### Getting up and running
*These instructions are written assuming you're running a sane operating system, such as Mac OS X or Linux, and that you're comfortable with a terminal. If you're running Windows and can't figure out how to make this work, please consider using OneNote instead.* 

##### Compiling form Source
Annotare is written in CoffeeScript and based on the [Flakey.js framework by Craig Weber][flakey]. The build system is based on CoffeeScript's included Cake build system. To compile from source, open a terminal in the root of this repo and run:

    cd annotare
    cake full_build
    
The Cakefile includes these tasks:
- **build_js**: Build the src/ directory into public/annotare.js
- **build_css**: Build css/ into public/annotare.css
- **minify_js**: Use Google's Closure compiler to minify public/annotare.js into public/annotare.min.js
- **full_build**: The same as running build_css, build_js, and minify_js
- **watch**: Watches src/ and css/ directories and re-compiles whenever a file changes.

##### Python Server
The Python server (tested with Python 2.7.2 on Mac OSX) is what serves the app to your browser and backs up your data. To make sure your system meets the required dependancies, from the project root directory, run:

    sudo pip install -r requirements.txt
    
Next, start the local server by running:

    cd annotare/server/
    chmod 755 manage.py
    ./manage.py startserver
    
This will start up Bottle's built in dev server on localhost:8888.  Head there in a web browser to start using Annotare.


[gruber]: http://daringfireball.net/
[md]: http://daringfireball.net/projects/markdown
[vim]: http://en.wikipedia.org/wiki/Vim_(text_editor)
[rands]: http://www.randsinrepose.com/archives/2007/11/11/the_nerd_handbook.html
[flakey]: http://flakey.crgwbr.com