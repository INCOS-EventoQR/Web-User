import { useState } from 'react';
import { useRouter } from 'next/router'; // Importar useRouter

export default function Home() {
  const router = useRouter(); // Instanciamos el router
  const [ci, setCi] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('');
  const [carnet, setCarnet] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ci, phone }),
    });

    const data = await response.json();
    setMessage(data.msg);

    if (data.ok) {
      console.log('Rol:', data.rol);  // Imprime el rol
      console.log('Número de carnet:', data.carnet);  // Imprime el número de carnet

      // Guardar los datos en el estado
      setRole(data.rol);
      setCarnet(data.carnet);

      // Redirigir a UserQR y pasar los datos como estado
      router.push({
        pathname: '/UserQR', // Ruta hacia la página UserQR
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
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleLogin} className="space-y-6 bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h1 className="text-2xl font-semibold text-center text-gray-700">Iniciar Sesión</h1>

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
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200">
          Iniciar sesión
        </button>

        {/* Mensaje de Error o Éxito */}
        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes('incorrectas') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </form>

      {/* Mostrar los datos recopilados */}
      <div className="mt-8 text-center">
        <h2 className="text-lg font-semibold text-gray-700">Datos del Usuario</h2>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>CI:</strong> {ci}</p>
          <p><strong>Teléfono:</strong> {phone}</p>
          <p><strong>Rol:</strong> {role}</p> {/* Mostrar rol */}
          <p><strong>ID del Usuario:</strong> {carnet}</p> {/* Mostrar ID (carnet) */}
        </div>
      </div>
    </div>
  );
}
