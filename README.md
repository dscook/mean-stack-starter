# README #

### Overview ###

An end-to-end MEAN stack template project with a pre-configured build system.  The project contains the following:

* A mongo instance that starts when the code is run.
* Mongoose MongoDB schema support, an example is in the `models` directory.
* Starting of the express server and initialisation of NodeJS, see the `server.js` file.
* RESTful service support, an example is in the `routes` directory.
* AngularJS single page application, sample code in the `public` directory.
* AngularJS ui-router support, see the `public/modules` directory.
* SASS support, see the `public/modules/scss` directory.
* Foundation for Apps HTML/CSS framework, see http://foundation.zurb.com/apps/.

### Limitations ###

The Gulp build system will only work correctly on *nix machines (i.e. Linux and Mac).  On Windows it is advisable to install VirtualBox and run a Linux VM to utilise this codebase.

### Installation 

#### Install global dependencies... on Ubuntu 14.04 ###

* Install java: `sudo apt-get install default-jre`
* Install git: `sudo apt-get install git`
* Install nodejs: `sudo apt-get install nodejs`
* Setup symbolic link due to node name clash: `sudo ln -s /usr/bin/nodejs /usr/bin/node`
* Install npm: `sudo apt-get install npm`
* Install mongodb: `sudo apt-get install mongodb`
* Install node global modules: `sudo npm install -g bower gulp protractor`
* Install the latest version of the selenium web driver: `sudo webdriver-manager update`

#### Install global dependencies... on OSX ###

* Install [Homebrew](http://brew.sh/) (if you haven't already got it): `ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`
* Install nodejs: `brew install nodejs`
* Install npm: `brew install npm`
* Install mongodb: `brew install mongodb`
* Install node global modules: `sudo npm install -g bower gulp protractor`

#### Clone the project and install local dependencies:

* Clone the repository : `git clone https://github.com/dscook/mean-stack-starter.git`
* Change to the project base directory: `cd mean-stack-starter`
* Install node local modules: `npm install`
* Install front-end dependencies: `bower install`

### Usage ###

To run the code, note that changes in the back and front-end code will be reflected when utilising this command:

* `gulp`

Naviate to localhost:8080 in a browser to view the app.

To run the end-to-end system tests:

* `gulp tests`

### Known Issues ###

* On `bower install` the following error is thrown: `Error: EACCES, permission denied '<path-to-home-dir>/.config/configstore/bower-github.yml' You don't have access to this file.`

Running the following command, replacing `<username>` with the appropriate values, should resolve the issue.

`sudo chown -R <username>:<username> ~/.config/configstore/`
