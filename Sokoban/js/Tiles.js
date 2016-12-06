/*
	This class implements the Tile objects.
*/

function Tiles() {
	this.Floor = new Image();
	this.Mushroom = new Image();
	this.Wall = new Image();
	this.Water = new Image();
	this.Goal = new Image();
	
	// Create a seperate image for each frame of Ness's animation.
	this.Ness = new Image();
	this.Ness_up_1 = new Image();
	this.Ness_up_2 = new Image();
	this.Ness_down_1 = new Image();
	this.Ness_down_2 = new Image();
	this.Ness_left_1 = new Image();
	this.Ness_left_2 = new Image();
	this.Ness_right_1 = new Image();
	this.Ness_right_2 = new Image();
	
	this.WaterOnGoal = new Image();
	this.Empty = null;
	
	var _num_images = 0;
	
	this.toggle_up = 0;
	this.toggle_down = 0;
	this.toggle_left = 0;
	this.toggle_right = 0;
		
	// This member function will handle loading the image tile data.
	this.loadTiles = function() {
		_num_images = 0;
		
		// Loop through all the member variables to load their image data.
		for (var tile_type in this) {
			if (this[tile_type] != null) {
				this[tile_type].onLoad = function() {
					_num_images++;
				}
			}
		}
	
		// As pointed out in the FelineSoft Blogs at:
		// http://www.felinesoft.com/blog/index.php/2010/09/accelerated-game-programming-with-html5-and-canvas/
		// These following is done to allow images to be cached in the Google Chrome browser,
		// Essentially by assigning each image source to be null at first.
		this.Wall.src = '';
		this.Mushroom.src = '';
		this.Water.src = '';
		this.Goal.src = '';
		this.Ness.src = '';
		this.Ness_up_1.src = '';
		this.Ness_up_2.src = '';
		this.Ness_down_1.src = '';
		this.Ness_down_2.src = '';
		this.Ness_left_1.src = '';
		this.Ness_left_2.src = '';
		this.Ness_right_1.src = '';
		this.Ness_right_2.src = '';
		this.WaterOnGoal.src = '';
		this.Floor.src = '';
	
		// Now the images can be assigned the actual data, as the above has been applied to allow data caching.
		this.Wall.src = 'img/wall_tile.png';
		this.Mushroom.src = 'img/mushroom.png';
		this.Water.src = 'img/water_jug.png';
		this.Goal.src = 'img/goal.png';
		this.Ness.src = 'img/ness_down_1.png';
		this.Ness_up_1.src = 'img/ness_up_1.png';
		this.Ness_up_2.src = 'img/ness_up_2.png';
		this.Ness_down_1.src = 'img/ness_down_1.png';
		this.Ness_down_2.src = 'img/ness_down_2.png';
		this.Ness_left_1.src = 'img/ness_left_1.png';
		this.Ness_left_2.src = 'img/ness_left_2.png';
		this.Ness_right_1.src = 'img/ness_right_1.png';
		this.Ness_right_2.src = 'img/ness_right_2.png';
		this.WaterOnGoal.src = 'img/water_jug_goal.png';
		this.Floor.src = 'img/floor.png';
	}
	
	// Only 6 of the 7 tile types will be images.
	// This function delegates the number of actual image tiles.
	this.isLoaded = function() {
		return _num_images == 6;
	}
}

function Ness(level) {
	this.getTile = function() {
		return this.Tiles.Ness;
	}
	
	// List of possible movements for Ness.
	this.directions = {'up': 0, 'down': 1, 'left': 3, 'right': 4};
	
	this.moves = 0;
	this.pushes = 0;
	
	this.isOnGoal = false;
	
	this._level = level;
	var _ness = this;
	
	this.readKeys = function(event) {
		var keyID = event.keyCode;
		
		switch(keyID) {
			case 38: // Up.
				this.move(this.directions.up);
				break;
			case 40: // Down.
				this.move(this.directions.down);
				break;
			case 37: // Left.
				this.move(this.directions.left);
				break;
			case 39: // Right.
				this.move(this.directions.right);
				break;
			default:
		}
	}
	
	this.checkMove = function(current_tile, next_tile) {
		var move_to = current_tile.constructor;
		
		// Ness cannot move through walls.
		if (move_to == Wall || move_to == Mushroom)
			return false;
			
		var next_object = next_tile.constructor;
		
		if ((move_to == Water || move_to == WaterOnGoal) && (next_object == Wall || next_object == Mushroom || next_object == Water || next_object == WaterOnGoal)) {
			return false;
		}
		return true; // Indeed it was a valid move.
	}
	
	this.moveWater = function (current_tile, next_tile, x_pos, y_pos) {
		this.pushes++;
		
		var old_tile = current_tile.constructor;
		var new_tile = next_tile.constructor;
		
		if (new_tile == Goal) { // We just moved onto a goal tile.
			this._level._level[x_pos][y_pos] = new WaterOnGoal();
			if (old_tile == Water)
				this._level._goals_achieved++;
		}
		else { // We just moved off of a goal tile.
			this._level._level[x_pos][y_pos] = new Water();
			if (old_tile == WaterOnGoal)
				this._level._goals_achieved--;
		}
		this._level._level[x_pos][y_pos].Tiles = this.Tiles;
	}
	
	this.move = function(direction) {
		var old_x = this._level._ness_x;
		var old_y = this._level._ness_y;
		
		var new_x = this._level._ness_x;
		var new_y = this._level._ness_y;
		
		var next_x = this._level._ness_x;
		var next_y = this._level._ness_y;
		
		//this.Tiles.Ness.src = ''; // Again this is done for caching purposes.
		switch (direction) {
			case this.directions.up:
				new_y--;
				next_y -= 2;
				if (this.Tiles.toggle_up) {
					this.Tiles.Ness = this.Tiles.Ness_up_2;
					this.Tiles.toggle_up = 0;
				}
				else {
					this.Tiles.Ness = this.Tiles.Ness_up_1;
					this.Tiles.toggle_up = 1;
				}
				break;
			case this.directions.down:
				new_y++;
				next_y += 2;
				if (this.Tiles.toggle_down) {
					this.Tiles.Ness = this.Tiles.Ness_down_2;
					this.Tiles.toggle_down = 0;
				}
				else {
					this.Tiles.Ness = this.Tiles.Ness_down_1;
					this.Tiles.toggle_down = 1;
				}
				break;
			case this.directions.left:
				new_x--;
				next_x -= 2;
				if (this.Tiles.toggle_left) {
					this.Tiles.Ness  = this.Tiles.Ness_left_2;
					this.Tiles.toggle_left = 0;
				}
				else {
					this.Tiles.Ness = this.Tiles.Ness_left_1;
					this.Tiles.toggle_left = 1;
				}
				break;
			case this.directions.right:
				new_x++;
				next_x += 2;
				if (this.Tiles.toggle_right) {
					this.Tiles.Ness = this.Tiles.Ness_right_2;
					this.Tiles.toggle_right = 0;
				}
				else {
					this.Tiles.Ness = this.Tiles.Ness_right_1;
					this.Tiles.toggle_right = 1;
				}
				break;
			default:
		}
		
		var tile_to_attempt = this._level._level[new_x][new_y];
		var	next_tile;
		
		if (next_x >= 0 && next_x < this._level._width && next_y >= 0 && next_y < this._level._height) {
			next_tile = this._level._level[next_x][next_y];
		}
		
		var move_to = tile_to_attempt.constructor;
		
		var is_goal = (tile_to_attempt.constructor == Goal);
		
		if (!this.checkMove(tile_to_attempt, next_tile))
			return;
			
		if (next_tile && (move_to == Water || move_to == WaterOnGoal)) {
			this.moveWater(tile_to_attempt, next_tile, next_x, next_y);
			if (move_to == WaterOnGoal)
				is_goal = true;
		}
		
		// Update Ness's position on the map.
		this._level._ness_x = new_x;
		this._level._ness_y = new_y;
		this._level._level[this._level._ness_x][this._level._ness_y] = this._level._level[old_x][old_y];
		
		this.moves++;
		
		if (this.isOnGoal)
			this._level._level[old_x][old_y] = new Goal();
		else
			this._level._level[old_x][old_y] = new Floor();
		
		this.isOnGoal = is_goal;
		
		this._level._level[old_x][old_y].Tiles = this.Tiles;
	}
}

function Empty() {
	this.getTile = function() {
		return this.Tiles.Empty;
	}
	
	// A plain white tile.
	this.getFillStyle = function() {
		return 'rgba(255, 255, 255, 1)';
	}
}

function Floor() {
	this.getTile = function() {
		return this.Tiles.Floor;
	}
}

function Mushroom() {
	this.getTile = function() {
		return this.Tiles.Mushroom;
	}
}

function Water() {
	this.getTile = function() {
		return this.Tiles.Water;
	}
}

function WaterOnGoal() {
	this.getTile = function() {
		return this.Tiles.WaterOnGoal;
	}
}

function Wall() {
	this.getTile = function() {
		return this.Tiles.Wall;
	}
}

function Goal() {
	this.getTile = function() {
		return this.Tiles.Goal;
	}
}

function Tile() {
	this.getTile = function() {
		return null;
	}
	
	this.getFillStyle = function() {
		return null;
	}
	
	this.Tiles = null;
}

Floor.prototype = new Tile();
Floor.prototype.constructor = Floor;
Mushroom.prototype = new Tile();
Mushroom.prototype.constructor = Mushroom;
Empty.prototype = new Tile();
Empty.prototype.constructor = Empty;
Wall.prototype = new Tile();
Wall.prototype.constructor = Wall;
Water.prototype = new Tile();
Water.prototype.constructor = Water;
Goal.prototype = new Tile();
Goal.prototype.constructor = Goal;
Ness.prototype = new Tile();
Ness.prototype.constructor = Ness;
WaterOnGoal.prototype = new Tile();
WaterOnGoal.prototype.constructor = WaterOnGoal;