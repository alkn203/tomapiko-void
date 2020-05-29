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
    
    Floor().addChildTo(this.floorGroup).setPosition(this.gx.center(), this.gy.span(4) + GRID_HALF);

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
          player.reflectX();
        }
        else {
          if (!this.collisionY()) {
            player.moveY();
            player.verticalState = 'FALLING';
          }
        }
        break;
      // ジャンプ中
      case 'JUMPING':
        // 落下
        if (player.vy > 0) {
          player.verticalState = 'FALLING';
        }
        else {
          player.moveY();
        }
        break;
      // 落下中  
      case 'FALLING':
        // ヒットしたら立たせる
        if (this.collisionY()) {
          player.vy = 0;
          player.verticalState = 'STANDING';
          player.anim.gotoAndPlay('left');
        }
        else {
          player.moveY();
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
    //
    if (rect.left < GRID_SIZE) {
      player.left = GRID_SIZE;
      player.reflectX();
    }
    //
    var edgeR = this.gx.width - GRID_SIZE;
    if (rect.right > edgeR) {
      player.right = edgeR;
      player.reflectX();
    }
  },
  // 縦方向の当たり判定
  collisionY: function() {
    var player = this.player;
    // 床に乗っている場合は強引に当たり判定を作る
    var vy = player.vy === 0 ? 4: player.vy;
    // 当たり判定用の矩形
    var rect = Rect(player.left, player.top + vy, player.width, player.height);
    var result = false;
    // ブロックグループをループ
    this.floorGroup.children.some(function(obj) {
      // ブロックとのあたり判定
      if (Collision.testRectRect(rect, obj)) {
        // 上から
        if (rect.y < obj.y) player.bottom = obj.top;
        
        result = true;
        return true;
      }
    });
    return result;
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
    this.anim.gotoAndPlay('left');
    //
    this.scaleX *= -1;
    // 横移動速度
    this.vx = PLAYER_SPEED;
    // 縦移動速度
    this.vy = 0;
    // 横方向の状態
    this.horizontalState = 'MOVING_RIGHT';
    // 縦方向の状態
    this.verticalState = 'FALLING';
  },
  // 横方向移動
  moveX: function() {
    this.x += this.vx;
  },
  // 縦方向移動
  moveY: function() {
    this.vy += GRAVITY;
    this.y += this.vy;
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