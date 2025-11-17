'use client';

import { Button as KButton } from '@kiskadee/react-components';
import s from './Button.module.scss';

export function Button() {
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
            <KButton label="Rest" tone="solid" semantic="primary" />
            <KButton label="Hover" tone="solid" semantic="primary" status="hover" />
            <KButton label="Focus" tone="solid" semantic="primary" status="focus" />
            <KButton label="Pressed" tone="solid" semantic="primary" status="pressed" />
            <KButton label="Selected" tone="solid" semantic="primary" controlState={true} />
            <KButton label="Disabled" tone="solid" semantic="primary" status="disabled" />
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Primary (Soft)</h3>
          <div className={s['example-states']}>
            <KButton label="Rest" tone="soft" semantic="primary" />
            <KButton label="Hover" tone="soft" semantic="primary" status="hover" />
            <KButton label="Focus" tone="soft" semantic="primary" status="focus" />
            <KButton label="Pressed" tone="soft" semantic="primary" status="pressed" />
            <KButton label="Selected" tone="soft" semantic="primary" controlState={true} />
            <KButton label="Disabled" tone="soft" semantic="primary" status="disabled" />
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Neutral (Soft)</h3>
          <div className={s['example-states']}>
            <KButton label="Rest" tone="soft" />
            <KButton label="Hover" tone="soft" status="hover" />
            <KButton label="Focus" tone="soft" status="focus" />
            <KButton label="Pressed" tone="soft" status="pressed" />
            <KButton label="Selected" tone="soft" controlState={true} />
            <KButton label="Disabled" tone="soft" status="disabled" />
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Destructive (Solid)</h3>
          <div className={s['example-states']}>
            <KButton label="Rest" tone="solid" semantic="redLike" />
            <KButton label="Hover" tone="solid" semantic="redLike" status="hover" />
            <KButton label="Focus" tone="solid" semantic="redLike" status="focus" />
            <KButton label="Pressed" tone="solid" semantic="redLike" status="pressed" />
            <KButton label="Selected" tone="solid" semantic="redLike" controlState={true} />
            <KButton label="Disabled" tone="solid" semantic="redLike" status="disabled" />
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Destructive (Soft)</h3>
          <div className={s['example-states']}>
            <KButton label="Rest" tone="soft" semantic="redLike" />
            <KButton label="Hover" tone="soft" semantic="redLike" status="hover" />
            <KButton label="Focus" tone="soft" semantic="redLike" status="focus" />
            <KButton label="Pressed" tone="soft" semantic="redLike" status="pressed" />
            <KButton label="Selected" tone="soft" semantic="redLike" controlState={true} />
            <KButton label="Disabled" tone="soft" semantic="redLike" status="disabled" />
          </div>
        </div>

        <div className={s['interaction-state']}>
          <h3>Size / Scale</h3>
          <div className={s['example-states']}>
            <KButton label="Small 2" scale="s:sm:2" />
            <KButton label="Small" scale="s:sm:1" />
            <KButton label="Medium" scale="s:md:1" />
            <KButton label="Large" scale="s:lg:1" />
            <KButton label="Large 2" scale="s:lg:2" />
            <KButton label="Large 3" scale="s:lg:3" />
          </div>
        </div>
        <div>
          <h3>Selected</h3>
          <KButton label="Rest" controlState={true} />
          <KButton label="Hover" status="hover" controlState={true} />
          <KButton label="Focus" status="focus" controlState={true} />
          <KButton label="Pressed" status="pressed" controlState={true} />
        </div>
        <div>
          <h3>Shadow</h3>
          <KButton label="Rest" shadow={true} />
          <KButton label="Hover" shadow={true} status={'hover'} />
          <KButton label="Focus" shadow={true} status={'focus'} />
          <KButton label="Pressed" shadow={true} status={'pressed'} />
          <KButton label="Disabled" shadow={true} status={'disabled'} />
        </div>
      </div>
    </section>
  );
}

export default Button;
