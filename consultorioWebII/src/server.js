const express = require("express");
const session = require("express-session");
const morgan = require("morgan");
const startRoutes = require("./routes/start.routes");
const cors = require("cors"); // Importa el middleware cors

const app = express();

// Aplica el middleware cors a todas las rutas
app.use(cors());

app.use(morgan("dev"));

app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.json());

app.use("/", startRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
