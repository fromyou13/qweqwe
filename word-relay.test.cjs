const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync(`${__dirname}/eng_word_relay.html`, 'utf8');
const gameScript = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1]).find((script) => script.includes('let gameState'));

function loadGame({ dictionary = true } = {}) {
  const elements = new Map();
  let timer;
  function element() {
    const classes = new Set();
    return {
      value: '', innerText: '', innerHTML: '', style: {}, children: [],
      classList: {
        add: (...items) => items.forEach((item) => classes.add(item)),
        remove: (...items) => items.forEach((item) => classes.delete(item)),
        toggle(item, enabled) { enabled ? classes.add(item) : classes.delete(item); },
      },
      appendChild(child) { this.children.push(child); },
      addEventListener() {}, focus() {},
    };
  }
  const context = vm.createContext({
    document: {
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, element());
        return elements.get(id);
      },
      createElement: element,
    },
    fetch() { throw new Error('Word checks must not use the network'); },
    setInterval(callback) { timer = callback; return 1; },
    clearInterval() { timer = undefined; },
    setTimeout() {},
  });
  context.window = context;
  const run = (script) => vm.runInContext(script, context);
  run(fs.readFileSync(`${__dirname}/word-relay-policy.js`, 'utf8'));
  if (dictionary) run(fs.readFileSync(`${__dirname}/data/word-relay-dictionary.js`, 'utf8'));
  run(gameScript);
  context.init();
  return {
    context, run, elements,
    tick() { timer(); },
    async submit(word) {
      elements.get('word-input').value = word;
      await context.handleSubmit({ preventDefault() {} });
    },
  };
}

test('HTML loads the local dictionary before game code', () => {
  assert.ok(html.indexOf('word-relay-policy.js') < html.indexOf('data/word-relay-dictionary.js'));
  assert.ok(html.indexOf('data/word-relay-dictionary.js') < html.indexOf('let gameState'));
  assert.ok(!gameScript.includes('api.dictionaryapi.dev'));
});

test('bundled dictionary accepts real words with network disabled', () => {
  const { context } = loadGame();
  assert.equal(context.wordRelayDictionary.size, 274932);
  for (const word of ['apple', 'elephant', 'train', 'notebook', 'kangaroo', 'orange', 'egg', 'giraffe', 'earth', 'house', 'running', 'children', '  EARTH  ', 'OK']) {
    assert.equal(context.verifyWord(word), true, word);
  }
  for (const word of ['', 'a', 'zzzxxyyy', 'applezzzz', '123', 'ice cream', 'cat-dog', 'a'.repeat(46), 'aa', 'fuck']) {
    assert.equal(context.verifyWord(word), false, word);
  }
  assert.equal(context.verifyWord('class'), true);
});

test('offline relay scores words, levels up and resets the timer', async () => {
  const game = loadGame();
  game.context.startGame();
  game.tick();
  assert.equal(game.run('timeLeft'), 14);
  const chain = ['elephant', 'train', 'notebook', 'kangaroo', 'orange', 'egg', 'giraffe', 'earth', 'house', 'eagle'];
  for (const word of chain) await game.submit(word);
  assert.equal(game.run('currentWord'), 'EAGLE');
  assert.equal(game.run('history.length'), 11);
  assert.equal(game.run('score'), chain.reduce((sum, word) => sum + word.length * 10, 0));
  assert.equal(game.run('level'), 2);
  assert.equal(game.run('timeLeft'), 13);
  assert.equal(game.run('isLoading'), false);
});

test('wrong letters, repeated words and nonexistent words do not change game state', async () => {
  const game = loadGame();
  game.context.startGame();
  await game.submit('train');
  await game.submit('ezzzxxyyy');
  assert.equal(game.run('score'), 0);
  assert.equal(game.run('history.length'), 1);
  await game.submit('elephant');
  await game.submit('elephant');
  assert.equal(game.run('score'), 80);
  assert.equal(game.run('history.length'), 2);
});

test('missing dictionary prevents the timed game from starting', () => {
  const game = loadGame({ dictionary: false });
  game.context.startGame();
  assert.equal(game.run('gameState'), 'START');
  assert.match(game.elements.get('overlay-desc').innerText, /사전을 불러오지 못했습니다/);
  assert.throws(() => game.context.verifyWord('egg'), /사전을 불러오지 못했습니다/);
});
