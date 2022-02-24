# MeMeasure - SPARC Summer 2021

This is the main project repository for MeMeasure, a student summer project for the SPARC (Side Projects Advancement, Refinement & Collaboration) competition at University of Pennsylvania, for the Summer 2021 semester.

## Team Members (in alphabetical order of last name)

- Yu-Po Chen (cheny20@seas.upenn.edu)
- David Dong (ddong4@seas.upenn.edu)
- Shentong Lu (shentonl@seas.upenn.edu)
- Santosh Nazare (snazare@seas.upenn.edu)

## Project Description

The worldwide online fashion industry is expected to be a $700B+ market in 2021 and expected
to exceed $1T in 2025.

Apparel represents the biggest and fastest growing segment of this
industry. The global COVID-19 pandemic has also accelerated this trend. Several pain points
represent significant opportunities in this industry, among them the issue of size and fitting.
Given the diversity of human body types and measurements, finding clothes that fit a particular
person can prove challenging in the virtual world. Sizing represents at least 20-30% of the
causes of returns, affecting the profitability of retailers significantly.

Using deep learning for easy body measurements represents an exciting opportunity to solve a
pressing issue for the industry. This technology has been developed by several vendors (e.g.,
Tel Aviv-based Sizer) and demonstrated by enthusiasts (e.g., by a Google engineer) . However,
to our knowledge, no fully working solutions have been open sourced.

For this project we will leverage Tensorflow.js, a JavaScript-based deep learning framework to
create a prototype web application that can estimate body measurements for clothing (e.g.,
neck, bust, inseam, hip). The application will read input from a camera (e.g., smartphone
camera, web cam), and input of a person’s height/ weight, and returns the key measurements.

## Start Development Container

This project provides a containerized dev environment via VS Code.

Follow these steps to open this sample in a container using the VS Code Remote - Containers extension:

1. If this is your first time using a development container, please ensure your system meets the pre-reqs (i.e. have Docker installed) in the [getting started steps](https://aka.ms/vscode-remote/containers/getting-started).

   - Make sure to set up the WSL 2 neivronment if you are on Windows.

2. To use this repository, open a locally cloned copy of the code:
   - Clone this repository to your local filesystem (MacOS, Linux), or the WSL 2 environment (Windows)
   - Press <kbd>F1</kbd> and select the **Remote-Containers: Open Folder in Container...** command.
   - Select the cloned copy of this folder, wait for the container to start, and try things out!

## Directory Structure

- `public` : static files that serve as the scaffold for the React app, including `index.html`
- `src` : JS and SCSS files that form the actual React App, including `index.js` and `App.js`
  - `src/scss` : SCSS styling files, which get compiled into CSS
  - `src/components`: Reactjs components that get loaded and manipulated by `App.js`

## Running npm commands

After you have launched the development container, in the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## License

MIT License
