const AreaColor = 0xFF9E00

export default class Beast extends RexPlugins.Board.Shape {
    constructor(blockFront, blockBack, board, tileXY, type){
        var scene = board.scene
        super(board, tileXY.x, tileXY.y, 0, AreaColor)
        this.setScale(0.95)

        // private members
        this._timer
        this._parent = this
        this._location = {x:0, y:0}
        this._character = type
        this._blockArea = []
        this._enermy = []

        // add the correct beast
        board.addChess(this._character, tileXY.x, tileXY.y, 1, true)

        // add blocks
        if(blockFront.length != 0)
        {
            for(let i = 0; i < blockFront.length; i++)
            {
                this._blockArea.push(blockFront[i])
            }
        }
        this._blockArea.push(this)
        if(blockBack.length != 0)
        {
            for(let i = 0; i < blockBack.length; i++)
            {
                this._blockArea.push(blockBack[i])
            }
        }
        console.log(this._blockArea)
        for(let i = 0; i < this._blockArea.length; i++)
        {
            this._blockArea[i]._parent = this
            this._blockArea[i].setVisible(true)
            console.log(tileXY.x + this._blockArea[i]._location.x)
            console.log(tileXY.y + this._blockArea[i]._location.y)
            board.moveChess(this._blockArea[i], tileXY.x + this._blockArea[i]._location.x, tileXY.y + this._blockArea[i]._location.y, 0, true)
        }

        // add behavior
        this.MoveBehavior = scene.rexBoard.add.moveTo(this, {
            speed: 50,
            occupiedTest: true
        })

        scene.add.existing(this)

        console.log(this._character)

        this.keepMoving(board)
    }
    // function to use
    keepMoving(board) {
        // use interval
        console.log(this._character)
        setTimeout(() => {console.log(this._character)}, 0)
        this._timer = setInterval(() => {
            console.log(this._character)
            this._character.anims.play('run',true) 
            this.moveforward(board, this._character._identity)
            this._character.MoveBehavior.on('complete', function(moveTo, gameObject){
                this._character.anims.play('idle',true) 
            },this)
        }, this._character._speed)
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
                    this._character.MoveBehavior.setEnable(false)
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
                console.log(this._enermy)
            }
            this._character.MoveBehavior.moveToward(0)
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
                    this._character.MoveBehavior.setEnable(false)
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
    }

    killItself(board) {
        clearInterval(this.timer)
        this._character.killItself(board)
        for(var i=0; i<this._blockArea.length; i++)
        {
            board.removeChess(this._blockArea[i], null, null, null, true)
        }
    }
}

export class BeastBoard extends Phaser.GameObjects.Sprite {
    constructor(baseNumber, blockFront, blockBack, board, type, scene, tileXY, texture, frame) {
        super(scene, tileXY.x, tileXY.y, texture, frame)
        
        // private members
        this._character = type

        scene.add.existing(this)
        this.setDepth(2)
        
        this.drag = scene.plugins.get('rexDrag').add(this)

        console.log(this)

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
            if(tileXY.x>=0 && tileXY.x<=8 && tileXY.y>=0 && tileXY.y<=6)
            {
                this.drag.setEnable(false)
                if(this._character._identity === 1)
                {
                    scene.allyBase.splice(baseNumber, 1)
                    scene.allyChess.push(new Beast(blockFront, blockBack, board, tileXY, this._character))
                }
                else if(this._character._identity === -1)
                {
                    scene.enermyBase.splice(baseNumber, 1)
                    scene.enermyChess.push(new Beast(blockFront, blockBack, board, tileXY, this._character))
                }
                this._character.killItself(board)
            }
        })
    }
}

export class Rabbit extends Phaser.GameObjects.Sprite {
    constructor(board, identity, scene, tileXY, texture, frame) {
        super(scene, tileXY.x, tileXY.y, texture, frame)

        // private members
        this._life = 2
        this._attack = 1
        this._speed = 3000
        this._active = "day"
        this._moving = true
        this._identity = identity
        this._allyAreaFront = [{x:-1, y:1}]
        this._allyAreaBack = []
        this._enermyAreaFront = [{x:0, y:1}]
        this._enermyAreaBack = []
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