// 發音小幫手：用台灣注音標出法文裡最難唸的音。
//
// 注音當然不可能完全對應法文，但對初學者來說「有個大概的聲音可以抓」
// 比看國際音標有用得多。每一條都附一句提醒，說明注音抓不到的地方。
//
// 兩種資料：
//   SOUND_RULES — 拼字組合 → 聲音（整體規則，放在發音規則卡）
//   ZHUYIN      — 單字 → 注音（查表，滑過句子時顯示）

/** 法文拼字組合對應的注音，初學者先掌握這些就能唸八成的字。 */
export const SOUND_RULES = [
  { fr: 'u', zy: 'ㄩ', ex: 'tu / rue / une', tip: '★ 注音的ㄩ剛好就是法文的 u：先唸「ㄧ」，嘴唇再縮成圓形。' },
  { fr: 'ou', zy: 'ㄨ', ex: 'vous / jour / beaucoup', tip: 'ou 唸ㄨ，不是ㄡ。vous 唸「ㄈㄨ」不是「ㄈㄡ」。' },
  { fr: 'eu / œu', zy: 'ㄜ（圓唇）', ex: 'deux / heure / sœur', tip: '唸ㄜ的時候嘴唇要噘圓，像在吹蠟燭。' },
  { fr: 'é', zy: 'ㄟ', ex: 'café / été / parlé', tip: '嘴角往兩邊拉開，比ㄝ更緊。' },
  { fr: 'è / ê / ai / ei', zy: 'ㄝ', ex: 'père / fête / mais', tip: '嘴巴張開的「ㄝ」，比 é 鬆。' },
  { fr: 'au / eau / o', zy: 'ㄡ', ex: 'eau / beau / mot', tip: 'eau 三個字母只唸一個ㄡ的音。' },
  { fr: 'oi', zy: 'ㄨㄚ', ex: 'moi / voiture / trois', tip: 'oi 固定唸「ㄨㄚ」，跟字面完全不一樣。' },
  { fr: 'ui', zy: 'ㄩㄧ', ex: 'huit / nuit / lui', tip: 'ㄩ快速滑到ㄧ，一個音節唸完。' },
  { fr: 'an / en / am / em', zy: 'ㄤ（鼻音）', ex: 'enfant / temps / France', tip: '★ 鼻母音：氣從鼻子出來，後面的 n／m 本身不發音。' },
  { fr: 'on / om', zy: 'ㄨㄥ（鼻音）', ex: 'bon / nom / maison', tip: '嘴唇噘圓的鼻音，像台語的「翁」。' },
  { fr: 'in / ain / ein / im', zy: 'ㄝㄣ（鼻音）', ex: 'vin / pain / matin', tip: '張開嘴的ㄝ加鼻音，不要唸成ㄧㄣ。' },
  { fr: 'un', zy: 'ㄜㄣ（鼻音）', ex: 'un / lundi / brun', tip: '現代法文常跟 in 唸成一樣，唸成ㄝㄣ也聽得懂。' },
  { fr: 'r', zy: 'ㄏ（喉嚨）', ex: 'rue / Paris / merci', tip: '★ 小舌音：像漱口或清喉嚨的ㄏ，不要捲舌。唸不出來先用ㄏ代替。' },
  { fr: 'j / ge / gi', zy: 'ㄖ（輕）', ex: 'je / jour / rouge', tip: '像「日」但舌頭不捲，氣流從舌面摩擦出來。' },
  { fr: 'ch', zy: 'ㄒ / ㄕ', ex: 'chat / chaud / chercher', tip: 'ch 在法文唸ㄒ不是ㄑ，比中文的ㄕ更靠前。' },
  { fr: 'gn', zy: 'ㄋㄧ', ex: 'montagne / espagnol', tip: '像「妮」的開頭，一個音唸完。' },
  { fr: 'll（i 後面）', zy: 'ㄧ', ex: 'fille / travailler', tip: 'i + ll 唸成ㄧ，兩個 l 不發 l 的音。' },
  { fr: 'h', zy: '不發音', ex: 'heure / hôtel / habiter', tip: '★ 法文的 h 永遠不發音，前面的字要連過去。' },
  { fr: '字尾子音', zy: '多半不發音', ex: 'petit / grand / vous', tip: '★ 字尾的 e、s、t、d、x 通常不唸。但 c、r、f、l 常常要唸（記法：CaReFuL）。' },
  { fr: 'v', zy: 'ㄈ（要振動）', ex: 'vous / vin / voiture', tip: '注音沒有這個音：用上齒咬下唇，像ㄈ但喉嚨要出聲。' },
  { fr: 'z / s（母音間）', zy: 'ㄗ（要振動）', ex: 'maison / treize', tip: '兩個母音中間的單一個 s 唸成 z 的音。' },
]

/**
 * 單字 → 注音。只收「初學者會唸錯」的字，不是整本字典。
 * 查表是「整個字」比對（小寫、去掉標點），所以 j' / l' 這種縮寫另外收。
 */
export const ZHUYIN = {
  // 問候與禮貌
  bonjour: ['ㄅㄨㄥ・ㄖㄨㄏ', 'on 鼻音；j 唸ㄖ；尾巴 r 在喉嚨'],
  bonsoir: ['ㄅㄨㄥ・ㄙㄨㄚㄏ', 'oi 唸ㄨㄚ'],
  salut: ['ㄙㄚ・ㄌㄩ', '字尾 t 不發音'],
  merci: ['ㄇㄝㄏ・ㄒㄧ', 'r 在喉嚨，不要捲舌'],
  oui: ['ㄨㄧ', '兩個音快速連在一起'],
  non: ['ㄋㄨㄥ', '鼻音，嘴唇要圓'],
  pardon: ['ㄆㄚㄏ・ㄉㄨㄥ', 'on 鼻音'],
  madame: ['ㄇㄚ・ㄉㄚㄇ', '字尾 e 不發音'],
  monsieur: ['ㄇㄜ・ㄙㄧㄜ', '★ 拼字跟發音差很多，整個記起來'],
  'au revoir': ['ㄡ・ㄏㄜ・ㄈㄨㄚㄏ', 'oi 唸ㄨㄚ；v 要讓喉嚨振動'],
  enchanté: ['ㄤ・ㄕㄤ・ㄊㄟ', 'en 和 an 都是鼻音；ch 唸ㄕ'],
  // 人稱
  je: ['ㄖㄜ', 'j 唸ㄖ但舌頭不捲'],
  tu: ['ㄊㄩ', '★ u 唸ㄩ，不是ㄨ'],
  il: ['ㄧㄌ', ''],
  elle: ['ㄝㄌ', '字尾 e 不發音'],
  nous: ['ㄋㄨ', 'ou 唸ㄨ；字尾 s 不發音'],
  vous: ['ㄈㄨ', '★ 唸ㄈㄨ不是ㄈㄡ；v 要振動'],
  ils: ['ㄧㄌ', '字尾 s 不發音，跟 il 同音'],
  elles: ['ㄝㄌ', '跟 elle 同音'],
  moi: ['ㄇㄨㄚ', 'oi 唸ㄨㄚ'],
  toi: ['ㄊㄨㄚ', ''],
  lui: ['ㄌㄩㄧ', 'ui 是ㄩ滑到ㄧ'],
  eux: ['ㄜ', 'eu 圓唇；字尾 x 不發音'],
  // 動詞
  être: ['ㄝㄊㄏ', 'ê 唸ㄝ'],
  avoir: ['ㄚ・ㄈㄨㄚㄏ', 'oi 唸ㄨㄚ'],
  aller: ['ㄚ・ㄌㄟ', '字尾 -er 唸ㄟ'],
  faire: ['ㄈㄝㄏ', 'ai 唸ㄝ'],
  vais: ['ㄈㄝ', 'ai 唸ㄝ；字尾 s 不發音'],
  suis: ['ㄙㄩㄧ', 'ui 是ㄩ滑到ㄧ'],
  sont: ['ㄙㄨㄥ', 'on 鼻音；字尾 t 不發音'],
  ont: ['ㄨㄥ', '鼻音；跟 sont 只差一個 s'],
  manger: ['ㄇㄤ・ㄖㄟ', 'an 鼻音；ge 唸ㄖㄟ'],
  voudrais: ['ㄈㄨ・ㄉㄏㄝ', 'ai 唸ㄝ；字尾 s 不發音'],
  prendre: ['ㄆㄏㄤ・ㄉㄏ', 'en 鼻音'],
  // 時間
  heure: ['ㄜㄏ', '★ h 不發音；eu 圓唇'],
  heures: ['ㄜㄏ', '跟 heure 同音，字尾 s 不唸'],
  aujourd: ['ㄡ・ㄖㄨㄏ', 'au 唸ㄡ'],
  "aujourd'hui": ['ㄡ・ㄖㄨㄏ・ㄉㄩㄧ', 'h 不發音；ui 唸ㄩㄧ'],
  demain: ['ㄉㄜ・ㄇㄝㄣ', 'ain 是鼻音'],
  hier: ['ㄧ・ㄝㄏ', 'h 不發音'],
  matin: ['ㄇㄚ・ㄊㄝㄣ', 'in 鼻音'],
  soir: ['ㄙㄨㄚㄏ', 'oi 唸ㄨㄚ'],
  nuit: ['ㄋㄩㄧ', 'ui 唸ㄩㄧ'],
  jour: ['ㄖㄨㄏ', 'ou 唸ㄨ'],
  semaine: ['ㄙㄜ・ㄇㄝㄋ', 'ai 唸ㄝ'],
  mois: ['ㄇㄨㄚ', 'oi 唸ㄨㄚ；字尾 s 不唸'],
  année: ['ㄚ・ㄋㄟ', 'é 唸ㄟ'],
  an: ['ㄤ', '鼻音'],
  ans: ['ㄤ', '跟 an 同音'],
  temps: ['ㄊㄤ', '鼻音；字尾 ps 都不發音'],
  minuit: ['ㄇㄧ・ㄋㄩㄧ', 'ui 唸ㄩㄧ'],
  midi: ['ㄇㄧ・ㄉㄧ', ''],
  lundi: ['ㄌㄜㄣ・ㄉㄧ', 'un 是鼻音'],
  mardi: ['ㄇㄚㄏ・ㄉㄧ', 'r 在喉嚨'],
  mercredi: ['ㄇㄝㄏ・ㄎㄏㄜ・ㄉㄧ', '★ 兩個 r 都在喉嚨'],
  jeudi: ['ㄖㄜ・ㄉㄧ', 'eu 圓唇'],
  vendredi: ['ㄈㄤ・ㄉㄏㄜ・ㄉㄧ', 'en 鼻音'],
  samedi: ['ㄙㄚㄇ・ㄉㄧ', ''],
  dimanche: ['ㄉㄧ・ㄇㄤㄒ', 'an 鼻音；ch 唸ㄒ'],
  // 數字
  un: ['ㄜㄣ', '鼻音'],
  une: ['ㄩㄋ', '★ u 唸ㄩ；加了 e 之後 n 要唸出來'],
  deux: ['ㄉㄜ', 'eu 圓唇；x 不發音'],
  trois: ['ㄊㄏㄨㄚ', 'oi 唸ㄨㄚ；字尾 s 不唸'],
  quatre: ['ㄎㄚㄊㄏ', 'qu 唸ㄎ'],
  cinq: ['ㄙㄝㄣㄎ', 'in 鼻音但這裡 q 要唸'],
  six: ['ㄙㄧㄙ', '單獨唸時 x 唸ㄙ'],
  sept: ['ㄙㄝㄊ', '★ p 不發音'],
  huit: ['ㄩㄧㄊ', 'h 不發音；ui 唸ㄩㄧ'],
  neuf: ['ㄋㄜㄈ', 'eu 圓唇；f 要唸'],
  dix: ['ㄉㄧㄙ', '單獨唸時 x 唸ㄙ'],
  onze: ['ㄨㄥㄗ', 'on 鼻音；z 要振動'],
  douze: ['ㄉㄨㄗ', 'ou 唸ㄨ'],
  treize: ['ㄊㄏㄝㄗ', 'ei 唸ㄝ'],
  quinze: ['ㄎㄝㄣㄗ', 'in 鼻音'],
  seize: ['ㄙㄝㄗ', 'ei 唸ㄝ'],
  vingt: ['ㄈㄝㄣ', '★ 鼻音；gt 都不發音'],
  trente: ['ㄊㄏㄤㄊ', 'en 鼻音'],
  cent: ['ㄙㄤ', '鼻音；t 不發音'],
  mille: ['ㄇㄧㄌ', ''],
  // 吃喝
  eau: ['ㄡ', '★ 三個字母只唸一個ㄡ'],
  pain: ['ㄅㄝㄣ', 'ain 鼻音'],
  vin: ['ㄈㄝㄣ', '★ v 要振動；in 鼻音。跟 vent（風）不一樣'],
  vent: ['ㄈㄤ', '★ en 鼻音，跟 vin（酒）要分清楚'],
  café: ['ㄎㄚ・ㄈㄟ', 'é 唸ㄟ'],
  thé: ['ㄊㄟ', 'th 唸ㄊ，沒有英文的 th 音'],
  lait: ['ㄌㄝ', 'ai 唸ㄝ；t 不發音'],
  viande: ['ㄈㄧㄤㄉ', 'an 鼻音'],
  poisson: ['ㄆㄨㄚ・ㄙㄨㄥ', 'oi 唸ㄨㄚ；on 鼻音'],
  fromage: ['ㄈㄏㄡ・ㄇㄚㄖ', '字尾 ge 唸ㄖ'],
  sucre: ['ㄙㄩㄎㄏ', 'u 唸ㄩ'],
  sel: ['ㄙㄝㄌ', 'l 要唸'],
  œuf: ['ㄜㄈ', 'œu 圓唇；單數 f 要唸'],
  œufs: ['ㄜ', '★ 複數 fs 都不發音，跟單數不一樣'],
  // 地方
  maison: ['ㄇㄝ・ㄗㄨㄥ', 'ai 唸ㄝ；中間的 s 唸ㄗ；on 鼻音'],
  restaurant: ['ㄏㄝㄙ・ㄊㄡ・ㄏㄤ', 'au 唸ㄡ；an 鼻音'],
  école: ['ㄟ・ㄎㄡㄌ', 'é 唸ㄟ'],
  bureau: ['ㄅㄩ・ㄏㄡ', 'u 唸ㄩ；eau 唸ㄡ'],
  gare: ['ㄍㄚㄏ', 'r 在喉嚨'],
  rue: ['ㄏㄩ', '★ 小舌 r ＋ ㄩ，初學者最難的組合'],
  ville: ['ㄈㄧㄌ', ''],
  pays: ['ㄆㄟ・ㄧ', '★ 拼字騙人，不唸ㄆㄝ'],
  france: ['ㄈㄏㄤㄙ', 'an 鼻音'],
  paris: ['ㄆㄚ・ㄏㄧ', '★ 字尾 s 不發音'],
  magasin: ['ㄇㄚ・ㄍㄚ・ㄗㄝㄣ', '中間 s 唸ㄗ；in 鼻音'],
  // 交通
  train: ['ㄊㄏㄝㄣ', 'ain 鼻音'],
  métro: ['ㄇㄟ・ㄊㄏㄡ', 'é 唸ㄟ'],
  voiture: ['ㄈㄨㄚ・ㄊㄩㄏ', 'oi 唸ㄨㄚ；u 唸ㄩ'],
  avion: ['ㄚ・ㄈㄧㄨㄥ', 'on 鼻音'],
  bus: ['ㄅㄩㄙ', '★ 字尾 s 要唸'],
  vélo: ['ㄈㄟ・ㄌㄡ', ''],
  // 常用形容詞和副詞
  beaucoup: ['ㄅㄡ・ㄎㄨ', '★ eau 唸ㄡ；ou 唸ㄨ；字尾 p 不唸'],
  'un peu': ['ㄜㄣ・ㄆㄜ', 'eu 圓唇'],
  très: ['ㄊㄏㄝ', 'è 唸ㄝ；字尾 s 不唸'],
  bien: ['ㄅㄧㄝㄣ', 'ien 鼻音'],
  beau: ['ㄅㄡ', 'eau 唸ㄡ'],
  chaud: ['ㄕㄡ', 'ch 唸ㄕ；字尾 d 不唸'],
  froid: ['ㄈㄏㄨㄚ', 'oi 唸ㄨㄚ；d 不唸'],
  petit: ['ㄆㄜ・ㄊㄧ', '字尾 t 不唸'],
  grand: ['ㄍㄏㄤ', 'an 鼻音；d 不唸'],
  // 其他高頻
  'est-ce que': ['ㄝㄙ・ㄎㄜ', '三個字連成一個音團'],
  "qu'est-ce que": ['ㄎㄝㄙ・ㄎㄜ', '★ 整串當一個字背'],
  pourquoi: ['ㄆㄨㄏ・ㄎㄨㄚ', 'oi 唸ㄨㄚ'],
  combien: ['ㄎㄨㄥ・ㄅㄧㄝㄣ', '兩個鼻音'],
  comment: ['ㄎㄡ・ㄇㄤ', 'en 鼻音；t 不唸'],
  'où': ['ㄨ', 'ou 唸ㄨ'],
  travail: ['ㄊㄏㄚ・ㄈㄞ', '字尾 ail 唸ㄞ'],
  famille: ['ㄈㄚ・ㄇㄧ', 'ille 唸ㄧ'],
  fille: ['ㄈㄧ', 'ille 唸ㄧ，l 不發 l 的音'],
  français: ['ㄈㄏㄤ・ㄙㄝ', '★ an 鼻音；ç 唸ㄙ；字尾 s 不唸'],
  anglais: ['ㄤ・ㄍㄌㄝ', 'an 鼻音；ai 唸ㄝ'],
  argent: ['ㄚㄏ・ㄖㄤ', 'g 唸ㄖ；en 鼻音'],
  chose: ['ㄕㄡㄗ', 'ch 唸ㄕ；s 唸ㄗ'],
  chien: ['ㄒㄧㄝㄣ', 'ch 唸ㄒ；ien 鼻音'],
  oiseau: ['ㄨㄚ・ㄗㄡ', 'oi 唸ㄨㄚ；eau 唸ㄡ'],
  fleur: ['ㄈㄌㄜㄏ', 'eu 圓唇'],
  sœur: ['ㄙㄜㄏ', 'œu 圓唇'],
  cœur: ['ㄎㄜㄏ', 'œu 圓唇'],
  yeux: ['ㄧㄜ', 'x 不發音'],
  main: ['ㄇㄝㄣ', 'ain 鼻音'],
  mains: ['ㄇㄝㄣ', '跟 main 同音'],
  dents: ['ㄉㄤ', 'en 鼻音；字尾 ts 不唸'],
  cheveux: ['ㄕㄜ・ㄈㄜ', 'ch 唸ㄕ；eu 圓唇'],
  // 冠詞、介係詞、小字 —— 出現頻率最高，一定要唸對
  le: ['ㄌㄜ', '輕輕帶過，不要唸成「勒」'],
  la: ['ㄌㄚ', ''],
  les: ['ㄌㄟ', '★ 唸ㄌㄟ不是ㄌㄝ；字尾 s 不發音'],
  des: ['ㄉㄟ', '字尾 s 不發音'],
  du: ['ㄉㄩ', '★ u 唸ㄩ'],
  au: ['ㄡ', 'au 唸ㄡ'],
  aux: ['ㄡ', '跟 au 同音，x 不發音'],
  de: ['ㄉㄜ', ''],
  et: ['ㄟ', '★ 字尾 t 不發音，只唸ㄟ'],
  est: ['ㄝ', '★ 字尾 st 都不發音，只唸ㄝ'],
  en: ['ㄤ', '鼻音'],
  dans: ['ㄉㄤ', '鼻音；字尾 s 不唸'],
  chez: ['ㄒㄟ', 'ch 唸ㄒ；字尾 z 不唸'],
  pour: ['ㄆㄨㄏ', 'ou 唸ㄨ'],
  pas: ['ㄆㄚ', '字尾 s 不唸'],
  ne: ['ㄋㄜ', ''],
  plus: ['ㄆㄌㄩ', '★ 否定的 plus 字尾 s 不唸；當「更多」時才唸ㄆㄌㄩㄙ'],
  moins: ['ㄇㄨㄝㄣ', 'oin 是鼻音'],
  ça: ['ㄙㄚ', 'ç 唸ㄙ不是ㄎ'],
  ce: ['ㄙㄜ', 'c 在 e 前面唸ㄙ'],
  que: ['ㄎㄜ', 'qu 唸ㄎ'],
  on: ['ㄨㄥ', '鼻音'],
  se: ['ㄙㄜ', ''],
  me: ['ㄇㄜ', ''],
  mon: ['ㄇㄨㄥ', '鼻音'],
  depuis: ['ㄉㄜ・ㄆㄩㄧ', 'ui 唸ㄩㄧ；字尾 s 不唸'],
  pendant: ['ㄆㄤ・ㄉㄤ', '★ 兩個都是鼻音'],
  // 常見動詞變化
  "c'est": ['ㄙㄝ', '★ 整個只唸一個音節ㄙㄝ'],
  "j'ai": ['ㄖㄟ', 'j 唸ㄖ；ai 這裡唸ㄟ'],
  "j'aime": ['ㄖㄝㄇ', 'ai 唸ㄝ'],
  "n'aime": ['ㄋㄝㄇ', ''],
  fait: ['ㄈㄝ', 'ai 唸ㄝ；字尾 t 不唸'],
  fais: ['ㄈㄝ', '跟 fait 同音'],
  va: ['ㄈㄚ', 'v 要讓喉嚨振動'],
  sommes: ['ㄙㄨㄇ', '字尾 es 不發音'],
  avez: ['ㄚ・ㄈㄟ', '字尾 z 不唸'],
  habite: ['ㄚ・ㄅㄧㄊ', '★ h 不發音'],
  lave: ['ㄌㄚㄈ', ''],
  lève: ['ㄌㄝㄈ', 'è 唸ㄝ'],
  joue: ['ㄖㄨ', 'ou 唸ㄨ'],
  travaille: ['ㄊㄏㄚ・ㄈㄞ', 'ail 唸ㄞ'],
  voyager: ['ㄈㄨㄚ・ㄧㄚ・ㄖㄟ', 'y 當兩個 i 用'],
  connaît: ['ㄎㄨ・ㄋㄝ', 'ai 唸ㄝ；字尾 t 不唸'],
  aimes: ['ㄝㄇ', '字尾 es 不發音'],
  peut: ['ㄆㄜ', 'eu 圓唇；t 不唸'],
  // 其他高頻名詞
  plaît: ['ㄆㄌㄝ', '★ 字尾 t 不唸；s\'il vous plaît 整串連著唸'],
  quart: ['ㄎㄚㄏ', '★ 字尾 t 不唸'],
  demie: ['ㄉㄜ・ㄇㄧ', ''],
  quelle: ['ㄎㄝㄌ', 'qu 唸ㄎ'],
  soleil: ['ㄙㄡ・ㄌㄝ', '★ eil 唸ㄝ，字尾 l 不唸'],
  ciel: ['ㄒㄧㄝㄌ', 'c 唸ㄒ'],
  neige: ['ㄋㄝㄖ', 'ei 唸ㄝ；ge 唸ㄖ'],
  nuageux: ['ㄋㄩㄚ・ㄖㄜ', 'u 唸ㄩ；eux 唸ㄜ'],
  verre: ['ㄈㄝㄏ', '兩個 r 只唸一個喉音'],
  bouteille: ['ㄅㄨ・ㄊㄝ', '★ eille 唸ㄝ'],
  kilo: ['ㄎㄧ・ㄌㄡ', ''],
  chocolat: ['ㄒㄡ・ㄎㄡ・ㄌㄚ', 'ch 唸ㄒ；字尾 t 不唸'],
  plat: ['ㄆㄌㄚ', '字尾 t 不唸'],
  cinéma: ['ㄒㄧ・ㄋㄟ・ㄇㄚ', 'c 唸ㄒ'],
  jours: ['ㄖㄨㄏ', '跟 jour 同音'],
  septembre: ['ㄙㄝㄆ・ㄊㄤㄅㄏ', 'em 鼻音'],
  août: ['ㄨㄊ', '★ 只唸兩個音，t 要唸出來'],
  passé: ['ㄆㄚ・ㄙㄟ', 'é 唸ㄟ'],
  taïwan: ['ㄊㄞ・ㄨㄢ', '分音符讓 i 和 w 分開唸'],
  taïwanais: ['ㄊㄞ・ㄨㄚ・ㄋㄝ', '字尾 s 不唸'],
  'week-end': ['ㄨㄧ・ㄎㄝㄣㄉ', '英文外來語'],
}

// 把 fr 字串切成可查詢的小寫詞（保留撇號，因為 qu'est-ce 這類要整組查）
function words(text) {
  return String(text)
    .toLowerCase()
    .replace(/[.,!?;:«»"()[\]]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/**
 * 回傳這個句子裡「查得到注音」的字。
 * 先試兩個字、三個字的組合（qu'est-ce que、au revoir），再試單字。
 */
export function hintsFor(text) {
  const ws = words(text)
  const out = []
  const used = new Set()

  for (let n = 3; n >= 1; n--) {
    for (let i = 0; i + n <= ws.length; i++) {
      if ([...Array(n)].some((_, k) => used.has(i + k))) continue
      const key = ws.slice(i, i + n).join(' ')
      // l'heure, d'eau, j'ai … — try the whole thing first, then without the
      // elided article, so "l'heure" still finds "heure".
      const hit = ZHUYIN[key] ?? (n === 1 ? ZHUYIN[key.replace(/^[a-zà-ÿ]{1,2}'/, '')] : undefined)
      if (hit && hit[0]) {
        out.push({ at: i, word: key, zy: hit[0], tip: hit[1] })
        for (let k = 0; k < n; k++) used.add(i + k)
      }
    }
  }
  return out.sort((a, b) => a.at - b.at)
}

/** 查單一個字的注音，回傳 [注音, 提示] 或 null。 */
export function zhuyinFor(word) {
  const w = String(word).toLowerCase().replace(/[.,!?;:«»"()[\]]/g, '').trim()
  const hit = ZHUYIN[w] ?? ZHUYIN[w.replace(/^[a-zà-ÿ]{1,2}'/, '')]
  return hit && hit[0] ? hit : null
}

/** 這個句子有沒有任何字查得到注音。 */
export function hasHints(text) {
  return hintsFor(text).length > 0
}

/* ------------------------------ 名詞陰陽性 ------------------------------ */

const MASC = new Set(['le', 'un', 'du', 'au'])
const FEM = new Set(['la', 'une'])

/**
 * 從冠詞判斷名詞的陰陽性。判斷不出來就回 null（例如 l'、les、des 看不出來）。
 */
export function genderOf(text) {
  const first = words(text)[0]
  if (!first) return null
  if (MASC.has(first)) return { key: 'masc', label: '陽性', hint: `${first} ⋯` }
  if (FEM.has(first)) return { key: 'fem', label: '陰性', hint: `${first} ⋯` }
  if (first === "l'" || /^l'/.test(first)) {
    return { key: 'unknown', label: '看不出性別', hint: "l' 把冠詞縮掉了，要另外記 un / une" }
  }
  if (first === 'les' || first === 'des' || first === 'aux') {
    return { key: 'plural', label: '複數', hint: '複數冠詞不分陰陽性' }
  }
  return null
}

/* --------------------------- 句子還是單字？ --------------------------- */

/**
 * 判斷一列該用「整行」還是「格狀」排版。
 * 有動詞變化、標點或比較長的 → 當句子，一行一句比較好讀；
 * 單字、片語 → 格狀排版，一次看得到比較多。
 */
export function isSentence(text) {
  const t = String(text).trim()
  if (/[.!?]/.test(t)) return true
  const n = t.split(/\s+/).filter(Boolean).length
  return n >= 4 || t.length >= 26
}
