export type Size =
  | 'xxxl'
  | 'xxl'
  | 'xl'
  | 'lg'
  | 'md'
  | 'sm'
  | 'xs'
  | 'xxs'
  | 'xxxs';

export type ElementType = 'contained' | 'outline' | 'flat';

type BaseVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'danger';

export type SocialVariant = 'instagram' | 'facebook' | 'twitter';

export type ElementVariant = BaseVariant | SocialVariant;

export interface Padding {
  /**
   * PADDING
   * This property is RESPONSIVE
   */
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
}
