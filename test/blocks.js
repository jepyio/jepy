import {assert} from 'chai';
import jepy from '../src/index.js';

describe('test simple block', function () {
    it('return must be an unescaped string', function () {
        const block = new jepy.Simple('<div>test</div>');
        assert.equal(block.render(), '<div>test</div>');
    });
});
describe('test template block', function () {
    it('placeholder must be replaced with an unescaped string', function () {
        const block = new jepy.Template('<div>%{element}</div>');
        assert.equal(
            block.render({
                element: '<div>element</div>',
            }),
            '<div><div>element</div></div>',
        );
    });
    it('placeholder must be replaced with upper case string', function () {
        const block = new jepy.Template('%{text|upper}');
        assert.equal(
            block.render({
                text: 'test',
            }),
            'TEST',
        );
    });
    it('placeholder must be replaced with lower case string', function () {
        const block = new jepy.Template('%{text|lower}');
        assert.equal(
            block.render({
                text: 'TEST',
            }),
            'test',
        );
    });
    it('placeholder must be replaced with the capitalised string', function () {
        const block = new jepy.Template('%{text|capitalize}');
        assert.equal(
            block.render({
                text: 'this is a test',
            }),
            'This is a test',
        );
    });
    it('placeholder must be replaced with trimmed string', function () {
        const block = new jepy.Template('%{text|trim}');
        assert.equal(
            block.render({
                text: '   test   ',
            }),
            'test',
        );
    });
    it('placeholder must be replaced with the first element of array', function () {
        const block = new jepy.Template('%{items|first}');
        assert.equal(
            block.render({
                items: ['first', 'second', 'third'],
            }),
            'first',
        );
    });
    it('placeholder must be replaced with the last element of array', function () {
        const block = new jepy.Template('%{items|last}');
        assert.equal(
            block.render({
                items: ['first', 'second', 'third'],
            }),
            'third',
        );
    });
    it('placeholder must be replaced with the min element of array', function () {
        const block = new jepy.Template('%{items|min}');
        assert.equal(
            block.render({
                items: [5, 1, 9, 3],
            }),
            '1',
        );
    });
    it('placeholder must be replaced with the max element of array', function () {
        const block = new jepy.Template('%{items|max}');
        assert.equal(
            block.render({
                items: [5, 1, 9, 3],
            }),
            '9',
        );
    });
    it('placeholder must be replaced with the json stringified array', function () {
        const block = new jepy.Template('%{items|stringify}');
        assert.equal(
            block.render({
                items: ['first', 'second', 'third'],
            }),
            '["first","second","third"]',
        );
    });
    it('placeholder must be replaced with the absolute number', function () {
        const block = new jepy.Template('%{number|abs}');
        assert.equal(
            block.render({
                number: -1,
            }),
            '1',
        );
    });
    it('placeholder must be replaced with the rounded number', function () {
        const block = new jepy.Template('%{number|round}');
        assert.equal(
            block.render({
                number: 1.09,
            }),
            '1',
        );
    });
    it('placeholder must be replaced with the rounded up number', function () {
        const block = new jepy.Template('%{number|ceil}');
        assert.equal(
            block.render({
                number: 1.09,
            }),
            '2',
        );
    });
    it('placeholder must be replaced with the rounded down number', function () {
        const block = new jepy.Template('%{number|floor}');
        assert.equal(
            block.render({
                number: 1.79,
            }),
            '1',
        );
    });
    it('use multi level path for placeholder value', function () {
        const block = new jepy.Template('<div>%{first.second.third}</div>');
        assert.equal(
            block.render({
                first: {
                    second: {
                        third: '<div>element</div>',
                    },
                },
            }),
            '<div><div>element</div></div>',
        );
    });
    it('escape html in text', function () {
        const block = new jepy.Template('<div>${text}</div>');
        assert.equal(
            block.render({
                text: '<img src="test.jpg">',
            }),
            '<div>&#60;img src=&#34;test.jpg&#34;&#62;</div>',
        );
    });
    it('escape surrogate pair rocket emoji', function () {
        const block = new jepy.Template('<div>${text}</div>');
        assert.equal(
            block.render({
                text: '🚀',
            }),
            '<div>&#55357;&#56960;</div>',
        );
    });
    it('partial must be replaced with unescaped string', function () {
        const block = new jepy.Template('<div>%{@partial}</div>', {
            partial: '<div>element</div>',
        });
        assert.equal(block.render(), '<div><div>element</div></div>');
    });
    it('partial must be replaced with unescaped function return', function () {
        const block = new jepy.Template('<div>${@partial}</div>', {
            partial: (params) => 'Hello ' + params.name,
        });
        assert.equal(
            block.render({
                name: 'John',
            }),
            '<div>Hello John</div>',
        );
    });
    it('partial must be replaced with block content', function () {
        const block = new jepy.Template('<div>${@partial}</div>', {
            partial: new jepy.Conditional(
                (params) => params.isVisible,
                new jepy.Simple('Am I visible?'),
            ),
        });
        assert.equal(
            block.render({
                isVisible: true,
            }),
            '<div>Am I visible?</div>',
        );
    });
    it('conditional block only rendering when value is truly', function () {
        const block = new jepy.Template(
            '?{firstName}${firstName}?{/firstName}?{lastName} ${lastName}?{/lastName}',
        );
        assert.equal(
            block.render({
                firstName: 'Adam',
                lastName: '',
            }),
            'Adam',
        );
    });
    it('conditional block with partial and false return', function () {
        const block = new jepy.Template(
            '?{@hasFirstAndLastName}${firstName} ${lastName}?{/@hasFirstAndLastName}',
            {
                hasFirstAndLastName: (params) => params.firstName && params.lastName,
            },
        );
        assert.equal(
            block.render({
                firstName: 'Adam',
            }),
            '',
        );
    });
    it('conditional block with partial and true return', function () {
        const block = new jepy.Template(
            '?{@hasFirstAndLastName}${firstName} ${lastName}?{/@hasFirstAndLastName}',
            {
                hasFirstAndLastName: (params) => params.firstName && params.lastName,
            },
        );
        assert.equal(
            block.render({
                firstName: 'Adam',
                lastName: 'Smith',
            }),
            'Adam Smith',
        );
    });
    it('conditional block with partial, not operator and falsey return', function () {
        const block = new jepy.Template('?{!@isLastNameSmith}not ?{/@isLastNameSmith}Smith', {
            isLastNameSmith: (params) => params.lastName && params.lastName === 'Smith',
        });
        assert.equal(
            block.render({
                lastName: 'Wolf',
            }),
            'not Smith',
        );
    });
    it('conditional block with partial, not operator and truly', function () {
        const block = new jepy.Template('?{!@isLastNameSmith}not ?{/@isLastNameSmith}Smith', {
            isLastNameSmith: (params) => params.lastName && params.lastName === 'Smith',
        });
        assert.equal(
            block.render({
                lastName: 'Smith',
            }),
            'Smith',
        );
    });
    it('conditional block with else tag with truly', function () {
        const block = new jepy.Template(
            'Hello ?{firstName}${firstName}?{!firstName}guest?{/firstName}',
        );
        assert.equal(
            block.render({
                firstName: 'Adam',
            }),
            'Hello Adam',
        );
    });
    it('conditional block with else tag with falsy', function () {
        const block = new jepy.Template(
            'Hello ?{firstName}${firstName}?{!firstName}guest?{/firstName}',
        );
        assert.equal(
            block.render({
                firstName: '',
            }),
            'Hello guest',
        );
    });
    it('conditional block with else tag with not operator and truly', function () {
        const block = new jepy.Template(
            'Hello ?{!firstName}guest?{firstName}${firstName}?{/firstName}',
        );
        assert.equal(
            block.render({
                firstName: 'Adam',
            }),
            'Hello Adam',
        );
    });
    it('conditional block with else tag with not operator and falsy', function () {
        const block = new jepy.Template(
            'Hello ?{!firstName}guest?{firstName}${firstName}?{/firstName}',
        );
        assert.equal(
            block.render({
                firstName: '',
            }),
            'Hello guest',
        );
    });
    it('space indented text', function () {
        const block = new jepy.Template('_{test:4}space indented text_{/test}');
        assert.equal(block.render(), '    space indented text');
    });
    it('space indented multi line text', function () {
        const block = new jepy.Template('_{test:4}space indented\nmulti line text_{/test}');
        assert.equal(block.render(), '    space indented\n    multi line text');
    });
    it('tab indented text', function () {
        const block = new jepy.Template('>{test:2}tab indented text>{/test}');
        assert.equal(block.render(), '\t\ttab indented text');
    });
    it('repeating block without alias', function () {
        const block = new jepy.Template('#{items}${name} #{/items}');
        assert.equal(
            block.render({
                items: [
                    {
                        name: 'item1',
                    },
                    {
                        name: 'item2',
                    },
                ],
            }),
            'item1 item2 ',
        );
    });
    it('loop variables', function () {
        const block = new jepy.Template(
            '#{items}${loop.number}/${loop.size} ${name}' +
                ' > #{subItems} ${loop.number}/${loop.size} ${name}#{/subItems}?{!loop.last}\n?{/loop.last}#{/items}',
        );
        assert.equal(
            block.render({
                items: [
                    {
                        name: 'item1',
                        subItems: [
                            {
                                name: 'subItem1',
                            },
                            {
                                name: 'subItem2',
                            },
                            {
                                name: 'subItem3',
                            },
                        ],
                    },
                    {
                        name: 'item2',
                        subItems: [
                            {
                                name: 'subItem1',
                            },
                            {
                                name: 'subItem2',
                            },
                        ],
                    },
                ],
            }),
            '1/2 item1 >  1/3 subItem1 2/3 subItem2 3/3 subItem3\n2/2 item2 >  1/2 subItem1 2/2 subItem2',
        );
    });
    it('repeating block with alias', function () {
        const block = new jepy.Template('#{items:item}${item} #{/items}');
        assert.equal(
            block.render({
                items: ['item1', 'item2'],
            }),
            'item1 item2 ',
        );
    });
    it('cached block is returning previously cached value', function () {
        const block = new jepy.Template(
            '={cachedBlock}cached block ={/cachedBlock}={cachedBlock}={/cachedBlock}',
        );
        assert.equal(block.render(), 'cached block cached block ');
    });
    it('cached block with validation', function () {
        const block = new jepy.Template(
            '#{items}${name} ={cachedBlock:@isSameGroup}[${group.name}]={/cachedBlock}?{!loop.last}, ?{/loop.last}#{/items}',
            {
                isSameGroup: (params, cachedParams) => params.group.id === cachedParams.group.id,
            },
        );
        assert.equal(
            block.render({
                items: [
                    {
                        name: 'item1',
                        group: {
                            id: 1,
                            name: 'group1',
                        },
                    },
                    {
                        name: 'item2',
                        group: {
                            id: 1,
                        },
                    },
                    {
                        name: 'item3',
                        group: {
                            id: 2,
                            name: 'group2',
                        },
                    },
                ],
            }),
            'item1 [group1], item2 [group1], item3 [group2]',
        );
    });
    it('indent multi line params', function () {
        const block = new jepy.Template(
            `<script type="importmap">
    %{json}
</script>`,
        );
        assert.equal(
            block.render({
                json: `{
    "test": 1
}`,
            }),
            `<script type="importmap">
    {
        "test": 1
    }
</script>`,
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
            new jepy.Conditional(() => true, new jepy.Simple(' are returned')),
        ]);
        assert.equal(block.render(), 'merged block contents are returned');
    });
});
describe('test repeating block', function () {
    it('returns repeating text', function () {
        const block = new jepy.Repeating(
            'items',
            new jepy.Template('<a href="${url}">${text}</a>'),
        );
        assert.equal(
            block.render({
                items: [
                    {
                        url: '/home',
                        text: 'home',
                    },
                    {
                        url: '/articles',
                        text: 'articles',
                    },
                ],
            }),
            '<a href="/home">home</a>' + '<a href="/articles">articles</a>',
        );
    });
    it('returns repeating text with callback', function () {
        const block = new jepy.Repeating(
            'items',
            new jepy.Template('${prefix} line #${line.number}</br>'),
            (item, params) => {
                params.line = {
                    number: item,
                };
                return params;
            },
        );
        assert.equal(
            block.render({
                prefix: 'this is',
                items: [1, 2, 3],
            }),
            'this is line #1</br>' + 'this is line #2</br>' + 'this is line #3</br>',
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
                    new jepy.Template(
                        '<div>You have ${@numberOfItems} ${@itemText} in your basket</div><ul>',
                        {
                            numberOfItems: (params) => params.items.length,
                            itemText: (params) => singularOrPlural('item', params.items.length),
                        },
                    ),
                    new jepy.Repeating(
                        'items',
                        new jepy.Template('<li><a href="${url}">%{@icon}${text}</a></li>', {
                            icon: (params) =>
                                params.outOfStock ? '<span class="out-of-stock"></span>' : '',
                        }),
                    ),
                    new jepy.Simple('</ul>'),
                ]),
                new jepy.Simple('<div>Your basket is empty</div>'),
            ),
            new jepy.Simple('</div>'),
        ]);
        assert.equal(
            block.render({
                items: [
                    {
                        url: '/item/1',
                        text: 'Pencil',
                        outOfStock: false,
                    },
                    {
                        url: '/item/2',
                        text: 'Pen',
                        outOfStock: true,
                    },
                ],
            }),
            '<div>Basket:<div>You have 2 items in your basket</div><ul>' +
                '<li><a href="/item/1">Pencil</a></li>' +
                '<li><a href="/item/2"><span class="out-of-stock"></span>Pen</a></li>' +
                '</ul></div>',
        );
        assert.equal(
            block.render({
                items: [
                    {
                        url: '/item/1',
                        text: 'Pencil',
                    },
                ],
            }),
            '<div>Basket:<div>You have 1 item in your basket</div><ul>' +
                '<li><a href="/item/1">Pencil</a></li>' +
                '</ul></div>',
        );
        assert.equal(
            block.render({
                items: [],
            }),
            '<div>Basket:<div>Your basket is empty</div></div>',
        );
    });
});
describe('test callback block', function () {
    it('should return the simple string from the block', function () {
        const block = new jepy.Callback(() => 'hello world');
        assert.equal(block.render(), 'hello world');
    });
    it('should return the generated string from the block', function () {
        const block = new jepy.Callback((params) => {
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
        assert.equal(
            block.render({
                items: [1],
            }),
            '<div>You have 1 item in your basket</div>',
        );
        assert.equal(
            block.render({
                items: [1, 2, 3],
            }),
            '<div>You have 3 items in your basket</div>',
        );
    });
});
describe('test cached block', function () {
    it('should return the simple block value', function () {
        const simpleBlock = new jepy.Simple('test me');
        const cachedBlock = new jepy.Cached(simpleBlock);
        assert.equal(cachedBlock.render(), simpleBlock.render());
    });
    it('should return the composite block value with validation', function () {
        const compositeBlock = new jepy.Composite([
            new jepy.Simple('merged '),
            new jepy.Template('<div>${@partial}</div>', {
                partial: (params) => (params.name === undefined ? '' : 'Hello ' + params.name),
            }),
            new jepy.Callback((params) =>
                params.name === undefined ? '' : 'Hello ' + params.name,
            ),
            new jepy.Conditional(
                (params) => params.name !== undefined,
                new jepy.Simple(' are returned'),
            ),
        ]);
        const cachedBlock = new jepy.Cached(compositeBlock, (params, cachedParams) => {
            const isValid = cachedParams.name === params.name;
            if (!isValid) {
                cachedParams.name = params.name;
            }
            return isValid;
        });
        const templateParamsOne = {
            name: 'John',
        };
        const compositeValueOne = compositeBlock.render(templateParamsOne);
        assert.equal(cachedBlock.render(templateParamsOne), compositeValueOne);
        const templateParamsTwo = {
            name: 'Adam',
        };
        const compositeValueTwo = compositeBlock.render(templateParamsTwo);
        assert.equal(cachedBlock.render(templateParamsTwo), compositeValueTwo);
    });
});
describe('test indented block', function () {
    it('should return the space indented value', function () {
        const simpleBlock = new jepy.Simple('test me');
        const indentedBlock = new jepy.Indented(simpleBlock, jepy.IndentType.SPACE, 4);
        assert.equal(indentedBlock.render(), '    ' + simpleBlock.render());
    });
    it('should return the tab indented value', function () {
        const simpleBlock = new jepy.Simple('test me');
        const indentedBlock = new jepy.Indented(simpleBlock, jepy.IndentType.TAB, 1);
        assert.equal(indentedBlock.render(), '\t' + simpleBlock.render());
    });
    it('should return the space indented multi line', function () {
        const simpleBlock = new jepy.Simple('<div>\n    test\n    me\n</div>');
        const indentedBlock = new jepy.Indented(simpleBlock, jepy.IndentType.SPACE, 4);
        assert.equal(indentedBlock.render(), '    <div>\n        test\n        me\n    </div>');
    });
    it('should return the tab indented multi line', function () {
        const simpleBlock = new jepy.Simple('<div>\n\ttest\n\tme\n</div>');
        const indentedBlock = new jepy.Indented(simpleBlock, jepy.IndentType.TAB, 1);
        assert.equal(indentedBlock.render(), '\t<div>\n\t\ttest\n\t\tme\n\t</div>');
    });
    it('should return the space indented multi line string', function () {
        const simpleBlock = new jepy.Simple(
            `<div>
    test
    me
</div>`,
        );
        const indentedBlock = new jepy.Indented(simpleBlock, jepy.IndentType.SPACE, 4);
        assert.equal(indentedBlock.render(), '    <div>\n        test\n        me\n    </div>');
    });
});
