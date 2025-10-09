class Graph {
    constructor(canvasId, resolution = 500, type = 'line', options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.resolution = resolution;
        this.type = type;
        this.layers = [new Layer(0, []), new Layer(1, []), new Layer(2, [])];
        this.totalObjectArray = [];
        this.rawData = [];
        this.cubeSprite = Array.from({length: 10}, () => Array(10).fill(1));
        this.circleSprite = [[0,1,0],[1,1,1],[0,1,0]];
        this.rectangleSprite = [[1,1],[1,1],[1,1]];
        this.colors = ['lightgrey', 'blue', 'green'];
        this.line_colors = ['red', 'white', 'purple'];
        this.options = Object.assign({
            title: '',
            xLabel: '',
            yLabel: '',
            showPointLabels: false,
            font: "12px 'Press Start 2P'",
            fontColor: 'black',
            axisColor: 'black',
            tickCount: 5
        }, options);
    }

    createFrame(data) {
        this.totalObjectArray = [];
        this.rawData = data;
        const scaledData = this.normalizeData(data, this.resolution, 0.9);
        this.loadData(scaledData);
        this.renderFrame();
    }

    normalizeData(data, canvasSize, paddingRatio = 0.9) {
        if (data.length === 0) {
            return data;
        }

        let xs = data.map(p => p[0]);
        let ys = data.map(p => p[1]);
        this.minX = Math.min(...xs);
        this.maxX = Math.max(...xs);
        this.minY = Math.min(...ys);
        this.maxY = Math.max(...ys);

        let width = this.maxX - this.minX || 1;
        let height = this.maxY - this.minY || 1;
        let scale = paddingRatio * canvasSize / Math.max(width, height);
        let offsetX = (canvasSize - width * scale) / 2;
        let offsetY = (canvasSize - height * scale) / 2;

        return data.map(([x, y]) => [
            (x - this.minX) * scale + offsetX,
            (y - this.minY) * scale + offsetY
        ]);
    }

    renderFrame() {
        this.ctx.clearRect(0, 0, this.resolution, this.resolution);
        switch (this.type) {
            case 'line':
                this.renderObjects();
                this.renderLines();
                break;
            case 'scatter':
                this.renderObjects();
                break;
            case 'bar':
                this.renderBars();
                break;
        }

        this.renderAxes();
        this.renderLabels();
    }

    renderAxes() {
        const ctx = this.ctx;
        const { axisColor, tickCount, font, fontColor } = this.options;
        ctx.save();
        ctx.strokeStyle = axisColor;
        ctx.fillStyle = fontColor;
        ctx.font = font;
        ctx.lineWidth = 1;

        const padding = 40;
        const graphWidth = this.resolution - padding * 2;
        const graphHeight = this.resolution - padding * 2;

        ctx.beginPath();
        ctx.moveTo(padding, this.resolution - padding);
        ctx.lineTo(this.resolution - padding, this.resolution - padding); 
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, this.resolution - padding); 
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        for (let i = 0; i <= tickCount; i++) {
            let x = padding + (i / tickCount) * graphWidth;
            let value = this.minX + (i / tickCount) * (this.maxX - this.minX);
            ctx.beginPath();
            ctx.moveTo(x, this.resolution - padding);
            ctx.lineTo(x, this.resolution - padding + 5);
            ctx.stroke();
            ctx.fillText(value.toFixed(1), x, this.resolution - padding + 10);
        }

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= tickCount; i++) {
            let y = this.resolution - padding - (i / tickCount) * graphHeight;
            let value = this.minY + (i / tickCount) * (this.maxY - this.minY);
            ctx.beginPath();
            ctx.moveTo(padding - 5, y);
            ctx.lineTo(padding, y);
            ctx.stroke();
            ctx.fillText(value.toFixed(1), padding - 10, y);
        }

        ctx.restore();
    }

    renderObjects() {
        for (let layer of this.layers) {
            for (let obj of layer.objectArray) {
                this.drawObject(obj.objSize);
            }
        }
    }

    drawObject(obj) {
        this.ctx.fillStyle = obj.color;
        for (let sx = 0; sx < obj.sprite.length; sx++) {
            for (let sy = 0; sy < obj.sprite[0].length; sy++) {
                if (obj.sprite[sx][sy]) {
                    let xPos = obj.x + sx;
                    let yPos = obj.y + sy;
                    if (xPos >= 0 && xPos < this.resolution && yPos >= 0 && yPos < this.resolution) {
                        this.ctx.fillRect(xPos, yPos, 1, 1);
                    }
                }
            }
        }
    }

    renderLines() {
        for (let l = 0; l < this.layers.length; l++) {
            let layer = this.layers[l];
            let color = this.line_colors[l] || 'white';
            for (let i = 0; i < layer.objectArray.length - 1; i++) {
                let x0 = Math.round(layer.objectArray[i].x + layer.objectArray[i].sizeX / 2);
                let y0 = Math.round(layer.objectArray[i].y + layer.objectArray[i].sizeY / 2);
                let x1 = Math.round(layer.objectArray[i + 1].x + layer.objectArray[i + 1].sizeX / 2);
                let y1 = Math.round(layer.objectArray[i + 1].y + layer.objectArray[i + 1].sizeY / 2);

                let line = this.getLineCoordinates(x0, y0, x1, y1);
                this.drawLine(line, color);
            }
        }
    }

    renderBars() {
    const ctx = this.ctx;
    const padding = 40;
    const graphHeight = this.resolution - padding * 2;
    const barWidth = (this.resolution - padding * 2) / this.totalObjectArray.length * 0.8;

    for (let i = 0; i < this.totalObjectArray.length; i++) {
        const obj = this.totalObjectArray[i];
        const normalizedY = (obj.y - padding) / graphHeight;
        const height = (1 - normalizedY) * graphHeight;
        const x = obj.x - barWidth / 2;
        const y = this.resolution - padding - height;
        ctx.fillStyle = obj.color;
        ctx.fillRect(x, y, barWidth, height);
    }
}


    getLineCoordinates(x0, y0, x1, y1) {
        const coordinates = [];
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = x0 < x1 ? 1 : -1;
        let sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        let safety = 0;
        while (true) {
            coordinates.push({ x: x0, y: y0 });
            if (x0 === x1 && y0 === y1) break;
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
            if (safety++ > 5000) break;
        }
        return coordinates;
    }

    drawLine(line, colour) {
        this.ctx.fillStyle = colour;
        for (let point of line) {
            if (point.x >= 0 && point.y >= 0 && point.x < this.resolution && point.y < this.resolution) {
                this.ctx.fillRect(point.x, point.y, 1, 1);
            }
        }
    }

    loadData(data) {
        for (let i = 0; i < data.length; i++) {
            let cube = new Graph_Object(
                data[i][0],
                data[i][1],
                0,
                this.colors[i % this.colors.length],
                this.cubeSprite
            );
            this.addObject(cube);
        }
    }

    addObject(object) {
        this.layers[object.z].objectArray.push(object);
        this.totalObjectArray.push(object);
    }

    renderLabels() {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = this.options.font;
        ctx.fillStyle = this.options.fontColor;
        ctx.textAlign = 'center';

        if (this.options.title)
            ctx.fillText(this.options.title, this.resolution / 2, 20);

        if (this.options.xLabel)
            ctx.fillText(this.options.xLabel, this.resolution / 2, this.resolution - 10);

        if (this.options.yLabel) {
            ctx.save();
            ctx.translate(15, this.resolution / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(this.options.yLabel, 0, 0);
            ctx.restore();
        }

        ctx.restore();
    }
}

class Layer {
    constructor(z, objectArray) {
        this.z = z;
        this.objectArray = objectArray;
    }
}

class Graph_Object {
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
