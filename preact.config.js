/*
 * Copyright 2017 Capital One Services, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');

// Use this method to modify the base path URLs used in the web application.
export default function (config, env, helpers) {
    if (env.production) {

        // Keep infinity when minifying to avoid low severity static analysis warnings
        let { plugin } = helpers.getPluginsByName(config, "UglifyJsPlugin")[0];
        plugin.options.compress.keep_infinity = true;
        
        // Use a relative path for the base URL so the web application works when
        // hosting through enterprise or public GitHub Pages.
        config.output.publicPath = '';

        // For another example, the code below reads the GitHub remote URL and 
        // prefixes "/pages/github-org/github-repo/" onto the path URLs in the
        // web application.  This is not required when hosting through 
        // enterprise or public GitHub Pages.
        //
        // const config_file = '.git/config';
        // let   path        = null;
        //
        // if (fs.existsSync(config_file)) {
        //     // grab the contents of the config file
        //     let contents = fs.readFileSync(config_file, 'utf8').split('\n');
        //
        //     // grab the origin remote url
        //     let url = '';
        //     for (let i = 0; i < contents.length; i++) {
        //         if (contents[i].startsWith('[remote "origin"]')) {
        //             url = contents[i + 1].split(' ')[2];
        //         }
        //     }
        //
        //     // grab the 'path'
        //     let path_parts = url.replace('.git', '')
        //         .split(/[:\/]/)
        //         .slice(-2);
        //
        //     path_parts.unshift('pages');
        //
        //     let path = '/' + path_parts.join('/') + '/';
        //     config.output.publicPath = path
        // }
    }
}