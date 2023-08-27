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

export type ButtonType = 'contained' | 'outline' | 'flat';

export type ButtonSocialType = 'instagram' | 'facebook' | 'twitter';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'danger'
  | ButtonSocialType;

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
