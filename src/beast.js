import Phaser from 'phaser'
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin.js'

//import bunny1 from './assets/bunny1.png'
//import bunny2 from './assets/bunny2.png'

const AreaColor = 0xFF9E00

class Beast {
    constructor() {

    }
}

class area extends RexPlugins.Board.Shape {
    constructor(board, tileXY) {
        var scene = board.scene
        super(board, tileXY.x, tileXY.y, 0, AreaColor)
        scene.add.existing(this)
        // add behavior
        this.moveTo = scene.rexBoard.add.moveTo(this, {
            occupiedTest: true
        })
        
    }
}