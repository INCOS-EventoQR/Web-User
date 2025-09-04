// src/pages/api/guest.js
import { NextApiRequest, NextApiResponse } from 'next';

const guest = async (req = NextApiRequest, res = NextApiResponse) => {
    if (req.method === 'GET') {
        const { id } = req.query;  // Obtenemos el parámetro 'id' desde la URL de la solicitud

        if (!id) {
            return res.status(400).json({ ok: false, msg: 'Falta el parámetro id' });
        }

        // Realizamos la solicitud al endpoint del guest.php pasando el 'id'
        const url = `https://tornemecsrl.com.bo/assystem/guest.php?id=${id}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            return res.status(404).json({ ok: false, msg: data.error });
        }

        // Si los datos son correctos, los devolvemos en formato JSON
        return res.status(200).json({
            ok: true,
            msg: 'Datos del usuario obtenidos correctamente',
            userData: data,
        });
    } else {
        // Si el método no es GET, respondemos con un error
        return res.status(405).json({ ok: false, msg: 'Método no permitido' });
    }
};

export default guest;
