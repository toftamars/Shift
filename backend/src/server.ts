import app from './app';
import { ENV } from './config/env';
import pool from './config/database';

const startServer = async () => {
  try {
    // Test database connection
    const client = await pool.connect();
    console.log('✅ PostgreSQL bağlantısı başarılı');
    client.release();

    // Start server
    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server çalışıyor: http://localhost:${ENV.PORT}`);
      console.log(`📊 Environment: ${ENV.NODE_ENV}`);
      console.log(`🗄️  Database: ${ENV.DB_NAME}`);
    });
  } catch (error) {
    console.error('❌ Server başlatılamadı:', error);
    process.exit(1);
  }
};

startServer();
