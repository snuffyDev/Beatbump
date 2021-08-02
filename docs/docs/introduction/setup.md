# Setup

This section will be instructions on setting up Beatbump, which will apply for both local development and preparing for deployment.

> NOTE: Node.js v14 and NPM/PNPM are required to be installed on your machine before continuing.

## Local Development

Whether you're just developing locally, or deploying your own instance of Beatbump, or experimenting with the code, the most important step is cloning or downloading the repo.

The quickest way to do that is to use [degit](https://github.com/Rich-Harris/degit) in your preferred directory:

```bash
npx degit snuffyDev/Beatbump Beatbump
cd Beatbump
```

This will create a new folder called Beatbump with the project's files. Once you're in the ```Beatbump``` directory *(or whatever name you chose)*, install the dependencies:
```bash
### You can also use PNPM. Yarn is untested.
npm install
```
After the dependencies are installed, you can start the development server with the command ```npm run dev```!

---

