export type UniqueStyle = Partial<
  Record<
    string,
    // TODO: why is this optional?
    Record<string, { total?: number; className?: string } | undefined>
  >
>;
