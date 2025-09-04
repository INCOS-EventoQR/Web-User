import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Image from 'next/image';

// importación dinámica para evitar SSR issues
const html2canvasPromise = () => import('html2canvas');

const korgalEncrypt = (text, key) => {
  if (!text) return '';
  let out = '';
  for (let i = 0; i < text.length; i++) {
    out += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return out;
};

export default function UserQR() {
  const router = useRouter();
  const { ci, phone, role, carnet } = router.query;
  const [userData, setUserData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(15); // Tiempo restante en segundos
  const [progress, setProgress] = useState(100); // Barra de progreso (porcentaje)
  const captureRef = useRef(null);

  const SECRET_KEY = 'mi_clave_secreta';
  const encryptedCarnet = korgalEncrypt(carnet, SECRET_KEY);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(encryptedCarnet)}`;

  useEffect(() => {
    if (!carnet) return;
    (async () => {
      try {
        const resp = await fetch(`/api/guest?id=${carnet}`);
        const data = await resp.json();
        if (data?.ok) setUserData(data.userData);
      } catch (e) {
        console.error(e);
      }
    })();

    // Cierre de sesión automático después de 15 segundos
    const timeout = setTimeout(() => {
      handleLogout();  // Llama la función de logout
    }, 15000); // 15 segundos

    // Barra de progreso
    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime > 0) {
          const newTime = prevTime - 1;
          const newProgress = (newTime / 15) * 100;
          setProgress(newProgress);
          return newTime;
        } else {
          clearInterval(interval); // Detener el intervalo cuando el tiempo se agote
          return 0;
        }
      });
    }, 1000); // Actualizar cada segundo

    // Limpiar el timeout y el intervalo si el componente se desmonta
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [carnet]);

  const handleDownload = async () => {
    const { default: html2canvas } = await html2canvasPromise();
    if (!captureRef.current) return;

    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: '#ffffff',   // fuerza fondo blanco
      scale: 2,                     // mejor resolución
      useCORS: true,
    });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'usuario-qr.png';
    link.click();
  };

  const handleLogout = () => {
    // Limpiar los datos de localStorage o de cualquier otro estado global
    localStorage.removeItem("userData");

    // Redirigir al usuario a la página de login
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] p-4 flex-col">
      <div
        ref={captureRef}
        className="w-full max-w-sm rounded-lg shadow-lg p-8 flex flex-col justify-between"
        style={{
          backgroundColor: '#ffffff',       // HEX
          color: '#111827',                  // texto gris-900
          border: '1px solid #e5e7eb',       // border-gray-200
        }}
      >
        <h1
          className="text-2xl font-semibold text-center mb-4"
          style={{ color: '#166534' }}       // green-700
        >
          Datos del Usuario
        </h1>

        {userData ? (
          <div className="text-sm" style={{ color: '#4b5563' }}>
            <p><strong style={{ color: '#111827' }}>Nombre:</strong> {userData.names} {userData.lastName} {userData.secondLastName}</p>
            <p><strong style={{ color: '#111827' }}>CI:</strong> {userData.ci}</p>
            <p><strong style={{ color: '#111827' }}>Teléfono:</strong> {userData.phone}</p>
            <p><strong style={{ color: '#111827' }}>Rol:</strong> {role}</p>
            <p><strong style={{ color: '#111827' }}>Instituto:</strong> {userData.institute_name}</p>
          </div>
        ) : (
          <p className="text-sm" style={{ color: '#6b7280' }}>Cargando datos del usuario…</p>
        )}

        <div className="mt-6 flex justify-center">
          <Image src={qrCodeUrl} alt="Código QR" width={300} height={300} />
        </div>

        <div className="mt-6 text-center text-sm" style={{ color: '#6b7280' }}>
          <p><strong style={{ color: '#111827' }}>Guarda este código QR</strong></p>
          <ol className="list-decimal list-inside mx-auto mt-2 max-w-xs text-left">
            <li>Primer escaneo: registra tu ingreso.</li>
            <li>Segundo escaneo: registra tu refrigerio.</li>
          </ol>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="w-full max-w-sm mt-4">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-green-700 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-center mt-2">{timeRemaining} segundos restantes</p>
      </div>

      {/* Botones de Descarga y Cerrar sesión al lado */}
      <div className="mt-6 flex justify-between w-full max-w-sm">
        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded-lg font-medium shadow-sm transition-colors w-1/2 mr-2"
          style={{ backgroundColor: '#166534', color: '#ffffff' }}  // green-700
        >
          Descargar imagen
        </button>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg font-medium shadow-sm transition-colors w-1/2 ml-2"
          style={{ backgroundColor: '#e53e3e', color: '#ffffff' }}  // rojo-600
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
