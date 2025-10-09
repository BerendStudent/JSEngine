var resolution = 500;
var totalObjectArray = [];
var circleSprite = [[0,1,0],[1,1,1],[0,1,0]];
var cubeSprite = [];
var rectangleSprite = [[1,1], [1,1], [1,1]];
var type = 'line';
var colors = ['lightgrey', 'blue', 'green'];
var line_colors = ['red', 'white', 'purple'];

for (var x = 0; x < 10; x++) {
    cubeSprite.push([]);
    for (var y = 0; y < 10; y++) {
        cubeSprite[x].push(1);
    }
}

var ctx;
var canvas;
var layers = [];

function createFrame(newResolution, data) {
    resolution = newResolution;
    totalObjectArray = [];
    layers = [new Layer(0, []), new Layer(1, []), new Layer(2, [])];
    canvas = document.getElementById('Frame');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const scaledData = normalizeData(data, resolution, 0.9); // scale + center with 90% padding
    loadData(scaledData);
    renderFrame();
}

function normalizeData(data, canvasSize, paddingRatio = 0.9) {
    if (data.length === 0) {
        return data;
    }

    let xs = data.map(p => p[0]);
    let ys = data.map(p => p[1]);
    let minX = Math.min(...xs);
    let maxX = Math.max(...xs);
    let minY = Math.min(...ys);
    let maxY = Math.max(...ys);
    let width = maxX - minX || 1; // width || 1 sets default value 
    let height = maxY - minY || 1;
    let scale = paddingRatio * canvasSize / Math.max(width, height);
    let offsetX = (canvasSize - width * scale) / 2;
    let offsetY = (canvasSize - height * scale) / 2;

    return data.map(([x, y]) => [
        (x - minX) * scale + offsetX,
        (y - minY) * scale + offsetY
    ]);
}

function renderFrame() {
    ctx.clearRect(0, 0, resolution, resolution);

    for (var l = 0; l < layers.length; l++) {
        var layer = layers[l];
        for (var i = 0; i < layer.objectArray.length; i++) {
            var obj = layer.objectArray[i].objSize;
            var colour = obj.color;

            ctx.fillStyle = colour;
            for (var sx = 0; sx < obj.sprite.length; sx++) {
                for (var sy = 0; sy < obj.sprite[0].length; sy++) {
                    if (obj.sprite[sx][sy]) {
                        var xPos = obj.x + sx;
                        var yPos = obj.y + sy;
                        if (xPos >= 0 && xPos < resolution && yPos >= 0 && yPos < resolution) {
                            ctx.fillRect(xPos, yPos, 1, 1);
                        }
                    }
                }
            }
        }
    }

    if (type === 'line') {
        for (let l = 0; l < layers.length; l++) {
            let layer = layers[l];
            ctx.strokeStyle = line_colors[l] || 'white';
            for (let i = 0; i < layer.objectArray.length - 1; i++) { // Rounding here to avoid floating point errors
                var x0 = Math.round(layer.objectArray[i].x + layer.objectArray[i].sizeX / 2);
                var y0 = Math.round(layer.objectArray[i].y + layer.objectArray[i].sizeY / 2);
                var x1 = Math.round(layer.objectArray[i + 1].x + layer.objectArray[i + 1].sizeX / 2);
                var y1 = Math.round(layer.objectArray[i + 1].y + layer.objectArray[i + 1].sizeY / 2);
                var line = getLineCoordinates(x0, y0, x1, y1);
                drawLine(line, ctx.strokeStyle);
            }
        }
    }
}

class Layer {
    constructor(z, objectArray) {
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

function addObject(object) {
    var layer = layers[object.z];
    layer.objectArray.push(object);
    totalObjectArray.push(object);
}

function getLineCoordinates(x0, y0, x1, y1) {
    const coordinates = [];
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    let safety = 0; // checks for an infinite loop
    while (true) {
        coordinates.push({ x: x0, y: y0 });
        if (x0 === x1 && y0 === y1) {
            break;
        }
        let e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
        if (safety++ > 5000) {
            break;
        }
    }

    return coordinates;
}

function drawLine(line, colour) {
    ctx.fillStyle = colour;
    for (var i = 0; i < line.length; i++) {
        var x = line[i].x;
        var y = line[i].y;
        if (x >= 0 && y >= 0 && x < resolution && y < resolution) {
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

function loadData(data) {
    for (var i = 0; i < data.length; i++) {
        let cube = new Object(
            data[i][0],
            data[i][1],
            0,
            colors[i % colors.length],
            cubeSprite
        );
        addObject(cube);
    }
}
