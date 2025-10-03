var resolution = 300;
var size;
var totalObjectArray = [];
totalObjectArray.push()
var circleSprite = [[0,1,0],[1,1,1],[0,1,0]];
var cubeSprite = [];
var rectangleSprite = [[1,1], [1,1], [1,1]];



for (var x = 0; x < 10; x++) {
    cubeSprite.push([]);
    for (var y = 0; y < 10; y++) {
        cubeSprite[x].push(1);
    }
}


function createFrame(newResolution) {
    resolution = newResolution;
    var frameBody = document.getElementById('Frame');
    frameBody.innerHTML = "";
    for(var x = 0; x < resolution; x++){
        var row = document.createElement('tr');
        for(var y = 0; y < resolution; y++){
            var pixel = document.createElement('td');
            pixel.style.width = "1px";
            pixel.style.height = "1px";
            pixel.style.backgroundColor = "black";
            pixel.setAttribute("id", `${x} ${y}`);
            row.appendChild(pixel);
        }
        frameBody.appendChild(row);
    }
    renderFrame();
}


function renderFrame() {
    for(var x = 0; x < resolution; x++){
        for(var y = 0; y < resolution; y++){
            document.getElementById(`${x} ${y}`).style.backgroundColor = "black";
        }
    }

    for(var l = 0; l < layers.length; l++){
        var layer = layers[l];
        for(var i = 0; i < layer.objectArray.length; i++){
            var obj = layer.objectArray[i].objSize;
            var colour = obj.color;
            for(var sprite_x = 0; sprite_x < obj.sprite.length; sprite_x++){
                for(var sprite_y = 0; sprite_y < obj.sprite[0].length; sprite_y++){
                    if(obj.sprite[sprite_x][sprite_y]) {
                        var xPos = sprite_x + obj.x;
                        var yPos = sprite_y + obj.y;

                        if(xPos >= 0 && xPos < resolution && yPos >= 0 && yPos < resolution){
                            var cell = document.getElementById(`${xPos} ${yPos}`);
                            if(cell) {
                                cell.style.backgroundColor = colour;
                            }
                        }
                    }
                }
            }
        }
    }
    for(var i = 0; i < (totalObjectArray.length - 1); i++){
        var x0 = totalObjectArray[i].x;
        var y0 = totalObjectArray[i].y;
        var x1 = totalObjectArray[i + 1].x;
        var y1 = totalObjectArray[i + 1].y;
        var line = getLineCoordinates(x0, y0, x1, y1);
        drawLine(line);
    }
}


var i = 0;
var xdir = 0;
var ydir = 1;
var moving_x_dir = 0;
var moving_y_dir = 1;

class Layer {
    constructor(z, objectArray){
        this.z = z;
        this.objectArray = objectArray;
    }
}

class Object {
    constructor(x, y, z, color, sprite) {
        this.x = x;
        this.y = y;
        this.sizeX = sprite.length;
        this.sizeY = sprite[0].length;
        this.color = color;
        this.sprite = sprite;
        this.z = z;
    }

    get objSize() {
        return {
            x: this.x,
            y: this.y,
            sizeX: this.sizeX,
            sizeY: this.sizeY,
            color: this.color,
            sprite: this.sprite
        };
    }
}

function addObject(object){
    var layer = layers[object.z]
    layer.objectArray.push(object)
    totalObjectArray.push(object)
}

function getLineCoordinates(x0, y0, x1, y1) { // with https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
    const coordinates = [];

    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        coordinates.push({ x: x0, y: y0 });

        if (x0 === x1 && y0 === y1) break;

        let e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }

    return coordinates;
}

var line = getLineCoordinates(2, 3, 7, 6);

function drawLine(line){
    for(var i = 0; i < line.length; i++){
        var x = line[i].x;
        var y = line[i].y;
        var cell = document.getElementById(`${x} ${y}`); 
        if(cell) {
            cell.style.backgroundColor = 'red';
        } else {
            console.log(`Missing cell at ${x}-${y}`);
        }
    }
}



var layer1 = new Layer(0, []);
var layer2 = new Layer(1, []);
var layer3 = new Layer(2, []);
var layers = [layer1, layer2, layer3]

for (var x = 0; x < 300; x += 30) {
    var y = Math.floor(Math.random() * resolution) + 1
    var cube = new Object(y, x, 0, 'lightgrey', cubeSprite);
    addObject(cube);
}