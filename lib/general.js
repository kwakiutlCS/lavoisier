$(function() {

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
	this.src ="lib/"+color+".png";

	this.img = new Image();
	this.img.src = this.src;

	this.dragging = false;
	this.drag_delta = [0,0];
	
    };

    Atom.prototype.draw = function() {
	ctx.drawImage(this.img, dx+(w-this.radius*w/1366)*this.x,dy+(h-this.radius*h/768)*this.y,w/1366*this.radius,h/768*this.radius);
	
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

    atoms.push(new Atom(0,0.5, "blue"));
    atoms.push(new Atom(1,1, "green"));

    $(atoms[1].img).on("load", function() {

	resizeCanvas();

    });


    $("#myCanvas").on("mousedown", function(evt) {
	for (var i in atoms) {
	    if (atoms[i].picked(evt.pageX, evt.pageY))
		atoms[i].dragging = true;
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
		resizeCanvas();
	    }
		
	}
    });

    
    
});