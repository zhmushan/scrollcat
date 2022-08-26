# Scroll Cat

> _I want to **cat**ch the best scene of my life. The browser wants to, too._

[![version](https://img.shields.io/github/tag/zhmushan/scrollcat.svg)](https://github.com/zhmushan/scrollcat)
[![ci](https://github.com/zhmushan/scrollcat/workflows/ci/badge.svg?branch=master)](https://github.com/zhmushan/scrollcat/actions)
[![api](https://img.shields.io/badge/api-doc-blue)](https://doc.deno.land/https://deno.land/x/scrollcat/src/mod.ts)
[![license](https://img.shields.io/github/license/zhmushan/scrollcat.svg)](https://github.com/zhmushan/scrollcat)

There are too many good works in the world that are a hundred times better than
my work, both in terms of performance and stability, so make sure you use
[them](https://github.com/search?q=scroll) first.

If you are really ready to waste time on this crappy work, please run:

```sh
npm install scrollcat
```

Or if you use Deno, don't worry, first choose one of your favorite CDNs (e.g.
[unpkg](https://unpkg.com/browse/scrollcat/dist/)). All the compiled files are
placed in `dist/`, and you only need to care about `mod.js` and `mod.d.ts` in
them. If you don't know yet how Deno specifies its type declaration files when
importing JS modules, please check
[this documentation](https://deno.land/manual@v1.25.0/typescript/types#providing-types-when-importing).

## Usage

```js
import { Scroller } from "scrollcat";

const life = new Scroller(document.body);
catchScene(document.querySelector("#a"));
catchScene(document.querySelector("#b"));

async function catchScene(el) {
  const scene = life.addSceneWithDefault(el);

  for await (const [type, event] of scene.emitter) {
    const { progress, target } = event;
    if (type !== "update") {
      console.log(type, event);
    }
    target.textContent = `${(progress * 100).toFixed(2)}%`;
  }
}
```
