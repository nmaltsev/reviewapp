# Review App

## The final education project "A Privacy-Preserving Social Networking Application"

This repository stores a single page application built in the scope of this project. The aim of this project is to create social privacy-preserving application on top of [SOLID platform](https://solid.mit.edu/). We have used [SOLID POD's](https://solid.inrupt.com/get-a-solid-pod) as distributed data storage for storing users data. Solid network is consist of independent web servers that provides authorized access to the users data. All user's resources have unique url address and can be accessed by HTTP requests.  

The application provides to user ability:
- to share reviews about visited places (hotels and restaurants);
- to choose who can read their reviews. 

### Achievements
- It uses OpenSreetMap web service to find place that was entered in search field.
- I have tested a new approach of dynamic creation modal dialogs.


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### New page components

`ng generate component pages/<page name>`

### New UI component

`ng generate component ui/<component name>`

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Extra steps

Go to tsconfig.app.json into paths add the following data : 
``` json
"paths": {
      "zlib": ["node_modules/browserify-zlib/lib/index.js"],
      "http": ["node_modules/@angular/http"],
      "https": ["node_modules/@angular/http"],
      "stream": ["node_modules/jszip/dist/jszip.min.js"]
    }
```
