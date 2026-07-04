// The 33 letters of the modern Georgian alphabet (Mkhedruli).
// id         – ascii-safe slug, used for audio filenames (audio/<id>-name.mp3 / -word.mp3)
// char       – the Georgian glyph
// name       – traditional name of the letter (Latin)
// nameKa     – traditional name written in Georgian script (also what the audio speaks)
// latin      – common Latin transliteration (national system)
// sound      – plain-English pronunciation hint
// group      – study-set id: vowel | simple | aspirated | ejective | fricative
// example    – a short Georgian word using the letter, with meaning
const LETTERS = [
  { id: "a",   char: "ა", name: "ani",    nameKa: "ანი",  latin: "a",  group: "vowel",     sound: "a as in 'father'",           example: "ატამი", exampleLatin: "atami",   meaning: "peach" },
  { id: "b",   char: "ბ", name: "bani",   nameKa: "ბანი", latin: "b",  group: "simple",    sound: "b as in 'bat'",              example: "ბაბუა", exampleLatin: "babua",   meaning: "grandfather" },
  { id: "g",   char: "გ", name: "gani",   nameKa: "განი", latin: "g",  group: "simple",    sound: "g as in 'go'",               example: "გული",  exampleLatin: "guli",    meaning: "heart" },
  { id: "d",   char: "დ", name: "doni",   nameKa: "დონი", latin: "d",  group: "simple",    sound: "d as in 'dog'",              example: "დედა",  exampleLatin: "deda",    meaning: "mother" },
  { id: "e",   char: "ე", name: "eni",    nameKa: "ენი",  latin: "e",  group: "vowel",     sound: "e as in 'bed'",              example: "ერთი",  exampleLatin: "erti",    meaning: "one" },
  { id: "v",   char: "ვ", name: "vini",   nameKa: "ვინი", latin: "v",  group: "simple",    sound: "v as in 'van'",              example: "ვაშლი", exampleLatin: "vashli",  meaning: "apple" },
  { id: "z",   char: "ზ", name: "zeni",   nameKa: "ზენი", latin: "z",  group: "simple",    sound: "z as in 'zoo'",              example: "ზამთარი", exampleLatin: "zamtari", meaning: "winter" },
  { id: "t",   char: "თ", name: "tani",   nameKa: "თანი", latin: "t",  group: "aspirated", sound: "t as in 'top' (breathy)",    example: "თევზი", exampleLatin: "tevzi",   meaning: "fish" },
  { id: "i",   char: "ი", name: "ini",    nameKa: "ინი",  latin: "i",  group: "vowel",     sound: "i as in 'machine'",          example: "ია",    exampleLatin: "ia",      meaning: "violet" },
  { id: "ke",  char: "კ", name: "k'ani",  nameKa: "კანი", latin: "k'", group: "ejective",  sound: "sharp, popped k (ejective)", example: "კაცი",  exampleLatin: "k'atsi",  meaning: "man" },
  { id: "l",   char: "ლ", name: "lasi",   nameKa: "ლასი", latin: "l",  group: "simple",    sound: "l as in 'lamp'",             example: "ლომი",  exampleLatin: "lomi",    meaning: "lion" },
  { id: "m",   char: "მ", name: "mani",   nameKa: "მანი", latin: "m",  group: "simple",    sound: "m as in 'mom'",              example: "მთა",   exampleLatin: "mta",     meaning: "mountain" },
  { id: "n",   char: "ნ", name: "nari",   nameKa: "ნარი", latin: "n",  group: "simple",    sound: "n as in 'net'",              example: "ნიორი", exampleLatin: "niori",   meaning: "garlic" },
  { id: "o",   char: "ო", name: "oni",    nameKa: "ონი",  latin: "o",  group: "vowel",     sound: "o as in 'more'",             example: "ოქრო",  exampleLatin: "okro",    meaning: "gold" },
  { id: "pe",  char: "პ", name: "p'ari",  nameKa: "პარი", latin: "p'", group: "ejective",  sound: "sharp, popped p (ejective)", example: "პური",  exampleLatin: "p'uri",   meaning: "bread" },
  { id: "zh",  char: "ჟ", name: "zhani",  nameKa: "ჟანი", latin: "zh", group: "fricative", sound: "s as in 'measure'",          example: "ჟამი",  exampleLatin: "zhami",   meaning: "time/era" },
  { id: "r",   char: "რ", name: "rae",    nameKa: "რაე",  latin: "r",  group: "simple",    sound: "rolled r",                   example: "რძე",   exampleLatin: "rdze",    meaning: "milk" },
  { id: "s",   char: "ს", name: "sani",   nameKa: "სანი", latin: "s",  group: "simple",    sound: "s as in 'sun'",              example: "სახლი", exampleLatin: "sakhli",  meaning: "house" },
  { id: "te",  char: "ტ", name: "t'ari",  nameKa: "ტარი", latin: "t'", group: "ejective",  sound: "sharp, popped t (ejective)", example: "ტბა",   exampleLatin: "t'ba",    meaning: "lake" },
  { id: "u",   char: "უ", name: "uni",    nameKa: "უნი",  latin: "u",  group: "vowel",     sound: "u as in 'rule'",             example: "უფალი", exampleLatin: "upali",   meaning: "lord" },
  { id: "p",   char: "ფ", name: "pari",   nameKa: "ფარი", latin: "p",  group: "aspirated", sound: "p as in 'pen' (breathy)",    example: "ფული",  exampleLatin: "puli",    meaning: "money" },
  { id: "k",   char: "ქ", name: "kani",   nameKa: "ქანი", latin: "k",  group: "aspirated", sound: "k as in 'kite' (breathy)",   example: "ქარი",  exampleLatin: "kari",    meaning: "wind" },
  { id: "gh",  char: "ღ", name: "ghani",  nameKa: "ღანი", latin: "gh", group: "fricative", sound: "like French guttural r",     example: "ღვინო", exampleLatin: "ghvino",  meaning: "wine" },
  { id: "q",   char: "ყ", name: "q'ari",  nameKa: "ყარი", latin: "q'", group: "ejective",  sound: "deep, throaty popped k",     example: "ყავა",  exampleLatin: "q'ava",   meaning: "coffee" },
  { id: "sh",  char: "შ", name: "shini",  nameKa: "შინი", latin: "sh", group: "fricative", sound: "sh as in 'shoe'",            example: "შაქარი", exampleLatin: "shakari", meaning: "sugar" },
  { id: "ch",  char: "ჩ", name: "chini",  nameKa: "ჩინი", latin: "ch", group: "fricative", sound: "ch as in 'chair' (breathy)", example: "ჩაი",   exampleLatin: "chai",    meaning: "tea" },
  { id: "ts",  char: "ც", name: "tsani",  nameKa: "ცანი", latin: "ts", group: "fricative", sound: "ts as in 'cats' (breathy)",  example: "ცა",    exampleLatin: "tsa",     meaning: "sky" },
  { id: "dz",  char: "ძ", name: "dzili",  nameKa: "ძილი", latin: "dz", group: "fricative", sound: "ds as in 'adds'",            example: "ძაღლი", exampleLatin: "dzaghli", meaning: "dog" },
  { id: "tse", char: "წ", name: "ts'ili", nameKa: "წილი", latin: "ts'", group: "ejective", sound: "sharp, popped ts (ejective)", example: "წყალი", exampleLatin: "ts'q'ali", meaning: "water" },
  { id: "che", char: "ჭ", name: "ch'ari", nameKa: "ჭარი", latin: "ch'", group: "ejective", sound: "sharp, popped ch (ejective)", example: "ჭიქა",  exampleLatin: "ch'ika",  meaning: "glass" },
  { id: "kh",  char: "ხ", name: "khani",  nameKa: "ხანი", latin: "kh", group: "fricative", sound: "ch as in Scottish 'loch'",   example: "ხე",    exampleLatin: "khe",     meaning: "tree" },
  { id: "j",   char: "ჯ", name: "jani",   nameKa: "ჯანი", latin: "j",  group: "fricative", sound: "j as in 'jam'",              example: "ჯარი",  exampleLatin: "jari",    meaning: "army" },
  { id: "h",   char: "ჰ", name: "hae",    nameKa: "ჰაე",  latin: "h",  group: "simple",    sound: "h as in 'hat'",              example: "ჰაერი", exampleLatin: "haeri",   meaning: "air" },
];

// Study sets shown on the Learn tab, in learning order.
const GROUPS = [
  { id: "vowel",     label: "Vowels",                 desc: "The 5 vowel sounds — start here." },
  { id: "simple",    label: "Simple consonants",      desc: "Familiar sounds close to English." },
  { id: "aspirated", label: "Aspirated consonants",   desc: "Breathy t, p, k — puff of air." },
  { id: "ejective",  label: "Ejective consonants",    desc: "The sharp, ‘popped’ sounds." },
  { id: "fricative", label: "Fricatives & affricates", desc: "The hissing / buzzing letters." },
];

// Letters belonging to a group id (or all letters for "all").
function lettersInGroup(groupId) {
  if (groupId === "all") return LETTERS.slice();
  return LETTERS.filter(l => l.group === groupId);
}
