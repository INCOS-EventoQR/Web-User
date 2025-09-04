// src/pages/api/login.js
import { NextApiRequest, NextApiResponse } from 'next';

const login = async (req = NextApiRequest, res = NextApiResponse) => {
  if (req.method === 'POST') {
    const { ci, phone } = req.body;

    if (!ci || !phone) {
      return res.status(400).json({ ok: false, msg: 'Faltan parámetros: CI o teléfono' });
    }

    const url = `https://tornemecsrl.com.bo/assystem/login.php?ci=${ci}&phone=${phone}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.ok) {
      // Aquí asignamos los datos del usuario como rol y carnet recibidos desde el backend.
      const rol = data.rol;  // Asignamos el rol obtenido de la respuesta
      const carnet = data.id;  // Asignamos el id obtenido de la respuesta

      // Aquí puedes guardar estos datos en tu base de datos si lo deseas, por ejemplo:
      // await saveUserData({ ci, phone, rol, carnet });

      return res.status(200).json({
        ok: true,
        msg: 'Usuario autenticado correctamente',
        rol,
        carnet
      });
    } else {
      return res.status(401).json({ ok: false, msg: 'Credenciales incorrectas' });
    }
  } else {
    res.status(405).json({ ok: false, msg: 'Método no permitido' });
  }
};

export default login;
