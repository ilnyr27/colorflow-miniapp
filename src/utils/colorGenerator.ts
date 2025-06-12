import { Color, ColorRarity, RGB } from '@/types/game';
import { GAME_CONFIG } from '@/config/game';

export class ColorGenerator {
  private static usedColors = new Set<string>();

  static generateUniqueId(): string {
    return crypto.randomUUID();
  }

  static generateColor(rarity: ColorRarity, predefinedColor?: RGB): Color {
    const id = this.generateUniqueId();
    let rgb: RGB;

    if (predefinedColor) {
      rgb = predefinedColor;
    } else {
      rgb = this.generateRgbByRarity(rarity);
    }

    return {
      id,
      rarity,
      rgb,
      stakingCount: 0,
      ownedSince: new Date()
    };
  }

  private static generateRgbByRarity(rarity: ColorRarity): RGB {
    switch (rarity) {
      case 'unique':
        return this.generateUniqueColor();
      case 'ulterior':
        return this.generateUlteriorColor();
      case 'ultimate':
        return this.generateUltimateColor();
      case 'ascendant':
        return this.generateAscendantColor();
      default:
        return this.generateRegularColor(rarity);
    }
  }

  private static generateUniqueColor(): RGB {
    const availableColors = GAME_CONFIG.FIXED_UNIQUE_COLORS.filter(
      color => !this.usedColors.has(`unique-${color.name}`)
    );

    if (availableColors.length === 0) {
      throw new Error('Все уникальные цвета уже сгенерированы');
    }

    const selectedColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    this.usedColors.add(`unique-${selectedColor.name}`);
    
    return { ...selectedColor };
  }

  private static generateUlteriorColor(): RGB {
    const availableColors = GAME_CONFIG.FIXED_ULTERIOR_COLORS.filter(
      color => !this.usedColors.has(`ulterior-${color.name}`)
    );

    if (availableColors.length === 0) {
      throw new Error('Все ulterior цвета уже сгенерированы');
    }

    const selectedColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    this.usedColors.add(`ulterior-${selectedColor.name}`);
    
    return { ...selectedColor };
  }

  private static generateUltimateColor(): RGB {
    if (this.usedColors.has('ultimate')) {
      throw new Error('Ultimate цвет уже создан');
    }

    this.usedColors.add('ultimate');
    
    return {
      r: 255,
      g: 255,
      b: 255,
      isUltimate: true
    };
  }

  private static generateAscendantColor(): RGB {
    // Генерируем оттенки серого (1-254)
    let grayValue: number;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      grayValue = Math.floor(Math.random() * 254) + 1;
      attempts++;
    } while (
      this.usedColors.has(`ascendant-${grayValue}`) && 
      attempts < maxAttempts
    );

    if (attempts >= maxAttempts) {
      throw new Error('Не удалось сгенерировать уникальный ascendant цвет');
    }

    this.usedColors.add(`ascendant-${grayValue}`);

    return {
      r: grayValue,
      g: grayValue,
      b: grayValue
    };
  }

  private static generateRegularColor(rarity: ColorRarity): RGB {
    let rgb: RGB;
    let attempts = 0;
    const maxAttempts = 1000;

    do {
      rgb = this.generateRgbValuesByRarity(rarity);
      attempts++;
    } while (
      this.usedColors.has(`${rarity}-${rgb.r}-${rgb.g}-${rgb.b}`) && 
      attempts < maxAttempts
    );

    if (attempts >= maxAttempts) {
      throw new Error(`Не удалось сгенерировать уникальный ${rarity} цвет`);
    }

    this.usedColors.add(`${rarity}-${rgb.r}-${rgb.g}-${rgb.b}`);
    return rgb;
  }

  private static generateRgbValuesByRarity(rarity: ColorRarity): RGB {
    switch (rarity) {
      case 'common':
        // Бледные, тусклые цвета (высокие значения RGB)
        return {
          r: Math.floor(Math.random() * 100) + 155,
          g: Math.floor(Math.random() * 100) + 155,
          b: Math.floor(Math.random() * 100) + 155
        };
      
      case 'uncommon':
        // Слегка более насыщенные
        return {
          r: Math.floor(Math.random() * 150) + 100,
          g: Math.floor(Math.random() * 150) + 100,
          b: Math.floor(Math.random() * 150) + 100
        };
      
      case 'rare':
        // Мягкие оттенки
        return {
          r: Math.floor(Math.random() * 200) + 55,
          g: Math.floor(Math.random() * 200) + 55,
          b: Math.floor(Math.random() * 200) + 55
        };
      
      case 'mythical':
        // Светлые, пастельные, но заметные
        return {
          r: Math.floor(Math.random() * 155) + 100,
          g: Math.floor(Math.random() * 155) + 100,
          b: Math.floor(Math.random() * 155) + 100
        };
      
      case 'legendary':
        // Насыщенные и яркие
        return {
          r: Math.floor(Math.random() * 200) + 55,
          g: Math.floor(Math.random() * 200) + 55,
          b: Math.floor(Math.random() * 200) + 55
        };
      
      default:
        // Fallback - средние значения
        return {
          r: Math.floor(Math.random() * 256),
          g: Math.floor(Math.random() * 256),
          b: Math.floor(Math.random() * 256)
        };
    }
  }

  static getRgbString(rgb: RGB): string {
    if (rgb.isUltimate) {
      return 'ultimate-gradient';
    }
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  static getHexCode(rgb: RGB): string {
    if (rgb.isUltimate) {
      return '#ULTIMATE';
    }
    
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  static getBorderColor(rarity: ColorRarity): string {
    const colors = {
      common: '#888888',
      uncommon: '#1eff00',
      rare: '#0070dd',
      mythical: '#a335ee',
      legendary: '#ff8000',
      ascendant: '#e6cc80',
      unique: '#e268a8',
      ulterior: '#ff9900',
      ultimate: '#ff00ff'
    };
    
    return colors[rarity] || '#ffffff';
  }

  static reset(): void {
    this.usedColors.clear();
  }
}