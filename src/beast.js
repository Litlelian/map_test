import Phaser from 'phaser'
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin.js'

const AreaColor = 0xFF9E00

export default class Beast extends Phaser.GameObjects.Sprite {
    constructor(board, identity, scene, tileX, tileY, texture, frame) {
        super(scene, tileX, tileY, texture, frame)

        // private members
        this._xin = -2
        this._yin = -2
        this._life = 2
        this._attack = 1
        this._speed = 3000
        this._moving = true
        this._identity = identity
        this.timer

        console.log(this)

        scene.add.existing(this)
        this.setDepth(2)
        this.scaleX = this._identity
        this.MoveBehavior = scene.rexBoard.add.moveTo(this, {
            speed: 50,
            occupiedTest: true
        })
        .on('occupy', function(occupiedChess, thischess){
            this._moving = false
            console.log(occupiedChess)
            this.act(occupiedChess)
        },this)
        this.drag = scene.plugins.get('rexDrag').add(this)
        /*this.PathFindBehavior = scene.rexBoard.add.pathFinder(this ,{
            occupiedTest: true
        })*/

        // create anime
        
        //board.addChess(this, 5, 5, 1, true)

        scene.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('bunny',{start:0 , end: 7}),
            frameRate: 10,
            repeat: -1
        })

        scene.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('bunny_run',{start:0 , end: 11}),
            frameRate: 10,
            repeat: -1
        })

        scene.anims.create({
            key: 'hit',
            frames: this.anims.generateFrameNumbers('bunny_hit',{start:0 , end: 4}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.play('idle',true) 

        this.on('drag', function(pointer, dragX, dragY){ 
            this.x = dragX
            this.y = dragY
            this.anims.play('run',true)
        })

        this.on('dragend', function(pointer, dragX, dragY){ 
            var tileXY = board.worldXYToTileXY(this.x, this.y)
            clearInterval(this.timer)
            this.anims.play('idle',true)
            if(tileXY.x>=0&&tileXY.x<=8&&tileXY.y>=0&&tileXY.y<=6)
            {
                this._xin = tileXY.x
                this._yin = tileXY.y
                this.MoveBehavior.stop()
                board.addChess(this, tileXY.x, tileXY.y, 1, true)
                this.keepMoving(board)
                this.drag.setEnable(false)
            }
            console.log(this)
        })

    }
    
    // function to use
    keepMoving(board) {
        // use interval
        this.timer = setInterval(() => {
            this.anims.play('run',true) 
            this.moveforward(board, this._identity)
            this._xin -= this._identity
            this.MoveBehavior.on('complete', function(moveTo, gameObject){
                this.anims.play('idle',true) 
            },this)
        }, this._speed)
    }

    killItself(board) {
        clearInterval(this.timer)
        board.removeChess(this, null, null, null, true)
    }

    act(occupiedChess) {
        // judge itself live or not
        if(this._life <= 0)
        {
            // add Voice Of Death here
            this.killItself() // ??????
        }
        else
        {
            occupiedChess.anims.play('hit',true)
            occupiedChess._life = occupiedChess._life - this._attack
        }
    }

    moveforward(board, AllyOrEnermy) {
        var tileXYZ = board.chessToTileXYZ(this)
        if(AllyOrEnermy === -1) // ally
        {
            this.MoveBehavior.moveToward(0)  // move to right
            // this.MoveBehavior.on('occupy', function(occupiedChess, thischess){
            //     this._moving = false
            //     console.log(occupiedChess)
            //     this.act(occupiedChess)
            // },this)
        }
        if(AllyOrEnermy === 1) // enermy
        {
            this.MoveBehavior.moveToward(3)  // move to left
            // this.MoveBehavior.on('occupy', function(occupiedChess, thischess){
            //     this._moving = false
            //     console.log(occupiedChess)
            //     this.act(occupiedChess)
            // },this)
        }
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

