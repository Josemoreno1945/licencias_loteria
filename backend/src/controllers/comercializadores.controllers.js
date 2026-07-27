/*import {} from "../models/users.model.js";
import comercializadores_schema from "../schemas/comercializadores.schemas";

//import bcrypt from 'bcryptjs';
import { errors, throwError } from "../utils/errors.js";

//get
export const get_comercializadores = async (req, res) => {
  try {
    const rows = await getpersona();
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
//-----------------------------------------------------------------------------------
/*
export const getUserid = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (isNaN(id) || id < 0) {
      throwError(errors.invalidData);
    }
    const rows = await getUser_id(id);
    if (!rows || rows.length == 0) {
      throwError(errors.userNotFound);
    }
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

//post
export const createUsers = async (req, res, next) => {
  try {
    const data = req.body;
    const parseU = userSchema.safeParse(data);
    if (!parseU.success) {
      return res.status(400).json({
        errors: parseU.error.errors,
      });
    }
    const emailExiste = await getUserEmail(data.email);
    if (emailExiste) {
      throwError(errors.User_emailDuplicated);
    }
    const usernameExiste = await getUserName(data.user_name);
    if (usernameExiste) {
      throwError(errors.userDuplicated);
    }
    const hashedPassword = await bcrypt.hash(data.password, 8);
    const userData = { ...data, password: hashedPassword };
    const rows = await createUser(userData);
    return res.json(rows);
  } catch (error) {
    next(error);
  }
};

//delete
export const deleteUsers = async (req, res, next) => {
  try {
    const id = req.params.id;
    const rows = await deleteUserid(id);
    if (rows === 0) {
      throwError(errors.userNotFound);
    } else {
      return res.json({ message: "User deleted successfully" });
    }
  } catch (error) {
    next(error);
  }
};

//put
export const updateUsers = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (isNaN(id) || id < 0) {
      throwError(errors.invalidData);
    }
    const data = req.body;

    const parseU = userSchema.safeParse(data);
    if (!parseU.success) {
      return res.status(400).json({
        errors: parseU.error.errors,
      });
    }

    const emailExiste = await getUserEmail(data.email);
    if (emailExiste) {
      throwError(errors.User_emailDuplicated);
    }

    const usernameExiste = await getUserName(data.user_name);
    if (usernameExiste) {
      throwError(errors.userDuplicated);
    }

    const rows = await updateUserid(id, data);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

*/
