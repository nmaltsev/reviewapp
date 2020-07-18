# The final education project "A Privacy-Preserving Social Networking Application"

This repository stores a single page application built in the scope of this project. The aim of this project is to create social privacy-preserving application on top of [Solid platform](https://solid.mit.edu/). 
The project has beed done by me and @Cristian Grigoriu. [PDF presentation of the project](https://github.com/nmalcev/reviewapp/blob/gh-pages/defence.pdf)


### 1.1. Solid

We have used [Solid POD's](https://solid.inrupt.com/get-a-solid-pod) as distributed data storage for storing users data. Solid network is consist of independent web servers that provides authorized access to the user's data. All user's resources have unique url address and can be accessed by HTTP requests.  

### 1.2. Reviewapp application

Reviewapp is a multi-functional social application on top of Solid conventions and tools.
This privacy-preserving web application allows users to manage a list of reviews and to share it with any registered users in a decentralized manner. The application preserves user privacy by separating application from data such that each user stores personal data on it's own Pod.

The application provides to user ability:
- to share reviews about visited places (hotels and restaurants);
- to choose who can read their reviews. 

Reviews are resources that:
- stores only on the author’s POD;
- described by well-known RDF vocabularies;
- available for another applications.

### 1.3. Achievements
- It uses OpenSreetMap web service to find a place that was entered in the search field.
- I have tested a new approach of dynamic creation modal dialogs.

## 2. How to start the project
``` shell
git clone <link to the repository>
npm install 
npm install -g angular-cli
```
Main service commands:
1. Run in development mode `ng serve` or `npm run start`. The application will be available by the link `localhost:4200`;
2. Compile production version `npm run build`. You can find build artifacts in the folder `./dist`;
3. Run the production version `npm run runprod`. The page will be available on `localhost:9061`.

## 3. How to contribute in the project

### 3.1. Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### 3.2. New page components

`ng generate component pages/<page name>`

### 3.3. New UI component

`ng generate component ui/<component name>`

### 3.4. Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### 3.5. Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### 3.6. Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### 3.7. Extra steps

Go to tsconfig.app.json into paths add the following data : 
``` json
"paths": {
      "zlib": ["node_modules/browserify-zlib/lib/index.js"],
      "http": ["node_modules/@angular/http"],
      "https": ["node_modules/@angular/http"],
      "stream": ["node_modules/jszip/dist/jszip.min.js"]
    }
```
