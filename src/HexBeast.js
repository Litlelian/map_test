import Phaser from 'phaser'
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin.js'
import Beast from './createBeast.js'
import DragPlugin from 'phaser3-rex-plugins/plugins/drag-plugin.js'

const ROUND_TIME = 1000
const BOARD_LINE_COLOR = 0x43a047
const DAY_COLOR = 0xFFBF00
const DUSK_COLOR = 0xFF8218
const NIGHT_COLOR = 0x0047AB
const DAWN_COLOR = 0x807CFF
const TIME_ROUND_ORDER_COLOR = ["#FFBF00", "#FF8218", "#0047AB", "#807CFF"]
const TIME_ROUND_ORDER_IMAGE = ["day", "dusk", "night", "dawn"]

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
        this.load.spritesheet('chicken','./src/assets/chicken1.png',{frameWidth:32,frameHeight:40})
        this.load.spritesheet('chicken_run','./src/assets/chicken2.png',{frameWidth:32,frameHeight:40})
        this.load.spritesheet('chicken_hit','./src/assets/chicken3.png',{frameWidth:32,frameHeight:40})
        this.load.spritesheet('bat','./src/assets/bat1.png',{frameWidth:46,frameHeight:45})
        this.load.spritesheet('bat_run','./src/assets/bat2.png',{frameWidth:46,frameHeight:45})
        this.load.spritesheet('bat_hit','./src/assets/bat3.png',{frameWidth:46,frameHeight:45})
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
        this.allyDeck = ["000000", "000002", "000001", "000002", "000000", "000000", "000002", "000000"] // 8
        this.enermyDeck = ["000000", "000002", "000001", "000002", "000000", "000000", "000002", "000000"] // 8
        this.allyHand = []         // 3
        this.enermyHand = []       // 3
        this.allChessOnBoard = []
        this.allyCrystal = []
        this.enermyCrystal = []

        // create Deck

        this.hour = 6 // 0:day 6:dusk 12:night 18:dawn, always start from dusk or dawn
        this.allyEnergy = 0
        this.enermyEnergy = 0

        if (Math.floor(Math.random()*2)) { // decide which timer go first
            this.hour = 6
        }
        else {
            this.hour = 18
        }

        for (let i = 1; i < 6; i = i + 2) {
            this.enermyCrystal.push(new Crystal(this.board, {x:0, y:i}, -1, -1))
            this.allyCrystal.push(new Crystal(this.board, {x:8, y:i}, 1, 1))
        }

        for (let i = 0; i < 7; i = i + 2) {
            new Boundary(this.board, {x:0, y:i})
        }

        for (let i = 0; i < 3 ; i++) {
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

        // reset timer anime
        document.getElementById("hex_board").setAttribute("stroke", TIME_ROUND_ORDER_COLOR[parseInt(this.hour / 6) % 4])
        document.getElementById("timer_flexbox").style.backgroundImage = "url('./src/assets/timeSymbol/" + TIME_ROUND_ORDER_IMAGE[parseInt(this.hour / 6) % 4] + ".svg')"

        this.timer = setInterval(() => {
            this.hour++
            this.allChessActOnce(this.hour)
            this.clearDeadBeast(this.board)
            // round timer : )
            document.getElementById("hex_board").setAttribute("stroke-dasharray", `${50 * (6 - this.hour % 6)} 300`)
            this.switchTimeAndGiveEnergy(this.hour)
        }, ROUND_TIME)
    }

    update() {
    }

    allChessActOnce(hour) {
        if (hour % 3 === 0) {
            console.log(hour)
            for (let i = 0; i < this.allChessOnBoard.length; i++) {
                this.allChessOnBoard[i].testChessOccupiedAndAct(this.board)
                // Activate skill when each move round start (3 hours)
            }
            for (let i = 0; i < this.allChessOnBoard.length; i++) {
                this.allChessOnBoard[i].backToLastMoveIfOccupied(this.board)
            }
        }
    }

    switchTimeAndGiveEnergy(hour) {
        if (hour % 6 === 0) {
            // switch round
            for(let i = 0; i < this.allyCrystal.length; i++) {
                this.allyCrystal[i].addEnergy(this, hour)
            }
            document.getElementById("hex_board").setAttribute("stroke-dasharray", `300 300`)
            document.getElementById("hex_board").setAttribute("stroke", TIME_ROUND_ORDER_COLOR[parseInt(hour / 6) % 4])
            document.getElementById("timer_flexbox").style.backgroundImage = "url('./src/assets/timeSymbol/" + TIME_ROUND_ORDER_IMAGE[parseInt(hour / 6) % 4] + ".svg')"
        }
    }

    clearDeadBeast(board) {
        for (let i = 0; i < this.allChessOnBoard.length; i++) {
            if(this.allChessOnBoard[i]._character._life <= 0)
            {
                this.allChessOnBoard[i].killItself(board)
            }
        }
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
                color: BOARD_LINE_COLOR,
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
    constructor(board, tileXY, identity, crystalType) {
        var scene = board.scene
        var color
        if (crystalType === 1)
        {
            color = DAY_COLOR
        }
        else if (crystalType === -1)
        {
            color = NIGHT_COLOR
        }
        super(board, tileXY.x, tileXY.y, 0, color)
        this.setScale(0.95)

        this._parent = board
        this._location = tileXY
        this._crystalType = crystalType
        this._identity = identity
        scene.add.existing(this)

        // add behavior
        this.MoveBehavior = scene.rexBoard.add.moveTo(this, {
            speed: 50,
            occupiedTest: true
        })
    }

    addEnergy(game, hour) {
        if(this._crystalType === 1) {
            if(hour % 24 <=5) { // day
                if(this._identity === 1) {
                    game.allyEnergy += 2
                }
                else {
                    game.enermyEnergy += 2
                }
            }
            else if(hour % 24 <=11) { // dusk
                if(this._identity === 1) {
                    game.allyEnergy += 1
                }
                else {
                    game.enermyEnergy += 1
                }
            }
            else if(hour % 24 <=17) { // night
            }
            else if(hour % 24 <=23) { // dawn
                if(this._identity === 1) {
                    game.allyEnergy += 1
                }
                else {
                    game.enermyEnergy += 1
                }
            }
        }
        else if(this._crystalType === -1) {
            if(hour % 24 <=5) { // day
            }
            else if(hour % 24 <=11) { // dusk
                if(this._identity === 1) {
                    game.allyEnergy += 1
                }
                else {
                    game.enermyEnergy += 1
                }
            }
            else if(hour % 24 <=17) { // night
                if(this._identity === 1) {
                    game.allyEnergy += 2
                }
                else {
                    game.enermyEnergy += 2
                }
            }
            else if(hour % 24 <=23) { // dawn
                if(this._identity === 1) {
                    game.allyEnergy += 1
                }
                else {
                    game.enermyEnergy += 1
                }
            }
        }
    }

    killItself(board) {
        board.removeChess(this, null, null, null, true)
        if(this._identity === 1) {
            board.scene.allyCrystal.splice(board.scene.allyCrystal.indexOf(this), 1)
        }
        else if(this._identity === -1) {
            board.scene.enermyCrystal.splice(board.scene.enermyCrystal.indexOf(this), 1)
        }
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