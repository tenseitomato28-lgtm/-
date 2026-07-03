/* =========================================================================
   monetize.js — 共有ボタン・投げ銭・アフィリエイト・広告を描画するエンジン
   （このファイルは編集不要。設定は config.js で行います）
   各ページで window.PAGE = { title, affiliate:[...] } を定義しておくこと。
   ========================================================================= */
(function () {
  var SITE = window.SITE || {};
  var PAGE = window.PAGE || {};
  var mount = document.getElementById("monetize");
  if (!mount) return;

  var url = location.href.split("#")[0];
  var title = PAGE.title || document.title;
  var enc = encodeURIComponent;

  var html = "";

  /* --- 記事上部などに置く広告（AdSense） --- */
  function adBlock() {
    if (!SITE.adsense || !SITE.adsense.client) return "";
    return (
      '<ins class="adsbygoogle" style="display:block" ' +
      'data-ad-client="' + SITE.adsense.client + '" ' +
      'data-ad-slot="' + (SITE.adsense.slot || "") + '" ' +
      'data-ad-format="auto" data-full-width-responsive="true"></ins>'
    );
  }

  /* --- ① シェアボタン（登録不要・すぐ機能する） --- */
  html += '<div class="mz-block">';
  html += '<span class="mz-label">この記事をシェア</span>';
  html += '<div class="mz-share">';
  html +=
    '<a class="mz-btn mz-x" target="_blank" rel="noopener" href="' +
    "https://twitter.com/intent/tweet?text=" + enc(title) + "&url=" + enc(url) +
    '">X</a>';
  html +=
    '<a class="mz-btn mz-line" target="_blank" rel="noopener" href="' +
    "https://social-plugins.line.me/lineit/share?url=" + enc(url) +
    '">LINE</a>';
  html +=
    '<a class="mz-btn mz-fb" target="_blank" rel="noopener" href="' +
    "https://www.facebook.com/sharer/sharer.php?u=" + enc(url) +
    '">Facebook</a>';
  html += '<button class="mz-btn mz-copy" type="button">リンクをコピー</button>';
  html += "</div></div>";

  /* --- ② 投げ銭・サポート --- */
  if (SITE.support && SITE.support.url) {
    html += '<div class="mz-support">';
    if (SITE.support.note) html += '<p class="mz-support-note">' + SITE.support.note + "</p>";
    html +=
      '<a class="mz-support-btn" target="_blank" rel="noopener" href="' +
      SITE.support.url + '">' + (SITE.support.label || "応援する") + "</a>";
    html += "</div>";
  }

  /* --- ③ アフィリエイト（記事ごとのおすすめ品） --- */
  if (PAGE.affiliate && PAGE.affiliate.length) {
    html += '<div class="mz-aff"><span class="mz-label">この記事に登場したもの</span><div class="mz-aff-grid">';
    PAGE.affiliate.forEach(function (item) {
      var link = item.url;
      if (SITE.amazonTag && link.indexOf("amazon.co.jp") > -1) {
        link += (link.indexOf("?") > -1 ? "&" : "?") + "tag=" + SITE.amazonTag;
      }
      html +=
        '<a class="mz-aff-card" target="_blank" rel="noopener sponsored" href="' + link + '">' +
        '<span class="mz-aff-name">' + item.name + "</span>" +
        (item.desc ? '<span class="mz-aff-desc">' + item.desc + "</span>" : "") +
        "</a>";
    });
    html += "</div><span class=\"mz-pr\">※ 広告・アフィリエイトリンクを含みます</span></div>";
  }

  mount.innerHTML = html;

  /* リンクコピー */
  var copyBtn = mount.querySelector(".mz-copy");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(url).then(function () {
        copyBtn.textContent = "コピーしました";
        setTimeout(function () { copyBtn.textContent = "リンクをコピー"; }, 1800);
      });
    });
  }

  /* AdSense を記事上部に注入 */
  if (SITE.adsense && SITE.adsense.client) {
    var slot = document.getElementById("ad-top");
    if (slot) {
      slot.innerHTML = adBlock();
      var s = document.createElement("script");
      s.async = true;
      s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + SITE.adsense.client;
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }
})();
