namespace SpriteKind {
    export const Boss = SpriteKind.create()
    export const PowerUp = SpriteKind.create()
}

let player: Sprite = null
let boss: Sprite = null
let bossHealth = 0
let level = 1
let shootMode = 1
let shieldActive = false
let coins = 0

info.setScore(0)
info.setLife(3)

music.playMelody("C5 A B G A F G E ", 120)

// 🌌 Moving Background Stars
game.onUpdateInterval(200, function () {
    let star = sprites.create(img`.`, SpriteKind.Food)
    star.setPosition(randint(0, 160), 0)
    star.setVelocity(0, 50)
    star.lifespan = 2000
})

// 🛸 PLAYER
player = sprites.create(img`
    . . 2 2 2 2 . .
    . 2 4 4 4 4 2 .
    2 4 4 4 4 4 4 2
    . 2 4 4 4 4 2 .
    . . 2 2 2 2 . .
`, SpriteKind.Player)

player.setPosition(80, 110)
controller.moveSprite(player, 130, 0)
player.setStayInScreen(true)

// 🔫 SHOOT SYSTEM
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (shootMode == 1) {
        sprites.createProjectileFromSprite(img`5`, player, 0, -150)
    } else {
        sprites.createProjectileFromSprite(img`5`, player, -50, -150)
        sprites.createProjectileFromSprite(img`5`, player, 0, -150)
        sprites.createProjectileFromSprite(img`5`, player, 50, -150)
    }
})

// 👾 ENEMY SPAWN
game.onUpdateInterval(800, function () {
    if (level < 4) {
        let enemy = sprites.create(img`
            3 3 3 3
            6 6 6 6
            6 6 6 6
            3 3 3 3
        `, SpriteKind.Enemy)

        enemy.setPosition(randint(10, 150), 0)
        enemy.setVelocity(0, 40 + level * 15)
    }
})

// 💥 BULLET HITS ENEMY
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (proj, enemy) {
    proj.destroy()
    enemy.destroy(effects.fire, 200)
    info.changeScoreBy(1)
    coins += 1
})

// 😵 ENEMY HITS PLAYER
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (player, enemy) {
    enemy.destroy()
    if (!shieldActive) {
        info.changeLifeBy(-1)
    }
})

// ⚡ POWERUP SPAWN
game.onUpdateInterval(10000, function () {
    let power = sprites.create(img`
        . 9 9 .
        9 8 8 9
        . 9 9 .
    `, SpriteKind.PowerUp)

    power.setPosition(randint(10, 150), 0)
    power.setVelocity(0, 40)
})

// ⚡ COLLECT POWERUP
sprites.onOverlap(SpriteKind.Player, SpriteKind.PowerUp, function (player, power) {
    power.destroy()

    let type = randint(1, 2)

    if (type == 1) {
        shootMode = 2
        player.startEffect(effects.trail, 6000)
        pause(6000)
        shootMode = 1
    } else {
        shieldActive = true
        player.startEffect(effects.halo, 6000)
        pause(6000)
        shieldActive = false
    }
})

// 🛒 SHOP SYSTEM (Press B)
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    game.splash("Coins: " + coins + " | Extra Life = 10")

    if (coins >= 10) {
        coins -= 10
        info.changeLifeBy(1)
        game.splash("Extra Life Bought!")
    } else {
        game.splash("Not Enough Coins!")
    }
})

// 🏆 LEVEL SYSTEM
game.onUpdate(function () {
    if (info.score() >= 15 && level == 1) {
        level = 2
        game.splash("LEVEL 2")
    }

    if (info.score() >= 30 && level == 2) {
        level = 3
        game.splash("LEVEL 3")
    }

    if (info.score() >= 50 && level == 3) {
        level = 4
        game.splash("FINAL BOSS")
        spawnBoss()
    }
})

// 👹 BOSS FUNCTION
function spawnBoss() {
    boss = sprites.create(img`
        8 8 8 8 8 8
        8 2 2 2 2 8
        8 2 4 4 2 8
        8 2 4 4 2 8
        8 2 2 2 2 8
        8 8 8 8 8 8
    `, SpriteKind.Boss)

    boss.setPosition(80, 20)
    bossHealth = 40

    game.onUpdateInterval(700, function () {
        if (bossHealth > 0) {
            sprites.createProjectileFromSprite(img`4`, boss, randint(-50, 50), 80)
        }
    })
}

// 🔫 BULLET HITS BOSS
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Boss, function (proj, boss) {
    proj.destroy()
    bossHealth -= 1

    if (bossHealth <= 0) {
        boss.destroy(effects.disintegrate, 500)
        game.splash("YOU SAVED THE GALAXY 🚀")
        game.over(true)
    }
})

// 💀 BOSS BULLET HITS PLAYER
sprites.onOverlap(SpriteKind.Player, SpriteKind.Projectile, function (player, proj) {
    if (proj.vy > 0 && !shieldActive) {
        proj.destroy()
        info.changeLifeBy(-1)
    }
})

// 💔 GAME OVER
info.onLifeZero(function () {
    game.over(false, effects.melt)
})

