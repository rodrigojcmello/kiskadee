'use client';

import { Button as KiskadeeButton } from '@kiskadee/react-components';
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
            <KiskadeeButton label="Rest" tone="solid" semantic="primary" />
            <KiskadeeButton label="Hover" tone="solid" semantic="primary" status="hover" />
            <KiskadeeButton label="Focus" tone="solid" semantic="primary" status="focus" />
            <KiskadeeButton label="Pressed" tone="solid" semantic="primary" status="pressed" />
            <KiskadeeButton
              label="Selected"
              tone="solid"
              semantic="primary"
              controlState={true}
            />
            <KiskadeeButton
              label="Disabled"
              tone="solid"
              semantic="primary"
              status="disabled"
            />
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Primary (Soft)</h3>
          <div className={s['example-states']}>
            <KiskadeeButton label="Rest" tone="soft" semantic="primary" />
            <KiskadeeButton label="Hover" tone="soft" semantic="primary" status="hover" />
            <KiskadeeButton label="Focus" tone="soft" semantic="primary" status="focus" />
            <KiskadeeButton label="Pressed" tone="soft" semantic="primary" status="pressed" />
            <KiskadeeButton
              label="Selected"
              tone="soft"
              semantic="primary"
              controlState={true}
            />
            <KiskadeeButton
              label="Disabled"
              tone="soft"
              semantic="primary"
              status="disabled"
            />
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Neutral (Soft)</h3>
          <div className={s['example-states']}>
            <KiskadeeButton label="Rest" tone="soft" />
            <KiskadeeButton label="Hover" tone="soft" status="hover" />
            <KiskadeeButton label="Focus" tone="soft" status="focus" />
            <KiskadeeButton label="Pressed" tone="soft" status="pressed" />
            <KiskadeeButton label="Selected" tone="soft" controlState={true} />
            <KiskadeeButton label="Disabled" tone="soft" status="disabled" />
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Destructive (Solid)</h3>
          <div className={s['example-states']}>
            <KiskadeeButton label="Rest" tone="solid" semantic="redLike" />
            <KiskadeeButton
              label="Hover"
              tone="solid"
              semantic="redLike"
              status="hover"
            />
            <KiskadeeButton
              label="Focus"
              tone="solid"
              semantic="redLike"
              status="focus"
            />
            <KiskadeeButton
              label="Pressed"
              tone="solid"
              semantic="redLike"
              status="pressed"
            />
            <KiskadeeButton
              label="Selected"
              tone="solid"
              semantic="redLike"
              controlState={true}
            />
            <KiskadeeButton
              label="Disabled"
              tone="solid"
              semantic="redLike"
              status="disabled"
            />
          </div>
        </div>
        <div className={s['interaction-state']}>
          <h3>Interaction States - Destructive (Soft)</h3>
          <div className={s['example-states']}>
            <KiskadeeButton label="Rest" tone="soft" semantic="redLike" />
            <KiskadeeButton
              label="Hover"
              tone="soft"
              semantic="redLike"
              status="hover"
            />
            <KiskadeeButton
              label="Focus"
              tone="soft"
              semantic="redLike"
              status="focus"
            />
            <KiskadeeButton
              label="Pressed"
              tone="soft"
              semantic="redLike"
              status="pressed"
            />
            <KiskadeeButton
              label="Selected"
              tone="soft"
              semantic="redLike"
              controlState={true}
            />
            <KiskadeeButton
              label="Disabled"
              tone="soft"
              semantic="redLike"
              status="disabled"
            />
          </div>
        </div>

        <div className={s['interaction-state']}>
          <h3>Size: small</h3>
          <div className={s['example-states']}>
            <KiskadeeButton label="Small 2" scale="s:sm:2" />
            <KiskadeeButton label="Small" scale="s:sm:1" />
            <KiskadeeButton label="Medium" scale="s:md:1" />
            <KiskadeeButton label="Large" scale="s:lg:1" />
            <KiskadeeButton label="Large 2" scale="s:lg:2" />
            <KiskadeeButton label="Large 3" scale="s:lg:3" />
          </div>
        </div>
        <div>
          <h3>Selected</h3>
          <KiskadeeButton label="Rest" controlState={true} />
          <KiskadeeButton label="Hover" status="hover" controlState={true} />
          <KiskadeeButton label="Focus" status="focus" controlState={true} />
          <KiskadeeButton label="Pressed" status="pressed" controlState={true} />
        </div>
        <div>
          <h3>Scale</h3>
          <KiskadeeButton label="Small" scale="s:sm:1" />
          <KiskadeeButton label="Medium" scale="s:md:1" />
          <KiskadeeButton label="Large" scale="s:lg:1" />
        </div>
        <div>
          <h3>Shadow</h3>
          <KiskadeeButton label="Rest" shadow={true} />
          <KiskadeeButton label="Hover" shadow={true} status={"hover"} />
          <KiskadeeButton label="Focus" shadow={true} status={"focus"} />
          <KiskadeeButton label="Pressed" shadow={true} status={"pressed"} />
          <KiskadeeButton label="Disabled" shadow={true} status={"disabled"} />
        </div>
      </div>
    </section>
  );
}

export default Button;
