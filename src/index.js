import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import dottie from 'dottie';

const config = {};

export function load(configPath, {envVariable = 'NODE_ENV', logger = console.log, envDelimiter = '__', specialItems = []} = {}) {

  const basePath = path.join(configPath, 'base.json');
  if (!fs.existsSync(basePath)) {
    throw new Error(`Base config on path ${basePath} does not exist.`);
  }

  _.merge(config, require(basePath));

  if (process.env[envVariable]) {
    const envCfgPath = path.join(configPath, 'environments', `${process.env[envVariable]}.json`);
    if (fs.existsSync(envCfgPath)) {
      logger(`Adding env config '${envCfgPath}'`);
      _.merge(config, require(envCfgPath));
    } else {
      logger(`Env config '${envCfgPath}' not found.`);
    }
  }

  const customConfigPath = path.join(configPath, 'config.json');
  if (fs.existsSync(customConfigPath)) {
    logger(`Adding custom config '${customConfigPath}'`);
    _.merge(config, require(customConfigPath));
  } else {
    logger(`Custom config '${customConfigPath}' not found.`);
  }

  const paths = dottie.paths(config);
  setParams(paths, envDelimiter, logger);

  const specialPaths = specialItems.reduce(
    (prev, curr) => {
      const variables = Object
        .keys(process.env)
        .filter(key => ~key.indexOf(curr));
      return prev.concat(variables);
    },
    []);
  setParams(specialPaths, envDelimiter, logger);
}

const setParams = (paths, envDelimiter, logger) => {
  let key;
  paths.forEach(p => {
    key = p.replace(/\./g, envDelimiter).toUpperCase();
    if ({}.hasOwnProperty.call(process.env, key) || {}.hasOwnProperty.call(process.env, `${key}_FILE`)) {
      logger(`Overriding settings from env variable ${key}`);
      let value;
      if ({}.hasOwnProperty.call(process.env, `${key}_FILE`)) {
        logger(`Reading from file ${key}`);
        value = fs.readFileSync(process.env[`${key}_FILE`]);
        value = value && value.toString().replace('\n', '');
      } else {
        value = process.env[key];
      }
      dottie.set(config, p.replace(new RegExp(`${envDelimiter}`, 'g'), '.').toLowerCase(), (value === 'true' || value === 'false') ? value === 'true' : value);
    }
  });
};

export default config;
