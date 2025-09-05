import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

// importación dinámica para evitar SSR
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
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [progress, setProgress] = useState(100);
  const [qrReady, setQrReady] = useState(false);

  const captureRef = useRef(null);
  const qrImgRef = useRef(null);

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

    const timeout = setTimeout(() => handleLogout(), 15000);

    const interval = setInterval(() => {
      setTimeRemaining((t) => {
        if (t > 0) {
          const newTime = t - 1;
          setProgress((newTime / 15) * 100);
          return newTime;
        }
        clearInterval(interval);
        return 0;
      });
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [carnet]);

  const handleDownload = async () => {
    if (!captureRef.current || !qrReady) return;

    const { default: html2canvas } = await html2canvasPromise();
    const node = captureRef.current;

    const canvas = await html2canvas(node, {
      backgroundColor: '#ffffff',
      useCORS: true,
      imageTimeout: 0,
      scale: window.devicePixelRatio || 2,
      // Fuerza a usar el tamaño real del contenedor para evitar recortes/zoom
      width: node.scrollWidth,
      height: node.scrollHeight,
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'usuario-qr.png';
    link.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] p-4 flex-col">
      <div
        ref={captureRef}
        className="w-full max-w-sm rounded-lg shadow-lg p-8 flex flex-col justify-between"
        style={{
          backgroundColor: '#ffffff',
          color: '#111827',
          border: '1px solid #e5e7eb',
        }}
      >
        <h1 className="text-2xl font-semibold text-center mb-4" style={{ color: '#166534' }}>
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
          <img
            ref={qrImgRef}
            src={qrCodeUrl}
            alt="Código QR"
            width={300}
            height={300}
            crossOrigin="anonymous"
            onLoad={() => setQrReady(true)}
            style={{
              display: 'block',
              width: '300px',
              height: '300px',
              objectFit: 'contain',
              imageRendering: 'pixelated',
            }}
          />
        </div>

        <div className="mt-6 text-center text-sm" style={{ color: '#6b7280' }}>
          <p><strong style={{ color: '#111827' }}>Guarda este código QR</strong></p>
          <ol className="list-decimal list-inside mx-auto mt-2 max-w-xs text-left">
            <li>Primer escaneo: registra tu ingreso.</li>
          </ol>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="w-full max-w-sm mt-4">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-green-700 rounded-full"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
        <p className="text-center mt-2">{timeRemaining} segundos restantes</p>
      </div>

      {/* Botones */}
      <div className="mt-6 flex justify-between w-full max-w-sm">
        <button
          onClick={handleDownload}
          disabled={!qrReady}
          className="px-4 py-2 rounded-lg font-medium shadow-sm transition-colors w-1/2 mr-2 disabled:opacity-50"
          style={{ backgroundColor: '#166534', color: '#ffffff' }}
        >
          Descargar imagen
        </button>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg font-medium shadow-sm transition-colors w-1/2 ml-2"
          style={{ backgroundColor: '#e53e3e', color: '#ffffff' }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
