import {run, bench} from 'mitata';
import jepy from '../src/index.js';

const repeatingBlockTemplate = new jepy.Template('#{items}${name}#{/items}');
let items = [];
for (let i = 0; i < 1000; i++) {
    items.push({
        name: 'Lorem ipsum dolor sit amet',
    });
}
bench('repeating block', () =>
    repeatingBlockTemplate.render({
        items,
    }),
);

const repeatingBlockWithAliasTemplate = new jepy.Template(
    '#{arrayItems:item}${item}#{/arrayItems}',
);
let arrayItems = [];
for (let i = 0; i < 1000; i++) {
    arrayItems.push('Lorem ipsum dolor sit amet');
}
bench('repeating block with alias', () =>
    repeatingBlockWithAliasTemplate.render({
        arrayItems,
    }),
);

let placeholderStressTestTemplateString = '';
for (let i = 0; i < 1000; i++) {
    placeholderStressTestTemplateString += '${test}%{test}${@test}%{@test}';
}
const placeholderStressTestTemplate = new jepy.Template(placeholderStressTestTemplateString, {
    test: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla scelerisque metus at quam auctor accumsan.',
});
bench('placeholder stress test', () =>
    placeholderStressTestTemplate.render({
        test: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla scelerisque metus at quam auctor accumsan.',
    }),
);

let linesToIndent = [];
for (let i = 0; i < 500; i++) {
    linesToIndent.push('Lorem ipsum dolor sit amet');
}
const indentedBlock = new jepy.Template('_{indentedBlock:100}%{linesToIndent}_{/indentedBlock}');
bench('indented block', () =>
    indentedBlock.render({
        linesToIndent: linesToIndent.join('\n'),
    }),
);

const complexTemplate = new jepy.Template(
    `
\${value}
                %{value}
 %{@value}
 \${@value}
Fusce nisi neque, cursus quis justo vel, vulputate molestie massa. Suspendisse ut dignissim risus. Proin nunc velit, egestas nec congue at, volutpat luctus justo. Suspendisse pulvinar scelerisque euismod. Proin vitae nulla risus. Mauris a feugiat est, imperdiet maximus lorem. Nam placerat, libero ac facilisis condimentum, urna dui accumsan nibh, in tristique tortor velit ut nibh.
_{spaceIndented:20}\${multiLine}_{/spaceIndented}
>{tabIndented:10}\${multiLine}>{/tabIndented}%{@value}
?{value}a?{!value}a?{/value}
?{items}a?{!items}a?{/items}
?{arrayItems}a?{!arrayItems}a?{/arrayItems}
?{@true}a?{!@true}a?{/@true}
?{@number}a?{!@number}a?{/@number}
?{@value}a?{!@value}a?{/@value}
#{items}\${name}#{/items}
#{arrayItems:item}\${item}#{/arrayItems}
={cachedBlock}cached block ={/cachedBlock}={cachedBlock}={/cachedBlock}={cachedBlock}={/cachedBlock}
`,
    {
        true: () => true,
        number: () => 1,
        value: () =>
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla scelerisque metus at quam auctor accumsan. Donec ac gravida augue, ut laoreet elit. Duis vitae nisl cursus, luctus elit vel, porta ex. Etiam at libero sagittis, suscipit lacus ac, tempus purus. Ut ut egestas ex. Maecenas nibh arcu, luctus nec varius in, imperdiet vel ex. Fusce ante est, interdum nec efficitur sit amet, ullamcorper fringilla quam.',
    },
);
bench('complex template', () =>
    complexTemplate.render({
        value: 'Vivamus at justo lobortis, ultrices ligula nec, vulputate sapien. Curabitur condimentum tortor eu vestibulum auctor. Quisque non libero vehicula, dapibus velit quis, consectetur sem. Quisque aliquet efficitur hendrerit. Integer mollis velit in elit viverra, sit amet ultrices est rhoncus. Sed pulvinar est sed enim cursus fringilla. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Proin semper libero vitae mauris vestibulum, et elementum lectus tincidunt. Duis iaculis felis at luctus gravida. Sed maximus massa et libero malesuada, eget euismod odio sollicitudin. Fusce posuere tempus porta. Praesent eu faucibus purus. Phasellus ac lorem sollicitudin, tristique velit ut, eleifend metus.',
        items,
        arrayItems,
        multiLine: `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla scelerisque metus at quam auctor accumsan. Donec ac gravida augue, ut laoreet elit. Duis vitae nisl cursus, luctus elit vel, porta ex. Etiam at libero sagittis, suscipit lacus ac, tempus purus. Ut ut egestas ex. Maecenas nibh arcu, luctus nec varius in, imperdiet vel ex. Fusce ante est, interdum nec efficitur sit amet, ullamcorper fringilla quam.

Vivamus at justo lobortis, ultrices ligula nec, vulputate sapien. Curabitur condimentum tortor eu vestibulum auctor. Quisque non libero vehicula, dapibus velit quis, consectetur sem. Quisque aliquet efficitur hendrerit. Integer mollis velit in elit viverra, sit amet ultrices est rhoncus. Sed pulvinar est sed enim cursus fringilla. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Proin semper libero vitae mauris vestibulum, et elementum lectus tincidunt. Duis iaculis felis at luctus gravida. Sed maximus massa et libero malesuada, eget euismod odio sollicitudin. Fusce posuere tempus porta. Praesent eu faucibus purus. Phasellus ac lorem sollicitudin, tristique velit ut, eleifend metus.

Fusce nisi neque, cursus quis justo vel, vulputate molestie massa. Suspendisse ut dignissim risus. Proin nunc velit, egestas nec congue at, volutpat luctus justo. Suspendisse pulvinar scelerisque euismod. Proin vitae nulla risus. Mauris a feugiat est, imperdiet maximus lorem. Nam placerat, libero ac facilisis condimentum, urna dui accumsan nibh, in tristique tortor velit ut nibh.

Sed imperdiet consequat dui. Sed scelerisque sodales dolor, vel hendrerit nibh. Integer sed risus ex. Vivamus non augue faucibus, vulputate eros non, luctus metus. Donec in malesuada sem, non viverra nisl. Nunc ornare nulla nec erat vulputate rutrum non vel urna. In egestas, est nec ultricies pharetra, sapien nisi auctor lacus, sed ultricies ante libero nec ex. Duis tempus eros vitae dolor fermentum, non malesuada sem congue. Vivamus elementum malesuada ligula, a semper augue tincidunt eget. Vestibulum egestas vehicula dui ac scelerisque.
`,
    }),
);

await run();
