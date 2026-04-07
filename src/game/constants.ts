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
  Basic = 'Basic',
  Rapid = 'Rapid',
  Spread = 'Spread',
  Laser = 'Laser',
  Missile = 'Missile',
  Plasma = 'Plasma',
  Wave = 'Wave',
  Blade = 'Blade',
  Boomerang = 'Boomerang',
  Sniper = 'Sniper',
}

export enum CharacterType {
  Green = 'Green',
  Red = 'Red',
  Yellow = 'Yellow',
  Blue = 'Blue',
}

export const WEAPONS = [
  WeaponType.Basic,
  WeaponType.Rapid,
  WeaponType.Spread,
  WeaponType.Laser,
  WeaponType.Missile,
  WeaponType.Plasma,
  WeaponType.Wave,
  WeaponType.Blade,
  WeaponType.Boomerang,
  WeaponType.Sniper,
];

export const WEAPON_NAMES: Record<WeaponType, string> = {
  [WeaponType.Basic]: '基础弹',
  [WeaponType.Rapid]: '连射炮',
  [WeaponType.Spread]: '散弹枪',
  [WeaponType.Laser]: '激光束',
  [WeaponType.Missile]: '追踪弹',
  [WeaponType.Plasma]: '等离子',
  [WeaponType.Wave]: '波动炮',
  [WeaponType.Blade]: '光刃',
  [WeaponType.Boomerang]: '回旋镖',
  [WeaponType.Sniper]: '狙击枪',
};

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
