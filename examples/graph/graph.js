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
        this.cubeSprite = Array.from({ length: 10 }, () => Array(10).fill(1));
        this.circleSprite = [[0, 1, 0], [1, 1, 1], [0, 1, 0]];
        this.rectangleSprite = [[1, 1], [1, 1], [1, 1]];
        this.colors = ['lightgrey', 'blue', 'green', 'red', 'orange', 'purple', 'yellow'];
        this.line_colors = ['red', 'white', 'purple'];

        this.options = Object.assign({
            title: '',
            xLabel: '',
            yLabel: '',
            showPointLabels: false,
            font: "12px 'Press Start 2P'",
            fontColor: 'black',
            axisColor: 'black',
            tickCount: 5,
            padding: 40,
            showGrid: true
        }, options);
    }

    createFrame(data) {
        this.totalObjectArray = [];
        this.rawData = data;

        if (this.type === 'pie') {
            this.loadPieData(data);
        } else {
            const scaledData = this.normalizeData(data, this.resolution);
            this.loadData(scaledData);
        }

        this.renderFrame();
    }

    normalizeData(data, canvasSize) {
        if (data.length === 0){
            return data;
        }

        let xs = data.map(p => p[0]);
        let ys = data.map(p => p[1]);

        this.minX = Math.min(...xs);
        this.maxX = Math.max(...xs);
        this.minY = Math.min(...ys);
        this.maxY = Math.max(...ys);

        const xMargin = (this.maxX - this.minX) * 0.1;
        const yMargin = (this.maxY - this.minY) * 0.1;
        this.minX -= xMargin;
        this.maxX += xMargin;
        this.minY -= yMargin;
        this.maxY += yMargin;

        const width = this.maxX - this.minX || 1;
        const height = this.maxY - this.minY || 1;

        this.graphWidth = canvasSize - this.options.padding * 2;
        this.graphHeight = canvasSize - this.options.padding * 2;

        return data.map(([x, y]) => {
            const nx = this.options.padding + ((x - this.minX) / width) * this.graphWidth;
            const ny = (canvasSize - this.options.padding) - ((y - this.minY) / height) * this.graphHeight;
            return [nx, ny];
        });
    }

    renderFrame() {
        this.ctx.clearRect(0, 0, this.resolution, this.resolution);

        if (this.type === 'pie') {
            this.renderPie();
        } else {
            this.renderAxes();

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

            this.renderLabels();
        }
    }


    renderAxes() {
        const ctx = this.ctx;
        const { axisColor, font, fontColor, tickCount, padding, showGrid } = this.options;
        ctx.save();
        ctx.strokeStyle = axisColor;
        ctx.fillStyle = fontColor;
        ctx.font = font;
        ctx.lineWidth = 1;

        // Draw axes
        ctx.beginPath();
        ctx.moveTo(padding, this.resolution - padding);
        ctx.lineTo(this.resolution - padding, this.resolution - padding);
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, this.resolution - padding);
        ctx.stroke();

        // Grid + ticks
        for (let i = 0; i <= tickCount; i++) {
            // X-axis
            const x = padding + (i / tickCount) * this.graphWidth;
            const xVal = this.minX + (i / tickCount) * (this.maxX - this.minX);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(xVal.toFixed(1), x, this.resolution - padding + 10);

            if (showGrid) {
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, this.resolution - padding);
                ctx.stroke();
                ctx.strokeStyle = axisColor;
            }

            // Y-axis
            const y = this.resolution - padding - (i / tickCount) * this.graphHeight;
            const yVal = this.minY + (i / tickCount) * (this.maxY - this.minY);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(yVal.toFixed(1), padding - 10, y);

            if (showGrid) {
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(this.resolution - padding, y);
                ctx.stroke();
                ctx.strokeStyle = axisColor;
            }
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
                    const xPos = obj.x + sx;
                    const yPos = obj.y + sy;
                    if (xPos >= 0 && xPos < this.resolution && yPos >= 0 && yPos < this.resolution) {
                        this.ctx.fillRect(xPos, yPos, 1, 1);
                    }
                }
            }
        }
    }

    renderLines() {
        for (let l = 0; l < this.layers.length; l++) {
            const layer = this.layers[l];
            const color = this.line_colors[l] || 'white';
            for (let i = 0; i < layer.objectArray.length - 1; i++) {
                const x0 = Math.round(layer.objectArray[i].x + layer.objectArray[i].sizeX / 2);
                const y0 = Math.round(layer.objectArray[i].y + layer.objectArray[i].sizeY / 2);
                const x1 = Math.round(layer.objectArray[i + 1].x + layer.objectArray[i + 1].sizeX / 2);
                const y1 = Math.round(layer.objectArray[i + 1].y + layer.objectArray[i + 1].sizeY / 2);
                const line = this.getLineCoordinates(x0, y0, x1, y1);
                this.drawLine(line, color);
            }
        }
    }

    renderBars() {
        const { padding } = this.options;
        const barWidth = this.graphWidth / this.totalObjectArray.length * 0.8;
        const barSpacing = this.graphWidth / this.totalObjectArray.length;

        for (let i = 0; i < this.totalObjectArray.length; i++) {
            const obj = this.totalObjectArray[i];
            const x = this.options.padding + i * barSpacing + (barSpacing - barWidth) / 2;
            const y = obj.y;
            const height = this.resolution - this.options.padding - y;

            this.ctx.fillStyle = obj.color;
            this.ctx.fillRect(x, y, barWidth, height);
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
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
            if (safety++ > 5000) break;
        }
        return coordinates;
    }

    drawLine(line, color) {
        this.ctx.fillStyle = color;
        for (const point of line) {
            if (point.x >= 0 && point.y >= 0 && point.x < this.resolution && point.y < this.resolution) {
                this.ctx.fillRect(point.x, point.y, 1, 1);
            }
        }
    }

    loadData(data) {
        for (let i = 0; i < data.length; i++) {
            const cube = new Graph_Object(
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
        const { padding, title, xLabel, yLabel, font, fontColor } = this.options;
        ctx.save();
        ctx.font = font;
        ctx.fillStyle = fontColor;
        ctx.textAlign = 'center';

        if (title) ctx.fillText(title, this.resolution / 2, 20);
        if (xLabel) ctx.fillText(xLabel, this.resolution / 2, this.resolution - 10);

        if (yLabel) {
            ctx.save();
            ctx.translate(15, this.resolution / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(yLabel, 0, 0);
            ctx.restore();
        }

        ctx.restore();
    }
        loadPieData(data) {
        const total = data.reduce((sum, val) => sum + val, 0);
        let startAngle = 0;

        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const sliceAngle = (value / total) * 2 * Math.PI;

            const slice = {
                value: value,
                startAngle: startAngle,
                endAngle: startAngle + sliceAngle,
                color: this.colors[i % this.colors.length]
            };

            this.totalObjectArray.push(slice);
            startAngle += sliceAngle;
        }
    }

    renderPie() {
        const ctx = this.ctx;
        const radius = (this.resolution - this.options.padding * 2) / 2;
        const cx = this.resolution / 2;
        const cy = this.resolution / 2;

        for (const slice of this.totalObjectArray) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, slice.startAngle, slice.endAngle);
            ctx.closePath();
            ctx.fillStyle = slice.color;
            ctx.fill();
        }

        if (this.options.showPointLabels) {
            ctx.fillStyle = this.options.fontColor;
            ctx.font = this.options.font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (const slice of this.totalObjectArray) {
                const midAngle = (slice.startAngle + slice.endAngle) / 2;
                const labelX = cx + Math.cos(midAngle) * radius * 0.6;
                const labelY = cy + Math.sin(midAngle) * radius * 0.6;
                ctx.fillText(slice.value, labelX, labelY);
            }
        }

        if (this.options.title) {
            ctx.fillStyle = this.options.fontColor;
            ctx.font = this.options.font;
            ctx.textAlign = 'center';
            ctx.fillText(this.options.title, cx, this.options.padding / 2);
        }
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
