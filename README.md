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
* It is only ~2KB minimised
* This will give you everything you need to make templates that are reusable and easy to expand
* You can use the Block interface to expand it for your needs

The things you don't get:
* It does not work with browser versions older than 2020 (requires matchAll support), which I do not consider a disadvantage, but you may. Since Microsoft has already stopped supporting IE11 and non-Chrome based Edge and there have been considerable updates over the past few years, I would prefer not to change this. Request it as a feature if it's a deal-breaker, and I'll give it some thought.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

Either build your own or use the prebuilt JS files from the dist folder. Create your own or use the pre-made building blocks and call render({}) with the related template params. I will expand this part more in the future to give you better examples till then take a look at the examples page

### Building blocks

#### jepy.Simple

It could be used to return simple text or html elements

#### jepy.Placeholder

This is to return text or html elements with escaped and raw values or add a "partial" placeholder to execute a function on the parameters

#### jepy.Conditional

It is used to return Blocks based on a function return. This is your "if ... else ..." building block

#### jepy.Repeating

This is to return repeating text or html elements based on an array parameter. This is your "foreach ..." building block

#### jepy.Composite

This is used to stich together multiple Blocks into one

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [x] Add basic building blocks and Block interface for custom classes
- [ ] Improve the "Usage" part of this README 
- [ ] Add optional parser to generate and cache blocks based on a simple template format 

See the [open issues](https://github.com/jepyio/jepy/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Sandor - sandor@jepy.io

<p align="right">(<a href="#readme-top">back to top</a>)</p>
