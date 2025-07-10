-- Создание системы владения 10% цветов создателем

-- Таблица для цветов, принадлежащих создателю
CREATE TABLE creator_colors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    color_hex VARCHAR(7) NOT NULL,
    rarity VARCHAR(20) NOT NULL,
    price INTEGER NOT NULL DEFAULT 0, -- цена в Stars
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sold_at TIMESTAMP WITH TIME ZONE,
    buyer_id BIGINT REFERENCES users(telegram_id)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_creator_colors_rarity ON creator_colors(rarity);
CREATE INDEX idx_creator_colors_available ON creator_colors(is_available);
CREATE INDEX idx_creator_colors_price ON creator_colors(price);

-- Таблица для настроек системы владения
CREATE TABLE ownership_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Базовые настройки
INSERT INTO ownership_settings (setting_key, setting_value) VALUES
('ownership_percentage', '10'), -- 10% цветов принадлежат создателю
('daily_purchase_limit', '100'), -- лимит покупок в день
('max_ownership_per_rarity', '1000'), -- максимум цветов одной редкости
('purchase_cooldown_minutes', '5'), -- кулдаун между покупками
('kyc_threshold_stars', '10000'); -- порог для KYC

-- Таблица для отслеживания покупок игроков (защита от ботов)
CREATE TABLE purchase_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id BIGINT NOT NULL REFERENCES users(telegram_id),
    color_id UUID NOT NULL REFERENCES creator_colors(id),
    price_paid INTEGER NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для защиты от ботов
CREATE INDEX idx_purchase_history_buyer ON purchase_history(buyer_id);
CREATE INDEX idx_purchase_history_date ON purchase_history(purchased_at);

-- Функция для автоматического создания цветов создателя при генерации новых цветов
CREATE OR REPLACE FUNCTION create_creator_colors()
RETURNS TRIGGER AS $$
DECLARE
    ownership_pct INTEGER;
    colors_to_create INTEGER;
    base_price INTEGER;
BEGIN
    -- Получаем процент владения
    SELECT setting_value::INTEGER INTO ownership_pct 
    FROM ownership_settings 
    WHERE setting_key = 'ownership_percentage';
    
    -- Вычисляем количество цветов для создания (10% от общего количества)
    colors_to_create := GREATEST(1, (SELECT COUNT(*) FROM colors WHERE rarity = NEW.rarity) * ownership_pct / 100);
    
    -- Определяем базовую цену в зависимости от редкости
    base_price := CASE NEW.rarity
        WHEN 'common' THEN 10
        WHEN 'uncommon' THEN 25
        WHEN 'rare' THEN 50
        WHEN 'mythical' THEN 100
        WHEN 'legendary' THEN 200
        WHEN 'ascendant' THEN 500
        WHEN 'unique' THEN 1000
        ELSE 10
    END;
    
    -- Создаем цвета для создателя (если их еще нет)
    INSERT INTO creator_colors (color_hex, rarity, price)
    SELECT NEW.hex, NEW.rarity, base_price
    WHERE NOT EXISTS (
        SELECT 1 FROM creator_colors 
        WHERE color_hex = NEW.hex AND rarity = NEW.rarity
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического создания цветов создателя
CREATE TRIGGER trigger_create_creator_colors
    AFTER INSERT ON colors
    FOR EACH ROW
    EXECUTE FUNCTION create_creator_colors();

-- Функция для получения доступных цветов создателя
CREATE OR REPLACE FUNCTION get_available_creator_colors(p_rarity VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    color_hex VARCHAR,
    rarity VARCHAR,
    price INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc.id,
        cc.color_hex,
        cc.rarity,
        cc.price,
        cc.created_at
    FROM creator_colors cc
    WHERE cc.is_available = true
    AND (p_rarity IS NULL OR cc.rarity = p_rarity)
    ORDER BY cc.rarity, cc.price, cc.created_at;
END;
$$ LANGUAGE plpgsql;

-- Функция для покупки цвета у создателя
CREATE OR REPLACE FUNCTION purchase_creator_color(
    p_color_id UUID,
    p_buyer_id BIGINT,
    p_stars_paid INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    color_record creator_colors%ROWTYPE;
    daily_limit INTEGER;
    purchases_today INTEGER;
    last_purchase TIMESTAMP WITH TIME ZONE;
    cooldown_minutes INTEGER;
BEGIN
    -- Получаем информацию о цвете
    SELECT * INTO color_record FROM creator_colors WHERE id = p_color_id AND is_available = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Color not available for purchase';
    END IF;
    
    -- Проверяем цену
    IF p_stars_paid < color_record.price THEN
        RAISE EXCEPTION 'Insufficient payment';
    END IF;
    
    -- Получаем лимиты
    SELECT setting_value::INTEGER INTO daily_limit 
    FROM ownership_settings WHERE setting_key = 'daily_purchase_limit';
    
    SELECT setting_value::INTEGER INTO cooldown_minutes 
    FROM ownership_settings WHERE setting_key = 'purchase_cooldown_minutes';
    
    -- Проверяем дневной лимит
    SELECT COUNT(*) INTO purchases_today 
    FROM purchase_history 
    WHERE buyer_id = p_buyer_id 
    AND purchased_at >= CURRENT_DATE;
    
    IF purchases_today >= daily_limit THEN
        RAISE EXCEPTION 'Daily purchase limit exceeded';
    END IF;
    
    -- Проверяем кулдаун
    SELECT MAX(purchased_at) INTO last_purchase 
    FROM purchase_history 
    WHERE buyer_id = p_buyer_id;
    
    IF last_purchase IS NOT NULL AND 
       last_purchase + INTERVAL '1 minute' * cooldown_minutes > NOW() THEN
        RAISE EXCEPTION 'Purchase cooldown active';
    END IF;
    
    -- Выполняем покупку
    UPDATE creator_colors 
    SET is_available = false, sold_at = NOW(), buyer_id = p_buyer_id 
    WHERE id = p_color_id;
    
    -- Добавляем цвет в галерею покупателя
    INSERT INTO colors (telegram_id, hex, rarity, obtained_at)
    VALUES (p_buyer_id, color_record.color_hex, color_record.rarity, NOW());
    
    -- Записываем историю покупки
    INSERT INTO purchase_history (buyer_id, color_id, price_paid)
    VALUES (p_buyer_id, p_color_id, p_stars_paid);
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;
