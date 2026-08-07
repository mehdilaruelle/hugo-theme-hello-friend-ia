+++
title = "GIF のあった場所に動画を"
description = "video ショートコード。数メガバイトにならない画面録画"
date = "2026-01-24"
type = ["posts","post"]
tags = ["hugo"]
categories = ["Development"]
series = ["Showcase"]
[author]
  name = "Jane Doe"
+++

アニメーション GIF は画面録画の配り方として出来がよくありません。数秒の動きが
数メガバイトになり、しかも読者はそれを止められません。11 秒・3840×2160 の実際
の録画で測ったところ、こうなりました。

| ファイル | サイズ |
| --- | --- |
| `demo.gif` | 4248 Ko |
| `demo.mp4` | 366 Ko |
| `demo.webm` | 290 Ko |

`video` ショートコードは拡張子を除いたパスを取り、形式ごとに `<source>` を
出力します。ブラウザは再生できる最初のものを選びます。

{{< video src="/video/demo" poster="/video/demo.jpg" width="640" height="360" alt="ループするテストパターン" >}}

置き換える対象の GIF と同じく、音を出さず自動で再生し、繰り返します。記事の
読み心地は変わりません。読者が止めたくなる長さの場合は `controls="true"` を
渡します。GIF では決してできなかったことです。

{{< video src="/video/demo" poster="/video/demo.jpg" width="640" height="360" controls="true" alt="テストパターン" >}}

`width` と `height` は画像のとき以上に重要です。動画は読み込まれるまで固有の
大きさを持たないので、これがないと到着した瞬間にページが跳ねます。その間、枠を
埋めるのが `poster` です。

Hugo にこれに当たる組み込みショートコードはありません。`youtube` と `vimeo` は
ありますが、あれは他人のプレーヤーを埋め込むものです。自分で置いたファイルの
ためのものは用意されていません。
