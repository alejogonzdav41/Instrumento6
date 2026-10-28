import { Vec2 } from "./Vec2.js";

export class Agent {
  constructor(x, y, randomHeading = Math.random() * Math.PI * 2) {
    this.position = new Vec2(x, y);
    this.velocity = Vec2.fromAngle(randomHeading).mult(0.8);
    this.acceleration = new Vec2();
    this.maxSpeed = 1.8;
    this.maxForce = 0.075;
    this.wanderAngle = randomHeading;
    this.neighbors = [];
    this.flockForces = {
      separation: new Vec2(),
      alignment: new Vec2(),
      cohesion: new Vec2(),
    };
  }

  perceive(neighbors) {
    this.neighbors = neighbors;
  }

  seek(target, arrive = false) {
    const desired = Vec2.sub(target, this.position);
    const distance = desired.mag();
    if (distance === 0) return new Vec2();
    desired.normalize().mult(this.maxSpeed);
    if (arrive && distance < 140) desired.mult(distance / 140);
    return this.steerToward(desired, false);
  }

  arrive(target) {
    return this.seek(target, true);
  }

  steerToward(direction, normalizeFirst = false) {
    const desired = direction.copy();
    if (normalizeFirst) desired.normalize();
    if (desired.mag() === 0) return new Vec2();
    desired.normalize().mult(this.maxSpeed);
    return desired.sub(this.velocity).limit(this.maxForce);
  }

  separation() {
    return this.flockForces.separation;
  }

  applyBurst(power) {
    const impulse = Vec2.fromAngle(Math.random() * Math.PI * 2)
      .mult(this.maxSpeed * Math.max(0, Math.min(1, power)));
    this.velocity.add(impulse).limit(this.maxSpeed);
  }

  wander(snap = 0.25) {
    this.wanderAngle += (Math.random() - 0.5) * (0.22 + snap * 0.65);
    const forward = this.velocity.copy().normalize();
    const circleCenter = this.position.copy().add(forward.mult(26));
    const target = circleCenter.add(Vec2.fromAngle(this.wanderAngle).mult(20));
    return this.seek(target);
  }

  calculateAction({ flowField, physarum, flocking, target, energy, grouping, snap = 0.25 }) {
    this.maxSpeed = 0.8 + energy * 2.6;
    this.maxForce = (0.025 + energy * 0.065) * (0.8 + snap * 1.35);
    this.acceleration = new Vec2();

    const fieldForce = this.steerToward(flowField.directionAt(this.position));
    const trailTurn = physarum.steeringFor(this);
    const trailForce = trailTurn === null
      ? new Vec2()
      : Vec2.fromAngle(this.velocity.heading() + trailTurn).mult(this.maxForce);
    const weights = {
      separation: 1.45 - grouping * 0.8,
      alignment: 0.2 + grouping * 0.85,
      cohesion: 0.15 + grouping * 0.95,
    };

    this.acceleration
      .add(fieldForce.mult(0.62))
      .add(this.separation().mult(weights.separation))
      .add(this.flockForces.alignment.mult(weights.alignment))
      .add(this.flockForces.cohesion.mult(weights.cohesion))
      .add(trailForce.mult(0.9))
      .add(this.wander(snap).mult(0.22 + snap * 0.28));

    if (target) {
      const offset = Vec2.sub(this.position, target.position);
      const distance = offset.mag();
      const radius = target.radius ?? 140;
      if (distance > 0 && distance < radius) {
        const influence = 1 - distance / radius;
        const targetForce = target.repulse
          ? this.steerToward(offset)
          : this.arrive(target.position);
        this.acceleration.add(targetForce.mult(influence * (2.2 + snap * 2.5)));
      }
    }
    this.acceleration.limit(Math.min(0.28, this.maxForce));
  }

  update(deltaTime, width, height, physarum, bounds = { x: 0, y: 0, width, height }) {
    const timeScale = Math.min(2, deltaTime * 60);
    this.velocity.add(this.acceleration.copy().mult(timeScale)).limit(this.maxSpeed);
    this.position.add(this.velocity.copy().mult(timeScale));
    this.wrap(bounds);
    physarum.deposit(this.position.x, this.position.y);
  }

  wrap(bounds) {
    if (this.position.x < bounds.x) this.position.x += bounds.width;
    if (this.position.x >= bounds.x + bounds.width) this.position.x -= bounds.width;
    if (this.position.y < bounds.y) this.position.y += bounds.height;
    if (this.position.y >= bounds.y + bounds.height) this.position.y -= bounds.height;
  }

  render(context, colors) {
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.velocity.heading());
    const size = colors.particleSize ?? 4;
    context.fillStyle = colors.agent;
    context.strokeStyle = colors.accent;
    context.lineWidth = 1;
    context.beginPath();

    if (colors.particleShape === "circle") {
      context.arc(0, 0, size, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    } else if (colors.particleShape === "square") {
      context.rect(-size, -size, size * 2, size * 2);
      context.fill();
      context.stroke();
    } else if (colors.particleShape === "x") {
      context.lineWidth = 2;
      context.moveTo(-size, -size);
      context.lineTo(size, size);
      context.moveTo(size, -size);
      context.lineTo(-size, size);
      context.stroke();
    } else {
      context.moveTo(size * 1.25, 0);
      context.lineTo(-size, size);
      context.lineTo(-size, -size);
      context.closePath();
      context.fill();
      context.stroke();
    }

    context.restore();
  }
}
