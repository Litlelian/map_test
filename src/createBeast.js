const DayColor = 0xFFBF00
const NightColor = 0x0047AB

export default class Beast extends Phaser.GameObjects.Sprite {
    constructor(baseNumber, identity, board, beastID, scene, tileXY, texture, frame) {
        super(scene, tileXY.x, tileXY.y, texture, frame)

        // private properties
        this._moving = false
        this._character
        this._blockArea = []
        this._enermy = []

        // choose correct character
        switch(beastID) {
            case "000000":
                this._character = new Rabbit(identity, scene, tileXY, this)
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
            this._character.anims.play('run',true)
        })

        this.on('dragend', function(pointer, dragX, dragY){ 
            var tileXY = board.worldXYToTileXY(this.x, this.y)
            this._character.anims.play('idle',true)
            if(this.testIfChessCanPut(board, tileXY, identity))
            {
                this.drag.setEnable(false)
                if(this._character._identity === 1)
                {
                    scene.allyHand.splice(baseNumber, 1, new Beast(baseNumber, 1, board, scene.allyDeck.shift(), scene, {x:500 + baseNumber * 100, y:500}))
                    scene.allChessOnBoard.push(this)
                    this.createTerritory(board, tileXY, 1)
                    board.addChess(this._character, tileXY.x, tileXY.y, 1, true)
                    this._moving = true
                    //this.keepMoving(board)
                }
                else if(this._character._identity === -1)
                {
                    scene.enermyHand.splice(baseNumber, 1, new Beast(baseNumber, -1, board, scene.enermyDeck.shift(), scene, {x:100 + baseNumber * 100, y:500}))
                    scene.allChessOnBoard.push(this)
                    this.createTerritory(board, tileXY, -1)
                    board.addChess(this._character, tileXY.x, tileXY.y, 1, true)
                    this._moving = true
                    //this.keepMoving(board)
                }
            }
            else
            {
                this.x = 300 + 200 * this._character._identity + baseNumber * 100
                this.y = 500
                this._character.x = 300 + 200 * this._character._identity + baseNumber * 100
                this._character.y = 500
                this._character.anims.play('idle',true)
            }
        })
    }
    // function to use
    keepMoving(board) {
        // use interval
        var scene = board.scene
        scene.timer = setInterval(() => {
            if(this._moving)
            {
                this._character.anims.play('run',true) 
                this.moveforward(board, this._character._identity)
                this._character.MoveBehavior.on('complete', function(moveTo, gameObject){
                    this._character.anims.play('idle',true) 
                },this)
            }
        }, this._character._speed)
    }

    moveforward(board, AllyOrEnermy) {
        var ifOccupy = 0 // if it's zero, it means no block occupy
        if(AllyOrEnermy === -1) // enermy
        {// move to right
            for(let i = 0; i < this._blockArea.length; i++)
            {
                var neighborTileXY = board.getNeighborTileXY(this._blockArea[i]._location, 0)
                var neighborChessArray = board.tileXYToChessArray(neighborTileXY.x, neighborTileXY.y)
                if(neighborChessArray.length && neighborChessArray[0]._parent != this && neighborChessArray[0]._identity != this._character._identity)
                {
                    this._enermy.push(neighborChessArray[0])
                    ifOccupy++
                    for(let i = 0; i < this._enermy.length-1; i++)
                    {
                        if(neighborChessArray[0]._parent === this._enermy[i]._parent)
                        {
                            this._enermy.pop()
                            ifOccupy--
                            break
                        }
                    }
                }
            }
            if(!ifOccupy)
            {
                for(let i = 0; i < this._blockArea.length; i++)
                {
                    this._blockArea[i].MoveBehavior.moveToward(0)
                    var blockSituation = board.chessToTileXYZ(this._blockArea[i])
                    this._blockArea[i]._location = {x:blockSituation.x, y:blockSituation.y}
                }
                this._character.MoveBehavior.moveToward(0)
            }
            else
            {
                this._moving = false
            }
        }
        if(AllyOrEnermy === 1) // ally
        {// move to left
            for(let i = 0; i < this._blockArea.length; i++)
            {
                var neighborTileXY = board.getNeighborTileXY(this._blockArea[i]._location, 3)
                var neighborChessArray = board.tileXYToChessArray(neighborTileXY.x, neighborTileXY.y)
                if(neighborChessArray[0] && neighborChessArray[0]._parent != this && neighborChessArray[0]._identity != this._character._identity)
                {
                    this._enermy.push(neighborChessArray[0])
                    ifOccupy++
                    for(let i = 0; i < this._enermy.length-1; i++)
                    {
                        if(neighborChessArray[0]._parent === this._enermy[i]._parent)
                        {
                            this._enermy.pop()
                            break
                        }
                    }
                }
            }
            if(!ifOccupy)
            {
                for(let i = 0; i < this._blockArea.length; i++)
                {
                    this._blockArea[i].MoveBehavior.moveToward(3)
                    var blockSituation = board.chessToTileXYZ(this._blockArea[i])
                    this._blockArea[i]._location = {x:blockSituation.x, y:blockSituation.y}
                }
                this._character.MoveBehavior.moveToward(3)
            }
            else
            {
                this._moving = false
            }
        }
        var checkEnermyHasCrystal = 0 // if it's zero, it means no crystal be touched
        for(let i = 0; i < this._enermy.length; i++)
        {
            if(this._enermy[i]._parent === board) // occupied by Crystal
            {
                this._enermy[i].killItself(board)
                checkEnermyHasCrystal ++
            }
            else if(this._enermy[i]._parent != "boundary")
            {
                this._character.act(board, this._enermy[i])
            }
        }
        if(checkEnermyHasCrystal)
        {
            this.killItself(board)
        }
    }

    createTerritory(board, tileXY, identity) // add blocks
    {
        var blockColor
        var centerIndex = 0
        if(identity === 1)
        {
            blockColor = DayColor + this._character._color
            for(let i = 0; i < this._character._allyArea.length; i++)
            {
                this._blockArea.push(new Block(board, tileXY, -1, blockColor, this))
                if(this._character._allyArea[i] != -69)
                {
                    this._blockArea[i].rexChess.setTileZ(0)
                    this._blockArea[i].MoveBehavior.moveToward(this._character._allyArea[i])
                    .on('complete', function(moveTo, gameObject){
                        this._blockArea[i].MoveBehavior.setSpeed(50)
                    }, this)
                    var blockSituation = board.chessToTileXYZ(this._blockArea[i])
                    this._blockArea[i]._location = {x:blockSituation.x, y:blockSituation.y}
                }
                else
                {
                    centerIndex = i
                    this._blockArea[i].rexChess.setTileZ(-2)
                }
            }
        }
        else if(identity === -1)
        {
            blockColor = NightColor + this._character._color
            for(let i = 0; i < this._character._enermyArea.length; i++)
            {
                this._blockArea.push(new Block(board, tileXY, -1, blockColor, this))
                if(this._character._enermyArea[i] != -69)
                {
                    this._blockArea[i].rexChess.setTileZ(0)
                    this._blockArea[i].MoveBehavior.moveToward(this._character._enermyArea[i])
                    .on('complete', function(moveTo, gameObject){
                        this._blockArea[i].MoveBehavior.setSpeed(50)
                    }, this)
                    var blockSituation = board.chessToTileXYZ(this._blockArea[i])
                    this._blockArea[i]._location = {x:blockSituation.x, y:blockSituation.y}
                }
                else
                {
                    centerIndex = i
                    this._blockArea[i].rexChess.setTileZ(-2)
                }
            }
        }
        this._blockArea[centerIndex].rexChess.setTileZ(0)
        this._blockArea[centerIndex].MoveBehavior.setSpeed(50)
    }

    testIfChessCanPut(board, tileXY, identity) //test if the chess can put on what user want
    {
        if(tileXY.x>=0 && tileXY.x<=8 && tileXY.y>=0 && tileXY.y<=6)
        {
            var undefinedColor
            var testBlock = []
            if(identity === 1)
            {
                for(let i = 0; i < this._character._allyArea.length; i++)
                {
                    testBlock.push(new Block(board, tileXY, -3, undefinedColor, this))
                    if(this._character._allyArea[i] != -69)
                    {
                        testBlock[i].rexChess.setTileZ(-2)
                        testBlock[i].MoveBehavior.moveToward(this._character._allyArea[i])
                        var blockSituation = board.chessToTileXYZ(testBlock[i])
                        testBlock[i]._location = {x:blockSituation.x, y:blockSituation.y}
                        if(board.tileXYZToChess(blockSituation.x, blockSituation.y, 0) || board.tileXYZToChess(blockSituation.x, blockSituation.y, -4)){
                            for(let i = 0; i < testBlock.length; i++)
                            {
                                board.removeChess(testBlock[i], null, null, null, true)
                            }
                            return false
                        }
                    }
                    else
                    {
                        testBlock[i].rexChess.setTileZ(-4)
                        if(board.tileXYZToChess(tileXY.x, tileXY.y, 0) || board.tileXYZToChess(tileXY.x, tileXY.y, -2))
                        {
                            for(let i = 0; i < testBlock.length; i++)
                            {
                                board.removeChess(testBlock[i], null, null, null, true)
                            }
                            return false
                        }
                    }
                }
            }
            else if(identity === -1)
            {
                for(let i = 0; i < this._character._enermyArea.length; i++)
                {
                    testBlock.push(new Block(board, tileXY, -3, undefinedColor, this))
                    if(this._character._enermyArea[i] != -69)
                    {
                        testBlock[i].rexChess.setTileZ(-2)
                        testBlock[i].MoveBehavior.moveToward(this._character._enermyArea[i])
                        var blockSituation = board.chessToTileXYZ(testBlock[i])
                        testBlock[i]._location = {x:blockSituation.x, y:blockSituation.y}
                        if(board.tileXYZToChess(blockSituation.x, blockSituation.y, 0) || board.tileXYZToChess(blockSituation.x, blockSituation.y, -4)){
                            for(let i = 0; i < testBlock.length; i++)
                            {
                                board.removeChess(testBlock[i], null, null, null, true)
                            }
                            return false
                        }
                    }
                    else
                    {
                        testBlock[i].rexChess.setTileZ(-4)
                        if(board.tileXYZToChess(tileXY.x, tileXY.y, 0) || board.tileXYZToChess(tileXY.x, tileXY.y, -2))
                        {
                            for(let i = 0; i < testBlock.length; i++)
                            {
                                board.removeChess(testBlock[i], null, null, null, true)
                            }
                            return false
                        }
                    }
                }
            }
            
            // make sure there at least one block close to another ally unit
            var numberCloseOtherUnit = 0
            for(let i = 0; i < testBlock.length; i++)
            {
                var neighborTileXY = board.getNeighborTileXY(testBlock[i]._location, null)
                for(let j = 0; j < neighborTileXY.length; j++)
                {
                    var neighborChessArray = board.tileXYToChessArray(neighborTileXY[j].x, neighborTileXY[j].y)
                    if(neighborChessArray.length && neighborChessArray[0]._parent != this && neighborChessArray[0]._identity === this._character._identity)
                    {
                        numberCloseOtherUnit++
                    }
                }
            }

            for(let i = 0; i < testBlock.length; i++)
            {
                board.removeChess(testBlock[i], null, null, null, true)
            }

            if(numberCloseOtherUnit)
            {
                return true
            }
            else
            {
                return false
            }
        }
        return false
    }

    killItself(board)
    {
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
        this._speed = 3000
        this._active = "day"
        this._color = -331469
        this._identity = identity
        this._allyArea = [2, -69, 0] // front -> center -> back  // direction -> use moveToward function, -69 is center
        this._enermyArea = [1, -69, 3]
        this._parent = parentClass
        this.timer

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
        //board.removeChess(this, null, null, null, true)
    }

    act(board, occupiedChess) {
        if(occupiedChess._parent != board && occupiedChess._parent != "boundary" && occupiedChess._identity != this._identity)
        {
            occupiedChess._parent._moving = false
            occupiedChess._parent._character._life = occupiedChess._parent._character._life - this._attack
            if(occupiedChess._parent._character._life <= 0)
            {
                occupiedChess._parent.killItself(board)
            }
            else
            {
                occupiedChess._parent._character.anims.play('hit',true)
            }
            this._parent._moving = true
        }
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
            occupiedTest: true
        })
    }

    killItself(board) {
        board.removeChess(this, null, null, null, true)
    }
}