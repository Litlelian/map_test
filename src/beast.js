import Phaser from 'phaser'
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin.js'

const AreaColor = 0xFF9E00

class Beast extends Phaser.GameObjects.TileSprite {
    constructor(scene, tileX, tileY, width, height, texture, frame) {
        super(scene, tileX, tileY, width, height, texture, frame)
        scene.add.existing(this)
        this.setDepth(2)
        this.MoveBehavior = scene.rexBoard.add.moveTo(this, {
            speed: 100,
            occupiedTest: true
        })
        /*this.PathFindBehavior = scene.rexBoard.add.pathFinder(this ,{
            occupiedTest: true
        })*/

        // private members
        this._life = 2
        this._attack = 1
        this._speed = 1
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
            .on('occupy', function(occupiedChess, this){
                act(occupiedChess)
            })
        }
        if(AllyOrEnermy === 1) // enermy
        {
            this.MoveBehavior.moveToward(3)  // move to left
            .on('occupy', function(occupiedChess, this){
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

