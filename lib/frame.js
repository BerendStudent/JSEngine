

var resolution = 10;
var size;
var objectArray = [];
var layerOneArray = [];
var layerTwoArray = [];
var layerThreeArray = [];
objectArray.push()
var circleSprite = [[0,1,0],[1,1,1],[0,1,0]];
var cubeSprite = [[1,1], [1,1]];
var rectangleSprite = [[1,1], [1,1], [1,1]];

function createFrame(newResolution) {
    resolution = newResolution;
    var frameBody = document.getElementById('Frame');
    for(var x = 0; x < resolution; x++){
        var row = document.createElement('tr');
        for (var y = 0; y < resolution; y++) {
            var pixel = document.createElement('td');
            pixel.innerHTML = `<img id='${x} ${y}' src='static/images/black.png'>`;
            row.appendChild(pixel);
            frameBody.appendChild(row);
            document.getElementById(`${x} ${y}`).src=`static/images/black.png`;
        }
    }
    renderFrame();
}

function renderFrame() {
    for(var x = 0; x < resolution; x++){
        for(var y = 0; y < resolution; y++){
            document.getElementById(`${x} ${y}`).src=`static/images/black.png`;
        }
    }

    for(var i = 0; i < objectArray.length; i++){
        colour = objectArray[i].objSize.color;
        for(var g = 0; g < objectArray[i].objSize.sprite.length; g++){
            for(var h = 0; h < objectArray[i].objSize.sprite.length; h++){
                x = g + objectArray[i].objSize.x;
                y = h + objectArray[i].objSize.y;
                if(objectArray[i].objSize.sprite[g][h]){
                    document.getElementById(`${x} ${y}`).src=`static/images/${colour}.png`;
                }
            }
        }
    }
}

var i = 0;
var xdir = 0;
var ydir = 1;
function runGame(){
    renderFrame();
    if(!cube.move(xdir, ydir)){
        xdir = -xdir;
        ydir = -ydir;
    }
}


class Object {
    constructor(x, y, sizeX, sizeY, color, sprite) {
        this.x = x;
        this.y = y;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.color = color;
        this.sprite = sprite;
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

    move(dir_x, dir_y) {
        if(this.collide(dir_x, dir_y)){
            return false;
        }
        this.x = this.x + dir_x;
        this.y = this.y + dir_y;
        return true;
    }

    collide(dir_x, dir_y){
        var attempted_x;
        var attempted_y;
        var obj_x_min;
        var obj_x_max;
        var obj_y_min;
        var obj_y_max;
        for(var j = 0; j < this.sizeX; j++){
            for(var k = 0; k < this.sizeY; k++){
                attempted_x = this.x + j + dir_x;
                attempted_y = this.y + k + dir_y;
                size = resolution - 1;
                if(attempted_x > size || attempted_y > size || attempted_x < 0 || attempted_y < 0){
                    return true;
                }
                for(var i = 0; i < objectArray.length; i++){
                    obj_x_min = objectArray[i].objSize.x;
                    obj_x_max = objectArray[i].objSize.x + objectArray[i].objSize.sizeX;
                    obj_y_min = objectArray[i].objSize.y;
                    obj_y_max = objectArray[i].objSize.y + objectArray[i].objSize.sizeY;
                    if(this != objectArray[i]){
                        //document.getElementById(`${attempted_x} ${attempted_y}`).src=`static/images/yellow.png`; // debug: shows predicted next placement
                        if(attempted_x >= obj_x_min && attempted_x <= obj_x_max && attempted_y >= obj_y_min && attempted_y <= obj_y_max){
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
}

var cube = new Object(0, 0, 2, 2, 'lightgrey', cubeSprite);
objectArray.push(cube);
var rectangle = new Object(0, 7, 3, 2, 'white', rectangleSprite);
objectArray.push(rectangle);
var circle = new Object(5, 5, 0, 0, 'white',circleSprite);
objectArray.push(circle)