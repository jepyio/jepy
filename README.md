<a name="readme-top"></a>

<div align="center">
  <a href="https://github.com/jepyio/jepy">
    <img src="images/logo.svg" alt="Logo" height="80">
  </a>

  <p align="center">
    Tiny, expandable and simple to use composition based JS template engine 
    <br />
    <a href="https://github.com/jepyio/jepy/issues">Report Bug</a>
    ·
    <a href="https://github.com/jepyio/jepy/issues">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About The Project

There are several amazing JS template engines out there, but most of them require multiple dependencies, must be pre-built and hard to expand if you need something specific. I wanted something tiny, reusable, and capable of rendering in real time with good performance. jepy solve all of these issues while keeping it size to the minimum

Here is what you get:

-   It is ~4KB
-   It doesn't require pre-building and doesn't have any external dependencies
-   This will provide you with powerful tools to create even the most complicated templates while making them reusable and expandable

The things you don't get:

-   It definitely does not work with IE11 (it is based on [classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)). Fortunately, it is mostly extinct
-   It might not work with really old Edge Legacy versions. These shouldn't be out in the wild anymore with the automatic updates, but possible if you didn't have any update from 2016

I do not consider this a disadvantage, but you may. Since Microsoft has already stopped supporting [IE11](https://learn.microsoft.com/en-us/lifecycle/products/internet-explorer-11) and the non-Chrome based [Edge Legacy](https://learn.microsoft.com/en-us/lifecycle/products/microsoft-edge-legacy), I would prefer not to bother supporting these.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Install

Build your own, use the "dist" folder's prebuilt files or use one of the following options.

### CDN

You may add jepy to your site using CDN by including either of the following code on your site.

Latest major version:

```
<script src="https://cdn.jsdelivr.net/gh/jepyio/jepy/dist/jepy.min.js"></script>
```

Specific version (recommended to avoid breaking changes):

```
<script src="https://cdn.jsdelivr.net/npm/jepy@2.3.4/dist/jepy.min.js"></script>
```

### npm

Run the following to add jepy to your project:

```
npm install jepy --save
```

## Usage

You can create your templates with the following building blocks. If you want to see how this works, go visit the examples page

### jepy.Template

The most powerful and adaptable building block available. This will fulfil most of your needs as a standalone logic and will cover what most template engines do. It could replace placeholders with an escaped or raw value, and add blocks or partials to insert a text, Block or execute a function on the parameters to render your placeholder value. This supports parameter paths so you can use the following format to point to a value "first-level.second-level.third-level...".

#### jepy.Template with raw value

This could be useful if you need to insert HTML into your template

```javascript
const templateBlock = new jepy.Template('<div>%{text}</div>');
templateBlock.render({
    text: '<img src="test.jpg">',
});
// output: <div><img src="test.jpg"></div>
```

#### jepy.Template with escaped value

This will escape special characters in the param you are passing to this

```javascript
const templateBlock = new jepy.Template('<div>${values.text}</div>');
templateBlock.render({
    values: {
        text: '<img src="test.jpg">',
    },
});
// output: <div>&#60;img src=&#34;test.jpg&#34;&#62;</div>
```

#### jepy.Template with partials

Partials can be used to add advanced fetures to your template. These could refer to a string, Block or a callback

```javascript
const templateBlock = new jepy.Template(
    '%{@rawPartialString}${@escapedPartialBlock}%{@rawPartialCallback}',
    {
        rawPartialString: '<img ',
        escapedPartialBlock: new jepy.Template('src="${imageUrl}"'),
        rawPartialCallback: (params) => params.endChar,
    },
);
templateBlock.render({
    imageUrl: 'test.jpg',
    endChar: '>',
});
// output: <img src=&#34;test.jpg&#34;>
```

#### jepy.Template with Conditional Block against a parameter

This is your simple "if ... else ..." building block. It is useful to build a simple logic based on a parameter

```javascript
const templateBlock = new jepy.Template(
    'Hello ?{firstName}${firstName}?{!firstName}guest?{/firstName}!',
);
templateBlock.render({
    firstName: 'Adam',
});
// output: Hello Adam!
templateBlock.render({
    firstName: '',
});
// output: Hello guest!
```

#### jepy.Template with Conditional Block against a partial

This is your more advance "if ... else ..." building block with a custom criteria

```javascript
const templateBlock = new jepy.Template('You are?{!@isSmith} not?{/@isSmith}? a Smith', {
    isSmith: (params) => params.lastName === 'Smith',
});
templateBlock.render({
    lastName: 'Smith',
});
// output: You are a Smith
templateBlock.render({
    lastName: 'Wolf',
});
// output: You are not a Smith
```

#### jepy.Template with simple Repeating Block

This is your "foreach ..." building block. You may use the loop.index, loop.first, loop.last, loop.number, and loop.size parameters inside this block to render or set criteria against it

```javascript
const templateBlock = new jepy.Template(
    '#{items}#${loop.number} - ${name} ?{!inStock}[Not in stock]?{/inStock}?{!loop.last}, ?{/loop.last}#{/items}',
);
templateBlock.render({
    items: [
        {
            name: 'pen',
            inStock: true,
        },
        {
            name: 'apple',
            inStock: false,
        },
    ],
});
// output: #1 - pen, #2 - apple [Not in stock]
```

#### jepy.Template with Repeating Block using an alias

This is your "foreach ... as ..." building block. It is useful when you have an array of items that you cannot refer by name

```javascript
const templateBlock = new jepy.Template('#{items:item}${item},#{/items}');
templateBlock.render({
    items: ['apple', 'pen'],
});
// output: apple,pen,
```

#### jepy.Template with Idented Block using spaces

```javascript
const templateBlock = new jepy.Template('_{indentedBlock:1}${text}_{/indentedBlock}');
templateBlock.render({
    text: 'space indented text',
});
// output: " space indented text"
```

#### jepy.Template with Idented Block using tabs

```javascript
const templateBlock = new jepy.Template('>{indentedBlock:2}${text}>{/indentedBlock}');
templateBlock.render({
    text: 'tab indented text',
});
// output: "\t\ttab indented text"
```

#### jepy.Template with Cached Block

```javascript
const templateBlock = new jepy.Template(
    '={cachedBlock}${text} ={/cachedBlock}={cachedBlock}={/cachedBlock}',
);
templateBlock.render({
    text: 'cached text',
});
// output: cached text cached text
```

### jepy.Simple

This is the most basic building block, with no performance implications. The text you specified will be returned. Nothing flashy, but practical for jepy.Conditional and jepy.Composite, because these require a Block to render. This may be replaced with jepy.Template, although with a performance impact.

```javascript
const simpleBlock = new jepy.Simple('<div>Hello World</div>');
simpleBlock.render();
// output: <div>Hello World</div>
```

### jepy.Conditional

This is your "if ... else ..." building block. It needs a function to check the condition on the params, a Block when the condition is true, and an optional Block when the condition is false. This condition function can be as simple or complicated as you want, so it should meet all your needs.

```javascript
// without optional "else"
const conditionalBlock = new jepy.Conditional(
    (params) => params.who !== undefined,
    new jepy.Template('<div>Hello ${who}</div>'),
);
conditionalBlock.render();
// output:

conditionalBlock.render({
    who: 'World',
});
// output: <div>Hello World</div>

// with "else"
const conditionalBlock = new jepy.Conditional(
    (params) => params.who !== undefined,
    new jepy.Template('<div>Hello ${who}</div>'),
    new jepy.Simple("<div>Sorry, I don't have your name</div>"),
);
conditionalBlock.render();
// output: <div>Sorry, I don\'t have your name</div>

conditionalBlock.render({
    who: 'Adam',
});
// output: <div>Hello Adam</div>
```

### jepy.Repeating

This is your "foreach ..." building block. This needs a path (same format as the placeholders) to an array parameter, a Block to render the values of the array and an optional function to modify or add parameters. By default only the item parameters will be passed to the Block, so you may need to add this optional function to pass other parameters

```javascript
// without parameter modifier function
const repeatingBlock = new jepy.Repeating('items', new jepy.Template('<div>#${id} ${name}</div>'));
repeatingBlock.render({
    items: [
        {
            id: 1,
            name: 'first',
        },
        {
            id: 2,
            name: 'second',
        },
    ],
});
// output: <div>#1 first</div><div>#2 second</div>

// with parameter modifier
const repeatingBlock = new jepy.Repeating(
    'items',
    new jepy.Template('<div>#${id} ${colour} ${name}</div>'),
    (item, params) => {
        item.name = params.itemName;
        return item;
    },
);
repeatingBlock.render({
    itemName: 'pencil',
    items: [
        {
            id: 1,
            colour: 'green',
        },
        {
            id: 2,
            colour: 'red',
        },
    ],
});
// output: <div>#1 green pencil</div><div>#2 red pencil</div>
```

### jepy.Composite

This is used to stich together multiple Blocks into one. You can use this to make complex and extendable templates

```javascript
const compositeBlock = new jepy.Composite([
    new jepy.Simple('<div>'),
    new jepy.Template('<div>Hello ${who}</div>'),
    new jepy.Repeating('items', new jepy.Template('<div>#${id} ${name}</div>')),
    new jepy.Simple('</div>'),
]);
compositeBlock.render({
    who: 'World',
    items: [
        {
            id: 1,
            name: 'first',
        },
        {
            id: 2,
            name: 'second',
        },
    ],
});
// output: <div><div>Hello World</div><div>#1 first</div><div>#2 second</div></div>
```

### jepy.Callback

Use this if you want something with complicated logic that is also self-contained. This will return the text produced by the callback function that was passed on initialisation.

```javascript
const callbackBlock = new jepy.Callback((params) => {
    const itemCount = params.items.length;
    const singularOrPlural = (noun, counter) => (counter > 1 ? noun + 's' : noun);
    const basketBlock = new jepy.Template(
        '<div>You have ${itemCount} ${itemText} in your basket</div>',
    );
    return basketBlock.render({
        itemCount: itemCount,
        itemText: singularOrPlural('item', itemCount),
    });
});
callbackBlock.render({
    items: ['pineapple', 'pen'],
});
// output: <div>You have 2 items in your basket</div>
```

### jepy.Cached

It will return the cached value of a Block on subsequent render requests to boost the performance. You can validate against this cached value with the optional validation callback in case the value need to be updated on param changes. Without the validation callback the cached value will never update for that run session. This could be useful if you cache something that should be static. Do not cache a block that only rendered once as it won't give you any advantage.

```javascript
const cachedBlock = new jepy.Cached(
    new jepy.Composite([
        new jepy.Callback((params) =>
            params.name === undefined ? '' : 'Hello ' + params.name + '.',
        ),
        new jepy.Simple('This is a test'),
    ]),
    (params, block) => {
        const isValid = block.name === params.name;
        if (!isValid) {
            block.name = params.name;
        }
        return isValid;
    },
);
const templateParams = {
    name: 'Adam',
};
cachedBlock.render(templateParams);
// output (non-cached, rendered in runtime): Hello Adam. This is a test
cachedBlock.render(templateParams);
// output (returned from cache): Hello Adam. This is a test
cachedBlock.render();
// output (non-cached, rendered in runtime): This is a test
cachedBlock.render();
// output (returned from cache): This is a test
```

### jepy.Indented

This can be used to indent a single or multi-line Block.

```javascript
const compositeBlock = new jepy.Composite([
    new jepy.Simple('<div>\n'),
    new jepy.Indented(
        new jepy.Template('<div>\n    %{name}\n</div>')
        jepy.IndentType.SPACE,
        4
    ),
    new jepy.Simple('\n</div>'),
]);
const templateParams = {
    name: 'Adam'
};
compositeBlock.render(templateParams);
/**
 * output:
 * <div>
 *     <div>
 *         Adam
 *     </div>
 * </div>
 */
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

-   [x] Add basic building blocks and Block interface for custom classes
-   [x] Improve the "Usage" part of this README
-   [x] Add optional parser to generate and cache blocks based on a simple template format
-   [x] Add special parameters like "loop.first" and "loop.last" that could be used inside a Repeating block in jepy.Template
-   [x] Add the "else" tag to Conditional blocks in jepy.Template to make it more readable and lean
-   [ ] Add an option for validation partial to the Cached blocks in jepy.Template

See the [open issues](https://github.com/jepyio/jepy/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Your support is **greatly appreciated**! If you have ideas for enhancements, please fork the repository and submit a pull request to the "development" branch. Remember to execute "npm run build" before committing to ensure that everything is still working! You can alternatively create a new issue with the tag "enhancement". Don't forget to star the project! Thank you once more!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Sandor - sandor@jepy.io

<p align="right">(<a href="#readme-top">back to top</a>)</p>
