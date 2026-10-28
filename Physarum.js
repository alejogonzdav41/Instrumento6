export class Physarum {
  constructor(width, height, cellSize = 5) {
    this.cellSize = cellSize;
    this.resize(width, height);
    this.depositAmount = 0.008;
    this.decayRate = 0.42;
    this.diffusion = 0.12;
    this.sensorDistance = 18;
    this.sensorAngle = Math.PI / 4;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.columns = Math.max(1, Math.ceil(width / this.cellSize));
    this.rows = Math.max(1, Math.ceil(height / this.cellSize));
    this.signal = new Float32Array(this.columns * this.rows);
    this.nextSignal = new Float32Array(this.signal.length);
    this.surface = document.createElement("canvas");
    this.surface.width = this.columns;
    this.surface.height = this.rows;
    this.surfaceContext = this.surface.getContext("2d", { alpha: true });
    this.image = this.surfaceContext.createImageData(this.columns, this.rows);
  }

  clear() {
    this.signal.fill(0);
    this.nextSignal.fill(0);
  }

  tune(memory) {
    this.decayRate = 1.3 - memory;
    this.depositAmount = 0.002 + memory * 0.01;
    this.sensorDistance = 12 + memory * 18;
  }

  indexAt(x, y) {
    const column = Math.max(0, Math.min(this.columns - 1, Math.floor(x / this.cellSize)));
    const row = Math.max(0, Math.min(this.rows - 1, Math.floor(y / this.cellSize)));
    return row * this.columns + column;
  }

  sample(x, y) {
    return this.signal[this.indexAt(x, y)];
  }

  deposit(x, y, amount = this.depositAmount) {
    const index = this.indexAt(x, y);
    this.signal[index] = Math.min(1, this.signal[index] + amount);
  }

  paint(x, y, radius, amount = 0.16) {
    const minColumn = Math.max(0, Math.floor((x - radius) / this.cellSize));
    const maxColumn = Math.min(this.columns - 1, Math.ceil((x + radius) / this.cellSize));
    const minRow = Math.max(0, Math.floor((y - radius) / this.cellSize));
    const maxRow = Math.min(this.rows - 1, Math.ceil((y + radius) / this.cellSize));
    const radiusSquared = radius * radius;

    for (let row = minRow; row <= maxRow; row += 1) {
      for (let column = minColumn; column <= maxColumn; column += 1) {
        const distanceX = (column + 0.5) * this.cellSize - x;
        const distanceY = (row + 0.5) * this.cellSize - y;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        if (distanceSquared > radiusSquared) continue;
        const falloff = 1 - Math.sqrt(distanceSquared) / Math.max(1, radius);
        const index = row * this.columns + column;
        this.signal[index] = Math.min(1, this.signal[index] + amount * falloff);
      }
    }
  }

  // Cada agente compara tres sensores adelantados y gira hacia la señal más fuerte.
  steeringFor(agent) {
    const heading = agent.velocity.heading();
    const distance = this.sensorDistance;
    const forward = this.sample(
      agent.position.x + Math.cos(heading) * distance,
      agent.position.y + Math.sin(heading) * distance,
    );
    const left = this.sample(
      agent.position.x + Math.cos(heading - this.sensorAngle) * distance,
      agent.position.y + Math.sin(heading - this.sensorAngle) * distance,
    );
    const right = this.sample(
      agent.position.x + Math.cos(heading + this.sensorAngle) * distance,
      agent.position.y + Math.sin(heading + this.sensorAngle) * distance,
    );

    if (left === right && right === forward) return null;
    const chosenAngle = left > right && left > forward
      ? heading - this.sensorAngle
      : right > left && right > forward
        ? heading + this.sensorAngle
        : heading;
    return chosenAngle - heading;
  }

  update(deltaTime) {
    const decay = Math.exp(-this.decayRate * deltaTime);
    const diffusion = this.diffusion;
    for (let row = 0; row < this.rows; row += 1) {
      for (let column = 0; column < this.columns; column += 1) {
        const index = row * this.columns + column;
        const value = this.signal[index];
        const left = this.signal[row * this.columns + Math.max(0, column - 1)];
        const right = this.signal[row * this.columns + Math.min(this.columns - 1, column + 1)];
        const up = this.signal[Math.max(0, row - 1) * this.columns + column];
        const down = this.signal[Math.min(this.rows - 1, row + 1) * this.columns + column];
        const average = (left + right + up + down) * 0.25;
        this.nextSignal[index] = Math.max(0, Math.min(1, (value + (average - value) * diffusion) * decay));
      }
    }
    [this.signal, this.nextSignal] = [this.nextSignal, this.signal];
  }

  render(context, colors) {
    const pixels = this.image.data;
    for (let index = 0; index < this.signal.length; index += 1) {
      const brightness = Math.min(1, Math.sqrt(this.signal[index]) * 1.15);
      const pixel = index * 4;
      pixels[pixel] = colors.trail[0];
      pixels[pixel + 1] = colors.trail[1];
      pixels[pixel + 2] = colors.trail[2];
      pixels[pixel + 3] = Math.round(brightness * 135);
    }
    this.surfaceContext.putImageData(this.image, 0, 0);
    context.drawImage(this.surface, 0, 0, this.width, this.height);
  }
}
