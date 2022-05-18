export interface ButtonProps {
  readonly icon?: string;
  readonly text: string;
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly variant?: string;
  readonly type?: 'button' | 'reset' | 'submit';
}
