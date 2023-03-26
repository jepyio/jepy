export default {
    input: 'src/index.js',
    treeshake: false,
    output: {
        file: 'dist/jepy.js',
        format: 'iife',
        name: 'jepy'
    }
};
