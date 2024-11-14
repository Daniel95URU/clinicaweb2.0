const expressSession = require('express-session');
const PgSession = require('connect-pg-simple')(expressSession);

class Session {
  constructor(app, db) {
    this.db = db;
    this.setupSession(app);
  }

  setupSession(app) {
    app.use(
      expressSession({
        store: new PgSession({
          pool: this.db.pool,
          tableName: 'session',
        }),
        secret: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        resave: false,
        saveUninitialized: true,
        cookie: {
          maxAge: 1900000,
          secure: false,
          sameSite: true,
        },
      })
    );
  }

  sessionExists(req) {
    return req.session && req.session.userId ? true : false;
    
  }

  async createSession(req, res) {
    const { correo_per, password_usu } = req.body;
    try {
      const query = `
        SELECT u.id_usu, p.correo_per, pf.id_perfil
        FROM usuario u
        INNER JOIN persona p ON p.id_per = u.id_per
        INNER JOIN perfil pf ON pf.id_perfil = u.id_perfil
        WHERE p.correo_per = $1 AND u.password_usu = $2
      `;
      const result = await this.db.execute(query, [correo_per, password_usu]);
      if (result.rows.length > 0) {
        req.session.userId = result.rows[0].id_usu;
        req.session.userName = result.rows[0].correo_per;
        req.session.userProfile = result.rows[0].id_perfil;
        res.send('Sesión creada con éxito.');
      } else {
        res.status(401).send('Credenciales incorrectas.');
      }
    } catch (error) {
      console.error('Error al crear la sesión:', error);
      res.status(500).send('Error interno del servidor.');
    }
  }
  
  }

module.exports = Session;

