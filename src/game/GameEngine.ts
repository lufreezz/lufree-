import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, WeaponType, WEAPONS, ItemType, EnemyType } from './constants';
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
  update(dt: number): void;
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
    ctx.shadowBlur = 5;
    ctx.shadowColor = this.color;
    ctx.fillRect(this.x, this.y, this.width * 2, this.height * 2);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

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
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 2;
        ctx.fillText(this.text, this.x, this.y);
        ctx.shadowBlur = 0;
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
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
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

  constructor(x: number, y: number, vx: number, vy: number, damage: number, isPlayer: boolean, type: WeaponType | 'EnemyBasic' | 'EnemyLaser' | 'EnemyOrb' | 'UltLaser' = WeaponType.Blaster, color: string = COLORS.playerBullet) {
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
    } else {
      this.width = 8;
      this.height = 8;
    }
  }

  update(dt: number) {
    if (this.type === WeaponType.Homing && this.homingTarget && !this.homingTarget.markedForDeletion) {
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
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
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
    } else if (this.type === WeaponType.Laser || this.type === 'EnemyLaser') {
       ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    } else if (this.type === 'UltLaser') {
       ctx.fillRect(this.x - this.width/2, 0, this.width, CANVAS_HEIGHT); // Full screen height
    } else if (this.type === WeaponType.Homing) {
       ctx.save();
       ctx.translate(this.x, this.y);
       ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI/2);
       ctx.beginPath();
       ctx.moveTo(0, -5);
       ctx.lineTo(-3, 5);
       ctx.lineTo(3, 5);
       ctx.fill();
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
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const r = 15;
        const px = this.x + Math.cos(angle) * r;
        const py = this.y + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.x, this.y);
    ctx.shadowBlur = 0;
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
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
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

  constructor(level: number, colorShift: string) {
    this.id = Math.random();
    this.level = level;
    this.x = CANVAS_WIDTH / 2;
    this.y = -150; 
    this.hp = 5000 * level; // 5x HP (was 1000)
    this.maxHp = this.hp;
    if (colorShift) this.color = colorShift;
  }

  update(dt: number) {
    // Boss Entrance & Movement Logic
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
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4;
    ctx.fillStyle = '#220000';
    
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
    ctx.shadowBlur = 0;

    // HP Bar
    ctx.fillStyle = '#330000';
    ctx.fillRect(10, 10, CANVAS_WIDTH - 20, 15);
    ctx.fillStyle = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0000';
    ctx.fillRect(10, 10, (CANVAS_WIDTH - 20) * (this.hp / this.maxHp), 15);
    ctx.shadowBlur = 0;
    
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`警告: BOSS LEVEL ${this.level}`, CANVAS_WIDTH/2, 22);
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
  
  hp: number = 100;
  maxHp: number = 100;
  weaponLevel: number = 1;
  weaponType: WeaponType = WeaponType.Blaster;
  shield: number = 0;
  ultCount: number = 3; // Max 3
  
  shootTimer: number = 0;
  shootInterval: number = 0.12;
  
  invincibleTimer: number = 0;
  ultActiveTimer: number = 0;

  update(dt: number) {
    this.x = Math.max(this.width/2, Math.min(CANVAS_WIDTH - this.width/2, this.x));
    this.y = Math.max(this.height/2, Math.min(CANVAS_HEIGHT - this.height/2, this.y));
    this.shootTimer -= dt;
    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
    if (this.ultActiveTimer > 0) this.ultActiveTimer -= dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Invincible Blink
    if (this.invincibleTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }

    // Shield
    if (this.shield > 0) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = COLORS.shield;
      ctx.strokeStyle = COLORS.shield;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Ship - Advanced Neon Fighter
    ctx.shadowBlur = 15;
    
    // Change color to Yellow if Invincible (Ult Active)
    const shipColor = this.invincibleTimer > 0 ? '#ffff00' : this.color;
    
    ctx.shadowColor = shipColor;
    ctx.strokeStyle = shipColor;
    ctx.lineWidth = 2;
    ctx.fillStyle = this.invincibleTimer > 0 ? '#333300' : '#001111';
    
    ctx.beginPath();
    // Main Body
    ctx.moveTo(0, -30);
    ctx.lineTo(-10, -10);
    ctx.lineTo(-10, 10);
    ctx.lineTo(0, 20);
    ctx.lineTo(10, 10);
    ctx.lineTo(10, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Wings
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-30, 20);
    ctx.lineTo(-10, 15);
    ctx.moveTo(10, 0);
    ctx.lineTo(30, 20);
    ctx.lineTo(10, 15);
    ctx.stroke();
    
    // Engine glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(-5, 20);
    ctx.lineTo(5, 20);
    ctx.lineTo(0, 35 + Math.random() * 15);
    ctx.fill();

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
  
  soundManager: SoundManager;

  level: number = 1;
  loopCount: number = 1;
  score: number = 0;
  state: 'START' | 'PLAYING' | 'GAMEOVER' | 'VICTORY' = 'START';
  
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
        if (this.state !== 'PLAYING') {
            if (this.handleClick()) {
                startDrag(x, y);
            }
            this.soundManager.resume(); // Ensure audio context is resumed on user interaction
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
       if (this.state === 'START' || this.state === 'GAMEOVER' || this.state === 'VICTORY') {
         this.resetGame();
         return true;
       }
       return false;
  }
  
  resetGame() {
    this.player = new Player();
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
    if (this.player.ultCount > 0 && this.player.invincibleTimer <= 0) {
      this.player.ultCount--;
      this.player.invincibleTimer = 3; // 3s Invincible
      this.shake = 5;
      this.createExplosion(this.player.x, this.player.y, 10, '#00ffff'); // Blue explosion for shield
      this.soundManager.playUlt();
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
    
    this.stars.forEach(s => s.update(dt, 2 + this.loopCount)); // Speed increases with loop
    this.floatingTexts.forEach(t => t.update(dt));

    this.checkCollisions();

    this.bullets = this.bullets.filter(e => !e.markedForDeletion);
    this.enemies = this.enemies.filter(e => !e.markedForDeletion);
    this.particles = this.particles.filter(e => !e.markedForDeletion);
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
      case WeaponType.Blaster:
        // Level 1: 1 bullet
        this.bullets.push(new Bullet(x, y, 0, -12, dmg, true, WeaponType.Blaster));
        // Level 2: Faster fire rate (handled in shootTimer, but here we can add side bullets for L2+)
        if (l >= 2) {
           this.bullets.push(new Bullet(x - 10, y + 5, 0, -12, dmg * 0.8, true, WeaponType.Blaster));
           this.bullets.push(new Bullet(x + 10, y + 5, 0, -12, dmg * 0.8, true, WeaponType.Blaster));
        }
        if (l >= 3) {
           // Wider spread
           this.bullets.push(new Bullet(x - 20, y + 10, -1, -12, dmg * 0.8, true, WeaponType.Blaster));
           this.bullets.push(new Bullet(x + 20, y + 10, 1, -12, dmg * 0.8, true, WeaponType.Blaster));
        }
        if (l >= 4) {
           // Even more bullets
           this.bullets.push(new Bullet(x - 30, y + 15, -2, -12, dmg * 0.8, true, WeaponType.Blaster));
           this.bullets.push(new Bullet(x + 30, y + 15, 2, -12, dmg * 0.8, true, WeaponType.Blaster));
        }
        if (l >= 5) {
           // Max power center stream
           this.bullets.push(new Bullet(x - 5, y, 0, -14, dmg, true, WeaponType.Blaster));
           this.bullets.push(new Bullet(x + 5, y, 0, -14, dmg, true, WeaponType.Blaster));
        }
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
        
      case WeaponType.Homing:
        // L1: 1, L2: 2, L3: 3, L4: 4, L5: 5
        const b = new Bullet(x, y, 0, -8, dmg, true, WeaponType.Homing, '#ff00ff');
        b.homingTarget = this.boss || this.enemies[0];
        this.bullets.push(b);
        
        if (l >= 2) {
            const b2 = new Bullet(x-15, y+5, -4, -4, dmg, true, WeaponType.Homing, '#ff00ff');
            b2.homingTarget = this.boss || this.enemies[Math.floor(Math.random()*this.enemies.length)];
            this.bullets.push(b2);
        }
        if (l >= 3) {
            const b3 = new Bullet(x+15, y+5, 4, -4, dmg, true, WeaponType.Homing, '#ff00ff');
            b3.homingTarget = this.boss || this.enemies[Math.floor(Math.random()*this.enemies.length)];
            this.bullets.push(b3);
        }
        if (l >= 4) {
             const b4 = new Bullet(x-25, y+10, -6, -4, dmg, true, WeaponType.Homing, '#ff00ff');
             b4.homingTarget = this.boss || this.enemies[Math.floor(Math.random()*this.enemies.length)];
             this.bullets.push(b4);
        }
        if (l >= 5) {
             const b5 = new Bullet(x+25, y+10, 6, -4, dmg, true, WeaponType.Homing, '#ff00ff');
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

  checkCollisions() {
    this.bullets.filter(b => b.isPlayer).forEach(b => {
      this.enemies.forEach(e => {
        if (this.rectIntersect(b, e)) {
          if (b.type !== 'UltLaser') b.markedForDeletion = true; // Ult laser pierces
          e.hp -= b.damage;
          e.hitFlash = 3; // Flash for 3 frames
          this.createExplosion(b.x, b.y, 2, b.color);
          
          // Map enemy type to note index
          let noteIndex = 0;
          switch(e.type) {
              case EnemyType.Basic: noteIndex = 0; break;
              case EnemyType.Fast: noteIndex = 2; break;
              case EnemyType.Tank: noteIndex = 4; break;
              case EnemyType.Shooter: noteIndex = 5; break;
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
        }
      });
      
      if (this.boss && this.rectIntersect(b, this.boss)) {
          if (b.type !== 'UltLaser') b.markedForDeletion = true;
          this.boss.hp -= b.damage;
          this.createExplosion(b.x, b.y, 3, b.color);
          this.soundManager.playHit(9); // High note for boss
      }
    });

    if (this.player.invincibleTimer <= 0) {
        this.bullets.filter(b => !b.isPlayer).forEach(b => {
          if (this.rectIntersect(b, this.player)) {
            b.markedForDeletion = true;
            this.damagePlayer(10);
          }
        });
        
        this.enemies.forEach(e => {
            if (this.rectIntersect(e, this.player)) {
                e.markedForDeletion = true;
                this.createExplosion(e.x, e.y, 20, e.color);
                this.damagePlayer(20);
            }
        });
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
              this.floatingTexts.push(new FloatingText(this.player.x, this.player.y, "POWER UP!", COLORS.powerup, 20));
              break;
          case ItemType.Shield:
              this.player.shield = Math.min(this.player.shield + 1, 3);
              this.floatingTexts.push(new FloatingText(this.player.x, this.player.y, "SHIELD", COLORS.shield, 20));
              break;
          case ItemType.Bomb:
              this.player.ultCount = Math.min(this.player.ultCount + 1, 3);
              this.floatingTexts.push(new FloatingText(this.player.x, this.player.y, "ULT CHARGE", COLORS.bomb, 20));
              break;
          case ItemType.Health:
              this.player.hp = Math.min(this.player.hp + 30, this.player.maxHp);
              this.floatingTexts.push(new FloatingText(this.player.x, this.player.y, "HP UP", '#ff69b4', 20));
              break;
          case ItemType.WeaponSwitch:
              // If picking up same weapon type, upgrade level. Else switch and reset level.
              // We need to know what weapon the item contains.
              // For now, let's assume WeaponSwitch cycles types.
              // To implement "pick up same to upgrade", we need items to have specific weapon types.
              // Let's modify: WeaponSwitch items now cycle through specific types.
              
              if (item.weaponType) {
                  if (this.player.weaponType === item.weaponType) {
                      this.player.weaponLevel = Math.min(this.player.weaponLevel + 1, 5);
                      this.floatingTexts.push(new FloatingText(this.player.x, this.player.y, "WEAPON UP!", '#ffa500', 20));
                  } else {
                      this.player.weaponType = item.weaponType;
                      this.player.weaponLevel = 1; // Reset level on switch
                      this.floatingTexts.push(new FloatingText(this.player.x, this.player.y, `${item.weaponType} EQUIPPED`, '#ffa500', 20));
                  }
              } else {
                  // Fallback for old behavior or generic switch
                  const currentIdx = WEAPONS.indexOf(this.player.weaponType);
                  const nextIdx = (currentIdx + 1) % WEAPONS.length;
                  this.player.weaponType = WEAPONS[nextIdx];
                  this.player.weaponLevel = 1;
              }
              break;
      }
  }
  
  trySpawnItem(x: number, y: number) {
      if (Math.random() < 0.2) { 
          const rand = Math.random();
          if (rand < 0.4) {
              // Spawn Weapon Item
              const wType = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
              this.items.push(new Item(x, y, ItemType.WeaponSwitch, wType));
          } else if (rand < 0.6) {
              this.items.push(new Item(x, y, ItemType.Shield));
          } else if (rand < 0.7) {
              this.items.push(new Item(x, y, ItemType.Bomb));
          } else {
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
    
    // Draw Stars
    this.stars.forEach(s => s.draw(this.ctx));

    // Grid
    this.ctx.strokeStyle = COLORS.grid;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    const time = Date.now() / 50;
    const offsetY = time % 40;
    for (let x = 0; x <= CANVAS_WIDTH; x += 40) {
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, CANVAS_HEIGHT);
    }
    for (let y = offsetY; y <= CANVAS_HEIGHT; y += 40) {
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(CANVAS_WIDTH, y);
    }
    this.ctx.stroke();

    if (this.state === 'START') {
        this.drawCenterText('NEON DEFENDER', 40, -50, '#00ffff');
        this.drawCenterText('拖动控制移动', 20, 20, '#fff');
        this.drawCenterText('点击开始游戏', 20, 60, '#fff');
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
        this.ctx.shadowColor = '#ff0000';
        this.ctx.shadowBlur = 20;
        this.ctx.fillText("WARNING", CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
        this.ctx.font = 'bold 20px monospace';
        this.ctx.fillText("BOSS APPROACHING", CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 40);
        this.ctx.restore();
    }

    if (this.boss) this.boss.draw(this.ctx);
    this.player.draw(this.ctx);
    
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
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 14px monospace';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`${this.player.weaponType} V${this.player.weaponLevel}`, CANVAS_WIDTH - 10, CANVAS_HEIGHT - 15);
  }
  
  drawCenterText(text: string, size: number, yOffset: number, color: string) {
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = color;
      this.ctx.fillStyle = color;
      this.ctx.font = `bold ${size}px monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + yOffset);
      this.ctx.shadowBlur = 0;
  }
}
