import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, WeaponType, WEAPONS, WEAPON_NAMES, ItemType, EnemyType, CharacterType } from './constants';
import { SoundManager } from './SoundManager';

// --- Types ---
interface Entity {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  color: string;
  markedForDeletion: boolean;
  draw(ctx: CanvasRenderingContext2D): void;
  update(dt: number, ...args: any[]): void;
}

// --- Helpers ---
function drawPlaneShape(ctx: CanvasRenderingContext2D, type: CharacterType, color: string, isInvincible: boolean = false) {
    const shipColor = isInvincible ? '#ffff00' : color;
    ctx.strokeStyle = shipColor;
    ctx.lineWidth = 2;
    ctx.fillStyle = isInvincible ? '#333300' : '#001111';

    ctx.beginPath();
    switch (type) {
        case CharacterType.Green: // Defender - Heavy Armor
            ctx.moveTo(0, -22);
            ctx.lineTo(-10, -10);
            ctx.lineTo(-22, 0);
            ctx.lineTo(-22, 12);
            ctx.lineTo(-12, 12);
            ctx.lineTo(-12, 22);
            ctx.lineTo(-4, 22);
            ctx.lineTo(-4, 15);
            ctx.lineTo(4, 15);
            ctx.lineTo(4, 22);
            ctx.lineTo(12, 22);
            ctx.lineTo(12, 12);
            ctx.lineTo(22, 12);
            ctx.lineTo(22, 0);
            ctx.lineTo(10, -10);
            break;
        case CharacterType.Red: // Aggressive - Sharp, forward swept
            ctx.moveTo(0, -25);
            ctx.lineTo(-10, -5);
            ctx.lineTo(-25, 15);
            ctx.lineTo(-5, 10);
            ctx.lineTo(0, 20);
            ctx.lineTo(5, 10);
            ctx.lineTo(25, 15);
            ctx.lineTo(10, -5);
            break;
        case CharacterType.Yellow: // Carrier - Twin boom
            ctx.moveTo(-15, -15);
            ctx.lineTo(-15, 20);
            ctx.lineTo(-5, 15);
            ctx.lineTo(0, -5);
            ctx.lineTo(5, 15);
            ctx.lineTo(15, 20);
            ctx.lineTo(15, -15);
            ctx.lineTo(5, -15);
            ctx.lineTo(5, 5);
            ctx.lineTo(-5, 5);
            ctx.lineTo(-5, -15);
            break;
        case CharacterType.Blue: // Speed - Sleek Delta
            ctx.moveTo(0, -30);
            ctx.lineTo(-20, 20);
            ctx.lineTo(0, 10);
            ctx.lineTo(20, 20);
            break;
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Engine glow
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    if (type === CharacterType.Yellow) {
        ctx.arc(-15, 22, 3 + Math.random()*2, 0, Math.PI*2);
        ctx.arc(15, 22, 3 + Math.random()*2, 0, Math.PI*2);
    } else if (type === CharacterType.Green) {
        // Left thruster flame
        ctx.moveTo(-11, 22);
        ctx.lineTo(-5, 22);
        ctx.lineTo(-8, 32 + Math.random() * 10);
        // Right thruster flame
        ctx.moveTo(5, 22);
        ctx.lineTo(11, 22);
        ctx.lineTo(8, 32 + Math.random() * 10);
    } else {
        ctx.moveTo(-5, 15);
        ctx.lineTo(5, 15);
        ctx.lineTo(0, 25 + Math.random() * 10);
    }
    ctx.fill();
}

function drawWeaponIcon(ctx: CanvasRenderingContext2D, type: WeaponType, x: number, y: number, size: number, color: string) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    switch(type) {
        case WeaponType.Basic:
            ctx.moveTo(-size/3, -size/2); ctx.lineTo(-size/3, size/2);
            ctx.moveTo(size/3, -size/2); ctx.lineTo(size/3, size/2);
            ctx.stroke();
            break;
        case WeaponType.Rapid:
            ctx.moveTo(-size/4, -size/2); ctx.lineTo(-size/4, size/2);
            ctx.moveTo(0, -size/2); ctx.lineTo(0, size/2);
            ctx.moveTo(size/4, -size/2); ctx.lineTo(size/4, size/2);
            ctx.stroke();
            break;
        case WeaponType.Spread:
            ctx.moveTo(0, size/2); ctx.lineTo(0, -size/2);
            ctx.moveTo(0, size/2); ctx.lineTo(-size/1.5, -size/2);
            ctx.moveTo(0, size/2); ctx.lineTo(size/1.5, -size/2);
            ctx.stroke();
            break;
        case WeaponType.Laser:
            ctx.fillRect(-size/4, -size/2, size/2, size);
            break;
        case WeaponType.Missile:
            ctx.moveTo(-size/2, size/2); ctx.lineTo(0, -size/2); ctx.lineTo(size/2, size/2);
            ctx.lineTo(0, 0); ctx.closePath();
            ctx.fill();
            break;
        case WeaponType.Plasma:
            ctx.arc(0, 0, size/2, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, 0, size/4, 0, Math.PI*2);
            ctx.fill();
            break;
        case WeaponType.Wave:
            ctx.beginPath();
            ctx.moveTo(-size/2, 0);
            ctx.quadraticCurveTo(-size/4, -size/2, 0, 0);
            ctx.quadraticCurveTo(size/4, size/2, size/2, 0);
            ctx.stroke();
            break;
        case WeaponType.Blade:
            ctx.beginPath();
            ctx.arc(0, size/2, size, Math.PI + Math.PI/4, Math.PI*2 - Math.PI/4);
            ctx.stroke();
            break;
        case WeaponType.Boomerang:
            ctx.moveTo(-size/2, size/2); ctx.lineTo(0, -size/2); ctx.lineTo(size/2, size/2);
            ctx.lineTo(0, size/4); ctx.closePath();
            ctx.stroke();
            break;
        case WeaponType.Sniper:
            ctx.moveTo(0, -size); ctx.lineTo(0, size);
            ctx.moveTo(-size/2, 0); ctx.lineTo(size/2, 0);
            ctx.stroke();
            break;
    }
    ctx.restore();
}

// --- Classes ---

class Particle implements Entity {
  id: number;
  x: number;
  y: number;
  width: number = 2;
  height: number = 2;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  markedForDeletion: boolean = false;

  constructor(x: number, y: number, color: string, speed: number, life: number) {
    this.id = Math.random();
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.color = color;
    this.life = life;
    this.maxLife = life;
  }

  update(dt: number) {
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.life -= dt;
    if (this.life <= 0) this.markedForDeletion = true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.life / this.maxLife;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width * 2, this.height * 2);
    ctx.globalAlpha = 1;
  }
}

const MAX_PARTICLES = 100;

class FloatingText {
    x: number;
    y: number;
    text: string;
    color: string;
    life: number = 1.0;
    vy: number = -20;
    size: number;

    constructor(x: number, y: number, text: string, color: string, size: number = 12) {
        this.x = x + (Math.random() - 0.5) * 20;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
    }

    update(dt: number) {
        this.y += this.vy * dt;
        this.life -= dt;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.size}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

class Star {
    x: number;
    y: number;
    z: number;
    size: number;
    brightness: number;

    constructor() {
        this.x = Math.random() * CANVAS_WIDTH;
        this.y = Math.random() * CANVAS_HEIGHT;
        this.z = Math.random() * 2 + 0.5; // Depth factor
        this.size = Math.random() * 1.5;
        this.brightness = Math.random();
    }

    update(dt: number, speed: number) {
        this.y += speed * this.z * dt * 60;
        if (this.y > CANVAS_HEIGHT) {
            this.y = 0;
            this.x = Math.random() * CANVAS_WIDTH;
        }
        this.brightness += (Math.random() - 0.5) * 0.1;
        if (this.brightness > 1) this.brightness = 1;
        if (this.brightness < 0.3) this.brightness = 0.3;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
    }
}

class Nebula {
    x: number;
    y: number;
    size: number;
    color: string;
    speed: number;
    
    constructor() {
        this.x = Math.random() * CANVAS_WIDTH;
        this.y = Math.random() * CANVAS_HEIGHT;
        this.size = 100 + Math.random() * 200;
        this.speed = 0.2 + Math.random() * 0.3;
        // Random cosmic colors
        const colors = ['#ff00ff', '#00ffff', '#0000ff', '#4b0082', '#ff0055'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    
    update(dt: number) {
        this.y += this.speed * dt * 60;
        if (this.y > CANVAS_HEIGHT + this.size) {
            this.y = -this.size;
            this.x = Math.random() * CANVAS_WIDTH;
        }
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Bullet implements Entity {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  color: string;
  damage: number;
  isPlayer: boolean;
  markedForDeletion: boolean = false;
  type: WeaponType | 'EnemyBasic' | 'EnemyLaser' | 'EnemyOrb' | 'UltLaser';
  homingTarget?: Entity | null;
  angle: number = 0;

  constructor(x: number, y: number, vx: number, vy: number, damage: number, isPlayer: boolean, type: WeaponType | 'EnemyBasic' | 'EnemyLaser' | 'EnemyOrb' | 'UltLaser' = WeaponType.Basic, color: string = COLORS.playerBullet) {
    this.id = Math.random();
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.isPlayer = isPlayer;
    this.type = type;
    this.color = color;
    
    if (type === WeaponType.Laser || type === 'EnemyLaser' || type === 'UltLaser') {
      this.width = type === 'UltLaser' ? 20 : 6;
      this.height = type === 'UltLaser' ? CANVAS_HEIGHT : 40;
    } else if (type === WeaponType.Plasma || type === 'EnemyOrb') {
      this.width = 15;
      this.height = 15;
    } else if (type === WeaponType.Blade) {
      this.width = 40;
      this.height = 10;
    } else if (type === WeaponType.Sniper) {
      this.width = 4;
      this.height = 25;
    } else {
      this.width = 8;
      this.height = 8;
    }
  }

  update(dt: number) {
    if (this.type === WeaponType.Missile && this.homingTarget && !this.homingTarget.markedForDeletion) {
      const angle = Math.atan2(this.homingTarget.y - this.y, this.homingTarget.x - this.x);
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const currentAngle = Math.atan2(this.vy, this.vx);
      let diff = angle - currentAngle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      
      const turnSpeed = 5 * dt;
      const newAngle = currentAngle + Math.max(-turnSpeed, Math.min(turnSpeed, diff));
      
      this.vx = Math.cos(newAngle) * speed;
      this.vy = Math.sin(newAngle) * speed;
      this.angle = newAngle;
    } else if (this.type === WeaponType.Plasma) {
      this.width += dt * 10;
      this.height += dt * 10;
      this.x += (Math.random() - 0.5) * 2;
    } else if (this.type === WeaponType.Wave) {
      this.x += Math.cos(this.y / 20) * 5;
    } else if (this.type === WeaponType.Boomerang) {
      this.vy += dt * 20; // Gravity pulling it back down
      this.angle += dt * 10; // Spin
    } else if (this.type === 'UltLaser') {
        // Ult laser moves with player (logic handled in GameEngine or Player update if attached)
        // For now, simple vertical beam
    }

    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;

    if (this.x < -50 || this.x > CANVAS_WIDTH + 50 || this.y < -50 || this.y > CANVAS_HEIGHT + 50) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    
    if (this.type === WeaponType.Spread || this.type === 'EnemyOrb') {
       ctx.beginPath();
       ctx.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
       ctx.fill();
    } else if (this.type === WeaponType.Plasma) {
       ctx.beginPath();
       ctx.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
       ctx.fill();
       ctx.fillStyle = '#ffffff';
       ctx.beginPath();
       ctx.arc(this.x, this.y, this.width/4, 0, Math.PI * 2);
       ctx.fill();
    } else if (this.type === WeaponType.Laser || this.type === 'EnemyLaser' || this.type === WeaponType.Sniper) {
       ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    } else if (this.type === 'UltLaser') {
       ctx.fillRect(this.x - this.width/2, 0, this.width, CANVAS_HEIGHT); // Full screen height
    } else if (this.type === WeaponType.Missile) {
       ctx.save();
       ctx.translate(this.x, this.y);
       ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI/2);
       ctx.beginPath();
       ctx.moveTo(0, -5);
       ctx.lineTo(-3, 5);
       ctx.lineTo(3, 5);
       ctx.fill();
       ctx.restore();
    } else if (this.type === WeaponType.Blade) {
       ctx.save();
       ctx.translate(this.x, this.y);
       ctx.beginPath();
       ctx.arc(0, 0, this.width/2, Math.PI + Math.PI/4, Math.PI*2 - Math.PI/4);
       ctx.strokeStyle = this.color;
       ctx.lineWidth = 4;
       ctx.stroke();
       ctx.restore();
    } else if (this.type === WeaponType.Boomerang) {
       ctx.save();
       ctx.translate(this.x, this.y);
       ctx.rotate(this.angle);
       ctx.beginPath();
       ctx.moveTo(-8, 8); ctx.lineTo(0, -8); ctx.lineTo(8, 8);
       ctx.lineTo(0, 2); ctx.closePath();
       ctx.strokeStyle = this.color;
       ctx.lineWidth = 2;
       ctx.stroke();
       ctx.restore();
    } else {
       ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }
    ctx.shadowBlur = 0;
  }
}

class Item implements Entity {
  id: number;
  x: number;
  y: number;
  width: number = 24;
  height: number = 24;
  vx: number = 0;
  vy: number = 1;
  type: ItemType;
  color: string;
  markedForDeletion: boolean = false;
  text: string;
  wobble: number = 0;
  weaponType?: WeaponType; // For WeaponSwitch items

  constructor(x: number, y: number, type: ItemType, weaponType?: WeaponType) {
    this.id = Math.random();
    this.x = x;
    this.y = y;
    this.type = type;
    this.weaponType = weaponType;
    
    switch(type) {
      case ItemType.PowerUp: this.color = COLORS.powerup; this.text = 'P'; break;
      case ItemType.Shield: this.color = COLORS.shield; this.text = 'S'; break;
      case ItemType.Bomb: this.color = COLORS.bomb; this.text = 'B'; break;
      case ItemType.Health: this.color = '#ff69b4'; this.text = 'H'; break;
      case ItemType.WeaponSwitch: 
          this.color = '#ffa500'; 
          // Show first letter of weapon type
          this.text = weaponType ? weaponType.charAt(0) : 'W'; 
          break;
      default: this.color = '#fff'; this.text = '?';
    }
  }

  update(dt: number, player?: Player) {
    this.y += this.vy * dt * 60;
    this.wobble += dt * 5;
    this.x += Math.sin(this.wobble) * 0.5;
    
    // Magnet Effect
    if (player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 150) {
            this.x += (dx / dist) * 5 * dt * 60;
            this.y += (dy / dist) * 5 * dt * 60;
        }
    }

    if (this.x < 20 || this.x > CANVAS_WIDTH - 20) this.vx *= -1;
    if (this.y > CANVAS_HEIGHT + 20) this.markedForDeletion = true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.lineWidth = 2;

    // Universal dark background circle to make item stand out
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fill();

    // Universal pulsing outer ring for ALL items
    ctx.beginPath();
    ctx.arc(0, 0, 20 + Math.sin(Date.now() / 150) * 3, 0, Math.PI * 2);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Reset fill style for inner icons
    ctx.fillStyle = this.color;

    if (this.type === ItemType.Health) {
        // Heart shape
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.bezierCurveTo(-10, -5, -15, -10, -10, -15);
        ctx.bezierCurveTo(-5, -20, 0, -10, 0, -10);
        ctx.bezierCurveTo(0, -10, 5, -20, 10, -15);
        ctx.bezierCurveTo(15, -10, 10, -5, 0, 5);
        ctx.fill();
        this.text = "修复";
    } else if (this.type === ItemType.Shield) {
        // Shield shape
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(12, -12);
        ctx.lineTo(12, 2);
        ctx.arc(0, 2, 12, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', 0, -2);
        this.text = "护盾";
    } else if (this.type === ItemType.Bomb) {
        // Bomb shape
        ctx.beginPath();
        ctx.arc(0, 2, 8, 0, Math.PI*2);
        ctx.fill();
        ctx.fillRect(-3, -12, 6, 6);
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.quadraticCurveTo(5, -18, 10, -15);
        ctx.stroke();
        this.text = "大招";
    } else if (this.type === ItemType.PowerUp) {
        // Double Up Arrow
        ctx.beginPath();
        ctx.moveTo(-8, 2); ctx.lineTo(0, -6); ctx.lineTo(8, 2);
        ctx.moveTo(-8, 10); ctx.lineTo(0, 2); ctx.lineTo(8, 10);
        ctx.lineWidth = 3;
        ctx.stroke();
        this.text = "升级";
    } else if (this.type === ItemType.WeaponSwitch) {
        // Draw weapon icon inside
        if (this.weaponType) {
            drawWeaponIcon(ctx, this.weaponType, 0, -2, 16, this.color);
            this.text = WEAPON_NAMES[this.weaponType];
        } else {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.text, 0, 0);
        }
    }

    // Draw clear text label below the item
    ctx.fillStyle = this.color;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.text, 0, 35);

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

class Enemy implements Entity {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  color: string;
  markedForDeletion: boolean = false;
  scoreValue: number;
  shootTimer: number = 0;
  shootInterval: number;
  type: EnemyType;
  rotation: number = 0;
  state: number = 0; 
  hitFlash: number = 0;

  constructor(x: number, y: number, type: EnemyType, levelMultiplier: number, colorShift: string) {
    this.id = Math.random();
    this.x = x;
    this.y = y;
    this.type = type;
    this.color = colorShift || COLORS.enemy; // Use shifted color

    this.width = 30; this.height = 30;
    this.vx = 0; this.vy = 1;
    this.hp = 10 * levelMultiplier;
    this.scoreValue = 10;
    this.shootInterval = 2;

    switch(type) {
      case EnemyType.Drone: this.vy = 2; break;
      case EnemyType.Scout: this.vx = 2; this.vy = 3; this.hp = 15 * levelMultiplier; break;
      case EnemyType.Heavy: this.width = 50; this.height = 50; this.vy = 0.5; this.hp = 60 * levelMultiplier; break;
      case EnemyType.Sniper: this.vy = 1; this.shootInterval = 3; break;
      case EnemyType.Spinner: this.vy = 1.5; this.shootInterval = 0.5; break;
      case EnemyType.Dasher: this.vy = 1; this.shootInterval = 99; break;
      case EnemyType.Splitter: this.vy = 1.5; this.hp = 20 * levelMultiplier; break;
      case EnemyType.Waver: this.vy = 2; break;
      case EnemyType.Orbiter: this.vy = 1; break;
      case EnemyType.Carrier: this.width = 60; this.height = 40; this.vy = 0.3; this.hp = 100 * levelMultiplier; break;
      case EnemyType.LaserBot: this.vy = 0.8; this.shootInterval = 4; break;
      case EnemyType.MissileBoat: this.vy = 0.8; this.shootInterval = 3; break;
      case EnemyType.Shielder: this.vy = 1; this.hp = 40 * levelMultiplier; break;
      case EnemyType.Stealth: this.vy = 2; this.hp = 10 * levelMultiplier; break;
      case EnemyType.Kamikaze: this.vy = 4; this.hp = 5 * levelMultiplier; break;
      case EnemyType.Bouncer: this.vx = 3; this.vy = 2; break;
      case EnemyType.SpreadBot: this.vy = 1; this.shootInterval = 2.5; break;
      case EnemyType.Backstabber: this.y = CANVAS_HEIGHT + 20; this.vy = -3; break;
      case EnemyType.Pulsar: this.vy = 0.5; break;
      case EnemyType.Elite: this.width = 45; this.height = 45; this.vy = 1; this.hp = 150 * levelMultiplier; break;
    }
    this.maxHp = this.hp;
    this.shootTimer = Math.random() * this.shootInterval;
  }

  update(dt: number, playerX: number, playerY: number) {
    this.rotation += dt * 2;

    switch(this.type) {
        case EnemyType.Scout:
            this.x += Math.sin(this.y * 0.05) * 3;
            break;
        case EnemyType.Sniper:
            if (this.y > 100 && this.y < 300) this.vy = 0; 
            else this.vy = 1;
            break;
        case EnemyType.Dasher:
            this.state += dt;
            if (this.state > 2) { 
                this.vy = 8;
                if (this.state > 2.5) { this.state = 0; this.vy = 1; }
            }
            break;
        case EnemyType.Waver:
            this.x += Math.cos(this.y * 0.03) * 4;
            break;
        case EnemyType.Orbiter:
            this.x += Math.cos(this.y * 0.05) * 2;
            this.y += Math.sin(this.x * 0.05) * 2;
            break;
        case EnemyType.Kamikaze:
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 0) {
                this.vx = (dx / dist) * 4;
                this.vy = (dy / dist) * 4;
            }
            break;
        case EnemyType.Bouncer:
            if (this.x < 20 || this.x > CANVAS_WIDTH - 20) this.vx *= -1;
            break;
    }

    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;

    if (this.hitFlash > 0) this.hitFlash--;

    if (this.y > CANVAS_HEIGHT + 50 || (this.type === EnemyType.Backstabber && this.y < -50)) {
        this.markedForDeletion = true;
    }
    this.shootTimer -= dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    
    ctx.save();
    ctx.translate(this.x, this.y);
    
    if (this.type === EnemyType.Kamikaze || this.type === EnemyType.Spinner) {
        ctx.rotate(this.rotation * 3);
    } else if (this.type === EnemyType.Backstabber) {
        // Face up
    } else {
        ctx.rotate(Math.PI); // Face down
    }

    if (this.type === EnemyType.Stealth) {
        ctx.globalAlpha = 0.2 + Math.abs(Math.sin(Date.now() / 500)) * 0.5;
    }

    ctx.beginPath();
    switch(this.type) {
        case EnemyType.Drone: ctx.moveTo(0,15); ctx.lineTo(-15,-15); ctx.lineTo(15,-15); break;
        case EnemyType.Scout: ctx.moveTo(0,20); ctx.lineTo(-10,0); ctx.lineTo(0,-10); ctx.lineTo(10,0); break;
        case EnemyType.Heavy: ctx.rect(-25,-25,50,50); break;
        case EnemyType.Sniper: ctx.moveTo(0,20); ctx.lineTo(-5,-20); ctx.lineTo(5,-20); break;
        case EnemyType.Spinner: ctx.moveTo(0,15); ctx.lineTo(15,-10); ctx.lineTo(-15,-10); break; 
        case EnemyType.Dasher: ctx.moveTo(0,20); ctx.lineTo(-10,-10); ctx.lineTo(0,0); ctx.lineTo(10,-10); break;
        case EnemyType.Splitter: ctx.arc(0,0,15,0,Math.PI*2); ctx.moveTo(0,-15); ctx.lineTo(0,15); break;
        case EnemyType.Waver: ctx.moveTo(-15,0); ctx.quadraticCurveTo(0,20,15,0); ctx.quadraticCurveTo(0,-20,-15,0); break;
        case EnemyType.Orbiter: ctx.arc(0,0,12,0,Math.PI*2); ctx.arc(15,0,4,0,Math.PI*2); break;
        case EnemyType.Carrier: ctx.rect(-30,-20,60,40); ctx.rect(-10,-10,20,20); break;
        case EnemyType.LaserBot: ctx.moveTo(0,20); ctx.arc(0,-5,15,0,Math.PI,true); break;
        case EnemyType.MissileBoat: ctx.rect(-15,-15,30,30); ctx.rect(-20,0,10,20); ctx.rect(10,0,10,20); break;
        case EnemyType.Shielder: ctx.arc(0,0,15,0,Math.PI*2); ctx.arc(0,10,25,Math.PI,0); break;
        case EnemyType.Stealth: ctx.moveTo(0,15); ctx.lineTo(-10,-15); ctx.lineTo(0,-5); ctx.lineTo(10,-15); break;
        case EnemyType.Kamikaze: for(let i=0;i<8;i++){const a=i*Math.PI/4;const r=i%2?15:8;i===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);} break;
        case EnemyType.Bouncer: ctx.arc(0,0,15,0,Math.PI*2); break;
        case EnemyType.SpreadBot: ctx.moveTo(0,15); ctx.lineTo(-20,-10); ctx.lineTo(20,-10); break;
        case EnemyType.Backstabber: ctx.moveTo(0,-20); ctx.lineTo(-10,10); ctx.lineTo(10,10); break;
        case EnemyType.Pulsar: ctx.arc(0,0,10 + Math.sin(Date.now()/200)*5,0,Math.PI*2); break;
        case EnemyType.Elite: ctx.moveTo(0,25); ctx.lineTo(-20,-15); ctx.lineTo(0,-5); ctx.lineTo(20,-15); ctx.rect(-5,-25,10,20); break;
        default: ctx.arc(0,0,15,0,Math.PI*2);
    }
    ctx.closePath();
    ctx.stroke();
    
    if (this.hitFlash > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    } else {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3 + (this.hp / this.maxHp) * 0.4;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    ctx.restore();
    ctx.shadowBlur = 0;
  }
}

class Boss implements Entity {
  id: number;
  x: number;
  y: number;
  width: number = 120;
  height: number = 120;
  vx: number = 2;
  vy: number = 0;
  hp: number;
  maxHp: number;
  color: string = COLORS.boss;
  markedForDeletion: boolean = false;
  level: number;
  shootTimer: number = 0;
  moveTimer: number = 0;
  state: 'ENTERING' | 'COMBAT' = 'ENTERING';
  hitFlash: number = 0;

  constructor(level: number, colorShift: string) {
    this.id = Math.random();
    this.level = level;
    this.x = CANVAS_WIDTH / 2;
    this.y = -150; 
    this.hp = 2500 * level; // 2.5x HP (was 5000)
    this.maxHp = this.hp;
    if (colorShift) this.color = colorShift;
  }

  update(dt: number) {
    // Boss Entrance & Movement Logic
    if (this.hitFlash > 0) this.hitFlash--;
    
    if (this.state === 'ENTERING') {
      // Entrance Phase: Move down to starting position
      this.y += 2 * dt * 60;
      if (this.y >= 120) {
          this.y = 120;
          this.state = 'COMBAT';
      }
    } else {
      // Combat Phase: Hover pattern
      this.moveTimer += dt;
      
      // Smooth Figure-8 or Sine Wave motion
      // Ensure it stays within screen bounds (padding 80px)
      const centerX = CANVAS_WIDTH / 2;
      const amplitudeX = CANVAS_WIDTH / 2 - 80;
      
      this.x = centerX + Math.sin(this.moveTimer * 0.8) * amplitudeX;
      this.y = 120 + Math.sin(this.moveTimer * 1.5) * 40;
    }
    this.shootTimer -= dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.hitFlash > 0 ? '#fff' : this.color;
    ctx.fillStyle = this.hitFlash > 0 ? '#fff' : '#220000';
    ctx.lineWidth = 4;
    
    ctx.save();
    ctx.translate(this.x, this.y);
    
    ctx.beginPath();
    // Complex Boss Shapes
    const visualLevel = (this.level - 1) % 5 + 1; // Cycle visuals 1-5
    if (visualLevel === 1) { // TITAN
        ctx.moveTo(0, 80); ctx.lineTo(-60, -20); ctx.lineTo(-40, -60); ctx.lineTo(40, -60); ctx.lineTo(60, -20);
        ctx.moveTo(-60,-20); ctx.lineTo(-80, 20); ctx.lineTo(-60, 40);
        ctx.moveTo(60,-20); ctx.lineTo(80, 20); ctx.lineTo(60, 40);
    } else if (visualLevel === 2) { // HYDRA
        ctx.arc(0,0,40,0,Math.PI*2);
        ctx.moveTo(-50,20); ctx.arc(-60,40,20,0,Math.PI*2);
        ctx.moveTo(50,20); ctx.arc(60,40,20,0,Math.PI*2);
    } else if (visualLevel === 3) { // VOID EYE
        ctx.arc(0,0,60,0,Math.PI*2);
        ctx.moveTo(0,0); ctx.arc(0,0,20,0,Math.PI*2);
        for(let i=0;i<8;i++) {
            const a = i*Math.PI/4 + Date.now()/1000;
            ctx.moveTo(Math.cos(a)*60, Math.sin(a)*60);
            ctx.lineTo(Math.cos(a)*90, Math.sin(a)*90);
        }
    } else if (visualLevel === 4) { // MOTHERSHIP
        ctx.moveTo(0,80); ctx.lineTo(-100,-40); ctx.lineTo(0,-80); ctx.lineTo(100,-40);
        ctx.moveTo(-60,0); ctx.lineTo(-80, 40);
        ctx.moveTo(60,0); ctx.lineTo(80, 40);
    } else { // OMEGA CORE
        ctx.rotate(Date.now() / 500);
        ctx.rect(-50,-50,100,100);
        ctx.rotate(Math.PI/4);
        ctx.rect(-50,-50,100,100);
        ctx.rotate(Math.PI/4);
        ctx.rect(-50,-50,100,100);
    }
    
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // HP Bar
    ctx.fillStyle = '#330000';
    ctx.fillRect(10, 10, CANVAS_WIDTH - 20, 15);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(10, 10, (CANVAS_WIDTH - 20) * (this.hp / this.maxHp), 15);
    
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`警告: BOSS 第 ${this.level} 关`, CANVAS_WIDTH/2, 22);
  }
}

class Wingman implements Entity {
  id: number;
  x: number;
  y: number;
  width: number = 30;
  height: number = 30;
  vx: number = 0;
  vy: number = 0;
  color: string;
  markedForDeletion: boolean = false;
  offset: { x: number, y: number };
  shootTimer: number = 0;

  constructor(x: number, y: number, color: string, offset: { x: number, y: number }) {
    this.id = Math.random();
    this.x = x;
    this.y = y;
    this.color = color;
    this.offset = offset;
  }

  update(dt: number, playerX: number, playerY: number) {
    this.x = playerX + this.offset.x;
    this.y = playerY + this.offset.y;
    this.shootTimer -= dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(-10, 10);
    ctx.lineTo(10, 10);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

class Player implements Entity {
  id: number = 0;
  x: number = CANVAS_WIDTH / 2;
  y: number = CANVAS_HEIGHT - 100;
  width: number = 40;
  height: number = 40;
  vx: number = 0;
  vy: number = 0;
  color: string = COLORS.player;
  markedForDeletion: boolean = false;
  
  characterType: CharacterType = CharacterType.Green;
  hp: number = 100;
  maxHp: number = 100;
  weaponLevel: number = 1;
  weaponType: WeaponType = WeaponType.Basic;
  shield: number = 0;
  ultCount: number = 3; // Max 3
  
  shootTimer: number = 0;
  shootInterval: number = 0.12;
  
  invincibleTimer: number = 0;
  ultActiveTimer: number = 0;
  wingmen: Wingman[] = [];

  constructor(type: CharacterType = CharacterType.Green) {
    this.characterType = type;
    switch(type) {
      case CharacterType.Green: this.color = '#00ff00'; break;
      case CharacterType.Red: this.color = '#ff0000'; break;
      case CharacterType.Yellow: this.color = '#ffff00'; break;
      case CharacterType.Blue: this.color = '#0000ff'; break;
    }
  }

  update(dt: number) {
    this.x = Math.max(this.width/2, Math.min(CANVAS_WIDTH - this.width/2, this.x));
    this.y = Math.max(this.height/2, Math.min(CANVAS_HEIGHT - this.height/2, this.y));
    this.shootTimer -= dt;
    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
    if (this.ultActiveTimer > 0) this.ultActiveTimer -= dt;
    
    this.wingmen.forEach(w => w.update(dt, this.x, this.y));
    if (this.ultActiveTimer <= 0) {
        this.wingmen = [];
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.wingmen.forEach(w => w.draw(ctx));
    ctx.save();
    ctx.translate(this.x, this.y);

    // Invincible Blink
    if (this.invincibleTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }

    // Shield
    if (this.shield > 0) {
      ctx.strokeStyle = COLORS.shield;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 35, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw the specific plane shape
    drawPlaneShape(ctx, this.characterType, this.color, this.invincibleTimer > 0);

    // Green Cyclone Ultimate
    if (this.characterType === CharacterType.Green && this.ultActiveTimer > 0) {
        ctx.save();
        ctx.rotate(Date.now() / 50);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, 70, i * Math.PI/2, i * Math.PI/2 + Math.PI/4);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, 50, i * Math.PI/2 + Math.PI/8, i * Math.PI/2 + Math.PI/4 + Math.PI/8);
            ctx.stroke();
        }
        ctx.restore();
    }

    ctx.restore();
  }
}

// --- Game Engine ---

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  
  player: Player;
  bullets: Bullet[] = [];
  enemies: Enemy[] = [];
  particles: Particle[] = [];
  items: Item[] = [];
  boss: Boss | null = null;
  
  floatingTexts: FloatingText[] = [];
  stars: Star[] = [];
  nebulae: Nebula[] = [];
  
  soundManager: SoundManager;

  level: number = 1;
  loopCount: number = 1;
  score: number = 0;
  state: 'START' | 'CHARACTER_SELECT' | 'PLAYING' | 'GAMEOVER' | 'VICTORY' = 'START';
  selectedCharacter: CharacterType = CharacterType.Green;
  
  lastTime: number = 0;
  enemySpawnTimer: number = 0;
  levelTimer: number = 0;
  levelDuration: number = 30; 
  
  shake: number = 0;
  bossWarningTimer: number = 0;
  
  isDragging: boolean = false;
  lastInputX: number = 0;
  lastInputY: number = 0;
  
  // Colors for loops
  bgColors = ['#050510', '#100505', '#051005', '#101005', '#100510'];
  enemyColors = [COLORS.enemy, '#ffaa00', '#00ff00', '#0000ff', '#ffffff'];
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.player = new Player();
    this.soundManager = new SoundManager();
    
    // Init Stars
    for(let i=0; i<100; i++) {
        this.stars.push(new Star());
    }
    
    // Init Nebulae
    for(let i=0; i<5; i++) {
        this.nebulae.push(new Nebula());
    }

    const startDrag = (x: number, y: number) => {
        if (this.state === 'PLAYING') {
            // Check if clicking Ult Button (Bottom Right)
            if (x > CANVAS_WIDTH - 80 && y > CANVAS_HEIGHT - 80) {
                this.triggerUlt();
                return;
            }
            this.isDragging = true;
            this.lastInputX = x;
            this.lastInputY = y;
        }
    };
    
    const moveDrag = (x: number, y: number) => {
        if (this.isDragging && this.state === 'PLAYING') {
            const dx = x - this.lastInputX;
            const dy = y - this.lastInputY;
            this.player.x += dx;
            this.player.y += dy;
            this.lastInputX = x;
            this.lastInputY = y;
        }
    };
    
    const endDrag = () => { this.isDragging = false; };

    // Canvas listeners for start
    this.canvas.addEventListener('mousedown', (e) => {
        const r = this.canvas.getBoundingClientRect();
        const sx = this.canvas.width / r.width;
        const sy = this.canvas.height / r.height;
        const x = (e.clientX - r.left) * sx;
        const y = (e.clientY - r.top) * sy;
        
        if (this.state === 'START') {
            this.state = 'CHARACTER_SELECT';
            this.soundManager.resume();
            return;
        }
        
        if (this.state === 'CHARACTER_SELECT') {
            const centerX = CANVAS_WIDTH / 2;
            const centerY = CANVAS_HEIGHT / 2;
            const boxWidth = 140;
            const boxHeight = 160;
            const spacing = 30;
            
            // 2x2 Grid positions
            const positions = [
                { x: centerX - boxWidth - spacing/2, y: centerY - boxHeight - spacing/2 }, // Top Left: Green
                { x: centerX + spacing/2, y: centerY - boxHeight - spacing/2 },            // Top Right: Red
                { x: centerX - boxWidth - spacing/2, y: centerY + spacing/2 },            // Bottom Left: Yellow
                { x: centerX + spacing/2, y: centerY + spacing/2 }                         // Bottom Right: Blue
            ];

            // Check Green
            if (x > positions[0].x && x < positions[0].x + boxWidth && y > positions[0].y && y < positions[0].y + boxHeight) {
                this.selectedCharacter = CharacterType.Green;
                if (this.handleClick()) startDrag(x, y);
            }
            // Check Red
            if (x > positions[1].x && x < positions[1].x + boxWidth && y > positions[1].y && y < positions[1].y + boxHeight) {
                this.selectedCharacter = CharacterType.Red;
                if (this.handleClick()) startDrag(x, y);
            }
            // Check Yellow
            if (x > positions[2].x && x < positions[2].x + boxWidth && y > positions[2].y && y < positions[2].y + boxHeight) {
                this.selectedCharacter = CharacterType.Yellow;
                if (this.handleClick()) startDrag(x, y);
            }
            // Check Blue
            if (x > positions[3].x && x < positions[3].x + boxWidth && y > positions[3].y && y < positions[3].y + boxHeight) {
                this.selectedCharacter = CharacterType.Blue;
                if (this.handleClick()) startDrag(x, y);
            }
            return;
        }

        if (this.state !== 'PLAYING') {
            if (this.handleClick()) {
                startDrag(x, y);
            }
            this.soundManager.resume();
        } else {
            startDrag(x, y);
        }
    });
    
    // Window listeners for move/end to prevent getting stuck
    window.addEventListener('mousemove', (e) => {
        const r = this.canvas.getBoundingClientRect();
        const sx = this.canvas.width / r.width;
        const sy = this.canvas.height / r.height;
        // Calculate relative to canvas even if outside
        const x = (e.clientX - r.left) * sx;
        const y = (e.clientY - r.top) * sy;
        moveDrag(x, y);
    });
    
    window.addEventListener('mouseup', endDrag);
    
    this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const r = this.canvas.getBoundingClientRect();
        const sx = this.canvas.width / r.width;
        const sy = this.canvas.height / r.height;
        const x = (e.touches[0].clientX - r.left) * sx;
        const y = (e.touches[0].clientY - r.top) * sy;

        if (this.state === 'START') {
            this.state = 'CHARACTER_SELECT';
            this.soundManager.resume();
            return;
        }

        if (this.state === 'CHARACTER_SELECT') {
            const centerX = CANVAS_WIDTH / 2;
            const centerY = CANVAS_HEIGHT / 2;
            const boxWidth = 140;
            const boxHeight = 160;
            const spacing = 30;
            
            const positions = [
                { x: centerX - boxWidth - spacing/2, y: centerY - boxHeight - spacing/2 },
                { x: centerX + spacing/2, y: centerY - boxHeight - spacing/2 },
                { x: centerX - boxWidth - spacing/2, y: centerY + spacing/2 },
                { x: centerX + spacing/2, y: centerY + spacing/2 }
            ];

            // Check Green
            if (x > positions[0].x && x < positions[0].x + boxWidth && y > positions[0].y && y < positions[0].y + boxHeight) {
                this.selectedCharacter = CharacterType.Green;
                this.handleClick();
                startDrag(x, y);
            }
            // Check Red
            if (x > positions[1].x && x < positions[1].x + boxWidth && y > positions[1].y && y < positions[1].y + boxHeight) {
                this.selectedCharacter = CharacterType.Red;
                this.handleClick();
                startDrag(x, y);
            }
            // Check Yellow
            if (x > positions[2].x && x < positions[2].x + boxWidth && y > positions[2].y && y < positions[2].y + boxHeight) {
                this.selectedCharacter = CharacterType.Yellow;
                this.handleClick();
                startDrag(x, y);
            }
            // Check Blue
            if (x > positions[3].x && x < positions[3].x + boxWidth && y > positions[3].y && y < positions[3].y + boxHeight) {
                this.selectedCharacter = CharacterType.Blue;
                this.handleClick();
                startDrag(x, y);
            }
            return;
        }

        if (this.state !== 'PLAYING') {
            if (this.handleClick()) {
                startDrag(x, y);
            }
            this.soundManager.resume();
        } else {
            startDrag(x, y);
        }
    }, { passive: false });
    
    // Move touch listeners back to canvas for better compatibility
    this.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Always prevent scrolling on canvas
        if (this.isDragging && e.touches.length > 0) {
            const r = this.canvas.getBoundingClientRect();
            const sx = this.canvas.width / r.width;
            const sy = this.canvas.height / r.height;
            const x = (e.touches[0].clientX - r.left) * sx;
            const y = (e.touches[0].clientY - r.top) * sy;
            moveDrag(x, y);
        }
    }, { passive: false });
    
    this.canvas.addEventListener('touchend', endDrag);
  }
  
  handleClick(): boolean {
       if (this.state === 'CHARACTER_SELECT' || this.state === 'VICTORY') {
         this.resetGame();
         return true;
       }
       if (this.state === 'GAMEOVER') {
         this.state = 'CHARACTER_SELECT';
         return true;
       }
       return false;
  }
  
  resetGame() {
    this.player = new Player(this.selectedCharacter);
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.items = [];
    this.boss = null;
    this.level = 1;
    this.loopCount = 1;
    this.score = 0;
    this.levelTimer = 0;
    this.state = 'PLAYING';
    this.shake = 0;
  }
  
  // Bomb Effect State - REMOVED

  triggerUlt() {
    if (this.player.ultCount > 0 && this.player.ultActiveTimer <= 0) {
      this.player.ultCount--;
      this.shake = 10;
      this.soundManager.playUlt();
      
      switch(this.player.characterType) {
        case CharacterType.Green:
          this.player.invincibleTimer = 5; // 5s Invincible
          this.player.ultActiveTimer = 5;
          this.createExplosion(this.player.x, this.player.y, 20, '#00ff00');
          break;
          
        case CharacterType.Red:
          this.player.ultActiveTimer = 3;
          // Spawn massive homing missiles (Increased 5x from original 12 -> 60)
          for(let i=0; i<60; i++) {
              const angle = (i / 60) * Math.PI * 2;
              const b = new Bullet(this.player.x, this.player.y, Math.cos(angle)*5, Math.sin(angle)*5, 50, true, WeaponType.Missile, '#ff0000');
              b.homingTarget = this.boss || this.enemies[Math.floor(Math.random()*this.enemies.length)];
              this.bullets.push(b);
          }
          this.createExplosion(this.player.x, this.player.y, 20, '#ff0000');
          break;
          
        case CharacterType.Yellow:
          this.player.ultActiveTimer = 6;
          // Summon two giant wingmen
          this.player.wingmen = [
              new Wingman(this.player.x - 60, this.player.y, '#ffff00', { x: -60, y: 0 }),
              new Wingman(this.player.x + 60, this.player.y, '#ffff00', { x: 60, y: 0 })
          ];
          // Make them large
          this.player.wingmen.forEach(w => {
              w.width = 60;
              w.height = 60;
          });
          this.createExplosion(this.player.x, this.player.y, 20, '#ffff00');
          break;

        case CharacterType.Blue:
          this.player.ultActiveTimer = 3; // 3s Lightning
          this.shake = 20;
          this.createExplosion(this.player.x, this.player.y, 30, '#0000ff');
          break;
      }
    }
  }

  start() {
    this.lastTime = performance.now();
    this.loop();
  }

  loop = () => {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1); 
    this.lastTime = now;
    this.update(dt);
    this.draw();
    requestAnimationFrame(this.loop);
  };

  update(dt: number) {
    if (this.shake > 0) {
        this.shake -= dt * 60;
        if (this.shake < 0) this.shake = 0;
    }
    
    if (this.bossWarningTimer > 0) {
        this.bossWarningTimer -= dt;
    }

    if (this.state !== 'PLAYING') return;

    this.levelTimer += dt;
    this.player.update(dt);
    
    // Bomb Logic - REMOVED

    if (this.player.shootTimer <= 0) {
      this.firePlayerWeapon();
      this.player.shootTimer = this.player.shootInterval;
    }

    if (!this.boss && this.levelTimer < this.levelDuration) {
      this.enemySpawnTimer -= dt;
      if (this.enemySpawnTimer <= 0) {
        this.spawnEnemy();
        this.enemySpawnTimer = (1.2 - (this.level * 0.1)) / Math.sqrt(this.loopCount); // Faster spawn in loops
      }
    } else if (!this.boss && this.levelTimer >= this.levelDuration && this.enemies.length === 0) {
      this.spawnBoss();
    }

    [...this.bullets, ...this.particles].forEach(e => e.update(dt));
    this.items.forEach(e => e.update(dt, this.player));
    this.enemies.forEach(e => e.update(dt, this.player.x, this.player.y)); 
    if (this.boss) this.boss.update(dt);
    
    // Yellow Wingmen firing lasers
    if (this.player.characterType === CharacterType.Yellow && this.player.ultActiveTimer > 0) {
        this.player.wingmen.forEach(w => {
            if (w.shootTimer <= 0) {
                const b = new Bullet(w.x, w.y - 30, 0, -20, 40, true, WeaponType.Laser, '#ffff00');
                b.width = 15;
                this.bullets.push(b);
                w.shootTimer = 0.1;
            }
        });
    }

    // Blue Lightning Damage
    if (this.player.characterType === CharacterType.Blue && this.player.ultActiveTimer > 0) {
        const dmg = 2000 * dt; // Buffed DPS (was 500)
        this.enemies.forEach(e => {
            e.hp -= dmg;
            e.hitFlash = 2;
            if (Math.random() < 0.1) this.createExplosion(e.x, e.y, 1, '#00ffff');
            
            if (e.hp <= 0 && !e.markedForDeletion) {
                e.markedForDeletion = true;
                this.score += e.scoreValue;
                this.createExplosion(e.x, e.y, 10, e.color);
                this.soundManager.playExplosion('small');
                this.trySpawnItem(e.x, e.y);
                this.floatingTexts.push(new FloatingText(e.x, e.y, `+${e.scoreValue}`, '#ffff00', 16));
            }
        });
        if (this.boss) {
            this.boss.hp -= dmg;
            this.boss.hitFlash = 2;
            if (Math.random() < 0.1) this.createExplosion(this.boss.x, this.boss.y, 2, '#00ffff');
        }
        this.shake = Math.max(this.shake, 5);
    }

    this.stars.forEach(s => s.update(dt, 2 + this.loopCount)); // Speed increases with loop
    this.nebulae.forEach(n => n.update(dt));
    
    this.floatingTexts.forEach(t => t.update(dt));

    this.checkCollisions(dt);

    this.bullets = this.bullets.filter(e => !e.markedForDeletion);
    this.enemies = this.enemies.filter(e => !e.markedForDeletion);
    this.particles = this.particles.filter(e => !e.markedForDeletion);
    if (this.particles.length > MAX_PARTICLES) this.particles.splice(0, this.particles.length - MAX_PARTICLES);
    this.items = this.items.filter(e => !e.markedForDeletion);
    this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);
    
    if (this.boss && this.boss.hp <= 0) {
      this.shake = 40;
      this.createExplosion(this.boss.x, this.boss.y, 100, COLORS.boss);
      this.soundManager.playExplosion('large');
      this.score += 1000 * this.level * this.loopCount;
      this.boss = null;
      this.level++;
      this.levelTimer = 0;
      this.player.hp = Math.min(this.player.hp + 50, this.player.maxHp); 
      
      // Loop Logic
      if (this.level > 5) {
          if (this.loopCount < 10) {
              this.level = 1;
              this.loopCount++;
              // Show Loop Text?
          } else {
              this.state = 'VICTORY';
          }
      }
    }
    
    if (this.player.hp <= 0) {
      this.shake = 30;
      this.createExplosion(this.player.x, this.player.y, 50, COLORS.player);
      this.soundManager.playExplosion('large');
      this.state = 'GAMEOVER';
    }
    
    if (this.boss && this.boss.shootTimer <= 0) {
      this.bossFire();
      // 5x Fire Rate (was 2 - ... / loopCount) -> now much faster
      this.boss.shootTimer = Math.max(0.1, (0.4 - (this.level * 0.04)) / this.loopCount); 
    }
    
    this.enemies.forEach(e => {
        if (e.shootTimer <= 0) {
            this.enemyFire(e);
            e.shootTimer = Math.max(0.5, e.shootInterval / this.loopCount);
        }
    });
  }

  spawnEnemy() {
    const levelTypes = [
        [EnemyType.Drone, EnemyType.Scout, EnemyType.Heavy],
        [EnemyType.Drone, EnemyType.Sniper, EnemyType.Spinner, EnemyType.Dasher],
        [EnemyType.Splitter, EnemyType.Waver, EnemyType.Orbiter, EnemyType.Carrier],
        [EnemyType.LaserBot, EnemyType.MissileBoat, EnemyType.Shielder, EnemyType.Stealth],
        [EnemyType.Kamikaze, EnemyType.Bouncer, EnemyType.SpreadBot, EnemyType.Backstabber, EnemyType.Pulsar, EnemyType.Elite]
    ];
    
    const types = levelTypes[Math.min(this.level - 1, 4)];
    const type = types[Math.floor(Math.random() * types.length)];
    const x = Math.random() * (CANVAS_WIDTH - 60) + 30;
    const color = this.enemyColors[(this.loopCount - 1) % this.enemyColors.length];
    this.enemies.push(new Enemy(x, -50, type, this.level * this.loopCount, color));
  }

  spawnBoss() {
    const color = this.enemyColors[(this.loopCount - 1) % this.enemyColors.length];
    this.boss = new Boss(this.level * this.loopCount, color);
    this.shake = 20; 
    this.bossWarningTimer = 3.0; // 3 seconds warning
    this.soundManager.playWarning();
  }

  firePlayerWeapon() {
    this.soundManager.playShoot();
    const l = this.player.weaponLevel;
    const x = this.player.x;
    const y = this.player.y - 20;
    const dmg = 10 + (l * 2);
    
    switch (this.player.weaponType) {
      case WeaponType.Basic:
        // Level 1: 1 bullet
        this.bullets.push(new Bullet(x, y, 0, -12, dmg, true, WeaponType.Basic));
        // Level 2: Faster fire rate (handled in shootTimer, but here we can add side bullets for L2+)
        if (l >= 2) {
           this.bullets.push(new Bullet(x - 10, y + 5, 0, -12, dmg * 0.8, true, WeaponType.Basic));
           this.bullets.push(new Bullet(x + 10, y + 5, 0, -12, dmg * 0.8, true, WeaponType.Basic));
        }
        if (l >= 3) {
           // Wider spread
           this.bullets.push(new Bullet(x - 20, y + 10, -1, -12, dmg * 0.8, true, WeaponType.Basic));
           this.bullets.push(new Bullet(x + 20, y + 10, 1, -12, dmg * 0.8, true, WeaponType.Basic));
        }
        if (l >= 4) {
           // Even more bullets
           this.bullets.push(new Bullet(x - 30, y + 15, -2, -12, dmg * 0.8, true, WeaponType.Basic));
           this.bullets.push(new Bullet(x + 30, y + 15, 2, -12, dmg * 0.8, true, WeaponType.Basic));
        }
        if (l >= 5) {
           // Max power center stream
           this.bullets.push(new Bullet(x - 5, y, 0, -14, dmg, true, WeaponType.Basic));
           this.bullets.push(new Bullet(x + 5, y, 0, -14, dmg, true, WeaponType.Basic));
        }
        break;

      case WeaponType.Rapid:
        // High fire rate, low damage. Fire rate handled by shootTimer, here we just spawn bullets.
        this.bullets.push(new Bullet(x, y, (Math.random()-0.5)*2, -16, dmg * 0.5, true, WeaponType.Rapid, '#ffff00'));
        if (l >= 2) this.bullets.push(new Bullet(x-5, y, (Math.random()-0.5)*2, -16, dmg * 0.5, true, WeaponType.Rapid, '#ffff00'));
        if (l >= 3) this.bullets.push(new Bullet(x+5, y, (Math.random()-0.5)*2, -16, dmg * 0.5, true, WeaponType.Rapid, '#ffff00'));
        if (l >= 4) this.bullets.push(new Bullet(x-10, y+5, (Math.random()-0.5)*3, -15, dmg * 0.5, true, WeaponType.Rapid, '#ffff00'));
        if (l >= 5) this.bullets.push(new Bullet(x+10, y+5, (Math.random()-0.5)*3, -15, dmg * 0.5, true, WeaponType.Rapid, '#ffff00'));
        break;
        
      case WeaponType.Spread:
        // L1: 3, L2: 4, L3: 5, L4: 6, L5: 7
        const count = 2 + l; 
        for(let i=0; i<count; i++) {
            const angle = -Math.PI/2 + (i - (count-1)/2) * 0.15;
            this.bullets.push(new Bullet(x, y, Math.cos(angle)*12, Math.sin(angle)*12, dmg * 0.7, true, WeaponType.Spread, '#00ff00'));
        }
        break;
        
      case WeaponType.Laser:
        // L1: 1 Thin
        // L2: 1 Thick
        // L3: 2 Thin
        // L4: 2 Thick
        // L5: 3 Thick
        const width = (l % 2 === 0 || l === 5) ? 12 : 6; // Thicker on even levels and 5
        
        if (l < 3) {
            const b = new Bullet(x, y, 0, -20, dmg * 2, true, WeaponType.Laser, '#00ffff');
            b.width = width;
            this.bullets.push(b);
        } else if (l < 5) {
            const b1 = new Bullet(x-15, y, 0, -20, dmg * 2, true, WeaponType.Laser, '#00ffff');
            const b2 = new Bullet(x+15, y, 0, -20, dmg * 2, true, WeaponType.Laser, '#00ffff');
            b1.width = width; b2.width = width;
            this.bullets.push(b1, b2);
        } else {
            const b1 = new Bullet(x, y, 0, -20, dmg * 2, true, WeaponType.Laser, '#00ffff');
            const b2 = new Bullet(x-25, y+10, 0, -20, dmg * 2, true, WeaponType.Laser, '#00ffff');
            const b3 = new Bullet(x+25, y+10, 0, -20, dmg * 2, true, WeaponType.Laser, '#00ffff');
            b1.width = 12; b2.width = 12; b3.width = 12;
            this.bullets.push(b1, b2, b3);
        }
        break;
        
      case WeaponType.Missile:
        // L1: 1, L2: 2, L3: 3, L4: 4, L5: 5
        const b = new Bullet(x, y, 0, -8, dmg, true, WeaponType.Missile, '#ff00ff');
        b.homingTarget = this.boss || this.enemies[0];
        this.bullets.push(b);
        
        if (l >= 2) {
            const b2 = new Bullet(x-15, y+5, -4, -4, dmg, true, WeaponType.Missile, '#ff00ff');
            b2.homingTarget = this.boss || this.enemies[Math.floor(Math.random()*this.enemies.length)];
            this.bullets.push(b2);
        }
        if (l >= 3) {
            const b3 = new Bullet(x+15, y+5, 4, -4, dmg, true, WeaponType.Missile, '#ff00ff');
            b3.homingTarget = this.boss || this.enemies[Math.floor(Math.random()*this.enemies.length)];
            this.bullets.push(b3);
        }
        if (l >= 4) {
             const b4 = new Bullet(x-25, y+10, -6, -4, dmg, true, WeaponType.Missile, '#ff00ff');
             b4.homingTarget = this.boss || this.enemies[Math.floor(Math.random()*this.enemies.length)];
             this.bullets.push(b4);
        }
        if (l >= 5) {
             const b5 = new Bullet(x+25, y+10, 6, -4, dmg, true, WeaponType.Missile, '#ff00ff');
             b5.homingTarget = this.boss || this.enemies[Math.floor(Math.random()*this.enemies.length)];
             this.bullets.push(b5);
        }
        break;
        
      case WeaponType.Plasma: 
         // L1: 1, L2: 2, L3: 3, L4: 4, L5: 5
         this.bullets.push(new Bullet(x, y, (Math.random()-0.5)*2, -10, dmg * 1.5, true, WeaponType.Plasma, '#ff4400'));
         if (l >= 2) {
             this.bullets.push(new Bullet(x-15, y+5, (Math.random()-0.5)*3, -9, dmg * 1.5, true, WeaponType.Plasma, '#ff6600'));
         }
         if (l >= 3) {
             this.bullets.push(new Bullet(x+15, y+5, (Math.random()-0.5)*3, -9, dmg * 1.5, true, WeaponType.Plasma, '#ff6600'));
         }
         if (l >= 4) {
             this.bullets.push(new Bullet(x-30, y+10, (Math.random()-0.5)*4, -8, dmg * 1.5, true, WeaponType.Plasma, '#ff8800'));
         }
         if (l >= 5) {
             this.bullets.push(new Bullet(x+30, y+10, (Math.random()-0.5)*4, -8, dmg * 1.5, true, WeaponType.Plasma, '#ff8800'));
         }
         break;

      case WeaponType.Wave:
         this.bullets.push(new Bullet(x, y, 0, -8, dmg * 1.2, true, WeaponType.Wave, '#00ffaa'));
         if (l >= 2) this.bullets.push(new Bullet(x-20, y+10, 0, -8, dmg * 1.2, true, WeaponType.Wave, '#00ffaa'));
         if (l >= 3) this.bullets.push(new Bullet(x+20, y+10, 0, -8, dmg * 1.2, true, WeaponType.Wave, '#00ffaa'));
         if (l >= 4) this.bullets.push(new Bullet(x-40, y+20, 0, -8, dmg * 1.2, true, WeaponType.Wave, '#00ffaa'));
         if (l >= 5) this.bullets.push(new Bullet(x+40, y+20, 0, -8, dmg * 1.2, true, WeaponType.Wave, '#00ffaa'));
         break;

      case WeaponType.Blade:
         this.bullets.push(new Bullet(x, y, 0, -15, dmg * 3, true, WeaponType.Blade, '#ff00aa'));
         if (l >= 3) {
             this.bullets.push(new Bullet(x-20, y+10, -2, -14, dmg * 2, true, WeaponType.Blade, '#ff00aa'));
             this.bullets.push(new Bullet(x+20, y+10, 2, -14, dmg * 2, true, WeaponType.Blade, '#ff00aa'));
         }
         if (l >= 5) {
             this.bullets.push(new Bullet(x-40, y+20, -4, -13, dmg * 2, true, WeaponType.Blade, '#ff00aa'));
             this.bullets.push(new Bullet(x+40, y+20, 4, -13, dmg * 2, true, WeaponType.Blade, '#ff00aa'));
         }
         break;

      case WeaponType.Boomerang:
         this.bullets.push(new Bullet(x, y, -4, -15, dmg * 1.5, true, WeaponType.Boomerang, '#aaff00'));
         this.bullets.push(new Bullet(x, y, 4, -15, dmg * 1.5, true, WeaponType.Boomerang, '#aaff00'));
         if (l >= 3) {
             this.bullets.push(new Bullet(x, y, -8, -12, dmg * 1.5, true, WeaponType.Boomerang, '#aaff00'));
             this.bullets.push(new Bullet(x, y, 8, -12, dmg * 1.5, true, WeaponType.Boomerang, '#aaff00'));
         }
         if (l >= 5) {
             this.bullets.push(new Bullet(x, y, -12, -10, dmg * 1.5, true, WeaponType.Boomerang, '#aaff00'));
             this.bullets.push(new Bullet(x, y, 12, -10, dmg * 1.5, true, WeaponType.Boomerang, '#aaff00'));
         }
         break;

      case WeaponType.Sniper:
         this.bullets.push(new Bullet(x, y, 0, -30, dmg * 5, true, WeaponType.Sniper, '#ffffff'));
         if (l >= 2) this.bullets.push(new Bullet(x-10, y, 0, -30, dmg * 5, true, WeaponType.Sniper, '#ffffff'));
         if (l >= 3) this.bullets.push(new Bullet(x+10, y, 0, -30, dmg * 5, true, WeaponType.Sniper, '#ffffff'));
         if (l >= 4) this.bullets.push(new Bullet(x-20, y+10, 0, -30, dmg * 5, true, WeaponType.Sniper, '#ffffff'));
         if (l >= 5) this.bullets.push(new Bullet(x+20, y+10, 0, -30, dmg * 5, true, WeaponType.Sniper, '#ffffff'));
         break;
    }
  }
  
  bossFire() {
      if (!this.boss) return;
      this.soundManager.playEnemyShoot();
      const x = this.boss.x;
      const y = this.boss.y + this.boss.height/2;
      const visualLevel = (this.level - 1) % 5 + 1;
      
      if (visualLevel === 1) {
          for(let i=-2; i<=2; i++) {
              this.bullets.push(new Bullet(x, y, i*3, 6, 10, false, 'EnemyBasic', COLORS.enemyBullet));
          }
      } else if (visualLevel === 2) {
          const count = 12;
          for(let i=0; i<count; i++) {
              const angle = (i / count) * Math.PI * 2 + Date.now()/1000;
              this.bullets.push(new Bullet(x, y, Math.cos(angle)*6, Math.sin(angle)*6, 10, false, 'EnemyOrb', '#ff00ff'));
          }
      } else if (visualLevel === 3) {
          this.bullets.push(new Bullet(x, y, 0, 10, 20, false, 'EnemyLaser', '#ff0000'));
          for(let i=-1; i<=1; i+=2) this.bullets.push(new Bullet(x, y, i*5, 5, 10, false, 'EnemyBasic', COLORS.enemyBullet));
      } else {
           const count = 16;
          for(let i=0; i<count; i++) {
              const angle = (i / count) * Math.PI * 2 + Math.sin(Date.now()/500);
              this.bullets.push(new Bullet(x, y, Math.cos(angle)*7, Math.sin(angle)*7, 10, false, 'EnemyOrb', '#ffaa00'));
          }
      }
  }
  
  enemyFire(e: Enemy) {
      this.soundManager.playEnemyShoot();
      const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
      let type: 'EnemyBasic' | 'EnemyLaser' | 'EnemyOrb' = 'EnemyBasic';
      let speed = 5;
      let color = COLORS.enemyBullet;
      
      if (e.type === EnemyType.Sniper) { speed = 10; color = '#ff0000'; }
      if (e.type === EnemyType.LaserBot) { type = 'EnemyLaser'; speed = 8; color = '#ff00ff'; }
      if (e.type === EnemyType.Heavy) { type = 'EnemyOrb'; speed = 3; }
      
      this.bullets.push(new Bullet(e.x, e.y, Math.cos(angle)*speed, Math.sin(angle)*speed, 10, false, type, color));
      
      if (e.type === EnemyType.SpreadBot) {
          this.bullets.push(new Bullet(e.x, e.y, Math.cos(angle-0.3)*speed, Math.sin(angle-0.3)*speed, 10, false, type, color));
          this.bullets.push(new Bullet(e.x, e.y, Math.cos(angle+0.3)*speed, Math.sin(angle+0.3)*speed, 10, false, type, color));
      }
  }

  checkCollisions(dt: number) {
    // Bullet-Enemy and Bullet-Boss Collisions
    for (let i = 0; i < this.bullets.length; i++) {
        const b = this.bullets[i];
        if (b.markedForDeletion || !b.isPlayer) continue;

        for (let j = 0; j < this.enemies.length; j++) {
            const e = this.enemies[j];
            if (e.markedForDeletion) continue;

            if (this.rectIntersect(b, e)) {
                if (b.type !== 'UltLaser') b.markedForDeletion = true; // Ult laser pierces
                e.hp -= b.damage;
                e.hitFlash = 3; // Flash for 3 frames
                this.createExplosion(b.x, b.y, 2, b.color);
                
                // Map enemy type to note index
                let noteIndex = 0;
                switch(e.type) {
                    case EnemyType.Drone: noteIndex = 0; break;
                    case EnemyType.Scout: noteIndex = 2; break;
                    case EnemyType.Heavy: noteIndex = 4; break;
                    case EnemyType.Sniper: noteIndex = 5; break;
                    case EnemyType.Backstabber: noteIndex = 7; break;
                }
                this.soundManager.playHit(noteIndex);
                
                // Damage Text
                if (Math.random() < 0.3) { // Don't spam too much
                    this.floatingTexts.push(new FloatingText(e.x, e.y, `${Math.floor(b.damage)}`, '#fff', 10));
                }

                if (e.hp <= 0) {
                    e.markedForDeletion = true;
                    this.score += e.scoreValue;
                    this.shake = 5; // Increased shake
                    this.createExplosion(e.x, e.y, 10, e.color);
                    this.soundManager.playExplosion('small');
                    this.trySpawnItem(e.x, e.y);
                    this.floatingTexts.push(new FloatingText(e.x, e.y, `+${e.scoreValue}`, '#ffff00', 16));
                }
                if (b.markedForDeletion) break; // Move to next bullet if this one is gone
            }
        }
        
        if (!b.markedForDeletion && this.boss && this.rectIntersect(b, this.boss)) {
            if (b.type !== 'UltLaser') b.markedForDeletion = true;
            this.boss.hp -= b.damage;
            this.boss.hitFlash = 3;
            this.createExplosion(b.x, b.y, 3, b.color);
            this.soundManager.playHit(9); // High note for boss
        }
    }

    // Player-Bullet and Player-Enemy Collisions
    for (let i = 0; i < this.bullets.length; i++) {
        const b = this.bullets[i];
        if (b.markedForDeletion || b.isPlayer) continue;

        if (this.player.invincibleTimer <= 0) {
            if (this.rectIntersect(b, this.player)) {
                b.markedForDeletion = true;
                this.damagePlayer(10);
            }
        }
    }

    // Green Cyclone Ultimate Logic
    if (this.player.characterType === CharacterType.Green && this.player.ultActiveTimer > 0) {
        const cycloneRadius = 70;
        
        // Destroy bullets
        for (let i = 0; i < this.bullets.length; i++) {
            const b = this.bullets[i];
            if (!b.isPlayer && !b.markedForDeletion && this.dist(this.player.x, this.player.y, b.x, b.y) < cycloneRadius) {
                b.markedForDeletion = true;
                this.createExplosion(b.x, b.y, 2, '#00ff00');
            }
        }

        // Damage enemies in cyclone
        for (let i = 0; i < this.enemies.length; i++) {
            const e = this.enemies[i];
            if (e.markedForDeletion) continue;
            if (this.dist(this.player.x, this.player.y, e.x, e.y) < cycloneRadius + Math.max(e.width, e.height)/2) {
                e.hp -= 1000 * dt;
                e.hitFlash = 2;
                if (Math.random() < 0.2) this.createExplosion(e.x, e.y, 2, '#00ff00');
            }
        }

        // Damage boss in cyclone
        if (this.boss && this.dist(this.player.x, this.player.y, this.boss.x, this.boss.y) < cycloneRadius + this.boss.width/2) {
            this.boss.hp -= 1500 * dt;
            this.boss.hitFlash = 2;
            if (Math.random() < 0.2) this.createExplosion(this.player.x, this.player.y, 3, '#00ff00');
        }
    }

    for (let i = 0; i < this.enemies.length; i++) {
        const e = this.enemies[i];
        if (e.markedForDeletion) continue;

        if (this.rectIntersect(e, this.player)) {
            if (this.player.invincibleTimer <= 0) {
                e.markedForDeletion = true;
                this.createExplosion(e.x, e.y, 20, e.color);
                this.damagePlayer(20);
            }
        }
    }

    if (this.boss && this.rectIntersect(this.player, this.boss)) {
        if (this.player.invincibleTimer <= 0) {
            this.damagePlayer(1); // Continuous damage from boss contact
        }
    }

    // Yellow Wingmen blocking bullets
    if (this.player.characterType === CharacterType.Yellow && this.player.ultActiveTimer > 0) {
        for (let i = 0; i < this.bullets.length; i++) {
            const b = this.bullets[i];
            if (b.markedForDeletion || b.isPlayer) continue;
            
            for (let j = 0; j < this.player.wingmen.length; j++) {
                const w = this.player.wingmen[j];
                if (this.rectIntersect(b, w)) {
                    b.markedForDeletion = true;
                    this.createExplosion(b.x, b.y, 2, w.color);
                }
            }
        }

        for (let i = 0; i < this.enemies.length; i++) {
            const e = this.enemies[i];
            if (e.markedForDeletion) continue;

            for (let j = 0; j < this.player.wingmen.length; j++) {
                const w = this.player.wingmen[j];
                if (this.rectIntersect(e, w)) {
                    e.hp -= 20;
                    e.hitFlash = 3;
                    if (Math.random() < 0.1) this.createExplosion(e.x, e.y, 2, w.color);
                }
            }
        }
    }
    
    this.items.forEach(i => {
        if (this.dist(i.x, i.y, this.player.x, this.player.y) < 40) {
            i.markedForDeletion = true;
            this.collectItem(i);
        }
    });
  }
  
  damagePlayer(amount: number) {
      if (this.player.shield > 0) {
          this.player.shield--;
          this.shake = 5;
          this.soundManager.playHit(0); // Low note for shield
          return;
      }
      this.player.hp -= amount;
      this.shake = 15;
      this.soundManager.playHit(0); // Low note for damage
  }
  
  collectItem(item: Item) {
      this.soundManager.playPowerup();
      switch(item.type) {
          case ItemType.PowerUp:
              // Only upgrade if same weapon type, or generic powerup
              // For simplicity, we assume 'P' is generic upgrade
              this.player.weaponLevel = Math.min(this.player.weaponLevel + 1, 5);
              this.score += 100;
              this.floatingTexts.push(new FloatingText(this.player.x, this.player.y, "火力提升！", COLORS.powerup, 20));
              break;
          case ItemType.Shield:
              this.player.shield = Math.min(this.player.shield + 1, 3);
              this.floatingTexts.push(new FloatingText(this.player.x, this.player.y, "护盾！", COLORS.shield, 20));
              break;
          case ItemType.Bomb:
              this.player.ultCount = Math.min(this.player.ultCount + 1, 3);
              this.floatingTexts.push(new FloatingText(this.player.x, this.player.y, "大招充能！", COLORS.bomb, 20));
              break;
          case ItemType.Health:
              this.player.hp = Math.min(this.player.hp + 30, this.player.maxHp);
              this.floatingTexts.push(new FloatingText(this.player.x, this.player.y, "生命恢复！", '#ff69b4', 20));
              break;
          case ItemType.WeaponSwitch:
              if (item.weaponType) {
                  if (this.player.weaponType === item.weaponType) {
                      this.player.weaponLevel = Math.min(this.player.weaponLevel + 1, 5);
                      this.floatingTexts.push(new FloatingText(this.player.x, this.player.y, "武器升级！", '#ffa500', 20));
                  } else {
                      this.player.weaponType = item.weaponType;
                      // Do not reset weapon level
                      this.floatingTexts.push(new FloatingText(this.player.x, this.player.y, `已装备 ${WEAPON_NAMES[item.weaponType]}`, '#ffa500', 20));
                  }
              } else {
                  // Fallback for old behavior or generic switch
                  const currentIdx = WEAPONS.indexOf(this.player.weaponType);
                  const nextIdx = (currentIdx + 1) % WEAPONS.length;
                  this.player.weaponType = WEAPONS[nextIdx];
                  // Do not reset weapon level
              }
              break;
      }
  }
  
  trySpawnItem(x: number, y: number) {
      if (Math.random() < 0.3) { // Increased overall drop rate to 30%
          const rand = Math.random();
          if (rand < 0.55) { // 55% chance of the drop being a weapon (approx 16.5% overall, double the old 8%)
              // Spawn Weapon Item
              const wType = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
              this.items.push(new Item(x, y, ItemType.WeaponSwitch, wType));
          } else if (rand < 0.7) { // 15% chance for shield
              this.items.push(new Item(x, y, ItemType.Shield));
          } else if (rand < 0.8) { // 10% chance for bomb
              this.items.push(new Item(x, y, ItemType.Bomb));
          } else { // 20% chance for health
              this.items.push(new Item(x, y, ItemType.Health));
          }
      }
  }

  createExplosion(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color, Math.random() * 5, 0.5 + Math.random() * 0.5));
    }
  }

  rectIntersect(r1: {x: number, y: number, width: number, height: number}, r2: {x: number, y: number, width: number, height: number}) {
    return Math.abs(r1.x - r2.x) < (r1.width + r2.width) / 2 &&
           Math.abs(r1.y - r2.y) < (r1.height + r2.height) / 2;
  }
  
  dist(x1: number, y1: number, x2: number, y2: number) {
      return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
  }

  draw() {
    this.ctx.save();
    
    if (this.shake > 0) {
        const dx = (Math.random() - 0.5) * this.shake;
        const dy = (Math.random() - 0.5) * this.shake;
        this.ctx.translate(dx, dy);
    }

    // Background Color Shift based on Loop
    const bgColor = this.bgColors[(this.loopCount - 1) % this.bgColors.length];
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(-50, -50, CANVAS_WIDTH + 100, CANVAS_HEIGHT + 100);
    
    // Draw Background Elements (Parallax)
    this.nebulae.forEach(n => n.draw(this.ctx));
    this.stars.forEach(s => s.draw(this.ctx));

    // Grid - REMOVED

    if (this.state === 'START') {
        this.drawCenterText('霓虹战机', 40, -50, '#00ffff');
        this.drawCenterText('点击开始', 20, 20, '#fff');
        this.ctx.restore();
        return;
    }

    if (this.state === 'CHARACTER_SELECT') {
        this.drawCenterText('选择你的战机', 30, -250, '#fff');
        
        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2;
        const boxWidth = 140;
        const boxHeight = 160;
        const spacing = 30;

        const chars = [
            { type: CharacterType.Green, color: '#00ff00', name: '绿色', ult: '无敌 (5s)' },
            { type: CharacterType.Red, color: '#ff0000', name: '红色', ult: '导弹风暴' },
            { type: CharacterType.Yellow, color: '#ffff00', name: '黄色', ult: '护卫机群' },
            { type: CharacterType.Blue, color: '#0000ff', name: '蓝色', ult: '全屏闪电' }
        ];

        const positions = [
            { x: centerX - boxWidth - spacing/2, y: centerY - boxHeight - spacing/2 },
            { x: centerX + spacing/2, y: centerY - boxHeight - spacing/2 },
            { x: centerX - boxWidth - spacing/2, y: centerY + spacing/2 },
            { x: centerX + spacing/2, y: centerY + spacing/2 }
        ];

        chars.forEach((c, i) => {
            const x = positions[i].x + boxWidth/2;
            const y = positions[i].y + boxHeight/2;
            
            // Box
            this.ctx.strokeStyle = c.color;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(positions[i].x, positions[i].y, boxWidth, boxHeight);
            
            // Ship Preview
            this.ctx.save();
            this.ctx.translate(x, y - 20);
            drawPlaneShape(this.ctx, c.type, c.color, false);
            this.ctx.restore();

            // Text
            this.ctx.fillStyle = c.color;
            this.ctx.font = 'bold 16px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(c.name, x, y + 30);
            this.ctx.font = '10px monospace';
            this.ctx.fillStyle = '#aaa';
            this.ctx.fillText(c.ult, x, y + 50);
        });

        this.ctx.restore();
        return;
    }
    
    if (this.state === 'GAMEOVER') {
        this.drawCenterText('系统崩溃', 40, -50, '#ff0000');
        this.drawCenterText(`分数: ${this.score}`, 20, 0, '#fff');
        this.drawCenterText('点击重启', 20, 50, '#fff');
        this.ctx.restore();
        return;
    }
    
    if (this.state === 'VICTORY') {
        this.drawCenterText('星系安全', 40, -50, '#00ff00');
        this.drawCenterText(`最终分数: ${this.score}`, 20, 0, '#fff');
        this.drawCenterText('点击重玩', 20, 80, '#fff');
        this.ctx.restore();
        return;
    }

    this.bullets.forEach(b => b.draw(this.ctx));
    this.particles.forEach(p => p.draw(this.ctx));
    this.items.forEach(i => i.draw(this.ctx));
    this.enemies.forEach(e => e.draw(this.ctx));
    // Boss Warning / Entrance Effect
    if (this.boss && this.bossWarningTimer > 0) {
        this.ctx.save();
        this.ctx.fillStyle = `rgba(255, 0, 0, ${0.2 + Math.sin(Date.now() / 100) * 0.1})`;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        this.ctx.font = 'bold 40px monospace';
        this.ctx.fillStyle = '#ff0000';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("警告", CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
        this.ctx.font = 'bold 20px monospace';
        this.ctx.fillText("BOSS 接近中", CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 40);
        this.ctx.restore();
    }

    if (this.boss) this.boss.draw(this.ctx);
    this.player.draw(this.ctx);

    // Blue Lightning Visual
    if (this.player.characterType === CharacterType.Blue && this.player.ultActiveTimer > 0) {
        this.ctx.save();
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            let curX = Math.random() * CANVAS_WIDTH;
            let curY = 0;
            this.ctx.moveTo(curX, curY);
            while (curY < CANVAS_HEIGHT) {
                curX += (Math.random() - 0.5) * 100;
                curY += Math.random() * 50;
                this.ctx.lineTo(curX, curY);
            }
            this.ctx.stroke();
        }
        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.ctx.restore();
    }
    
    this.floatingTexts.forEach(t => t.draw(this.ctx));

    this.ctx.restore(); 
    this.drawUI();
  }
  
  drawUI() {
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 16px monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`分数: ${this.score}`, 10, 25);
      this.ctx.fillText(`关卡: ${this.level}-${this.loopCount}`, 10, 45);
      
      // Weapon Name above HP bar
      drawWeaponIcon(this.ctx, this.player.weaponType, 16, CANVAS_HEIGHT - 34, 12, '#ffa500');
      this.ctx.fillStyle = '#ffa500';
      this.ctx.font = 'bold 12px monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${WEAPON_NAMES[this.player.weaponType]} V${this.player.weaponLevel}`, 28, CANVAS_HEIGHT - 30);

      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(10, CANVAS_HEIGHT - 25, 120, 15);
      this.ctx.fillStyle = COLORS.player;
      this.ctx.fillRect(10, CANVAS_HEIGHT - 25, 120 * (this.player.hp / this.player.maxHp), 15);
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(10, CANVAS_HEIGHT - 25, 120, 15);
      this.ctx.fillStyle = '#000';
      this.ctx.font = '10px monospace';
      this.ctx.fillText('装甲值', 15, CANVAS_HEIGHT - 14);
      
      // Ult Button (Bottom Right)
      const btnX = CANVAS_WIDTH - 50;
      const btnY = CANVAS_HEIGHT - 50;
      this.ctx.fillStyle = this.player.ultCount > 0 ? 'rgba(255, 0, 0, 0.5)' : 'rgba(50, 0, 0, 0.5)';
      this.ctx.beginPath();
      this.ctx.arc(btnX, btnY, 35, 0, Math.PI*2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 14px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('大招', btnX, btnY - 5);
      this.ctx.fillText(`${this.player.ultCount}/3`, btnX, btnY + 15);
  }
  
  drawCenterText(text: string, size: number, yOffset: number, color: string) {
      this.ctx.fillStyle = color;
      this.ctx.font = `bold ${size}px monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + yOffset);
  }
}
