<a name="readme-top"></a>
<div align="center">
  <a href="https://github.com/jepyio/jepy">
    <img src="images/logo.svg" alt="Logo" height="80">
  </a>

  <p align="center">
    Tiny and simple to use composition based JS template engine 
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

There are several amazing JS template engines out there, but most of them require multiple dependencies or must be pre-built. I wanted something tiny, reusable, and capable of rendering in real time with good performance. Hopefully, jepy will meet all of these goals and prove to be an useful tool for your projects too!

Here is what you get:
* It is only ~1KB minimised
* This will give you everything you need to make templates that are reusable and easy to expand
* You can use the Block interface to expand it for your needs

The things you don't get:
* It does not work with browser versions older than 2020 (requires matchAll support), which I do not consider a disadvantage, but you may. Since Microsoft has already stopped supporting IE11 and non-Chrome based Edge and there have been considerable updates over the past few years, I would prefer not to change this. Request it as a feature if it's a deal-breaker, and I'll give it some thought.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

Build your own or use the "dist" folder's prebuilt JavaScript file. To create your templates, you can use the following building blocks from this section. I'll add more examples to this section in the future, but for now, check out the examples page if you want to see how these are used.

### Building blocks

#### jepy.Simple

It could be used to return a simple string

```javascript
const simpleBlock = new jepy.Simple('<div>Hello World</div>');
simpleBlock.render(); 
// output: <div>Hello World</div>
```

#### jepy.Placeholder

This is to return a string with escaped and raw values or add a "partial" placeholder to execute a function on the parameters

```javascript
const placeholderBlock = new jepy.Placeholder('<div>Hello ${who}</div>');
placeholderBlock.render({
    who: 'World'
});
// output: <div>Hello World</div>
```

#### jepy.Conditional

It is used to return Blocks based on the condition function return. This is your "if ... else ..." building block

```javascript
const conditionalBlock = new jepy.Conditional(
    (params) => params.who !== undefined,
    new jepy.Placeholder('<div>Hello ${who}</div>'),
    new jepy.Simple('<div>Hi</div>')
);
conditionalBlock.render();
// output: <div>Hi</div>

conditionalBlock.render({
    who: 'World'
});
// output: <div>Hello World</div>
```

#### jepy.Repeating

This is to return repeating strings based on an array parameter. This is your "foreach ..." building block

```javascript
const repeatingBlock = new jepy.Repeating(
    'items',
    new jepy.Placeholder('<div>#${id} ${name}</div>')
);
repeatingBlock.render({
    items: [
        {
            id: 1,
            name: 'first'
        },
        {
            id: 2,
            name: 'second'
        }
    ]
});
// output: <div>#1 first</div><div>#2 second</div>
```

#### jepy.Composite

This is used to stich together multiple Blocks into one

```javascript
const compositeBlock = new jepy.Composite([
    new jepy.Simple('<div>'),
    new jepy.Placeholder('<div>Hello ${who}</div>'),
    new jepy.Repeating(
        'items',
        new jepy.Placeholder('<div>#${id} ${name}</div>')
    ),
    new jepy.Simple('</div>'),
]);
compositeBlock.render({
    who: 'World',
    items: [
        {
            id: 1,
            name: 'first'
        },
        {
            id: 2,
            name: 'second'
        }
    ]
});
// output: <div><div>Hello World</div><div>#1 first</div><div>#2 second</div></div>
```

#### jepy.Callback

Use this if you want something with complicated logic that is also self-contained. This will return the text produced by the callback function that was passed on initialisation.

```javascript
const callbackBlock = new jepy.Callback((params) => {
    const itemCount = params.items.length;
    const singularOrPlural = (noun, counter) => (counter > 1 ? noun + 's' : noun);
    const basketBlock = new jepy.Placeholder(
        '<div>You have ${itemCount} ${itemText} in your basket</div>'
    );
    return basketBlock.render({
        itemCount: itemCount,
        itemText: singularOrPlural('item', itemCount)
    });
});
callbackBlock.render({
    items: [
        'pineapple',
        'pen'
    ]
});
// output: <div>You have 2 items in your basket</div>
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [x] Add basic building blocks and Block interface for custom classes
- [ ] Improve the "Usage" part of this README 
- [ ] Add optional parser to generate and cache blocks based on a simple template format 

See the [open issues](https://github.com/jepyio/jepy/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Your support is **greatly appreciated**! If you have ideas for enhancements, please fork the repository and submit a pull request to the "development" branch. Remember to execute "npm run test" before committing to ensure that everything is still working! You can alternatively create a new issue with the tag "enhancement". Don't forget to star the project! Thank you once more!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Sandor - sandor@jepy.io

<p align="right">(<a href="#readme-top">back to top</a>)</p>

