import {assert} from 'chai';
import jepy from '../src/index.js';

describe('test simple block', function () {
    it('return must be an unescaped string', function () {
        const block = new jepy.Simple('<div>test</div>');
        assert.equal(block.render(), '<div>test</div>');
    });
});
describe('test placeholder block', function () {
    it('placeholder must be replaced with an unescaped string', function () {
        const block = new jepy.Placeholder('<div>%{element}</div>');
        assert.equal(
            block.render({
                element: '<div>element</div>'
            }),
            '<div><div>element</div></div>'
        );
    });
    it('use multi level path for placeholder value', function () {
        const block = new jepy.Placeholder('<div>%{first.second.third}</div>');
        assert.equal(
            block.render({
                first: {
                    second: {
                        third: '<div>element</div>'
                    }
                }
            }),
            '<div><div>element</div></div>'
        );
    });
    it('escape html in text', function () {
        const block = new jepy.Placeholder('<div>${text}</div>');
        assert.equal(
            block.render({
                text: '<img src="test.jpg">'
            }),
            '<div>&#60;img src=&#34;test.jpg&#34;&#62;</div>'
        );
    });
    it('escape surrogate pair rocket emoji', function () {
        const block = new jepy.Placeholder('<div>${text}</div>');
        assert.equal(
            block.render({
                text: '🚀'
            }),
            '<div>&#55357;&#56960;</div>'
        );
    });
    it('partial must be replaced with unescaped string', function () {
        const block = new jepy.Placeholder('<div>@{partial}</div>', {
            partial: '<div>element</div>'
        });
        assert.equal(block.render(), '<div><div>element</div></div>');
    });
    it('partial must be replaced with unescaped function return', function () {
        const block = new jepy.Placeholder('<div>@{partial}</div>', {
            partial: (params) => 'Hello ' + params.name
        });
        assert.equal(
            block.render({
                name: 'John'
            }),
            '<div>Hello John</div>'
        );
    });
    it('partial must be replaced with block content', function () {
        const block = new jepy.Placeholder('<div>@{partial}</div>', {
            partial: new jepy.Conditional(
                (params) => params.isVisible,
                new jepy.Simple('Am I visible?')
            )
        });
        assert.equal(
            block.render({
                isVisible: true
            }),
            '<div>Am I visible?</div>'
        );
    });
});
describe('test conditional block', function () {
    it('should return the block content when condition is true', function () {
        const block = new jepy.Conditional(() => true, new jepy.Simple('block content'));
        assert.equal(block.render(), 'block content');
    });
    it('should return an empty string when condition is false', function () {
        const block = new jepy.Conditional(() => false, new jepy.Simple('block content'));
        assert.equal(block.render(), '');
    });
});
describe('test composite block', function () {
    it('should return the merged block contents', function () {
        const block = new jepy.Composite([
            new jepy.Simple('merged '),
            new jepy.Simple('block contents'),
            new jepy.Conditional(() => true, new jepy.Simple(' are returned'))
        ]);
        assert.equal(block.render(), 'merged block contents are returned');
    });
});
describe('test repeating block', function () {
    it('returns repeating text', function () {
        const block = new jepy.Repeating(
            'items',
            new jepy.Placeholder('<a href="${url}">${text}</a>')
        );
        assert.equal(
            block.render({
                items: [
                    {
                        url: '/home',
                        text: 'home'
                    },
                    {
                        url: '/articles',
                        text: 'articles'
                    }
                ]
            }),
            '<a href="/home">home</a>' + '<a href="/articles">articles</a>'
        );
    });
    it('returns repeating text with callback', function () {
        const block = new jepy.Repeating(
            'items',
            new jepy.Placeholder('${prefix} line #${line.number}</br>'),
            (item, params) => {
                params.line = {
                    number: item
                };
                return params;
            }
        );
        assert.equal(
            block.render({
                prefix: 'this is',
                items: [1, 2, 3]
            }),
            'this is line #1</br>' + 'this is line #2</br>' + 'this is line #3</br>'
        );
    });
});
describe('test complex block chain', function () {
    it('should return the composite of blocks', function () {
        const singularOrPlural = (noun, counter) => (counter > 1 ? noun + 's' : noun);
        const block = new jepy.Composite([
            new jepy.Simple('<div>Basket:'),
            new jepy.Conditional(
                (params) => params.items.length > 0,
                new jepy.Composite([
                    new jepy.Placeholder(
                        '<div>You have @{numberOfItems} @{itemText} in your basket</div><ul>',
                        {
                            numberOfItems: (params) => params.items.length,
                            itemText: (params) => singularOrPlural('item', params.items.length)
                        }
                    ),
                    new jepy.Repeating(
                        'items',
                        new jepy.Placeholder('<li><a href="${url}">@{icon}${text}</a></li>', {
                            icon: (params) =>
                                params.outOfStock ? '<span class="out-of-stock"></span>' : ''
                        })
                    ),
                    new jepy.Simple('</ul>')
                ]),
                new jepy.Simple('<div>Your basket is empty</div>')
            ),
            new jepy.Simple('</div>')
        ]);
        assert.equal(
            block.render({
                items: [
                    {
                        url: '/item/1',
                        text: 'Pencil',
                        outOfStock: false
                    },
                    {
                        url: '/item/2',
                        text: 'Pen',
                        outOfStock: true
                    }
                ]
            }),
            '<div>Basket:<div>You have 2 items in your basket</div><ul>' +
                '<li><a href="/item/1">Pencil</a></li>' +
                '<li><a href="/item/2"><span class="out-of-stock"></span>Pen</a></li>' +
                '</ul></div>'
        );
        assert.equal(
            block.render({
                items: [
                    {
                        url: '/item/1',
                        text: 'Pencil'
                    }
                ]
            }),
            '<div>Basket:<div>You have 1 item in your basket</div><ul>' +
                '<li><a href="/item/1">Pencil</a></li>' +
                '</ul></div>'
        );
        assert.equal(
            block.render({
                items: []
            }),
            '<div>Basket:<div>Your basket is empty</div></div>'
        );
    });
});
