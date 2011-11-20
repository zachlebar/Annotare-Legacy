# ANNOTARE #
- - -
A personal, digital notebook.
- - -

## Why Annotare Exists ##

Hi, my name is Zach LeBar. And I am a nerd. Not simply a geek, but a full on, hardcore nerd. This file, it's written in a markup language designed by a guy named [John Gruber][gruber]. It's called [Markdown][md], and I write just about everything in its syntax. I think that qualifies me as a nerd. This file was created through the command line, and edited using [vim][vim]. I'm pretty sure that qualifies me as a nerd. I have an insatiable desire to be eagerly working on a "project" at all time. Go read [this][rands] article by Michael Lopp. He explains this phenomenon extremely well.

All of those are contributing factors to Annotare's creation. Annotare exists because I need a project. It's goals and purpose are tied up in my intense nerdiness. Annotare, at its heart, is simply a digital notebook. The concept is nothing new. It's been around since digital things were first created. But I've never been satisfied with any of the iterations out there of this idea, a "digital notebook". Because I'm a nerd, I've chosen to build my own version of the digital notebook. And I'm calling it Annotare.

## Getting Started

Annotare is designed to be run locally, for a single user. Because of that, authentication, users, and permissions don't actually exist.  Currently, in place of a more robust db, documents are stored as individual JSON files in the annotare/documents/ folder. This isn't ideal, but for dev purposes it works fine (and will be fixed eventually).

#### Getting up and running

*These instructions are written assuming you're running a sane operating system, such as Mac OS X or Linux, and that you're comfortable with a terminal. If you're running Windows and can't figure out how to make this work, please consider using OneNote instead.* 

To make sure your system meets the required dependancies, from the project root directory, run: 

    sudo pip install -r requirements.txt
    
Next, start the local server by running:

    cd annotare
    python manage.py startserver
    
This will start up Bottle's built in dev server on 127.0.0.1:8000.  Head there in a web browser to start using Annotare.


[gruber]: http://daringfireball.net/
[md]: http://daringfireball.net/projects/markdown
[vim]: http://en.wikipedia.org/wiki/Vim_(text_editor)
[rands]: http://www.randsinrepose.com/archives/2007/11/11/the_nerd_handbook.html
