import type { ComponentClassNameMapJSON } from '@kiskadee/core';

// Minimal Fluent 2 Microsoft artifact excerpts captured on 2026-09-07.
// Only neutral Medium palette slots are retained; tests need neither generated CSS
// nor a Showcase build. Class identifiers are opaque consumer inputs, not color assertions.
export const switchSurfaceClassMaps = {
  light: {
    standard: {
      base: {
        e2: {
          c: {
            s: {
              neutral: {
                m: 'fm-af fm-my fm-iv fm-bn fm-it fm-bl fm-iu fm-bm fm-oi fm-mz fm-na fm-nb'
              }
            },
            v: {
              neutral: {
                m: 'fm-hf fm-dv fm-hl fm-dx fm-hn fm-dy fm-bw fm-bn fm-cu fm-bl fm-cv fm-bm fm-eb fm-dw'
              }
            }
          }
        },
        e3: {
          c: {
            s: {
              neutral: {
                m: 'fm-rg fm-e fm-uf fm-uh fm-bw fm-cu fm-cv fm-oh'
              }
            },
            v: {
              neutral: {
                m: 'fm-af fm-e fm-iv fm-it fm-iu fm-ec'
              }
            }
          }
        },
        e4: {
          c: {
            s: {
              neutral: {
                m: 'fm-n fm-an'
              }
            },
            v: {
              neutral: {
                m: 'fm-a fm-b'
              }
            }
          }
        },
        e5: {
          c: {
            s: {
              neutral: {
                m: 'fm-n fm-an'
              }
            },
            v: {
              neutral: {
                m: 'fm-a fm-b'
              }
            }
          }
        },
        e6: {
          c: {
            s: {
              neutral: {
                m: 'fm-a fm-ek fm-gg fm-ij fm-cy'
              }
            },
            v: {
              neutral: {
                m: 'fm-ac fm-bj fm-cz fm-ag fm-ii fm-ik fm-cy'
              }
            }
          }
        }
      }
    }
  },
  dark: {
    standard: {
      base: {
        e2: {
          c: {
            s: {
              neutral: {
                m: 'fm-gp fm-gh fm-mk fm-bn fm-mh fm-bl fm-mi fm-bm fm-hg fm-gk fm-gl fm-gm'
              }
            },
            v: {
              neutral: {
                m: 'fm-hf fm-dv fm-hl fm-dx fm-hn fm-dy fm-bw fm-bn fm-cu fm-bl fm-cv fm-bm fm-eb fm-dw'
              }
            }
          }
        },
        e3: {
          c: {
            s: {
              neutral: {
                m: 'fm-ki fm-e fm-md fm-mf fm-bw fm-cu fm-cv fm-hh'
              }
            },
            v: {
              neutral: {
                m: 'fm-af fm-e fm-iv fm-it fm-iu fm-ec'
              }
            }
          }
        },
        e4: {
          c: {
            s: {
              neutral: {
                m: 'fm-a fm-g'
              }
            },
            v: {
              neutral: {
                m: 'fm-a fm-b'
              }
            }
          }
        },
        e5: {
          c: {
            s: {
              neutral: {
                m: 'fm-a fm-g'
              }
            },
            v: {
              neutral: {
                m: 'fm-a fm-b'
              }
            }
          }
        },
        e6: {
          c: {
            s: {
              neutral: {
                m: 'fm-bi fm-ek fm-gg fm-ij fm-hw'
              }
            },
            v: {
              neutral: {
                m: 'fm-ac fm-bj fm-cz fm-ag fm-ii fm-ik fm-cy'
              }
            }
          }
        }
      }
    }
  }
} satisfies Record<'light' | 'dark', NonNullable<ComponentClassNameMapJSON['switch']>>;
