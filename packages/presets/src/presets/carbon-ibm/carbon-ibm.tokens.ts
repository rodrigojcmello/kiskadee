import type { ThemeMode } from '@kiskadee/core';
import type { PresetSolidColorRole } from '../../utils/presetColor.ts';
import type { CarbonIbmColorResolver } from './carbon-ibm.color.ts';

// Generated from inspected Carbon tokens; source and distances live in colors/token-mapping.json.
export const carbonTokenLocators = {
  background: {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 8,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 3,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'background-active': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 28,
      evidenceId: 'source.tokens',
      alpha: 50.19607843137255
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 40
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 40
    }
  },
  'background-hover': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 28,
      evidenceId: 'source.tokens',
      alpha: 12.156862745098039
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 16.07843137254902
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 16.07843137254902
    }
  },
  'background-selected': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 28,
      evidenceId: 'source.tokens',
      alpha: 20
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 23.92156862745098
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 23.92156862745098
    }
  },
  'background-selected-hover': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 28,
      evidenceId: 'source.tokens',
      alpha: 32.15686274509804
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 32.15686274509804
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 32.15686274509804
    }
  },
  'background-brand': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'background-inverse': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 70,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'background-inverse-hover': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 95,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 95,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-01': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 2,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 8,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-02': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-03': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 2,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-hover-01': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 5,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 26,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-hover-02': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 5,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 26,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-hover-03': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 5,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-active-01': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-active-02': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-active-03': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-selected-01': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 7,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-selected-02': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 7,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-selected-03': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 7,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-selected-hover-01': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 10,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 26,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-selected-hover-02': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 10,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-selected-hover-03': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 10,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-selected-disabled': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 28,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-selected-inverse': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 95,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-accent-01': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 7,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-accent-02': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 7,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-accent-03': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 7,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-accent-hover-01': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 10,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 26,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-accent-hover-02': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 10,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-accent-hover-03': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 10,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 55,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-accent-active-01': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 20,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-accent-active-02': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 20,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-accent-active-03': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 20,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'field-01': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 2,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 8,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'field-02': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'field-03': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 2,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'field-hover-01': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 5,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 26,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'field-hover-02': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 5,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 26,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'field-hover-03': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 5,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'border-subtle-00': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 7,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'border-subtle-01': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'border-subtle-02': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 7,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'border-subtle-03': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'border-subtle-selected-01': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'border-subtle-selected-02': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'border-subtle-selected-03': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'border-strong-01': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 28,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'border-strong-02': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 28,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'border-strong-03': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 28,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'border-tile-01': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'border-tile-02': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 20,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'border-tile-03': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'border-inverse': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 95,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'border-disabled': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 50.19607843137255
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 50.19607843137255
    }
  },
  'border-interactive': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  focus: {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    darker: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    }
  },
  'focus-inset': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 3,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 3,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'focus-inverse': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  interactive: {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  highlight: {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 7,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 18,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 9,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'toggle-off': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 28,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  overlay: {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'dark',
      alpha: 60
    },
    dark: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'dark',
      alpha: 60
    },
    darker: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'dark',
      alpha: 60
    }
  },
  'skeleton-element': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'skeleton-background': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 5,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 26,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 26,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'support-error': {
    light: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 70,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'support-success': {
    light: {
      mode: 'exact',
      role: 'primitive.green.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.green.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.green.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'support-warning': {
    light: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 12,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'support-info': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 55,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'support-error-inverse': {
    light: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 26,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'support-success-inverse': {
    light: {
      mode: 'exact',
      role: 'primitive.green.v1',
      tone: 22,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.green.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.green.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'support-warning-inverse': {
    light: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 12,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'support-info-inverse': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 28,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 35,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 35,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'link-primary': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'link-primary-hover': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 55,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'link-secondary': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 55,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'link-inverse': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 20,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'link-visited': {
    light: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 35,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'icon-primary': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 95,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'icon-secondary': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 60,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'icon-on-color': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    dark: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    darker: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    }
  },
  'icon-on-color-disabled': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 28,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 25.098039215686274
    },
    darker: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 25.098039215686274
    }
  },
  'icon-interactive': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    darker: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    }
  },
  'icon-inverse': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 3,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 3,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'icon-disabled': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 95,
      evidenceId: 'source.tokens',
      alpha: 25.098039215686274
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 25.098039215686274
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 25.098039215686274
    }
  },
  'text-primary': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 95,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'text-secondary': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 60,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'text-placeholder': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 20,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'text-on-color': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    dark: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    darker: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    }
  },
  'text-on-color-disabled': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 28,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 25.098039215686274
    },
    darker: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 25.098039215686274
    }
  },
  'text-helper': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'text-error': {
    light: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'text-inverse': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 3,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 3,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'text-disabled': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 95,
      evidenceId: 'source.tokens',
      alpha: 25.098039215686274
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 25.098039215686274
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 25.098039215686274
    }
  },
  'button-primary': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'button-primary-hover': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'button-primary-active': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 70,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 18,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 18,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'button-secondary': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 70,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'button-secondary-hover': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'button-secondary-active': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'button-tertiary': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    darker: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    }
  },
  'button-tertiary-hover': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 99,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'button-tertiary-active': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 70,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'button-danger-primary': {
    light: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'button-danger-secondary': {
    light: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 70,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'button-danger-hover': {
    light: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 35,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 35,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'button-danger-active': {
    light: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 70,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'button-separator': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 7,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 3,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 3,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'button-disabled': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'support-caution-major': {
    light: {
      mode: 'exact',
      role: 'primitive.orange.v1',
      tone: 20,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.orange.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.orange.v1',
      tone: 75,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'support-caution-minor': {
    light: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 12,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 85,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'support-undefined': {
    light: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 35,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 65,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'link-inverse-hover': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 35,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 35,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'link-inverse-visited': {
    light: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 20,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 50,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'link-inverse-active': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 2,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 3,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 3,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-background-00': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 8,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 3,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-background-01': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 2,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 8,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'layer-background-02': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 16,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-background-blue': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 7,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 35,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 35,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-color-blue': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 55,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 90,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 90,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-hover-blue': {
    light: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 10,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 45,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.blue.v1',
      tone: 45,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-background-gray': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 7,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-color-gray': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 95,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 90,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 90,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-hover-gray': {
    light: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 10,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.black.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-background-green': {
    light: {
      mode: 'exact',
      role: 'primitive.green.v1',
      tone: 9,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.green.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.green.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-color-green': {
    light: {
      mode: 'exact',
      role: 'primitive.green.v1',
      tone: 60,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.green.v1',
      tone: 90,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.green.v1',
      tone: 90,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-hover-green': {
    light: {
      mode: 'exact',
      role: 'primitive.green.v1',
      tone: 14,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.green.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.green.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-background-red': {
    light: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 6,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-color-red': {
    light: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 55,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 90,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 90,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-hover-red': {
    light: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 10,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.red.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-background-purple': {
    light: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 7,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-color-purple': {
    light: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 55,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 90,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 90,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-hover-purple': {
    light: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 10,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.purple.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-background-yellow': {
    light: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 9,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 30,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-color-yellow': {
    light: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 60,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 90,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 90,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-hover-yellow': {
    light: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 10,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    dark: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    },
    darker: {
      mode: 'exact',
      role: 'primitive.yellow.v1',
      tone: 40,
      evidenceId: 'source.tokens',
      alpha: 100
    }
  },
  'tag-border-blue': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    },
    dark: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    },
    darker: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    }
  },
  'tag-border-green': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    },
    dark: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    },
    darker: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    }
  },
  'tag-border-purple': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    },
    dark: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    },
    darker: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    }
  },
  'tag-border-red': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    },
    dark: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    },
    darker: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    }
  },
  'tag-border-yellow': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    },
    dark: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    },
    darker: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    }
  },
  'tag-border-gray': {
    light: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    },
    dark: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    },
    darker: {
      mode: 'cap',
      primitive: 'primitive.black.v1',
      polarity: 'light',
      alpha: 0
    }
  }
} as const;
export type CarbonTokenName = keyof typeof carbonTokenLocators;

export function tokenColor(
  c: CarbonIbmColorResolver,
  theme: ThemeMode,
  token: CarbonTokenName,
  role?: PresetSolidColorRole
) {
  const locator = carbonTokenLocators[token][theme];
  return c.resolve(
    'default',
    theme === 'light' ? 'l' : 'd',
    locator.mode === 'cap' ? locator : { ...locator, role: role ?? locator.role }
  );
}
