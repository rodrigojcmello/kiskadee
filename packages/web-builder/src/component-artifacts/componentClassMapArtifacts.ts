export type ComponentClassMapArtifactJSON<TClassMap = unknown> = {
  component: string;
  classMap: TClassMap;
};

export function componentNameToArtifactSlug(componentName: string): string {
  return componentName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export function getComponentCoreClassMapArtifactPath(componentName: string): string {
  return `class-maps/core/${componentNameToArtifactSlug(componentName)}.kiskadee.json`;
}

export function getComponentPaletteClassMapArtifactPath(
  paletteName: string,
  componentName: string
): string {
  return `class-maps/${paletteName}/${componentNameToArtifactSlug(componentName)}.kiskadee.json`;
}

export function buildComponentClassMapArtifact<TClassMap>(
  componentName: string,
  classMap: TClassMap
): ComponentClassMapArtifactJSON<TClassMap> {
  return {
    component: componentName,
    classMap
  };
}
