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
    var menu = 0;
    var menu_selection = false;
    var solved = false;
    var locked = false;
    var current_puzzle = false;
    var ctrl = false;
    var selected_equation = false;
    var completed = false;
    var tip = false;
    var solved_level = 0;
    var tip_level = 0;
    var tip_expected = {1:3,2:3,3:4,4:4,5:5,6:5,7:5,8:5,9:5,10:6,11:6,12:6,13:6,14:6,15:6,16:7,17:7,18:7,19:7,20:7,21:7,22:7,23:7,24:7,25:7,26:7,27:7,28:7};
    var pinned = true;

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
	if (menu === 1) {
	    drawScenario();
	}
	else if (menu === 0) {
	    drawMenu();
	}
	else if (menu === 2) {
	    drawTeachingChoice();
	}
	else if (menu === 3) {
	    drawTeaching();
	}
    };

    
    function drawTeachingChoice() {
	for (var i in equations) {
	    ctx.drawImage(equations[i], dx+0.2*w, dy+0.1*h*i+0.1*h, 0.535*w, 0.07*h);
	}
	ctx.drawImage(menu_button, dx+0.955*w, dy+0.1*h, 0.035*w,0.035*w);
	
    };


    function drawTeaching() {
	
	ctx.drawImage(equations[selected_equation-1], dx+0.2*w, dy+0.05*h, 0.6*w,0.08*h);
	if (completed) {
	    ctx.strokeStyle = "black";
	    ctx.lineWidth = 5*w/1366.;
	    ctx.moveTo(dx,dy+0.27*h);
	    ctx.lineTo(dx+w,dy+0.27*h);
	    ctx.closePath();
	    ctx.stroke();
	    ctx.drawImage(restart, dx+0.955*w, dy+0.03*h, 0.035*w,0.035*w);
	    
	}
	ctx.drawImage(menu_button, dx+0.955*w, dy+0.1*h, 0.035*w,0.035*w);
	ctx.drawImage(flask, dx+0.955*w, dy+0.17*h, 0.035*w,0.035*w);
    }
    

    function resizeCanvas() {
	ctx.save();
	canvas.attr("width", $(window).get(0).innerWidth);
	canvas.attr("height", $(window).get(0).innerHeight);
	ctx.fillStyle = bg;
	fillBackground();
	
	if (menu != 3 || completed) {
	    for (var i in atoms) {
		atoms[i].draw();
	    }
	}
	if ((solved && menu === 1) || (solved && completed)) {
	    if (solved_level)
		ctx.drawImage(solved_menu, dx+0.35*w, dy+0.35*h, 0.3*w, 0.3*h);
	    else 
		ctx.drawImage(solved0_menu, dx+0.35*w, dy+0.35*h, 0.3*w, 0.3*h);
	}
	ctx.restore();
    };


    function drawScenario () {
	ctx.save();
	ctx.strokeStyle = "black";
	ctx.lineWidth = 5*w/1366.;
	ctx.moveTo(dx,dy+0.2*h);
	ctx.lineTo(dx+w,dy+0.2*h);
	ctx.closePath();
	ctx.stroke();
	ctx.restore();
	ctx.drawImage(arrow, dx+w/2-w*0.035, dy+0.1*h-h*0.02, w*0.07,h*0.04);
	
	ctx.drawImage(restart, dx+0.955*w, dy+0.03*h, 0.035*w,0.035*w);
	ctx.drawImage(menu_button, dx+0.955*w, dy+0.1*h, 0.035*w,0.035*w);
	if (locked) {
	    ctx.drawImage(lock, dx+0.003*w, dy+0.14*h, 0.025*w, 0.025*w);
	}
	if (tip_level <= tip_expected[menu_selection]) {
	    ctx.drawImage(tips[tip_level], dx, dy,w,h);
	}
	if (menu === 1) {
	    var f = 20.*w/1366;
	    ctx.fillStyle = "black";
	    ctx.font = f+"px sans-serif";
	    ctx.fillText("#"+menu_selection, dx+w*0.002,dy+0.02*h);
	}
	
    };

    function drawMenu() {
	var line = "#CDE6CD";
	var fill = "#59AC59";
	var fill2 = "#cca21e";
	ctx.save();
	ctx.lineWidth = 5*w/1366.;
	var f = 50.*w/1366;
	ctx.font = f+"px sans-serif";
	ctx.lineJoin = "round";
	ctx.fillStyle = fill;
	for (var i = 0; i < 4; i++) {
	    for (var j = 0; j < 7; j++) {
		var t = 7*i+j+1;

		if (t == 1 || t == 3 || t == 5 || t == 10 || t == 16) {
		    ctx.fillStyle = fill2;
		} else {
		    ctx.fillStyle = fill;
		}
		ctx.fillRect(dx+(0.1+0.12*j)*w, dy+(0.07+0.2*i)*h, w*0.08, w*0.08);
		
		if (menu_selection === t)
		    ctx.strokeStyle = "red";
		else
		    ctx.strokeStyle = line;
		ctx.strokeRect(dx+(0.1+0.12*j)*w, dy+(0.07+0.2*i)*h, w*0.08, w*0.08); 
		ctx.fillStyle = line;
		
		if (t < 10)
		    var ot = " "+t;
		else 
		    var ot = t;

		ctx.fillText(ot, dx+(0.12+0.12*j)*w, dy+(0.165+0.2*i)*h);
		
		if (Modernizr.localstorage) {
		    if (localStorage[t]) {
			ctx.drawImage(right, dx+(0.15+0.12*j)*w, dy+(0.155+0.2*i)*h, w*0.04, h*0.06);
		    }
		}
	    }
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
    var yellow_img = new Image();
    yellow_img.src = "lib/yellow.png";
    colors.push(yellow_img);
    var arrow = new Image();
    arrow.src = "lib/arrow.png";
    colors.push(arrow);
    var right = new Image();
    right.src = "lib/right.png";
    colors.push(right);
    var restart = new Image();
    restart.src = "lib/restart.png";
    colors.push(restart);
    var menu_button = new Image();
    menu_button.src = "lib/menu.png";
    colors.push(menu_button);
    var lock = new Image();
    lock.src = "lib/lock.png";
    colors.push(lock);
    var flask = new Image();
    flask.src = "lib/flask.png";
    colors.push(flask);
    var solved0_menu = new Image();
    solved0_menu.src = "lib/solved0.png";
    colors.push(solved0_menu);
    var solved_menu = new Image();
    solved_menu.src = "lib/solved.png";
    colors.push(solved_menu);
    var updown = new Image();
    updown.src = "lib/updown.png";
    colors.push(updown);
    var loaded = 0;

    var tips = [];
    for (var i = 0; i < 8; i++) {
	tips.push(new Image());
	tips[i].src = "lib/tip"+(1+i)+".png";
	$(tips[i]).load(function() {
	    loaded += 1;
	    if (loaded === 29) {
		resizeCanvas();
	    }
	});
    }

    var equations = [];
    for (var i = 0; i < 8; i++) {
	equations.push(new Image());
	equations[i].src = "lib/equation"+(1+i)+".png";
	$(equations[i]).load(function() {
	    loaded += 1;
	    if (loaded === 29) {
		resizeCanvas();
	    }
	});
    }

    for (var i in colors) {
	$(colors[i]).load(function() {
	    loaded += 1;
	    if (loaded === 29) {
		resizeCanvas();
	    }
	    
	});
    }
	

    


    var atoms = [];

    

    


    // MOLECULES
    function Molecule(x,y,c, kind) {
	this.x = x;
	this.y = y;
	this.radius = 40;

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

	this.kind = kind;
	this.number = 1;
	
    };
    

    Molecule.prototype.draw = function() {
	if (this.visible === false)
	    return false;
	
	
	var counter = 0;
	for (var k in this.composition) {
	    ctx.drawImage(colors[k], dx+this.x*w+counter*this.radius*w/1366.,dy+this.y*h, w/1366.*this.radius, h/768.*this.radius);
	    ctx.fillStyle = "black";
	    var f = 24/1366.*w;
	    ctx.font = f+"px sans-serif";
	    if (this.composition[k] > 1) {
		var t = this.composition[k] > 9 ? this.composition[k] : " "+this.composition[k];
		ctx.fillText(t, dx+w*this.x+counter*this.radius*w/1366.+this.radius*w/1366./5 , dy+h*this.y+this.radius*h/768./1.4);
	    }

	    counter += 1;
	}

	if (this.kind === 3) {
	    var number = this.count_duplicates();
	    ctx.save();
	    var trans = 0;
	    if (menu === 3) trans = 0.14*h;
	    if (number > 1) {
		ctx.fillStyle = "red";
		var f =36/1366.*w;
		if (number >= 10) f *= 0.7;
		ctx.font = f+"px sans-serif";
		ctx.fillText(number, dx+this.x*w-this.radius*0.7*w/1366., dy+this.y*h+this.radius*0.9*h/768.-trans);
	    }
	    else if (number === 0) {
		ctx.fillStyle = "rgba(255,250,230,0.6)";
		ctx.fillRect(dx+this.x*w, dy+this.y*h-trans, this.radius*w/1366.*Object.size(this.composition), this.radius*w/1366.*1.2);
	    }
	    ctx.restore();
	}
	if (this.kind === 2) {
	    var number = this.number;
	    ctx.save();
	    if (number > 1) {
		ctx.fillStyle = "red";
		var f =36/1366.*w;
		if (number >= 10) f *= 0.7;
		ctx.font = f+"px sans-serif";
		var trans = 0;
		if (menu === 3) trans = 0.14*h;
	    	ctx.fillText(number, dx+this.x*w-this.radius*0.7*w/1366., dy+this.y*h+this.radius*0.9*h/768.-trans);
	    }
	    if (menu === 3 || (collection[menu_selection].reproduction === 1 || collection[menu_selection].reproduction === 2 && !locked)) {
		if (menu === 1)
		    ctx.drawImage(updown, dx+this.x*w-this.radius*1.2*w/1366., dy+this.y*h, 12*w/1366., 38*w/1366.);
		else
		    ctx.drawImage(updown, dx+this.x*w-this.radius*1.2*w/1366., dy+this.y*h-0.14*h, 12*w/1366., 38*w/1366.);
	    }
	    ctx.restore();
	}

    };


    Molecule.prototype.picked = function(x,y) {
	
	var size = Object.size(this.composition);
	var atom_x = dx+this.x*w;
	var atom_y = dy+this.y*h;
	
	if (x > atom_x && x < atom_x+this.radius*w/1366.*size && y > atom_y && y < atom_y+this.radius*h/768.) {
	    this.drag_delta = [x-atom_x, y-atom_y];
	    return true;
	}
	return false;
    };

    Molecule.prototype.limit_movement = function() {
	var size = Object.size(this.composition);
	if (this.x < 0) this.x = 0;
	if (this.x > 1-this.radius/1366.*size) this.x = 1-this.radius/1366.*size;
	if (this.y < 0.2 && menu === 1) this.y = 0.2;
	if (this.y < 0.285 && menu === 3) this.y = 0.285;
	if (this.y > 1-this.radius/768.) this.y = 1-this.radius/768.;
    }


    Molecule.prototype.relative_x = function(x) {
	var rel = x - dx;
	rel = rel/w;
	return rel;
    }

    Molecule.prototype.relative_y = function(y) {
	var rel = y - dy;
	rel = rel /h;
	return rel;
	
    }

    Molecule.prototype.collide = function(x,y) {
	var size = Object.size(this.composition);
	var atom_x = dx+this.x*w;
	var atom_y = dy+this.y*h;
	
	if (x > atom_x && x < atom_x+this.radius*w/1366.*size && y > atom_y && y < atom_y+this.radius*h/768.) {
	    return true;
	}
	return false;
    }

    Molecule.prototype.collideUp = function(x,y) {
	var atom_x = dx+this.x*w;
	var atom_y = dy+this.y*h;
	var trans = 0;
	if (menu === 3) trans = 0.14*h;
	return (x > atom_x-this.radius*1.2*w/1366. && x < atom_x-(this.radius*1.2-12)*w/1366. && y > atom_y-trans && y < atom_y+14*w/1366.-trans);
    }
    
    Molecule.prototype.collideDown = function(x,y) {
	var atom_x = dx+this.x*w;
	var atom_y = dy+this.y*h;
	var trans = 0;
	if (menu === 3) trans = 0.14*h;
	return (x > atom_x-this.radius*1.2*w/1366. && x < atom_x-(this.radius*1.2-12)*w/1366. && y > atom_y+18*w/1366.-trans && y < atom_y+39*w/1366.-trans);
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
	for (var i in atoms) {
	    atoms[i].spliter = false;
	    atoms[i].splitted = false;
	}
	this.memory = {};
	this.pending_merge = false;
	for (var i in atoms) {
	    if (atoms[i] === this.merged) {
		atoms.splice(i,1);
		break;
	    }
	}
	solved = correctPuzzle();
	
	resizeCanvas();
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
		    if (Math.abs(this.x - atoms[i].x) < 0.05 && Math.abs(tmp - atoms[i].y) < 0.05) {
			found = false;
			tmp += direction*0.1;
			if (tmp > 1) {
			    direction = -1;
			    tmp = this.y + direction *0.1;
			}
			else if (tmp < 0.215) {
			    return 0.215;
			}
		    }
		    else if (tmp > 1) {
			found = false;
			direction = -1;
			tmp = this.y + direction *0.1;
		    }
		    else if (tmp < 0.215) {
			return 0.215;
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
	    
	    this.spliter = new Molecule(this.x, y,{},1);
	    atoms.push(this.spliter);
	    this.spliter.splited = this;
	    this.spliter.split_pos = [this.spliter.x, this.spliter.y];
	}

	var atom_x = dx+this.x*w;
	
	var kind = false;
	if (parseInt((x-atom_x) / (this.radius/1366.*w)) === 0) {
	    if (typeof this.composition[0] != "undefined")
		kind = 0;
	    else if (typeof this.composition[1] != "undefined")
		kind = 1;
	    else if (typeof this.composition[2] != "undefined")
		kind = 2;
	    else
		kind = 3;
	}
	else if (parseInt((x-atom_x) / (this.radius/1366.*w)) === 1) {
	    if (typeof this.composition[0] != "undefined" && typeof this.composition[1] != "undefined")
		kind = 1;
	    else if ((typeof this.composition[0] != "undefined" || typeof this.composition[1] != "undefined") && typeof this.composition[2] != "undefined")
		kind = 2;
	    else 
		kind = 3;
	}
	else if (parseInt((x-atom_x) / (this.radius/1366.*w)) === 2){
	    if (typeof this.composition[0] != "undefined" && typeof this.composition[1] != "undefined" && typeof this.composition[2] != "undefined") {
		kind = 2;
	    }
	    else
		kind = 3
	}
	else 
	    kind = 3;

	this.spliter.composition[kind] = typeof this.spliter.composition[kind] === "undefined" ? 1 : this.spliter.composition[kind]+1;
	if (this.composition[kind] === 1) delete this.composition[kind];
	else this.composition[kind] -= 1;

	
	this.split_time = Date.now();
	
	
	if (menu === 1 && collection[menu_selection].reproduction === 2) {
	    locked = true;
	}
	
	solved = correctPuzzle();
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

    Molecule.prototype.reproduce = function() {
	this.number++;
	var c = {};
	for (var i in this.composition) {
	    c[i] = this.composition[i];
	}
	var y = 0.35;
	var occupied = true;
	while (occupied) {
	    occupied = false;
	    for (var i in atoms) {
		if (this != atoms[i]) {
		    if (Math.abs(atoms[i].x-this.x) < 0.03 && Math.abs(atoms[i].y - y) < 0.03) {
			y += 0.1;
			occupied = true;
			if (y > 1) {
			    y = 0.4;
			    occupied = false;
			    break;
			}
		    }
		}
	    }
	    
	}

	atoms.push(new Molecule(this.x, y, c, 1));
	solved = false;
	resizeCanvas();
    }

    Molecule.prototype.equals = function(other) {
	return equal(this.composition, other.composition);
    }

    Molecule.prototype.count_duplicates = function() {
	var counter = 0;
	for (var i in atoms) {
	    if (atoms[i].kind === 1) {
		if (this.equals(atoms[i]))
		    counter++;
	    }
	}
	return counter;
    }
    


    function shuffle(p) {
	var possible = [0,1,2,3];
	var mapping = [];
	while (possible.length) {
	    mapping.push(possible.splice(parseInt(Math.random()*possible.length),1)[0]);
	}
	
	var output = {reagents:[], start:p.start, products:[]};
	
	if (Math.random() < 0.5) {
	    var c1 = p.reagents;
	    var c2 = p.products;
	}
	else {
	    var c2 = p.reagents;
	    var c1 = p.products;
	}

	for (var mol in c1) {
	    output.reagents.push({});
	    for (var i in c1[mol]) {
		output.reagents[mol][mapping[i]] = c1[mol][i];
	    }
	}
	for (var mol in c2) {
	    output.products.push({});
	    for (var i in c2[mol]) {
		output.products[mol][mapping[i]] = c2[mol][i];
	    }
	}
	
	return output;
    }
    


    function startPuzzle(puzzle) {
	if (menu_selection === 1) {
	    tip_level = 0;
	}
	else if (menu_selection === 3) {
	    if (tip_level > 4)
		tip_level = 4;
	}
	else if (menu_selection === 5) {
	    if (tip_level > 5)
		tip_level = 5;
	}
	else if (menu_selection === 10) {
	    if (tip_level > 6)
		tip_level = 6;
	}
	else if (menu_selection === 16) {
	    if (tip_level > 7)
		tip_level = 7;
	}
	
	
	if (puzzle.reproduction === 2) {
	    puzzle = puzzle.puzzles[parseInt(Math.random()*puzzle.puzzles.length)];
	    puzzle = shuffle(puzzle);
	}
	current_puzzle = puzzle;
	var counter = 0;
	var pos = getReagentsPosition(puzzle.reagents);
	var index = 0;
	var position = {1: {0: 0.21}, 2: {0: 0.11, 1: 0.3}, 3:{0: 0.06, 1: 0.21, 2: 0.36}}
	for (var k in puzzle.reagents) {
	    atoms.push(new Molecule(position[puzzle.reagents.length][k], 0.07,clone(puzzle.reagents[k]), 2));
	    atoms[atoms.length-1].number = puzzle.start[k];
	    if (puzzle.start[index])
		var repeat = puzzle.start[index];
	    else
		var repeat = 1;
	    for (var i = 0; i<repeat; i++) {
		atoms.push(new Molecule(position[puzzle.reagents.length][k], 0.35+i*0.15,clone(puzzle.reagents[k]), 1));
	    }
	    index += 1;
	}

	
	counter = 0;
	pos = getReagentsPosition(puzzle.products);
	
	for (var k in puzzle.products) {
	    atoms.push(new Molecule(0.5+position[puzzle.products.length][k], 0.07,clone(puzzle.products[k]), 3))
	}
	
	resizeCanvas();
    };

    
    function startTeacherPuzzle(puzzle) {
	if (selected_equation === 1) {
	    atoms.push(new Molecule(0.21,0.2,clone(puzzle.reagents[0]),2));
	    atoms.push(new Molecule(0.35,0.2,clone(puzzle.reagents[1]),2));
	    atoms.push(new Molecule(0.21,0.34,clone(puzzle.reagents[0]),1));
	    atoms.push(new Molecule(0.35,0.34,clone(puzzle.reagents[1]),1));
	    
	    atoms.push(new Molecule(0.58,0.2,clone(puzzle.products[0]),3));
	    atoms.push(new Molecule(0.74,0.2,clone(puzzle.products[1]),3));
	    
	}
	if (selected_equation === 2) {
	    atoms.push(new Molecule(0.235,0.2,clone(puzzle.reagents[0]),2));
	    atoms.push(new Molecule(0.365,0.2,clone(puzzle.reagents[1]),2));
	    atoms.push(new Molecule(0.235,0.34,clone(puzzle.reagents[0]),1));
	    atoms.push(new Molecule(0.365,0.34,clone(puzzle.reagents[1]),1));
	    atoms.push(new Molecule(0.58,0.2,clone(puzzle.products[0]),3));
	    atoms.push(new Molecule(0.735,0.2,clone(puzzle.products[1]),3));
	    
	}
	if (selected_equation === 3) {
	    atoms.push(new Molecule(0.305,0.2,clone(puzzle.reagents[0]),2));
	    atoms.push(new Molecule(0.45,0.2,clone(puzzle.reagents[1]),2));
	    atoms.push(new Molecule(0.305,0.34,clone(puzzle.reagents[0]),1));
	    atoms.push(new Molecule(0.45,0.34,clone(puzzle.reagents[1]),1));
	    atoms.push(new Molecule(0.635,0.2,clone(puzzle.products[0]),3));
	    
	}
	if (selected_equation === 4) {
	    atoms.push(new Molecule(0.245,0.2,clone(puzzle.reagents[0]),2));
	    atoms.push(new Molecule(0.362,0.2,clone(puzzle.reagents[1]),2));
	    atoms.push(new Molecule(0.245,0.34,clone(puzzle.reagents[0]),1));
	    atoms.push(new Molecule(0.362,0.34,clone(puzzle.reagents[1]),1));
	    atoms.push(new Molecule(0.565,0.2,clone(puzzle.products[0]),3));
	    atoms.push(new Molecule(0.725,0.2,clone(puzzle.products[1]),3));
	    
	}
	if (selected_equation === 5) {
	    atoms.push(new Molecule(0.23,0.2,clone(puzzle.reagents[0]),2));
	    atoms.push(new Molecule(0.362,0.2,clone(puzzle.reagents[1]),2));
	    atoms.push(new Molecule(0.23,0.34,clone(puzzle.reagents[0]),1));
	    atoms.push(new Molecule(0.362,0.34,clone(puzzle.reagents[1]),1));
	    atoms.push(new Molecule(0.57,0.2,clone(puzzle.products[0]),3));
	    atoms.push(new Molecule(0.755,0.2,clone(puzzle.products[1]),3));
	    
	}
	if (selected_equation === 6) {
	    atoms.push(new Molecule(0.22,0.2,clone(puzzle.reagents[0]),2));
	    atoms.push(new Molecule(0.389,0.2,clone(puzzle.reagents[1]),2));
	    atoms.push(new Molecule(0.22,0.34,clone(puzzle.reagents[0]),1));
	    atoms.push(new Molecule(0.389,0.34,clone(puzzle.reagents[1]),1));
	    atoms.push(new Molecule(0.57,0.2,clone(puzzle.products[0]),3));
	    atoms.push(new Molecule(0.71,0.2,clone(puzzle.products[1]),3));
	    
	}
	if (selected_equation === 7) {
	    atoms.push(new Molecule(0.22,0.2,clone(puzzle.reagents[0]),2));
	    atoms.push(new Molecule(0.37,0.2,clone(puzzle.reagents[1]),2));
	    atoms.push(new Molecule(0.22,0.34,clone(puzzle.reagents[0]),1));
	    atoms.push(new Molecule(0.37,0.34,clone(puzzle.reagents[1]),1));
	    atoms.push(new Molecule(0.565,0.2,clone(puzzle.products[0]),3));
	    atoms.push(new Molecule(0.72,0.2,clone(puzzle.products[1]),3));
	    
	}
	if (selected_equation === 8) {
	    atoms.push(new Molecule(0.22,0.2,clone(puzzle.reagents[0]),2));
	    atoms.push(new Molecule(0.375,0.2,clone(puzzle.reagents[1]),2));
	    atoms.push(new Molecule(0.22,0.34,clone(puzzle.reagents[0]),1));
	    atoms.push(new Molecule(0.375,0.34,clone(puzzle.reagents[1]),1));
	    atoms.push(new Molecule(0.555,0.2,clone(puzzle.products[0]),3));
	    atoms.push(new Molecule(0.7,0.2,clone(puzzle.products[1]),3));
	    
	}
	resizeCanvas();
	
    };
    
    function clone(x) {
	var r = {};
	for (var k in x) {
	    r[k] = x[k];
	}
	return r;
    };


    function getReagentsPosition(r) {
	var kind = r.length;
	var count = 0;
	for (var i in r) {
	    count += Object.size(r[i]);
	}
	count += kind -1;
	return count;
    };
    
    
    function correctPuzzle() {
	
	for (var i in atoms) {
	    if (atoms[i].kind === 1) {
		var s = false;
	
		for (var j in atoms) {
		    if (atoms[j].kind === 3 && atoms[i].equals(atoms[j])) {
			s = true;
			break;
		    }
		}
		if (!s) return false;
	    }
	    if (atoms[i].kind === 3) {
		var s = false;
	
		for (var j in atoms) {
		    if (atoms[j].kind === 1 && atoms[i].equals(atoms[j])) {
			s = true;
			break;
		    }
		}
		if (!s) return false;
	    }
	}
	return true;
    };


    


    function equal(a,b) {
	for (var k in a) {
	    var here = false;
	    if (!(b[k] && b[k] === a[k])) {
		return false;
	    }
	    
	}
	
	for (var k in b) {
	    var here = false;
	    if (!(a[k] && a[k] === b[k])) {
		return false;
	    }
	    
	}
	
	return true;
    };


    var selected = false;


    var equation_collection = {
	1: {reagents: [{1:1,3:1},{0:1,1:1,2:1}],
	    start: [0,0],
	    products: [{0:1,3:1},{1:2,2:1}],
	    reproduction: 1,
	   },
	2: {reagents: [{0:1},{1:1,2:1}],
	    start: [0,0],
	    products: [{0:1,2:2},{1:2}],
	    reproduction: 1,
	   },
	3: {reagents: [{0:2,1:1},{1:2}],
	    start: [0,0],
	    products: [{0:2,1:2}],
	    reproduction: 1,
	   },
	4: {reagents: [{0:1},{1:2,2:1}],
	    start: [0,0],
	    products: [{0:1,1:1,2:1},{1:2}],
	    reproduction: 1,
	   },
	5: {reagents: [{0:1},{1:2,2:1}],
	    start: [0,0],
	    products: [{0:1,1:2,2:2},{1:2}],
	    reproduction: 1,
	   },
	6: {reagents: [{0:2,1:6,2:1},{2:2}],
	    start: [0,0],
	    products: [{0:1,2:2},{1:2,2:1}],
	    reproduction: 1,
	   },
	7: {reagents: [{0:1,1:1,2:3},{1:1,2:1}],
	    start: [0,0],
	    products: [{1:1,2:2},{0:2,2:1}],
	    reproduction: 1,
	   },
	8: {reagents: [{0:2,2:6},{3:2}],
	    start: [0,0],
	    products: [{0:1,2:2},{2:2,3:1}],
	    reproduction: 1,
	   },
	
    };

    var collection = {
	1: {
	    reagents: [{1:1}, {2:1}],
	    start: [1,1],
	    products: [{1:1,2:1}],
	    reproduction: 0,
	   },
	2: {
	    reagents: [{0:1,2:1}, {2:1}, ], 
	    start: [1,1],
	    products: [{0:1,2:2}],
	    reproduction: 0,
	   },
	3: {
	    reagents: [{1:1,0:1}, {2:1,3:1}], 
	    start: [1,1],
	    products: [{1:1,2:1}, {0:1,3:1}],
	    reproduction: 0,
	   },
	4: {
	    reagents: [{1:1,0:1}, {1:2,2:1}], 
	    start: [1,1],
	    products: [{1:1,2:1}, {1:2,0:1}],
	    reproduction: 0,
	   },
	5: {
	    reagents: [{3:2,2:4},], 
	    start: [1],
	    products: [{3:1,2:2}],
	    reproduction: 0,
	   },
	6: {
	    reagents: [{0:1,2:4},{1:4}], 
	    start: [1,1],
	    products: [{0:1,1:2}, {2:2,1:1}],
	    reproduction: 0,
	   },
	7: {
	    reagents: [{0:1,2:1,1:1},{1:2, 3:1,2:3}], 
	    start: [2,1],
	    products: [{0:2,3:1,2:3}, {1:2,2:1}],
	    reproduction: 0,
	   },
	8: {
	    reagents: [{0:2,1:3,2:2,3:1}, {2:2}], 
	    start: [2,1],
	    products: [{0:1,2:1}, {1:2,2:1}, {1:1,3:1}],
	    reproduction: 0,
	   },
	
	9: {
	    reagents: [{0:1,1:2},{3:3, 1:1}, {1:2}], 
	    start: [3,4,1],
	    products: [{0:1,3:4}, {1:3}],
	    reproduction: 0,
	   },
	10: {
	    reagents: [{0:2,1:1}, {1:2}], 
	    start: [1,1],
	    products: [{0:2,1:2}],
	    reproduction: 1,
	   },
	11: {
	    reagents: [{0:1},{1:2,2:1}], 
	    start: [1,1],
	    products: [{0:1,1:1,2:1},{1:2}],
	    reproduction: 1,
	   },
	12: {
	    reagents: [{1:2,2:6,3:1},{3:2}], 
	    start: [1,1],
	    products: [{1:1,3:2}, {2:2,3:1}],
	    reproduction: 1,
	   },
	13: {
	    reagents: [{1:2,3:5},{0:2,3:1}], 
	    start: [1,1],
	    products: [{0:1,1:1,3:3}],
	    reproduction: 1,
	   },
	14: {
	    reagents: [{1:1,2:2},{0:2,3:3}], 
	    start: [1,1],
	    products: [{1:1,3:1}, {0:1,2:3}],
	    reproduction: 1,
	   },
	15: {
	    reagents: [{0:2},{1:2,3:1}], 
	    start: [1,1],
	    products: [{0:1,1:3}, {3:2}],
	    reproduction: 1,
	   },
	
	16: {
	    puzzles: [{reagents: [{1:1}, {3:2}], 
		       start: [1,1],
		       products: [{1:2,3:1}],
		      },
		     {reagents: [{0:5},{1:2}], 
		      start: [1,1],
		      products: [{0:1,1:2}],
		      },
		     {reagents: [{0:3},{1:2}], 
		      start: [1,1],
		      products: [{0:1,1:2}],
		      },
		     {reagents: [{0:1},{1:2}], 
		      start: [1,1],
		      products: [{0:1,1:4}],
		      },
		      {reagents: [{0:1},{1:4}], 
		      start: [1,1],
		      products: [{0:3,1:2}],
		      }
		     ],
	    reproduction: 2,
	   },
	17: {
	    puzzles: [{reagents: [{0:2,1:3,3:3},{1:2}], 
		       start: [1,1],
		       products: [{0:1,1:2}, {1:1,3:1}],
		      },
		      {reagents: [{0:1,1:2},{2:1,3:1}], 
		       start: [1,1],
		       products: [{0:1,3:4}, {2:2,1:1}],
		      },
		      {reagents: [{0:1,1:3}, {2:1,3:1}], 
		       start: [1,1,1],
		       products: [{2:1},{0:2},{1:2,3:1}],
		      },
		     {reagents: [{0:2,1:3}, {2:1}], 
		      start: [1,1],
		      products: [{2:3,1:4},{0:1}],
		     }],
	    reproduction: 2,
	   },
	18: {
	    puzzles: [{reagents: [{0:2,1:5},{2:2,1:1}], 
		       start: [1,1],
		       products: [{0:1,1:3,2:1}],
		      },
		      {reagents: [{0:1,1:2},{2:2,3:1}], 
		       start: [1,1],
		       products: [{1:1,2:1}, {0:1,3:1}],
		      },
		      {reagents: [{0:1,1:2,2:1,3:4}], 
		       start: [1,1],
		       products: [{0:1,2:1,3:3}, {1:2,3:1}],
		      },
		      {reagents: [{1:2,2:1,3:3}], 
		       start: [1,1],
		       products: [{2:1,3:2}, {1:2,3:1}],
		      }
		     ],
	    reproduction: 2,
	},
	19: {
	    puzzles: [{reagents: [{0:4,1:10},{2:2,1:1}], 
		       start: [1,1],
		       products: [{2:3,0:1,1:4}],
		      },
		      {reagents: [{0:1},{1:2,2:1}], 
		       start: [1,1],
		       products: [{0:3,2:4}, {1:2}],
		      },
		      {reagents: [{0:1},{2:3,3:1}], 
		       start: [1,1],
		       products: [{3:1},{0:1,2:2}],
		      },
		      {reagents: [{0:2,1:3},{2:1},{3:2}], 
		       start: [1,1,1],
		       products: [{0:1,3:1},{2:1,1:1}],
		      },
		     ],
	    reproduction: 2,
	   },
	20: {
	    puzzles: [{reagents: [{0:1,1:4},{2:1,3:1}], 
		      start: [1,1],
		      products: [{0:1,1:2,2:2}, {1:1,3:1}],
		     },
		     {reagents: [{0:2,1:3,3:3},{2:2}], 
		       start: [1,1],
		       products: [{0:1,2:2}, {1:1,3:1}],
		     },
		      {reagents: [{0:1,1:3,2:3},{2:2,3:1,1:3}], 
		      start: [1,1],
		       products: [{0:2,3:3,1:9},{2:2,1:1}],
		      },
		     
		     ],
	    reproduction: 2,
	},
	21: {
	    puzzles: [
		{reagents: [{0:1,1:3,2:3},{2:2,3:1,1:4}], 
		 start: [1,1],
		 products: [{0:2,3:3,1:12},{2:2,1:1}],
		},
		{reagents: [{0:1,1:1,2:1,3:3}], 
		 start: [1,1,1],
		 products: [{0:2,2:1,3:3},{1:2,3:1},{2:1,3:2}],
		},{reagents: [{0:2,1:5},{2:1}], 
		 start: [1,1],
		 products: [{0:1},{2:2,1:3}],
		},
		
	    ],
	    reproduction: 2,
	},
	22: {
	    puzzles: [
		{reagents: [{0:1,1:1}, {2:2}],
		start: [1,1],
		products: [{0:1,2:1}, {1:1,2:2}]
		},
		{reagents: [{0:6,1:12,2:6},{2:2}], 
		 start: [1,1],
		 products: [{1:2,2:1}, {0:1,2:2}],
		},
		{reagents: [{0:3,1:2},{2:2,3:1}], 
		 start: [1,1],
		 products: [{0:1,2:2,3:2}, {1:1,2:3}],
		},
		
	    ],
	    reproduction: 2,
	},
	23: {
	    puzzles:[{reagents: [{0:1},{1:2,2:1},{2:2}], 
		 start: [1,1,1],
		 products: [{0:2,2:4,1:2}],
		},
		{reagents: [{0:1,1:4},{2:2,3:1}], 
		 start: [1,1,1],
		 products: [{2:4,0:1,3:4},{2:1,1:1}],
		}
	    ],
	    reproduction: 2,

	},
	24: {
	    puzzles: [
		
		{reagents: [{0:1,1:2},{2:1,1:2}], 
		 start: [1,1],
		 products: [{0:2,2:1,1:3}, {1:2}],
		},
		{reagents: [{0:4,1:3,},{2:2,3:1}], 
		 start: [1,1],
		 products: [{1:1,2:4}, {0:1,2:3,3:3}],
		},
	    ],
	    reproduction: 2,
	},
	25: {
	    puzzles: [
		
		{reagents: [{0:1,1:3,},{0:1,2:1}], 
		 start: [1,1],
		 products: [{0:2}, {1:2,2:1}],
		},
		{reagents: [{0:1,1:3,},{0:1,2:1}], 
		       start: [1,1],
		       products: [{0:2}, {1:2,2:1}],
		},
		{reagents: [{0:2,1:2},{2:2}], 
		       start: [1,1],
		       products: [{1:2,2:1}, {0:1,2:2}],
		}
	    ],
	    reproduction: 2
	},
	26: {
	    puzzles: [{reagents: [{0:1}, {1:1,2:1,3:3}], 
		       start: [1,1,1],
		       products: [{0:1,2:1,3:3},{2:1,3:1},{1:2,3:1}],
		      },
		      {reagents: [{0:2},{1:2,3:1}], 
		       start: [1,1],
		       products: [{0:1,1:3}, {3:2}]
		      },
		      {reagents: [{0:1}, {1:1,2:1,3:3}], 
		       start: [1,1,1],
		       products: [{1:2,0:1,3:4},{2:1,3:2},{1:2,3:1}],
		      },
		
		     ],
	    reproduction: 2,
	},
	27: {
	    puzzles: [
		      {reagents: [{0:1,1:2,},{2:2}], 
		       start: [1,1],
		       products: [{0:2,2:3}, {1:1,2:2}],
		      },
		      {reagents: [{0:2,1:6},{2:2}], 
		       start: [1,1],
		       products: [{1:2,2:1}, {0:1,2:2}],
		      },
		    
		     ],
	    reproduction: 2,
	},
	28: {
	    puzzles: [
		     {reagents: [{0:1}, {1:1,2:1,3:3}], 
		      start: [1,1,1],
		       products: [{0:1,2:2,3:6},{2:1,3:1},{1:2,3:1}],
		      },
		     {reagents: [{0:6,1:6},{2:2}], 
		       start: [1,1],
		       products: [{1:2,2:1}, {0:1,2:2}],
		      },
		      {reagents: [{0:2},{1:2,3:1}], 
			 start: [1,1],
			 products: [{0:1,1:3}, {3:2}],
		     }],
	    reproduction: 2,
	   },
    };


    $("#myCanvas").on("mousedown", function(evt) {
	
	if (menu === 1) {
	    if (tip_level <= tip_expected[menu_selection]) {
		tip_level += 1;
		pinned = true;
	    }
	    else {
		pinned = false;
	    }

	    if (solved && evt.pageY > dy+h*0.2) {
		if (Modernizr.localstorage) {
		    localStorage.setItem(menu_selection, true);
		}
		solved_level = 1;
		if (menu_selection === 28) {
		    menu = 0;
		    solved = false;
		    locked = false;
		    atoms = [];
		    menu_selection = false;
		    resizeCanvas();
		}
		else {
		    menu_selection += 1;
		    solved = false;
		    locked = false;
		    atoms = [];
		    startPuzzle(collection[menu_selection]);
		}
		return;
	    }

	    if (evt.pageX > dx+w*0.955 && evt.pageX < dx+w*0.99) {
		if (evt.pageY > 0.105*h+dy && evt.pageY < 0.155*h+dy) {
		    menu = 0;
		    if (solved && Modernizr.localstorage) {
			localStorage.setItem(menu_selection, true);
		    }
		    solved = false;
		    locked = false;
		    current_puzzle = false;
		    atoms = [];
		    menu_selection = false;
		    resizeCanvas();
		    return;
		} 

		if (evt.pageY > 0.03*h+dy && evt.pageY < 0.09*h+dy) {
		    solved = false;
		    locked = false;
		    atoms = [];
		    startPuzzle(collection[menu_selection]);
		    
		} 
	    }
	    resizeCanvas();

	    if ((collection[menu_selection].reproduction === 1 || (collection[menu_selection].reproduction === 2 && !locked))) {
		if (!solved && !pinned) {
		    for (var i in atoms) {
			if (atoms[i].kind === 2 && atoms[i].collideUp(evt.pageX, evt.pageY)) {
			    atoms[i].reproduce();
			}
			if (atoms[i].kind === 2 && atoms[i].number > 1 && atoms[i].collideDown(evt.pageX, evt.pageY)) {
			    var kill;
			    for (var j = atoms.length-1; j >= 0; j--) {
				if (atoms[j].kind === 1 && atoms[j].equals(atoms[i])) {
				    kill = j;
				    break;
				}
			    }
			    if (typeof kill != "undefined") {
				atoms.splice(kill, 1);
				atoms[i].number--;
				solved = correctPuzzle();
				resizeCanvas();
				
			    }
			}
		    }
		}
	    }
	    if (!solved && !pinned) {
		for (var i in atoms) {
		    if (atoms[atoms.length-1-i].picked(evt.pageX, evt.pageY) && atoms[atoms.length-1-i].kind === 1) {
			selected = atoms[atoms.length-1-i];
			var tmp = atoms.splice(atoms.length-1-i,1);
			atoms.push(tmp[0]);
			resizeCanvas();
			break;
		    }
		}
	    }
	    
	}
	else if (menu === 0) {
	    if (menu_selection) {
		menu = 1;
		document.body.style.cursor = "auto";
		startPuzzle(collection[menu_selection]);
		
	    }
	}
	else if (menu === 2) {
	    pinned = false;
	    if (evt.pageX > dx+0.2*w && evt.pageX < dx+0.8*w && evt.pageY > dy+0.1*h && evt.pageY < dy+0.9*h) {
		selected_equation = parseInt((evt.pageY-dy)/(0.1*h));
		
		menu = 3;
		atoms = [];
		document.body.style.cursor = "auto";
		startTeacherPuzzle(equation_collection[selected_equation]);
		resizeCanvas();
	    }
	    if (evt.pageX > dx+w*0.955 && evt.pageX < dx+w*0.99) {
		if (evt.pageY > 0.105*h+dy && evt.pageY < 0.155*h+dy) {
		    menu = 0;
		    
		    resizeCanvas();
		    return;
		} 
	    }
	    
	}
	else if (menu === 3) {
	    for (var i in atoms) {
		if (atoms[i].kind === 2 && atoms[i].collideUp(evt.pageX, evt.pageY) && !solved) {
		    atoms[i].reproduce();
		}
		if (atoms[i].kind === 2 && atoms[i].number > 1 && atoms[i].collideDown(evt.pageX, evt.pageY) && !solved) {
		    var kill;
		    for (var j = atoms.length-1; j >= 0; j--) {
			if (atoms[j].kind === 1 && atoms[j].equals(atoms[i])) {
			    kill = j;
			    break;
			}
		    }
		    if (typeof kill != "undefined") {
			atoms.splice(kill, 1);
			atoms[i].number--;
			solved = correctPuzzle();
			resizeCanvas();
				
		    }
		}
		
	    }

	    for (var i in atoms) {
		if (atoms[atoms.length-1-i].picked(evt.pageX, evt.pageY) && atoms[atoms.length-1-i].kind === 1 && !solved) {
		    selected = atoms[atoms.length-1-i];
		    var tmp = atoms.splice(atoms.length-1-i,1);
		    atoms.push(tmp[0]);
		    resizeCanvas();
		    break;
		}
	    }

	    if (solved && evt.pageX > dx+w*0.482 && evt.pageX < dx+w*0.518 && evt.pageY > dy+h*0.48 && evt.pageY < dy+h*0.52) {
		menu = 2;
		    atoms = [];
		    completed = false;
		    solved = false;
		    resizeCanvas();
		return;
	    }

	     if (evt.pageX > dx+w*0.955 && evt.pageX < dx+w*0.99) {
		if (evt.pageY > 0.105*h+dy && evt.pageY < 0.155*h+dy) {
		    menu = 2;
		    atoms = [];
		    completed = false;
		    solved = false;
		    resizeCanvas();
		    return;
		} 

		if (evt.pageY > 0.03*h+dy && evt.pageY < 0.09*h+dy && completed) {
		    atoms = [];
		    solved = false;
		    startTeacherPuzzle(equation_collection[selected_equation]);
		    resizeCanvas();
		} 
		if (evt.pageY > 0.17*h+dy && evt.pageY < 0.23*h+dy) {
		    completed = !completed;
		    resizeCanvas();
		} 
	     }
	}
	
    });


    $("#myCanvas").on("mouseup", function(evt) {
	if (selected) {
	    if (selected.pending_merge) {
		selected.accept_merge();
	    }
	    selected = false;
	    resizeCanvas();
	}
    });

    	
    $("#myCanvas").on("mousemove", function(evt) {
	var cursor = "auto";
	if (menu === 1 || menu === 3) {
	    if (solved && evt.pageY > dy+h*0.2) {
		cursor = "pointer";
	    }

	    if (selected){
		selected.x = selected.relative_x(-selected.drag_delta[0]+evt.pageX);
		selected.y = selected.relative_y(-selected.drag_delta[1]+evt.pageY);
		selected.limit_movement();
		selected.cancel_split();
		resizeCanvas();
	    }
		
	    for (var i in atoms) {
		if (atoms[i].kind === 1 && atoms[i].collide(evt.pageX,evt.pageY) && !solved) {
		    cursor = "pointer";
		}
	    }
	    if (evt.pageX > dx+w*0.955 && evt.pageX < dx+w*0.99) {
		if ((evt.pageY > 0.105*h+dy && evt.pageY < 0.155*h+dy) || (evt.pageY > 0.03*h+dy && evt.pageY < 0.09*h+dy && menu === 1)) {
		    cursor = "pointer";
		}
		if (menu === 3 && (evt.pageY > 0.17*h+dy && evt.pageY < 0.23*h+dy)) {
		    cursor = "pointer";
		}
		if (menu === 3 && (evt.pageY > 0.03*h+dy && evt.pageY < 0.09*h+dy && completed)) {
		    cursor = "pointer";
		}
	    }

	    var collision = false;
	    if (selected) {
		for (var i in atoms) {
		    if (atoms[i] != selected) {
			if (atoms[i].collide(evt.pageX,evt.pageY) && selected.collide(evt.pageX,evt.pageY)) {
			    collision = true;
			    if (!selected.pending_merge)
				selected.merge(atoms[i]);
			    break;
			}
		    }
		}
		if (!collision && selected.pending_merge) {
		    selected.cancel_merge();
		}
	    }


	    if (menu === 3 || (collection[menu_selection].reproduction === 1 || (collection[menu_selection].reproduction === 2 && !locked))) {
		if (!solved && !pinned) {
		    for (var i in atoms) {
			if (atoms[i].kind === 2 && atoms[i].collideUp(evt.pageX, evt.pageY)) {
			    cursor = "pointer";
			}
			if (atoms[i].kind === 2 && atoms[i].number > 1 && atoms[i].collideDown(evt.pageX, evt.pageY)) {
			    cursor = "pointer";
			}
		    }
		}
	    }
			

	    document.body.style.cursor = cursor;
	}
	else if (menu === 0) {
	    var tmp = false;
	    for (var i=0; i < 4; i++) {
		for (var j=0; j < 7; j++) {
		    if (evt.pageX > dx+(0.1+0.12*j)*w && evt.pageX < dx+(0.1+0.12*j)*w+w*0.08 && evt.pageY > dy+(0.07+0.2*i)*h && evt.pageY < dy+(0.07+0.2*i)*h + w*0.08) {
			tmp = i*7+j+1;
			cursor = "pointer";
			break;
			
		    }
		}
	    }
	    if (tmp != menu_selection) {
		menu_selection = tmp;
		resizeCanvas();
	    }
	    

	    if (evt.pageX > dx+0.52*w && evt.pageX < dx+0.97*w && evt.pageY > dy+0.87*h && evt.pageY < dy+h) {
		cursor = 'pointer';
	    }
	    
	    
	    document.body.style.cursor = cursor;
	    
	}
	else if (menu === 2) {
	    if (evt.pageX > dx+0.2*w && evt.pageX < dx+0.8*w && evt.pageY > dy+0.1*h && evt.pageY < dy+0.9*h) {
		cursor = "pointer";
	    }
	    if (evt.pageX > dx+w*0.955 && evt.pageX < dx+w*0.99) {
		if ((evt.pageY > 0.105*h+dy && evt.pageY < 0.155*h+dy)) {
		    cursor = "pointer";
		}
		
	    }
	    document.body.style.cursor = cursor;
	}
    });


    $("#myCanvas").on("dblclick", function(evt) {
	if (!solved && !pinned) {
	    for (var i in atoms) {
		if (atoms[atoms.length-1-i].picked(evt.pageX,evt.pageY) && atoms[atoms.length-1-i].kind === 1) {
		    atoms[atoms.length-1-i].split(evt.pageX,evt.pageY);
		    break;
		}
	    }
	}
    });

    $(document).on("keydown", function(evt) {
	if (menu === 0) {
	    if (evt.keyCode === 16) {
		ctrl = true;
	    }
	    if (evt.keyCode === 65 && ctrl === true) {
		menu = 2;
		document.body.style.cursor = "auto";
		resizeCanvas();
	    }
	    
	}
	
    });
    $(document).on("keyup", function(evt) {
	if (menu === 0) {
	    if (evt.keyCode === 16) {
		ctrl = false;
	    }

	}
	
    });
    
});
