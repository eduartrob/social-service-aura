// infrastructure/services/ModerationService.js
// Servicio de moderación de contenido para AURA

const Filter = require('bad-words');

class ModerationService {
    constructor() {
        // Inicializar filtro de palabras ofensivas (inglés por defecto)
        this.textFilter = new Filter();

        // 🔥 Agregar palabras ofensivas en español
        this.palabrasProhibidasES = [
            // Insultos generales
            'idiota', 'estupido', 'estúpido', 'imbecil', 'imbécil', 'pendejo', 'pendeja',
            'cabron', 'cabrón', 'puta', 'puto', 'mierda', 'verga', 'chingar', 'chingada',
            'culero', 'culera', 'marica', 'maricon', 'maricón', 'joto', 'perra', 'zorra',
            'bastardo', 'maldito', 'maldita', 'cagar', 'cagada', 'mamadas', 'mamón', 'mamon',
            'pinche', 'jodido', 'jodida', 'coño', 'carajo', 'culo', 'nalgas', 'tetas',
            // Palabras de odio/violencia
            'matar', 'suicidar', 'suicidio', 'matarte', 'matarme', 'cortarme', 'cortarte',
            'morir', 'muerte', 'asesinar', 'violar', 'violacion', 'violación',
            // Drogas (contexto negativo)
            'dealer', 'narcotraficante', 'vender drogas'
        ];

        // Agregar palabras al filtro
        this.textFilter.addWords(...this.palabrasProhibidasES);

        // 🔥 Palabras clave de crisis que requieren atención especial (no bloquear, pero alertar)
        this.palabrasCrisis = [
            'quiero morir', 'no quiero vivir', 'me quiero matar', 'suicidarme',
            'no vale la pena', 'mejor sin mi', 'nadie me quiere', 'estoy solo',
            'me corto', 'autolesion', 'autolesión', 'hacerme daño'
        ];

        // 🔥 Categorías válidas para comunidades (temas de apoyo mental)
        this.categoriasPermitidas = [
            'bienestar', 'salud mental', 'ansiedad', 'depresión', 'depresion',
            'adicciones', 'duelo', 'soledad', 'autoestima', 'mindfulness',
            'meditación', 'meditacion', 'terapia', 'psicología', 'psicologia',
            'apoyo emocional', 'superación', 'superacion', 'motivación', 'motivacion',
            'ejercicio', 'fitness', 'yoga', 'nutrición', 'nutricion',
            'arte', 'música', 'musica', 'cine', 'lectura', 'libros',
            'memes', 'humor', 'entretenimiento', 'videojuegos', 'gaming',
            'creatividad', 'manualidades', 'cocina', 'naturaleza', 'mascotas',
            'amistad', 'relaciones', 'familia', 'comunidad', 'voluntariado',
            'educación', 'educacion', 'desarrollo personal', 'espiritualidad',
            'general', 'otros'
        ];

        console.log('✅ ModerationService inicializado');
    }

    /**
     * Verifica si el texto contiene contenido inapropiado
     * @param {string} texto - Texto a verificar
     * @returns {Object} { esSeguro: boolean, razon: string, esCrisis: boolean }
     */
    verificarTexto(texto) {
        if (!texto || typeof texto !== 'string') {
            return { esSeguro: true, razon: null, esCrisis: false };
        }

        const textoLower = texto.toLowerCase();

        // 1. Verificar palabras ofensivas
        if (this.textFilter.isProfane(texto)) {
            return {
                esSeguro: false,
                razon: 'El texto contiene lenguaje inapropiado u ofensivo',
                esCrisis: false
            };
        }

        // 2. Verificar palabras de crisis
        const contieneCrisis = this.palabrasCrisis.some(palabra =>
            textoLower.includes(palabra)
        );

        if (contieneCrisis) {
            // No bloqueamos, pero marcamos para seguimiento
            return {
                esSeguro: true,
                razon: null,
                esCrisis: true,
                mensajeCrisis: 'Contenido que puede indicar una situación de crisis emocional'
            };
        }

        return { esSeguro: true, razon: null, esCrisis: false };
    }

    /**
     * Verifica si una comunidad tiene un propósito válido de apoyo
     * @param {Object} communityData - { name, description, category }
     * @returns {Object} { esValida: boolean, razon: string }
     */
    verificarComunidad(communityData) {
        const { name, description, category } = communityData;

        // 1. Verificar que nombre y descripción no contengan contenido ofensivo
        const checkNombre = this.verificarTexto(name);
        if (!checkNombre.esSeguro) {
            return {
                esValida: false,
                razon: `Nombre de comunidad rechazado: ${checkNombre.razon}`
            };
        }

        const checkDescripcion = this.verificarTexto(description || '');
        if (!checkDescripcion.esSeguro) {
            return {
                esValida: false,
                razon: `Descripción de comunidad rechazada: ${checkDescripcion.razon}`
            };
        }

        // 2. Verificar que la categoría sea válida
        const categoriaLower = (category || '').toLowerCase().trim();
        const categoriaValida = this.categoriasPermitidas.some(cat =>
            categoriaLower.includes(cat) || cat.includes(categoriaLower)
        );

        if (!categoriaValida && category) {
            // Si la categoría no está en la lista, verificar que no sea algo inapropiado
            // Pero ser flexible - solo rechazar si es claramente inapropiado
            const categoriasProhibidas = [
                'política', 'politica', 'religion', 'religión', 'sexo', 'adultos',
                'apuestas', 'casino', 'armas', 'violencia', 'odio', 'discriminación'
            ];

            const categoriaProhibida = categoriasProhibidas.some(cat =>
                categoriaLower.includes(cat)
            );

            if (categoriaProhibida) {
                return {
                    esValida: false,
                    razon: `La categoría "${category}" no está permitida en AURA. Las comunidades deben enfocarse en apoyo y bienestar.`
                };
            }
        }

        // 3. La comunidad es válida
        return {
            esValida: true,
            razon: null
        };
    }

    /**
     * Verifica una imagen usando análisis básico (placeholder para nsfwjs)
     * @param {string} imageUrl - URL de la imagen a verificar
     * @returns {Promise<Object>} { esSegura: boolean, razon: string }
     */
    async verificarImagen(imageUrl) {
        // 🔥 Por ahora, retornamos seguro
        // En el futuro, integrar con nsfwjs o servicio externo
        // Requiere TensorFlow.js que usa más RAM

        if (!imageUrl) {
            return { esSegura: true, razon: null };
        }

        // Placeholder: Todas las imágenes pasan por ahora
        // TODO: Integrar nsfwjs cuando se confirme disponibilidad de RAM
        console.log('🖼️ Verificación de imagen (placeholder):', imageUrl);

        return {
            esSegura: true,
            razon: null,
            nota: 'Verificación de imagen pendiente de implementar con nsfwjs'
        };
    }

    /**
     * Obtiene lista de categorías permitidas
     * @returns {string[]}
     */
    getCategoriasPermitidas() {
        return [...this.categoriasPermitidas];
    }

    /**
     * Agrega palabras prohibidas personalizadas
     * @param {string[]} palabras
     */
    agregarPalabrasProhibidas(palabras) {
        if (Array.isArray(palabras)) {
            this.textFilter.addWords(...palabras);
            this.palabrasProhibidasES.push(...palabras);
        }
    }
}

// Exportar como singleton
module.exports = new ModerationService();
