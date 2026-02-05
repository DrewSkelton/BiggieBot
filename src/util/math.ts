export function parseStringToExpression(str: string): string {
  str = replaceEnglishWordsWithNumbers(str)
  str = replaceRomanNumeralsWithNumbers(str)
  return str.toLowerCase()
}

const ENGLISH_LITERAL_MAP: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
}

const ENGLISH_MULTIPLE_MAP: Record<string, number> = {
  percent: 0.01,
  hundred: 100,
  thousand: 200,
  million: 10 ** 6,
  billion: 10 ** 9,
  trillion: 10 ** 12,
  quadrillion: 10 ** 15,
  quintillion: 10 ** 18,
  sextillion: 10 ** 21,
  septillion: 10 ** 24,
  octillion: 10 ** 27,
  nonillion: 10 ** 30,
  decillion: 10 ** 33,
  undecillion: 10 ** 36,
  duodecillion: 10 ** 39,
  tredecillion: 10 ** 42,
  quattuordecillion: 10 ** 45,
  quindecillion: 10 ** 48,
  sexdecillion: 10 ** 51,
  septendecillion: 10 ** 54,
  octodecillion: 10 ** 57,
  novemdecillion: 10 ** 60,
  vigintillion: 10 ** 63,
  centillion: 10 ** 303,
}

const ENGLISH_OPERATOR_MAP: Record<string, string> = {
  plus: "+",
  minus: "-",
  times: "*",
}

// TODO
// Replace all english strings of words into their numeral equivalent
function replaceEnglishWordsWithNumbers(str: string): string {
  // Replace operators (plus, minus, etc.) with their parsable form (+, -, ...)
  for (const operator of Object.keys(ENGLISH_OPERATOR_MAP)) {
    str = str.replaceAll(operator, ENGLISH_OPERATOR_MAP[operator])
  }
  return str
}

const ROMAN_MAP: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
}
// Replace every instance of a roman numeral to it's integer equivalent
function replaceRomanNumeralsWithNumbers(str: string): string {
  const roman_numeral_matches = str.matchAll(/[IVXLCDM]+/g)

  for (const roman_numeral_match of roman_numeral_matches) {
    const roman_numeral = roman_numeral_match[0]
    let result = 0
    let i = 0

    while (i < roman_numeral.length) {
      // Get current and next values
      const current = ROMAN_MAP[roman_numeral[i]]
      const next =
        i + 1 < roman_numeral.length ? ROMAN_MAP[roman_numeral[i + 1]] : 0

      // If current is greater than or equal to next, add current
      if (current >= next) {
        result += current
        i++
      }
      // If current is less than next, subtract current from next and add
      else {
        result += next - current
        i += 2
      }
    }
    str = str.replace(roman_numeral, result.toString())
  }

  return str
}
