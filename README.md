Battleship
==========

AI competition built on Node.js. Players create bots in JavaScript. 

 - Documentation is included in the framework.

 - Framework installs like any other Node.js application. Download source code and run npm install from the command line. Note that it is currently setup to run on Azure/IISNode so you would need to tweak the port setting in app.js in order to run in another environment.

 - If you wish to run this on a remote server, I suggest switching to the 'Remote' configuration which uses Persona to authenticate users and filter them by email address domain. This involves replacing `app.js` with `app.remote.js` and `views\layout.jade` with `views\layout.remote.jade`.


 - Battles can be run in **Fast** mode or **Visual** mode (screenshots below). Visual mode runs three games and allows you to step through them at various speeds.

## Fast Mode ##

<img alt="Fast Mode Screenshot" src="https://raw.github.com/gotdibbs/Battleship/master/fast.png" style="border: 1px solid #444;" />

## Visual Mode ##

<img alt="Visual Mode Screenshot" src="https://raw.github.com/gotdibbs/Battleship/master/visual.png" style="border: 1px solid #444;" />

