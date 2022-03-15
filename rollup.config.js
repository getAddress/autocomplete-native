import {version} from "./package.json";  
import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from "rollup-plugin-ts";
import {terser} from 'rollup-plugin-terser';


export default [
    
    {
        input: "src/GetAddress.ts",
        output: {
            file:"dist/getaddress-autocomplete-native.mjs",
            format:"es",
            sourcemap:  "inline"
        }
        ,plugins:[nodeResolve(),ts()]
    },
    {
        input: "src/GetAddress.ts",
        output: 
            {
                file:"dist/getaddress-autocomplete-native-" + version + ".js",
                format:"iife", 
                name:'getAddress',
                sourcemap:  "inline"
            }
        
        ,plugins:[nodeResolve(),ts(
            {tsconfig: {
                declaration: false
            }}
        )]
    },
    {
        input: "dist/getaddress-autocomplete-native.mjs",
        output: 
            {
                file:"dist/getaddress-autocomplete-native-" + version + ".min.js",
                format:"iife",
                name:'getAddress'
            },
        plugins:[terser()]
    }
]