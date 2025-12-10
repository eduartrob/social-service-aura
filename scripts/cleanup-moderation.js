#!/usr/bin/env node
/**
 * Script de Limpieza Retroactiva de Contenido
 * 
 * Escanea todas las publicaciones y comentarios existentes
 * y desactiva aquellos que contengan contenido inapropiado.
 * 
 * Uso: node scripts/cleanup-moderation.js
 */

const { Sequelize, Op } = require('sequelize');
const moderationService = require('../src/infrastructure/services/ModerationService');
require('dotenv').config();

// Conexión a la base de datos
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
});

// Modelos simplificados para el script
const Publication = sequelize.define('Publication', {
    id: { type: Sequelize.UUID, primaryKey: true },
    content: Sequelize.TEXT,
    is_active: Sequelize.BOOLEAN
}, { tableName: 'publications', timestamps: false });

const Comment = sequelize.define('Comment', {
    id: { type: Sequelize.UUID, primaryKey: true },
    content: Sequelize.TEXT,
    is_active: Sequelize.BOOLEAN
}, { tableName: 'comments', timestamps: false });

async function cleanupPublications() {
    console.log('\n📋 Escaneando publicaciones...');

    const publications = await Publication.findAll({
        where: { is_active: true }
    });

    console.log(`   Total de publicaciones activas: ${publications.length}`);

    let flagged = 0;
    let crisis = 0;
    const flaggedItems = [];

    for (const pub of publications) {
        if (!pub.content) continue;

        const result = moderationService.verificarTexto(pub.content);

        if (!result.esSeguro) {
            flagged++;
            flaggedItems.push({
                id: pub.id,
                content: pub.content.substring(0, 50) + '...',
                reason: result.razon
            });

            // Desactivar la publicación
            await Publication.update(
                { is_active: false },
                { where: { id: pub.id } }
            );
        }

        if (result.esCrisis) {
            crisis++;
            console.log(`   ⚠️ Contenido de crisis detectado en publicación ${pub.id}`);
        }
    }

    return { total: publications.length, flagged, crisis, flaggedItems };
}

async function cleanupComments() {
    console.log('\n💬 Escaneando comentarios...');

    const comments = await Comment.findAll({
        where: { is_active: true }
    });

    console.log(`   Total de comentarios activos: ${comments.length}`);

    let flagged = 0;
    let crisis = 0;
    const flaggedItems = [];

    for (const comment of comments) {
        if (!comment.content) continue;

        const result = moderationService.verificarTexto(comment.content);

        if (!result.esSeguro) {
            flagged++;
            flaggedItems.push({
                id: comment.id,
                content: comment.content.substring(0, 50) + '...',
                reason: result.razon
            });

            // Desactivar el comentario
            await Comment.update(
                { is_active: false },
                { where: { id: comment.id } }
            );
        }

        if (result.esCrisis) {
            crisis++;
            console.log(`   ⚠️ Contenido de crisis detectado en comentario ${comment.id}`);
        }
    }

    return { total: comments.length, flagged, crisis, flaggedItems };
}

async function main() {
    console.log('🧹 LIMPIEZA RETROACTIVA DE CONTENIDO');
    console.log('====================================');
    console.log(`📅 Fecha: ${new Date().toISOString()}`);

    try {
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        // Limpiar publicaciones
        const pubResults = await cleanupPublications();

        // Limpiar comentarios
        const commentResults = await cleanupComments();

        // Reporte final
        console.log('\n📊 REPORTE FINAL');
        console.log('================');
        console.log(`\n📋 Publicaciones:`);
        console.log(`   - Total escaneadas: ${pubResults.total}`);
        console.log(`   - Desactivadas por contenido inapropiado: ${pubResults.flagged}`);
        console.log(`   - Con contenido de crisis (no desactivadas): ${pubResults.crisis}`);

        console.log(`\n💬 Comentarios:`);
        console.log(`   - Total escaneados: ${commentResults.total}`);
        console.log(`   - Desactivados por contenido inapropiado: ${commentResults.flagged}`);
        console.log(`   - Con contenido de crisis (no desactivados): ${commentResults.crisis}`);

        console.log(`\n✅ LIMPIEZA COMPLETADA`);
        console.log(`   Total de items desactivados: ${pubResults.flagged + commentResults.flagged}`);

        // Mostrar detalles de items flaggeados
        if (pubResults.flaggedItems.length > 0) {
            console.log('\n🚫 Publicaciones desactivadas:');
            pubResults.flaggedItems.forEach((item, i) => {
                console.log(`   ${i + 1}. [${item.id.substring(0, 8)}...] "${item.content}"`);
            });
        }

        if (commentResults.flaggedItems.length > 0) {
            console.log('\n🚫 Comentarios desactivados:');
            commentResults.flaggedItems.forEach((item, i) => {
                console.log(`   ${i + 1}. [${item.id.substring(0, 8)}...] "${item.content}"`);
            });
        }

    } catch (error) {
        console.error('❌ Error durante la limpieza:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Ejecutar
main();
