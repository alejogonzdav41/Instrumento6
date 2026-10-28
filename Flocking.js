import { Vec2 } from "./Vec2.js";

export class Flocking {
  constructor(perceptionRadius = 58) {
    this.perceptionRadius = perceptionRadius;
    this.cellSize = perceptionRadius;
  }

  calculate(agents) {
    const cells = new Map();
    for (const agent of agents) {
      const key = this.cellKey(agent.position);
      if (!cells.has(key)) cells.set(key, []);
      cells.get(key).push(agent);
    }

    for (const agent of agents) {
      const neighbors = this.neighborsOf(agent, cells);
      agent.perceive(neighbors);
      agent.flockForces = this.steeringFor(agent, neighbors);
    }
  }

  cellKey(position) {
    return `${Math.floor(position.x / this.cellSize)},${Math.floor(position.y / this.cellSize)}`;
  }

  neighborsOf(agent, cells) {
    const cellX = Math.floor(agent.position.x / this.cellSize);
    const cellY = Math.floor(agent.position.y / this.cellSize);
    const neighbors = [];
    const radiusSquared = this.perceptionRadius ** 2;

    for (let x = cellX - 1; x <= cellX + 1; x += 1) {
      for (let y = cellY - 1; y <= cellY + 1; y += 1) {
        const nearby = cells.get(`${x},${y}`) ?? [];
        for (const other of nearby) {
          if (other !== agent && Vec2.sub(agent.position, other.position).mag() < Math.sqrt(radiusSquared)) {
            neighbors.push(other);
          }
        }
      }
    }
    return neighbors;
  }

  steeringFor(agent, neighbors) {
    const separation = new Vec2();
    const alignment = new Vec2();
    const cohesionCenter = new Vec2();
    let separated = 0;

    for (const other of neighbors) {
      const offset = Vec2.sub(agent.position, other.position);
      const distance = Math.max(1, offset.mag());
      separation.add(offset.normalize().mult(1 / distance));
      alignment.add(other.velocity);
      cohesionCenter.add(other.position);
      separated += 1;
    }

    if (separated === 0) {
      return { separation, alignment, cohesion: new Vec2() };
    }

    alignment.mult(1 / separated);
    const cohesionTarget = cohesionCenter.mult(1 / separated);
    return {
      separation: agent.steerToward(separation, true),
      alignment: agent.steerToward(alignment, false),
      cohesion: agent.seek(cohesionTarget),
    };
  }
}
