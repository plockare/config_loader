import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import dottie from 'dottie';

const config = {};

export function load(configPath, options = {envVariable: 'NODE_ENV', logger: console.log, envDelimiter: '__'}) {

  const basePath = path.join(configPath, 'base.json');
  if (!fs.existsSync(basePath)) {
    throw new Error(`Base config on path ${basePath} does not exist.`);
  }

  _.merge(config, require(basePath));

  if (process.env[options.envVariable]) {
    const envCfgPath = path.join(__dirname, 'environments', `${process.env[options.envVariable]}.json`);
    if (fs.existsSync(envCfgPath)) {
      options.logger(`Adding env config '${envCfgPath}'`);
      _.merge(config, require(envCfgPath));
    } else {
      options.logger(`Env config '${envCfgPath}' not found.`);
    }
  }

  const customConfigPath = path.join(__dirname, 'config.json');
  if (fs.existsSync(customConfigPath)) {
    options.logger(`Adding custom config '${customConfigPath}'`);
    _.merge(config, require(customConfigPath));
  } else {
    options.logger(`Custom config '${customConfigPath}' not found.`);
  }

  const paths = dottie.paths(config);
  let key;
  paths.forEach(p => {
    key = p.replace('.', options.envDelimiter).toUpperCase();
    if ({}.hasOwnProperty.call(process.env, key)) {
      options.logger(`Overriding settings from env variable ${key}`);
      dottie.set(config, p, (process.env[key] === 'true' || process.env[key] === 'false') ? process.env[key] === 'true' : process.env[key]);
    }
  });

}

export default config;
