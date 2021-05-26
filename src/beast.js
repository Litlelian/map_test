import Phaser from 'phaser'
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin.js'

const AreaColor = 0xFF9E00

export default class Beast extends Phaser.GameObjects.Sprite {
    constructor(board, scene, tileX, tileY, texture, frame) {
        super(scene, tileX, tileY, texture, frame)
        scene.add.existing(this)
        this.setDepth(2)
        this.MoveBehavior = scene.rexBoard.add.moveTo(this, {
            speed: 40,
            occupiedTest: true
        })
        this.drag = scene.plugins.get('rexDrag').add(this)
        /*this.PathFindBehavior = scene.rexBoard.add.pathFinder(this ,{
            occupiedTest: true
        })*/

        // create anime
        
        board.addChess(this, 5, 5, 1, true)

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

        this.on('drag', function(pointer, dragX, dragY){ 
            this.x = dragX
            this.y = dragY
            this._moving = true
        })

        this.on('dragend', function(pointer, dragX, dragY){ 
            this._moving = false
        })

        // wrong???
        // ;(async function (){
        //     await new Promise(resolve =>{
        //         this.anims.play('run',true)
        //         this.moveforward(1)
        //     })
        //     this.anims.play('idle',true)
        //     resolve
        // })()

        window.setInterval(() => {
            this.moveforward(1)
            this.anims.play('run',true)
        }, this._speed);
        // private members
        this._life = 2
        this._attack = 1
        this._speed = 2000
        this._moving = false
    }
    
    // function to use
    act(occupiedChess) {
        // judge itself live or not
        if(this._life < 0)
        {
            // add Voice Of Death here
            this.destroy()
        }
        // attack
        occupiedChess._life = occupiedChess._life - this._attack
    }

    moveforward(AllyOrEnermy) {
        if(AllyOrEnermy === 0) // ally
        {
            this.MoveBehavior.moveToward(0)  // move to right
            .on('occupy', function(occupiedChess, thischess){
                act(occupiedChess)
            })
        }
        if(AllyOrEnermy === 1) // enermy
        {
            this.MoveBehavior.moveToward(3)  // move to left
            .on('occupy', function(occupiedChess, thischess){
                act(occupiedChess)
            })
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

