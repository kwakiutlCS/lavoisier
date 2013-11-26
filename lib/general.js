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
    var high = new Image();
    high.src = "lib/high.png";
    colors.push(high);
    var loaded = 0;

    for (var i in colors) {
	$(colors[i]).load(function() {
	    loaded += 1;
	    if (loaded === 4) {
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
	this.memory = {};
	
	this.dragging = false;
	this.drag_delta = [0,0];
	
	this.visible = true;
	this.pending_merge = false;
	this.merged = false;
	this.spliter = false;
    };
    

    Molecule.prototype.draw = function() {
	if (this.visible === false)
	    return false;
	
	

	var counter = 0;
	for (var k in this.composition) {
	    ctx.drawImage(colors[k], dx+(w-this.radius*Object.size(this.composition)*w/1366.)*this.x+counter*this.radius*w/1366.,dy+(h-this.radius*h/768.)*this.y, w/1366.*this.radius, h/768.*this.radius);
	    ctx.fillStyle = "black";
	    var f = 30/1366.*w;
	    ctx.font = f+"px sans-serif";
	    if (this.composition[k] > 1) {
		var t = this.composition[k] > 9 ? this.composition[k] : " "+this.composition[k];
		ctx.fillText(t, dx+(w-this.radius*Object.size(this.composition)*w/1366.)*this.x+counter*this.radius*w/1366.+this.radius*w/1366./5 , dy+(h-this.radius*h/768.)*this.y+this.radius*h/768./1.4);
	    }
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

    Molecule.prototype.collide = function(x,y) {
	var size = Object.size(this.composition);
	var atom_x = dx+this.x*(w-this.radius*w/1366.*size);
	var atom_y = dy+(h-this.radius*h/768.)*this.y
	
	if (x > atom_x && x < atom_x+this.radius*w/1366.*size && y > atom_y && y < atom_y+this.radius*h/768.) {
	    return true;
	}
	return false;
    }


    Molecule.prototype.merge = function(m) {
        if (!this.pending_merge) {
	    for (var k in this.composition) {
		this.memory[k] = this.composition[k];
	    }
	    for (var k in m.composition) {
		if (this.composition[k]) {
		    this.composition[k] += m.composition[k];
		}
		else {
		    this.composition[k] = m.composition[k];
		}
	    }

	    m.visible = false;
	    this.pending_merge = true;
	    this.merged = m;
	}
    }


    Molecule.prototype.cancel_merge = function() {
	this.composition = {};
	for (var i in this.memory) {
	    this.composition[i] = this.memory[i];
	}
	this.memory = {};
	this.pending_merge = false;
	this.merged.visible = true;
	this.merged = false;
    }


    Molecule.prototype.accept_merge = function() {
	this.memory = {};
	this.pending_merge = false;
	for (var i in atoms) {
	    if (atoms[i] === this.merged) {
		atoms.splice(i,1);
		break;
	    }
	}
    }

    Molecule.prototype.split = function(x,y) {
	var size = Object.size(this.composition);
	if (!this.spliter) {
	    this.spliter = new Molecule(this.x, this.y-0.1,{});
	}

	var atom_x = dx+this.x*(w-this.radius*w/1366.*size);
	    
	if (parseInt((x-atom_x) / (this.radius/1366.*w)) === 0) {
	    this.spliter.composition[0] = typeof this.spliter.composition[0] === "undefined" ? 1 : this.spliter.composition[0]+1;
	    if (this.composition[0] === 1) delete this.composition[0];
	    else this.composition[0] -= 1;
	}

	atoms.push(this.spliter);
	
	resizeCanvas();
    }

    atoms.push(new Molecule(0,0.5, {1:1}));
    atoms.push(new Molecule(1,1, {2:5}));

    atoms.push(new Molecule(0.5,0.5, {2:1,1:1,0:3}));
    atoms.push(new Molecule(0.3,0.7, {0:2,2:1}));
    atoms.push(new Molecule(0.6,0.7, {1:2,2:1}));
    




    var selected = false;



    $("#myCanvas").on("mousedown", function(evt) {
	
	for (var i in atoms) {
	    if (atoms[atoms.length-1-i].picked(evt.pageX, evt.pageY)) {
		atoms[atoms.length-1-i].dragging = true;
		selected = atoms[atoms.length-1-i];
		var tmp = atoms.splice(atoms.length-1-i,1);
		atoms.push(tmp[0]);
		resizeCanvas();
		break;
	    }
	}
    });

    $("#myCanvas").on("mouseup", function(evt) {
	if (selected) {
	    selected.dragging = false;
	    if (selected.pending_merge) {
		selected.accept_merge();
	    }
	    selected = false;
	}
    });

    	
    $("#myCanvas").on("mousemove", function(evt) {
	if (selected){
	    selected.x = selected.relative_x(-selected.drag_delta[0]+evt.pageX);
	    selected.y = selected.relative_y(-selected.drag_delta[1]+evt.pageY);
	    selected.limit_movement();
	    resizeCanvas();
	}
	
	var collision = false;
	if (selected) {
	    for (var i in atoms) {
		if (atoms[i] != selected) {
		    if (atoms[i].collide(evt.pageX,evt.pageY)) {
			collision = true;
			selected.merge(atoms[i]);
			break;
		    }
		}
	    }
	    if (!collision && selected.pending_merge) {
		selected.cancel_merge();
	    }
	}
    });


    $("#myCanvas").on("dblclick", function(evt) {
	for (var i in atoms) {
	    if (atoms[atoms.length-1-i].picked(evt.pageX,evt.pageY)) {
		atoms[atoms.length-1-i].split(evt.pageX,evt.pageY);
		break;
	    }
	}
	    
    });

    
    
});