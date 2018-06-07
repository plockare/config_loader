#Config loader

Cfg loader can load up configs for different environments from config files, env variables or newly can read secrets from filesystem. In particular, this can be used to load passwords from Docker secrets stored in `/run/secrets/<secret_name>` files.

## Install

```bash
# with npm
npm install cfg-loader

# or with Yarn
yarn add cfg-loader
```

## Usage

```javascript
import config, {load as configLoad} from 'cfg-loader';

configLoad(__dirname + '/../config');

// now the config property will contain the whole configuration 
console.log(config);
```
