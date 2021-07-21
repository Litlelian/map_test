// no use

import Phaser from 'phaser'
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin.js'

import bunny1 from './assets/bunny1.png'
import bunny2 from './assets/bunny2.png'


class Demo extends Phaser.Scene {
  constructor() {
    super({ key: 'app' })
  }
  preload() {
    this.load.spritesheet('bunny',bunny1,{frameWidth:34,frameHeight:44})
    this.load.spritesheet('bunny_run',bunny2,{frameWidth:34,frameHeight:44})
  }
  create() {
    this.player = this.add.sprite(300,400,'bunny')
    var p = this.player
    this.player.setDepth(2)
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('bunny',{start:0 , end: 7}),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('bunny_run',{start:0 , end: 11}),
      frameRate: 10,
      repeat: -1
    })
    this.player.anims.play('idle',true)
    var rabbit = this.rexBoard.add.moveTo(p, {
      speed: 100
    })
    var rabbit_path = this.rexBoard.add.pathFinder(p,{
      occupiedTest: true
    })
    rabbit_path.setChess(p)
    var print = this.add.text(0, 0, 'Click any tile')
    var staggeraxis = 'x'
    var staggerindex = 'odd'
    //const self = this
    var board = this.rexBoard.add.board({
      grid: {
        gridType: 'hexagonGrid',
        x: 60,
        y: 60,
        size: 30,
        staggeraxis: staggeraxis,
        staggerindex: staggerindex
      }
    })
    console.log(board)
    
    board.setInteractive()
    board.on('tiledown', function(pointer, tileXY){
      console.log(this)
      print.text = `${tileXY.x},${tileXY.y}`
      //board.moveChess(p, tileXY.x, tileXY.y, 0, true)
      var tileXYArray = rabbit_path.findPath(tileXY)
      p.anims.play('run',true)
      //movealong(rabbit, tileXYArray, 0)
      ;(async function (){
        for(let i = 0; i < tileXYArray.length; i++)
        {
          console.log(i)
          await new Promise(resolve =>
              {
                rabbit.moveTo(tileXYArray[i].x, tileXYArray[i].y).on('complete', resolve)}
            )
        }
        p.anims.play('idle',true)
      })()
    })

    var tileXYArray = board.fit(this.rexBoard.hexagonMap.hexagon(board, 4));
    var graphics = this.add.graphics({
      lineStyle: {
        width: 3,
        color: 0xffffff,
        alpha: 1
      } 
    })  
    var tileXY, worldXY
    for (var i in tileXYArray) {
      tileXY = tileXYArray[i]
        graphics.strokePoints(board.getGridPoints(tileXY.x, tileXY.y, true), true)
        worldXY = board.tileXYToWorldXY(tileXY.x, tileXY.y)
        this.add.text(worldXY.x, worldXY.y, `${tileXY.x},${tileXY.y}`).setOrigin(0.5)
    }
    board.addChess(p, 9, 4, 1, true)
  }
  /* update(){
    var p = this.player
    document.onkeydown = function(e){
      if(e.keyCode == 37)
      {
        p.scaleX = 1
        p.anims.play('run',true)
        p.x -= 3
      }
      if(e.keyCode == 39)
      {
        p.scaleX = -1
        p.anims.play('run',true)
        p.x += 3
      }
      if(e.keyCode == 38)
      {
        p.anims.play('run',true)
        p.y -= 3
      }
      if(e.keyCode == 40)
      {
        p.y += 3
        p.anims.play('run',true)
      }
    }
    document.onkeyup = function(e){
      if(e.keyCode == 37)
      {
        p.scaleX = 1
        p.anims.play('idle',true)
      }
      if(e.keyCode ==39)
      {
        p.scaleX = -1
        p.anims.play('idle',true)
      }if(e.keyCode == 38)
      {
        p.anims.play('idle',true)
      }
      if(e.keyCode == 40)
      {
        p.anims.play('idle',true)
      }
    }
  }*/
}

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      //gravity: { y: 200 }
    }
  },
  scene: Demo,
  plugins: {
    scene: [{
      key: 'rexBoard',
      plugin: BoardPlugin,
      mapping: 'rexBoard'
    }]
  }
};

var game = new Phaser.Game(config);
