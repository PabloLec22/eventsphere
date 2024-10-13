#!/bin/bash

# Mensaje de bienvenida
echo "Iniciando la configuración del proyecto EventSphere..."

# Actualizar e instalar dependencias del sistema
echo "Actualizando repositorios..."
sudo apt-get update

echo "Instalando Node.js, npm y otros paquetes..."
sudo apt-get install -y nodejs npm git

# Clonar el repositorio (reemplaza la URL con tu propio repositorio de GitHub)
echo "Clonando el repositorio..."
git clone https://github.com/PabloLec22/event-sphere.git

# Moverse al directorio del proyecto
cd event-sphere

# Instalar dependencias del proyecto (npm)
echo "Instalando dependencias del proyecto..."
npm install express passport passport-google-oauth20 mongoose express-session dotenv helmet morgan body-parser express-ejs-layouts ejs

# Crear archivo .env (asegúrate de agregar tus propias claves aquí)
echo "Configurando las variables de entorno..."
cat <<EOT >> .env
MONGO_URI=tu_mongo_uri_aqui
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
SESSION_SECRET=tu_session_secret_aqui
EOT

# Verificar instalación de dependencias
echo "Verificando instalación de dependencias..."
npm list

# Finalizar
echo "¡Configuración completada! Ya puedes iniciar tu servidor ejecutando: npm start"
