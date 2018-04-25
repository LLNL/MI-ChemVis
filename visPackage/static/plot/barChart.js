class barChart {
    constructor(svg, pos, size) {
        this.svg = svg;
        this.pos = pos;
        this.size = size;
    }

    draw() {

    }

    update(pos, size) {
        this.pos = pos;
        this.size = size;
    }

    setData(data) {
        this.data = data;
        this.draw();
    }
}
