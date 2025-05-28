

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
var paddleSprite = [[1,1], [1,1], [1,1], [1,1], [1,1]];
var black = '../static/images/black.png';
var white = '../static/images/white.png';

function createFrame(newResolution) {
    resolution = newResolution;
    var frameBody = document.getElementById('Frame');
    for(var x = 0; x < resolution; x++){
        var row = document.createElement('tr');
        for (var y = 0; y < resolution; y++) {
            var pixel = document.createElement('td');
            pixel.innerHTML = `<img id='${x} ${y}' src='${black}'>`;
            row.appendChild(pixel);
            frameBody.appendChild(row);
            document.getElementById(`${x} ${y}`).src=`${black}`;
        }
    }
    renderFrame();
}

function renderFrame() {
    for(var x = 0; x < resolution; x++){
        for(var y = 0; y < resolution; y++){
            document.getElementById(`${x} ${y}`).src=`${black}`;
        }
    }

    for(var i = 0; i < objectArray.length; i++){
        colour = objectArray[i].objSize.color;
        for(var sprite_x = 0; sprite_x < objectArray[i].objSize.sprite.length; sprite_x++){
            for(var sprite_y = 0; sprite_y < objectArray[i].objSize.sprite[0].length; sprite_y++){
                x = sprite_x + objectArray[i].objSize.x;
                y = sprite_y + objectArray[i].objSize.y;
                if(objectArray[i].objSize.sprite[sprite_x][sprite_y]){
                    if(x < size || y < size || x > 0 || y > 0){
                        document.getElementById(`${x} ${y}`).src=`../static/images/${colour}.png`;
                    }
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
    if(!circle.move(xdir, ydir)){
        xdir = -xdir;
        ydir = -ydir;
    }
}


class Object {
    constructor(x, y, color, sprite) {
        this.x = x;
        this.y = y;
        this.sizeX = sprite.length;
        this.sizeY = sprite[0].length;
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
        renderFrame();
        return true;
    }

    collide(dir_x, dir_y){
        var attempted_x;
        var attempted_y;
        var obj_x;
        var obj_x_max;
        var obj_y;
        var obj_y_max;
        var collision_x;
        var collision_y;
        for(var j = 0; j < this.sizeX; j++){
            for(var k = 0; k < this.sizeY; k++){
                attempted_x = this.x + j + dir_x;
                attempted_y = this.y + k + dir_y;
                size = resolution - 1;
                if(attempted_x > size || attempted_y > size || attempted_x < 0 || attempted_y < 0){
                    return true;
                }
                
                if(this.sprite[j][k]){
                    for(var i = 0; i < objectArray.length; i++){
                        obj_x = objectArray[i].objSize.x;
                        obj_x_max = objectArray[i].objSize.x + objectArray[i].objSize.sizeX;
                        obj_y = objectArray[i].objSize.y;
                        obj_y_max = objectArray[i].objSize.y + objectArray[i].objSize.sizeY;
                        if(this != objectArray[i]){
                            document.getElementById(`${attempted_x} ${attempted_y}`).src=`static/images/yellow.png`; // debug: shows predicted next placement
                            for(var object_x = obj_x; object_x < obj_x_max; object_x++){
                                for(var object_y = obj_y; object_y < obj_y_max; object_y++){
                                    if(attempted_x == object_x && attempted_y == object_y){
                                        collision_x = object_x - obj_x;
                                        collision_y = object_y - obj_y;
                                        if(objectArray[i].objSize.sprite[collision_x][collision_y] == 1){
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
}


function bounce(dirx, diry){

    return dirx, diry
}

var paddle1 = new Object(2, 0, 'white', paddleSprite);
objectArray.push(paddle1);
var paddle2 = new Object(2, 38, 'white', paddleSprite);
objectArray.push(paddle2);
var circle = new Object(5, 5, 'white',circleSprite);
objectArray.push(circle);