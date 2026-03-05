export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 800;

export const COLORS = {
  player: '#00ffcc', // Cyan Neon
  playerBullet: '#00ffff',
  enemy: '#ff0055', // Pink Neon
  enemyBullet: '#ffaa00',
  boss: '#ff0000',
  text: '#ffffff',
  shield: '#0099ff',
  powerup: '#00ff00',
  bomb: '#ff3333',
  background: '#050510',
  grid: '#1a1a2e'
};

export enum WeaponType {
  Blaster = 'Blaster',
  Spread = 'Spread',
  Laser = 'Laser',
  Homing = 'Homing',
  Plasma = 'Plasma', // Replaces Wave
}

export const WEAPONS = [
  WeaponType.Blaster,
  WeaponType.Spread,
  WeaponType.Laser,
  WeaponType.Homing,
  WeaponType.Plasma,
];

export enum ItemType {
  PowerUp = 'P',
  Shield = 'S',
  Bomb = 'B',
  Health = 'H',
  WeaponSwitch = 'W',
}

export enum EnemyType {
  Drone = 'Drone',
  Scout = 'Scout',
  Heavy = 'Heavy',
  Sniper = 'Sniper',
  Spinner = 'Spinner',
  Dasher = 'Dasher',
  Splitter = 'Splitter',
  Waver = 'Waver',
  Orbiter = 'Orbiter',
  Carrier = 'Carrier',
  LaserBot = 'LaserBot',
  MissileBoat = 'MissileBoat',
  Shielder = 'Shielder',
  Stealth = 'Stealth',
  Kamikaze = 'Kamikaze',
  Bouncer = 'Bouncer',
  SpreadBot = 'SpreadBot',
  Backstabber = 'Backstabber',
  Pulsar = 'Pulsar',
  Elite = 'Elite',
}
