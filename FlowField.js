import { Vec2 } from "./Vec2.js";

export class FlowField {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.orientation = -Math.PI / 2;
    this.scale = 2.2;
    this.phase = 0;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  rotate(amount) {
    this.orientation += amount;
  }

  changeScale(amount) {
    this.scale = Math.max(0.5, Math.min(5, this.scale + amount));
  }

  update(deltaTime, energy) {
    this.phase += deltaTime * (0.12 + energy * 0.16);
  }

  // El campo se consulta en la posición del agente; no prescribe su trayectoria.
  directionAt(position) {
    const x = (position.x / Math.max(1, this.width) - 0.5) * this.scale * Math.PI * 2;
    const y = (position.y / Math.max(1, this.height) - 0.5) * this.scale * Math.PI * 2;
    const curl = Math.sin(x + this.phase) * 0.72 + Math.cos(y - this.phase * 0.7) * 0.58;
    const angle = this.orientation + curl;
    return Vec2.fromAngle(angle);
  }
}
