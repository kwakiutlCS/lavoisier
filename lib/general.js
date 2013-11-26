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
	

    


    var atoms = [];

    

    


    // MOLECULES
    function Molecule(x,y,c) {
	this.x = x;
	this.y = y;
	this.radius = 50;

	this.composition = c;
	
	this.dragging = false;
	this.drag_delta = [0,0];
    };
    

    Molecule.prototype.draw = function() {
	var counter = 0;
	for (var k in this.composition) {
	    ctx.drawImage(colors[k], dx+(w-this.radius*Object.size(this.composition)*w/1366.)*this.x+counter*this.radius*w/1366.,dy+(h-this.radius*h/768.)*this.y, w/1366.*this.radius, h/768.*this.radius);
	    ctx.fillStyle = "black";
	    var f = 30/1366.*w;
	    ctx.font = f+"px sans-serif";
	    if (this.composition[k] > 1)
		ctx.fillText(this.composition[k], dx+(w-this.radius*Object.size(this.composition)*w/1366.)*this.x+counter*this.radius*w/1366.+this.radius*w/1366./3 , dy+(h-this.radius*h/768.)*this.y+this.radius*h/768./1.4);
	    counter += 1;
	}
    };


    Molecule.prototype.picked = function(x,y) {
	var size = Object.size(this.composition);
	var atom_x = dx+this.x*(w-this.radius*w/1366.*size);
	var atom_y = dy+(h-this.radius*h/768.)*this.y
	
	if (x > atom_x && x < atom_x+this.radius*w/1366.*size && y > atom_y && y < atom_y+this.radius*h/768.) {
	    this.drag_delta = [x-atom_x, y-atom_y];
	    return true;
	}
	return false;
    };

    Molecule.prototype.limit_movement = function() {
	if (this.x < 0) this.x = 0;
	if (this.x > 1) this.x = 1;
	if (this.y < 0) this.y = 0;
	if (this.y > 1) this.y = 1;
    }


    Molecule.prototype.relative_x = function(x) {
	var rel = x - dx;
	rel = rel/(w-this.radius*w/1366.*Object.size(this.composition));
	return rel;
    }

    Molecule.prototype.relative_y = function(y) {
	var rel = y - dy;
	rel = rel / (h-this.radius*h/768.);
	return rel;
	
    }

    Molecule.prototype.collide = function(m) {
	return false;
    }

    atoms.push(new Molecule(0,0.5, {1:1}));
    atoms.push(new Molecule(1,1, {2:5}));

    atoms.push(new Molecule(0.5,0.5, {2:1,1:1,0:3}));
    atoms.push(new Molecule(0.3,0.7, {0:2,2:1}));
    atoms.push(new Molecule(0.6,0.7, {1:2,2:1}));
    







    $("#myCanvas").on("mousedown", function(evt) {
	for (var i in atoms) {
	    if (atoms[atoms.length-1-i].picked(evt.pageX, evt.pageY)) {
		atoms[atoms.length-1-i].dragging = true;
		var tmp = atoms.splice(atoms.length-1-i,1);
		atoms.push(tmp[0]);
		resizeCanvas();
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
	var selected = false;
	for (var i in atoms) {
	    if (atoms[i].dragging){
		selected = atoms[i];
		atoms[i].x = atoms[i].relative_x(-atoms[i].drag_delta[0]+evt.pageX);
		atoms[i].y = atoms[i].relative_y(-atoms[i].drag_delta[1]+evt.pageY);
		atoms[i].limit_movement();
		resizeCanvas();
		break;
	    }
		
	}

	if (selected) {
	    for (var i in atoms) {
		if (atoms[i] != selected) {
		    if (selected.collide(atoms[i])) {
			console.log("collision");
			break;
		    }
		}
	    }
	}
    });

    
    
});