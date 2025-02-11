

var resolution = 10;
var objectArray = [];
var circleSprite = [[0,1,0],[1,1,1],[0,1,0]];

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
        for(var x = objectArray[i].objSize.x; x < (objectArray[i].objSize.x + objectArray[i].objSize.sizeX); x++){
            for(var y = objectArray[i].objSize.y; y < (objectArray[i].objSize.y + objectArray[i].objSize.sizeY); y++){
                document.getElementById(`${x} ${y}`).src=`static/images/white.png`;
            }
        }
    }
}


function runGame(){
    renderFrame();
    cube.move(1, 0);
}


class Object {
    constructor(x, y, sizeX, sizeY) {
        this.x = x;
        this.y = y;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }

    get objSize() {
        return {
            x: this.x,
            y: this.y,
            sizeX: this.sizeX,
            sizeY: this.sizeY
        };
    }

    move(dir_x, dir_y) {
        if(this.collide(dir_x, dir_y)){
            return;
        }
        this.x = this.x + dir_x;
        this.y = this.y + dir_y;
        return;
    }

    collide(dir_x, dir_y){
        var attempted_x = this.x + this.sizeX + dir_x;
        var attempted_y = this.y + this.sizeY + dir_y;
        var obj_x_min;
        var obj_x_max;
        var obj_y_min;
        var obj_y_max;
        for(var i = 0; i < objectArray.length; i++){
            obj_x_min = objectArray[i].objSize.x;
            obj_x_max = objectArray[i].objSize.x + objectArray[i].objSize.sizeX;
            obj_y_min = objectArray[i].objSize.y;
            obj_y_max = objectArray[i].objSize.y + objectArray[i].objSize.sizeY;
            if(this != objectArray[i]){
                if(attempted_x > obj_x_min && attempted_x < obj_x_max && attempted_y > obj_y_min && attempted_y < obj_y_max){
                    return true;
                }
            }
        }
        return false;
    }
}

var cube = new Object(0, 5, 2, 2);
objectArray.push(cube);
var rectangle = new Object(1, 1, 3, 2);
objectArray.push(rectangle);