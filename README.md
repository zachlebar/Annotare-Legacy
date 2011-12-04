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

##### Hem Server

Since Annotare is essentually a client-side Javascript app (based on Spine.js), you can run it with only a static-file host. One easy way to do this is to use the Hem bundler, inculded with Spine.js. First, install [node.js](node), [npm](npm), and [Spine.js](spine). You can follow this guide to help get up and running: [http://spinejs.com/docs/started](http://spinejs.com/docs/started).  After that, from your project root:

    cd annotare
    hem server

Hem will compile Annotare and start a server on [http://localhost:9294](http://localhost:9294).

##### Python Server

The Python server is the *real* Annotare server, and will eventually include syncing, backup, and image hosting. To make sure your system meets the required dependancies, from the project root directory, run: 

    sudo pip install -r requirements.txt
    
Next, start the local server by running:

    cd annotare
    python manage.py startserver
    
This will start up Bottle's built in dev server on 127.0.0.1:8000.  Head there in a web browser to start using Annotare.


[gruber]: http://daringfireball.net/
[md]: http://daringfireball.net/projects/markdown
[vim]: http://en.wikipedia.org/wiki/Vim_(text_editor)
[rands]: http://www.randsinrepose.com/archives/2007/11/11/the_nerd_handbook.html
