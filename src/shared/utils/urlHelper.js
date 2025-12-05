/**
 * Helper para generar URLs públicas de archivos
 * Usa la variable de entorno PUBLIC_URL o construye la URL dinámicamente
 */

function getPublicFileUrl(path) {
    // Usar variable de entorno si existe
    const baseUrl = process.env.PUBLIC_URL || process.env.BASE_URL;

    if (baseUrl) {
        // Asegurar que no termina con /
        const cleanBaseUrl = baseUrl.replace(/\/$/, '');
        // Asegurar que path empieza con /
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${cleanBaseUrl}${cleanPath}`;
    }

    // Si no hay variable de entorno, construir URL con el host del request
    // Esto se puede pasar desde el controller: getPublicFileUrl(path, req)
    return path;
}

/**
 * Generar URL para archivos de publicaciones
 * @param {string} filename - Nombre del archivo
 * @param {object} req - Request object (opcional, para obtener host)
 * @returns {string} URL completa
 */
function getPublicationFileUrl(filename, req = null) {
    const path = `/uploads/publications/${filename}`;

    // PRIORITARIO: Usar PUBLIC_URL desde variable de entorno
    if (process.env.PUBLIC_URL) {
        const cleanBaseUrl = process.env.PUBLIC_URL.replace(/\/$/, '');
        return `${cleanBaseUrl}${path}`;
    }

    // FALLBACK: Construir desde request (pero en Docker esto da hostname interno)
    if (req) {
        // En producción con gateway, el X-Forwarded-Host debería tener el host externo
        const forwardedHost = req.get('x-forwarded-host');
        const forwardedProto = req.get('x-forwarded-proto') || 'http';

        if (forwardedHost) {
            return `${forwardedProto}://${forwardedHost}${path}`;
        }

        // Último recurso: usar req.get('host') 
        // NOTA: En Docker esto será 'social-service:3002', INCORRECTO para URLs públicas
        const protocol = req.protocol || 'http';
        const host = req.get('host');
        return `${protocol}://${host}${path}`;
    }

    // Si no hay nada, devolver path relativo
    return getPublicFileUrl(path);
}

/**
 * Generar URL para archivos de perfil
 */
function getProfileFileUrl(filename, req = null) {
    const path = `/uploads/profiles/${filename}`;

    if (req) {
        const protocol = req.protocol || 'http';
        const host = req.get('host');
        return `${protocol}://${host}${path}`;
    }

    return getPublicFileUrl(path);
}

module.exports = {
    getPublicFileUrl,
    getPublicationFileUrl,
    getProfileFileUrl
};
