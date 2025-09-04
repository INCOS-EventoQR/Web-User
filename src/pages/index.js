import { useState } from 'react';
import { useRouter } from 'next/router'; // Importar useRouter
import Image from 'next/image'; // Para agregar imágenes de manera eficiente
import logo from '../../public/logo.png'; // Importar el logo desde la carpeta public

export default function Home() {
  const router = useRouter(); // Instanciamos el router
  const [ci, setCi] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('');
  const [carnet, setCarnet] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); // Evitar que la página se recargue al hacer submit

    // Hacer la solicitud al servidor para validar el login
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ci, phone }),
    });

    const data = await response.json();
    setMessage(data.msg);

    // Si el login es exitoso, redirigir a UserQR
    if (data.ok) {
      setRole(data.rol);
      setCarnet(data.carnet);

      // Redirigir a UserQR y pasar los datos como query params
      router.push({
        pathname: '/UserQR',  // Ruta hacia la página UserQR
        query: {
          ci,
          phone,
          role: data.rol,
          carnet: data.carnet,
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src={logo}  // Asegúrate de que la imagen esté en /public
          alt="Logo"
          width={150}
          height={150}
          objectFit="contain"
        />
      </div>

      {/* Formulario de login */}
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg space-y-6">
        <h1 className="text-3xl font-semibold text-center text-green-700">Iniciar Sesión</h1>

        {/* Input CI */}
        <div>
          <label htmlFor="ci" className="block text-sm font-medium text-gray-600">Número de CI</label>
          <input
            id="ci"
            type="text"
            value={ci}
            onChange={(e) => setCi(e.target.value)}
            required
            className="mt-2 p-3 border border-gray-300 rounded-lg w-full"
          />
        </div>

        {/* Input Teléfono */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-600">Teléfono</label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="mt-2 p-3 border border-gray-300 rounded-lg w-full"
          />
        </div>

        {/* Botón de Enviar */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition duration-200"
        >
          Ingresar
        </button>

        {/* Mensaje de Error o Éxito */}
        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes('incorrectas') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
