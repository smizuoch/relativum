export const QUESTIONS = [
  { id: "Q01", category: "Communication", text: "この人は、率直に言うことを優先する", weight: 1.0 },
  { id: "Q02", category: "Communication", text: "この人は、空気を壊さないことを優先する", weight: 1.0 },
  { id: "Q03", category: "Communication", text: "この人は、短い結論から話すタイプだ", weight: 1.0 },
  { id: "Q04", category: "Communication", text: "この人は、背景や気持ちから話すタイプだ", weight: 1.0 },
  { id: "Q05", category: "Communication", text: "この人は、返信は早いほうが良いと考える", weight: 1.0 },
  { id: "Q06", category: "Communication", text: "この人は、用件がない連絡は少ないほうが良いと考える", weight: 1.0 },
  { id: "Q07", category: "Communication", text: "この人は、指摘されても感情的になりにくい", weight: 1.0 },
  { id: "Q08", category: "Communication", text: "この人は、冗談や皮肉がコミュニケーションに必要だと思う", weight: 1.0 },
  { id: "Q09", category: "Conflict & Decisions", text: "この人は、揉めそうなら避けるより話し合うほうだ", weight: 1.0 },
  { id: "Q10", category: "Conflict & Decisions", text: "この人は、衝突を避けるために曖昧に終わらせがちだ", weight: 1.0 },
  { id: "Q11", category: "Conflict & Decisions", text: "この人は、決める前に情報を集めたい", weight: 1.0 },
  { id: "Q12", category: "Conflict & Decisions", text: "この人は、まず決めてから調整したい", weight: 1.0 },
  { id: "Q13", category: "Conflict & Decisions", text: "この人は、意見が変わることを恥だと思わない", weight: 1.0 },
  { id: "Q14", category: "Conflict & Decisions", text: "この人は、一度決めたら簡単に変えたくない", weight: 1.0 },
  { id: "Q15", category: "Work & Collaboration", text: "この人は、役割分担を明確にしたい", weight: 1.0 },
  { id: "Q16", category: "Work & Collaboration", text: "この人は、状況に応じて柔軟に役割を動かしたい", weight: 1.0 },
  { id: "Q17", category: "Work & Collaboration", text: "この人は、品質を優先して時間が延びても良いと思う", weight: 1.0 },
  { id: "Q18", category: "Work & Collaboration", text: "この人は、まず動くものを優先して後で直したいと思う", weight: 1.0 },
  { id: "Q19", category: "Work & Collaboration", text: "この人は、報連相が多いほうが安心する", weight: 1.0 },
  { id: "Q20", category: "Work & Collaboration", text: "この人は、報連相は必要最小限でいいと思う", weight: 1.0 },
  { id: "Q21", category: "Work & Collaboration", text: "この人は、レビューやフィードバックを頻繁にしたい", weight: 1.0 },
  { id: "Q22", category: "Work & Collaboration", text: "この人は、レビューは節目だけでいいと思う", weight: 1.0 },
  { id: "Q23", category: "Schedule & Commitments", text: "この人は、時間や締切に厳しい", weight: 1.0 },
  { id: "Q24", category: "Schedule & Commitments", text: "この人は、多少の遅れは許容する", weight: 1.0 },
  { id: "Q25", category: "Schedule & Commitments", text: "この人は、予定は事前に決めたい", weight: 1.0 },
  { id: "Q26", category: "Schedule & Commitments", text: "この人は、その場のノリで決めてもいいと思う", weight: 1.0 },
  { id: "Q27", category: "Schedule & Commitments", text: "この人は、ドタキャンは極力しない", weight: 1.0 },
  { id: "Q28", category: "Schedule & Commitments", text: "この人は、ドタキャンは理由があれば仕方ないと思う", weight: 1.0 },
  { id: "Q29", category: "Boundaries & Distance", text: "この人は、プライベート領域をはっきり分けたい", weight: 1.0 },
  { id: "Q30", category: "Boundaries & Distance", text: "この人は、割と何でも共有しても平気だ", weight: 1.0 },
  { id: "Q31", category: "Boundaries & Distance", text: "この人は、1対1の関係を重視する", weight: 1.0 },
  { id: "Q32", category: "Boundaries & Distance", text: "この人は、グループでの付き合いを重視する", weight: 1.0 },
  { id: "Q33", category: "Boundaries & Distance", text: "この人は、お金の貸し借りは避けたい", weight: 1.0 },
  { id: "Q34", category: "Boundaries & Distance", text: "この人は、必要なら貸し借りもありだと思う", weight: 1.0 },
  { id: "Q35", category: "Boundaries & Distance", text: "この人は、価値観が違っても仲良くできる", weight: 1.0 },
  { id: "Q36", category: "Boundaries & Distance", text: "この人は、価値観が合わないと距離を置きがちだ", weight: 1.0 }
];

export const QUESTION_CATEGORIES = [
  "Communication",
  "Conflict & Decisions",
  "Work & Collaboration",
  "Schedule & Commitments",
  "Boundaries & Distance"
];

export const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
