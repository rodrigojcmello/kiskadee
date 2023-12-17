export type StyleKey = string;

export type UniqueStyle = Partial<
  Record<
    StyleKey,
    // TODO: why is this optional?
    Record<string, { total?: number; className?: string } | undefined>
  >
>;
