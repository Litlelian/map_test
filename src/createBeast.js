const DayColor = 0xFFBF00
const NightColor = 0x0047AB

export default class Beast extends Phaser.GameObjects.Sprite {
    constructor(baseNumber, identity, board, beastID, scene, tileXY, texture, frame) {
        super(scene, tileXY.x, tileXY.y, texture, frame)

        // private properties
        this._onBoard = false
        this._blockedByAllyChess = false
        this._character
        this._blockArea = []
        this._enermy = []

        // choose correct character
        switch(beastID) {
            case "000000":
                this._character = new Rabbit(identity, scene, tileXY, this)
                break
            case "000001":
                this._character = new Bat(identity, scene, tileXY, this)
                break
            case "000002":
                this._character = new Chicken(identity, scene, tileXY, this)
                break
            default:
                this._character = new Rabbit(identity, scene, tileXY, this)
        }
        
        // add behavior
        this.MoveBehavior = scene.rexBoard.add.moveTo(this, {
            speed: 50,
            occupiedTest: true
        })
        this.drag = scene.plugins.get('rexDrag').add(this)
        
        scene.add.existing(this)

        this.on('drag', function(pointer, dragX, dragY){ 
            this.x = dragX
            this.y = dragY
            this._character.x = dragX
            this._character.y = dragY
            this._character.runAnime()
        })

        this.on('dragend', function(pointer, dragX, dragY){ 
            var tileXY = board.worldXYToTileXY(this.x, this.y)
            this._character.idleAnime()
            if (this.testIfChessCanPut(board, tileXY)) {
                this.drag.setEnable(false)
                if (this._character._identity === 1) {
                    scene.allyHand.splice(baseNumber, 1, new Beast(baseNumber, 1, board, scene.allyDeck.shift(), scene, {x:500 + baseNumber * 100, y:500}))
                    scene.allChessOnBoard.push(this)
                    this.createTerritory(board, tileXY)
                    board.addChess(this._character, tileXY.x, tileXY.y, 1, true)
                    this._onBoard = true
                }
                else if (this._character._identity === -1) {
                    scene.enermyHand.splice(baseNumber, 1, new Beast(baseNumber, -1, board, scene.enermyDeck.shift(), scene, {x:100 + baseNumber * 100, y:500}))
                    scene.allChessOnBoard.push(this)
                    this.createTerritory(board, tileXY)
                    board.addChess(this._character, tileXY.x, tileXY.y, 1, true)
                    this._onBoard = true
                }
            }
            else {
                this.x = 300 + 200 * this._character._identity + baseNumber * 100
                this.y = 500
                this._character.x = 300 + 200 * this._character._identity + baseNumber * 100
                this._character.y = 500
                this._character.idleAnime()
            }
        })
    }
    // function to use

    moveforward(board) {
        var moveDirection = 3
        if (this._character._identity === 1) { // ally
            moveDirection = 3
        }
        else if (this._character._identity === -1) { // enermy 
            moveDirection = 0
        }
        for (let i = 0; i < this._blockArea.length; i++) {
            this._blockArea[i].MoveBehavior.moveToward(moveDirection)
            var blockSituation = board.chessToTileXYZ(this._blockArea[i])
            this._blockArea[i]._location = {x:blockSituation.x, y:blockSituation.y}
        }
        this._character.runAnime()
        this._character.MoveBehavior.moveToward(moveDirection)
        this._character.MoveBehavior.on('complete', function(moveTo, gameObject){
            this._character.idleAnime()
        }, this)
    }

    createTerritory(board, tileXY) {// add blocks 
        var blockColor
        var centerIndex = 0
        if (this._character._identity === 1) {
            blockColor = DayColor + this._character._color
            for (let i = 0; i < this._character._allyArea.length; i++) {
                this._blockArea.push(new Block(board, tileXY, -1, blockColor, this))
                if (this._character._allyArea[i] != -69) {
                    this._blockArea[i].rexChess.setTileZ(0)
                    this._blockArea[i].MoveBehavior.moveToward(this._character._allyArea[i])
                    .on('complete', function(moveTo, gameObject){
                        this._blockArea[i].MoveBehavior.setSpeed(50)
                    }, this)
                    var blockSituation = board.chessToTileXYZ(this._blockArea[i])
                    this._blockArea[i]._location = {x:blockSituation.x, y:blockSituation.y}
                }
                else {
                    centerIndex = i
                    this._blockArea[i].rexChess.setTileZ(-2)
                }
            }
        }
        else if (this._character._identity === -1) {
            blockColor = NightColor + this._character._color
            for (let i = 0; i < this._character._enermyArea.length; i++) {
                this._blockArea.push(new Block(board, tileXY, -1, blockColor, this))
                if (this._character._enermyArea[i] != -69) {
                    this._blockArea[i].rexChess.setTileZ(0)
                    this._blockArea[i].MoveBehavior.moveToward(this._character._enermyArea[i])
                    .on('complete', function(moveTo, gameObject){
                        this._blockArea[i].MoveBehavior.setSpeed(50)
                    }, this)
                    var blockSituation = board.chessToTileXYZ(this._blockArea[i])
                    this._blockArea[i]._location = {x:blockSituation.x, y:blockSituation.y}
                }
                else {
                    centerIndex = i
                    this._blockArea[i].rexChess.setTileZ(-2)
                }
            }
        }
        this._blockArea[centerIndex].rexChess.setTileZ(0)
        this._blockArea[centerIndex].MoveBehavior.setSpeed(50)
    }

    testIfChessCanPut(board, tileXY) {//test if the chess can put on what user want
        if (tileXY.x>=0 && tileXY.x<=8 && tileXY.y>=0 && tileXY.y<=6) {
            var undefinedColor
            var testBlock = []
            if (this._character._identity === 1) {
                for (let i = 0; i < this._character._allyArea.length; i++) {
                    testBlock.push(new Block(board, tileXY, -3, undefinedColor, this))
                    if (this._character._allyArea[i] != -69) {
                        testBlock[i].rexChess.setTileZ(-2)
                        testBlock[i].MoveBehavior.moveToward(this._character._allyArea[i])
                        var blockSituation = board.chessToTileXYZ(testBlock[i])
                        testBlock[i]._location = {x:blockSituation.x, y:blockSituation.y}
                        if (board.tileXYZToChess(blockSituation.x, blockSituation.y, 0) || board.tileXYZToChess(blockSituation.x, blockSituation.y, -4)){
                            for(let i = 0; i < testBlock.length; i++) {
                                board.removeChess(testBlock[i], null, null, null, true)
                            }
                            return false
                        }
                    }
                    else {
                        testBlock[i].rexChess.setTileZ(-4)
                        if (board.tileXYZToChess(tileXY.x, tileXY.y, 0) || board.tileXYZToChess(tileXY.x, tileXY.y, -2)) {
                            for(let i = 0; i < testBlock.length; i++) {
                                board.removeChess(testBlock[i], null, null, null, true)
                            }
                            return false
                        }
                    }
                }
            }
            else if (this._character._identity === -1)
            {
                for (let i = 0; i < this._character._enermyArea.length; i++) {
                    testBlock.push(new Block(board, tileXY, -3, undefinedColor, this))
                    if (this._character._enermyArea[i] != -69) {
                        testBlock[i].rexChess.setTileZ(-2)
                        testBlock[i].MoveBehavior.moveToward(this._character._enermyArea[i])
                        var blockSituation = board.chessToTileXYZ(testBlock[i])
                        testBlock[i]._location = {x:blockSituation.x, y:blockSituation.y}
                        if (board.tileXYZToChess(blockSituation.x, blockSituation.y, 0) || board.tileXYZToChess(blockSituation.x, blockSituation.y, -4)){
                            for(let i = 0; i < testBlock.length; i++) {
                                board.removeChess(testBlock[i], null, null, null, true)
                            }
                            return false
                        }
                    }
                    else {
                        testBlock[i].rexChess.setTileZ(-4)
                        if (board.tileXYZToChess(tileXY.x, tileXY.y, 0) || board.tileXYZToChess(tileXY.x, tileXY.y, -2)) {
                            for (let i = 0; i < testBlock.length; i++) {
                                board.removeChess(testBlock[i], null, null, null, true)
                            }
                            return false
                        }
                    }
                }
            }
            
            // make sure there at least one block close to another ally unit
            var numberCloseOtherUnit = 0
            for (let i = 0; i < testBlock.length; i++) {
                var neighborTileXY = board.getNeighborTileXY(testBlock[i]._location, null)
                for (let j = 0; j < neighborTileXY.length; j++) {
                    var neighborChessArray = board.tileXYToChessArray(neighborTileXY[j].x, neighborTileXY[j].y)
                    if (neighborChessArray.length && neighborChessArray[0]._parent != this && neighborChessArray[0]._identity === this._character._identity) {
                        numberCloseOtherUnit++
                    }
                }
            }

            for (let i = 0; i < testBlock.length; i++) {
                board.removeChess(testBlock[i], null, null, null, true)
            }

            if (numberCloseOtherUnit) {
                return true
            }
            else {
                return false
            }
        }
        return false
    }

    testChessOccupiedAndAct(board) {
        if (this.detectBoard()) {
            return false
        }
        this._enermy.length = 0
        var allyBlockChess = 0
        for (let i = 0; i < this._blockArea.length; i++) {
            var neighborTileXY
            if (this._character._identity === 1) { // ally
                neighborTileXY = board.getNeighborTileXY(this._blockArea[i]._location, 3)
            }
            else if (this._character._identity === -1) { // enermy
                neighborTileXY = board.getNeighborTileXY(this._blockArea[i]._location, 0)
            }
            var neighborChessArray = board.tileXYToChessArray(neighborTileXY.x, neighborTileXY.y)
            if (neighborChessArray.length && neighborChessArray[0]._parent != "boudary" && neighborChessArray[0]._parent != this && neighborChessArray[0]._identity != this._character._identity) {
                this._enermy.push(neighborChessArray[0])
                for (let i = 0; i < this._enermy.length - 1; i++) {
                    if (neighborChessArray[0]._parent === this._enermy[i]) {
                        this._enermy.pop()
                        break
                    }
                }
            }
            if (neighborChessArray.length && neighborChessArray[0]._parent != "boudary" && neighborChessArray[0]._parent != this && neighborChessArray[0]._identity === this._character._identity) {
                allyBlockChess++
            }
        }
        if (this._enermy.length) {
            // Occupied
            var ifAttackCrystal = 0
            for (let i = 0; i < this._enermy.length; i++) {
                if (this._enermy[i]._parent === board) { // Occupied by crystal
                    ifAttackCrystal ++
                    if (this._character._identity === 1) {
                        board.scene.enermyCrystal.splice(board.scene.enermyCrystal.indexOf(this._enermy[i]), 1)
                    }
                    else if (this._character._identity === -1) {
                        board.scene.allyCrystal.splice(board.scene.enermyCrystal.indexOf(this._enermy[i]), 1)
                    }
                    this._enermy[i].killItself(board)
                }
                else {
                    this._character.act(board, this._enermy[i])
                }
            }
            if (ifAttackCrystal != 0) {
                this.killItself(board)
                // clear allChessOnBoard
                board.scene.allChessOnBoard.splice(board.scene.allChessOnBoard.indexOf(this), 1)
            }
            return false
        }
        else if (allyBlockChess) {
            this._blockedByAllyChess = true
            this.moveforward(board)
            return true
        }
        else {
            this._blockedByAllyChess = false
            this.moveforward(board)
            return true
        }
    }

    detectBoard() {
        // if it touch the board
        for (let i = 0; i < this._blockArea.length; i++) {
            if (this._character._identity === 1) { // ally
                if (this._blockArea[i]._location.x === 0 || (this._blockArea[i]._location.x === 1 && this._blockArea[i]._location.y % 2 === 0)) {
                    return true
                }
            }
            else if (this._character._identity === -1) {// enermy
                if (this._blockArea[i]._location.x === 8) {
                    return true
                }
            }
        }
    }

    backToLastMoveIfOccupied(board) {
        if (this._blockedByAllyChess) {
            for (let i = 0; i < this._blockArea.length; i++) {
                var everyBlockOnIt = board.tileXYToChessArray(this._blockArea[i]._location.x, this._blockArea[i]._location.y)
                for (let j = 0; j < everyBlockOnIt.length; j++) {
                    if (everyBlockOnIt[j]._parent != this) {
                        this.moveback(board, this._character._identity)
                        this._blockedByAllyChess = false
                        return
                    }
                }
            }
        }
    }

    moveback(board) {
        // move back
        var moveDirection = 3
        if (this._character._identity === 1) { // ally
            moveDirection = 0
        }
        else if (this._character._identity === -1) { // enermy 
            moveDirection = 3
        }
        this._character.MoveBehavior.moveToward(moveDirection)
        for (let i = this._blockArea.length - 1; i >= 0; i--) {
            this._blockArea[i].MoveBehavior.moveToward(moveDirection)
            var blockSituation = board.chessToTileXYZ(this._blockArea[i])
            this._blockArea[i]._location = {x:blockSituation.x, y:blockSituation.y}
        }
        // call other
        for (let i = this._blockArea.length - 1; i >= 0; i--) {
            var everyBlockOnIt = board.tileXYToChessArray(this._blockArea[i]._location.x, this._blockArea[i]._location.y)
            for (let j = 0; j < everyBlockOnIt.length; j++) {
                if (everyBlockOnIt[j]._parent != this) {
                    everyBlockOnIt[j]._parent._blockedByAllyChess = false
                    everyBlockOnIt[j]._parent.moveback(board)
                    break
                }
            }
        }
    }

    killItself(board) {
        for(let i = 0; i < this._blockArea.length; i++)
        {
            board.removeChess(this._blockArea[i], null, null, null, true)
            this._blockArea[i].destroy()
        }
        board.removeChess(this._character, null, null, null, true)
        this._character.destroy()
        delete this
    }
}

class Rabbit extends Phaser.GameObjects.Sprite {
    constructor(identity, scene, tileXY, parentClass, texture, frame) {
        super(scene, tileXY.x, tileXY.y, texture, frame)

        // private members
        this._cost = 2
        this._life = 2
        this._attack = 1
        this._active = "day"
        this._color = -331469
        this._identity = identity
        this._allyArea = [-69, 0] // front -> center -> back  // direction -> use moveToward function, -69 is center
        this._enermyArea = [-69, 3]
        this._parent = parentClass

        scene.add.existing(this)

        this.setDepth(2)
        this.scaleX = this._identity
        this.MoveBehavior = scene.rexBoard.add.moveTo(this, {
            speed: 50,
            occupiedTest: true,
            sneak: true
        })

        scene.anims.create({
            key: 'bunny_idle',
            frames: this.anims.generateFrameNumbers('bunny',{start:0 , end: 7}),
            frameRate: 10,
            repeat: -1
        })

        scene.anims.create({
            key: 'bunny_run',
            frames: this.anims.generateFrameNumbers('bunny_run',{start:0 , end: 11}),
            frameRate: 10,
            repeat: -1
        })

        scene.anims.create({
            key: 'bunny_hit',
            frames: this.anims.generateFrameNumbers('bunny_hit',{start:0 , end: 4}),
            frameRate: 10,
            repeat: -1
        })

        this.idleAnime()
    }
    
    // function to use

    act(board, occupiedChess) {
        if (occupiedChess._parent != board && occupiedChess._identity != this._identity) {
            occupiedChess._parent._character._life = occupiedChess._parent._character._life - this._attack
            if (occupiedChess._parent._character._life <= 0) {
                board.scene.allChessOnBoard.splice(board.scene.allChessOnBoard.indexOf(occupiedChess._parent), 1)
                occupiedChess._parent.killItself(board)
            }
            else {
                occupiedChess._parent._character.hitAnime()
            }
        }
    }
    
    idleAnime() {
        this.anims.play('bunny_idle',true)
    }
    
    runAnime() {
        this.anims.play('bunny_run',true)
    }

    hitAnime() {
        this.anims.play('bunny_hit',true)
    }
}

class Chicken extends Phaser.GameObjects.Sprite {
    constructor(identity, scene, tileXY, parentClass, texture, frame) {
        super(scene, tileXY.x, tileXY.y, texture, frame)

        // private members
        this._cost = 3
        this._life = 3
        this._attack = 2
        this._active = "day"
        this._color = -321409
        this._identity = identity
        this._allyArea = [2, -69, 0] // front -> center -> back  // direction -> use moveToward function, -69 is center
        this._enermyArea = [1, -69, 3]
        this._parent = parentClass

        scene.add.existing(this)

        this.setDepth(2)
        this.scaleX = this._identity
        this.MoveBehavior = scene.rexBoard.add.moveTo(this, {
            speed: 50,
            occupiedTest: true,
            sneak: true
        })

        scene.anims.create({
            key: 'chicken_idle',
            frames: this.anims.generateFrameNumbers('chicken',{start:0 , end: 12}),
            frameRate: 10,
            repeat: -1
        })

        scene.anims.create({
            key: 'chicken_run',
            frames: this.anims.generateFrameNumbers('chicken_run',{start:0 , end: 13}),
            frameRate: 10,
            repeat: -1
        })

        scene.anims.create({
            key: 'chicken_hit',
            frames: this.anims.generateFrameNumbers('chicken_hit',{start:0 , end: 4}),
            frameRate: 10,
            repeat: -1
        })

        this.idleAnime() 
    }
    
    // function to use

    act(board, occupiedChess) {
        if (occupiedChess._parent != board && occupiedChess._identity != this._identity) {
            occupiedChess._parent._character._life = occupiedChess._parent._character._life - this._attack
            if (occupiedChess._parent._character._life <= 0) {
                board.scene.allChessOnBoard.splice(board.scene.allChessOnBoard.indexOf(occupiedChess._parent), 1)
                occupiedChess._parent.killItself(board)
            }
            else {
                occupiedChess._parent._character.hitAnime()
            }
        }
    }

    idleAnime() {
        this.anims.play('chicken_idle',true)
    }
    
    runAnime() {
        this.anims.play('chicken_run',true)
    }

    hitAnime() {
        this.anims.play('chicken_hit',true)
    }
}

class Bat extends Phaser.GameObjects.Sprite {
    constructor(identity, scene, tileXY, parentClass, texture, frame) {
        super(scene, tileXY.x, tileXY.y, texture, frame)

        // private members
        this._cost = 3
        this._life = 3
        this._attack = 2
        this._active = "night"
        this._color = -301800
        this._identity = identity
        this._allyArea = [-69, 1, 5] // front -> center -> back  // direction -> use moveToward function, -69 is center
        this._enermyArea = [-69, 2, 4]
        this._parent = parentClass

        scene.add.existing(this)

        this.setDepth(2)
        this.scaleX = this._identity
        this.MoveBehavior = scene.rexBoard.add.moveTo(this, {
            speed: 50,
            occupiedTest: true,
            sneak: true
        })

        scene.anims.create({
            key: 'bat_idle',
            frames: this.anims.generateFrameNumbers('bat',{start:0 , end: 11}),
            frameRate: 10,
            repeat: -1
        })

        scene.anims.create({
            key: 'bat_run',
            frames: this.anims.generateFrameNumbers('bat_run',{start:0 , end: 6}),
            frameRate: 10,
            repeat: -1
        })

        scene.anims.create({
            key: 'bat_hit',
            frames: this.anims.generateFrameNumbers('bat_hit',{start:0 , end: 4}),
            frameRate: 10,
            repeat: -1
        })

        this.idleAnime() 
    }
    
    // function to use

    act(board, occupiedChess) {
        if (occupiedChess._parent != board && occupiedChess._identity != this._identity) {
            occupiedChess._parent._character._life = occupiedChess._parent._character._life - this._attack
            if (occupiedChess._parent._character._life <= 0) {
                board.scene.allChessOnBoard.splice(board.scene.allChessOnBoard.indexOf(occupiedChess._parent), 1)
                occupiedChess._parent.killItself(board)
            }
            else {
                occupiedChess._parent._character.hitAnime()
            }
        }
    }

    idleAnime() {
        this.anims.play('bat_idle',true)
    }
    
    runAnime() {
        this.anims.play('bat_run',true)
    }

    hitAnime() {
        this.anims.play('bat_hit',true)
    }
}

class Block extends RexPlugins.Board.Shape {
    constructor(board, tileXY, tileZ, color, parentBeast) {
        var scene = board.scene
        super(board, tileXY.x, tileXY.y, tileZ, color)
        this.setScale(0.95)

        this._parent = parentBeast
        this._identity = parentBeast._character._identity
        this._location = tileXY
        scene.add.existing(this)

        // add behavior
        this.MoveBehavior = scene.rexBoard.add.moveTo(this, {
            speed: 300,
            occupiedTest: true,
            sneak: true
        })
    }

    killItself(board) {
        board.removeChess(this, null, null, null, true)
    }
}