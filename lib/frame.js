

var resolution = 10;

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

    for(var x = cube.objSize.x; x < (cube.objSize.x + cube.objSize.sizeX); x++){
        for(var y = cube.objSize.y; y < (cube.objSize.y + cube.objSize.sizeY); y++){
            document.getElementById(`${x} ${y}`).src=`static/images/white.png`;
        }
    }
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
        this.x = this.x + dir_x;
        this.y = this.y + dir_y;
    }
}

var cube = new Object(0, 5, 2, 2);