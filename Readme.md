Networked Spacewar
==================

A networked version of the classic game Spacewar, using Node.js and its library "socket.io".

![Screenshot](Screenshot.png?raw=true "Screenshot")

To run the server:

1. Make sure a compatible version of Node.js is installed.  As of this writing, version 14 is recommended.
2. In a command prompt, navigate to the directory containing Server.js.
3. Run "npm install socket.io" within that directory.
4. Run "node Server.js".

To run a client:

1. Open Client.html in a web browser that runs JavaScript.
2. Specify the server URL, if necessary.
3. Specify a valid user name.  The users "one" and "two" are built in.
4. Enter the password for the user.  For "one" and "two", this is "Password1!";
4. Click the connect button.

Alternately, the file Local.html implements a single-player, non-networked version for testing purposes.

To play:

Use the W, A, and D keys to turn and accelerate.  Use the F key to fire.  Use the J key to "jump" to another location instantly, provided that your ship has adequately recharged from the last attempt.
