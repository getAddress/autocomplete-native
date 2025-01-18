import pkg from "./package.json" assert { type: 'json' };
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';


export default [
    

    {
        input: "src/Index.ts",
        output: {
            file:"dist/getaddress-autocomplete-native-test.mjs",
            format:"es",
            sourcemap:  "inline"
        }
        ,plugins:[nodeResolve(), typescript({"outDir": null,"declaration": false})]
    },
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
        input: "dist/getaddress-autocomplete-native-" + pkg.version + ".mjs",
        output: 
            {
                file:"dist/getaddress-autocomplete-native-" + pkg.version + ".min.js",
                format:"iife",
                name:'getAddress'
            },
        plugins:[terser()]
    }
]