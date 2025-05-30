# Используем официальный образ nginx как базовый
FROM nginx:alpine

# Удаляем дефолтную конфигурацию nginx
RUN rm -rf /etc/nginx/conf.d/*

# Копируем нашу конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/invoicer.conf

# Копируем файлы приложения
COPY . /usr/share/nginx/html

# Открываем порт 80
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]