FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
  mysql-dev \
  libzip-dev \
  oniguruma-dev \
  $PHPIZE_DEPS \
  && docker-php-ext-install \
    pdo pdo_mysql zip mbstring opcache
RUN pecl install redis \
  && docker-php-ext-enable redis

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --optimize-autoloader

COPY . .

RUN chown -R www-data:www-data /var/www/html

EXPOSE 9000