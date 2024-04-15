import pkg from "./package.json" assert { type: 'json' };
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';


export default [
    
    {
        input: "lib/Index.js",
        output: {
            file:"dist/getaddress-autocomplete-native-" + pkg.version + ".mjs",
            format:"es",
            sourcemap:  "inline"
        }
        ,plugins:[nodeResolve()]
    },
    {
        input: "lib/Index.js",
        output: 
            {
                file:"dist/getaddress-autocomplete-native-" + pkg.version + ".js",
                format:"iife", 
                name:'getAddress',
                sourcemap:  "inline"
            }
        
        ,plugins:[nodeResolve()]
    },
    {
        input: "dist/getaddress-autocomplete-native-" + pkg.version + ".js",
        output: 
            {
                file:"dist/getaddress-autocomplete-native-" + pkg.version + ".min.js",
                format:"iife",
                name:'getAddress'
            },
        plugins:[terser()]
    }
]