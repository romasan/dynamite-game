var DWIDTH, DHEIGHT, SCALINGFACTOR, BANNERHEIGHT, GAMESPACE;
var level = 0,
	levels = [];
	var SIZES = {
		point : 15,
		//comumn : 30 + 2,
		ball : 0,
		pointsbar : 20,
		margin : {
			x : 10,
			y : 10
		},
		box : 400,
		lamp : {
			length : 384,//350 < 400!
			height : 83//70
		}
	}
	var BOX   = 1,
		EMPTY = 0;
	var levels = [];
var points = 0,
	level = 0;
	var N,
	  W,  E,
		S;
	N = 1;
	W = 2;
	E = 3;
	S = 4;
var dynamite = {
	w : 100,
	h : 58
}
//---------------------------------------------------------------------------------------------------
function scaling(i) {
	var _w = document.body.clientWidth,
		_h = document.body.clientHeight,
		SCALINGFACTOR = _w / ((_w > _h)?480:320)
	return i * SCALINGFACTOR
}
//---------------------------------------------------------------------------------------------------
burncount = 0;
var burn = function(a) {//{x, y}, width, step, start, end, f, time, starttime}
	burncount += 1;
	this.removed = false;
	this.x     = a.x
	this.y     = a.y
	if(Game.lamps[this.y][this.x] == 2){
		//alert('gameover')
		Game.over();
		/*gameover*/
	}
	Game.lamps[this.y][this.x] = 0;
	this.even  = this.y % 2
	$('#l_x_y_' + this.x + '_' + this.y).addClass(this.even?'vlampl':'glampl')
	this.step  = 0
	this.start = 3
	this.end   = 4
	this.time  = 2000
	//draw el
	//left = (even)
	var _s = (DWIDTH - scaling(40)) / Game.width,
		_h = scaling(15),
		_l = ((DWIDTH > 360)?0:scaling(10)) + _s * this.x - (this.even?_s/2:0),
		_t = scaling(10) + _s * this.y/2 - (this.even?_s/2:0) - (this.even?0:_s/2)
	this.w = _s
	var _this = this,
		_f = function() {
			//alert(_this.x + ' ' + _this.y);
			_this.removed = true;
		}
	this.el = $('<div>')
		.css({
			position : 'absolute',
			left     : _l + 'px',
			top      : _t + 'px',
			width    : this.w + 'px',
			height   : this.w + 'px',
			//border   : '1px dashed #fff',
			'background-image' : 'url(burn.png)',
			'background-size'  : this.w * (this.end + 1) + 'px ' + this.w + 'px'
		})
		//.click(function(){_f()})
		.swipe({
			swipeStatus : function(event, phase, direction, distance, duration, fingers) {
				if( phase == 'start' ) {
					_f()
				}
			}
		})
	$('#map').append(this.el)
	
	//gameover if this in center
	this.stepbystep = function() {
		if(this.removed){
			$(this.el).remove();
			burncount -= 1;
			if(burncount == 0) {
				Game.win()
			}
			return
		}
		//console.log('step by step', this.x, this.y, this.step)
		if(typeof this.starttime == 'undefined') {
			this.starttime = new Date().getTime();
		}
		if(new Date().getTime() - this.starttime > this.time) {
				// remove this el
				$(this.el).remove()
				burncount -= 1;
				$('#l_x_y_' + this.x + '_' + this.y).addClass((this.even?'v':'g') + 'lamp')
				// burn next elements
				var f = 0;
				if(this.even) {
					// # a
					// b c
					// # X
					// d e
					// # f
					
					if(Game.getlamp(this.x,     this.y - 2)) {new burn({x : this.x,     y : this.y - 2});f++}
					if(Game.getlamp(this.x - 1, this.y - 1)) {new burn({x : this.x - 1, y : this.y - 1});f++}
					if(Game.getlamp(this.x,     this.y - 1)) {new burn({x : this.x,     y : this.y - 1});f++}
					if(Game.getlamp(this.x - 1, this.y + 1)) {new burn({x : this.x - 1, y : this.y + 1});f++}
					if(Game.getlamp(this.x,     this.y + 1)) {new burn({x : this.x,     y : this.y + 1});f++}
					if(Game.getlamp(this.x,     this.y + 2)) {new burn({x : this.x,     y : this.y + 2});f++}
				} else {
					// # a b
					// c X d
					// # e f
					if(Game.getlamp(this.x,     this.y - 1)) {new burn({x : this.x,     y : this.y - 1});f++}
					if(Game.getlamp(this.x + 1, this.y - 1)) {new burn({x : this.x + 1, y : this.y - 1});f++}
					if(Game.getlamp(this.x - 1, this.y    )) {new burn({x : this.x - 1, y : this.y    });f++}
					if(Game.getlamp(this.x + 1, this.y    )) {new burn({x : this.x + 1, y : this.y    });f++}
					if(Game.getlamp(this.x,     this.y + 1)) {new burn({x : this.x,     y : this.y + 1});f++}
					if(Game.getlamp(this.x + 1, this.y + 1)) {new burn({x : this.x + 1, y : this.y + 1});f++}
				}
				if(f == 0 &&burncount == 0) {
					console.log('***');
					Game.win()
				}
		} else {
			var _this = this,
				_f = function() {
					_this.stepbystep();
				}
			setTimeout(_f, 100);
		}
		$(this.el).css({
			'background-position' : -(this.w * this.step) + 'px 0px'//-(this.w * this.step) + 'px 0px'
		})
		this.step = (this.step >= this.end)?this.start:this.step + 1
	}
	this.stepbystep();
}
//-----------------------------------------------------------------------------------------------------
var Game = {
	width      		: 5,//9 | 7
	height     		: 7,//6 | 9
	//objectsnum 		: 5,//6
	up				: false,
	map : [],
	lamps : [],
	lampspatch : [],
	logarr2 : function(a){// выводит в консоль двумерный массив
		for(i in a) {
			var str = "";
			for(j in a[i]) {
				str += a[i][j] + ' ';
			}
			console.log(str);
		}
	},
	getlamp : function(x, y) {
		//console.log(x + ' ' + y);
		if(y < 0 || y > this.lamps.length - 1) {
			return 0;
		} else if(x < 0 || x > this.lamps[y].length - 1) {
			return 0;
		}
		return this.lamps[y][x];
	},
	drawlamp : function(x, y){//j, i
		var even = y % 2,
			s    = (DWIDTH - scaling(40)) / Game.width,
			h    = scaling(15),
			_l   = (DWIDTH > 360)?0:scaling(10),
			l    = $('<div>')
			.addClass('lamp')
			.addClass(((even)?'vlamp':'glamp'))
			.attr('id', ('l_x_y_' + x + '_' + y))
			.data({
				x : x,
				y : y
			})
			.css({
				left   : _l + s * x - (even?h/2:0) + 'px',
				top    : scaling(10) + s * y/2 - (even?s/2:0) - (even?0:h/2) + 'px',
				width  : (even)?h:s + 'px',
				height : (even)?s:h + 'px'
			})
		return l;
	},
	draw : function() {
		$('#map').html('');
		$('.explosive').remove();
		this.width  = this.lamps[0].length;
		this.height = this.lamps.length;
		console.log('start draw');
		var _c = false;
		for(var y = 0; y < this.lamps.length; y++) {
			for(var x = 0; x < this.lamps[y].length; x++) {
				//this.lamps[y][x] = 1;
				if(this.lamps[y][x] >= 1) {
					$('#map').append(this.drawlamp(x, y));
				}
				if(this.lamps[y][x] == 2 && !_c) {
					_c = {x : x, y : y}
				}
			}
		}
		//TODO burn
		//TODO stew fire
//		$('#map').delegate('.lamp', 'click', function(){
			//$('.lamp').click(function() {
//			var _c = $(this).data()
			//get this {x,y}
			//if()
//		});
		console.log(_c)
		var even = _c.y % 2,
			_s = (DWIDTH - scaling(40)) / Game.width,
			_h = scaling(15),
			_l = ((DWIDTH > 360)?0:scaling(10)) + _s * (_c.x),
			_t = scaling(10) + _s * (_c.y/2 + 1)
		$('body').append(
			$('<div>')
				.addClass('explosive')
				.css({
					width  : scaling(dynamite.w) + 'px',
					height : scaling(dynamite.h) + 'px',
					left   : _l /*DWIDTH  / 2 - scaling(dynamite.w) / 2*/ + 'px',
					top    : _t /*DHEIGHT / 2 - scaling(dynamite.h) / 2*/ + 'px'
				})
		);
		for(var y = 0; y < this.lamps.length; y++) {
			for(var x = 0; x < this.lamps[y].length; x++) {
				if(this.lamps[y][x] == 3) {
					new burn({x : x, y : y});
				}
			}
		}
	},
	win : function() {
		$('#youwin').html(lang.youwin).show().css({'z-index' : 999});
		if(level < levels.length) {
			level += 1;
			setTimeout(function() {
				Game.startgame();
				//$('#gamescreen').show();
				$('#youwin').hide();
			}, 3000);
		}
	},
	over : function() {
		$('#youwin').html(lang.gameover).show().css({'z-index' : 999});
		setTimeout(function() {
			//Game.startgame();
			//$('#gamescreen').show();
			document.location.reload();
			$('#youwin').hide();
		}, 3000);
	},
	startgame : function(){
		
		$('#points').html(points);
		$('#level').html(level);
		// для каждой новой карты (другого размера)
		//var l = parseInt(localStorage['closedchainlevel']);
		//this.map = levels[level].map;
		$('#gamescreen').show();
		$('#startscreen').hide();
		
		var mapsize = {
			x : Game.width,
			y : Game.height
		}

		if(mapsize.x > mapsize.y){
			SIZES.ball = GAMESPACE.X / mapsize.x;
		} else {
			if( GAMESPACE.X / mapsize.x * mapsize.y > GAMESPACE.Y ){
				SIZES.ball = GAMESPACE.Y / mapsize.y;
			} else {
				SIZES.ball = GAMESPACE.X / mapsize.x;
			}
		}
		$('#map').css({
			left   : '4%',//SIZES.margin.x * SCALINGFACTOR + 'px',//( SIZES.margin.x * SCALINGFACTOR ),
			top    : (SIZES.margin.y * SCALINGFACTOR + SIZES.pointsbar * SCALINGFACTOR) + 'px',
			width  : GAMESPACE.X,
			height : GAMESPACE.Y//, border : '1px solid #f00'
		});
		//SIZES.margin.x = ( ( DWIDTH - (SIZES.ball * mapsize.x) ) / 2 - SIZES.margin.x * SCALINGFACTOR);
		SIZES.margin.x = ( ( DWIDTH - (SIZES.ball * mapsize.x) ) / 2 ) - SIZES.margin.x;
		console.log(SIZES.margin.x);
		// ----------------------------------------
		this.lamps = []
		this.lamps = levels[level].map
		this.draw();
	},
	init : function(){
		$('#points').html(points);
		$('#level').html(level);
	}
}
//-----------------------------------------------------------------------------------------------------
$(document).ready(function(){
	Game.init();
	DWIDTH = document.body.clientWidth;
	DHEIGHT	= document.body.clientHeight;
	SCALINGFACTOR = DWIDTH / 320;
	BANNERHEIGHT = SCALINGFACTOR * 50;
	SIZES.margin.x = SIZES.margin.x * SCALINGFACTOR;
	SIZES.margin.y = SIZES.margin.y * SCALINGFACTOR;
	GAMESPACE = {
		X : DWIDTH - ( SIZES.margin.x * 2 ),
		Y : DHEIGHT - BANNERHEIGHT - SIZES.margin.y - SIZES.pointsbar
	}
	$('#youwin').css('width', (DWIDTH - 30 + 'px'));
	$('#startscreen').append(
		$('<div>').css({
			'font-family' : 'comic sans ms',
			'font-size' : '30pt',
			color : '#fff',
			'text-shadow' : '0px -2px #000',
			'text-align' : 'center',
			width : '100%',
			position : 'absolute',
			top : '40%',
			left : '0px'
		})
		.html(lang.title)
	)
	$('#playbutton').css({
		width : (160 * SCALINGFACTOR) + 'px',
		height : (60 * SCALINGFACTOR) + 'px',
		left : (DWIDTH / 2 - 80 * SCALINGFACTOR) + 'px',
		bottom : 120 * SCALINGFACTOR
	})
	.click(function(){
		Game.startgame();
	});
	$('#pointsbar').css({
		height        : ( ( ( SIZES.pointsbar * SCALINGFACTOR )|0 ) + 'px' ),
		'line-height' : ( ( ( SIZES.pointsbar * SCALINGFACTOR )|0 ) + 'px' )
	});
});