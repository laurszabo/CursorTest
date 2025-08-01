// CogniRogue - 8-bit Roguelike Game
// A Cognizant Developer vs Programming Bugs

class CogniRogue {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false; // Pixel perfect rendering
        
        this.gameState = 'title'; // title, playing, levelup, gameover
        this.gameTime = 0;
        this.lastTime = 0;
        
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        this.bugs = [];
        this.projectiles = [];
        this.xpOrbs = [];
        
        this.keys = {};
        this.setupEventListeners();
        
        // Game constants
        this.BUG_SPAWN_RATE = 60; // frames between spawns
        this.MAX_BUGS = 50;
        this.spawnCounter = 0;
        
        this.gameLoop = this.gameLoop.bind(this);
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            // WASD and Arrow key support
            if (e.key === 'ArrowUp' || e.key === 'w') this.keys['up'] = true;
            if (e.key === 'ArrowDown' || e.key === 's') this.keys['down'] = true;
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys['left'] = true;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys['right'] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            if (e.key === 'ArrowUp' || e.key === 'w') this.keys['up'] = false;
            if (e.key === 'ArrowDown' || e.key === 's') this.keys['down'] = false;
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys['left'] = false;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys['right'] = false;
        });
    }
    
    start() {
        this.gameState = 'playing';
        document.getElementById('titleScreen').style.display = 'none';
        document.getElementById('gameCanvas').style.display = 'block';
        document.getElementById('gameUI').style.display = 'block';
        
        this.updateUI();
        requestAnimationFrame(this.gameLoop);
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.gameState === 'playing') {
            this.update(deltaTime);
            this.render();
            this.gameTime += deltaTime;
            this.updateGameTime();
        }
        
        requestAnimationFrame(this.gameLoop);
    }
    
    update(deltaTime) {
        // Update player
        this.player.update(this.keys, this.canvas.width, this.canvas.height);
        
        // Spawn bugs
        this.spawnCounter++;
        if (this.spawnCounter >= this.BUG_SPAWN_RATE && this.bugs.length < this.MAX_BUGS) {
            this.spawnBug();
            this.spawnCounter = 0;
        }
        
        // Update bugs
        this.bugs.forEach(bug => bug.update(this.player.x, this.player.y));
        
        // Update projectiles
        this.projectiles.forEach(projectile => projectile.update());
        
        // Update XP orbs
        this.xpOrbs.forEach(orb => orb.update(this.player.x, this.player.y));
        
        // Auto-attack system
        this.player.attack(this.bugs, this.projectiles);
        
        // Collision detection
        this.checkCollisions();
        
        // Clean up dead entities
        this.cleanup();
        
        // Check game over
        if (this.player.hp <= 0) {
            this.gameOver();
        }
    }
    
    render() {
        // Clear canvas with starfield background
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw starfield
        this.drawStarfield();
        
        // Draw XP orbs
        this.xpOrbs.forEach(orb => orb.render(this.ctx));
        
        // Draw player
        this.player.render(this.ctx);
        
        // Draw bugs
        this.bugs.forEach(bug => bug.render(this.ctx));
        
        // Draw projectiles
        this.projectiles.forEach(projectile => projectile.render(this.ctx));
        
        // Draw grid overlay for retro feel
        this.drawGrid();
    }
    
    drawStarfield() {
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = (i * 234 + this.gameTime * 0.01) % this.canvas.width;
            const y = (i * 123 + this.gameTime * 0.005) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    spawnBug() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0: // Top
                x = Math.random() * this.canvas.width;
                y = -20;
                break;
            case 1: // Right
                x = this.canvas.width + 20;
                y = Math.random() * this.canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * this.canvas.width;
                y = this.canvas.height + 20;
                break;
            case 3: // Left
                x = -20;
                y = Math.random() * this.canvas.height;
                break;
        }
        
        const bugTypes = ['SyntaxError', 'NullPointer', 'LogicBug', 'MemoryLeak'];
        const bugType = bugTypes[Math.floor(Math.random() * bugTypes.length)];
        
        this.bugs.push(new Bug(x, y, bugType));
    }
    
    checkCollisions() {
        // Projectile vs Bug collisions
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            for (let j = this.bugs.length - 1; j >= 0; j--) {
                const bug = this.bugs[j];
                
                if (this.circleCollision(projectile, bug)) {
                    // Damage bug
                    bug.takeDamage(projectile.damage);
                    
                    // Remove projectile
                    this.projectiles.splice(i, 1);
                    
                    // If bug dies, create XP orb and update stats
                    if (bug.hp <= 0) {
                        this.xpOrbs.push(new XPOrb(bug.x, bug.y, bug.xpValue));
                        this.bugs.splice(j, 1);
                        this.player.bugsKilled++;
                        this.updateUI();
                    }
                    break;
                }
            }
        }
        
        // Player vs Bug collisions
        this.bugs.forEach(bug => {
            if (this.circleCollision(this.player, bug)) {
                // Damage player
                if (bug.lastDamageTime + 1000 < Date.now()) { // 1 second damage cooldown
                    this.player.takeDamage(bug.damage);
                    bug.lastDamageTime = Date.now();
                    this.updateUI();
                }
            }
        });
        
        // Player vs XP Orb collisions
        for (let i = this.xpOrbs.length - 1; i >= 0; i--) {
            const orb = this.xpOrbs[i];
            
            if (this.circleCollision(this.player, orb)) {
                this.player.gainXP(orb.value);
                this.xpOrbs.splice(i, 1);
                this.updateUI();
                
                // Check for level up
                if (this.player.xp >= this.player.xpToNext) {
                    this.levelUp();
                }
            }
        }
    }
    
    circleCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (obj1.radius + obj2.radius);
    }
    
    cleanup() {
        // Remove dead projectiles
        this.projectiles = this.projectiles.filter(p => !p.isDead);
        
        // Remove old XP orbs
        this.xpOrbs = this.xpOrbs.filter(orb => orb.lifeTime > 0);
    }
    
    levelUp() {
        this.gameState = 'levelup';
        this.player.levelUp();
        this.showLevelUpScreen();
        this.updateUI();
    }
    
    showLevelUpScreen() {
        const screen = document.getElementById('levelUpScreen');
        const options = document.getElementById('upgradeOptions');
        
        options.innerHTML = '';
        
        const upgrades = [
            {
                title: 'Increased Debug Speed',
                description: 'Attack speed +20%',
                effect: () => this.player.attackSpeed *= 1.2
            },
            {
                title: 'Better Error Handling',
                description: 'Max HP +20, Full heal',
                effect: () => {
                    this.player.maxHp += 20;
                    this.player.hp = this.player.maxHp;
                }
            },
            {
                title: 'Code Optimization',
                description: 'Movement speed +15%',
                effect: () => this.player.speed *= 1.15
            },
            {
                title: 'Enhanced Debugging',
                description: 'Damage +25%',
                effect: () => this.player.damage *= 1.25
            }
        ];
        
        // Show 3 random upgrades
        const shuffled = upgrades.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        
        selected.forEach(upgrade => {
            const option = document.createElement('div');
            option.className = 'upgrade-option';
            option.innerHTML = `
                <div class="upgrade-title">${upgrade.title}</div>
                <div class="upgrade-description">${upgrade.description}</div>
            `;
            option.onclick = () => {
                upgrade.effect();
                this.gameState = 'playing';
                screen.style.display = 'none';
            };
            options.appendChild(option);
        });
        
        screen.style.display = 'block';
    }
    
    gameOver() {
        this.gameState = 'gameover';
        
        document.getElementById('finalLevel').textContent = this.player.level;
        document.getElementById('finalBugs').textContent = this.player.bugsKilled;
        document.getElementById('finalTime').textContent = this.formatTime(this.gameTime);
        
        document.getElementById('gameOverScreen').style.display = 'block';
    }
    
    updateUI() {
        document.getElementById('playerLevel').textContent = this.player.level;
        document.getElementById('playerXP').textContent = Math.floor(this.player.xp);
        document.getElementById('xpToNext').textContent = this.player.xpToNext;
        document.getElementById('playerHP').textContent = Math.floor(this.player.hp);
        document.getElementById('maxHP').textContent = this.player.maxHp;
        document.getElementById('bugsKilled').textContent = this.player.bugsKilled;
    }
    
    updateGameTime() {
        document.getElementById('gameTime').textContent = this.formatTime(this.gameTime);
    }
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Player Class - The Cognizant Developer
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.speed = 3;
        this.hp = 100;
        this.maxHp = 100;
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 100;
        this.bugsKilled = 0;
        
        // Combat stats
        this.damage = 25;
        this.attackSpeed = 1.0; // attacks per second
        this.lastAttackTime = 0;
        this.attackRange = 150;
    }
    
    update(keys, canvasWidth, canvasHeight) {
        // Movement
        let dx = 0, dy = 0;
        
        if (keys['up']) dy -= 1;
        if (keys['down']) dy += 1;
        if (keys['left']) dx -= 1;
        if (keys['right']) dx += 1;
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
        
        this.x += dx * this.speed;
        this.y += dy * this.speed;
        
        // Keep player on screen
        this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y));
    }
    
    attack(bugs, projectiles) {
        const now = Date.now();
        if (now - this.lastAttackTime < (1000 / this.attackSpeed)) return;
        
        // Find closest bug within range
        let closestBug = null;
        let closestDistance = this.attackRange;
        
        bugs.forEach(bug => {
            const dx = bug.x - this.x;
            const dy = bug.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < closestDistance) {
                closestBug = bug;
                closestDistance = distance;
            }
        });
        
        if (closestBug) {
            // Create projectile towards closest bug
            const angle = Math.atan2(closestBug.y - this.y, closestBug.x - this.x);
            projectiles.push(new Projectile(this.x, this.y, angle, this.damage));
            this.lastAttackTime = now;
        }
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
    }
    
    gainXP(amount) {
        this.xp += amount;
    }
    
    levelUp() {
        this.level++;
        this.xp -= this.xpToNext;
        this.xpToNext = Math.floor(this.xpToNext * 1.2);
    }
    
    render(ctx) {
        // Developer character (8-bit style)
        ctx.save();
        
        // Body (lab coat)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - 8, this.y - 5, 16, 20);
        
        // Head
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(this.x - 6, this.y - 15, 12, 12);
        
        // Hair
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(this.x - 6, this.y - 15, 12, 4);
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x - 4, this.y - 11, 2, 2);
        ctx.fillRect(this.x + 2, this.y - 11, 2, 2);
        
        // Glasses (developer stereotype!)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - 5, this.y - 12, 4, 4);
        ctx.strokeRect(this.x + 1, this.y - 12, 4, 4);
        ctx.beginPath();
        ctx.moveTo(this.x - 1, this.y - 10);
        ctx.lineTo(this.x + 1, this.y - 10);
        ctx.stroke();
        
        // Laptop (because every developer has one)
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x - 4, this.y + 5, 8, 6);
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x - 3, this.y + 6, 6, 4);
        
        // Health bar
        const barWidth = 30;
        const barHeight = 4;
        const healthPercent = this.hp / this.maxHp;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - barWidth/2, this.y - 25, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - barWidth/2, this.y - 25, barWidth * healthPercent, barHeight);
        
        ctx.restore();
    }
}

// Bug Classes - The Programming Enemies
class Bug {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 12;
        this.lastDamageTime = 0;
        
        // Set stats based on bug type
        switch(type) {
            case 'SyntaxError':
                this.hp = 30;
                this.speed = 1.5;
                this.damage = 15;
                this.color = '#ff4444';
                this.xpValue = 10;
                break;
            case 'NullPointer':
                this.hp = 50;
                this.speed = 1.0;
                this.damage = 25;
                this.color = '#4444ff';
                this.xpValue = 20;
                break;
            case 'LogicBug':
                this.hp = 40;
                this.speed = 2.0;
                this.damage = 20;
                this.color = '#ff44ff';
                this.xpValue = 15;
                break;
            case 'MemoryLeak':
                this.hp = 80;
                this.speed = 0.8;
                this.damage = 30;
                this.color = '#ffff44';
                this.xpValue = 35;
                break;
        }
        this.maxHp = this.hp;
    }
    
    update(playerX, playerY) {
        // Move towards player
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }
    
    takeDamage(amount) {
        this.hp -= amount;
    }
    
    render(ctx) {
        ctx.save();
        
        // Bug body (8-bit insect style)
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 8, this.y - 6, 16, 12);
        
        // Bug segments
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 6, this.y - 4, 12, 8);
        ctx.fillRect(this.x - 4, this.y - 2, 8, 4);
        
        // Bug legs
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const legY = this.y - 4 + i * 4;
            ctx.beginPath();
            ctx.moveTo(this.x - 8, legY);
            ctx.lineTo(this.x - 12, legY - 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + 8, legY);
            ctx.lineTo(this.x + 12, legY - 2);
            ctx.stroke();
        }
        
        // Bug eyes
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - 6, this.y - 4, 2, 2);
        ctx.fillRect(this.x + 4, this.y - 4, 2, 2);
        
        // Type label
        ctx.fillStyle = '#ffffff';
        ctx.font = '6px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.type.slice(0, 6), this.x, this.y + 18);
        
        // Health bar
        if (this.hp < this.maxHp) {
            const barWidth = 20;
            const barHeight = 2;
            const healthPercent = this.hp / this.maxHp;
            
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x - barWidth/2, this.y - 15, barWidth, barHeight);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x - barWidth/2, this.y - 15, barWidth * healthPercent, barHeight);
        }
        
        ctx.restore();
    }
}

// Projectile Class - Debug Commands
class Projectile {
    constructor(x, y, angle, damage) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 8;
        this.damage = damage;
        this.radius = 3;
        this.isDead = false;
        this.lifeTime = 120; // frames
    }
    
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.lifeTime--;
        
        if (this.lifeTime <= 0) {
            this.isDead = true;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 5;
        
        // Debug projectile (looks like a small code snippet)
        ctx.fillRect(this.x - 3, this.y - 1, 6, 2);
        ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
        
        ctx.restore();
    }
}

// XP Orb Class
class XPOrb {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.radius = 4;
        this.lifeTime = 600; // frames
        this.magnetDistance = 80;
        this.speed = 3;
    }
    
    update(playerX, playerY) {
        // Magnetic attraction to player
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.magnetDistance) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
        
        this.lifeTime--;
    }
    
    render(ctx) {
        ctx.save();
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 3;
        
        // XP orb (glowing yellow)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Initialize game
let game;

function startGame() {
    game = new CogniRogue();
    game.start();
}

// Start game when page loads (for title screen)
window.addEventListener('load', () => {
    // Initialize canvas context for title screen
    game = new CogniRogue();
});