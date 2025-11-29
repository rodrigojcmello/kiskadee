'use client';

import { Button as KButton, SmoothText, useKiskadee } from '@kiskadee/react-components';
import s from './Button.module.scss';

export function Button() {
  const { fontName } = useKiskadee();
  return (
    <section>
      <h2>Button</h2>
      <p>Exemplo simples do componente Button:</p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/*<KiskadeeButton label="Button" onClick={() => alert('Button clicado!')} />*/}
        {/*<KiskadeeButton*/}
        {/*  label="Com ícone"*/}
        {/*  icon={<span aria-hidden>⭐</span>}*/}
        {/*  onClick={() => alert('Com ícone')}*/}
        {/*/>*/}
        {/*<KiskadeeButton*/}
        {/*  aria-label="Icon only"*/}
        {/*  icon={<span aria-hidden>🔔</span>}*/}
        {/*  onClick={() => alert('Somente ícone')}*/}
        {/*/>*/}
        <div className={s['interaction-state']}>
          <h3>Interaction States - Primary (Solid)</h3>
          <div className={s['example-states']}>
            <KButton label={<SmoothText triggerKey={fontName}>Rest</SmoothText>} tone="solid" semantic="primary" />
            <KButton label={<SmoothText triggerKey={fontName}>Hover</SmoothText>} tone="solid" semantic="primary" status="hover" />
            <KButton label={<SmoothText triggerKey={fontName}>Focus</SmoothText>} tone="solid" semantic="primary" status="focus" />
            <KButton label={<SmoothText triggerKey={fontName}>Pressed</SmoothText>} tone="solid" semantic="primary" status="pressed" />
            <KButton label={<SmoothText triggerKey={fontName}>Selected</SmoothText>} tone="solid" semantic="primary" controlState={true} />
            <KButton label={<SmoothText triggerKey={fontName}>Disabled</SmoothText>} tone="solid" semantic="primary" status="disabled" />
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Primary (Soft)</h3>
          <div className={s['example-states']}>
            <KButton label={<SmoothText triggerKey={fontName}>Rest</SmoothText>} tone="soft" semantic="primary" />
            <KButton label={<SmoothText triggerKey={fontName}>Hover</SmoothText>} tone="soft" semantic="primary" status="hover" />
            <KButton label={<SmoothText triggerKey={fontName}>Focus</SmoothText>} tone="soft" semantic="primary" status="focus" />
            <KButton label={<SmoothText triggerKey={fontName}>Pressed</SmoothText>} tone="soft" semantic="primary" status="pressed" />
            <KButton label={<SmoothText triggerKey={fontName}>Selected</SmoothText>} tone="soft" semantic="primary" controlState={true} />
            <KButton label={<SmoothText triggerKey={fontName}>Disabled</SmoothText>} tone="soft" semantic="primary" status="disabled" />
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Neutral (Soft)</h3>
          <div className={s['example-states']}>
            <KButton label={<SmoothText triggerKey={fontName}>Rest</SmoothText>} tone="soft" />
            <KButton label={<SmoothText triggerKey={fontName}>Hover</SmoothText>} tone="soft" status="hover" />
            <KButton label={<SmoothText triggerKey={fontName}>Focus</SmoothText>} tone="soft" status="focus" />
            <KButton label={<SmoothText triggerKey={fontName}>Pressed</SmoothText>} tone="soft" status="pressed" />
            <KButton label={<SmoothText triggerKey={fontName}>Selected</SmoothText>} tone="soft" controlState={true} />
            <KButton label={<SmoothText triggerKey={fontName}>Disabled</SmoothText>} tone="soft" status="disabled" />
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Destructive (Solid)</h3>
          <div className={s['example-states']}>
            <KButton label={<SmoothText triggerKey={fontName}>Rest</SmoothText>} tone="solid" semantic="redLike" />
            <KButton label={<SmoothText triggerKey={fontName}>Hover</SmoothText>} tone="solid" semantic="redLike" status="hover" />
            <KButton label={<SmoothText triggerKey={fontName}>Focus</SmoothText>} tone="solid" semantic="redLike" status="focus" />
            <KButton label={<SmoothText triggerKey={fontName}>Pressed</SmoothText>} tone="solid" semantic="redLike" status="pressed" />
            <KButton label={<SmoothText triggerKey={fontName}>Selected</SmoothText>} tone="solid" semantic="redLike" controlState={true} />
            <KButton label={<SmoothText triggerKey={fontName}>Disabled</SmoothText>} tone="solid" semantic="redLike" status="disabled" />
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Destructive (Soft)</h3>
          <div className={s['example-states']}>
            <KButton label={<SmoothText triggerKey={fontName}>Rest</SmoothText>} tone="soft" semantic="redLike" />
            <KButton label={<SmoothText triggerKey={fontName}>Hover</SmoothText>} tone="soft" semantic="redLike" status="hover" />
            <KButton label={<SmoothText triggerKey={fontName}>Focus</SmoothText>} tone="soft" semantic="redLike" status="focus" />
            <KButton label={<SmoothText triggerKey={fontName}>Pressed</SmoothText>} tone="soft" semantic="redLike" status="pressed" />
            <KButton label={<SmoothText triggerKey={fontName}>Selected</SmoothText>} tone="soft" semantic="redLike" controlState={true} />
            <KButton label={<SmoothText triggerKey={fontName}>Disabled</SmoothText>} tone="soft" semantic="redLike" status="disabled" />
          </div>
        </div>

        <div className={s['interaction-state']}>
          <h3>Size / Scale</h3>
          <div className={s['example-states']}>
            <KButton label={<SmoothText triggerKey={fontName}>Small 2</SmoothText>} scale="s:sm:2" />
            <KButton label={<SmoothText triggerKey={fontName}>Small</SmoothText>} scale="s:sm:1" />
            <KButton label={<SmoothText triggerKey={fontName}>Medium</SmoothText>} scale="s:md:1" />
            <KButton label={<SmoothText triggerKey={fontName}>Large</SmoothText>} scale="s:lg:1" />
            <KButton label={<SmoothText triggerKey={fontName}>Large 2</SmoothText>} scale="s:lg:2" />
            <KButton label={<SmoothText triggerKey={fontName}>Large 3</SmoothText>} scale="s:lg:3" />
          </div>
        </div>
        <div>
          <h3>Selected</h3>
          <KButton label={<SmoothText triggerKey={fontName}>Rest</SmoothText>} controlState={true} />
          <KButton label={<SmoothText triggerKey={fontName}>Hover</SmoothText>} status="hover" controlState={true} />
          <KButton label={<SmoothText triggerKey={fontName}>Focus</SmoothText>} status="focus" controlState={true} />
          <KButton label={<SmoothText triggerKey={fontName}>Pressed</SmoothText>} status="pressed" controlState={true} />
        </div>
        <div>
          <h3>Shadow</h3>
          <KButton label={<SmoothText triggerKey={fontName}>Rest</SmoothText>} shadow={true} />
          <KButton label={<SmoothText triggerKey={fontName}>Hover</SmoothText>} shadow={true} status={'hover'} />
          <KButton label={<SmoothText triggerKey={fontName}>Focus</SmoothText>} shadow={true} status={'focus'} />
          <KButton label={<SmoothText triggerKey={fontName}>Pressed</SmoothText>} shadow={true} status={'pressed'} />
          <KButton label={<SmoothText triggerKey={fontName}>Disabled</SmoothText>} shadow={true} status={'disabled'} />
        </div>
      </div>
    </section>
  );
}

export default Button;
