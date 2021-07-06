import Phaser from 'phaser'
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin.js'

const AreaColor = 0xFF9E00

export default class Beast extends RexPlugins.Board.Shape {
    constructor(board, tileXY, type, identity){
        var scene = board.scene
        super(board, tileXY.x, tileXY.y, 0, AreaColor)
        this.setScale(0.95)

        // private members
        this._timer
        this._parent = this
        this._sprite
        this._blockArea = [this]
        this._enermy = []

        // add behavior
        this.MoveBehavior = scene.rexBoard.add.moveTo(this, {
            speed: 50,
            occupiedTest: true
        })

        // add the correct beast
        switch(type) {
            case "000000":
                this._sprite = new Rabbit(board, identity, scene, tileXY)
                for(var i=0; i<this._sprite._area.length; i++)
                {
                    this._blockArea.push(new Block(board, tileXY.x + identity*this._sprite._area[i].x, tileXY.y + this._sprite._area[i].y), this)
                    this._blockArea.pop()
                }
                break
            default:
                console.log("Error!! Invalid Animal Type For Summoning!!")
        }
        board.addChess(this._sprite, tileXY.x, tileXY.y, 1, true)

        // add behavior
        this.MoveBehavior = scene.rexBoard.add.moveTo(this, {
            speed: 50,
            occupiedTest: true
        })

        scene.add.existing(this)

        this.keepMoving(board)
    }
    // function to use
    keepMoving(board) {
        // use interval
        this._timer = setInterval(() => {
            this._sprite.anims.play('run',true) 
            this.moveforward(board, this._sprite._identity)
            this._sprite.MoveBehavior.on('complete', function(moveTo, gameObject){
                this._sprite.anims.play('idle',true) 
            },this)
        }, this._sprite._speed)
    }

    moveforward(board, AllyOrEnermy) {
        //var tileXYZ = board.chessToTileXYZ(this)
        if(AllyOrEnermy === -1) // enermy
        {// move to right
            for(let i = 0; i < this._blockArea.length; i++)
            {
                this._blockArea[i].MoveBehavior.on('occupy', function(occupiedChess, thischess){
                    clearInterval(this._timer)
                    for(let i = 0; i < this._blockArea.length; i++)
                    {
                        this._blockArea[i].MoveBehavior.setEnable(false)
                    }
                    this._sprite.MoveBehavior.setEnable(false)
                    this._sprite.anims.play('idle',true) 
                    this._enermy.push(occupiedChess._parent)
                    console.log(occupiedChess)
                    for(let i = 0; i < this._enermy.length-1; i++)
                    {
                        if(occupiedChess._parent === this._enermy[i]._parent)
                        {
                            this._enermy.pop()
                            break
                        }
                    }
                },this)
                this._blockArea[i].MoveBehavior.moveToward(0)
                console.log(this._enermy)
            }
            this._sprite.MoveBehavior.moveToward(0)
        }
        if(AllyOrEnermy === 1) // ally
        {// move to left
            for(let i = 0; i < this._blockArea.length; i++)
            {
                this._blockArea[i].MoveBehavior.on('occupy', function(occupiedChess, thischess){
                    clearInterval(this._timer)
                    for(let i = 0; i < this._blockArea.length; i++)
                    {
                        this._blockArea[i].MoveBehavior.setEnable(false)
                    }
                    this._sprite.MoveBehavior.setEnable(false)
                    this._sprite.anims.play('idle',true) 
                    this._enermy.push(occupiedChess)
                    for(let i = 0; i < this._enermy.length-1; i++)
                    {
                        if(occupiedChess._parent === this._enermy[i]._parent)
                        {
                            this._enermy.pop()
                            break
                        }
                    }
                },this)
                this._blockArea[i].MoveBehavior.moveToward(3)
            }
            this._sprite.MoveBehavior.moveToward(3)
            for(let i = 0; i < this._enermy.length; i++)
            {
                if(this._enermy[i]._parent === board)
                {
                    this._enermy[i].killItself(board)
                }
                else
                {
                    this._sprite.act(board, this._enermy[i])
                }
            }
        }
    }

    killItself(board) {
        clearInterval(this.timer)
        this._sprite.killItself(board)
        for(var i=0; i<this._blockArea.length; i++)
        {
            board.removeChess(this._blockArea[i], null, null, null, true)
        }
    }
}

export class BeastBoard extends Phaser.GameObjects.Sprite {
    constructor(board, type, identity, scene, tileXY, texture, frame) {
        super(scene, tileXY.x, tileXY.y, texture, frame)
        
        // private members
        this._sprite

        scene.add.existing(this)
        this.setDepth(2)

        switch(type) {
            case "000000":
                this._sprite = new Rabbit(board, identity, scene, tileXY)
                break
            default:
                console.log("Error!! Invalid Animal Type For Board!!")
        }
        
        this.drag = scene.plugins.get('rexDrag').add(this)

        console.log(this)

        this.on('drag', function(pointer, dragX, dragY){ 
            this.x = dragX
            this.y = dragY
            this._sprite.x = dragX
            this._sprite.y = dragY
            this._sprite.anims.play('run',true)
        })

        this.on('dragend', function(pointer, dragX, dragY){ 
            var tileXY = board.worldXYToTileXY(this.x, this.y)
            this._sprite.anims.play('idle',true)
            if(tileXY.x>=0 && tileXY.x<=8 && tileXY.y>=0 && tileXY.y<=6)
            {
                this.drag.setEnable(false)
                if(identity === 1)
                {
                    scene.allyChess.push(new Beast(board, tileXY, type, identity))
                }
                else if(identity === -1)
                {
                    scene.enermyChess.push(new Beast(board, tileXY, type, identity))
                }
                this._sprite.killItself(board)
            }
        })
    }
}

class Rabbit extends Phaser.GameObjects.Sprite {
    constructor(board, identity, scene, tileXY, texture, frame) {
        super(scene, tileXY.x, tileXY.y, texture, frame)

        // private members
        this._life = 2
        this._attack = 1
        this._speed = 3000
        this._active = "day"
        this._moving = true
        this._identity = identity
        this._area = [{x:0, y:1}]
        this.timer

        console.log(this)

        scene.add.existing(this)
        this.setDepth(2)
        this.scaleX = this._identity
        this.MoveBehavior = scene.rexBoard.add.moveTo(this, {
            speed: 50,
            occupiedTest: true
        })

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
    }
    
    // function to use

    killItself(board) {
        clearInterval(this.timer)
        board.removeChess(this, null, null, null, true)
    }

    act(board, occupiedChess) {
        // judge itself live or not
        if(this._life <= 0)
        {
            // add Voice Of Death here
            this.killItself(board) 
        }
        else
        {
            occupiedChess._sprite.anims.play('hit',true)
            occupiedChess._sprite._life = occupiedChess._sprite._life - this._attack
        }
    }
}

class Block extends RexPlugins.Board.Shape {
    constructor(board, tileX, tileY, parentclass) {
        var scene = board.scene
        super(board, tileX, tileY, 0, AreaColor)
        this.setScale(0.95)

        this._parent = parentclass
        scene.add.existing(this)

        // add behavior
        this.MoveBehavior = scene.rexBoard.add.moveTo(this, {
            speed: 50,
            occupiedTest: true
        })
    }

    killItself(board) {
        board.removeChess(this, null, null, null, true)
    }
}

