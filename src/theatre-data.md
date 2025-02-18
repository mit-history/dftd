---
theme: dashboard
title: theatre dashboard
toc: false
---

```js
import {pie} from "./components/theatre.js";
```

```js
const theatre = FileAttachment("data/theatre.csv").csv({typed: true});
```

# Plays

```js
Inputs.table(theatre)
```

# Genres

```js
display(pie(theatre, {width:600, height: 600}))
```