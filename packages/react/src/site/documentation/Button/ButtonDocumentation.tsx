/* eslint-disable @typescript-eslint/no-empty-function */
import type { FC } from 'react';
import { useContext } from 'react';
import { Button } from '../../../components/Button/Button';
import { KiskadeeContext } from '../../../context';

export const ButtonDocument: FC = () => {
  const [theme] = useContext(KiskadeeContext);
  const { button } = theme.component;

  return (
    <div style={{ padding: '30px', display: 'flex', gap: 32 }}>
      <div>
        <span>Rest</span>
        <Button text="Rest" onClick={(): void => {}} />
      </div>

      <div>
        {button?.container?.hover ? (
          <Button text="Hover" hover onClick={(): void => {}} />
        ) : (
          <span className="material-symbols-outlined">question_mark</span>
        )}
      </div>

      <div>
        {button?.container?.focused ? (
          <Button text="Focused" onClick={(): void => {}} />
        ) : (
          <span className="material-symbols-outlined">question_mark</span>
        )}
      </div>

      <div>
        {button?.container?.pressed ? (
          <Button text="Pressed" onClick={(): void => {}} />
        ) : (
          <span className="material-symbols-outlined">question_mark</span>
        )}
      </div>

      <div>
        {button?.container?.visited ? (
          <Button text="Visited" onClick={(): void => {}} />
        ) : (
          <span className="material-symbols-outlined">question_mark</span>
        )}
      </div>
    </div>
  );
};
