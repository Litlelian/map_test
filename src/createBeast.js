const DayColor = 0xFFBF00
const NightColor = 0x0047AB

export default class Beast extends Phaser.GameObjects.Sprite {
    constructor(baseNumber, identity, board, beastID, scene, tileXY, texture, frame) {
        super(scene, tileXY.x, tileXY.y, texture, frame)

        // private properties
        this._moving = true
        this._character
        this._blockArea = []
        this._enermy = []

        // choose correct character
        switch(beastID) {
            case "000000":
                this._character = new Rabbit(identity, scene, tileXY)
                break
            default:
                this._character = new Rabbit(identity, scene, tileXY)
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
                    this.createTerritory(board, tileXY, 1)
                    board.addChess(this._character, tileXY.x, tileXY.y, 1, true)
                    this.keepMoving(board)
                }
                else if(this._character._identity === -1)
                {
                    scene.enermyHand.splice(baseNumber, 1, new Beast(baseNumber, -1, board, scene.enermyDeck.shift(), scene, {x:100 + baseNumber * 100, y:500}))
                    this.createTerritory(board, tileXY, -1)
                    board.addChess(this._character, tileXY.x, tileXY.y, 1, true)
                    this.keepMoving(board)
                }
                this._character.killItself(board)
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
        //var tileXYZ = board.chessToTileXYZ(this)
        if(AllyOrEnermy === -1) // enermy
        {// move to right
            for(let i = 0; i < this._blockArea.length; i++)
            {
                this._blockArea[i].MoveBehavior.on('occupy', function(occupiedChess, thischess){
                    this._moving = false
                    this._character.anims.play('idle',true) 
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
            }
            this._character.MoveBehavior.moveToward(0)
        }
        if(AllyOrEnermy === 1) // ally
        {// move to left
            for(let i = 0; i < this._blockArea.length; i++)
            {
                this._blockArea[i].MoveBehavior.on('occupy', function(occupiedChess, thischess){
                    this._moving = false
                    this._character.anims.play('idle',true) 
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
            this._character.MoveBehavior.moveToward(3)
        }
        for(let i = 0; i < this._enermy.length; i++)
        {
            if(this._enermy[i]._parent === board)
            {
                this._enermy[i].killItself(board)
            }
            else
            {
                this._character.act(board, this._enermy[i])
            }
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
                        console.log(board.tileXYZToChess(blockSituation.x, blockSituation.y, -3))
                        if(board.tileXYZToChess(blockSituation.x, blockSituation.y, 0) || board.tileXYZToChess(blockSituation.x, blockSituation.y, -3)){
                            for(let i = 0; i < testBlock.length; i++)
                            {
                                board.removeChess(testBlock.pop(), null, null, null, true)
                            }
                            return false
                        }
                    }
                    else
                    {
                        if(board.tileXYZToChess(tileXY.x, tileXY.y, 0) || board.tileXYZToChess(tileXY.x, tileXY.y, -2))
                        {
                            for(let i = 0; i < testBlock.length; i++)
                            {
                                board.removeChess(testBlock.pop(), null, null, null, true)
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
                        if(board.tileXYZToChess(blockSituation.x, blockSituation.y, 0)){
                            for(let i = 0; i < testBlock.length; i++)
                            {
                                board.removeChess(testBlock[i], null, null, null, true)
                            }
                            return false
                        }
                    }
                    else
                    {
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
            // var numberCloseOtherUnit = 0
            // for(let i = 0; i < testBlock.length; i++)
            // {
            //     var neighborTileXY = board.getNeighborTileXY(testBlock[i]._location, null)
            //     for(let j = 0; j < neighborTileXY.length; j++)
            //     {
            //         var neighborChessArray = board.tileXYToChessArray(neighborTileXY[j].x, neighborTileXY[j].y)
            //         console.log(i + " "+ j)
            //         console.log(neighborTileXY)
            //         console.log(neighborChessArray)
            //         if(neighborChessArray.length && neighborChessArray[0]._parent != this)
            //         {
            //             numberCloseOtherUnit++
            //         }
            //     }
            // }

            for(let i = 0; i < testBlock.length; i++)
            {
                board.removeChess(testBlock[i], null, null, null, true)
            }

            return true

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
}

class Rabbit extends Phaser.GameObjects.Sprite {
    constructor(identity, scene, tileXY, texture, frame) {
        super(scene, tileXY.x, tileXY.y, texture, frame)

        // private members
        this._life = 2
        this._attack = 2
        this._speed = 3000
        this._active = "day"
        this._color = -331469
        this._identity = identity
        this._allyArea = [2, -69, 0] // front -> center -> back  // direction -> use moveToward function, -69 is center
        this._enermyArea = [1, -69]
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
        // judge itself live or not
        if(this._life <= 0)
        {
            // add Voice Of Death here
            this.killItself(board) 
        }
        else
        {
            occupiedChess._character.anims.play('hit',true)
            occupiedChess._character._life = occupiedChess._character._life - this._attack
        }
    }
}

class Block extends RexPlugins.Board.Shape {
    constructor(board, tileXY, tileZ, color, parentBeast) {
        var scene = board.scene
        super(board, tileXY.x, tileXY.y, tileZ, color)
        this.setScale(0.95)

        this._parent = parentBeast
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