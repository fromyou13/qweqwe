// Vocabulary policy copied from ../wordtrain/src/word-policy.js (classroom-v4).
(() => {
// Game vocabulary policy, not a claim about whether a word exists in English.
// Keep these lists explicit: substring filtering would reject words like "class".
const WORD_POLICY_VERSION = 'classroom-v4';

const ALLOWED_TWO_LETTER_WORDS = Object.freeze([
  'ad', 'ah', 'am', 'an', 'as', 'at', 'aw', 'ax', 'be', 'by', 'do', 'eh',
  'er', 'ew', 'ex', 'go', 'ha', 'he', 'hi', 'if', 'in', 'is', 'it', 'ma',
  'me', 'my', 'no', 'of', 'oh', 'ok', 'on', 'or', 'ow', 'ox', 'pa', 'sh',
  'so', 'to', 'uh', 'um', 'up', 'us', 'we', 'yo',
]);

// Curated whole-word entries, including common inflections and slang spellings.
// Neutral identity words and ordinary words with another innocent meaning are
// not automatically blocked. Extend this list as new abuse is encountered.
const BLOCKED_WORDS = new Set(`
  nigga niggas niggaz nigger niggers negro negroes darkie darkies
  chink chinks gook gooks kike kikes spic spics wetback wetbacks
  paki pakis raghead ragheads towelhead towelheads beaner beaners
  faggot faggots fag fags dyke dykes tranny trannies retard retards retarded
  fuck fucks fucked fucker fuckers fucking fuckin fuckoff fuckhead fuckheads
  motherfucker motherfuckers motherfucking mofo mofos
  shit shits shitted shitting shitty shithead shitheads bullshit horseshit
  bitch bitches bitching bitchy bastard bastards asshole assholes arsehole arseholes
  cunt cunts cock cocks cocksucker cocksuckers dick dicks dickhead dickheads
  pussy pussies prick pricks wanker wankers wank wanking
  slut sluts slutty whore whores hoe hoes skank skanks
  sex sexy sexual sexually sexuality sexualities sexualize sexualized sexualizing
  porn porno pornos pornography pornographic hentai xxx xxxrated
  nude nudes nudity naked nakedness erotic erotica erotically
  blowjob blowjobs handjob handjobs rimjob rimjobs gangbang gangbangs
  anal anus anuses penis penises penile vagina vaginas vaginal vulva vulvas
  clitoris clitoral testicle testicles scrotum scrotums
  dildo dildos vibrator vibrators buttplug buttplugs
  orgasm orgasms orgasmic masturbation masturbate masturbates masturbated masturbating
  ejaculation ejaculate ejaculates ejaculated ejaculating semen sperm cum cums cumming
  boobs boob boobies tit tits titties boner boners erection erections
  intercourse fellatio cunnilingus sodomy sodomize sodomized
  rape rapes raped raping rapist rapists incest incestuous
  pedophile pedophiles paedophile paedophiles pedophilia paedophilia
  prostitute prostitutes prostitution sext sexts sexting
`.trim().split(/\s+/));
const shortWords = new Set(ALLOWED_TWO_LETTER_WORDS);

function getWordPolicyError(input) {
  const word = input.trim().toLowerCase();
  if (!/^[a-z]{2,45}$/.test(word)) return '영어 단어 2~45자를 입력하세요.';
  if (BLOCKED_WORDS.has(word)) return '비하·욕설·성적 표현은 이 게임에서 사용할 수 없습니다.';
  if (word.length === 2 && !shortWords.has(word)) return '이 게임에서 허용하지 않는 2글자 표현입니다.';
  return '';
}
  window.wordRelayPolicy = { getWordPolicyError };
})();

