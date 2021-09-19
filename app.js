const express = require("express");

const app = express();
const cors = require("cors");
const morgan = require("morgan");

const args = process.argv.slice(2);

const routes = require("./routes");
const { logStack } = require("./utils/helpers");

require("dotenv").config();

const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || "production";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan(env == "development" ? "dev" : "tiny"));

app.use("/api", routes);
app.get("/", (req, res) => {
    res.status(200).json(logStack(app._router.stack));
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

// Initialize ngrok if requested

if (args.includes("ngrok")) {
    const ngrok = require("ngrok");
    ngrok
        .connect(port)
        .then(url => console.log(`Tunnel created at: ${url}`))
        .catch(err => console.error(err));
}
