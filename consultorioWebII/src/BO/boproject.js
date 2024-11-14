const pool = require("../db");
const {
  insertUserAppointment,
  insertMember,
  removeAppointment,
  updateNamesAppointment,
  selectAppointment,
  removeMember,
  membersAppointment,
  updateMember,
  deleteMember,
  viewActivity,
  insertTask,
  checkExistingObjective,
  insertDefaultObjective,
  calendarAct 
} = require("../projectQueries");

const { checkEmailQuery } = require("../query");

class BoProject {
  constructor() {}

  async createAppointment(req, res) {
    try {
      const { id_per, des_cita, id_perfil_pro } = req.body;

      const result = await pool.query(insertUserAppointment, [des_cita]);
      const id_cita = result.rows[0].id_cita;
      await pool.query(insertMember, [id_per, id_cita, id_perfil_pro]);
      res
        .status(201)
        .json({ message: "Cita creada correctamente", id_cita });
    } catch (error) {
      console.error("Error creando la cita:", error);
      res
        .status(500)
        .json({ message: "Error creando la cita", error: error.message });
    }
  }

  async deleteAppointment(req, res) {
    try {
      const id_cita = req.params.id_cita;
      const { id_miembro, id_perfil_pro } = req.body;
      console.log(id_cita, id_miembro, id_perfil_pro);

      await pool.query("BEGIN"); // Inicia una transacción

      if (id_perfil_pro === 1) {
        await pool.query(removeMember, [id_miembro]);
        await pool.query(removeAppointment, [id_cita]);
      } else {
        await pool.query(removeMember, [id_miembro]);
      }

      await pool.query("COMMIT"); // Confirma la transacción

      res.status(200).json({ message: "|Cita| eliminada" });
    } catch (error) {
      await pool.query("ROLLBACK"); // Revertir la transacción en caso de error
      console.error(error);
      res.status(500).json({ message: "Error" });
    }
  }

  async updateAppointmentName(req, res) {
    try {
      const { id_pro, des_cita } = req.body;

      await pool.query(updateNamesAppointment, [des_cita, id_pro]);

      res.status(200).json({ message: "|Cita| actualizada" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error" });
    }
  }

  async getCitas(req, res) {
    try {
      const id_per = req.params.id_per;
      const result = await pool.query(selectAppointment, [id_per]);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetch citas:", error);
      res
        .status(500)
        .json({ message: "Error", error: error.message });
    }
  }

  async addMemberAppointment(req, res) {
    try {
      const { correo_per, id_cita, id_perfil_pro } = req.body;
      console.log(correo_per);

      const result = await pool.query(checkEmailQuery, [correo_per]);
      const personId = result.rows[0].id_per; // extrae el valor id_per del resultado
      console.log(personId);

      await pool.query(insertMember, [personId, id_cita, id_perfil_pro]);
      res.status(201).json({ message: "El miembro ha sido incluido", id_cita });
    } catch (error) {
      console.error("Error ", error);
      res
        .status(500)
        .json({ message: "Error ", error: error.message });
    }
  }

  async projectMember(req, res) {
    try {
      const id_cita = req.params.id_cita;
      console.log(id_cita);
      const result = await pool.query(membersAppointment, [id_cita]);
      console.log(result);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error ", error);
      res
        .status(500)
        .json({ message: "Error ", error: error.message });
    }
  }

  async editProfileMember(req, res) {
    try {
      const { id_perfil_pro, id_cita, correo_per } = req.body;
      console.log(id_perfil_pro, id_cita, correo_per);
      const result = await pool.query(checkEmailQuery, [correo_per]);
      const personId = result.rows[0].id_per; // extraer el valor id_per del resultaod
      console.log(personId);

      await pool.query(updateMember, [id_perfil_pro, id_cita, personId]);
      res.status(201).json({ message: "Cambio de perfil", id_cita });
    } catch (error) {
      console.error("Error :", error);
      res
        .status(500)
        .json({ message: "Error ", error: error.message });
    }
  }

  async deleteMember(req, res) {
    const { id_cita } = req.params;
    const { correo_per } = req.body;
    const result = await pool.query(checkEmailQuery, [correo_per]);
    const personId = result.rows[0].id_per;
  
    try {
      await pool.query("BEGIN");
      await pool.query(deleteMember, [id_cita, personId]);
      await pool.query("COMMIT");
  
      res.status(200).json({ message: "Member deleted successfully" });
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error(error);
      res.status(500).json({ message: "Error deleting member" });
    }
  }

  async memberActivity(req, res) {
    try {
      const id_cita = req.params.id_cita;
      console.log(id_cita);
      const result = await pool.query(viewActivity, [id_cita]);
      console.log(result)
      res.status(200).json( result.rows);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res
        .status(500)
        .json({ message: "Error fetching activity ", error: error.message });
    }
  }

  async addTask(req, res) {
    try {
      const { des_act, fechaini_act,  duracion_act, porcentaje_act, id_obj} = req.body;
      await pool.query(insertTask, [des_act, fechaini_act,  duracion_act, porcentaje_act, id_obj]);
      res.status(201).json({ message: "The task is included", des_act });
    } catch (error) {
      console.error("Error adding task:", error);
      res
        .status(500)
        .json({ message: "Error adding task", error: error.message });
    }
  }
  async  addTask(req, res) {
    try {
      const { des_act, fechaini_act, duracion_act, porcentaje_act, id_cita } = req.body;
      let { id_obj } = req.body;
  
      // Chequea si el objetivo fue cumplido (la cita fue finalizada)
      const existingObjectiveResult = await pool.query(checkExistingObjective, [id_cita]);
      
      if (existingObjectiveResult.rows.length === 0) {
        // No existe un objetivo, se crea un default.
        const defaultObjectiveResult = await pool.query(insertDefaultObjective, ['Inicia cita', 1, id_cita]);
        id_obj = defaultObjectiveResult.rows[0].id_obj; // Nuevo ID del objetivo
      } else {
        // Usar la ID existente del objetivo
        id_obj = existingObjectiveResult.rows[0].id_obj;
      }
  
      // Insertar la nota y establecer la fecha
      await pool.query(insertTask, [des_act, fechaini_act, duracion_act, porcentaje_act, id_obj]);
      
      res.status(201).json({ message: "La nota está creada", des_act });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Error", error: error.message });
    }
  }


  async calendarActivity(req, res) {
    try {
      const id_per= req.params.id_per;
      console.log(id_per);
      const result = await pool.query(calendarAct, [id_per]);
      console.log(result)
      res.status(200).json( result.rows);
    } catch (error) {
      console.error("Error: ", error);
      res
        .status(500)
        .json({ message: "Error ", error: error.message });
    }
  }

}






module.exports = BoProject;
