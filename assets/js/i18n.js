const TRANSLATIONS = {
  ja: {
    meta: {
      locale: "ja_JP",
    },
    nav: {
      register: "登録",
      visualize: "可視化",
      nearest: "近い人",
      settings: "設定",
    },
    common: {
      notSet: "未設定",
      unnamed: "(無名)",
      centroid: "平均中心",
      cluster: "クラスタ",
      clusterNumber: "クラスタ {index}",
      selectPrompt: "選択してください",
      dataInsufficient: "データが不足しています。",
      importConfirm: "現在のデータを上書きします。続行しますか？",
      imported: "インポートしました。",
      importFailed: "インポートに失敗しました: {error}",
      exportJson: "JSONを保存",
      importJson: "JSONを読み込む",
      saveAnalysisJson: "分析JSONを保存",
      highSimilarity: "一致度が高い",
    },
    errors: {
      invalidJson: "JSONの形式が不正です。",
      missingFields: "people または ratings が不足しています。",
    },
    index: {
      title: "Relativum - 登録と評価",
      description: "簡易10問・詳細60問で相対的な位置関係を可視化するための、個人向けプライベートツール。",
      tagline: "簡易10問・詳細60問で相対的な位置関係を可視化するための、個人向けプライベートツール。",
      peopleManager: "人の管理",
      addPersonPlaceholder: "名前 (Aさん)",
      addPersonAria: "新しい人の名前",
      addPersonButton: "追加",
      localSaveNote: "登録した人はローカルに保存されます。",
      answerSection: "質問への回答",
      personLabel: "対象の人",
      modeLabel: "モード",
      progress: "回答: {answered}/{total}",
      footer: "Relativum — ローカル保存 / GitHub Pages",
      emptyPeople: "まだ登録がありません。",
      nameAria: "{name} の名前",
      notesPlaceholder: "メモ (任意)",
      answerButton: "回答する",
      deleteButton: "削除",
      deleteConfirm: "この人を削除しますか？",
      selectPersonFirst: "先に対象の人を選択してください。",
      modeSimple: "簡易モード (10問)",
      modeDetailed: "詳細モード (60問)",
      ratingPositive: "+1 思う",
      ratingNegative: "-1 思わない",
      ratingUnknown: "0 わからない",
      ratingUnanswered: "未回答",
      nameRequired: "名前を入力してください。",
      added: "追加しました。",
    },
    settings: {
      title: "Relativum - 設定",
      description: "自己設定・重み・アクセシビリティ。",
      tagline: "自己設定・重み・アクセシビリティ。",
      selfSection: "自己の設定",
      selfLabel: "自己",
      selfNote: "自己を原点にした可視化が可能です。",
      accessibility: "アクセシビリティ",
      reduceMotion: "Reduce motion",
      highContrast: "High contrast",
      themeLabel: "テーマ",
      themeSystem: "端末の設定に合わせる",
      themeLight: "ライト",
      themeDark: "ダーク",
      fontSize: "文字サイズ",
      languageLabel: "言語",
      languageAuto: "自動 (端末)",
      languageJapanese: "日本語",
      languageEnglish: "English",
      analysisSection: "分析設定",
      minAnswers: "最小回答数",
      stabilityWins: "k安定化回数",
      participationScaling: "参加度スケーリング (Polis-style)",
      pcaNote:
        "PC1〜PC3は回答傾向を要約した主成分の軸です。PC1が最も大きなばらつきを表し、PC2/PC3は直交する補助軸。符号や向きに絶対的な意味はなく、点同士の相対距離が近いほど回答傾向が近いことを示します。",
      customQuestions: "カスタム質問",
      customPlaceholder: "質問文",
      addCustom: "追加",
      customNote: "ローカルに保存され、分析に含まれます。",
      weights: "設問の重み (0〜2)",
      reset: "リセット",
      resetButton: "ローカルデータを初期化",
      resetWarning: "この操作は取り消せません。",
      footer: "Relativum — 設定 / © 2026 Relativum /",
      githubRepo: "GitHub リポジトリ",
      customEmpty: "カスタム質問はまだありません。",
      weightAria: "{id} 重み",
      questionAria: "{id} 質問文",
      deleteCustom: "削除",
      confirmDeleteCustom: "このカスタム質問を削除しますか？",
      confirmReset: "ローカルデータをすべて削除しますか？",
    },
    viz: {
      title: "Relativum - 可視化",
      description: "Polis-style PCA & クラスタで相対的な距離を確認。",
      tagline: "Polis-style PCA & クラスタで相対的な距離を確認。",
      displayOptions: "表示オプション",
      axisLabel: "2D 軸",
      show3d2d: "3D/2Dを同時表示",
      originLabel: "原点 (self)",
      showLabels: "ラベル表示",
      pointSize: "点サイズ",
      saveAnalysis: "分析JSONを保存",
      importJson: "JSONを読み込む",
      analysisWarning: "回答数が不足している人は除外されています。",
      pcaNote:
        "PC1〜PC3は回答傾向を要約した主成分の軸です。PC1が最も大きなばらつきを表し、PC2/PC3は直交する補助軸。符号や向きに絶対的な意味はなく、点同士の相対距離が近いほど回答傾向が近いことを示します。",
      vizTitle: "3D / 2D 可視化",
      canvas3d: "3D (PC1/PC2/PC3)",
      canvas2d: "2D 投影",
      controlsNote: "ドラッグで回転 / スクロールでズーム。形状でクラスタを区別。",
      detailsLabel: "詳細",
      tableTitle: "代替テーブル (アクセシビリティ)",
      tableName: "名前",
      tableCluster: "Cluster",
      footer: "Relativum — PCA + k-means++",
      originSet: "原点 = {name}",
      originUnset: "self 未設定の場合は原点は平均中心",
      summary:
        "対象 {included}人 / 除外 {excluded}人 · クラスタ k={k} · 原点 {origin} · 最小回答数 {minAnswers}",
    },
    nearest: {
      title: "Relativum - 近い人",
      description: "自己との距離やクラスターの近さを確認。",
      tagline: "自己との距離やクラスターの近さを確認。",
      distanceBasis: "距離の基準",
      referenceLabel: "基準",
      metricLabel: "距離",
      metricEmbedding: "埋め込み (PCA)",
      metricRaw: "生回答 (重み付き)",
      listTitle: "近い人リスト",
      tableRank: "順位",
      tableName: "名前",
      tableDistance: "距離",
      tableCluster: "Cluster",
      tableHighlight: "ハイライト",
      footer: "Relativum — 近傍探索",
      centroidOption: "重心 (全体の中心)",
      selfOption: "自己 ({name})",
      noteSelf: "selfPersonId が設定されている場合は自己が基準になります。",
      noteNoSelf: "self が未設定の場合は重心、または任意の人を基準にできます。",
    },
  },
  en: {
    meta: {
      locale: "en_US",
    },
    nav: {
      register: "Register",
      visualize: "Visualize",
      nearest: "Nearest",
      settings: "Settings",
    },
    common: {
      notSet: "Not set",
      unnamed: "(Unnamed)",
      centroid: "Centroid",
      cluster: "Cluster",
      clusterNumber: "Cluster {index}",
      selectPrompt: "Select...",
      dataInsufficient: "Not enough data.",
      importConfirm: "This will overwrite current data. Continue?",
      imported: "Imported.",
      importFailed: "Import failed: {error}",
      exportJson: "Export JSON",
      importJson: "Import JSON",
      saveAnalysisJson: "Save analysis JSON",
      highSimilarity: "Highly similar",
    },
    errors: {
      invalidJson: "Invalid JSON format.",
      missingFields: "Missing people or ratings.",
    },
    index: {
      title: "Relativum - Register & Rate",
      description:
        "A private tool that visualizes relative positions with a 10-question quick set or 60-question detailed set.",
      tagline:
        "A private tool that visualizes relative positions with a 10-question quick set or 60-question detailed set.",
      peopleManager: "People Manager",
      addPersonPlaceholder: "Name (e.g., Alex)",
      addPersonAria: "New person name",
      addPersonButton: "Add",
      localSaveNote: "People you add are saved locally.",
      answerSection: "Answer Questions",
      personLabel: "Person",
      modeLabel: "Mode",
      progress: "Answered: {answered}/{total}",
      footer: "Relativum — Local storage / GitHub Pages",
      emptyPeople: "No people yet.",
      nameAria: "Name for {name}",
      notesPlaceholder: "Notes (optional)",
      answerButton: "Answer",
      deleteButton: "Delete",
      deleteConfirm: "Delete this person?",
      selectPersonFirst: "Select a person first.",
      modeSimple: "Quick mode (10 questions)",
      modeDetailed: "Detailed mode (60 questions)",
      ratingPositive: "+1 Agree",
      ratingNegative: "-1 Disagree",
      ratingUnknown: "0 Not sure",
      ratingUnanswered: "Unanswered",
      nameRequired: "Enter a name.",
      added: "Added.",
    },
    settings: {
      title: "Relativum - Settings",
      description: "Self settings, weights, and accessibility.",
      tagline: "Self settings, weights, and accessibility.",
      selfSection: "Self Settings",
      selfLabel: "Self",
      selfNote: "You can visualize with self as the origin.",
      accessibility: "Accessibility",
      reduceMotion: "Reduce motion",
      highContrast: "High contrast",
      themeLabel: "Theme",
      themeSystem: "Match device",
      themeLight: "Light",
      themeDark: "Dark",
      fontSize: "Font size",
      languageLabel: "Language",
      languageAuto: "Auto (device)",
      languageJapanese: "Japanese",
      languageEnglish: "English",
      analysisSection: "Analysis Settings",
      minAnswers: "Minimum answers",
      stabilityWins: "k stability wins",
      participationScaling: "Participation scaling (Polis-style)",
      pcaNote:
        "PC1–PC3 are principal component axes that summarize response patterns. PC1 captures the largest variance, and PC2/PC3 are orthogonal auxiliary axes. The sign and direction have no absolute meaning; smaller distances between points indicate more similar response patterns.",
      customQuestions: "Custom Questions",
      customPlaceholder: "Question text",
      addCustom: "Add",
      customNote: "Saved locally and included in analysis.",
      weights: "Question weights (0-2)",
      reset: "Reset",
      resetButton: "Clear local data",
      resetWarning: "This action cannot be undone.",
      footer: "Relativum — Settings / © 2026 Relativum /",
      githubRepo: "GitHub Repository",
      customEmpty: "No custom questions yet.",
      weightAria: "{id} weight",
      questionAria: "{id} question text",
      deleteCustom: "Delete",
      confirmDeleteCustom: "Delete this custom question?",
      confirmReset: "Delete all local data?",
    },
    viz: {
      title: "Relativum - Visualization",
      description: "Check relative distances with Polis-style PCA and clustering.",
      tagline: "Check relative distances with Polis-style PCA and clustering.",
      displayOptions: "Display Options",
      axisLabel: "2D axes",
      show3d2d: "Show 3D/2D together",
      originLabel: "Origin (self)",
      showLabels: "Show labels",
      pointSize: "Point size",
      saveAnalysis: "Save analysis JSON",
      importJson: "Import JSON",
      analysisWarning: "People with too few answers are excluded.",
      pcaNote:
        "PC1–PC3 are principal component axes that summarize response patterns. PC1 captures the largest variance, and PC2/PC3 are orthogonal auxiliary axes. The sign and direction have no absolute meaning; smaller distances between points indicate more similar response patterns.",
      vizTitle: "3D / 2D Visualization",
      canvas3d: "3D (PC1/PC2/PC3)",
      canvas2d: "2D Projection",
      controlsNote: "Drag to rotate / scroll to zoom. Shapes indicate clusters.",
      detailsLabel: "Details",
      tableTitle: "Alternative Table (Accessibility)",
      tableName: "Name",
      tableCluster: "Cluster",
      footer: "Relativum — PCA + k-means++",
      originSet: "Origin = {name}",
      originUnset: "If self is not set, the origin is the centroid.",
      summary:
        "Included {included} / Excluded {excluded} · Cluster k={k} · Origin {origin} · Min answers {minAnswers}",
    },
    nearest: {
      title: "Relativum - Nearest",
      description: "Check distance to self and cluster proximity.",
      tagline: "Check distance to self and cluster proximity.",
      distanceBasis: "Distance Basis",
      referenceLabel: "Reference",
      metricLabel: "Distance",
      metricEmbedding: "Embedding (PCA)",
      metricRaw: "Raw answers (weighted)",
      listTitle: "Nearest People",
      tableRank: "Rank",
      tableName: "Name",
      tableDistance: "Distance",
      tableCluster: "Cluster",
      tableHighlight: "Highlights",
      footer: "Relativum — Nearest Neighbors",
      centroidOption: "Centroid (overall)",
      selfOption: "Self ({name})",
      noteSelf: "When self is set, it becomes the reference.",
      noteNoSelf: "If self is not set, you can use the centroid or any person as the reference.",
    },
  },
};

function getNestedValue(source, key) {
  if (!source || !key) return undefined;
  return key.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), source);
}

function interpolate(template, vars = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) {
      return String(vars[key]);
    }
    return match;
  });
}

export function normalizeLanguage(value) {
  return value === "ja" || value === "en" || value === "auto" ? value : "auto";
}

export function detectLanguage() {
  const preferred =
    (Array.isArray(navigator.languages) && navigator.languages.length ? navigator.languages[0] : navigator.language) ||
    "en";
  return preferred.toLowerCase().startsWith("ja") ? "ja" : "en";
}

export function resolveLanguage(state) {
  const preference = normalizeLanguage(state?.settings?.language);
  if (preference === "ja" || preference === "en") return preference;
  return detectLanguage();
}

export function translate(lang, key, vars = {}) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const fallback = TRANSLATIONS.en;
  const raw = getNestedValue(dict, key) ?? getNestedValue(fallback, key) ?? key;
  return interpolate(String(raw), vars);
}

export function getTranslator(state, langOverride = null) {
  const lang = langOverride || resolveLanguage(state);
  return {
    lang,
    t: (key, vars) => translate(lang, key, vars),
  };
}

export function applyTranslations(state, root = document) {
  const doc = root?.nodeType === 9 ? root : document;
  const translator = getTranslator(state);
  const { lang, t } = translator;

  if (doc?.documentElement) {
    doc.documentElement.setAttribute("lang", lang);
  }

  const contentLanguage = doc.querySelector('meta[http-equiv="Content-Language"]');
  if (contentLanguage) {
    contentLanguage.setAttribute("content", lang);
  }

  const ogLocale = doc.querySelector('meta[property="og:locale"]');
  if (ogLocale) {
    ogLocale.setAttribute("content", t("meta.locale"));
  }

  doc.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!key) return;
    el.textContent = t(key);
  });

  doc.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.dataset.i18nHtml;
    if (!key) return;
    el.innerHTML = t(key);
  });

  doc.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const mapping = el.dataset.i18nAttr;
    if (!mapping) return;
    mapping
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach((entry) => {
        const [attr, key] = entry.split(":").map((part) => part.trim());
        if (!attr || !key) return;
        el.setAttribute(attr, t(key));
      });
  });

  return translator;
}
