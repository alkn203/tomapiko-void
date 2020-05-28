// グローバルに展開
phina.globalize();
// スプライトシート
var SPRITE_SHEET = {
  "tomapiko_ss": {
    // フレーム情報
    "frame": {
      // 1フレームの画像サイズ（横）
      "width": 64,
      // 1フレームの画像サイズ（縦）
      "height": 64,
      // フレーム数（横）
      "cols": 6,
      // フレーム数（縦）
      "rows": 3,
    },
    // アニメーション情報
    "animations": {
      // アニメーション名
      "left": {
        // フレーム番号範囲
        "frames": [12,13,14],
        // 次のアニメーション
        "next": "left",
        // アニメーション間隔
        "frequency": 4,
      },
      "right": { 
        "frames": [15,16,17], 
        "next": "right", 
        "frequency": 4, 
      },
      "up": { 
        "frames": [9,10,11], 
        "next": "up", 
        "frequency": 4, 
      },
      "down": { 
        "frames": [6,7,8], 
        "next": "down",
        "frequency": 4,
      },
      "defeat": { 
        "frames": [4,5], 
        "frequency": 8,
      },
    }
  },
  // 爆発
  "explosions": {
    "frame": {
      "width": 64,
      "height": 64,
      "cols": 9,
      "rows": 1,
    },
    "animations": {
      // 中心
      "center": {
        "frames": [0,1,2],
        "frequency": 4,
      },
      // 途中
      "middle": {
        "frames": [3,4,5],
        "frequency": 4,
      },
      // 端
      "edge": {
        "frames": [6,7,8],
        "frequency": 4,
      },
    }
  },
};
// アセット
var ASSETS = {
  // 画像
  image: {
    'wall': 'https://cdn.jsdelivr.net/gh/alkn203/tomapiko-void@master/assets/wall.png',
    'floor': 'https://cdn.jsdelivr.net/gh/alkn203/tomapiko-void@master/assets/floor.png',
    'tomapiko': 'https://cdn.jsdelivr.net/gh/phinajs/phina.js@develop/assets/images/tomapiko_ss.png',
  },
  // スプライトシート
  spritesheet: SPRITE_SHEET
};
// 定数
var GRID_SIZE = 64;
var GRID_HALF = GRID_SIZE / 2;
/*
 * メインシーン
 */
phina.define("MainScene", {
  // 継承
  superClass: 'DisplayScene',
  // コンストラクタ
  init: function() {
    // 親クラス初期化
    this.superInit();
    // グリッド
    this.gx = Grid(640, 10);
    this.gy = Grid(960, 15);
    // 背景色
    this.backgroundColor = '#2e8b57';
    // 左の壁
    this.leftwallGroup = DisplayElement().addChildTo(this);
    // 右の壁
    this.rightwallGroup = DisplayElement().addChildTo(this);
    //
    this.createWalls();
    
    var player = Player().addChildTo(this);
    player.x = this.gx.center() + GRID_HALF;
    player.y = this.gy.span(3) + GRID_HALF;

  },
  //
  createWalls: function() {
    var self = this;
    // 左側の壁を2つ作って縦につなげる
    (2).times(function() {
      var wall = Wall().addChildTo(self.leftwallGroup);
      wall.left = 0;
    });
    
    var leftChildren = this.leftwallGroup.children;
    leftChildren.first.y = this.gy.center();
    leftChildren.last.top = leftChildren.first.bottom;
    // 右側の壁を2つ作って縦につなげる
    (2).times(function() {
      var wall = Wall().addChildTo(self.rightwallGroup);
      wall.right = self.gx.width;
    });
    var rightChildren = this.rightwallGroup.children;
    rightChildren.first.y = this.gy.center();
    rightChildren.last.top = rightChildren.first.bottom;
  },
  // 毎フレーム処理  
  update: function(app) {
    //
    this.moveWalls();
  },
  //
  moveWalls: function() {
    //
    this.leftwallGroup.children.each(function(wall) {
      //wall.y -= 4;
    });
    this.rightwallGroup.children.each(function(wall) {
      //wall.y -= 4;
    });
  }
  
});
/*
 * プレイヤークラス
 */
phina.define("Player", {
  // 継承
  superClass: 'Sprite',
  // コンストラクタ
  init: function() {
    // 親クラス初期化
    this.superInit('tomapiko', GRID_SIZE, GRID_SIZE);
    // スプライトにフレームアニメーションをアタッチ
    this.anim = FrameAnimation('tomapiko_ss').attachTo(this);
    // アニメーションを指定
    this.anim.gotoAndStop('right');
    // 移動速度
    this.speed = 4;
    //
    this.defeated = false;
    // やられイベント
    this.one('defeat', function() {
      this.defeated = true;
      this.anim.gotoAndPlay('defeat');
    }, this);
  },
});
/*
 * 壁クラス
 */
phina.define("Wall", {
  // 継承
  superClass: 'Sprite',
  // コンストラクタ
  init: function() {
    // 親クラス初期化
    this.superInit('wall');
  },
});
/*
 * 床クラス
 */
phina.define("Floor", {
  // 継承
  superClass: 'Sprite',
  // コンストラクタ
  init: function() {
    // 親クラス初期化
    this.superInit('floor');
  },
});
/*
 * メイン処理
 */
phina.main(function() {
  // アプリケーションを生成
  var app = GameApp({
    // MainScene から開始
    startLabel: 'main',
    // アセット読み込み
    assets: ASSETS,
  });
  // 実行
  app.run();
});