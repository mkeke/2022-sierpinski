/*
    multi file watch
*/
const bs = require("browser-sync").create();
bs.init({
  server: "./app",
  files: ["app/*.html", "app/*.js", "app/*.css"],
});



/*
    single file watch

const bs = require("browser-sync").create();
bs.watch("./app/index.html").on("change", bs.reload);
bs.init({ server: "./app" });
*/
