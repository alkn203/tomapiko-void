// グローバルに展開
phina.globalize();
// アセット
var ASSETS = {
  // 画像
  image: {
    'wall': 'https://cdn.jsdelivr.net/gh/alkn203/tomapiko-void@master/assets/wall.png',
    'floor': 'https://cdn.jsdelivr.net/gh/alkn203/tomapiko-void@master/assets/floor.png',
    'tomapiko': 'https://cdn.jsdelivr.net/gh/phinajs/phina.js@develop/assets/images/tomapiko_ss.png',
  },
  // スプライトシート
  spritesheet: {
    'tomapiko_ss': 'https://cdn.jsdelivr.net/gh/phinajs/phina.js@develop/assets/tmss/tomapiko.tmss',
  },
};
// 定数
var GRID_SIZE     = 64;
var GRID_HALF     = GRID_SIZE / 2;
var GRAVITY       = 9.8 / 18; // 重力
var PLAYER_SPEED  = 4;
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
    // 床
    this.floorGroup = DisplayElement().addChildTo(this);
    // 左の壁
    this.leftwallGroup = DisplayElement().addChildTo(this);
    // 右の壁
    this.rightwallGroup = DisplayElement().addChildTo(this);
    //
    this.createWalls();
    
    this.player = Player().addChildTo(this);
    this.player.x = this.gx.center() + GRID_HALF;
    this.player.y = this.gy.span(3) + GRID_HALF;
    
    var floor = Floor().addChildTo(this.floorGroup);
    floor.setPosition(this.gx.center(3), this.gy.span(4) + GRID_HALF);
    var floor2 = Floor().addChildTo(this.floorGroup);
    floor2.setPosition(this.gx.center(-3), this.gy.span(8) + GRID_HALF);

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
    this.player.moveX();
    this.collisionX();
    this.checkVerticalState(app);
  },
  // 縦方向の状態チェック
  checkVerticalState: function(app) {
    var player = this.player;
    var state = this.player.verticalState;
    var p = app.pointer;
    // プレイヤーの状態で分ける
    switch (state) {
      // 立っている
      case 'STANDING':
        // タッチ開始
        if (p.getPointingStart()) {
          // 反転移動
          player.reflectX();
        }
        else {
          if (!this.collisionY()) {
            this.scrollY();
            player.verticalState = 'FALLING';
          }
        }
        break;
      // 落下中  
      case 'FALLING':
        // ヒットしたら立たせる
        if (this.collisionY()) {
          this.stopY();
          player.verticalState = 'STANDING';
        }
        else {
          this.scrollY();
        }
        break;
    }    
  },
  // 横方向の当たり判定
  collisionX: function() {
    var player = this.player;
    var vx = player.vx;
    // 当たり判定用の矩形
    var rect = Rect(player.left + vx, player.top, player.width, player.height);
    // 左端
    if (rect.left < GRID_SIZE) {
      player.left = GRID_SIZE;
      // 移動反転
      player.reflectX();
    }
    // 右端
    var edgeR = this.gx.width - GRID_SIZE;
    if (rect.right > edgeR) {
      player.right = edgeR;
      player.reflectX();
    }
  },
  // 縦方向の当たり判定
  collisionY: function() {
    var player = this.player;
    var result = false;
    // 床グループをループ
    this.floorGroup.children.some(function(floor) {
      // 床に乗っている場合は強引に当たり判定を作る
      var vy = floor.vy === 0 ? -4: -floor.vy;
      // 当たり判定用の矩形
      var rect = Rect(floor.left, floor.top + vy, floor.width, floor.height);
      // 床とのあたり判定
      if (Collision.testRectRect(rect, player)) {
        player.bottom = floor.top;
        result = true;
        return true;
      }
    });
    return result;
  },
  //
  scrollY: function() {
    //
    this.leftwallGroup.children.each(function(wall) {
      wall.moveY();
    });
    this.rightwallGroup.children.each(function(wall) {
      wall.moveY();
    });
    this.floorGroup.children.each(function(floor) {
      floor.moveY();
    });
  },
  //
  stopY: function() {
    //
    this.leftwallGroup.children.each(function(wall) {
      wall.vy = 0;
    });
    this.rightwallGroup.children.each(function(wall) {
      wall.vy = 0;
    });
    this.floorGroup.children.each(function(floor) {
      floor.vy = 0;
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
    this.anim.gotoAndPlay('left');
    // 画像反転
    this.scaleX *= -1;
    // 横移動速度
    this.vx = PLAYER_SPEED;
    // 縦方向の状態
    this.verticalState = 'FALLING';
  },
  // 横方向移動
  moveX: function() {
    this.x += this.vx;
  },
  // 反転処理
  reflectX: function() {
    this.vx *= -1;
    this.scaleX *= -1;
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
    //
    this.vy = 0;
  },
  // 縦方向移動
  moveY: function() {
    this.vy += GRAVITY;
    this.y -= this.vy;
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
    //
    this.vy = 0;
  },
  // 縦方向移動
  moveY: function() {
    this.vy += GRAVITY;
    this.y -= this.vy;
  },
});
/*
 * メイン処理
 */
phina.main(function() {
  // アプリケーションを生成
  var app = GameApp({
    // MainScene から開始
    //startLabel: 'main',
    // アセット読み込み
    assets: ASSETS,
  });
  // 実行
  app.run();
});