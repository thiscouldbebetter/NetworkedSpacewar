Networked Spacewar
==================

A networked version of the classic game Spacewar, using Node.js and its library "socket.io".

![Screenshot](/Screenshots/Screenshot.png?raw=true "Screenshot")

To run the server:

1. Make sure Node.js is installed.
2. In a command prompt, navigate to the directory containing Server.js.
3. Run "npm install socket.io" within that directory.
4. Run "node Server.js".

To run a client:

1. Open Client.html in a web browser that runs JavaScript.
2. Specify the server URL, if necessary.
3. Specify a user name.
4. Click the connect button.

Alternately, the file Local.html implements a single-player, non-networked version for testing purposes.

To play:

Use the W, A, and D keys to turn and accelerate.  Use the F key to fire.  Use the J key to "jump" to another location instantly, provided that your ship has adequately recharged from the last attempt.
