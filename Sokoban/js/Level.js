/*
	This source implements the Map object to be used for rendering the levels in our 
	game world.
*/

function Level(tiles) {
	// Our Map object's member variables.
	this._level = null;
	this._num_goals = 0;
	this._goals_achieved = 0;
	this._width = 0;
	this._height = 0;
	this._ness_x = 0;
	this._ness_y = 0;
	this.level_number = 0;
	this.completed = false;
	this.on_screen_width = 0;
	this.on_screen_height = 0;
	this.Tiles = tiles;
	var _level_config = new LevelInfo(this);
	this.isLoaded = false;
	
	// This updates the game configuration if the goals have been reached.
	this.update = function() {
		//alert('num_goals = ' + this._num_goals);
		if (this._num_goals > 0 && this._goals_achieved == this._num_goals) {
			// Reset the animation sequence.
			this.Tiles.toggle_up = 0;
			this.Tiles.toggle_down = 0;
			this.Tiles.toggle_left = 0;
			this.Tiles.toggle_right = 0;
			
			this.completed = true;
		}
			
		_level_config.update();
	}
	
	// This function will render our map.
	this.render = function(canvas_context) {
		var canvas_x_pos = 0;
		var canvas_y_pos = 0;
		var tile_width = 48;
		var tile_height = 48;
		
		for (var rows = 0; rows < this._height; rows++) { // For all rows in the map.
			canvas_x_pos = 0;
			
			for (var cols = 0; cols < this._width; cols++) { // For all columns in the map.
				var image = this._level[cols][rows].getTile();
				if (image != null) // Render an image.
					canvas_context.drawImage(image, canvas_x_pos, canvas_y_pos);
				else { // Render a rectangle.
					canvas_context.fillStyle = this._level[cols][rows].getFillStyle();
					canvas_context.fillRect(canvas_x_pos, canvas_y_pos, tile_width, tile_height);
				}	
				canvas_x_pos += tile_width;
			}
			canvas_y_pos += tile_height;
		}
		this.on_screen_width = canvas_x_pos;
		this.on_screen_width = canvas_y_pos;
		_level_config.render(canvas_context);
	}
	
	// This member function will load the map specified by level_number.
	// It essentially reinitializes everything.
	this.loadMap = function(level_number) {
		this._level = null;
		this._num_goals = 0;
		this._goals_achieved = 0;
		this._width = 0;
		this._height = 0;
		this._ness_x = 0;
		this._ness_y = 0;
		this.completed = false;
		this.isLoaded = false;
		
		var level = 'level_' + level_number + '.xml';
		
		$.ajax({
			type: 'GET',
			url: level,
			dataType: 'xml',
			success: this.parseMap,
			context: this
		});
	}
	
	// Return Ness's current location.
	this.getNess = function() {
		if (this._level != null)
			return this._level[this._ness_x][this._ness_y];
	}
	
	// This function will parse an xml file to build the current map.
	this.parseMap = function(xml_file) {
		this.level_number = parseFloat($(xml_file).find('Level').attr('Number'));
		this._width = parseFloat($(xml_file).find('Level').attr('Width'));
		this._height = parseFloat($(xml_file).find('Level').attr('Height'));
		
		//alert("Width = " + this._width + ", Height = " + this._height + ", Number = " + this.level_number );
		
		// Allocate the space for our map array.
		this._level = new Array(this._width);
		
		for (var cols = 0; cols < this._level.length; cols++)
			this._level[cols] = new Array(this._height);
			
		var rows = 0;
		var level_ptr = this._level;
		var level_object_ptr = this;
		var level_width = this._width;
		
		$(xml_file).find('Row').each(function() {
			var wall = false;
			var xml_file_row = $(this).text();
			
			for (var cols = 0; cols < level_width; cols++) {
				// Rows less than the map width are filled with empty slots.
				if (cols >= xml_file_row.length)
					level_ptr[cols][rows] = new Empty();
				else {
					switch (xml_file_row[cols]) {
						case ' ':
							if (wall)
								level_ptr[cols][rows] = new Floor();
							else
								level_ptr[cols][rows] = new Empty();
							break;
						case '#':
							level_ptr[cols][rows] = new Wall();
							wall = true;
							break;
						case 'M':
							level_ptr[cols][rows] = new Mushroom();
							wall = true;
							break;
						case '$':
							level_ptr[cols][rows] = new Water();
							break;
						case '.':
							level_ptr[cols][rows] = new Goal();
							level_object_ptr._num_goals++;
							break;
						case '@':
							level_ptr[cols][rows] = new Ness(level_object_ptr);
							level_object_ptr._ness_x = cols;
							level_object_ptr._ness_y = rows;
							break;
						case '*':
							level_ptr[cols][rows] = new WaterOnGoal();
							level_object_ptr._goals_achieved++;
							level_object_ptr._num_goals++;
							break;
						case '+':
							var ness = new Ness(level_object_ptr);
							level_ptr[cols][rows] = ness;
							ness.isOnGoal = true;
							level_object_ptr._ness_x = cols;
							level_object_ptr._ness_y = rows;
							break;
						case '=':
							level_ptr[cols][rows] = new Empty();
							break;
						default:
					}
				}
				level_ptr[cols][rows].Tiles = level_object_ptr.Tiles;
			}
			rows++;
		});
		this.isLoaded = true;
	}
}