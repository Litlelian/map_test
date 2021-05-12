import Phaser from 'phaser'
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin.js'

import bunny1 from './assets/bunny1.png'
import bunny2 from './assets/bunny2.png'

const AreaColor = 0xFF9E00

class Beast extends Phaser.Scene {
    constructor() {
        //-----?
    }

    preload() {
        this.load.spritesheet('BunnyIdle',bunny1,{frameWidth:34,frameHeight:44})
        this.load.spritesheet('BunnyRun',bunny2,{frameWidth:34,frameHeight:44})
    }

    create() {
        this.player = this.add.sprite(0,0,'bunny')
        this.player.setDepth(2)
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('BunnyIdle',{start:0 , end: 7}),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('BunnyRun',{start:0 , end: 11}),
            frameRate: 10,
            repeat: -1
        })

        // add behavior     // question
        var BunnyMove = this.rexBoard.add.moveTo(this.player, {
            speed: 100
        })
        var BunnyPath = this.rexBoard.add.pathFinder(this.player,{
            occupiedTest: true
        })
        BunnyPath.setChess(this.player)
        
    }
}

class Block extends RexPlugins.Board.Shape {
    constructor(board, tileXY) {
        var scene = board.scene
        super(board, tileXY.x, tileXY.y, 1, AreaColor)
        scene.add.existing(this)
        // add behavior
        this.moveTo = scene.rexBoard.add.moveTo(this, {
            occupiedTest: true
        })  
    }
}

