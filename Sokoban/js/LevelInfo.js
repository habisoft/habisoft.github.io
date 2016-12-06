function LevelInfo(level) {
    var _level = level;
    var _pushes = 0;
    var _moves = 0;

	this.render = function (context) {
        var x = _level.on_screen_width;
        var y = 0;


        //context.fillStyle = "rgb(127,0,0)";
        context.strokeStyle = "rgb(0,0,0)";
        x += 20;
		context.fillRect(x, y, 115, 85);
		context.fillStyle = "rgb(0,0,0)";
		context.fillStyle = "rgb(127,0,0)";
        context.strokeRect(x, y, 115, 85);
        x += 5;
        y += 20;
        context.font = "bold 12px sans-serif";
        context.fillText('Level ' + _level.level_number + ' / 11', x, y);
        y += 25;
        context.fillText('Pushes : ' + _pushes, x, y);
        y += 25;
        context.fillText('Moves : ' + _moves, x, y);
    }
	
    this.update = function () {
        var ness = _level.getNess();
        _pushes = ness.pushes;
        _moves = ness.moves;
    }
}
