import { useRouter } from 'next/router';
import Image from 'next/image';

// Función de encriptación XOR (Método Korgal)
const korgalEncrypt = (text, key) => {
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
        encrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));  // XOR entre el carácter y la clave
    }
    return encrypted;
};

export default function UserQR() {
    const router = useRouter();
    const { ci, phone, role, carnet } = router.query; // Obtener los datos del query

    // La clave secreta utilizada para el cifrado y descifrado (debe ser la misma en ambas apps)
    const SECRET_KEY = 'mi_clave_secreta'; // Cambia esta clave por una más segura

    // Encriptar el ID usando el método Korgal
    const encryptedCarnet = korgalEncrypt(carnet, SECRET_KEY); // Cifrar el carnet con la clave

    // Generar la URL para el QR con el carnet encriptado
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encryptedCarnet}`;

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <div className="space-y-6 bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
                <h1 className="text-2xl font-semibold text-center text-gray-700">Datos del Usuario</h1>

                <div className="mt-4 text-sm text-gray-600">
                    <p><strong>CI:</strong> {ci}</p>
                    <p><strong>Teléfono:</strong> {phone}</p>
                    <p><strong>Rol:</strong> {role}</p>
                    <p><strong>ID del Usuario:</strong> {carnet}</p>

                    {/* Mostrar el código QR */}
                    <div className="mt-6 flex justify-center">
                        <Image
                            src={qrCodeUrl}
                            alt="Código QR"
                            width={300}
                            height={300}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
