/*
	This Java Script Document contains the Core Game Engine for the Sokoban Puzzle Game.
*/

// Invocation of this function will instantiate our game engine. 
function GameEngine() {
	var _level;							// Stores the map object describing our simulated world.
	var _tiles;							// Stores the tileset (pieces) used to visualize our simulated world.
	var _canvas;						// This is the HTML5 canvas object used to render our scene in the browser.
	var _canvas_context;				// This stores the context of the canvas object.
	var _canvas_buffer;					// This creates an additional canvas used for buffering.
	var _canvas_buffer_context;			// This stores the context of our buffer canvas.
	
	this.interval = 50;				// How frequently we poll the keyboard for user input.
	
	this._ness = null; 					// Our main character in this Sokoban clone.
	
	this.initialRendering = null;
	
	this.start = function() {
		// Upon successful initialization of the game engine, load the current game.
		if (this.initializeGameEngine())
			this.loadCurrentGame();
	}
	
	// In this game, our main character is Ness from the Earthbound (Mother in Japan)
	// series. This function will return our main character Ness.
	this.getNess = function() {
		return this._ness;
	}
	
	this.initialStart = function(event) {
		if (_level.isLoaded && _tiles.isLoaded()) {
			document.sokobanGame.update(event);
			document.sokobanGame.render();
			
			clearInterval(document.sokobanGame.initialRendering); // The timer is no longer needed.
		}
	}
	
	// This function will update the game configuration depending on game events.
	this.update = function(event) {
		this._ness = _level.getNess();			// Determine Ness's location from the map.
		
		if (event)
			this.getNess().readKeys(event);	// Check for another keyboard event from the main character/user.
			this.render();
		
		_level.update();		// Update the map.
		
		if (_level.completed) {
			if (_level.level_number == 10) {	// The last level.
				// Do something if the game was completed.
				alert('CONGRATULATIONS!!! YOU COMPLETED ALL LEVELS!!!!');
				return;
			}
			
			// Congratulate the player for completing the level.
			alert('Congratulations!!! You have completed level ' + _level.level_number);
			
			// Play the victory chime.
			//var snd = new Audio('snd/level_beat.mp3');
			//snd.play();
			
			var next_level = _level.level_number + 1;
			$.cookie('sokoban', next_level, {expires: 7});
			document.sokobanGame.loadCurrentGame();
		}
	}
	
	this.render = function() {
		// First clear the canvas.
		_canvas_context.clearRect(0, 0, _canvas.width, _canvas.height);
		_canvas_buffer_context.clearRect(0, 0, _canvas.width, _canvas.height);
		
		// Render the map to the buffer.
		_level.render(_canvas_buffer_context);
		
		// Render the buffer to the screen.
		_canvas_context.drawImage(_canvas_buffer, 0, 0);
	}
	
	// When invoked, this memeber function will initialize our game engine.
	this.initializeGameEngine = function () {
		_tiles = new Tiles();		// Create an instance of our tiles.
		_level = new Level(_tiles);		// Create a map object instance.
		
		_canvas = document.getElementById('canvas');
		
		if (_canvas && _canvas.getContext) {
			_canvas_context = _canvas.getContext('2d');		// Create a 2D canvas context.
			
			// Ensure the canvas buffer has the same attributes as the canvas.
			_canvas_buffer = document.createElement('canvas');
			_canvas_buffer.width = _canvas.width;
			_canvas_buffer.height = _canvas.height;
			_canvas_buffer_context = _canvas_buffer.getContext('2d');
			
			return true; // Everything has been successful so far.
		}
		
		return false; // If we were not able to successfully create a canvas and buffer bail!
	}
	
	// Using a browser cookig, this function will determine
	// the last level completed then load its corresponding map.
	this.loadCurrentGame = function () {
		var last_level = '0';
		var cookie_data = $.cookie('sokoban');
		
		// Check whether the user has completed some levels.
		if (cookie_data != null) { // User has completed some levels.
			last_level = cookie_data;
		}
		else { // Create a new browser cookie that will expire in 7 days.
			$.cookie('sokoban', 0, {expires: 7}); 
		}
		
		_tiles.loadTiles();				// Load the necessary tiles.
		_level.loadMap(last_level);		// Load the current map.
		
		var sokoban = this;			// Our pointer to the game will now the the current GameEngine object.
		
		// Bind keyboard events to the game.
		$(document).bind('keydown', function(event) {
			sokoban.update(event);
			sokoban.render();
		});
		
		this.initialRendering = setInterval(this.initialStart, this.interval);
	}
}
