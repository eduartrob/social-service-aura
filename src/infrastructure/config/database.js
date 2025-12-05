// Configuración de base de datos para Social Service - PostgreSQL
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configuración base de datos para Social Service
const databaseConfig = {
  development: {
    postgres: {
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'social_dev_db',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: console.log,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    }
  },

  test: {
    postgres: {
      username: process.env.TEST_DB_USER || 'postgres',
      password: process.env.TEST_DB_PASSWORD || 'postgres',
      database: process.env.TEST_DB_NAME || 'social_test_db',
      host: process.env.TEST_DB_HOST || 'localhost',
      port: process.env.TEST_DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    }
  },

  production: {
    postgres: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      pool: {
        max: 20,
        min: 5,
        acquire: 60000,
        idle: 30000
      },
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    }
  }
};

// Función para obtener configuración de BD basada en entorno
function getDatabaseConfig(environment = null, dialect = null) {
  const env = environment || process.env.NODE_ENV || 'development';
  const dbDialect = dialect || process.env.DB_DIALECT || 'postgres';

  const config = databaseConfig[env];

  if (!config) {
    throw new Error(`Configuración de entorno '${env}' no encontrada`);
  }

  if (!config[dbDialect]) {
    throw new Error(`Configuración de dialecto '${dbDialect}' no encontrada para entorno '${env}'`);
  }

  return {
    ...config[dbDialect],
    environment: env,
    dialect: dbDialect
  };
}

// Crear instancia de Sequelize con configuración actual
const currentConfig = getDatabaseConfig();
const sequelize = new Sequelize(currentConfig);

// Exportar tanto la instancia como las configuraciones
module.exports = sequelize;
module.exports.sequelize = sequelize;
module.exports.databaseConfig = databaseConfig;
module.exports.getDatabaseConfig = getDatabaseConfig;