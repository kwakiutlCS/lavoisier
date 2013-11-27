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
	
	this.drag_delta = [0,0];
	
	this.visible = true;
	this.pending_merge = false;
	this.merged = false;
	this.spliter = false;
	this.splited = false;
	this.split_time = false;
	this.split_pos = false;
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


    Molecule.prototype.count_atoms = function() {
	var counter = 0;
	for (var k in this.composition) {
	    counter += this.composition[k];
	}
	return counter;
    }

    
    Molecule.prototype.find_split_position = function() {
	var found = false;
	var direction = 1;
	var tmp = this.y + direction*0.1;
	
	while (!found) {
	    found = true;
	    for (var i in atoms) {
		if (atoms[i] != this) {
		    if (this.x === atoms[i].x && tmp === atoms[i].y) {
			found = false;
			tmp += direction*0.1;
			if (tmp > 1) {
			    direction = -1;
			    tmp = this.y + direction *0.1;
			}
			else if (tmp < 0) {
			    return this.y + direction *0.1;
			}
		    }
		}
	    }
	}

	return tmp;
    }
    

    Molecule.prototype.split = function(x,y) {
	if (this.count_atoms() === 1)
	    return false;
	
	this.split_pos = [this.x, this.y];
	if (this.split_time) {
	    if (Date.now() - this.split_time > 2000) {
		if (this.spliter) {
		    this.spliter.splited = false;
		    this.spliter.split_pos = false;
		    this.spliter = false;
		}
		
	    }
	}
	
	var size = Object.size(this.composition);
	if (!this.spliter) {
	    var y = this.find_split_position();
	    
	    this.spliter = new Molecule(this.x, y,{});
	    atoms.push(this.spliter);
	    this.spliter.splited = this;
	    this.spliter.split_pos = [this.spliter.x, this.spliter.y];
	}

	var atom_x = dx+this.x*(w-this.radius*w/1366.*size);
	
	var kind = false;
	if (parseInt((x-atom_x) / (this.radius/1366.*w)) === 0) {
	    if (typeof this.composition[0] != "undefined")
		kind = 0;
	    else if (typeof this.composition[1] != "undefined")
		kind = 1;
	    else
		kind = 2;
	}
	else if (parseInt((x-atom_x) / (this.radius/1366.*w)) === 1) {
	    if (typeof this.composition[0] != "undefined" && typeof this.composition[1] != "undefined")
		kind = 1;
	    else
		kind = 2;
	}
	else {
	    kind = 2
	}

	this.spliter.composition[kind] = typeof this.spliter.composition[kind] === "undefined" ? 1 : this.spliter.composition[kind]+1;
	if (this.composition[kind] === 1) delete this.composition[kind];
	else this.composition[kind] -= 1;

	
	this.split_time = Date.now();

	resizeCanvas();
    }


    Molecule.prototype.cancel_split = function() {
	
	if (this.split_pos) {
	    if (this.spliter) {
		if (Math.abs(this.split_pos[0] - this.x) > 0.05 || Math.abs(this.split_pos[1] - this.y) > 0.05) {
		    this.spliter.splited = false;
		    this.spliter.split_pos = false;
		    this.spliter = false;
		    this.split_pos = false;
		}
	    }
	    else {
		if (Math.abs(this.split_pos[0] - this.x) > 0.05 || Math.abs(this.split_pos[1] - this.y) > 0.05) {
		    this.splited.spliter = false;
		    this.splited.split_pos = false;
		    this.spliter = false;
		    this.split_pos = false;
		}
	    }
	}
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
	    selected.cancel_split();
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