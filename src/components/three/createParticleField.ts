import * as THREE from 'three';

export interface ParticleFieldObject {
  points: THREE.Points;
  update: (time: number) => void;
}

export function createParticleField(count = 700): ParticleFieldObject {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const color1 = new THREE.Color(0xc91414); // Bright red
  const color2 = new THREE.Color(0x8b0808); // Deep red
  const color3 = new THREE.Color(0xf2eee7); // Dust white

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

    // Pick color
    const rnd = Math.random();
    const c = rnd > 0.6 ? color1 : rnd > 0.3 ? color2 : color3;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);

  const update = (time: number) => {
    points.rotation.y = time * 0.03;
    points.rotation.x = Math.sin(time * 0.02) * 0.05;
  };

  return {
    points,
    update,
  };
}
