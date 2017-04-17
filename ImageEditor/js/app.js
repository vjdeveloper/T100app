var imgHeight, imgWidth;
var newWidth, newHeight;
var shapes = [];
var stage, layer;
var bg;
var selectedShape;
var isDragging = false;

var isTextMode = false;
var currentTextGroup;

$(document).ready(function() {
	var maxWidth = $('.col-md-12').width() - 20;
	var maxHeight = window.screen.availHeight - 200;	
	$('#rotate').click(function(){

		//swap height and width.
		var temp  = newHeight;
		newHeight = newWidth;
		newWidth = temp;

		stage.setHeight(newHeight);
		stage.setWidth(newWidth);
		bg.setX(newWidth/2);
		bg.setY(newHeight/2)
		bg.rotate(90);
		layer.draw();
	});

	$('#exampleText').change(function(){
		if($(this).val() == ""){
			$(this).parent('.form-group').toggleClass('has-error');
		}
		else{
			$(this).parent('.form-group').toggleClass('has-success');
		}
	});

	$('#addText').bind('click',function(){
		$('#myModal').modal('hide')
		var text = $('#exampleText').val();
		if(text == "")
		{
			return;
		}

		var size = $('#exampleTextSize').val();
		var bgcolor = $('#exampleBgColor').val();
		currentTextGroup = new Kinetic.Group({
			x: 0,
			y: 0
		});			
		var textObj = new Kinetic.Text({
			x: 0,
			y: 0,
			text: text,
			fontSize: size,
			fill: $('#color').val(),
			fillStyle : bgcolor
		});
		if(textObj.getWidth()>(newWidth-100))
			textObj.setWidth(newWidth-100)
		var textRectObj = new Kinetic.Rect({
			x: 0,
			y: 0,
			fill: bgcolor,
			width: textObj.getWidth(),
			height: textObj.getHeight()
		});
		currentTextGroup.add(textRectObj);
		currentTextGroup.add(textObj);

		shapes.push(currentTextGroup);
		layer.add(currentTextGroup);
		layer.draw();
		$('#textOverlay').show();
		isTextMode = true;
	});

	$('#exampleTextSize').bind("change",function(){
		$('#fontSizeDisplayer').html($(this).val()+"px")
	});

	$('#doneText').click(function(){
		$('#textOverlay').hide();
		isTextMode = false;
	});

	$('#undo').click(function() {
		if (shapes.length > 0) {
			var shapeToUndo = shapes[shapes.length - 1];
			shapeToUndo.destroy();
			layer.draw();
			shapes.splice(shapes.length - 1, 1);
		} else {
			alert("cant undo more");
		}
	});

	$('#open').change(function(evt) {
		var files = evt.target.files; // FileList object

		// Loop through the FileList and render image files as thumbnails.
		for (var i = 0, f; f = files[i]; i++) {

			// Only process image files.
			if (!f.type.match('image.*')) {
			continue;
			}

			var reader = new FileReader();

			// Closure to capture the file information.
			reader.onload = (function(theFile) {
			return function(e) {

				var imageObj = new Image();
				imageObj.onload = function() {
					var height = imageObj.height;
					var width = imageObj.width;
					/*
					 *Image data: (wi, hi) and define ri = wi / hi
					 * Screen resolution: (ws, hs) and define rs = ws / hs
					 * Scaled image dimensions:
					 * rs > ri ? (wi * hs/hi, hs) : (ws, hi * ws/wi)
					 */

					newWidth = width, newHeight = height;
					//console.log(height + "x" + width);
					if ((maxWidth / maxHeight) > (width / height)) {
						newWidth = width*(maxHeight/height);
						newHeight = maxHeight;				
					} else {
						newWidth = maxWidth;
						newHeight = height*(maxWidth/width);								
					}
					//console.log(newHeight + "x" + newWidth);
					bg = new Kinetic.Image({
				        x: newWidth/2,
						y: newHeight/2,
						image : imageObj,
						height : newHeight,
						width : newWidth,
						offset: {
				            x: newWidth/2,
				            y: newHeight/2
				        }				
					});

					stage = new Kinetic.Stage({
						container : 'container',
						width : $('.col-md-12').width() - 20,
						height : newHeight,
						width : newWidth
					});
					layer = new Kinetic.Layer();
					stage.add(layer);
					// add the shape to the layer
					layer.add(bg);
					layer.draw();
					setupEvents();
				};
				imageObj.src = e.target.result;				

			};
			})(f);

			// Read in the image file as a data URL.
			reader.readAsDataURL(f);	
		}	
	});

	$('#save').click(function() {
		stage.toDataURL({
			callback : function(dataUrl) {
            /*
             * here you can do anything you like with the data url.
             * In this tutorial we'll just open the url with the browser
             * so that you can see the result as an image
             */
            window.open(dataUrl);

			}
		});	
	});

	function Circle(mouseX, mouseY) {

		var circle = new Kinetic.Circle({
			x : mouseX,
			y : mouseY,
			myShape : true,
			radius : 1,
			stroke : $('#color').val(),
			strokeWidth : $('#width').val(),
			draggable : false
		});
		circle.resize = function(posX, posY) {
			//console.log(this.attrs);
			var dx = posX - this.attrs.x;
			var dy = posY - this.attrs.y;
			var r = Math.sqrt(dx * dx + dy * dy);
			this.setRadius(r);
		};
		shapes.push(circle);
		layer.add(circle);
		layer.draw();

		return circle;
	}

	function Rectangle(mouseX, mouseY) {

		var rect = new Kinetic.Rect({
			x : mouseX,
			y : mouseY,
			width : 1,
			height : 1,
			stroke : $('#color').val(),
			strokeWidth : $('#width').val(),
			draggable : false,
			startX : mouseX,
			startY : mouseY
		});

		rect.resize = function(posX, posY) {
	        var w = posX - this.attrs.x;
	        var h = posY - this.attrs.y;
	    	this.setWidth(w);
	    	this.setHeight(h);
		};
		shapes.push(rect);
		layer.add(rect);
		layer.draw();

		return rect;
	}

	function Oval(mouseX, mouseY) {

		var oval = new Kinetic.Ellipse({
			x : mouseX,
			y : mouseY,
			radius : {
				x : 1,
				y : 1
			},
			stroke : $('#color').val(),
			strokeWidth : $('#width').val(),
			draggable : false
		});

		oval.resize = function(posX, posY) {
			var dx = Math.abs(posX - this.attrs.x);
			var dy = Math.abs(posY - this.attrs.y);
			this.setRadiusX(dx);
			this.setRadiusY(dy);
		};
		shapes.push(oval);
		layer.add(oval);
		layer.draw();

		return oval;
	}

	function Line(mouseX, mouseY) {

		var line = new Kinetic.Line({
			points : [mouseX, mouseY, mouseX + 2, mouseY + 2],
			lineCap : 'round',
			lineJoin : 'round',
			stroke : $('#color').val(),
			strokeWidth : $('#width').val(),
			draggable : false
		});

		line.resize = function(posX, posY) {
			this.attrs.points[2] = posX;
			this.attrs.points[3] = posY;

		};
		shapes.push(line);
		layer.add(line);
		layer.draw();

		return line;
	}

	function Arrow(mouseX, mouseY) {

		var arrow = new Kinetic.Line({
			points : [mouseX, mouseY],
			lineCap : 'round',
			lineJoin : 'round',
			stroke : $('#color').val(),
			strokeWidth : $('#width').val(),
			draggable : false
		});
		function getArrowPoints(fromx, fromy, tox, toy){
		    var headlen = 8;   // how long you want the head of the arrow to be, you could calculate this as a fraction of the distance between the points as well.
		    var angle = Math.atan2(toy-fromy,tox-fromx);
		    return [fromx, fromy, tox, toy, tox-headlen*Math.cos(angle-Math.PI/5),toy-headlen*Math.sin(angle-Math.PI/5),tox, toy, tox-headlen*Math.cos(angle+Math.PI/5),toy-headlen*Math.sin(angle+Math.PI/5),tox-headlen*Math.cos(angle-Math.PI/5),toy-headlen*Math.sin(angle-Math.PI/5)];
		}
		arrow.resize = function(posX, posY) {
			this.setPoints(getArrowPoints(this.attrs.points[0],this.attrs.points[1],posX,posY));
		};
		shapes.push(arrow);
		layer.add(arrow);
		layer.draw();

		return arrow;
	}

	function getDesiredShape(mouseX, mouseY) {
		var shapeToDraw = $("#shape").val();
		switch(shapeToDraw) {
			case "Circle":
				return new Circle(mouseX, mouseY);
				break;
			case "Rectangle":
				return new Rectangle(mouseX, mouseY);
				break;
			case "Oval":
				return new Oval(mouseX, mouseY);
				break;
			case "Line":
				return new Line(mouseX, mouseY);
				break;
			case "Arrow":
				return new Arrow(mouseX, mouseY);
				break;
		}
	}
	function setupEvents() {

		stage.on('touchstart mousedown', function(event) {
			var pos = stage.getPointerPosition();
			var mouseX = parseInt(pos.x);
			var mouseY = parseInt(pos.y);
			if(!isTextMode){
				selectedShape = getDesiredShape(mouseX, mouseY);
				isDragging = true;
				isMaking = true;				
			}
			else{
				currentTextGroup.setX(mouseX);
				currentTextGroup.setY(mouseY);
				layer.draw();
			}
		});

		stage.on('touchmove mousemove', function(event) {
			var pos = stage.getPointerPosition();
			var posX = parseInt(pos.x);
			var posY = parseInt(pos.y);			
			if (!isDragging) {
				return;
			}
			selectedShape.resize(posX, posY);
			layer.draw();
		});

		stage.on('touchend mouseup', function(event) {
			isDragging = false;
		});
	}

});
