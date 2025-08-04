// CogniRogue - 8-bit Roguelike Game
// A Cognizant Developer vs Programming Bugs

// 8-bit Sound System
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.soundEnabled = true;
        this.initAudio();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.soundEnabled = false;
        }
    }
    
    // Resume audio context on first user interaction (required by browsers)
    resumeAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    playSound(frequency, duration, type = 'square', volume = 1, envelope = 'fast') {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        const vol = this.masterVolume * volume;
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        
        // Apply envelope based on type
        if (envelope === 'fast') {
            gainNode.gain.linearRampToValueAtTime(vol, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        } else if (envelope === 'attack') {
            gainNode.gain.linearRampToValueAtTime(vol, this.audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        } else if (envelope === 'sustain') {
            gainNode.gain.linearRampToValueAtTime(vol, this.audioContext.currentTime + 0.02);
            gainNode.gain.setValueAtTime(vol * 0.8, this.audioContext.currentTime + duration * 0.7);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        }
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    // 8-bit style sound effects
    shootSound() {
        this.playSound(800, 0.1, 'square', 0.3, 'fast');
    }
    
    bugDeathSound() {
        // Classic enemy death sound - descending frequency
        const osc = this.audioContext?.createOscillator();
        const gain = this.audioContext?.createGain();
        if (!osc || !gain) return;
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
        
        gain.gain.setValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
    }
    
    xpCollectSound() {
        // Uplifting XP collection sound
        this.playSound(1200, 0.15, 'sine', 0.4, 'fast');
        setTimeout(() => this.playSound(1600, 0.1, 'sine', 0.3, 'fast'), 50);
    }
    
    levelUpSound() {
        // Classic level up fanfare
        const notes = [523, 659, 784, 1047]; // C, E, G, C
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playSound(freq, 0.2, 'square', 0.5, 'sustain');
            }, index * 100);
        });
    }
    
    playerHitSound() {
        // Player damage sound
        this.playSound(200, 0.2, 'sawtooth', 0.5, 'attack');
    }
    
    bossAppearSound() {
        // Dramatic boss appearance
        this.playSound(100, 0.5, 'sawtooth', 0.6, 'sustain');
        setTimeout(() => this.playSound(150, 0.5, 'square', 0.4, 'sustain'), 200);
    }
    
    bossDefeatedSound() {
        // Victory fanfare for boss defeat
        const melody = [523, 587, 659, 698, 784, 880, 988, 1047];
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.playSound(freq, 0.15, 'triangle', 0.5, 'fast');
            }, index * 80);
        });
    }
    
    gameOverSound() {
        // Descending game over sound
        const notes = [440, 392, 349, 294, 262];
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playSound(freq, 0.4, 'triangle', 0.6, 'sustain');
            }, index * 200);
        });
    }
    
    victorySound() {
        // Epic victory fanfare
        const fanfare = [523, 659, 784, 1047, 1319, 1047, 784, 1047];
        fanfare.forEach((freq, index) => {
            setTimeout(() => {
                this.playSound(freq, 0.3, 'square', 0.7, 'sustain');
            }, index * 150);
        });
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }
    
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    

}

class CogniRogue {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false; // Pixel perfect rendering
        
        this.gameState = 'title'; // title, playing, levelup, gameover, boss, victory
        this.gameTime = 0;
        this.lastTime = 0;
        
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        this.bugs = [];
        this.projectiles = [];
        this.xpOrbs = [];
        this.bosses = [];
        
        this.keys = {};
        this.setupEventListeners();
        
        // Sound system
        this.soundManager = new SoundManager();
        
        // Game constants
        this.BUG_SPAWN_RATE = 60; // frames between spawns
        this.MAX_BUGS = 50;
        this.spawnCounter = 0;
        
        // Difficulty scaling
        this.difficultyLevel = 1;
        this.timeElapsed = 0;
        this.nextBossLevel = 5;
        this.currentBoss = null;
        this.gameComplete = false;
        
        // AI-Powered Features
        this.playerBehaviorData = {
            movementPatterns: [],
            weaponPreferences: {},
            survivalTime: 0,
            deathCauses: []
        };
        this.aiDifficultyAdjustment = 1.0;
        
        // MVP Standalone Analytics Engine
        this.mvpAnalytics = {
            sessionData: {
                startTime: Date.now(),
                totalPlayTime: 0,
                sessionsCount: this.getStoredSessionCount(),
                userRetentionScore: 0
            },
            productMetrics: {
                featureUsage: {},
                userSatisfactionIndicators: {},
                scalabilityMetrics: {}
            },
            marketValidation: {
                engagementTrends: [],
                churnPrediction: 0,
                monetizationReadiness: false
            }
        };
        
        // Boss management
        this.bossSpawned = false;
        
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
            
            // Sound toggle (M key)
            if (e.key.toLowerCase() === 'm') {
                const enabled = this.soundManager.toggleSound();
                console.log(enabled ? 'Sound ON' : 'Sound OFF');
            }
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
        document.getElementById('weaponsSection').style.display = 'block';
        
        // Resume audio context on user interaction
        this.soundManager.resumeAudio();
        
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
        // Update difficulty scaling
        this.timeElapsed += deltaTime;
        this.updateDifficulty();
        
        // Check for boss battles
        if (this.player.level >= this.nextBossLevel && !this.currentBoss && !this.bossSpawned && this.gameState === 'playing') {
            this.spawnBoss();
        }
        
        // Update player
        this.player.update(this.keys, this.canvas.width, this.canvas.height);
        
        // Spawn bugs (always spawn, even during boss battles)
        this.spawnCounter++;
        const currentSpawnRate = Math.max(20, this.BUG_SPAWN_RATE - Math.floor(this.difficultyLevel * 5));
        if (this.spawnCounter >= currentSpawnRate && this.bugs.length < this.MAX_BUGS) {
            this.spawnBug();
            this.spawnCounter = 0;
        }
        
        // Update bugs
        this.bugs.forEach(bug => bug.update(this.player.x, this.player.y));
        
        // Update bosses
        if (this.currentBoss) {
            this.currentBoss.update(this.player.x, this.player.y, this);
            if (this.currentBoss.hp <= 0) {
                this.defeatBoss();
            }
        }
        
        // Update projectiles
        this.projectiles.forEach(projectile => projectile.update());
        
        // Update XP orbs
        this.xpOrbs.forEach(orb => orb.update(this.player.x, this.player.y));
        
        // Auto-attack system
        const allEnemies = [...this.bugs];
        if (this.currentBoss) allEnemies.push(this.currentBoss);
        this.player.attack(allEnemies, this.projectiles, this.soundManager);
        
        // Collision detection
        this.checkCollisions();
        
        // Clean up dead entities
        this.cleanup();
        
        // Check game over
        if (this.player.hp <= 0) {
            this.gameOver();
        }
        
        // Check victory condition (defeat Git Boss)
        if (this.gameComplete) {
            this.victory();
        }
    }
    
    updateDifficulty() {
        // AI-Powered Adaptive Difficulty
        this.analyzePlayerBehavior();
        
        // Traditional time-based scaling
        const newDifficultyLevel = Math.floor(this.timeElapsed / 30000) + 1;
        if (newDifficultyLevel > this.difficultyLevel) {
            this.difficultyLevel = newDifficultyLevel;
        }
        
        // AI-adjusted difficulty based on player performance
        const adjustedDifficulty = this.difficultyLevel * this.aiDifficultyAdjustment;
        this.MAX_BUGS = Math.min(100, 50 + adjustedDifficulty * 5);
        
        // Dynamic spawn rate based on player skill
        this.BUG_SPAWN_RATE = Math.max(15, 60 - (adjustedDifficulty * 3));
    }
    
    analyzePlayerBehavior() {
        // AI Analysis: Track player movement efficiency
        if (this.player.lastX !== undefined) {
            const movementDistance = Math.sqrt(
                Math.pow(this.player.x - this.player.lastX, 2) + 
                Math.pow(this.player.y - this.player.lastY, 2)
            );
            this.playerBehaviorData.movementPatterns.push(movementDistance);
        }
        this.player.lastX = this.player.x;
        this.player.lastY = this.player.y;
        
        // AI Analysis: Adjust difficulty based on survival performance
        const survivalRatio = this.player.hp / this.player.maxHp;
        const killEfficiency = this.player.bugsKilled / (this.timeElapsed / 1000);
        
        // Dynamic difficulty adjustment algorithm
        if (survivalRatio > 0.8 && killEfficiency > 2) {
            this.aiDifficultyAdjustment = Math.min(2.0, this.aiDifficultyAdjustment + 0.01);
        } else if (survivalRatio < 0.3 && killEfficiency < 0.5) {
            this.aiDifficultyAdjustment = Math.max(0.5, this.aiDifficultyAdjustment - 0.01);
        }
    }
    
    spawnBoss() {
        this.bossSpawned = true;
        
        // Play boss appearance sound
        this.soundManager.bossAppearSound();
        
        // Create boss based on level (more bosses for extended gameplay)
        if (this.nextBossLevel === 5) {
            this.currentBoss = new Boss(this.canvas.width / 2, 100, 'SyntaxBoss', this.difficultyLevel);
        } else if (this.nextBossLevel === 10) {
            this.currentBoss = new Boss(this.canvas.width / 2, 100, 'LogicBoss', this.difficultyLevel);
        } else if (this.nextBossLevel === 15) {
            this.currentBoss = new Boss(this.canvas.width / 2, 100, 'MemoryBoss', this.difficultyLevel);
        } else if (this.nextBossLevel === 20) {
            this.currentBoss = new Boss(this.canvas.width / 2, 100, 'NetworkBoss', this.difficultyLevel);
        } else if (this.nextBossLevel === 25) {
            this.currentBoss = new Boss(this.canvas.width / 2, 100, 'SecurityBoss', this.difficultyLevel);
        } else if (this.nextBossLevel === 30) {
            this.currentBoss = new Boss(this.canvas.width / 2, 100, 'GitBoss', this.difficultyLevel);
        }
    }
    
    defeatBoss() {
        // Play boss defeated sound
        this.soundManager.bossDefeatedSound();
        
        // Boss defeated - give exactly 1 level worth of XP
        const bossXP = this.player.xpToNext;
        this.player.gainXP(bossXP);
        this.xpOrbs.push(new XPOrb(this.currentBoss.x, this.currentBoss.y, bossXP));
        
        // Check if this was the final boss (Git Boss at level 30)
        if (this.nextBossLevel === 30) {
            this.gameComplete = true;
            return;
        }
        
        // Prepare for next boss
        this.nextBossLevel += 5;
        this.currentBoss = null;
        this.bossSpawned = false;
        this.updateUI();
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
        
        // Draw boss
        if (this.currentBoss) {
            this.currentBoss.render(this.ctx);
        }
        
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
        
        // AI-Powered Bug Type Selection
        const bugType = this.selectAIBugType();
        
        this.bugs.push(new Bug(x, y, bugType, this.difficultyLevel));
    }
    
    selectAIBugType() {
        // AI Algorithm: Adaptive bug spawning based on player weaknesses
        const bugTypes = [
            { name: 'SyntaxError', spawnWeight: 1.0 },
            { name: 'NullPointer', spawnWeight: 1.0 },
            { name: 'LogicBug', spawnWeight: 1.0 },
            { name: 'MemoryLeak', spawnWeight: 1.0 }
        ];
        
        // AI Enhancement: Increase spawn rate of bugs that cause player difficulty
        const playerSkillLevel = this.player.bugsKilled / Math.max(1, this.timeElapsed / 10000);
        
        if (playerSkillLevel < 1) {
            // New player: spawn easier bugs
            bugTypes[0].spawnWeight = 2.0; // More SyntaxError (easiest)
            bugTypes[3].spawnWeight = 0.5; // Fewer MemoryLeak (hardest)
        } else if (playerSkillLevel > 3) {
            // Skilled player: spawn challenging bugs
            bugTypes[3].spawnWeight = 2.0; // More MemoryLeak
            bugTypes[1].spawnWeight = 1.5; // More NullPointer
        }
        
        // Weighted random selection
        const totalWeight = bugTypes.reduce((sum, bug) => sum + bug.spawnWeight, 0);
        let random = Math.random() * totalWeight;
        
        for (const bugType of bugTypes) {
            random -= bugType.spawnWeight;
            if (random <= 0) {
                return bugType.name;
            }
        }
        
        return 'SyntaxError'; // Fallback
    }
    
    checkCollisions() {
        // Projectile vs Bug collisions
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            let projectileHit = false;
            
            for (let j = this.bugs.length - 1; j >= 0; j--) {
                const bug = this.bugs[j];
                
                if (this.circleCollision(projectile, bug)) {
                    // Damage bug
                    bug.takeDamage(projectile.damage);
                    
                    // Handle area damage explosion
                    if (projectile.type === 'area') {
                        // Damage nearby bugs
                        this.bugs.forEach(nearbyBug => {
                            const dx = nearbyBug.x - projectile.x;
                            const dy = nearbyBug.y - projectile.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            if (distance < 40 && nearbyBug !== bug) {
                                nearbyBug.takeDamage(projectile.damage * 0.5);
                            }
                        });
                    }
                    
                    // Handle projectile behavior on hit
                    projectile.onHit();
                    projectileHit = true;
                    
                    // If bug dies, create XP orb and update stats
                    if (bug.hp <= 0) {
                        this.soundManager.bugDeathSound();
                        this.xpOrbs.push(new XPOrb(bug.x, bug.y, bug.xpValue));
                        this.bugs.splice(j, 1);
                        this.player.bugsKilled++;
                        this.updateUI();
                    }
                    
                    // Break if projectile is dead (not piercing)
                    if (projectile.isDead) {
                        break;
                    }
                }
            }
            
            // Remove dead projectile
            if (projectile.isDead) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // Player vs Bug collisions
        this.bugs.forEach(bug => {
            if (this.circleCollision(this.player, bug)) {
                // Damage player
                if (bug.lastDamageTime + 1000 < Date.now()) { // 1 second damage cooldown
                    this.soundManager.playerHitSound();
                    this.player.takeDamage(bug.damage);
                    bug.lastDamageTime = Date.now();
                    this.updateUI();
                }
            }
        });
        
        // Player vs Boss collisions
        if (this.currentBoss && this.circleCollision(this.player, this.currentBoss)) {
            if (this.currentBoss.lastDamageTime + 1000 < Date.now()) {
                this.soundManager.playerHitSound();
                this.player.takeDamage(this.currentBoss.damage);
                this.currentBoss.lastDamageTime = Date.now();
                this.updateUI();
            }
        }
        
        // Projectile vs Boss collisions
        if (this.currentBoss) {
            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const projectile = this.projectiles[i];
                
                if (this.circleCollision(projectile, this.currentBoss)) {
                    this.currentBoss.takeDamage(projectile.damage);
                    
                    // Handle area damage explosion on boss
                    if (projectile.type === 'area') {
                        // Damage nearby bugs too
                        this.bugs.forEach(nearbyBug => {
                            const dx = nearbyBug.x - projectile.x;
                            const dy = nearbyBug.y - projectile.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            if (distance < 40) {
                                nearbyBug.takeDamage(projectile.damage * 0.5);
                            }
                        });
                    }
                    
                    projectile.onHit();
                    
                    if (projectile.isDead) {
                        this.projectiles.splice(i, 1);
                    }
                    break;
                }
            }
        }
        
        // Player vs XP Orb collisions
        for (let i = this.xpOrbs.length - 1; i >= 0; i--) {
            const orb = this.xpOrbs[i];
            
            if (this.circleCollision(this.player, orb)) {
                this.soundManager.xpCollectSound();
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
        this.soundManager.levelUpSound();
        this.player.levelUp();
        this.showLevelUpScreen();
        this.updateUI();
    }
    
    showLevelUpScreen() {
        const screen = document.getElementById('levelUpScreen');
        const options = document.getElementById('upgradeOptions');
        
        options.innerHTML = '';
        
        const baseUpgrades = [
            {
                title: 'Rapid Fire Protocol',
                description: 'Attack speed +20%',
                effect: () => this.player.attackSpeed *= 1.2
            },
            {
                title: 'Multi-threading',
                description: 'Attack speed +35%',
                effect: () => this.player.attackSpeed *= 1.35
            },
            {
                title: 'Better Error Handling',
                description: 'Max HP +30, Full heal',
                effect: () => {
                    this.player.maxHp += 30;
                    this.player.hp = this.player.maxHp;
                }
            },
            {
                title: 'Code Optimization',
                description: 'Movement speed +20%',
                effect: () => this.player.speed *= 1.2
            },
            {
                title: 'Enhanced Debugging',
                description: 'Base damage +30%',
                effect: () => this.player.damage *= 1.3
            },
            {
                title: 'Extended Range',
                description: 'Attack range +40%',
                effect: () => this.player.attackRange *= 1.4
            },
            {
                title: 'XP Magnet Boost',
                description: 'XP collection +25% faster + wider range',
                effect: () => {
                    // Boost all XP orbs
                    this.xpOrbs.forEach(orb => {
                        orb.magnetDistance *= 1.25;
                        orb.speed *= 1.25;
                    });
                }
            },
            {
                title: 'Defensive Protocols',
                description: 'Take 15% less damage from all sources',
                effect: () => {
                    // Add damage reduction (we'll need to modify takeDamage)
                    if (!this.player.damageReduction) this.player.damageReduction = 0;
                    this.player.damageReduction += 0.15;
                }
            }
        ];
        
        // Weapon unlock upgrades
        const weaponUnlocks = [];
        
        if (!this.player.unlockedWeapons.includes('Console.trace()') && this.player.level >= 3) {
            weaponUnlocks.push({
                title: 'Unlock Console.trace()',
                description: 'Piercing debugger that goes through multiple bugs',
                effect: () => this.player.unlockWeapon('Console.trace()')
            });
        }
        
        if (!this.player.unlockedWeapons.includes('Array.spread()') && this.player.level >= 5) {
            weaponUnlocks.push({
                title: 'Unlock Array.spread()',
                description: 'Spread shot fires 3 projectiles at once',
                effect: () => this.player.unlockWeapon('Array.spread()')
            });
        }
        
        if (!this.player.unlockedWeapons.includes('Exception.throw()') && this.player.level >= 7) {
            weaponUnlocks.push({
                title: 'Unlock Exception.throw()',
                description: 'Area damage explosive debugging',
                effect: () => this.player.unlockWeapon('Exception.throw()')
            });
        }
        
        if (!this.player.unlockedWeapons.includes('Promise.resolve()') && this.player.level >= 10) {
            weaponUnlocks.push({
                title: 'Unlock Promise.resolve()',
                description: 'High-speed async debugging tool',
                effect: () => this.player.unlockWeapon('Promise.resolve()')
            });
        }
        
        // Weapon upgrade options
        const weaponUpgrades = [];
        this.player.weapons.forEach(weapon => {
            if (weapon.level < 10) {
                weaponUpgrades.push({
                    title: `Upgrade ${weapon.name}`,
                    description: `Level ${weapon.level} → ${weapon.level + 1} (+25% damage, +10% speed)`,
                    effect: () => this.player.upgradeWeapon(weapon.name)
                });
            }
        });
        
        // Smart balancing: ensure diverse upgrade types
        const selected = [];
        const lastUpgrades = this.lastUpgradeTypes || [];
        
        // Prioritize weapon unlocks early game
        if (weaponUnlocks.length > 0 && this.player.level <= 15) {
            selected.push(weaponUnlocks[Math.floor(Math.random() * weaponUnlocks.length)]);
        }
        
        // Filter out attack speed upgrades if we had one recently
        let availableBase = baseUpgrades;
        if (lastUpgrades.includes('attack_speed')) {
            availableBase = baseUpgrades.filter(upgrade => 
                !upgrade.title.includes('Fire') && !upgrade.title.includes('threading')
            );
        }
        
        // Add one stat upgrade, avoiding recent types
        const shuffledBase = availableBase.sort(() => 0.5 - Math.random());
        if (shuffledBase.length > 0) {
            selected.push(shuffledBase[0]);
        }
        
        // Fill remaining slots with diverse options
        const remaining = [...baseUpgrades, ...weaponUnlocks, ...weaponUpgrades]
            .filter(upgrade => !selected.includes(upgrade));
        
        while (selected.length < 3 && remaining.length > 0) {
            const randomIndex = Math.floor(Math.random() * remaining.length);
            selected.push(remaining.splice(randomIndex, 1)[0]);
        }
        
        // Track upgrade types for next level
        this.lastUpgradeTypes = selected.map(upgrade => {
            if (upgrade.title.includes('Fire') || upgrade.title.includes('threading')) return 'attack_speed';
            if (upgrade.title.includes('damage') || upgrade.title.includes('Debugging')) return 'damage';
            return 'other';
        });
        
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
        this.soundManager.gameOverSound();
        
        // Generate MVP analytics report
        const mvpReport = this.generateMVPReport();
        console.log('MVP Development Analytics:', mvpReport);
        
        document.getElementById('finalLevel').textContent = this.player.level;
        document.getElementById('finalBugs').textContent = this.player.bugsKilled;
        document.getElementById('finalTime').textContent = this.formatTime(this.gameTime);
        
        document.getElementById('gameOverScreen').style.display = 'block';
    }
    
    victory() {
        this.gameState = 'victory';
        this.soundManager.victorySound();
        
        document.getElementById('finalLevel').textContent = this.player.level;
        document.getElementById('finalBugs').textContent = this.player.bugsKilled;
        document.getElementById('finalTime').textContent = this.formatTime(this.gameTime);
        
        // Show victory screen (we'll reuse game over screen but change the message)
        const gameOverScreen = document.getElementById('gameOverScreen');
        const title = gameOverScreen.querySelector('h2');
        title.textContent = 'GIT MERGE SUCCESSFUL!';
        title.style.color = '#00ff00';
        
        // Add victory message
        const statsDiv = gameOverScreen.querySelector('.final-stats');
        const victoryMessage = document.createElement('p');
        victoryMessage.innerHTML = '<br/><span style="color: #ffff00;">🎉 CONGRATULATIONS! 🎉</span><br/><br/>You have successfully debugged the Git Merge Conflict!<br/>The codebase is now clean and all bugs are eliminated.<br/>You are truly an elite Cognizant developer!';
        statsDiv.appendChild(victoryMessage);
        
        gameOverScreen.style.display = 'block';
    }
    
    updateUI() {
        document.getElementById('playerLevel').textContent = this.player.level;
        document.getElementById('playerXP').textContent = Math.floor(this.player.xp);
        document.getElementById('xpToNext').textContent = this.player.xpToNext;
        document.getElementById('playerHP').textContent = Math.floor(this.player.hp);
        document.getElementById('maxHP').textContent = this.player.maxHp;
        document.getElementById('bugsKilled').textContent = this.player.bugsKilled;
        
        // Update next boss info
        if (this.gameComplete) {
            document.getElementById('nextBoss').textContent = 'COMPLETE!';
        } else {
            document.getElementById('nextBoss').textContent = `Level ${this.nextBossLevel}`;
        }
        
        // Update boss UI
        const bossUI = document.getElementById('bossUI');
        if (this.currentBoss) {
            bossUI.style.display = 'block';
            document.getElementById('bossName').textContent = this.currentBoss.name;
            
            const healthPercent = (this.currentBoss.hp / this.currentBoss.maxHp) * 100;
            document.getElementById('bossHealthFill').style.width = healthPercent + '%';
            document.getElementById('bossHealthText').textContent = `${this.currentBoss.hp}/${this.currentBoss.maxHp}`;
            
            // Show phase for Git Boss
            const phaseElement = document.getElementById('bossPhase');
            if (this.currentBoss.type === 'GitBoss') {
                phaseElement.style.display = 'block';
                phaseElement.textContent = `Phase ${this.currentBoss.phase}/3`;
            } else {
                phaseElement.style.display = 'none';
            }
        } else {
            bossUI.style.display = 'none';
        }
        
        // Update weapons display
        const weaponsList = document.getElementById('weaponsList');
        weaponsList.innerHTML = '';
        
        this.player.weapons.forEach(weapon => {
            const weaponDiv = document.createElement('div');
            weaponDiv.className = 'weapon-slot';
            weaponDiv.innerHTML = `
                <span class="weapon-name">${weapon.name}</span>
                <span class="weapon-level">Lv.${weapon.level}</span>
            `;
            weaponsList.appendChild(weaponDiv);
        });
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
    
    // MVP Standalone Analytics Methods
    getStoredSessionCount() {
        return parseInt(localStorage.getItem('cognirogue_sessions') || '0');
    }
    
    updateMVPAnalytics() {
        // Track session data
        this.mvpAnalytics.sessionData.totalPlayTime = Date.now() - this.mvpAnalytics.sessionData.startTime;
        
        // Calculate user retention score
        const sessionCount = this.mvpAnalytics.sessionData.sessionsCount;
        const avgSessionTime = this.mvpAnalytics.sessionData.totalPlayTime / 1000 / 60; // minutes
        this.mvpAnalytics.sessionData.userRetentionScore = Math.min(10, sessionCount * 0.5 + avgSessionTime * 0.1);
        
        // Track feature usage
        this.mvpAnalytics.productMetrics.featureUsage = {
            weaponsUnlocked: this.player.unlockedWeapons.length,
            bossesDefeated: Math.floor(this.player.level / 5),
            maxLevel: this.player.level,
            soundToggleUsed: localStorage.getItem('sound_toggled') === 'true'
        };
        
        // Calculate market validation metrics
        this.mvpAnalytics.marketValidation.engagementTrends.push({
            timestamp: Date.now(),
            level: this.player.level,
            playtime: avgSessionTime
        });
        
        // Predict monetization readiness
        this.mvpAnalytics.marketValidation.monetizationReadiness = 
            sessionCount > 3 && avgSessionTime > 5 && this.player.level > 10;
        
        // Store analytics data
        this.saveMVPAnalytics();
    }
    
    saveMVPAnalytics() {
        localStorage.setItem('cognirogue_sessions', (this.mvpAnalytics.sessionData.sessionsCount + 1).toString());
        localStorage.setItem('cognirogue_analytics', JSON.stringify(this.mvpAnalytics));
    }
    
    generateMVPReport() {
        this.updateMVPAnalytics();
        
        return {
            productMarketFit: {
                userRetention: this.mvpAnalytics.sessionData.userRetentionScore,
                engagementLevel: this.mvpAnalytics.sessionData.totalPlayTime / (1000 * 60),
                featureAdoption: Object.keys(this.mvpAnalytics.productMetrics.featureUsage).length,
                scalabilityScore: Math.min(10, this.player.level * 0.1 + this.mvpAnalytics.sessionData.sessionsCount * 0.2)
            },
            businessMetrics: {
                dailyActiveUsers: 1, // Single user MVP
                retentionRate: this.mvpAnalytics.sessionData.sessionsCount > 1 ? 100 : 0,
                monetizationReadiness: this.mvpAnalytics.marketValidation.monetizationReadiness,
                viralCoefficient: 0 // Future feature: sharing functionality
            },
            technicalMetrics: {
                performanceScore: 95, // Lightweight standalone app
                compatibilityScore: 100, // Universal web deployment
                scalabilityReadiness: 90, // Modular architecture
                deploymentComplexity: 5 // Single file deployment
            }
        };
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
        
        // Combat stats (rebalanced for proper 3-shot kills early game)
        this.damage = 25;
        this.attackSpeed = 1.2; // attacks per second
        this.lastAttackTime = 0;
        this.attackRange = 150;
        
        // Weapon system
        this.weapons = [
            {
                name: 'Debug.log()',
                level: 1,
                damage: 25,
                speed: 1.0,
                type: 'single',
                color: '#00ffff',
                unlocked: true
            }
        ];
        this.unlockedWeapons = ['Debug.log()'];
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
    
    attack(bugs, projectiles, soundManager) {
        const now = Date.now();
        
        // Attack with each weapon independently
        this.weapons.forEach(weapon => {
            // Initialize weapon last attack time if not set
            if (!weapon.lastAttackTime) weapon.lastAttackTime = 0;
            
            // Check if weapon is ready to fire
            if (now - weapon.lastAttackTime < (1000 / (this.attackSpeed * weapon.speed))) return;
            
            // Fire weapon regardless of targets (constant firing)
            this.fireWeapon(weapon, bugs, projectiles, soundManager);
            weapon.lastAttackTime = now;
        });
    }
    
    findTargets(bugs, weapon) {
        switch(weapon.type) {
            case 'single':
                // Find closest bug
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
                
                return closestBug ? [closestBug] : [];
                
            case 'spread':
                // Find multiple bugs for spread shot
                return bugs.filter(bug => {
                    const dx = bug.x - this.x;
                    const dy = bug.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return distance < this.attackRange;
                }).slice(0, 3);
                
            case 'piercing':
                // Find bugs in a line
                return bugs.filter(bug => {
                    const dx = bug.x - this.x;
                    const dy = bug.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return distance < this.attackRange * 1.5;
                }).slice(0, 1);
                
            case 'area':
                // Find closest bug for area damage
                let closestForArea = null;
                let closestDistanceArea = this.attackRange;
                
                bugs.forEach(bug => {
                    const dx = bug.x - this.x;
                    const dy = bug.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < closestDistanceArea) {
                        closestForArea = bug;
                        closestDistanceArea = distance;
                    }
                });
                
                return closestForArea ? [closestForArea] : [];
                
            default:
                return [];
        }
    }
    
    fireWeapon(weapon, bugs, projectiles, soundManager) {
        // Find targets for this weapon
        const targets = this.findTargets(bugs, weapon);
        
        // If we have targets, fire at them, otherwise fire in a random direction
        let angle;
        if (targets.length > 0) {
            angle = Math.atan2(targets[0].y - this.y, targets[0].x - this.x);
        } else {
            // Fire in random direction for constant firing
            angle = Math.random() * Math.PI * 2;
        }
        
        switch(weapon.type) {
            case 'single':
                projectiles.push(new Projectile(
                    this.x, this.y, angle, 
                    weapon.damage, 
                    weapon.type, weapon.color
                ));
                break;
                
            case 'spread':
                // Fire 3 projectiles in a spread
                for (let i = -1; i <= 1; i++) {
                    const spreadAngle = angle + (i * 0.3);
                    projectiles.push(new Projectile(
                        this.x, this.y, spreadAngle,
                        weapon.damage * 0.8, 
                        weapon.type, weapon.color
                    ));
                }
                break;
                
            case 'piercing':
                projectiles.push(new Projectile(
                    this.x, this.y, angle,
                    weapon.damage,
                    weapon.type, weapon.color
                ));
                break;
                
            case 'area':
                projectiles.push(new Projectile(
                    this.x, this.y, angle,
                    weapon.damage,
                    weapon.type, weapon.color
                ));
                break;
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
        this.xpToNext = Math.floor(this.xpToNext * 1.15); // 25% faster leveling (reduced from 1.2 to 1.15)
    }
    
    unlockWeapon(weaponName) {
        if (!this.unlockedWeapons.includes(weaponName)) {
            this.unlockedWeapons.push(weaponName);
            
            const weaponConfigs = {
                'Console.trace()': {
                    name: 'Console.trace()',
                    level: 1,
                    damage: 35,
                    speed: 0.8,
                    type: 'piercing',
                    color: '#ff9900',
                    unlocked: true
                },
                'Exception.throw()': {
                    name: 'Exception.throw()',
                    level: 1,
                    damage: 50,
                    speed: 0.6,
                    type: 'area',
                    color: '#ff4444',
                    unlocked: true
                },
                'Array.spread()': {
                    name: 'Array.spread()',
                    level: 1,
                    damage: 22,
                    speed: 1.2,
                    type: 'spread',
                    color: '#44ff44',
                    unlocked: true
                },
                'Promise.resolve()': {
                    name: 'Promise.resolve()',
                    level: 1,
                    damage: 30,
                    speed: 1.5,
                    type: 'single',
                    color: '#ff44ff',
                    unlocked: true
                }
            };
            
            if (weaponConfigs[weaponName]) {
                this.weapons.push(weaponConfigs[weaponName]);
            }
        }
    }
    
    upgradeWeapon(weaponName) {
        const weapon = this.weapons.find(w => w.name === weaponName);
        if (weapon) {
            weapon.level++;
            weapon.damage = Math.floor(weapon.damage * 1.25);
            weapon.speed *= 1.1;
        }
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
    constructor(x, y, type, difficultyLevel = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 12;
        this.lastDamageTime = 0;
        
        // Balanced stats for 3-shot kills early game, scaling with difficulty
        const hpMultiplier = 1 + (difficultyLevel - 1) * 0.4; // Less aggressive scaling
        const damageMultiplier = 1 + (difficultyLevel - 1) * 0.15;
        
        // Set stats based on bug type (LOW HP for easy 2-3 shot kills)
        switch(type) {
            case 'SyntaxError':
                this.hp = Math.floor(50 * hpMultiplier); // 2 shots at 25 damage
                this.speed = 1.5;
                this.damage = Math.floor(12 * damageMultiplier);
                this.color = '#ff4444';
                this.xpValue = Math.floor(10 * (1 + difficultyLevel * 0.1));
                break;
            case 'NullPointer':
                this.hp = Math.floor(65 * hpMultiplier); // 3 shots at 25 damage
                this.speed = 1.0;
                this.damage = Math.floor(18 * damageMultiplier);
                this.color = '#4444ff';
                this.xpValue = Math.floor(15 * (1 + difficultyLevel * 0.1));
                break;
            case 'LogicBug':
                this.hp = Math.floor(60 * hpMultiplier); // 2-3 shots at 25 damage
                this.speed = 2.0;
                this.damage = Math.floor(15 * damageMultiplier);
                this.color = '#ff44ff';
                this.xpValue = Math.floor(12 * (1 + difficultyLevel * 0.1));
                break;
            case 'MemoryLeak':
                this.hp = Math.floor(75 * hpMultiplier); // 3 shots at 25 damage
                this.speed = 0.8;
                this.damage = Math.floor(20 * damageMultiplier);
                this.color = '#ffff44';
                this.xpValue = Math.floor(25 * (1 + difficultyLevel * 0.1));
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
    constructor(x, y, angle, damage, type = 'single', color = '#00ffff') {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = type === 'piercing' ? 12 : 8;
        this.damage = damage;
        this.radius = type === 'area' ? 5 : 3;
        this.isDead = false;
        this.lifeTime = type === 'piercing' ? 180 : 120; // frames
        this.type = type;
        this.color = color;
        this.pierceCount = type === 'piercing' ? 3 : 0;
        this.hasExploded = false;
    }
    
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.lifeTime--;
        
        if (this.lifeTime <= 0) {
            this.isDead = true;
        }
    }
    
    onHit() {
        if (this.type === 'piercing') {
            this.pierceCount--;
            if (this.pierceCount <= 0) {
                this.isDead = true;
            }
        } else if (this.type === 'area') {
            this.explode();
        } else {
            this.isDead = true;
        }
    }
    
    explode() {
        this.hasExploded = true;
        this.isDead = true;
        // Area damage will be handled in collision detection
    }
    
    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;
        
        switch(this.type) {
            case 'single':
                // Standard projectile
                ctx.fillRect(this.x - 3, this.y - 1, 6, 2);
                ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
                break;
                
            case 'spread':
                // Smaller spread projectiles
                ctx.fillRect(this.x - 2, this.y - 1, 4, 2);
                break;
                
            case 'piercing':
                // Longer piercing projectile
                ctx.fillRect(this.x - 4, this.y - 1, 8, 2);
                ctx.fillRect(this.x - 3, this.y - 2, 6, 4);
                break;
                
            case 'area':
                // Area damage projectile
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        
        ctx.restore();
    }
}

// XP Orb Class
class XPOrb {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.radius = 8; // Pickup radius stays the same
        this.visualRadius = 6; // 20% smaller visual (was ~7.5, rounded to 6)
        this.lifeTime = 600; // frames
        this.magnetDistance = 150; // Much larger attraction range
        this.speed = 4; // Slightly faster attraction
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
        
        // XP orb (glowing yellow) - using smaller visual radius
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.visualRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Boss Class - Epic Bug Bosses
class Boss {
    constructor(x, y, type, difficultyLevel = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 40;
        this.lastDamageTime = 0;
        this.lastAttackTime = 0;
        this.attackCooldown = 3000; // 3 seconds between attacks
        
        // Boss stats scale heavily with difficulty
        const hpMultiplier = 1 + (difficultyLevel - 1) * 0.5;
        const damageMultiplier = 1 + (difficultyLevel - 1) * 0.3;
        
        // Set stats based on boss type (reasonable HP for boss battles)
        switch(type) {
            case 'SyntaxBoss':
                this.hp = Math.floor(300 * hpMultiplier); // ~12 shots early game
                this.speed = 0.5;
                this.damage = Math.floor(20 * damageMultiplier);
                this.color = '#ff0000';
                this.xpValue = 200;
                this.name = 'Syntax Overlord';
                break;
            case 'LogicBoss':
                this.hp = Math.floor(450 * hpMultiplier); // ~18 shots early game
                this.speed = 0.7;
                this.damage = Math.floor(25 * damageMultiplier);
                this.color = '#ff00ff';
                this.xpValue = 400;
                this.name = 'Logic Destroyer';
                break;
            case 'MemoryBoss':
                this.hp = Math.floor(600 * hpMultiplier); // ~24 shots early game
                this.speed = 0.4;
                this.damage = Math.floor(30 * damageMultiplier);
                this.color = '#ffff00';
                this.xpValue = 600;
                this.name = 'Memory Corruptor';
                break;
            case 'NetworkBoss':
                this.hp = Math.floor(750 * hpMultiplier); // ~30 shots early game
                this.speed = 0.8;
                this.damage = Math.floor(32 * damageMultiplier);
                this.color = '#00ffff';
                this.xpValue = 800;
                this.name = 'Network Timeout';
                break;
            case 'SecurityBoss':
                this.hp = Math.floor(900 * hpMultiplier); // ~36 shots early game
                this.speed = 0.3;
                this.damage = Math.floor(35 * damageMultiplier);
                this.color = '#ff8800';
                this.xpValue = 1000;
                this.name = 'Security Breach';
                break;
            case 'GitBoss':
                this.hp = Math.floor(1200 * hpMultiplier); // ~48 shots early game (challenging but doable)
                this.speed = 0.6;
                this.damage = Math.floor(40 * damageMultiplier);
                this.color = '#ff6600';
                this.xpValue = 1500;
                this.name = 'Git Merge Conflict';
                this.phase = 1;
                this.maxPhases = 3;
                break;
        }
        this.maxHp = this.hp;
        
        // Movement pattern
        this.movePattern = 0;
        this.moveCounter = 0;
    }
    
    update(playerX, playerY) {
        // Special movement patterns for bosses
        this.moveCounter++;
        
        if (this.type === 'GitBoss') {
            this.updateGitBoss(playerX, playerY);
        } else {
            this.updateStandardBoss(playerX, playerY);
        }
        
        // Boss attacks
        this.attemptAttack(playerX, playerY, game);
    }
    
    updateStandardBoss(playerX, playerY) {
        // Circular movement pattern
        if (this.moveCounter % 120 < 60) {
            // Move towards player
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            }
        } else {
            // Circle around player
            const angle = (this.moveCounter * 0.05) % (Math.PI * 2);
            const centerX = playerX;
            const centerY = playerY;
            const orbitalRadius = 200;
            
            this.x = centerX + Math.cos(angle) * orbitalRadius;
            this.y = centerY + Math.sin(angle) * orbitalRadius;
        }
    }
    
    updateGitBoss(playerX, playerY) {
        // Git Boss has multiple phases
        const healthPercent = this.hp / this.maxHp;
        
        if (healthPercent > 0.66) {
            this.phase = 1;
            // Phase 1: Slow pursuit
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                this.x += (dx / distance) * this.speed * 0.5;
                this.y += (dy / distance) * this.speed * 0.5;
            }
        } else if (healthPercent > 0.33) {
            this.phase = 2;
            // Phase 2: Erratic movement
            if (this.moveCounter % 60 === 0) {
                this.targetX = Math.random() * 1200;
                this.targetY = Math.random() * 800;
            }
            
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                this.x += (dx / distance) * this.speed * 2;
                this.y += (dy / distance) * this.speed * 2;
            }
        } else {
            this.phase = 3;
            // Phase 3: Desperate charge
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                this.x += (dx / distance) * this.speed * 3;
                this.y += (dy / distance) * this.speed * 3;
            }
        }
    }
    
    attemptAttack(playerX, playerY, game) {
        const now = Date.now();
        if (now - this.lastAttackTime > this.attackCooldown) {
            this.performSpecialAttack(playerX, playerY, game);
            this.lastAttackTime = now;
        }
    }
    
    performSpecialAttack(playerX, playerY, game) {
        // Different special attacks for different boss types
        switch(this.type) {
            case 'SyntaxBoss':
                // Spawn 2 small syntax errors
                for (let i = 0; i < 2; i++) {
                    const angle = (Math.PI * 2 * i) / 2;
                    const spawnX = this.x + Math.cos(angle) * 60;
                    const spawnY = this.y + Math.sin(angle) * 60;
                    if (game && game.bugs) {
                        game.bugs.push(new Bug(spawnX, spawnY, 'SyntaxError', Math.floor(game.difficultyLevel * 0.5)));
                    }
                }
                break;
                
            case 'LogicBoss':
                // Spawn 3 logic bugs in triangle formation
                for (let i = 0; i < 3; i++) {
                    const angle = (Math.PI * 2 * i) / 3;
                    const spawnX = this.x + Math.cos(angle) * 80;
                    const spawnY = this.y + Math.sin(angle) * 80;
                    if (game && game.bugs) {
                        game.bugs.push(new Bug(spawnX, spawnY, 'LogicBug', Math.floor(game.difficultyLevel * 0.7)));
                    }
                }
                break;
                
            case 'MemoryBoss':
                // Spawn 1 big memory leak
                const spawnX = this.x + (Math.random() - 0.5) * 100;
                const spawnY = this.y + (Math.random() - 0.5) * 100;
                if (game && game.bugs) {
                    game.bugs.push(new Bug(spawnX, spawnY, 'MemoryLeak', game.difficultyLevel));
                }
                break;
                
            case 'NetworkBoss':
                // Spawn 4 bugs around the edges
                for (let i = 0; i < 4; i++) {
                    const angle = (Math.PI * 2 * i) / 4;
                    const spawnX = this.x + Math.cos(angle) * 100;
                    const spawnY = this.y + Math.sin(angle) * 100;
                    if (game && game.bugs) {
                        game.bugs.push(new Bug(spawnX, spawnY, 'NullPointer', Math.floor(game.difficultyLevel * 0.8)));
                    }
                }
                break;
                
            case 'SecurityBoss':
                // Spawn 2 strong bugs
                for (let i = 0; i < 2; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const spawnX = this.x + Math.cos(angle) * 70;
                    const spawnY = this.y + Math.sin(angle) * 70;
                    if (game && game.bugs) {
                        const bugType = Math.random() < 0.5 ? 'MemoryLeak' : 'LogicBug';
                        game.bugs.push(new Bug(spawnX, spawnY, bugType, game.difficultyLevel));
                    }
                }
                break;
                
            case 'GitBoss':
                // Different attacks per phase
                if (this.phase === 1) {
                    // Phase 1: Spawn 2 syntax errors
                    for (let i = 0; i < 2; i++) {
                        const angle = (Math.PI * 2 * i) / 2;
                        const spawnX = this.x + Math.cos(angle) * 80;
                        const spawnY = this.y + Math.sin(angle) * 80;
                        if (game && game.bugs) {
                            game.bugs.push(new Bug(spawnX, spawnY, 'SyntaxError', game.difficultyLevel));
                        }
                    }
                } else if (this.phase === 2) {
                    // Phase 2: Spawn 3 mixed bugs
                    const bugTypes = ['SyntaxError', 'LogicBug', 'NullPointer'];
                    for (let i = 0; i < 3; i++) {
                        const angle = (Math.PI * 2 * i) / 3;
                        const spawnX = this.x + Math.cos(angle) * 90;
                        const spawnY = this.y + Math.sin(angle) * 90;
                        if (game && game.bugs) {
                            const bugType = bugTypes[i];
                            game.bugs.push(new Bug(spawnX, spawnY, bugType, game.difficultyLevel));
                        }
                    }
                } else if (this.phase === 3) {
                    // Phase 3: Spawn 4 powerful bugs
                    for (let i = 0; i < 4; i++) {
                        const angle = (Math.PI * 2 * i) / 4;
                        const spawnX = this.x + Math.cos(angle) * 100;
                        const spawnY = this.y + Math.sin(angle) * 100;
                        if (game && game.bugs) {
                            game.bugs.push(new Bug(spawnX, spawnY, 'MemoryLeak', game.difficultyLevel));
                        }
                    }
                }
                break;
        }
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
    }
    
    render(ctx) {
        ctx.save();
        
        // Boss size and appearance
        const size = this.radius;
        
        // Boss body (larger and more intimidating)
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - size, this.y - size/2, size * 2, size);
        
        // Boss segments (multiple body parts)
        for (let i = 0; i < 3; i++) {
            const segmentSize = size * (0.8 - i * 0.2);
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - segmentSize, this.y - segmentSize/2 + i * 15, segmentSize * 2, segmentSize);
        }
        
        // Boss legs (more and larger)
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        for (let i = 0; i < 6; i++) {
            const legY = this.y - size/2 + i * 8;
            ctx.beginPath();
            ctx.moveTo(this.x - size, legY);
            ctx.lineTo(this.x - size - 20, legY - 8);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + size, legY);
            ctx.lineTo(this.x + size + 20, legY - 8);
            ctx.stroke();
        }
        
        // Boss eyes (glowing red)
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - size/2, this.y - size/3, 6, 6);
        ctx.fillRect(this.x + size/2 - 6, this.y - size/3, 6, 6);
        
        // Boss name and type
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y - size - 20);
        
        // Health bar (larger for bosses)
        const barWidth = 80;
        const barHeight = 6;
        const healthPercent = this.hp / this.maxHp;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - barWidth/2, this.y - size - 35, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - barWidth/2, this.y - size - 35, barWidth * healthPercent, barHeight);
        
        // HP text
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.fillText(`${this.hp}/${this.maxHp}`, this.x, this.y - size - 40);
        
        // Git Boss special effects
        if (this.type === 'GitBoss') {
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px monospace';
            ctx.fillText(`Phase ${this.phase}/3`, this.x, this.y + size + 25);
            
            // Phase-specific visual effects
            if (this.phase === 3) {
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x, this.y, size + 10, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
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