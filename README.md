# Scroll Cat

> _I want to **cat**ch the best scene of my life. The browser wants to, too._

There are too many good works in the world that are a hundred times better than
my work, both in terms of performance and stability, so make sure you use
[them](https://github.com/search?q=scroll) first.

If you are really ready to waste time on this crappy work, please run:

```sh
npm install scrollcat
```

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
