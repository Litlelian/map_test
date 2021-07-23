import Phaser from 'phaser'
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin.js'
import Beast from './createBeast.js'
import DragPlugin from 'phaser3-rex-plugins/plugins/drag-plugin.js'

const BoardLineColor = 0x43a047
const DayColor = 0xFFBF00
const DuskColor = 0xFF8218
const NightColor = 0x0047AB
const DawnColor = 0x807CFF
const TimeRoundOrderColor = ["#FFBF00", "#FF8218", "#0047AB", "#807CFF"]
const TimeRoundOrderImage = ["day", "dusk", "night", "dawn"]

class HexBeast extends Phaser.Scene {
    constructor() {
        super({
            key: 'examples'
        })
    }

    preload() {
        this.load.spritesheet('bunny','./src/assets/bunny1.png',{frameWidth:34,frameHeight:60})
        this.load.spritesheet('bunny_run','./src/assets/bunny2.png',{frameWidth:34,frameHeight:60})
        this.load.spritesheet('bunny_hit','./src/assets/bunny3.png',{frameWidth:34,frameHeight:60})
    }

    create() {
        // create board
        var config = {
            grid: getHexagonGrid(this),
            width: 9,
            height: 7
        }
        this.board = new Board(this, config)

        // create list to store chess
        this.allyDeck = ["000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000"] // 8
        this.enermyDeck = ["000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000"] // 8
        this.allyHand = []         // 3
        this.enermyHand = []       // 3
        this.allChessOnBoard = []
        this.allyCrystal = []
        this.enermyCrystal = []

        // create Deck

        this.time = 1 // 0:day 1:dusk 2:night 3:dawn, always start from dusk or dawn
        this.allyEnergy = 0
        this.enermyEnergy = 0

        if(Math.floor(Math.random()*2)) // decide which timer go first
        {
            this.time = 1
        }
        else
        {
            this.time = 3
        }

        for(let i = 1; i < 6; i = i + 2)
        {
            this.allyCrystal.push(new Crystal(this.board, {x:0, y:i}, -1))
            this.enermyCrystal.push(new Crystal(this.board, {x:8, y:i}, 1))
        }

        for(let i = 0; i < 7; i = i + 2)
        {
            new Boundary(this.board, {x:0, y:i})
        }

        for(let i = 0; i < 3 ; i++)
        {
            this.allyHand.push(new Beast(i, 1, this.board, this.allyDeck.shift(), this, {x:500 + i * 100, y:500}))
            this.enermyHand.push(new Beast(i, -1, this.board, this.enermyDeck.shift(), this, {x:100 + i * 100, y:500}))
        }

        // create timer

        document.getElementById("timer").innerHTML = `
        <div id="timer_flexbox">
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="110" xmlns:xlink="http://www.w3.org/1999/xlink"> 
            <polygon class="hex" points="50,5 93,30 93,80 50,105 7,80 7,30"></polygon>   
            <path id="hex_board" d="M 50,5 L 93,30 L 93,80 L 50,105 L 7,80 L 7,30 Z" />  
          </svg>
        </div>
        ` // add timer shape

        this.timerTickForBeast = 0
        this.timerTickForDasharray = 7

        document.getElementById("hex_board").setAttribute("stroke", TimeRoundOrderColor[this.time])
        document.getElementById("timer_flexbox").style.backgroundImage = "url('./src/assets/timeSymbol/" + TimeRoundOrderImage[this.time] + ".svg')"

        this.timer = setInterval(() => {
            this.timerTickForBeast++
            this.timerTickForDasharray--
            if(this.timerTickForBeast === 3)
            {
                for(let i = 0; i < this.allChessOnBoard.length; i++)
                {
                    if(this.allChessOnBoard[i]._moving)
                    {
                        this.allChessOnBoard[i]._character.anims.play('run',true) 
                        this.allChessOnBoard[i].moveforward(this.board, this.allChessOnBoard[i]._character._identity)
                        this.allChessOnBoard[i]._character.MoveBehavior.on('complete', function(moveTo, gameObject){
                            this.allChessOnBoard[i]._character.anims.play('idle',true) 
                        },this)
                    }
                }
                this.timerTickForBeast = 0
            }
            document.getElementById("hex_board").setAttribute("stroke-dasharray", `${50 * this.timerTickForDasharray - 3} 300`)
            if(this.timerTickForDasharray === 0)
            {
                // switch round
                this.timerTickForDasharray = 6
                if(this.time === 3)
                {
                    this.time = 0
                }
                else
                {
                    this.time++
                }
                document.getElementById("hex_board").setAttribute("stroke", TimeRoundOrderColor[this.time])
                document.getElementById("timer_flexbox").style.backgroundImage = "url('./src/assets/timeSymbol/" + TimeRoundOrderImage[this.time] + ".svg')"
            }
        }, 1000)
    }

    update(){
    }
}

var getHexagonGrid = function (scene) {
    var staggeraxis = 'x'
    var staggerindex = 'odd'
    var grid = scene.rexBoard.add.hexagonGrid({
        x: 165,
        y: 100,
        size: 30,
        staggeraxis: staggeraxis,
        staggerindex: staggerindex
    })
    return grid
}

class Board extends RexPlugins.Board.Board {
    constructor(scene, config) {
        // create board
        super(scene, config)
        // draw grid
        var graphics = scene.add.graphics({
            lineStyle: {
                width: 3,
                color: BoardLineColor,
                alpha: 1
            }
        })
        this.forEachTileXY(function (tileXY, board) {
            var points = board.getGridPoints(tileXY.x, tileXY.y, true)
            graphics.strokePoints(points, true)
        })
        // enable touch events
        this.setInteractive()
    }
}

class Crystal extends RexPlugins.Board.Shape {
    constructor(board, tileXY, identity) {
        var scene = board.scene
        var color
        if(identity === 1)
        {
            color = DayColor
        }
        else if(identity === -1)
        {
            color = NightColor
        }
        super(board, tileXY.x, tileXY.y, 0, color)
        this.setScale(0.95)

        this._parent = board
        this._location = tileXY
        this._identity = identity
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

class Boundary extends RexPlugins.Board.Shape {
    constructor(board, tileXY)
    {
        var scene = board.scene
        super(board, tileXY.x, tileXY.y, 0, 0xFFFFFF)
        
        this._parent = "boundary"
        this._location = tileXY
        this._identity = 0

        this.setScale(0.95)
        
        scene.add.existing(this)
    }
}

var config = {
    type: Phaser.AUTO,
    parent: 'app',
    width: 800,
    height: 600,
    scene: HexBeast,
    plugins: {
          scene: [{
              key: 'rexBoard',
              plugin: BoardPlugin,
              mapping: 'rexBoard'
          }],
          global:[
        {
            key: 'rexDrag',
            plugin: DragPlugin,
            start: true
        }]
    }
}

var game = new Phaser.Game(config)