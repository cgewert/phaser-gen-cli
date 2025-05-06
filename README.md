# Phaser Generator CLI

A CLI tool written in DENO 2 for generating Phaser projects with TypeScript and Webpack.

This tool is used to create a complete ready to go project inside a target folder. It will run npm install and git init automatically after a setup was created by calling 'phaser init'.

Inside the templates folder are folders and files which will be created in the target folder. You can enter placeholders with the syntax {{PLACEHOLDER_NAME}} inside the templates. They will be replaced by values which you can store in a config file.

## Example for config files

project.config.json

```sh
{ 
    AUTHOR: "Autor <autor@example.com>",
    TITLE: "My new game"
}

phaser init -n newProject -c ./project.config.json
```

When calling the init subcommand all templates will be processed and all found {{AUTHOR}} and {{TITLE}} placeholders will be replaced automatically by the given values found in the config file.
You can also omit the config parameter when you store the config file inside your new projects folder. The CLI will autodetect existing project.config.json files inside your projects folders.

## Author

Christian Gewert <cgewert@gmail.com>

## Build

Run inside your repository folder:

```sh
deno task build
```

This will create phaser.exe which you can store anywhere you want. You can optionally add the executables location to your OS PATH environment variable to be able to run phaser.exe from any location.

## Commands

- `phaser init` — Creates a new application framework for a phaser game.

- `phaser create scene` - Creates a new scene and adds it to main.ts.

Use --help or -h to get help for specific commands e.g.

```sh
phaser create --help
```

## Releases

2025-05-06 Release 1.0.0  
