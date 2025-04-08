/* eslint-disable no-undef */
import fs from 'fs';
// import ora from "ora";
import path from 'path';
import child_process from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';
const __dirname = dirname(fileURLToPath(import.meta.url));

function getProjects() {
  const dirs = fs.readdirSync(path.resolve(__dirname, '../static'));
  return dirs.filter((dir) => {
    return !dir.startsWith('_') && !dir.startsWith('.');
  });
}

function buildProject(name) {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue(`build ${name} start`));
    let childProcess = child_process.exec(
      `webpack --config webpack.cdn.config.js --name ${name}`,
      (err, stdout) => {
        if (err) {
          reject(err);
        }
        console.log(chalk.green(`build ${name} complete`));
        resolve();
      }
    );
    // childProcess.stdout.pipe(process.stdout)
  });
}

function createClaspConfig() {
  const env = process.env.NODE_ENV;
  return new Promise((resolve, reject) => {
    fs.copyFile(
      path.resolve(__dirname, `../.clasp.${env}.json`),
      path.resolve(__dirname, `../.clasp.json`),
      (err) => {
        if (err) {
          reject(err);
        }
        console.log(chalk.green(`create .clasp.json success`));
        resolve();
      }
    );
  });
}

async function main() {
  // await createClaspConfig();
  const projects = getProjects();
  // const spinner = ora({
  //   text: `Building`,
  //   color: "green",
  // });
  // spinner.start();
  console.log(chalk.red('build start'));
  const tasks = projects.map((project) => {
    return buildProject(project);
  });
  await Promise.all(tasks);

  // for (const project of projects) {
  //   await buildProject(project);
  // }

  console.log(chalk.red('build end'));
}

main();
