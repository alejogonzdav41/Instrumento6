export class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  copy() {
    return new Vec2(this.x, this.y);
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  sub(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  mult(amount) {
    this.x *= amount;
    this.y *= amount;
    return this;
  }

  mag() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const magnitude = this.mag();
    if (magnitude > 0) this.mult(1 / magnitude);
    return this;
  }

  limit(maximum) {
    const magnitude = this.mag();
    if (magnitude > maximum) this.mult(maximum / magnitude);
    return this;
  }

  heading() {
    return Math.atan2(this.y, this.x);
  }

  static sub(first, second) {
    return new Vec2(first.x - second.x, first.y - second.y);
  }

  static fromAngle(angle) {
    return new Vec2(Math.cos(angle), Math.sin(angle));
  }
}
