$(function() {

    Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
    };

    var canvas = $("#myCanvas");
    var ctx = canvas.get(0).getContext("2d");
    var bg = "rgb(255,250,230)";
    var dx = 0;
    var dy = 0;
    var w;
    var h;

    function fillBackground() {
	w = canvas.width();
	h = canvas.height();
	
	if (w/16.*9 < h) {
	    dy = (h - w/16.*9)/2;
	    dx = 0;
	    h = w/16.*9;
	}
	else {
	    dx = (w - h/9.*16)/2;
	    dy = 0;
	    w = h/9.*16;
	}
	ctx.fillRect(dx, dy, w, h);
	
    };


    function resizeCanvas() {
	ctx.save();
	canvas.attr("width", $(window).get(0).innerWidth);
	canvas.attr("height", $(window).get(0).innerHeight);
	ctx.fillStyle = bg;
	fillBackground();
	
	for (var i in atoms) {
	    atoms[i].draw();
	}
	m.draw();
	ctx.restore();
    };

    $(window).resize(resizeCanvas);

    var colors = [];
    var red_img = new Image();
    red_img.src = "lib/red.png";
    colors.push(red_img);
    var green_img = new Image();
    green_img.src = "lib/green.png";
    colors.push(green_img);
    var blue_img = new Image();
    blue_img.src = "lib/blue.png";
    colors.push(blue_img);
    var loaded = 0;

    for (var i in colors) {
	$(colors[i]).load(function() {
	    loaded += 1;
	    if (loaded === 3) {
		resizeCanvas();
	    }
	    
	});
    }
	

    function relative_x(x) {
	var rel = x - dx;
	rel = rel/(w-atoms[0].radius);
	return rel;
    }

    function relative_y(y) {
	var rel = y - dy;
	rel = rel / (h-atoms[0].radius);
	return rel;
    }


    var atoms = [];

    // atom
    function Atom(x,y, color) {
	this.radius = 50;
	this.x = x;
	this.y = y;
	this.color = color;

	this.dragging = false;
	this.drag_delta = [0,0];
	
    };

    Atom.prototype.draw = function() {
	ctx.drawImage(colors[this.color], dx+(w-this.radius*w/1366)*this.x,dy+(h-this.radius*h/768)*this.y,w/1366*this.radius,h/768*this.radius);
	
    };

    Atom.prototype.picked = function(x,y) {
	var atom_x = dx+this.x*(w-this.radius*w/1366);
	var atom_y = dy+(h-this.radius*h/768)*this.y
	if (x > atom_x && x < atom_x+this.radius && y > atom_y && y < atom_y+this.radius) {
	    this.drag_delta = [x-atom_x, y-atom_y];
	    return true;
	}
	return false;
    };

    Atom.prototype.limit_movement = function() {
	if (this.x < 0) this.x = 0;
	if (this.x > 1) this.x = 1;
	if (this.y < 0) this.y = 0;
	if (this.y > 1) this.y = 1;
    }

    atoms.push(new Atom(0,0.5, 1));
    atoms.push(new Atom(1,1, 2));


    


    // MOLECULES
    function Molecule(x,y) {
	this.x = x;
	this.y = y;
	this.radius = 50;

	this.composition = {0:3,2:5};
	
    };
    

    Molecule.prototype.draw = function() {
	var counter = 0;
	for (var k in this.composition) {
	    ctx.drawImage(colors[k], dx+(w-this.radius*Object.size(this.composition)*w/1366)*this.x+counter*this.radius*w/1366,dy+(h-this.radius*Object.size(this.composition)*h/768)*this.y, w/1366*this.radius, h/768*this.radius);
	    counter += 1;
	}
    };

    var m = new Molecule(0.5,0.5);
    

    $("#myCanvas").on("mousedown", function(evt) {
	for (var i in atoms) {
	    if (atoms[i].picked(evt.pageX, evt.pageY)) {
		atoms[i].dragging = true;
		break;
	    }
	}
    });

    $("#myCanvas").on("mouseup", function(evt) {
	for (var i in atoms) {
	    atoms[i].dragging = false;
	}
    });

    $("#myCanvas").on("mousemove", function(evt) {
	for (var i in atoms) {
	    if (atoms[i].dragging){
		atoms[i].x = relative_x(-atoms[i].drag_delta[0]+evt.pageX);
		atoms[i].y = relative_y(-atoms[i].drag_delta[1]+evt.pageY);
		atoms[i].limit_movement();
		resizeCanvas();
		break;
	    }
		
	}
    });

    
    
});